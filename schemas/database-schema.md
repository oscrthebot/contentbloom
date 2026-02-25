# BloomContent Database Schemas

## Overview

Data structure for Convex DB (or can be adapted to PostgreSQL/MongoDB)

---

## Schema Definitions

### 1. `leads` - Prospective Shopify Stores

Stores discovered via scraping that we want to reach out to.

```typescript
// Convex schema
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const leads = defineTable({
  // Store identification
  url: v.string(),                    // e.g., "https://example.myshopify.com"
  shopifyDomain: v.string(),          // e.g., "example.myshopify.com"
  storeName: v.optional(v.string()),  // Extracted from homepage
  
  // Blog analysis
  hasBlog: v.boolean(),
  blogUrl: v.optional(v.string()),    // e.g., "https://example.com/blogs/news"
  blogPath: v.optional(v.string()),   // e.g., "/blogs/news"
  postCount: v.number(),              // Number of existing blog posts (0 if no blog)
  
  // Contact information
  email: v.optional(v.string()),      // Contact email if found
  ownerName: v.optional(v.string()),  // If extractable
  
  // Lead scoring
  priority: v.string(),               // "high" | "medium" | "low"
  score: v.optional(v.number()),      // 0-100 scoring (low posts = high score)
  
  // Outreach status
  status: v.string(),                 // "new" | "contacted" | "replied" | "converted" | "rejected" | "unqualified"
  outreachStage: v.optional(v.string()), // "initial" | "followup1" | "followup2" | "closed"
  
  // Metadata
  scrapedAt: v.string(),              // ISO timestamp
  lastContactedAt: v.optional(v.string()),
  notes: v.optional(v.string()),      // Manual notes
  
  // Location/niche
  country: v.optional(v.string()),    // "US" | "UK" | "DE" etc.
  niche: v.optional(v.string()),      // "pet products" | "fashion" | "home decor"
  tags: v.optional(v.array(v.string())), // ["organic", "sustainable", "luxury"]
})
  .index("by_status", ["status"])
  .index("by_priority", ["priority"])
  .index("by_hasBlog", ["hasBlog"])
  .searchIndex("search_domain", {
    searchField: "shopifyDomain",
  });
```

**Example Record:**
```json
{
  "_id": "lead_abc123",
  "url": "https://pawsometreat.com",
  "shopifyDomain": "pawsometreat.myshopify.com",
  "storeName": "Pawsome Treats Co.",
  "hasBlog": true,
  "blogUrl": "https://pawsometreat.com/blogs/news",
  "blogPath": "/blogs/news",
  "postCount": 3,
  "email": "hello@pawsometreat.com",
  "ownerName": null,
  "priority": "high",
  "score": 85,
  "status": "new",
  "outreachStage": null,
  "scrapedAt": "2026-02-19T10:00:00Z",
  "lastContactedAt": null,
  "notes": "Low post count, active Instagram",
  "country": "US",
  "niche": "pet products",
  "tags": ["organic", "dog treats"]
}
```

---

### 2. `clients` - Converted Customers

Stores that signed up for BloomContent service.

```typescript
const clients = defineTable({
  // Basic info
  email: v.string(),
  shopifyDomain: v.string(),          // e.g., "pawsometreat.myshopify.com"
  storeName: v.string(),
  contactName: v.optional(v.string()),
  
  // Plan & billing
  plan: v.string(),                   // "free_trial" | "starter" | "growth" | "enterprise"
  planDetails: v.object({
    articlesPerMonth: v.number(),     // e.g., 4
    priceUsd: v.number(),             // e.g., 299
  }),
  
  // Shopify integration
  shopifyBlogId: v.optional(v.string()), // Blog ID where we publish (e.g., "241253187")
  shopifyAccessToken: v.optional(v.string()), // Encrypted! Access token for API
  shopifyAppInstalled: v.boolean(),   // true if using our Public App, false if Custom App
  integrationMethod: v.string(),      // "public_app" | "custom_app" | "manual"
  
  // Content preferences
  targetAudience: v.optional(v.string()), // "millennial dog owners"
  brandVoice: v.optional(v.string()),  // "friendly and informative"
  topicsToAvoid: v.optional(v.array(v.string())), // ["politics", "religion"]
  productCategories: v.optional(v.array(v.string())), // ["dog treats", "dog toys"]
  
  // Status & dates
  status: v.string(),                 // "trial" | "active" | "paused" | "cancelled" | "churned"
  startDate: v.string(),              // ISO timestamp
  trialEndsAt: v.optional(v.string()),
  cancelledAt: v.optional(v.string()),
  
  // Lifecycle
  leadId: v.optional(v.id("leads")),  // Reference to original lead
  referralSource: v.optional(v.string()), // "email_outreach" | "app_store" | "referral"
  
  // Stats
  totalArticlesPublished: v.number(),
  lastArticlePublishedAt: v.optional(v.string()),
  
  // Metadata
  createdAt: v.string(),
  updatedAt: v.string(),
  notes: v.optional(v.string()),
})
  .index("by_status", ["status"])
  .index("by_email", ["email"])
  .index("by_shopifyDomain", ["shopifyDomain"]);
```

