# Shopify Integration Guide

## Overview
This document details how ContentBloom integrates with Shopify to automatically publish blog content.

## Architecture

```
ContentBloom                  Shopify Store
    │                              │
    ├─ Generate Content            │
    │                              │
    ├─ Schedule Post ──────────────▶ OAuth Flow
    │                              │
    ├─ Get Access Token ◀──────────┤
    │                              │
    ├─ Create Blog Article ────────▶ Admin API
    │                              │
    └─ Publish ◀───────────────────┘
```

## Shopify Admin API

### Authentication: OAuth 2.0

**Step 1: Create Shopify App**

1. Go to Shopify Partners Dashboard
2. Create new app
3. Set OAuth redirect URL: `https://contentbloom.com/api/shopify/callback`
4. Request scopes:
   - `write_content` - Create/edit blog posts
   - `read_products` - Access product catalog
   - `read_themes` - Access store theme (for styling)

**Step 2: OAuth Flow**

```typescript
// 1. Redirect user to Shopify authorization page
const shopifyAuthUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?` +
  `client_id=${clientId}&` +
  `scope=write_content,read_products,read_themes&` +
  `redirect_uri=${redirectUri}&` +
  `state=${randomState}`;

// 2. User approves app
// 3. Shopify redirects to callback URL with code

// 4. Exchange code for access token
const tokenResponse = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: authCode,
  }),
});

const { access_token } = await tokenResponse.json();

// 5. Store access token securely
await ctx.db.patch(storeId, {
  shopifyAccessToken: access_token,
});
```

### Blog Management

**List Blogs:**
```typescript
GET https://{shop}.myshopify.com/admin/api/2024-01/blogs.json

Headers:
  X-Shopify-Access-Token: {access_token}

Response:
{
  "blogs": [
    {
      "id": 123456789,
      "handle": "news",
      "title": "News",
      "commentable": "yes",
      "feedburner": null,
      "feedburner_location": null,
      "created_at": "2024-01-01T00:00:00-05:00",
      "updated_at": "2024-02-01T00:00:00-05:00",
      "tags": "",
      "template_suffix": null
    }
  ]
}
```

**Create Blog Article:**
```typescript
POST https://{shop}.myshopify.com/admin/api/2024-01/blogs/{blog_id}/articles.json

Headers:
  X-Shopify-Access-Token: {access_token}
  Content-Type: application/json

Body:
{
  "article": {
    "title": "10 Best Running Shoes for Marathon Training",
    "author": "ContentBloom",
    "tags": "running, marathon, shoes, training, fitness",
    "body_html": "<h2>Introduction</h2><p>...</p>",
    "published_at": "2024-02-20T10:00:00-05:00",
    "image": {
      "src": "https://cdn.example.com/featured-image.jpg"
    },
    "metafields": [
      {
        "namespace": "seo",
        "key": "meta_description",
        "value": "Discover the top 10 running shoes...",
        "type": "single_line_text_field"
      }
    ]
  }
}

Response:
{
  "article": {
    "id": 987654321,
    "title": "10 Best Running Shoes for Marathon Training",
    "created_at": "2024-02-19T16:00:00-05:00",
    "body_html": "<h2>Introduction</h2><p>...</p>",
    "blog_id": 123456789,
    "author": "ContentBloom",
    "user_id": null,
    "published_at": "2024-02-20T10:00:00-05:00",
    "updated_at": "2024-02-19T16:00:00-05:00",
    "summary_html": "",
    "template_suffix": null,
    "handle": "10-best-running-shoes-for-marathon-training",
    "tags": "running, marathon, shoes, training, fitness",
    "admin_graphql_api_id": "gid://shopify/Article/987654321"
  }
}
```

**Update Article:**
```typescript
PUT https://{shop}.myshopify.com/admin/api/2024-01/blogs/{blog_id}/articles/{article_id}.json

Body:
{
  "article": {
    "id": 987654321,
    "title": "Updated Title",
    "body_html": "<h2>Updated content</h2>",
    "published": true
  }
}
```

**Delete Article:**
```typescript
DELETE https://{shop}.myshopify.com/admin/api/2024-01/blogs/{blog_id}/articles/{article_id}.json
```

## Implementation

### Convex Actions

**Publish to Shopify:**
```typescript
// convex/shopify.ts
import { action } from "./_generated/server";
import { v } from "convex/values";

