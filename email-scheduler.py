#!/usr/bin/env python3
"""
BloomContent Email Scheduler
Sends cold emails daily respecting per-account warmup phases.
Usage: python3 email-scheduler.py [--dry-run]
"""

import json
import os
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

# Anthropic API Key for AI-powered follow-ups
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

def load_env():
    env = {}
    with open(BASE_DIR / ".env") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v
                # Also check for ANTHROPIC_API_KEY in .env
                if k == "ANTHROPIC_API_KEY":
                    global ANTHROPIC_API_KEY
                    ANTHROPIC_API_KEY = v
    return env

# ── AI Follow-up Generation (Anthropic Sonnet) ───────────────────────────────

def generate_ai_followup(store_name: str, niche: str, follow_up_count: int, lang: str = "en", sender_name: str = "Matt") -> tuple:
    """
    Generate personalized follow-up email using Anthropic Sonnet.
    Returns: (subject, body)
    """
    if not ANTHROPIC_API_KEY:
        log.warning("No ANTHROPIC_API_KEY, using template follow-ups")
        return None, None
    
    follow_up_types = {
        1: "gentle check-in (day 3)",
        2: "last chance (day 6)", 
        3: "closing the loop (day 10)"
    }
    
    follow_up_type = follow_up_types.get(follow_up_count, "follow-up")
    
    prompts = {
        "en": f"""Write a short, personalized follow-up email for a cold outreach about free SEO content.

Context:
- Store: {store_name}
- Niche: {niche}
- Type: {follow_up_type}
- Sender: {sender_name} from BloomContent
- Offering: 2 free SEO articles + content strategy

Requirements:
- Subject line: short, personal, not salesy
- Body: 2-3 short paragraphs max
- Tone: friendly but professional
- CTA: clear and simple
- No generic fluff - make it feel personal

Format exactly as:
SUBJECT: [subject line]

[email body]""",
        "es": f"""Escribe un email de seguimiento corto y personalizado para un outreach sobre contenido SEO gratuito.

Contexto:
- Tienda: {store_name}
- Nicho: {niche}
- Tipo: {follow_up_type}
- Remitente: {sender_name} de BloomContent
- Oferta: 2 artículos SEO gratuitos + estrategia de contenido

Requisitos:
- Asunto: corto, personal, no comercial
- Cuerpo: máximo 2-3 párrafos cortos
- Tono: amigable pero profesional
- CTA: clara y simple
- Sin clichés - que parezca personal

Formato exacto:
ASUNTO: [línea de asunto]

[cuerpo del email]""",
    }
    
    prompt = prompts.get(lang, prompts["en"])
    
    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 500,
                "temperature": 0.7,
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=30
        )
        
        if response.status_code == 200:
            content = response.json()["content"][0]["text"]
            
            # Parse subject and body
            lines = content.strip().split("\n")
            subject = ""
            body_lines = []
            in_body = False
            
            for line in lines:
                if line.startswith("SUBJECT:") or line.startswith("ASUNTO:"):
                    subject = line.split(":", 1)[1].strip()
                elif in_body:
                    body_lines.append(line)
                elif line.strip() == "" and subject:
                    in_body = True
            
            if not in_body:
                # If no blank line found, everything after subject is body
                body_lines = lines[1:]
            
            body = "\n".join(body_lines).strip()
            
            if subject and body:
                log.info(f"AI follow-up generated for {store_name} (type: {follow_up_type})")
                return subject, body
                
    except Exception as e:
        log.error(f"AI follow-up generation failed: {e}")
    
    return None, None

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

# ── Follow-up email templates ─────────────────────────────────────────────────

