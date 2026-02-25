import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";
import { runArticlePipeline } from "../../../../generator/pipeline-runner";
import { Id } from "../../../../convex/_generated/dataModel";

export const maxDuration = 300; // 5 min — requires Vercel Pro

/**
 * POST /api/articles/run-pipeline
 * Runs the full article generation pipeline for a given placeholder article.
 * Called fire-and-forget from /api/articles/generate.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, clientId, storeName, storeUrl, niche, userId } = body;

    if (!articleId || !clientId || !storeName || !storeUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const convex = getConvexClient();

    // Run the full pipeline
    const result = await runArticlePipeline({
      storeName,
      storeUrl,
      niche: niche || "general",
      language: "en",
      articleType: "guide",
      wordCount: 1500,
      clientId,
      userId,
    });

    if (!result.success || !result.article) {
      // Mark article as failed — reset to queued so it can retry
      await convex.mutation(api.articles.updateArticleStatus, {
        id: articleId as Id<"articles">,
        status: "queued",
      });
      return NextResponse.json({ error: "Pipeline failed" }, { status: 500 });
    }

    const { article } = result;

    // Update the placeholder with real content
    await convex.mutation(api.userArticles.updateGeneratedArticle, {
      id: articleId as Id<"articles">,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Run pipeline error:", error);
    return NextResponse.json({ error: "Pipeline error" }, { status: 500 });
  }
}
