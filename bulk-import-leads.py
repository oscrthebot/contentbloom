#!/usr/bin/env python3
"""
Bulk Import Leads to Convex
Imports all enriched leads from coldpipe project into Convex.

Usage: python3 bulk-import-leads.py [--dry-run]
"""

import json
import sys
import logging
import requests
from datetime import date
from pathlib import Path

BASE_DIR = Path(__file__).parent
DRY_RUN = "--dry-run" in sys.argv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(BASE_DIR / "bulk-import.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────

CONVEX_URL = "https://savory-ocelot-299.eu-west-1.convex.cloud"
CONVEX_KEY = "dev:savory-ocelot-299|eyJ2MiI6IjA0NDhiZjIwMGM0YTRkZTk5MDNmN2I5MTVmYzJkM2M3In0="

COLDPIPE_DIR = Path("/root/.openclaw/workspace/coldpipe")

# ── Convex API ─────────────────────────────────────────────────────────────────

def convex_query(path, args={}):
    r = requests.post(
        f"{CONVEX_URL}/api/query",
        headers={"Authorization": f"Convex {CONVEX_KEY}", "Content-Type": "application/json"},
        json={"path": path, "args": args},
        timeout=15,
    )
    r.raise_for_status()
    return r.json()["value"]

def convex_mutation(path, args):
    if DRY_RUN:
        log.info(f"[DRY-RUN] mutation {path} {json.dumps(args)[:120]}")
        return True
    r = requests.post(
        f"{CONVEX_URL}/api/mutation",
        headers={"Authorization": f"Convex {CONVEX_KEY}", "Content-Type": "application/json"},
        json={"path": path, "args": args},
        timeout=15,
    )
    r.raise_for_status()
    return True

# ── Load Sources ───────────────────────────────────────────────────────────────

def load_json_file(filename):
    """Load JSON file from coldpipe directory."""
    filepath = COLDPIPE_DIR / filename
    if not filepath.exists():
        log.warning(f"File not found: {filepath}")
        return []
    try:
        with open(filepath) as f:
            return json.load(f)
    except Exception as e:
        log.error(f"Error loading {filepath}: {e}")
        return []

def extract_leads_from_sources():
    """Extract all unique leads with emails from all sources."""
    sources = [
        ("ready_leads.json", "ready"),
        ("enriched_all.json", "enriched"),
        ("enriched_leads.json", "enriched"),
    ]
    
    all_leads = {}
    
    for filename, source_type in sources:
        data = load_json_file(filename)
        log.info(f"Loaded {len(data)} records from {filename}")
        
        for lead in data:
            # Get emails (could be 'emails' list or 'email' string)
            emails = lead.get("emails", [])
            if not emails:
                email = lead.get("email")
                if email:
                    emails = [email]
            
            if not emails:
                continue
            
            primary_email = emails[0].lower().strip()
            
            # Get website/domain
            website = lead.get("website", "")
            domain = lead.get("domain", "")
            if not domain and website:
                # Extract domain from website URL
                domain = website.replace("https://", "").replace("http://", "").split("/")[0]
            
            if not domain:
                continue
            
            # Use email as unique key
            if primary_email in all_leads:
                continue
            
            # Determine niche
            niche = lead.get("niche", "")
            if not niche:
                category = lead.get("category", lead.get("categoryName", ""))
                niche_map = {
                    "skin care": "organic skincare beauty",
                    "beauty": "organic skincare beauty",
                    "cosmetics": "organic skincare beauty",
                    "pet": "pet supplies",
                    "home": "home decor",
                    "fashion": "sustainable fashion",
                    "fitness": "fitness gym equipment",
                    "coffee": "coffee tea",
                    "baby": "baby products",
                    "jewelry": "jewelry accessories",
                    "kitchen": "kitchen gadgets",
                }
                niche = "general"
                for key, val in niche_map.items():
                    if key in category.lower():
                        niche = val
                        break
            
            # Determine language
            lang = lead.get("language", "en")
            if not lang or lang not in ("en", "es", "de", "fr"):
                # Detect from domain TLD
                tld = domain.rsplit(".", 1)[-1].lower()
                lang_map = {"es": "es", "de": "de", "fr": "fr"}
                lang = lang_map.get(tld, "en")
            
            # Calculate score
            score = 100
            if lead.get("has_blog"):
                article_count = lead.get("article_count", 0)
                if article_count == 0:
                    score = 75  # Has blog but no articles
                elif article_count <= 5:
                    score = 60
                else:
                    score = 40
            
            # Build lead object
            clean_lead = {
                "domain": domain.lower().replace("www.", ""),
                "storeName": lead.get("title", domain.split(".")[0].replace("-", " ").title()),
                "niche": niche,
                "email": primary_email,
                "language": lang,
                "score": score,
                "productCount": lead.get("product_count") or lead.get("productCount"),
                "blogPostCount": lead.get("article_count") or lead.get("blogPostCount", 0),
                "notes": [f"Imported from {source_type} on {date.today().isoformat()}"],
            }
            
            all_leads[primary_email] = clean_lead
    
    return list(all_leads.values())

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    log.info(f"=== Bulk Import to Convex {'[DRY-RUN] ' if DRY_RUN else ''}| {date.today()} ===")
    
    # Get existing leads from Convex to avoid duplicates
    log.info("Fetching existing leads from Convex...")
    existing_leads = convex_query("leads:list", {})
    existing_emails = {l["email"].lower() for l in existing_leads}
    existing_domains = {l["domain"].lower() for l in existing_leads}
    log.info(f"Found {len(existing_leads)} existing leads in Convex")
    
    # Extract leads from all sources
    log.info("Extracting leads from coldpipe sources...")
    new_leads = extract_leads_from_sources()
    log.info(f"Found {len(new_leads)} unique leads with emails in coldpipe files")
    
    # Filter out duplicates
    filtered_leads = []
    for lead in new_leads:
        email = lead["email"].lower()
        domain = lead["domain"].lower()
        
        if email in existing_emails:
            log.info(f"SKIP (email exists): {domain} | {email}")
            continue
        
        if domain in existing_domains:
            log.info(f"SKIP (domain exists): {domain} | {email}")
            continue
        
        filtered_leads.append(lead)
    
    log.info(f"After deduplication: {len(filtered_leads)} leads to import")
    
    if not filtered_leads:
        log.info("No new leads to import.")
        return
    
    # Import leads
    imported = 0
    failed = 0
    
    for lead in filtered_leads:
        try:
            convex_mutation("leads:add", lead)
            log.info(f"IMPORTED: {lead['domain']} | {lead['email']}")
            imported += 1
        except Exception as e:
            log.error(f"FAILED: {lead['domain']} | {e}")
            failed += 1
    
    log.info(f"=== Done | Imported {imported} leads, {failed} failed ===")
    
    # Show new stats
    try:
        stats = convex_query("leads:stats", {})
        log.info(f"Convex stats after import: {stats}")
    except Exception as e:
        log.error(f"Could not fetch stats: {e}")

if __name__ == "__main__":
    main()
