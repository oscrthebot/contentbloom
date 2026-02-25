# Shopify Blog Publishing Integration - Research & Implementation

**Date:** 2026-02-19  
**Project:** BloomContent MVP  
**Author:** AI Agent

---

## Executive Summary

There are **3 main approaches** to publishing blog articles directly to Shopify stores:

1. **Custom Shopify App** (Recommended for MVP) ✅
2. **Admin API with Custom App Credentials** (Simplest, but less scalable)
3. **Third-Party Integration Service** (Zapier/Make - backup option)

**Recommendation:** Build a **Public Shopify App** that merchants install via OAuth. This provides the best UX, security, and scalability.

---

## Shopify Blog API Overview

### REST Admin API - Article Endpoints

**Base URL:** `https://{shop}.myshopify.com/admin/api/2024-01/`

**Key Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/blogs.json` | List all blogs on store |
| GET | `/blogs/{blog_id}/articles.json` | Get articles from specific blog |
| POST | `/blogs/{blog_id}/articles.json` | **Create new article** |
| PUT | `/blogs/{blog_id}/articles/{article_id}.json` | Update existing article |
| DELETE | `/blogs/{blog_id}/articles/{article_id}.json` | Delete article |

### Article Object Structure

```json
{
  "article": {
    "title": "My New Article Title",
    "author": "BloomContent",
    "tags": "SEO, Marketing, E-commerce",
    "body_html": "<h2>Article content here</h2><p>With HTML formatting...</p>",
    "published_at": "2026-02-19T10:00:00Z",  // null = draft
    "summary_html": "<p>Short excerpt...</p>",
    "template_suffix": null,
    "handle": "my-new-article-title",  // URL slug (auto-generated if omitted)
    "metafields": [
      {
        "namespace": "seo",
        "key": "meta_description",
        "value": "This article is about...",
        "type": "single_line_text_field"
      }
    ]
  }
}
```

**Important Fields:**
- `title` - Article title (required)
- `body_html` - Main content in HTML (required)
- `published_at` - Set to `null` for draft, or ISO timestamp to publish immediately
- `tags` - Comma-separated (e.g., "SEO, Marketing")
- `author` - Author name (string)
- `handle` - URL slug (auto-generated from title if not provided)

### Required API Scopes

To read/write blog articles, your app needs:

```
write_content, read_content
```

Optional but useful:
```
write_products, read_products  (to link products in articles)
read_themes  (to check available blog templates)
```

---

## Option A: Public Shopify App (RECOMMENDED)

### Overview

Create a Shopify App that merchants install from the Shopify App Store (or via direct link). Uses OAuth 2.0 for secure authentication.

### Pros ✅

- **Best UX:** Merchant clicks "Install App" → Done (no API keys to copy/paste)
- **Secure:** OAuth tokens are scoped and can be revoked
- **Scalable:** Can handle 100s-1000s of stores
- **Professional:** Looks like a real SaaS product
- **Recurring billing:** Can integrate Shopify's native billing API
- **App Store discovery:** Can list publicly for organic growth

### Cons ❌

- **Development time:** ~2-5 days to build + test
- **Shopify Partner account required:** Free, but need approval
- **Compliance:** Must follow Shopify's app requirements (data handling, privacy policy)
- **Hosting needed:** App backend must be publicly accessible (HTTPS)

### Implementation Steps

#### 1. Create Shopify Partner Account
- Go to [partners.shopify.com](https://partners.shopify.com)
- Sign up (free)
- Create a "Development Store" for testing

#### 2. Create App in Partner Dashboard
- Navigate to **Apps** → **Create App**
- Choose **Public App**
- Set App URL: `https://yourapp.com` (your backend)
- Set Redirect URL: `https://yourapp.com/auth/callback`
- Set scopes: `write_content, read_content`

#### 3. Implement OAuth Flow

**Technologies:**
- Backend: Node.js + Express (or Python + Flask)
- Shopify Library: `@shopify/shopify-api` (Node) or `shopify_python_api` (Python)

**OAuth Flow (Simplified):**

```javascript
// 1. User clicks "Install App" → Redirect to Shopify OAuth
app.get('/install', (req, res) => {
  const shop = req.query.shop; // e.g., "mystore.myshopify.com"
  const scopes = 'write_content,read_content';
  const redirectUri = 'https://yourapp.com/auth/callback';
  const nonce = generateNonce();
  
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=${nonce}`;
  
  res.redirect(installUrl);
});

