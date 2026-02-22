#!/usr/bin/env python3
"""
ContentBloom Lead Scraper
Maintains a 14-day buffer of leads. Scrapes more when running low.
Usage: python3 lead-scraper.py [--dry-run]
"""

import json
import sys
import logging
import requests
import re
import time
import random
from datetime import date
from pathlib import Path
from base64 import b64encode

BASE_DIR = Path(__file__).parent
DRY_RUN = "--dry-run" in sys.argv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(BASE_DIR / "lead-scraper.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────

DATAFORSEO_LOGIN = "rafa@agenciaflama.com"
DATAFORSEO_PASS  = "2c1816698da7be95"

NICHES = [
    "kitchen gadgets",
    "jewelry accessories",
    "home decor",
    "pet supplies",
    "organic skincare beauty",
    "baby products",
    "coffee tea",
    "sustainable fashion",
    "fitness gym equipment",
]

WARMUP = [(7, 5), (14, 15), (21, 25)]

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

def daily_limit(start_date_str: str) -> int:
    start = date.fromisoformat(start_date_str)
    days = (date.today() - start).days + 1
    for threshold, limit in WARMUP:
        if days <= threshold:
            return limit
    return 40

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
        log.info(f"[DRY-RUN] mutation {path} {json.dumps(args)[:120]}")
        return True
    r = requests.post(
        f"{url}/api/mutation",
        headers={"Authorization": f"Convex {key}", "Content-Type": "application/json"},
        json={"path": path, "args": args},
        timeout=15,
    )
    r.raise_for_status()
    return True

# ── Scraping helpers ──────────────────────────────────────────────────────────

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; ContentBloom/1.0)"}

SKIP_EMAIL_DOMAINS = {
    "example.com", "sentry.io", "schema.org", "w3.org", "shopify.com",
    "shopifycdn.com", "shopifyapps.com", "zipify.com", "klaviyo.com",
    "mailchimp.com", "mailgun.com", "sendgrid.net", "amazonaws.com",
}
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico", "@2x")

VALID_TLDS = {
    "com","net","org","io","co","shop","store","site","online","info","biz",
    "us","uk","eu","de","es","fr","it","nl","ca","au","mx","br","jp","in",
    "se","no","dk","fi","pl","pt","be","ch","at","nz","sg","hk","ae","za",
}
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-", re.I)

_STRICT_EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}$"
)

def is_valid_email(email: str) -> bool:
    """Filter out image filenames, tracking emails, etc."""
    if "@" not in email:
        return False
    # Must match strict email format (no trailing garbage)
    if not _STRICT_EMAIL_RE.match(email):
        return False
    local, domain = email.lower().split("@", 1)
    tld = domain.rsplit(".", 1)[-1]
    # Skip image TLDs / non-real TLDs
    if tld in ("png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "2x"):
        return False
    if tld not in VALID_TLDS:
        return False
    # Skip if local part looks like an image filename or UUID
    if any(ext.lstrip(".") in local for ext in (".png", ".jpg", ".svg", "250x", "153x", "130x", "@2x")):
        return False
    if UUID_RE.search(local):
        return False
    # Skip if a known HTML label word is literally prepended to the local part
    # e.g. "Supportsupport" = "Support" text node stuck to "support@..." email
    # Only block exact self-repetitions to avoid false positives like "supportteam"
    _HTML_PREFIXES = ("support", "email", "contact", "phone", "tel", "fax",
                      "chat", "call", "press", "info", "hello")
    for prefix in _HTML_PREFIXES:
        n = len(prefix)
        if local.startswith(prefix) and local[n:n + n] == prefix:
            # "supportsupport..." — the word is literally repeated
            return False
    # Skip known bad domains
    if any(domain == d or domain.endswith("." + d) for d in SKIP_EMAIL_DOMAINS):
        return False
    return True

def has_blog(domain: str) -> bool:
    """Returns True if store has blog posts (should be skipped)."""
    try:
        r = requests.get(f"https://{domain}/blogs.json", headers=HEADERS, timeout=8)
        if r.status_code == 200:
            data = r.json()
            blogs = data.get("blogs", [])
            return len(blogs) > 0
    except Exception:
        pass
    # Also check /blogs/news.json
    try:
        r = requests.get(f"https://{domain}/blogs/news/articles.json", headers=HEADERS, timeout=8)
        if r.status_code == 200:
            data = r.json()
            articles = data.get("articles", [])
            return len(articles) > 0
    except Exception:
        pass
    return False

def find_email(domain: str) -> str:
    """Scrape contact email from store homepage or contact page.
    Priority: mailto: hrefs (always clean) → regex fallback.
    """
    # mailto: regex — extracts only the email portion, no trailing HTML garbage
    mailto_re = re.compile(r'href=["\']mailto:([^"\'?\s]+)', re.I)
    # Fallback regex — strict: TLD must end at a word boundary
    email_re = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?=\b)", re.I)

    for path in ["/", "/pages/contact", "/contact"]:
        try:
            r = requests.get(f"https://{domain}{path}", headers=HEADERS, timeout=10)
            if r.status_code != 200:
                continue

            # 1st pass: mailto: hrefs (cleanest source)
            for email in mailto_re.findall(r.text):
                email = email.strip().lower()
                if is_valid_email(email):
                    return email

            # 2nd pass: regex fallback (strip trailing junk just in case)
            for email in email_re.findall(r.text):
                email = email.strip().lower()
                # Extra safety: strip any non-email trailing chars
                email = re.sub(r'[^a-z0-9@._+\-].*$', '', email)
                if is_valid_email(email):
                    return email

        except Exception:
            continue
    return ""

