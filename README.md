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

## Email Analytics Dashboard

Track who has unlocked gated articles by entering their email.

### Overview

When a prospect enters their email on a `/p/[slug]` preview page, the system:
1. Stores their email + slug + timestamp in `articleUnlocks` table
2. Returns the full article content

The **Email Analytics Dashboard** at `/dashboard/email-analytics` shows:
- Total unlocks + unique emails (with trend vs. previous period)
- Line chart: unlocks per day (last 30 days)
- Bar charts: top articles + email domain breakdown
- Sortable/searchable paginated table of all unlock events
- CSV & JSON export with optional date range filter

### Dashboard URL

```
/dashboard/email-analytics
```

### Quick Stats Widget

The dashboard home page (`/dashboard`) shows a weekly summary card:
- Emails captured this week
- Top article this week
- Quick link to full analytics

### API Endpoints (convex/preview.ts)

| Function | Type | Description |
|----------|------|-------------|
| `preview.getUnlockStats` | query | Aggregate stats (optionally date-filtered) |
| `preview.getWeeklyStats` | query | Current week summary (for home widget) |
| `preview.listAllUnlocks` | query | Paginated list with search |
| `preview.getUnlocksByArticle` | query | All unlocks for a specific slug |
| `preview.exportUnlocks` | query | Full export data (for CSV/JSON download) |

### Seeding Demo Data

To populate the dashboard with realistic demo data:

```bash
npx convex run seedAnalytics:seedDemoData
```

This creates:
- 5 demo preview articles
- ~80 unlock events spread over the last 30 days
- Diverse email addresses including personal (gmail) + business domains

### Analytics Components

Reusable components in `/components/analytics/`:

| Component | Description |
|-----------|-------------|
| `StatCard` | Big number with trend indicator (up/down %) |
| `LineChart` | Time series SVG chart with hover tooltips |
| `BarChart` | Categorical SVG bar chart with hover tooltips |
| `DataTable` | Sortable, paginated table (client-side) |
| `ExportButton` | CSV/JSON download button with loading state |

All components are dependency-free (no Recharts) — custom SVG charts.

---

*OSCR autonomously manages everything except payment processing.*