// 2. Shopify redirects back with code → Exchange for access token
app.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;
  
  const accessToken = await exchangeCodeForToken(shop, code);
  
  // Save to database
  await db.saveShopToken(shop, accessToken);
  
  res.redirect(`https://${shop}/admin/apps/your-app-slug`);
});

// 3. Make API calls with token
async function publishArticle(shop, blogId, articleData) {
  const token = await db.getShopToken(shop);
  
  const response = await fetch(
    `https://${shop}/admin/api/2024-01/blogs/${blogId}/articles.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ article: articleData })
    }
  );
  
  return response.json();
}
```

#### 4. Build UI

**Embedded App (recommended):**
- Use Shopify Polaris (design system)
- Renders inside Shopify admin dashboard
- Feels native to merchants

**Standalone App:**
- Separate website/dashboard
- Link from Shopify admin
- More flexibility, but feels less integrated

#### 5. Testing

- Install app on Development Store
- Test article creation, editing, deletion
- Test with draft vs. published states
- Verify permissions and error handling

#### 6. Submit to App Store (Optional)

- Add privacy policy, support email
- Submit for review (1-2 weeks)
- Once approved, merchants can discover organically

### Example Code (Node.js + Express)

```javascript
// server.js - Minimal Shopify App for article publishing

const express = require('express');
const { Shopify } = require('@shopify/shopify-api');

const app = express();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: ['write_content', 'read_content'],
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ''),
  IS_EMBEDDED_APP: true,
  API_VERSION: '2024-01'
});

// Install route
app.get('/install', async (req, res) => {
  const authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop,
    '/auth/callback',
    false
  );
  return res.redirect(authRoute);
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  const session = await Shopify.Auth.validateAuthCallback(req, res, req.query);
  
  // Store session.accessToken in database with session.shop as key
  await saveToDatabase(session.shop, session.accessToken);
  
  res.redirect(`https://${session.shop}/admin/apps/contentbloom`);
});

// API route to publish article
app.post('/api/publish', async (req, res) => {
  const { shop, blogId, article } = req.body;
  const accessToken = await getFromDatabase(shop);
  
  const client = new Shopify.Clients.Rest(shop, accessToken);
  
  const response = await client.post({
    path: `blogs/${blogId}/articles`,
    data: { article },
    type: 'application/json'
  });
  
  res.json(response.body);
});

app.listen(3000);
```

### User Flow (Merchant Perspective)

1. **Discovery:** Merchant receives email from BloomContent: "Get 2 free articles + install our app for one-click publishing"
2. **Installation:** Merchant clicks install link → Shopify OAuth page appears
3. **Authorization:** "BloomContent wants to: Read and write blog content" → Merchant clicks "Install app"
4. **Onboarding:** Merchant is redirected to BloomContent dashboard (embedded in Shopify admin)
5. **Usage:** 
   - BloomContent shows: "2 articles ready to publish!"
   - Merchant clicks "Publish to Blog" → Selects which blog → Done!
6. **Article appears live** on their store instantly

---

## Option B: Admin API with Custom App Credentials

### Overview

Merchant creates a "Custom App" in their Shopify admin, generates API credentials, and provides them to you.

### Pros ✅

- **Simplest to implement:** No OAuth flow needed
- **Quick setup:** Can start testing in 10 minutes
- **No hosting required:** Just store credentials securely

### Cons ❌

- **Poor UX:** Merchant has to manually create app, copy/paste API keys
- **Less secure:** If credentials leak, full admin access is compromised
- **Not scalable:** Every new client = manual setup
- **No App Store presence:** Can't leverage Shopify ecosystem

### Implementation Steps

#### 1. Merchant Creates Custom App

**Instructions for client:**

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" → "Allow custom app development" (if needed)
3. Click "Create an app" → Name it "BloomContent"
4. Go to **Configuration** → **Admin API scopes**
5. Select: `write_content`, `read_content`
6. Click "Save"
7. Go to **API credentials** → Click "Install app"
8. Copy **Admin API access token** (shows only once!)
9. Copy **API key** and **API secret key**
10. Send to BloomContent securely (email, encrypted message, etc.)

#### 2. Store Credentials Securely

```javascript
// Example database schema
{
  "shop": "mystore.myshopify.com",
  "api_key": "abc123...",
  "api_secret": "xyz789...",
  "access_token": "shpat_abc123xyz...",  // ← This is what you need for API calls
  "created_at": "2026-02-19T10:00:00Z"
}
```

**Security:**
- Encrypt tokens at rest (AES-256)
- Use environment variables, not hardcoded
- Implement rate limiting to prevent abuse

#### 3. Make API Calls

```python
# Python example
import requests