def build_follow_up_email(lead: dict, sender_name: str, follow_up_count: int) -> tuple[str, str]:
    """Build follow-up email based on follow_up_count (1, 2, or 3).
    
    Tries AI generation first (Sonnet), falls back to templates if unavailable.
    """
    store = lead.get("storeName", lead.get("domain", "your store"))
    niche = lead.get("niche", "your niche")
    lang = lead.get("language", "en")

    # Try AI-generated follow-up first (using Sonnet - tier 2)
    ai_subject, ai_body = generate_ai_followup(store, niche, follow_up_count, lang, sender_name)
    if ai_subject and ai_body:
        log.info(f"Using AI-generated follow-up #{follow_up_count} for {store}")
        return ai_subject, ai_body

    # Fall back to templates if AI fails
    log.info(f"Using template follow-up #{follow_up_count} for {store}")

    # Follow-up #1: Day 3 after initial - gentle check-in
    if follow_up_count == 1:
        if lang == "es":
            subject = f"Seguimiento rápido - ¿viste mi email sobre {store}?"
            body = f"""Hola,

Solo quería asegurarme de que viste mi email anterior sobre el contenido SEO gratuito para {store}.

En resumen: 2 artículos gratis + estrategia de contenido, sin compromiso.

¿Te interesa? Solo responde "sí" y lo tendrás listo en 48 horas.

Un saludo,
{sender_name}"""
        elif lang == "de":
            subject = f"Kurze Nachfrage - haben Sie meine Email zu {store} gesehen?"
            body = f"""Hallo,

Ich wollte nur sicherstellen, dass Sie meine vorherige Email zum kostenlosen SEO-Content für {store} gesehen haben.

Kurz zusammengefasst: 2 kostenlose Artikel + Content-Strategie, unverbindlich.

Interessiert? Einfach mit "Ja" antworten - in 48 Stunden haben Sie den Content.

Beste Grüße,
{sender_name}"""
        elif lang == "fr":
            subject = f"Suivi rapide - avez-vous vu mon email concernant {store}?"
            body = f"""Bonjour,

Je voulais juste m'assurer que vous avez vu mon email précédent sur le contenu SEO gratuit pour {store}.

En résumé : 2 articles gratuits + stratégie de contenu, sans engagement.

Intéressé(e) ? Répondez simplement "oui" et vous l'aurez dans 48 heures.

Cordialement,
{sender_name}"""
        else:  # en
            subject = f"Quick follow-up - did you see my last email about {store}?"
            body = f"""Hey,

Just wanted to make sure you saw my previous email about free SEO content for {store}.

Quick recap: 2 free articles + content strategy, no strings attached.

Interested? Just reply "yes" and I'll have it ready in 48 hours.

Best,
{sender_name}"""

    # Follow-up #2: Day 6 after initial - last chance
    elif follow_up_count == 2:
        if lang == "es":
            subject = f"Última oportunidad - estrategia de contenido para {store}"
            body = f"""Hola,

Seré breve - estoy cerrando las ofertas de contenido gratuito esta semana.

Si te gustaría recibir 2 artículos SEO gratuitos para {store}, avísame antes del viernes.

Después, estaré encantado de ayudarte si alguna vez necesitas contenido en el futuro.

Un saludo,
{sender_name}"""
        elif lang == "de":
            subject = f"Letzte Chance - Content-Strategie für {store}"
            body = f"""Hallo,

Ich halte es kurz - ich schließe meine kostenlosen Content-Angebote diese Woche.

Wenn Sie 2 kostenlose SEO-Artikel für {store} möchten, lassen Sie es mich vor Freitag wissen.

Danach helfe ich Ihnen gerne, wenn Sie jemals Content-Unterstützung brauchen.

Beste Grüße,
{sender_name}"""
        elif lang == "fr":
            subject = f"Dernière chance - stratégie de contenu pour {store}"
            body = f"""Bonjour,

Je serai bref - je termine mes offres de contenu gratuit cette semaine.

Si vous souhaitez 2 articles SEO gratuits pour {store}, faites-le moi savoir avant vendredi.

Après cela, je serai heureux de vous aider si vous avez besoin de contenu à l'avenir.

Cordialement,
{sender_name}"""
        else:  # en
            subject = f"Last chance - {store} content strategy"
            body = f"""Hey,

I'll keep this short - I'm wrapping up my free content offers this week.

If you'd like 2 free SEO articles for {store}, let me know by Friday.

After that, happy to help if you ever need content in the future.

Best,
{sender_name}"""

    # Follow-up #3: Day 10 after initial - closing the loop
    elif follow_up_count == 3:
        if lang == "es":
            subject = f"Cerrando el bucle - {store}"
            body = f"""Hola,

No he recibido respuesta, así que asumo que el momento no es el adecuado.

No hay problema - te quitaré de mi lista de contactos.

Si alguna vez necesitas ayuda con contenido en el futuro, no dudes en contactarme.

¡Todo lo mejor con {store}!

Un saludo,
{sender_name}"""
        elif lang == "de":
            subject = f"Abschluss - {store}"
            body = f"""Hallo,

Da ich keine Rückmeldung erhalten habe, nehme ich an, dass der Zeitpunkt nicht günstig ist.

Kein Problem - ich werde Sie von meiner Kontaktliste entfernen.

Wenn Sie jemals in Zukunft Hilfe bei Content benötigen, zögern Sie nicht, mich zu kontaktieren.

Alles Gute für {store}!

Beste Grüße,
{sender_name}"""
        elif lang == "fr":
            subject = f"Clôture - {store}"
            body = f"""Bonjour,

Je n'ai pas reçu de réponse, donc je suppose que le timing n'est pas bon.

Pas de souci - je vous retirerai de ma liste de contacts.

Si vous avez besoin d'aide avec du contenu à l'avenir, n'hésitez pas à me contacter.

Tout le meilleur pour {store}!

Cordialement,
{sender_name}"""
        else:  # en
            subject = f"Closing the loop - {store}"
            body = f"""Hey,

I haven't heard back, so I'll assume the timing isn't right.

No worries at all - I'll remove you from my outreach list.

If you ever need content help down the road, feel free to reach out.

All the best with {store}!

{sender_name}"""

    else:
        raise ValueError(f"Invalid follow_up_count: {follow_up_count}")

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

