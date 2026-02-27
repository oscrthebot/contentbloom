/**
 * POST /api/wordpress/publish
 * Publishes an article to a WordPress site using stored credentials.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";
import { publishToWordPress } from "../../../../lib/wordpress-publisher";
import { marked } from "marked";
import { Id } from "../../../../convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const convex = getConvexClient();
    const user = await convex.query(api.auth.validateSession, { sessionToken });
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { articleId, status = "draft" } = await req.json();
    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    // Get the article
    const result = await convex.query(api.userArticles.getForUser, {
      sessionToken,
      articleId: articleId as Id<"articles">,
    });

    if ("error" in result || !result.article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const article = result.article;

    // Find WordPress credentials from user's stores
    // (stored in stores table with platform=wordpress)
    // For now, check the first WordPress store
    let wpCreds: { siteUrl: string; username: string; applicationPassword: string } | null = null;

    try {
      const stores = await convex.query(api.stores.getByUser, { userId: user._id });
      const wpStore = (stores as any[]).find((s: any) => s.platform === 'wordpress' && s.wordpressSiteUrl);
      if (wpStore) {
        wpCreds = {
          siteUrl: wpStore.wordpressSiteUrl,
          username: wpStore.wordpressUsername,
          applicationPassword: wpStore.wordpressAppPassword,
        };
      }
    } catch {
      // Fall through
    }

    if (!wpCreds) {
      return NextResponse.json(
        { error: "No WordPress site connected. Please add your WordPress credentials in Settings." },
        { status: 400 }
      );
    }

    // Convert markdown to HTML
    const contentHtml = marked.parse(article.content) as string;

    const publishResult = await publishToWordPress(
      {
        title: article.title,
        contentHtml,
        metaDescription: article.metaDescription,
        tags: article.secondaryKeywords?.slice(0, 5) ?? [],
        featuredImageUrl: article.productBanners?.[0]?.imageUrl,
        status: status as "draft" | "publish",
      },
      wpCreds
    );

    if (!publishResult.success) {
      return NextResponse.json({ error: publishResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      postId: publishResult.postId,
      postUrl: publishResult.postUrl,
      editUrl: publishResult.editUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