def publish_article(shop, access_token, blog_id, article_data):
    url = f"https://{shop}/admin/api/2024-01/blogs/{blog_id}/articles.json"
    
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json"
    }
    
    payload = {"article": article_data}
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

# Usage:
article = {
    "title": "10 SEO Tips for E-commerce",
    "body_html": "<h2>Introduction</h2><p>SEO is crucial...</p>",
    "author": "BloomContent",
    "tags": "SEO, Marketing",
    "published_at": None  # Draft
}

result = publish_article(
    shop="mystore.myshopify.com",
    access_token="shpat_abc123...",
    blog_id=241253187,
    article_data=article
)

print(f"Article created! ID: {result['article']['id']}")
```

### User Flow (Merchant Perspective)

1. **Onboarding email:** BloomContent sends detailed instructions with screenshots
2. **Manual setup:** Merchant spends 5-10 minutes creating custom app
3. **Credential sharing:** Merchant copies API token → Sends via secure method
4. **Confirmation:** BloomContent team confirms credentials work
5. **Publishing:** BloomContent publishes articles on behalf of merchant (no direct access for merchant)

**Friction points:**
- Non-technical merchants may struggle with setup
- Requires trust (giving full API access to third party)
- If token is lost, must regenerate (and update in your system)

---

## Option C: Third-Party Integration (Zapier / Make / n8n)

### Overview

Use automation platforms as middleware between your app and Shopify.

### Pros ✅

- **No code (almost):** Visual workflow builder
- **Fast prototyping:** Build in hours, not days
- **Built-in auth:** Zapier handles OAuth for you
- **Multi-step workflows:** Combine with other services (email, Slack, etc.)

### Cons ❌

- **Cost:** Zapier/Make charge per task ($20-100/month for 1000s of articles)
- **Vendor lock-in:** Your business depends on their service
- **Limited control:** Can't customize beyond what platform offers
- **Rate limits:** May hit limits with high volume

### Implementation Example (Zapier)

**Trigger:** Webhook from your app  
**Action:** Create Shopify Blog Post

**Workflow:**
1. Your app sends POST request to Zapier webhook:
   ```json
   {
     "shop": "mystore.myshopify.com",
     "blog_id": 241253187,
     "title": "Article Title",
     "body_html": "<p>Content...</p>",
     "tags": "SEO",
     "author": "BloomContent"
   }
   ```

2. Zapier parses data

3. Zapier's Shopify integration:
   - Authenticates via OAuth (merchant connects Shopify account to Zapier once)
   - Creates article using Admin API
   - Returns success/failure to webhook response

**Setup Steps:**
1. Create Zap: Webhook → Shopify
2. Get webhook URL from Zapier
3. Merchant connects their Shopify store to Zapier (OAuth)
4. Your app sends article data to webhook
5. Article publishes automatically

**Cost Estimate:**
- Zapier Starter: $19.99/mo (750 tasks)
- If publishing 100 articles/mo across 10 clients → Well within limits

### When to Use This

- **MVP/Testing:** Quick validation before building full app
- **Low volume:** <100 articles/month total
- **Non-technical team:** Can't build/maintain Shopify app

---

## Comparison Matrix

| Feature | Public App (A) | Custom App (B) | Zapier (C) |
|---------|---------------|----------------|------------|
| **Development Time** | 2-5 days | 1 day | 2 hours |
| **User Setup Time** | 2 minutes | 10 minutes | 5 minutes |
| **UX Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Security** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Scalability** | Unlimited | Limited | Medium |
| **Cost (1000 articles/mo)** | $0 | $0 | ~$50 |
| **Maintenance** | Medium | Low | Very Low |
| **Customization** | Full control | Full control | Limited |
| **App Store Listing** | Yes | No | No |

---

## Recommended Implementation Plan for BloomContent MVP

### Phase 1: Immediate (Week 1-2) - Use Option B

**Why:** Get to market fast without blocking on app development

**Steps:**
1. Create detailed setup guide for merchants (with screenshots)
2. Build simple Python/Node script to publish via Custom App credentials
3. Onboard first 5-10 beta clients manually
4. Validate that publishing works smoothly

**Deliverable:** Working MVP where you can publish to client stores (manual credential setup)

---

### Phase 2: Scale (Week 3-6) - Build Option A

**Why:** As client count grows (>20), manual setup becomes unsustainable

**Steps:**
1. Create Shopify Partner account
2. Build OAuth app (Node.js or Python)
3. Create simple dashboard:
   - View pending articles
   - One-click publish to Shopify
   - See published article stats
4. Migrate existing clients from Custom App to Public App
5. (Optional) Submit to App Store for organic discovery

**Deliverable:** Self-serve installation for new clients + embedded dashboard

---

### Phase 3: Optimize (Month 2+) - Enhance Features

**Features to add:**
- **Preview mode:** Show article preview before publishing
- **Scheduling:** "Publish on [date/time]"
- **Analytics:** Track pageviews, engagement (via Shopify Analytics API)
- **Bulk operations:** Publish multiple articles at once
- **Templates:** Client can choose article format/structure
- **Feedback loop:** Client requests edits directly in app

---

## Code Examples

### Example 1: Publish Draft Article (Python)

```python
import requests
from datetime import datetime

