# LEADS UNIFIED REPORT
*Generated: 2026-02-27 11:30 UTC*

## Summary

| Metric | Count |
|--------|-------|
| **Total Leads (deduplicated)** | **124** |
| Priority 1 — Hot (email + Shopify + niche) | 38 |
| Priority 2 — Warm (domain + some data, no email) | 81 |
| Priority 3 — Cold (minimal context) | 5 |
| With email | 65 |
| Shopify stores | 119 |

## Leads by Source

| Source | Count |
|--------|-------|
| coldpipe/enriched_leads | 53 |
| contentbloom/leads-backup | 45 |
| coldpipe/shopify_candidates | 19 |
| coldpipe/final_candidates | 5 |
| coldpipe/enriched_all | 2 |

## Breakdown by Priority

### 🔥 Priority 1 — Hot (38 leads)
Email + Shopify + defined niche. Ready for immediate outreach.

### 🟡 Priority 2 — Warm (81 leads)
Domain + some data but no email. Need email enrichment (Hunter.io, Apollo).

### 🧊 Priority 3 — Cold (5 leads)
Minimal context. Low priority for now.

---

## Top 20 High-Priority Leads

| # | Company | Domain | Email | Niche | Shopify | Source |
|---|---------|--------|-------|-------|---------|--------|
| 1 | MadPenguin Skincare | madpenguinskincare.com | madpenguinskincare@gmail.com | Skin care clinic | ✅ | cp/enriched_leads |
| 2 | Heyday Skincare Silver Lake | heydayskincare.com | hello@heydayskincare.com | Facial spa | ✅ | cp/enriched_leads |
| 3 | The Things We Do | thethingswedo.co | info@thethingswedo.co | Medical spa | ✅ | cp/enriched_leads |
| 4 | Aniise Natural Skin Care and C | aniise.com | ecom-swiper@11.css | Cosmetics store | ✅ | cp/enriched_leads |
| 5 | PalaceBeautyMetro | mpalacebeauty.com | palacebeautymetro@gmail.com | Cosmetics store | ✅ | cp/enriched_leads |
| 6 | AAPE STORE LOS ANGELES | aapeus.com | aapecs_us@bape.com | Clothing store | ✅ | cp/enriched_leads |
| 7 | SM Korea Beauty | smkoreabeauty.com | smkoreabeauty@gmail.com | Cosmetics store | ✅ | cp/enriched_leads |
| 8 | ARITAUM, AMORE HANNAM 아리따움 엘에이 | us.aritaum.com | aritaum@apus.amorepacific.com | Cosmetics store | ✅ | cp/enriched_leads |
| 9 | Franz Skincare USA | franzskincareusa.com | hello@franzskincareusa.com | Cosmetics store | ✅ | cp/enriched_leads |
| 10 | Glow Recipe | Clinically Effec | glowrecipe.com | order@glowrecipe.com | organic skincare beauty | ✅ | cb/leads-backup |
| 11 | Natural, Clean Skincare | Farm | farmacybeauty.com | influencer@farmacybeauty.comPR | organic skincare beauty | ✅ | cb/leads-backup |
| 12 | Peach & Lily | Korean Skin Car | peachandlily.com | hello@peachandlily.com | organic skincare beauty | ✅ | cb/leads-backup |
| 13 | Dog Harnesses, Collars, Leashe | wildone.com | help@wildone.com | pet supplies | ✅ | cb/leads-backup |
| 14 | Natural Bully Sticks, Dog Bone | pawstruck.com | selfies@pawstruck.com | pet supplies | ✅ | cb/leads-backup |
| 15 | Luxury Bedding, Sheets & Comfo | brooklinen.com | hello@brooklinen.com | home decor | ✅ | cb/leads-backup |
| 16 | Parachute – Home happens here. | parachutehome.com | concierge@parachutehome.com | home decor | ✅ | cb/leads-backup |
| 17 | The Citizenry is a globally in | citizenry.com | assistant@the-citizenry.com | home decor | ✅ | cb/leads-backup |
| 18 | REP Fitness | Home Gym Equipme | repfitness.com | info@repfitness.comDo | fitness gym equipment | ✅ | cb/leads-backup |
| 19 | Online Gym Equipment Store | H | bellsofsteel.com | support@bellsofsteel.comFor | fitness gym equipment | ✅ | cb/leads-backup |
| 20 | American Barbell - Gym Equipme | americanbarbell.com | Supportsupport@americanbarbell.com | fitness gym equipment | ✅ | cb/leads-backup |

---

## Recommended Next Steps

### Immediate (this week)
1. **Launch cold email campaign** for all 38 Priority 1 leads (email + Shopify)
   - Use existing email sequences in contentbloom
   - Personalize with niche and blog opportunity angle
   - Tools ready: contentbloom email scheduler

2. **Email enrichment** for top Priority 2 leads
   - ~81 leads need emails
   - Recommended tools: Hunter.io, Apollo.io, or Skrapp.io
   - Focus on: skincare Shopify stores (highest conversion potential)

### This Month
3. **Set up tracking** in Convex
   - Mark contacted leads via `outreachStatus` field
   - Track replies and conversions

4. **Expand scraping** — most leads are skincare/LA-only
   - Run Apify actors for: fitness, supplements, beauty, pet care
   - Target EU markets (leads-backup shows EU opportunity)

5. **Score refinement** — add blog_count / product_count signals
   - Leads with 0 blog posts but active Shopify = hottest targets
   - Already in notes field, build filter on top

### Data Quality Notes
- Leads from `contentbloom/leads-backup` are highest quality (scored, with niche)
- `coldpipe/ready_leads` (10 leads) already verified as Shopify + email — START HERE
- 5 leads in Priority 3 have minimal data and may not be worth pursuing without enrichment

---

*All 124 leads are now live in Convex (bloomcontent project) under the `leads` table.*
*Query with: `api.leads.listLeads` or `api.leads.getLeadStats`*