def detect_language(domain: str, html: str = "") -> str:
    """Detect language from TLD or html lang attribute."""
    tld = domain.rsplit(".", 1)[-1].lower()
    if tld == "es":
        return "es"
    if tld == "de":
        return "de"
    if tld == "fr":
        return "fr"
    if html:
        m = re.search(r'<html[^>]+lang=["\']([a-zA-Z\-]+)["\']', html)
        if m:
            lang = m.group(1).lower().split("-")[0]
            if lang in ("es", "de", "fr"):
                return lang
    return "en"

def search_dataforseo(niche: str, existing_domains: set) -> list:
    """Search DataForSEO for Shopify stores in a niche."""
    creds = b64encode(f"{DATAFORSEO_LOGIN}:{DATAFORSEO_PASS}".encode()).decode()
    headers = {
        "Authorization": f"Basic {creds}",
        "Content-Type": "application/json",
    }
    payload = [{
        "keyword": f"site:myshopify.com {niche}",
        "location_code": 2840,  # USA
        "language_code": "en",
        "device": "desktop",
        "depth": 10,
    }]
    try:
        r = requests.post(
            "https://api.dataforseo.com/v3/serp/google/organic/live/advanced",
            headers=headers,
            json=payload,
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        results = []
        for task in data.get("tasks", []):
            for item in task.get("result", [{}])[0].get("items", []):
                if item.get("type") != "organic":
                    continue
                url = item.get("url", "")
                # Extract myshopify domain or custom domain
                m = re.search(r"https?://([^/]+)", url)
                if not m:
                    continue
                domain = m.group(1).lower().replace("www.", "")
                if domain and domain not in existing_domains:
                    results.append(domain)
        return results
    except Exception as e:
        log.error(f"DataForSEO error for '{niche}': {e}")
        return []

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    env = load_env()
    convex_url = env["NEXT_PUBLIC_CONVEX_URL"]
    convex_key = env["CONVEX_DEPLOY_KEY"]
    accounts = [a for a in load_accounts() if a.get("active")]

    log.info(f"=== Lead Scraper {'[DRY-RUN] ' if DRY_RUN else ''}| {date.today()} ===")

    # Count current "new" leads
    all_leads = convex_query(convex_url, convex_key, "leads:list", {})
    new_leads = [l for l in all_leads if l.get("status") == "new"]
    existing_domains = {l["domain"].lower() for l in all_leads}
    existing_emails  = {l["email"].lower() for l in all_leads}

    # Calculate total daily sends
    total_daily = sum(daily_limit(a["start_date"]) for a in accounts)
    buffer_needed = total_daily * 14

    log.info(f"New leads: {len(new_leads)} | Daily sends: {total_daily} | Buffer needed: {buffer_needed}")

    if len(new_leads) >= buffer_needed:
        log.info("Buffer OK — no scraping needed.")
        return

    deficit = buffer_needed - len(new_leads)
    log.info(f"Deficit: {deficit} leads. Starting scrape...")

    scraped = 0
    for niche in NICHES:
        if scraped >= deficit:
            break
        log.info(f"Searching niche: {niche}")
        domains = search_dataforseo(niche, existing_domains)
        log.info(f"  Found {len(domains)} candidates")

        for domain in domains:
            if scraped >= deficit:
                break
            if domain in existing_domains:
                continue

            # Check blog
            blog = has_blog(domain)
            score = 75 if blog else 100
            if blog:
                log.info(f"  SKIP (has blog): {domain}")
                continue

            # Find email
            email = find_email(domain)
            if not email:
                log.info(f"  SKIP (no email): {domain}")
                continue

            if email.lower() in existing_emails:
                log.info(f"  SKIP (email exists): {domain}")
                continue

            # Detect language
            lang = detect_language(domain)

            lead = {
                "domain": domain,
                "storeName": domain.split(".")[0].replace("-", " ").title(),
                "niche": niche,
                "email": email,
                "language": lang,
                "score": score,
                "blogPostCount": 0,
                "notes": [f"Auto-scraped {date.today().isoformat()}"],
            }

            if DRY_RUN:
                log.info(f"  [DRY-RUN] WOULD ADD: {domain} | {email} | {lang} | score {score}")
            else:
                try:
                    convex_mutation(convex_url, convex_key, "leads:add", lead)
                    log.info(f"  ADDED: {domain} | {email}")
                    existing_domains.add(domain)
                    existing_emails.add(email.lower())
                except Exception as e:
                    log.error(f"  FAILED to add {domain}: {e}")
                    continue

            scraped += 1
            time.sleep(random.uniform(1, 3))  # polite crawling

    log.info(f"=== Done | Scraped {scraped}/{deficit} needed ===")

if __name__ == "__main__":
    main()