def create_draft_article(shop, access_token, blog_id, title, html_content, tags, author="BloomContent"):
    """
    Create a draft article (not published immediately)
    """
    url = f"https://{shop}/admin/api/2024-01/blogs/{blog_id}/articles.json"
    
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json"
    }
    
    article_data = {
        "article": {
            "title": title,
            "body_html": html_content,
            "author": author,
            "tags": tags,
            "published_at": None  # Keep as draft
        }
    }
    
    response = requests.post(url, headers=headers, json=article_data)
    
    if response.status_code == 201:
        article = response.json()['article']
        print(f"✅ Draft created! ID: {article['id']}")
        print(f"   Preview: https://{shop}/admin/articles/{article['id']}")
        return article
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return None

# Usage:
create_draft_article(
    shop="mystore.myshopify.com",
    access_token="shpat_abc123...",
    blog_id=241253187,
    title="10 Best Organic Dog Treats in 2026",
    html_content="<h2>Introduction</h2><p>Your dog deserves the best...</p>",
    tags="dogs, organic, pet-care"
)
```

### Example 2: Publish Immediately (JavaScript)

```javascript
async function publishArticleNow(shop, accessToken, blogId, articleData) {
  const url = `https://${shop}/admin/api/2024-01/blogs/${blogId}/articles.json`;
  
  const payload = {
    article: {
      ...articleData,
      published_at: new Date().toISOString()  // Publish now!
    }
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log(`✅ Published! URL: https://${shop}/blogs/news/${result.article.handle}`);
    return result.article;
  } else {
    console.error('❌ Error:', await response.text());
    return null;
  }
}

// Usage:
publishArticleNow(
  'mystore.myshopify.com',
  'shpat_abc123...',
  241253187,
  {
    title: "5 Ways to Use Organic Dog Treats for Training",
    body_html: "<h2>Training with treats</h2><p>Positive reinforcement works...</p>",
    author: "BloomContent",
    tags: "training, dogs, tips"
  }
);
```

### Example 3: Get Blog ID (First-Time Setup)

```python
def get_blogs(shop, access_token):
    """
    List all blogs on the store to find blog_id
    """
    url = f"https://{shop}/admin/api/2024-01/blogs.json"
    
    headers = {"X-Shopify-Access-Token": access_token}
    
    response = requests.get(url, headers=headers)
    blogs = response.json()['blogs']
    
    print(f"Found {len(blogs)} blog(s):")
    for blog in blogs:
        print(f"  - {blog['title']} (ID: {blog['id']})")
        print(f"    URL: https://{shop}/blogs/{blog['handle']}")
    
    return blogs