def send_follow_up(account: dict, lead: dict, follow_up_count: int):
    """Send a follow-up email to a lead."""
    subject, body = build_follow_up_email(lead, account["name"], follow_up_count)
    to_email = lead["email"]

    if DRY_RUN:
        log.info(f"[DRY-RUN] WOULD SEND FOLLOW-UP #{follow_up_count}: {account['email']} → {to_email} | {subject}")
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
        log.info(f"SENT FOLLOW-UP #{follow_up_count}: {account['email']} → {to_email} | {subject}")
        return True
    except Exception as e:
        log.error(f"FAILED FOLLOW-UP #{follow_up_count}: {account['email']} → {to_email} | {e}")
        return False

# ── Follow-up Logic ───────────────────────────────────────────────────────────

def process_follow_ups(env: dict, accounts: list):
    """Process follow-up emails for contacted leads."""
    convex_url = env["NEXT_PUBLIC_CONVEX_URL"]
    convex_key = env["CONVEX_DEPLOY_KEY"]

    today = date.today().isoformat()
    log.info(f"Checking for follow-ups on {today}")

    # Get leads needing follow-up today
    leads_for_follow_up = convex_query(
        convex_url, convex_key,
        "leads:getLeadsForFollowUp",
        {"targetDate": today}
    )

    if not leads_for_follow_up:
        log.info("No leads need follow-up today")
        return

    log.info(f"Found {len(leads_for_follow_up)} leads needing follow-up")

    # Distribute leads across accounts round-robin
    account_idx = 0
    for lead in leads_for_follow_up:
        account = accounts[account_idx % len(accounts)]
        account_idx += 1

        current_follow_up_count = lead.get("followUpCount", 0)
        next_follow_up_count = current_follow_up_count + 1

        # Determine new status based on follow-up count
        status_map = {1: "follow_up_1", 2: "follow_up_2", 3: "follow_up_3"}
        new_status = status_map.get(next_follow_up_count, "follow_up_3")

        # Build and send follow-up email
        subject, _ = build_follow_up_email(lead, account["name"], next_follow_up_count)
        ok = send_follow_up(account, lead, next_follow_up_count)

        if ok:
            now_iso = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

            # Update lead status with new follow-up info
            convex_mutation(convex_url, convex_key, "leads:updateLeadEmailStatus", {
                "id": lead["_id"],
                "status": new_status,
                "lastEmailDate": now_iso,
                "followUpCount": next_follow_up_count,
            })

            # Log to outreachLog
            convex_mutation(convex_url, convex_key, "outreachLog:add", {
                "leadId": lead["_id"],
                "type": f"follow_up_{next_follow_up_count}",
                "email": lead["email"],
                "subject": subject,
                "status": "sent",
                "sentAt": now_iso,
            })

            log.info(f"Follow-up #{next_follow_up_count} sent to {lead['email']} via {account['email']}")
        else:
            log.error(f"Failed to send follow-up #{next_follow_up_count} to {lead['email']}")

        # Sleep between follow-up emails
        if not DRY_RUN and account_idx < len(leads_for_follow_up):
            sleep_min = random.randint(10, 20)
            log.info(f"Sleeping {sleep_min} minutes before next follow-up...")
            time.sleep(sleep_min * 60)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    env = load_env()
    convex_url = env["NEXT_PUBLIC_CONVEX_URL"]
    convex_key = env["CONVEX_DEPLOY_KEY"]
    accounts = [a for a in load_accounts() if a.get("active")]

    if not accounts:
        log.error("No active accounts found in accounts.json")
        return

    log.info(f"=== Email Scheduler {'[DRY-RUN] ' if DRY_RUN else ''}| {date.today()} ===")

    # ── PART 1: Send cold emails to new leads ─────────────────────────────────
    log.info("--- Processing cold emails ---")

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
            subject, _ = build_email(lead, account["name"])
            ok = send_email(account, lead)
            if ok:
                used_lead_ids.add(lead["_id"])
                now_iso = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
                # Update lead status + lastContact + lastEmailDate + followUpCount
                convex_mutation(convex_url, convex_key, "leads:updateLeadEmailStatus", {
                    "id": lead["_id"],
                    "status": "contacted",
                    "lastEmailDate": now_iso,
                    "followUpCount": 0,  # Initial contact
                })
                # Also update lastContact for backwards compatibility
                convex_mutation(convex_url, convex_key, "leads:updateStatus", {
                    "id": lead["_id"],
                    "status": "contacted",
                    "lastContact": now_iso,
                })
                # Log to outreachLog so the dashboard shows real data
                convex_mutation(convex_url, convex_key, "outreachLog:add", {
                    "leadId": lead["_id"],
                    "type": "cold",
                    "email": lead["email"],
                    "subject": subject,
                    "status": "sent",
                    "sentAt": now_iso,
                })
            # Sleep between emails (skip on last one and in dry-run)
            if not DRY_RUN and i < len(leads) - 1:
                sleep_min = random.randint(15, 25)
                log.info(f"Sleeping {sleep_min} minutes before next email...")
                time.sleep(sleep_min * 60)

    # ── PART 2: Send follow-up emails ─────────────────────────────────────────
    log.info("--- Processing follow-ups ---")
    process_follow_ups(env, accounts)

    log.info("=== Done ===")

