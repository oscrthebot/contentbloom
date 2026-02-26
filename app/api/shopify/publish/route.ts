import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";
import { publishToShopify } from "../../../../lib/shopify-publish";
import { marked } from "marked";
import { Id } from "../../../../convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("cb_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const convex = getConvexClient();
    const user = await convex.query(api.auth.validateSession, { sessionToken });
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!user.shopifyDomain || !user.shopifyAccessToken) {
      return NextResponse.json(
        { error: "Shopify not connected. Please add your Shopify credentials in Settings." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { articleId } = body;

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

    // Already published?
    if (article.shopifyArticleId) {
      return NextResponse.json({
        success: true,
        alreadyPublished: true,
        shopifyArticleId: article.shopifyArticleId,
        shopifyPublishedAt: article.shopifyPublishedAt,
      });
    }

    // Convert markdown → HTML if needed
    let contentHtml: string;
    if ((article as any).htmlContent) {
      contentHtml = (article as any).htmlContent;
    } else {
      contentHtml = await marked.parse(article.content || "");
    }

    // Build tags from keywords
    const tags = [
      article.targetKeyword,
      ...(article.secondaryKeywords || []),
    ].slice(0, 10);

    const authorName =
      user.authorProfile?.fullName ||
      user.name ||
      user.email.split("@")[0];

    // Publish to Shopify
    const publishResult = await publishToShopify({
      storeDomain: user.shopifyDomain,
      accessToken: user.shopifyAccessToken,
      title: article.title,
      contentHtml,
      metaDescription: article.metaDescription || "",
      tags,
      authorName,
    });

    if (!publishResult.success) {
      return NextResponse.json({ error: publishResult.error }, { status: 500 });
    }

    // Save publish status to Convex
    await convex.mutation(api.articles.markShopifyPublished, {
      articleId: articleId as Id<"articles">,
      shopifyArticleId: publishResult.shopifyArticleId!,
      shopifyPublishedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      shopifyArticleId: publishResult.shopifyArticleId,
      shopifyArticleUrl: publishResult.shopifyArticleUrl,
    });
  } catch (error) {
    console.error("Shopify publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish" },
      { status: 500 }
    );
  }
}