**Example Record:**
```json
{
  "_id": "client_xyz789",
  "email": "hello@pawsometreat.com",
  "shopifyDomain": "pawsometreat.myshopify.com",
  "storeName": "Pawsome Treats Co.",
  "contactName": "Sarah Johnson",
  "plan": "starter",
  "planDetails": {
    "articlesPerMonth": 4,
    "priceUsd": 299
  },
  "shopifyBlogId": "241253187",
  "shopifyAccessToken": "ENCRYPTED_shpat_abc123...",
  "shopifyAppInstalled": true,
  "integrationMethod": "public_app",
  "targetAudience": "health-conscious dog owners aged 25-45",
  "brandVoice": "friendly, educational, warm",
  "topicsToAvoid": ["raw food diets"],
  "productCategories": ["organic dog treats", "training treats"],
  "status": "active",
  "startDate": "2026-02-15T00:00:00Z",
  "trialEndsAt": null,
  "cancelledAt": null,
  "leadId": "lead_abc123",
  "referralSource": "email_outreach",
  "totalArticlesPublished": 2,
  "lastArticlePublishedAt": "2026-02-18T14:30:00Z",
  "createdAt": "2026-02-15T10:00:00Z",
  "updatedAt": "2026-02-19T09:00:00Z",
  "notes": "Very happy with first 2 articles, wants more pet nutrition content"
}
```

---

### 3. `articles` - Content Production Pipeline

All articles created for clients (drafts + published).

```typescript
const articles = defineTable({
  // Relations
  clientId: v.id("clients"),
  
  // Content
  title: v.string(),
  metaTitle: v.optional(v.string()),  // SEO meta title
  metaDescription: v.optional(v.string()),
  slug: v.optional(v.string()),       // URL handle
  
  contentMarkdown: v.string(),        // Full article in Markdown
  contentHtml: v.string(),            // Converted HTML for Shopify
  excerpt: v.optional(v.string()),    // Short summary
  
  // SEO & keywords
  primaryKeyword: v.string(),
  secondaryKeywords: v.array(v.string()),
  tags: v.array(v.string()),
  
  // Author & metadata
  author: v.string(),                 // "BloomContent" or specific writer name
  wordCount: v.number(),
  readingTimeMinutes: v.number(),
  
  // Status & workflow
  status: v.string(),                 // "researching" | "generating" | "review" | "approved" | "published" | "rejected"
  publishedToShopify: v.boolean(),
  shopifyArticleId: v.optional(v.string()), // Shopify's article ID after publishing
  shopifyUrl: v.optional(v.string()),  // Public URL on storefront
  
  // Publishing details
  publishType: v.optional(v.string()), // "draft" | "immediate" | "scheduled"
  scheduledFor: v.optional(v.string()), // ISO timestamp if scheduled
  publishedAt: v.optional(v.string()),
  
  // Client feedback
  clientFeedback: v.optional(v.string()),
  revisionRequested: v.boolean(),
  revisionNotes: v.optional(v.string()),
  
  // Files
  pdfUrl: v.optional(v.string()),     // Link to generated PDF
  imageUrls: v.optional(v.array(v.string())), // Suggested images
  
  // Metadata
  createdAt: v.string(),
  updatedAt: v.string(),
  generatedBy: v.optional(v.string()), // "claude-3.5" | "gpt-4" | "human"
  
  // Analytics (future)
  pageviews: v.optional(v.number()),
  avgTimeOnPage: v.optional(v.number()),
})
  .index("by_client", ["clientId"])
  .index("by_status", ["status"])
  .index("by_publishedAt", ["publishedAt"])
  .index("by_client_and_status", ["clientId", "status"]);
```