def send_onboarding_email(lead: dict, plan: str = "starter"):
    """Called when a lead replies 'yes' to cold outreach.
    Creates an onboarding magic link via Convex and sends the welcome email.
    """
    env = load_env()
    convex_url = env["NEXT_PUBLIC_CONVEX_URL"]
    convex_key = env["CONVEX_DEPLOY_KEY"]

    # 1. Create onboarding token via Convex
    result = convex_mutation(convex_url, convex_key, "auth:createOnboardingLink", {
        "email": lead["email"],
        "plan": plan,
    })

    if not result or "token" not in result:
        log.error(f"Failed to create onboarding token for {lead['email']}")
        return False

    token = result["token"]
    onboard_url = f"https://bloomcontent.site/onboard?token={token}&plan={plan}"

    # 2. Send email from hey@bloomcontent.site
    hey_user = env.get("SMTP_HEY_USER", "hey@bloomcontent.site")
    hey_pass = env.get("SMTP_HEY_PASS", "")

    if not hey_pass:
        log.warning("SMTP_HEY_PASS not set - cannot send onboarding email")
        log.info(f"Onboarding URL for {lead['email']}: {onboard_url}")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = f"BloomContent <{hey_user}>"
    msg["To"] = lead["email"]
    msg["Subject"] = "Welcome to BloomContent - complete your setup"

    store_name = lead.get("storeName", "your store")
    text = (
        f"Great news - your {plan} plan is ready for {store_name}.\n\n"
        f"Complete your setup here:\n{onboard_url}\n\n"
        "Looking forward to working with you."
    )
    html = f"""<div style="font-family:Inter,sans-serif;max-width:520px;margin:40px auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
<p>Great news &mdash; your <strong>{plan}</strong> plan is ready for {store_name}.</p>
<p>Click below to complete your setup and start receiving SEO content.</p>
<p style="margin:24px 0"><a href="{onboard_url}" style="display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Complete setup</a></p>
<p style="font-size:13px;color:#6b7280">This link is valid for 7 days.</p>
</div>"""

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP("smtp.zoho.eu", 587) as srv:
            srv.starttls()
            srv.login(hey_user, hey_pass)
            srv.sendmail(hey_user, [lead["email"]], msg.as_string())
        log.info(f"Onboarding email sent to {lead['email']}")
    except Exception as e:
        log.error(f"Failed to send onboarding email to {lead['email']}: {e}")
        return False

    # 3. Update lead status
    convex_mutation(convex_url, convex_key, "leads:updateStatus", {
        "id": lead["_id"],
        "status": "converted",
        "lastContact": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    })

    return True


if __name__ == "__main__":
    main()
