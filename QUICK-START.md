# ContentBloom - Quick Start Guide

**🚀 Get your first client in 7 days**

---

## Day 1: Setup

### 1. Install Dependencies

```bash
cd /root/.openclaw/workspace/contentbloom/scripts
pip install requests beautifulsoup4
```

### 2. Test Scraper

```bash
# Test with a single store
python shopify_scraper.py --url https://allbirds.com

# Should output:
# ✓ Confirmed Shopify store
# ✓ Blog found: /blogs/news (X posts)
# ✓ Email found: example@store.com
```

### 3. Generate Sample Article

```python
# In Python console or Jupyter notebook
from openai import OpenAI

client = OpenAI()

prompt = """
Write a 1,500-word SEO-optimized blog article:

Title: "10 Benefits of Sustainable Footwear in 2026"
Primary keyword: "sustainable shoes"
Tone: Professional but friendly
Audience: Environmentally-conscious millennials

Include:
- H1 title with keyword
- 5-7 H2 sections
- Practical tips and stats
- Meta description (150 chars)
"""

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7
)

article = response.choices[0].message.content
print(article)

# Save to file
with open('sample_article.md', 'w') as f:
    f.write(article)
```

---

## Day 2-3: Find Leads

### Option A: Manual Discovery

1. **Google Search:**
   ```
   "powered by Shopify" site:us pet products
   "powered by Shopify" site:uk sustainable fashion
   "powered by Shopify" site:de organic food
   ```

2. **BuiltWith:**
   - Go to https://builtwith.com/shopify
   - Filter by country, traffic, keywords
   - Export CSV (paid) or copy 20-30 URLs manually

3. **Competitor Research:**
   - Find similar stores to successful ones
   - Check "Customers also viewed" sections
   - Look at Shopify App Store reviews (stores listed there)

### Option B: Automated Scraping

```bash
# Create file with URLs
cat > shopify_urls.txt << EOF
https://example1.com
https://example2.com
https://example3.com
EOF

# Run scraper
python shopify_scraper.py --file shopify_urls.txt --output leads.json

# Review results
cat leads.json | grep -i "priority.*high" | wc -l
# Shows count of high-priority leads
```

**Goal:** 50 qualified leads (blog exists, <10 posts, email found)

---

## Day 4: Prepare Outreach

### 1. Set Up Email Domain (if using Instantly)

**Don't use your main domain!** Use a separate domain for cold outreach.

Example:
- Main: happyoperators.com
- Outreach: trycontentbloom.com or contentbloom.io

**Why?** Protect main domain reputation from spam complaints.

### 2. Warm Up Email

Before sending 100s of emails, warm up the sender:

- Day 1-3: Send 5-10 emails/day to friends/test accounts
- Day 4-7: Increase to 20-30/day
- Day 8+: Full volume (50-100/day)

Instantly.ai has built-in warmup feature.

### 3. Import Leads to Instantly

CSV format:
```csv
email,firstName,storeName,storeUrl
hello@example.com,Sarah,Pawsome Treats,https://pawsometreat.com
contact@shop2.com,John,EcoWear Co,https://ecowear.com
```

**Tips:**
- Extract first name from email if not available (hello@store.com → "there")
- Personalize `{{storeName}}` and `{{storeUrl}}` in templates
- Add custom variables for extra personalization

---

## Day 5: Launch Outreach

### Start Small: Test Batch

**First 10 emails only!**

Why? Test deliverability and messaging before scaling.

```
Subject: Free SEO-Optimized Content for [StoreName]

Hi [FirstName],

I noticed your Shopify store [StoreName] and loved [specific compliment].

[Rest of template from templates/email_templates.md]
```

### Monitor Results