**Example Record:**
```json
{
  "_id": "article_def456",
  "clientId": "client_xyz789",
  "title": "10 Benefits of Organic Dog Treats Your Vet Won't Tell You",
  "metaTitle": "Organic Dog Treats: 10 Benefits (Vet-Approved Guide 2026)",
  "metaDescription": "Discover why organic dog treats are better for your pup. Science-backed benefits, expert tips, and product recommendations.",
  "slug": "organic-dog-treats-benefits",
  "contentMarkdown": "# 10 Benefits of Organic Dog Treats...\n\n## 1. Better Digestion\n\n...",
  "contentHtml": "<h1>10 Benefits of Organic Dog Treats...</h1><h2>1. Better Digestion</h2>...",
  "excerpt": "Organic dog treats offer superior nutrition and health benefits. Here are 10 reasons to make the switch.",
  "primaryKeyword": "organic dog treats",
  "secondaryKeywords": ["dog treat benefits", "healthy dog snacks", "natural pet treats"],
  "tags": ["organic", "dog health", "nutrition", "pet care"],
  "author": "BloomContent",
  "wordCount": 1847,
  "readingTimeMinutes": 7,
  "status": "published",
  "publishedToShopify": true,
  "shopifyArticleId": "567890123",
  "shopifyUrl": "https://pawsometreat.com/blogs/news/organic-dog-treats-benefits",
  "publishType": "immediate",
  "scheduledFor": null,
  "publishedAt": "2026-02-18T14:30:00Z",
  "clientFeedback": "Love it! Can we get one on training tips next?",
  "revisionRequested": false,
  "revisionNotes": null,
  "pdfUrl": "https://storage.contentbloom.com/articles/article_def456.pdf",
  "imageUrls": [
    "https://unsplash.com/dog-treat-1",
    "https://unsplash.com/happy-dog-2"
  ],
  "createdAt": "2026-02-16T10:00:00Z",
  "updatedAt": "2026-02-18T14:31:00Z",
  "generatedBy": "claude-3.5",
  "pageviews": 247,
  "avgTimeOnPage": 4.2
}
```

---

### 4. `outreach` - Email Campaign Tracking

Tracks outreach emails sent to leads.

```typescript
const outreach = defineTable({
  // Relations
  leadId: v.id("leads"),
  
  // Email details
  emailType: v.string(),              // "intro" | "followup1" | "followup2" | "closing"
  subject: v.string(),
  body: v.string(),                   // Email content (with template variables filled)
  
  // Sending details
  sentAt: v.optional(v.string()),     // ISO timestamp
  sentVia: v.optional(v.string()),    // "instantly" | "sendgrid" | "manual"
  instantlyEmailId: v.optional(v.string()), // Tracking ID from Instantly.ai
  
  // Engagement tracking
  opened: v.boolean(),
  openedAt: v.optional(v.string()),
  clicked: v.boolean(),
  clickedAt: v.optional(v.string()),
  replied: v.boolean(),
  repliedAt: v.optional(v.string()),
  replyText: v.optional(v.string()),  // Their response
  
  // Outcome
  outcome: v.optional(v.string()),    // "no_response" | "interested" | "not_interested" | "converted" | "bounced" | "unsubscribed"
  
  // Metadata
  createdAt: v.string(),
  notes: v.optional(v.string()),
})
  .index("by_lead", ["leadId"])
  .index("by_emailType", ["emailType"])
  .index("by_sentAt", ["sentAt"])
  .index("by_outcome", ["outcome"]);
```

