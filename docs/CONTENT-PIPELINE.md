# Content Generation Pipeline - ContentBloom MVP

## Overview

Automated pipeline to create SEO-optimized blog articles for Shopify stores.

**Input:** Store URL + Niche/Topic  
**Output:** Publication-ready Markdown + PDF

---

## Pipeline Stages

### Stage 1: Store Analysis & Keyword Research

**Tools:** DataForSEO API

**Process:**
1. Analyze store URL to identify:
   - Main product categories
   - Target audience
   - Existing blog topics (if any)
   - Competitor stores

2. Keyword research via DataForSEO:
   - Query: `[niche] + [product type] + informational keywords`
   - Filter: Search volume 500-5000, KD < 30
   - Select: 3-5 primary keywords per article

**Example:**
- Store: Organic dog treats shop
- Keywords found: "best organic dog treats", "homemade dog treat recipes", "grain-free dog snacks benefits"

**Output:**
```json
{
  "store_url": "https://example.com",
  "niche": "organic pet food",
  "keywords": [
    {
      "keyword": "best organic dog treats",
      "search_volume": 1200,
      "difficulty": 25,
      "intent": "informational"
    }
  ],
  "suggested_topics": [
    "The Ultimate Guide to Organic Dog Treats in 2026",
    "5 Benefits of Grain-Free Dog Snacks Your Vet Won't Tell You"
  ]
}
```

---

### Stage 2: Content Generation

**Tools:** Claude 3.5 Sonnet / GPT-4

**Process:**
1. Build prompt with:
   - Target keyword
   - Article topic/title
   - Store context (products, brand voice)
   - SEO requirements (headings, meta, internal linking opportunities)

2. Generate article:
   - Length: 1,500-2,500 words
   - Structure: H1 + H2s + H3s (SEO-friendly hierarchy)
   - Include: Stats, actionable tips, product mentions (subtle)
   - Tone: Professional but approachable

3. Add SEO elements:
   - Meta title (55-60 chars)
   - Meta description (150-160 chars)
   - Alt text suggestions for images
   - Internal linking placeholders

**Prompt Template:**
```
Write a comprehensive, SEO-optimized blog article for an e-commerce store.

CONTEXT:
- Store: {store_name} ({store_url})
- Products: {product_categories}
- Target audience: {audience}

ARTICLE REQUIREMENTS:
- Title: {article_title}
- Primary keyword: {primary_keyword} (use naturally 3-5 times)
- Secondary keywords: {secondary_keywords}
- Length: 1,500-2,000 words
- Tone: Professional, helpful, engaging

STRUCTURE:
- H1: Main title (include primary keyword)
- Introduction (150-200 words, hook + what reader will learn)
- 5-7 H2 sections with actionable content
- Conclusion with CTA (subtle mention of store products)

SEO ELEMENTS:
- Meta title: [generate]
- Meta description: [generate]
- Suggest 3-4 image placeholders with alt text

GUIDELINES:
- Write for humans first, SEO second
- Include statistics and expert insights
- Add product mentions naturally (not salesy)
- Use bullet points and short paragraphs for readability
```

**Output Format (Markdown):**
```markdown
---
title: "The Ultimate Guide to Organic Dog Treats in 2026"
meta_title: "Best Organic Dog Treats: Complete Guide (2026)"
meta_description: "Discover the healthiest organic dog treats for your pup. Expert tips, ingredient guides, and vet-approved recommendations."
primary_keyword: "organic dog treats"
author: "ContentBloom"
date: "2026-02-19"
---

# The Ultimate Guide to Organic Dog Treats in 2026

[Article content...]
```

---

### Stage 3: Quality Review & Optimization

**Tools:** Manual review or AI checker (Grammarly API, custom prompts)

**Checklist:**
- ✅ Keyword density (not stuffed, natural)
- ✅ Readability score (Flesch-Kincaid 60+)
- ✅ Grammar and spelling
- ✅ Factual accuracy
- ✅ Brand voice alignment
- ✅ CTA is clear but not pushy

**If automated:** Run through secondary AI prompt for fact-checking and tone adjustment.

---

### Stage 4: Export & Delivery

**Output Formats:**