# Usage (run once per new client):
blogs = get_blogs("mystore.myshopify.com", "shpat_abc123...")
# Output:
# Found 2 blog(s):
#   - News (ID: 241253187)
#     URL: https://mystore.myshopify.com/blogs/news
#   - Stories (ID: 987654321)
#     URL: https://mystore.myshopify.com/blogs/stories
```

---

## Security Considerations

### Access Token Storage

**DO:**
- ✅ Encrypt tokens at rest (AES-256)
- ✅ Use environment variables for API keys
- ✅ Implement HTTPS only (no HTTP)
- ✅ Rotate tokens periodically (if using Custom Apps)
- ✅ Log all API calls for auditing

**DON'T:**
- ❌ Store tokens in plain text
- ❌ Commit tokens to Git
- ❌ Share tokens via insecure channels (email, Slack)
- ❌ Use same token for multiple stores

### API Rate Limits

Shopify enforces rate limits:
- **REST API:** 2 requests/second (burst: 40 requests)
- **GraphQL API:** 1000 points per 60 seconds (calculated per query complexity)

**Mitigation:**
- Implement exponential backoff on 429 errors
- Queue article publishing (don't publish 10 articles at once)
- Cache blog IDs and store metadata (don't fetch every time)

### GDPR & Data Privacy

If operating in EU:
- Only store necessary data (shop domain, access token, blog preferences)
- Implement data deletion on app uninstall
- Have privacy policy + GDPR-compliant consent flow
- Use webhooks to detect uninstalls and auto-delete data

---

## Testing Checklist

Before going live, test:

- [ ] Install app on development store
- [ ] Create draft article (verify it appears in Shopify admin)
- [ ] Publish article (verify it appears on storefront)
- [ ] Edit article via API
- [ ] Delete article via API
- [ ] Test with store that has multiple blogs
- [ ] Test error handling (invalid blog_id, missing fields)
- [ ] Test rate limiting (publish 50 articles rapidly)
- [ ] Test uninstall flow (does data get cleaned up?)
- [ ] Test on mobile (if using embedded app UI)

---

## Resources

### Official Shopify Docs
- [Admin REST API - Article](https://shopify.dev/docs/api/admin-rest/latest/resources/article)
- [Authentication & Authorization](https://shopify.dev/docs/apps/build/authentication-authorization)
- [Getting Started with App Development](https://shopify.dev/docs/apps/build/scaffold-app)

### Libraries
- **Node.js:** `@shopify/shopify-api` - [GitHub](https://github.com/Shopify/shopify-api-js)
- **Python:** `shopify_python_api` - [GitHub](https://github.com/Shopify/shopify_python_api)
- **Ruby:** `shopify_api` - [GitHub](https://github.com/Shopify/shopify-api-ruby)

### Tools
- [Shopify Partner Dashboard](https://partners.shopify.com)
- [Shopify Polaris (Design System)](https://polaris.shopify.com)
- [Shopify CLI](https://shopify.dev/docs/apps/build/cli-for-apps)

---

## Final Recommendation

**For BloomContent MVP:**

1. **Start with Option B (Custom App)** for first 5-10 clients
   - Fastest time-to-market
   - Validates demand before building complex app
   - Manual setup is acceptable at small scale

2. **Build Option A (Public App)** once you hit 15-20 clients
   - Better UX = easier to close sales
   - Scalable to 100s of clients
   - Unlocks App Store distribution

3. **Keep Option C (Zapier) as backup** for non-standard cases
   - Client wants custom workflow
   - Integration with their existing tools
   - Special compliance requirements

**Timeline:**
- Week 1-2: Custom App approach (Option B) - Launch MVP
- Week 3-4: Public App development (Option A)
- Week 5-6: Testing + migration of existing clients
- Week 7+: App Store submission (optional)

**Cost estimate:**
- Development: 40-60 hours ($2,000-$4,000 if outsourced)
- Hosting: $10-50/month (Heroku, Railway, DigitalOcean)
- Shopify Partner account: Free

**ROI:** If each client pays $200-500/month, you break even after 5-10 clients.

---

## Next Actions

1. [ ] Create Shopify Partner account
2. [ ] Set up development store for testing
3. [ ] Build script for Option B (Custom App publishing)
4. [ ] Create merchant setup guide with screenshots
5. [ ] Test end-to-end flow with dummy article
6. [ ] Once validated, start Option A development
7. [ ] Document API error codes and troubleshooting
8. [ ] Build simple dashboard for clients to trigger publishing

---

**Questions? Contact:** rafa@happyoperators.com