**Example Records:**
```json
[
  {
    "_id": "outreach_001",
    "leadId": "lead_abc123",
    "emailType": "intro",
    "subject": "Free SEO-Optimized Content for Pawsome Treats",
    "body": "Hi Sarah,\n\nI noticed your Shopify store Pawsome Treats and loved...",
    "sentAt": "2026-02-16T09:00:00Z",
    "sentVia": "instantly",
    "instantlyEmailId": "inst_xyz123",
    "opened": true,
    "openedAt": "2026-02-16T09:23:00Z",
    "clicked": false,
    "clickedAt": null,
    "replied": false,
    "repliedAt": null,
    "replyText": null,
    "outcome": "no_response",
    "createdAt": "2026-02-16T08:45:00Z",
    "notes": null
  },
  {
    "_id": "outreach_002",
    "leadId": "lead_abc123",
    "emailType": "followup1",
    "subject": "Re: Free SEO-Optimized Content for Pawsome Treats",
    "body": "Hi Sarah,\n\nJust wanted to follow up...",
    "sentAt": "2026-02-19T09:00:00Z",
    "sentVia": "instantly",
    "instantlyEmailId": "inst_xyz124",
    "opened": true,
    "openedAt": "2026-02-19T10:15:00Z",
    "clicked": true,
    "clickedAt": "2026-02-19T10:16:00Z",
    "replied": true,
    "repliedAt": "2026-02-19T11:30:00Z",
    "replyText": "Yes! I'm interested. How does this work?",
    "outcome": "interested",
    "createdAt": "2026-02-19T08:45:00Z",
    "notes": "Strong interest! Move to closing email."
  }
]
```

---

### 5. `keywords` (Optional) - Keyword Research Cache

Cache keyword research results to avoid re-querying DataForSEO.

```typescript
const keywords = defineTable({
  // Keyword details
  keyword: v.string(),
  niche: v.string(),                  // e.g., "pet products"
  
  // SEO metrics (from DataForSEO)
  searchVolume: v.number(),
  difficulty: v.number(),             // 0-100
  cpc: v.optional(v.number()),        // Cost per click (USD)
  competition: v.optional(v.number()), // 0-1
  
  // Metadata
  location: v.string(),               // "United States" | "United Kingdom"
  language: v.string(),               // "en"
  
  // Related keywords
  relatedKeywords: v.optional(v.array(v.string())),
  
  // Cache
  fetchedAt: v.string(),              // ISO timestamp
  lastUsedAt: v.optional(v.string()),
  usageCount: v.number(),             // How many times used in articles
})
  .index("by_keyword", ["keyword"])
  .index("by_niche", ["niche"])
  .searchIndex("search_keyword", {
    searchField: "keyword",
  });
```

**Example Record:**
```json
{
  "_id": "keyword_ghi789",
  "keyword": "organic dog treats",
  "niche": "pet products",
  "searchVolume": 1200,
  "difficulty": 28,
  "cpc": 1.45,
  "competition": 0.72,
  "location": "United States",
  "language": "en",
  "relatedKeywords": [
    "best organic dog treats",
    "organic dog treat recipes",
    "grain-free dog treats"
  ],
  "fetchedAt": "2026-02-16T10:00:00Z",
  "lastUsedAt": "2026-02-18T12:00:00Z",
  "usageCount": 3
}
```

---

## Additional Utility Tables

### 6. `webhooks` - Track Shopify Webhook Events

```typescript
const webhooks = defineTable({
  clientId: v.id("clients"),
  eventType: v.string(),              // "app/uninstalled" | "shop/update"
  payload: v.string(),                // JSON string
  processedAt: v.string(),
  action: v.optional(v.string()),     // What we did in response
})
  .index("by_client", ["clientId"])
  .index("by_eventType", ["eventType"]);
```

### 7. `tasks` - Background Job Queue

```typescript
const tasks = defineTable({
  type: v.string(),                   // "generate_article" | "publish_article" | "send_email"
  status: v.string(),                 // "pending" | "processing" | "completed" | "failed"
  priority: v.number(),               // 1-10
  payload: v.string(),                // JSON string with task data
  
  scheduledFor: v.optional(v.string()),
  startedAt: v.optional(v.string()),
  completedAt: v.optional(v.string()),
  
  error: v.optional(v.string()),
  retryCount: v.number(),
  
  createdAt: v.string(),
})
  .index("by_status", ["status"])
  .index("by_scheduledFor", ["scheduledFor"]);
```

---

## Relationships Diagram

```
leads (1) ──→ (many) outreach
  │
  └─→ converts to ──→ clients (1) ──→ (many) articles
                           │
                           └─→ (many) webhooks
                           └─→ (many) tasks
```

---

## Convex Migration Scripts

