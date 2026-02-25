# Go-To-Market Pipeline

## Overview
This document outlines the complete GTM strategy for BloomContent, from lead generation to customer conversion.

## Pipeline Stages

### 1. Lead Generation & Scraping

**Objective:** Find e-commerce stores without active blogs

**Methods:**

1. **Shopify Store Scraping**
   - Use Shopify's public APIs to discover stores
   - Check for `/blogs/` endpoint (404 = no blog)
   - Extract contact info from `/pages/contact`
   - Technologies: Built.With API, Shopify Exchange

2. **WooCommerce Store Detection**
   - Scan sites with Wappalyzer/BuiltWith
   - Check WordPress REST API endpoints
   - Look for WooCommerce indicators in HTML
   - Extract contact forms

3. **Lead Scoring (0-100)**
   - Store traffic (SimilarWeb API): 30 points
   - No existing blog: 25 points
   - Valid email found: 20 points
   - High-value niche (fitness, beauty, tech): 15 points
   - Social media presence: 10 points

**Tools:**
- Apify for web scraping
- Hunter.io for email discovery
- DataForSEO for traffic estimation

### 2. Demo Content Generation

**Objective:** Show value immediately with sample content

**Workflow:**

1. **Store Analysis**
   ```typescript
   - Scrape product catalog
   - Identify top 3-5 products
   - Extract product descriptions, images
   - Determine niche/category
   ```

2. **Keyword Research**
   ```typescript
   - Use DataForSEO API
   - Find keywords: "[product type] buying guide"
   - Get search volume, competition, CPC
   - Prioritize low competition, high volume
   ```

3. **AI Content Generation**
   ```typescript
   - GPT-4 prompt with product data + keywords
   - Generate 800-1200 word blog post
   - Include SEO meta description
   - Add internal product links
   ```

4. **Demo Preview**
   - Create shareable link with generated content
   - Show potential traffic impact (DataForSEO estimates)
   - Display revenue projections

**Sample Prompt:**
```
Write an SEO-optimized blog post titled "[keyword]" for an e-commerce store 
selling [products]. Include:
- Engaging introduction
- Product comparison section featuring: [product names]
- Buying guide with 5-7 key factors
- FAQ section
- Conclusion with CTA to shop

Target length: 1000 words. Write for search intent and conversions.
```

### 3. Email Outreach Sequence

**Objective:** Convert leads into paying customers

**Sequence:**

**Email 1: Value Demonstration (Day 0)**
```
Subject: [Name], I wrote a blog post for [Store Name]

Hi [Name],

I noticed [Store Name] doesn't have an active blog yet. I put together 
a sample post that could bring 500+ monthly visitors to your store.

[Preview Link with Demo Content]

This type of content could drive 20-30 extra sales per month. Want to 
see how we can automate this for you?

Best,
BloomContent Team
```

**Email 2: Social Proof (Day 3)**
```
Subject: How [Competitor] gets 10K monthly blog visitors

[Name], quick follow-up.

I analyzed [competitor in their niche] – they're getting 10K+ monthly 
visitors from their blog alone. That's translating to ~$15K in extra 
revenue.

We help stores like yours:
- Generate SEO content automatically
- Publish directly to Shopify
- Track performance & ROI

Want a quick 15-min demo?
```

**Email 3: Urgency (Day 7)**
```
Subject: Last call: Your content demo expires tonight

[Name],

The demo content I created for [Store Name] expires in 24 hours.

After that, I'll be moving to the next store in your niche.

If you want to see how to get 500+ monthly visitors with automated 
content, let me know by EOD.

[Calendar Link]
```

**Email 4: Breakup (Day 14)**
```
Subject: Should I close your file?

[Name],

I haven't heard back, so I'm assuming you're either:
a) Too busy (fair)
b) Not interested in blog content (also fair)
c) My emails are going to spam (please whitelist me!)

Just let me know if I should close your file.

If you want to revisit this later, here's my calendar: [link]
```

### 4. Conversion Funnel

**Landing Page → Demo → Onboarding → Payment**

1. **Landing Page**
   - Hero: "AI-Powered Content for E-commerce"
   - Social proof: "Join 200+ stores automating content"
   - CTA: "Generate Your First Post Free"

2. **Demo Flow**
   - Input store URL
   - AI analyzes products (30 seconds)
   - Shows sample blog post
   - Traffic & revenue projections
   - CTA: "Start 7-Day Trial - $1"

3. **Onboarding Questionnaire**
   ```typescript
   Step 1: Store Details
   - Shopify store URL
   - Niche/category
   - Top products

   Step 2: Content Goals
   - How many posts per month?
   - Target keywords (optional)
   - Preferred tone (professional/casual/technical)

   Step 3: Publishing Preferences
   - Auto-publish or review first?
   - Publishing schedule
   - Featured images (Y/N)
   ```

4. **Stripe Payment**
   - Collect card upfront ($1 trial)
   - Auto-upgrade to paid plan after 7 days
   - Cancel anytime

## Metrics & KPIs

**Lead Generation:**
- Leads scraped per day: 500+
- Lead score avg: 60+
- Email discovery rate: 40%+

**Email Outreach:**
- Open rate: 35%+
- Reply rate: 8%+
- Demo booking rate: 3%+

**Conversion:**
- Demo → Trial: 25%
- Trial → Paid: 60%
- Overall: Lead → Customer: 0.45%

**Customer Metrics:**
- CAC: $150
- LTV: $1,800 (12 months avg)
- Churn: <5% monthly

## Tech Stack

- **Scraping:** Apify, Puppeteer
- **Email Discovery:** Hunter.io, Apollo.io
- **Email Sending:** SendGrid, Mailgun
- **CRM:** Convex (custom tables)
- **Analytics:** PostHog, Mixpanel

## Next Steps

1. Build lead scraper (Apify actor)
2. Set up email infrastructure
3. Create demo content generator
4. Implement tracking pixels
5. Launch MVP outreach campaign (100 leads/day)
