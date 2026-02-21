# ContentBloom 🌸

AI-powered SEO content automation for e-commerce stores.

## MVP Overview

**What we do:** Generate daily SEO articles for Shopify stores.

**How we sell:**
1. Find stores without blogs (scraper)
2. Send 2 free articles + strategy (demo)
3. Cold email 10/day (outreach)
4. Deliver daily PDFs (fulfillment)
5. Handle revisions (support)

**Pricing:**
- Starter: €49/month (1 article/day)
- Growth: €99/month (3 articles/day)
- Scale: €149/month (5 articles/day)

## How OSCR Runs This

### Daily Routine (Cron: 9:00 Madrid)

1. **Check leads.json** for status updates
2. **Send cold emails** to 10 new leads
3. **Send follow-ups** to leads who didn't respond
4. **Generate articles** for active clients
5. **Email daily report** to Rafa

### Lead Management

```bash
# Add a lead manually
npm run add-lead -- --domain store.com --email hi@store.com --niche "organic skincare"

# List all leads
npm run list-leads

# List by status
npm run list-leads -- --status new
```

### Lead Statuses

| Status | Description | Action |
|--------|-------------|--------|
| `new` | Just added | Send cold email |
| `contacted` | Email sent | Wait 3 days |
| `follow_up_1` | First follow-up sent | Wait 3 days |
| `follow_up_2` | Second follow-up sent | Wait 4 days |
| `follow_up_3` | Final follow-up | Close lead |
| `replied` | Got response | Handle manually |
| `demo_sent` | Demo articles delivered | Wait for feedback |
| `converted` | Became paying client | Move to clients.json |
| `rejected` | Said no | Archive |

### Email Templates

All in `/templates/emails.ts`:
- `coldOutreach()` - First contact
- `demoDelivery()` - Sending free articles
- `followUp(1|2|3)` - Follow-up sequence
- `revisionResponse()` - After feedback
- `conversionResponse()` - Welcome email

## Data Files

```
/data/
  leads.json         # All leads with status
  clients.json       # Paying clients
  outreach-log.jsonl # Email history
  reports/           # Daily reports
```

## Article Generation

OSCR generates articles using Claude:
1. Read client's store (products, niche)
2. Generate keyword-rich content
3. Format as PDF with SEO checklist
4. Email to client

Article types:
- Buying guides
- How-to tutorials
- Product comparisons
- Listicles
- Brand stories

## Revision Flow

1. Client replies with feedback
2. OSCR updates article
3. Resend within 24h
4. Unlimited revisions (within reason)

## Metrics to Track

- **Leads added/day:** Target 20+
- **Emails sent/day:** 10 cold + follow-ups
- **Response rate:** Target 10%+
- **Demo-to-paid:** Target 20%+
- **MRR growth:** €500/month target

## Getting Started

1. Add leads manually or via scraper
2. Run daily automation
3. Handle replies personally (for now)
4. Track in Rafa's daily report

---

*OSCR autonomously manages everything except payment processing.*