### Initial Setup

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leads: defineTable({
    url: v.string(),
    shopifyDomain: v.string(),
    storeName: v.optional(v.string()),
    hasBlog: v.boolean(),
    blogUrl: v.optional(v.string()),
    blogPath: v.optional(v.string()),
    postCount: v.number(),
    email: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    priority: v.string(),
    score: v.optional(v.number()),
    status: v.string(),
    outreachStage: v.optional(v.string()),
    scrapedAt: v.string(),
    lastContactedAt: v.optional(v.string()),
    notes: v.optional(v.string()),
    country: v.optional(v.string()),
    niche: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),
  
  clients: defineTable({
    email: v.string(),
    shopifyDomain: v.string(),
    storeName: v.string(),
    contactName: v.optional(v.string()),
    plan: v.string(),
    planDetails: v.object({
      articlesPerMonth: v.number(),
      priceUsd: v.number(),
    }),
    shopifyBlogId: v.optional(v.string()),
    shopifyAccessToken: v.optional(v.string()),
    shopifyAppInstalled: v.boolean(),
    integrationMethod: v.string(),
    targetAudience: v.optional(v.string()),
    brandVoice: v.optional(v.string()),
    topicsToAvoid: v.optional(v.array(v.string())),
    productCategories: v.optional(v.array(v.string())),
    status: v.string(),
    startDate: v.string(),
    trialEndsAt: v.optional(v.string()),
    cancelledAt: v.optional(v.string()),
    leadId: v.optional(v.id("leads")),
    referralSource: v.optional(v.string()),
    totalArticlesPublished: v.number(),
    lastArticlePublishedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),
  
  articles: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    slug: v.optional(v.string()),
    contentMarkdown: v.string(),
    contentHtml: v.string(),
    excerpt: v.optional(v.string()),
    primaryKeyword: v.string(),
    secondaryKeywords: v.array(v.string()),
    tags: v.array(v.string()),
    author: v.string(),
    wordCount: v.number(),
    readingTimeMinutes: v.number(),
    status: v.string(),
    publishedToShopify: v.boolean(),
    shopifyArticleId: v.optional(v.string()),
    shopifyUrl: v.optional(v.string()),
    publishType: v.optional(v.string()),
    scheduledFor: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    clientFeedback: v.optional(v.string()),
    revisionRequested: v.boolean(),
    revisionNotes: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    createdAt: v.string(),
    updatedAt: v.string(),
    generatedBy: v.optional(v.string()),
    pageviews: v.optional(v.number()),
    avgTimeOnPage: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"]),
  
  outreach: defineTable({
    leadId: v.id("leads"),
    emailType: v.string(),
    subject: v.string(),
    body: v.string(),
    sentAt: v.optional(v.string()),
    sentVia: v.optional(v.string()),
    instantlyEmailId: v.optional(v.string()),
    opened: v.boolean(),
    openedAt: v.optional(v.string()),
    clicked: v.boolean(),
    clickedAt: v.optional(v.string()),
    replied: v.boolean(),
    repliedAt: v.optional(v.string()),
    replyText: v.optional(v.string()),
    outcome: v.optional(v.string()),
    createdAt: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_lead", ["leadId"])
    .index("by_outcome", ["outcome"]),
});
```

---

## PostgreSQL Alternative

If using PostgreSQL instead of Convex:

```sql
-- leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  shopify_domain TEXT NOT NULL UNIQUE,
  store_name TEXT,
  has_blog BOOLEAN NOT NULL,
  blog_url TEXT,
  blog_path TEXT,
  post_count INTEGER NOT NULL DEFAULT 0,
  email TEXT,
  owner_name TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  score INTEGER,
  status TEXT NOT NULL DEFAULT 'new',
  outreach_stage TEXT,
  scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_contacted_at TIMESTAMP,
  notes TEXT,
  country TEXT,
  niche TEXT,
  tags TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_has_blog ON leads(has_blog);

-- clients table (similar structure)
-- ... (repeat for other tables)
```

---

## Next Steps

1. [ ] Set up Convex project (`npx convex dev`)
2. [ ] Apply schema definitions
3. [ ] Create seed data for testing
4. [ ] Build CRUD operations (queries/mutations)
5. [ ] Test with scraper script
6. [ ] Add authentication/authorization rules
