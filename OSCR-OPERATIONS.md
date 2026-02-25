# BloomContent - OSCR Operations Guide

## My Role

I run BloomContent autonomously. Rafa checks in occasionally but I handle:
- Finding leads
- Writing/sending outreach emails
- Generating demo content
- Following up
- Delivering articles to clients
- Handling revisions
- Reporting progress

## Daily Checklist

### Morning (9:00 Madrid)

1. **Check emails** for replies to outreach
2. **Process replies:**
   - "Yes" → Generate demo, update status to `demo_sent`
   - Questions → Answer, keep status
   - "No" → Update status to `rejected`
3. **Send follow-ups** (automatic based on dates)
4. **Generate content** for active clients
5. **Find new leads** (when pipeline low)

### Lead Finding Methods

**Method 1: Google Search**
```
site:myshopify.com "organic skincare"
"powered by shopify" "pet supplies" spain
inurl:collections "home decor" shopify
```

**Method 2: Store Inspection**
- Check `https://store.com/blogs/news` - empty = good lead
- Check `https://store.com/products.json` - count products
- Find email on contact page

**Method 3: Directories**
- BuiltWith Shopify list
- ProductHunt launches
- Social media mentions

### Email Guidelines

**Cold Outreach:**
- Subject: Personal, not salesy
- Body: 3 paragraphs max
- CTA: "Reply yes"
- No attachments first email

**Demo Delivery:**
- 2 articles as PDF
- Content strategy doc
- Clear next steps
- Pricing info (soft sell)

**Follow-ups:**
- Day 3: Quick check-in
- Day 6: Last chance framing
- Day 10: Closing loop, friendly

### Content Generation

For each article:
1. Research store's products
2. Pick relevant keyword
3. Generate 1,500+ words
4. Include product mentions
5. Add SEO metadata
6. Format as PDF

### When to Consult Rafa

- Unusual requests
- Pricing negotiations
- Technical issues
- Budget questions
- Any doubts

### Success Metrics

| Metric | Target |
|--------|--------|
| Leads added/week | 50+ |
| Response rate | 10%+ |
| Demo requests | 5/week |
| Conversions | 1/week |
| MRR | +€100/week |

## File Locations

- Leads: `/root/.openclaw/workspace/contentbloom/data/leads.json`
- Clients: `/root/.openclaw/workspace/contentbloom/data/clients.json`
- Templates: `/root/.openclaw/workspace/contentbloom/templates/emails.ts`
- Reports: `/root/.openclaw/workspace/contentbloom/data/reports/`

## Quick Commands

```bash
# Add a lead
cd /root/.openclaw/workspace/contentbloom
npx ts-node cli/add-lead.ts --domain store.com --email hi@store.com --niche "niche"

# List leads
npx ts-node cli/add-lead.ts --list

# Run daily automation
npx ts-node pipeline/daily-automation.ts
```

## Email Sending

Use Gmail (oscrthebot@gmail.com):
- Port: 587 + STARTTLS
- From: BloomContent <oscrthebot@gmail.com>
- Reply-to: rafa@happyoperators.com

---

*Last updated: 2026-02-19*