1. **Markdown (.md)**
   - Keeps formatting, easy to edit
   - Can be directly pasted into Shopify blog editor (with some manual formatting)

2. **PDF**
   - Generated with pandoc or similar
   - Professional presentation for client review
   - Includes cover page with metadata

**Delivery Methods:**

**Option A: Email**
- Attach MD + PDF
- Include publishing instructions

**Option B: Direct Publish (Shopify API)**
- Use Shopify Admin API (see SHOPIFY-PUBLISH-RESEARCH.md)
- Client approves, we publish with one click

**Option C: Google Docs**
- Export to Docs for collaborative editing
- Client can suggest changes before final

---

## Automation Script (Python)

```python
# content_generator.py - Simplified example

import os
from dataforseo_client import DataForSEOClient
from openai import OpenAI

class ContentPipeline:
    def __init__(self):
        self.seo_client = DataForSEOClient(api_key=os.getenv('DATAFORSEO_KEY'))
        self.ai_client = OpenAI(api_key=os.getenv('OPENAI_KEY'))
    
    def research_keywords(self, niche, location='United States'):
        """Stage 1: Keyword research"""
        results = self.seo_client.keyword_research(
            keyword=niche,
            location=location,
            limit=20
        )
        # Filter and sort by volume/difficulty
        keywords = [k for k in results if k['volume'] > 500 and k['difficulty'] < 30]
        return keywords[:5]
    
    def generate_article(self, topic, keywords, store_context):
        """Stage 2: Generate content with AI"""
        prompt = self._build_prompt(topic, keywords, store_context)
        
        response = self.ai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert SEO content writer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000
        )
        
        return response.choices[0].message.content
    
    def export_to_markdown(self, content, metadata, filename):
        """Stage 4: Export with frontmatter"""
        frontmatter = f"""---
title: "{metadata['title']}"
meta_title: "{metadata['meta_title']}"
meta_description: "{metadata['meta_description']}"
date: "{metadata['date']}"
---

"""
        with open(filename, 'w') as f:
            f.write(frontmatter + content)
        
        print(f"✓ Saved to {filename}")
    
    def export_to_pdf(self, markdown_file, pdf_file):
        """Convert MD to PDF using pandoc"""
        os.system(f"pandoc {markdown_file} -o {pdf_file} --pdf-engine=xelatex")
        print(f"✓ PDF created: {pdf_file}")

# Usage:
# pipeline = ContentPipeline()
# keywords = pipeline.research_keywords("organic dog treats")
# article = pipeline.generate_article("Best Organic Dog Treats 2026", keywords, store_context)
# pipeline.export_to_markdown(article, metadata, "article.md")
# pipeline.export_to_pdf("article.md", "article.pdf")
```

---

## Tech Stack

| Component | Tool | Alternative |
|-----------|------|-------------|
| Keyword Research | DataForSEO API | SEMrush API, Ahrefs API |
| Content Generation | Claude 3.5 Sonnet | GPT-4, Gemini Pro |
| PDF Conversion | Pandoc | WeasyPrint, Prince |
| Storage | Convex DB | PostgreSQL, JSON files |
| Orchestration | Python script | n8n, Zapier, Make |

---

## Pricing & Costs

**Per Article:**
- DataForSEO API: ~$0.10 (keyword research)
- Claude/GPT-4: ~$0.50-1.00 (2,000 word article)
- Total cost: ~$1.10 per article

**Client Value:**
- Market rate for SEO article: $150-300
- Our offer: 2 free ($300-600 value)
- Paid plans: $200-500/month (4-8 articles)

**Margins:** 95%+ after acquiring client

---

## Quality Benchmarks

Articles should achieve:
- ✅ Flesch reading ease: 60-70 (easy to read)
- ✅ Keyword density: 1-2% for primary keyword
- ✅ Avg. paragraph length: 3-4 sentences
- ✅ H2 sections: 5-8 per article
- ✅ Internal links: 2-3 opportunities
- ✅ CTA: 1 clear call-to-action

---

## Next Steps

1. Set up DataForSEO API credentials
2. Test keyword research for 3-5 sample niches
3. Generate 2-3 sample articles
4. Get feedback from beta testers
5. Build automated pipeline script
6. Integrate with Shopify API (see separate research doc)
