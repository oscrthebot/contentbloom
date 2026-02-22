#!/usr/bin/env python3
"""
ContentBloom Email Scheduler
Sends cold emails daily respecting per-account warmup phases.
Usage: python3 email-scheduler.py [--dry-run]
"""

import json
import smtplib
import time
import random
import sys
import logging
import requests
from datetime import date, datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

BASE_DIR = Path(__file__).parent
DRY_RUN = "--dry-run" in sys.argv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(BASE_DIR / "email-scheduler.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────

def load_env():
    env = {}
    with open(BASE_DIR / ".env") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v
    return env

def load_accounts():
    with open(BASE_DIR / "accounts.json") as f:
        return json.load(f)["accounts"]

# ── Warmup schedule ───────────────────────────────────────────────────────────

WARMUP = [
    (7,  5),   # days 1-7   → 5/day
    (14, 15),  # days 8-14  → 15/day
    (21, 25),  # days 15-21 → 25/day
]

def daily_limit(start_date_str: str) -> int:
    start = date.fromisoformat(start_date_str)
    days = (date.today() - start).days + 1  # day 1 on start date
    for threshold, limit in WARMUP:
        if days <= threshold:
            return limit
    return 40  # day 22+

# ── Convex ────────────────────────────────────────────────────────────────────

def convex_query(url, key, path, args={}):
    r = requests.post(
        f"{url}/api/query",
        headers={"Authorization": f"Convex {key}", "Content-Type": "application/json"},
        json={"path": path, "args": args},
        timeout=15,
    )
    r.raise_for_status()
    return r.json()["value"]

def convex_mutation(url, key, path, args):
    if DRY_RUN:
        log.info(f"[DRY-RUN] mutation {path} args={args}")
        return
    r = requests.post(
        f"{url}/api/mutation",
        headers={"Authorization": f"Convex {key}", "Content-Type": "application/json"},
        json={"path": path, "args": args},
        timeout=15,
    )
    r.raise_for_status()

# ── Email templates ───────────────────────────────────────────────────────────

PREVIEW_URL = "https://bloomcontent.site/p/hapi-mac-transcription"

def build_email(lead: dict, sender_name: str) -> tuple[str, str]:
    store = lead.get("storeName", lead.get("domain", "your store"))
    niche = lead.get("niche", "your niche")
    lang = lead.get("language", "en")

    if lang == "es":
        subject = f"una cosa rápida para {store}"
        body = f"""Hola,

Vi que {store} no tiene blog — estás dejando escapar tráfico orgánico para búsquedas como "consejos de {niche}" y "guía de {niche}".

Escribí un artículo de muestra para que veas cómo podría quedar:
{PREVIEW_URL}

Son 2 minutos. Dime qué te parece.

{sender_name}"""

    elif lang == "de":
        subject = f"kurze Frage zu {store}"
        body = f"""Hallo,

Mir ist aufgefallen, dass {store} keinen Blog hat — damit entgeht Ihnen organischer Traffic für Suchanfragen wie "{niche} Tipps".

Ich habe einen Beispielartikel geschrieben, damit Sie sehen, wie das aussehen könnte:
{PREVIEW_URL}

Dauert 2 Minuten. Lassen Sie mich wissen, was Sie denken.

{sender_name}"""

    elif lang == "fr":
        subject = f"une chose rapide pour {store}"
        body = f"""Bonjour,

J'ai remarqué que {store} n'a pas de blog — vous manquez du trafic organique pour des recherches comme "conseils {niche}".

J'ai rédigé un exemple d'article pour vous montrer à quoi cela pourrait ressembler :
{PREVIEW_URL}

2 minutes à lire. Dites-moi ce que vous en pensez.

{sender_name}"""

    else:  # en default
        subject = f"quick thing for {store}"
        body = f"""Hey,

Noticed {store} doesn't have a blog — you're missing organic traffic for searches like "{niche} tips" and "{niche} guide".

Wrote a sample article to show you what it could look like:
{PREVIEW_URL}

Takes 2 minutes to read. Let me know what you think.

{sender_name}"""

    return subject, body

# ── Send ──────────────────────────────────────────────────────────────────────

def send_email(account: dict, lead: dict):
    subject, body = build_email(lead, account["name"])
    to_email = lead["email"]

    if DRY_RUN:
        log.info(f"[DRY-RUN] WOULD SEND: {account['email']} → {to_email} | {subject}")
        return True

    msg = MIMEMultipart()
    msg["From"] = f"{account['name']} <{account['email']}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.zoho.eu", 587) as server:
            server.starttls()
            server.login(account["email"], account["password"])
            server.sendmail(account["email"], to_email, msg.as_string())
        log.info(f"SENT: {account['email']} → {to_email} | {subject}")
        return True
    except Exception as e:
        log.error(f"FAILED: {account['email']} → {to_email} | {e}")
        return False

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    env = load_env()
    convex_url = env["NEXT_PUBLIC_CONVEX_URL"]
    convex_key = env["CONVEX_DEPLOY_KEY"]
    accounts = [a for a in load_accounts() if a.get("active")]

    log.info(f"=== Email Scheduler {'[DRY-RUN] ' if DRY_RUN else ''}| {date.today()} ===")

    # Fetch all new leads once, split across accounts
    all_new_leads = convex_query(convex_url, convex_key, "leads:list", {"status": "new"})
    all_new_leads.sort(key=lambda x: x.get("score", 0), reverse=True)

    used_lead_ids = set()

    for account in accounts:
        limit = daily_limit(account["start_date"])
        log.info(f"Account: {account['email']} | day limit: {limit}")

        # Get leads not already assigned to another account this run
        leads = [l for l in all_new_leads if l["_id"] not in used_lead_ids][:limit]

        if not leads:
            log.warning(f"No new leads available for {account['email']}")
            continue

        for i, lead in enumerate(leads):
            ok = send_email(account, lead)
            if ok:
                used_lead_ids.add(lead["_id"])
                convex_mutation(convex_url, convex_key, "leads:updateStatus", {
                    "id": lead["_id"],
                    "status": "contacted",
                })
            # Sleep between emails (skip on last one and in dry-run)
            if not DRY_RUN and i < len(leads) - 1:
                sleep_min = random.randint(15, 25)
                log.info(f"Sleeping {sleep_min} minutes before next email...")
                time.sleep(sleep_min * 60)

    log.info("=== Done ===")

if __name__ == "__main__":
    main()
