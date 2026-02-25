import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";
import { runArticlePipeline } from "../../../../generator/pipeline-runner";
import { Id } from "../../../../convex/_generated/dataModel";

export const maxDuration = 300;

/**
 * GET /api/articles/process-queue
 * Called by Vercel cron every 10 minutes.
 * Picks the oldest queued article, runs the pipeline, updates Convex.
 */
export async function GET(req: NextRequest) {
  // Verify it's a cron call (Vercel sets this header)
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convex = getConvexClient();

  // Get the oldest queued article
  const queued = await convex.query(api.userArticles.getNextQueued, {});
  if (!queued) {
    return NextResponse.json({ message: "No queued articles" });
  }

  // Mark as generating so we don't double-process
  await convex.mutation(api.articles.updateArticleStatus, {
    id: queued.articleId as Id<"articles">,
    status: "generating",
  });

  try {
    const result = await runArticlePipeline({
      storeName: queued.storeName,
      storeUrl: queued.storeUrl,
      niche: queued.niche || "general",
      language: "en",
      articleType: "guide",
      wordCount: 1500,
      clientId: queued.clientId,
      userId: queued.userId,
    });

    if (!result.success || !result.article) {
      // Requeue on failure
      await convex.mutation(api.articles.updateArticleStatus, {
        id: queued.articleId as Id<"articles">,
        status: "queued",
      });
      return NextResponse.json({ error: "Pipeline failed", details: result.error }, { status: 500 });
    }

    const { article } = result;

    await convex.mutation(api.userArticles.updateGeneratedArticle, {
      id: queued.articleId as Id<"articles">,
      title: article.title,
      slug: article.slug,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      content: article.content,
      rawContent: article.rawContent ?? undefined,
      targetKeyword: article.targetKeyword,
      secondaryKeywords: article.secondaryKeywords,
      wordCount: article.wordCount,
      readingTime: article.readingTime,
      schemaMarkup: article.schemaMarkup ? JSON.stringify(article.schemaMarkup) : undefined,
      faqItems: article.faqItems ?? [],
      qaScore: article.qaScore ?? undefined,
      qaIssues: article.qaIssues ?? undefined,
      status: "review",
    });

    return NextResponse.json({ success: true, title: article.title });
  } catch (error) {
    await convex.mutation(api.articles.updateArticleStatus, {
      id: queued.articleId as Id<"articles">,
      status: "queued",
    });
    console.error("Process queue error:", error);
    return NextResponse.json({ error: "Pipeline error" }, { status: 500 });
  }
}