export const publishArticle = action({
  args: {
    contentId: v.id("content"),
  },
  handler: async (ctx, { contentId }) => {
    // Get content from database
    const content = await ctx.runQuery(api.content.get, { id: contentId });
    const store = await ctx.runQuery(api.stores.get, { id: content.storeId });

    if (!store.shopifyAccessToken) {
      throw new Error("Shopify not connected");
    }

    // Get or create blog
    let blogId = await getOrCreateBlog(store.url, store.shopifyAccessToken);

    // Prepare article data
    const articleData = {
      article: {
        title: content.title,
        author: "ContentBloom AI",
        tags: content.keywords?.join(", ") || "",
        body_html: content.content,
        published_at: content.scheduledFor 
          ? new Date(content.scheduledFor).toISOString()
          : new Date().toISOString(),
        metafields: [
          {
            namespace: "seo",
            key: "meta_description",
            value: content.metadata?.description || "",
            type: "single_line_text_field",
          },
        ],
      },
    };

    // Publish to Shopify
    const response = await fetch(
      `https://${store.url}/admin/api/2024-01/blogs/${blogId}/articles.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": store.shopifyAccessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Update content in database
    await ctx.runMutation(api.content.update, {
      id: contentId,
      status: "published",
      publishedAt: Date.now(),
      shopifyArticleId: result.article.id.toString(),
    });

    return result.article;
  },
});

async function getOrCreateBlog(shop: string, accessToken: string) {
  // Check if blog exists
  const blogsResponse = await fetch(
    `https://${shop}/admin/api/2024-01/blogs.json`,
    {
      headers: { "X-Shopify-Access-Token": accessToken },
    }
  );

  const { blogs } = await blogsResponse.json();

  // Find blog with handle "news" or create it
  let blog = blogs.find((b: any) => b.handle === "news");

  if (!blog) {
    const createResponse = await fetch(
      `https://${shop}/admin/api/2024-01/blogs.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blog: {
            title: "Blog",
            commentable: "no",
          },
        }),
      }
    );

    const result = await createResponse.json();
    blog = result.blog;
  }

  return blog.id;
}
```

### Scheduled Publishing

**Using Convex Scheduled Functions:**

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check every 15 minutes for content ready to publish
crons.interval(
  "publish-scheduled-content",
  { minutes: 15 },
  internal.content.publishScheduledContent
);

export default crons;

// convex/content.ts (internal function)
export const publishScheduledContent = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Find content scheduled for publishing
    const scheduledContent = await ctx.db
      .query("content")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "scheduled"),
          q.lte(q.field("scheduledFor"), now)
        )
      )
      .collect();

    // Publish each piece of content
    for (const content of scheduledContent) {
      try {
        await ctx.scheduler.runAfter(0, internal.shopify.publishArticle, {
          contentId: content._id,
        });
      } catch (error) {
        console.error(`Failed to publish ${content._id}:`, error);
        
        // Mark as failed
        await ctx.db.patch(content._id, {
          status: "failed",
          metadata: { error: error.message },
        });
      }
    }
  },
});
```

## Product Integration

**Fetch Products for Content Generation:**

```typescript
export const fetchProducts = action({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const store = await ctx.runQuery(api.stores.get, { id: storeId });

    const response = await fetch(
      `https://${store.url}/admin/api/2024-01/products.json?limit=50`,
      {
        headers: { "X-Shopify-Access-Token": store.shopifyAccessToken },
      }
    );

    const { products } = await response.json();

    return products.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.body_html,
      handle: p.handle,
      images: p.images.map((img: any) => img.src),
      tags: p.tags,
      variants: p.variants.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
      })),
    }));
  },
});
```

## Webhooks (Optional)

**Track Article Performance:**

Register webhook for article views:
```typescript
POST https://{shop}.myshopify.com/admin/api/2024-01/webhooks.json

Body:
{
  "webhook": {
    "topic": "articles/update",
    "address": "https://contentbloom.com/api/webhooks/shopify",
    "format": "json"
  }
}
```

**Handle Webhook:**
```typescript
// app/api/webhooks/shopify/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256");

  // Verify webhook authenticity
  if (!verifyWebhook(body, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = JSON.parse(body);

  // Update article stats in database
  await updateArticleStats(data.id, {
    views: data.views,
    updated_at: data.updated_at,
  });

  return new Response("OK");
}
```

## Error Handling

**Common Errors:**

1. **401 Unauthorized** - Access token expired or invalid
   - Solution: Re-authenticate user

2. **422 Unprocessable Entity** - Invalid article data
   - Solution: Validate content before sending

3. **429 Too Many Requests** - Rate limit exceeded
   - Solution: Implement exponential backoff

4. **500 Internal Server Error** - Shopify server issue
   - Solution: Retry with exponential backoff

**Retry Logic:**
```typescript
async function publishWithRetry(contentId: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await publishArticle({ contentId });
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff: 2s, 4s, 8s
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

## Testing

**Test Connection:**
```typescript
export const testShopifyConnection = action({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const store = await ctx.runQuery(api.stores.get, { id: storeId });

    try {
      const response = await fetch(
        `https://${store.url}/admin/api/2024-01/shop.json`,
        {
          headers: { "X-Shopify-Access-Token": store.shopifyAccessToken },
        }
      );

      if (!response.ok) {
        return { success: false, error: "Invalid credentials" };
      }

      const { shop } = await response.json();
      return { 
        success: true, 
        shopName: shop.name,
        email: shop.email,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});
```

## Security Best Practices

1. **Store access tokens securely** - Encrypt in database
2. **Validate webhook signatures** - Verify HMAC
3. **Use HTTPS only** - No plain HTTP
4. **Implement rate limiting** - Respect Shopify API limits
5. **Rotate secrets regularly** - Update client secrets every 90 days
6. **Monitor for suspicious activity** - Log all API calls

## Rate Limits

**Shopify API Limits:**
- REST Admin API: 2 requests/second (burst up to 40)
- GraphQL Admin API: 1000 points per 60 seconds

**Best Practices:**
- Batch operations when possible
- Cache frequently accessed data
- Use webhooks instead of polling
- Implement exponential backoff

## Resources

- [Shopify Admin API Docs](https://shopify.dev/docs/api/admin-rest)
- [OAuth Documentation](https://shopify.dev/docs/apps/auth/oauth)
- [Blog API Reference](https://shopify.dev/docs/api/admin-rest/2024-01/resources/blog)
- [Article API Reference](https://shopify.dev/docs/api/admin-rest/2024-01/resources/article)