Track after 48 hours:
- **Open rate:** Should be >30% (if <20%, check spam folder placement)
- **Reply rate:** Should be >3% (if 0%, revise messaging)
- **Unsubscribe:** Should be <1% (if higher, you're too pushy)

**If test batch performs well** → Scale to 50 emails/day

---

## Day 6-7: Handle Responses

### Positive Responses ("I'm interested!")

1. **Quick reply (within 2 hours):**
   ```
   Subject: Re: Free SEO-Optimized Content for [StoreName]

   Awesome! Excited to create content for [StoreName].

   Quick questions to get started:
   1. What products do you sell? (I see [X] on your site)
   2. Who's your ideal customer? (age, interests, etc.)
   3. Any topics you want us to cover? (or we can suggest based on keyword research)

   Reply with your answers and I'll have article topics for you within 48 hours!

   [Your name]
   ```

2. **Do keyword research** (DataForSEO or manual)

3. **Send topic proposals:**
   ```
   Based on keyword research, here are 2 article ideas:

   Article 1: "10 Benefits of [Product Type] Your Customers Don't Know"
   - Target keyword: "[product type] benefits" (1,200 searches/mo)
   - SEO difficulty: Low
   - Estimated time to rank: 2-3 months

   Article 2: "How to Choose the Best [Product] in 2026"
   - Target keyword: "best [product]" (2,500 searches/mo)
   - SEO difficulty: Medium
   - Estimated time to rank: 3-6 months

   Which one sounds better? Or would you prefer different topics?
   ```

4. **Get approval → Generate articles**

### Negative Responses ("Not interested")

**Reply gracefully:**
```
No problem at all! Thanks for letting me know.

If you change your mind in the future, feel free to reach out.

Best of luck with [StoreName]!
```

**Mark as "not interested" in database** → Don't contact again

### No Response

**Follow-up sequence** (automated in Instantly):
- Day 3: Follow-up 1
- Day 5: Follow-up 2
- Day 6+: Stop (don't be annoying!)

---

## Day 8+: Deliver & Publish

### For Each Client:

1. **Generate article** (using pipeline from docs/CONTENT-PIPELINE.md)
2. **Export as:**
   - Markdown file (`.md`)
   - HTML file (`.html`) - for direct Shopify paste
   - PDF (optional - for professional presentation)

3. **Send for approval:**
   ```
   Subject: Your ContentBloom Articles are Ready!

   Hi [FirstName],

   Your 2 articles for [StoreName] are finished! 🎉

   Article 1: [Title]
   - 1,547 words, optimized for "[keyword]"
   - Attached: Markdown + PDF

   Article 2: [Title]
   - 1,823 words, optimized for "[keyword]"
   - Attached: Markdown + PDF

   Please review and let me know if you'd like any changes.

   Once approved, I can:
   - Publish directly to your Shopify blog (fastest)
   - Send you instructions to publish yourself
   - Make any revisions you need

   Looking forward to your feedback!

   [Your name]
   ```

4. **Handle feedback:**
   - Minor edits: Fix within 24 hours
   - Major changes: Discuss scope (trial = 2 articles, not unlimited revisions)

5. **Publish:**
   - **Manual:** Send instructions + HTML file
   - **API:** Use Custom App credentials (see SHOPIFY-PUBLISH-RESEARCH.md)
   - **App:** If Shopify App built, one-click publish

6. **Follow up after publishing:**
   ```
   Subject: Your Articles are Live! 🚀

   Hi [FirstName],

   Both articles are now published on your blog:

   Article 1: https://[store]/blogs/news/[slug-1]
   Article 2: https://[store]/blogs/news/[slug-2]

   You should start seeing organic traffic within 2-4 weeks as Google indexes them.

   **Next Steps:**
   If you loved the articles and want to keep growing your blog, we offer monthly plans:

   - Starter: 4 articles/month - $299
   - Growth: 8 articles/month - $499

   Interested? Reply to this email and I'll send details!

   [Your name]
   ```

---

## Conversion to Paid

### Timing

**Best time to pitch:** Right after they see the quality of free articles

**Don't pitch before** they've received and approved the content!

### Pitch Template

```
Subject: Loved the articles? Let's make it a habit!

Hi [FirstName],

Glad you're happy with the 2 articles! Here's how we can keep the momentum going:

**ContentBloom Monthly Plans:**

📦 Starter - $299/month
- 4 SEO-optimized articles
- Keyword research included
- Ready to publish

📈 Growth - $499/month  
- 8 SEO-optimized articles
- Priority keyword research
- Monthly analytics report

🚀 Enterprise - Custom pricing
- 16+ articles/month
- Dedicated account manager
- Custom content strategy

All plans include:
✅ Professional writing + AI optimization
✅ SEO keyword research (DataForSEO)
✅ Meta titles/descriptions
✅ Ready-to-publish format (or we publish for you!)

Want to keep growing your blog? Reply with which plan works best for you.

[Your name]
```

### Handling Objections

**"Too expensive"**
→ "Compared to hiring a writer ($100-200/article) or doing it yourself (10+ hours), our $299 plan is actually 50% cheaper and saves you time."

**"I'll think about it"**
→ "No pressure! Here's a link to our pricing page. Feel free to start whenever you're ready."

**"Can I try one more month for free?"**
→ "We'd love to, but our free trial was the 2 articles. How about we start with the Starter plan ($299) for one month and see how it goes?"

---

## Metrics to Track

### Outreach Metrics

- **Emails sent:** Target 50-100/day
- **Open rate:** >30%
- **Reply rate:** >5%
- **Interested rate:** >2% (2 per 100 emails)

### Conversion Metrics

- **Trial → Paid:** >20%
- **Average deal size:** $300-400/mo
- **Time to close:** 7-14 days from first email

### Content Metrics

- **Articles delivered:** Track per week
- **Client satisfaction:** Ask for rating (1-10)
- **Revision rate:** <20% should need revisions

### Financial Metrics

- **MRR (Monthly Recurring Revenue):** Growing 20%+ per month
- **CAC (Customer Acquisition Cost):** <$50 (mostly time)
- **LTV (Lifetime Value):** 6 months avg = $1,800
- **LTV/CAC ratio:** >10:1 (healthy)

---

## Common Mistakes to Avoid

❌ **Don't:**
- Send generic emails (always personalize!)
- Follow up more than 2 times
- Promise #1 Google rankings
- Overpromise on delivery time
- Publish without client approval
- Use their brand logo without permission

✅ **Do:**
- Test email deliverability first
- Set realistic expectations
- Deliver on time (or early!)
- Ask for feedback
- Celebrate wins with clients
- Build long-term relationships

---

## Need Help?

**Issues?**
- Scraper not working → Check Python version (3.8+)
- Emails bouncing → Verify domain DNS settings
- Low open rates → Improve subject lines, check spam
- No replies → More personalization needed

**Questions?**
Email: rafa@happyoperators.com

---

**Ready to start?** Begin with Day 1 and work through each day systematically. Don't skip ahead!

**Good luck! 🚀**
