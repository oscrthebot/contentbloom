/**
 * Publishes a BloomContent article to a Shopify store's blog via Admin API.
 * Requires: storeDomain (xxx.myshopify.com), accessToken (shpat_xxx), article data
 */

export interface ShopifyPublishResult {
  success: boolean;
  shopifyArticleId?: string;
  shopifyArticleUrl?: string;
  error?: string;
}

interface ShopifyBlog {
  id: number;
  title: string;
  handle: string;
}

interface ShopifyArticle {
  id: number;
  title: string;
  handle: string;
  url?: string;
}

export async function publishToShopify(params: {
  storeDomain: string;       // e.g. misihucosmetics.myshopify.com
  accessToken: string;       // shpat_xxx
  title: string;
  contentHtml: string;       // HTML content to publish
  metaDescription: string;
  tags: string[];
  authorName: string;
  blogTitle?: string;        // default "News"
}): Promise<ShopifyPublishResult> {
  const { storeDomain, accessToken, title, contentHtml, metaDescription, tags, authorName, blogTitle = "News" } = params;

  // Normalize domain
  const domain = storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const baseUrl = `https://${domain}/admin/api/2024-01`;
  const headers = {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  };

  try {
    // Step 1: Get blogs list
    const blogsRes = await fetch(`${baseUrl}/blogs.json`, { headers });
    if (!blogsRes.ok) {
      const errorText = await blogsRes.text();
      return {
        success: false,
        error: `Failed to fetch blogs: ${blogsRes.status} ${errorText.slice(0, 200)}`,
      };
    }

    const blogsData = await blogsRes.json() as { blogs: ShopifyBlog[] };
    const blogs: ShopifyBlog[] = blogsData.blogs ?? [];

    if (blogs.length === 0) {
      return { success: false, error: "No blogs found in this Shopify store. Please create a blog first." };
    }

    // Find target blog by title, or fallback to first
    const targetBlog =
      blogs.find((b) => b.title.toLowerCase() === blogTitle.toLowerCase()) ??
      blogs.find((b) => b.title.toLowerCase() === "news") ??
      blogs[0];

    // Step 2: Create article
    const articlePayload = {
      article: {
        title,
        body_html: contentHtml,
        tags: tags.join(", "),
        author: authorName,
        summary_html: metaDescription,
        published: true,
      },
    };

    const articleRes = await fetch(`${baseUrl}/blogs/${targetBlog.id}/articles.json`, {
      method: "POST",
      headers,
      body: JSON.stringify(articlePayload),
    });

    if (!articleRes.ok) {
      const errorText = await articleRes.text();
      return {
        success: false,
        error: `Failed to create article: ${articleRes.status} ${errorText.slice(0, 300)}`,
      };
    }

    const articleData = await articleRes.json() as { article: ShopifyArticle };
    const article = articleData.article;

    const shopifyArticleId = String(article.id);
    const shopifyArticleUrl = `https://${domain}/blogs/${targetBlog.handle}/${article.handle}`;

    return {
      success: true,
      shopifyArticleId,
      shopifyArticleUrl,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Validates Shopify credentials by fetching shop info.
 */
export async function testShopifyConnection(params: {
  storeDomain: string;
  accessToken: string;
}): Promise<{ success: boolean; shopName?: string; error?: string }> {
  const domain = params.storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const baseUrl = `https://${domain}/admin/api/2024-01`;
  const headers = {
    "X-Shopify-Access-Token": params.accessToken,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(`${baseUrl}/shop.json`, { headers });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `${res.status}: ${text.slice(0, 200)}` };
    }
    const data = await res.json() as { shop: { name: string } };
    return { success: true, shopName: data.shop?.name };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
