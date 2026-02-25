import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { cookies } from "next/headers";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";
import { runArticlePipeline } from "../../../../generator/pipeline-runner";
import { Id } from "../../../../convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("cb_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convex = getConvexClient();

    // Validate session and get user
    const user = await convex.query(api.auth.validateSession, { sessionToken });
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { storeName, storeUrl, niche, plan = "trial" } = body;

    if (!storeName || typeof storeName !== "string") {
      return NextResponse.json({ error: "storeName is required" }, { status: 400 });
    }
    if (!storeUrl || typeof storeUrl !== "string") {
      return NextResponse.json({ error: "storeUrl is required" }, { status: 400 });
    }

    // Create the store
    const result = await convex.mutation(api.stores.createStore, {
      userId: user._id,
      storeName,
      storeUrl,
      niche: niche || undefined,
      plan: (["trial", "starter", "growth", "scale"].includes(plan) ? plan : "trial") as
        | "trial"
        | "starter"
        | "growth"
        | "scale",
    });

    // Update user primary profile if first store
    if (result.isFirstStore) {
      await convex.mutation(api.users.updateProfile, {
        userId: user._id,
        storeName,
        storeUrl,
        niche: niche || undefined,
      });
    }

    // Create the queued placeholder — shows animated loading state in dashboard immediately
    let articleId: Id<"articles"> | null = null;
    try {
      let clientId = user.clientId;
      if (!clientId) {
        clientId = await convex.mutation(api.userArticles.ensureClientRecord, {
          userId: user._id,
          storeName,
          storeUrl,
          niche: niche || "general",
          email: user.email,
        });
      }
      articleId = await convex.mutation(api.userArticles.createPlaceholder, {
        clientId,
        niche: niche || "general",
        storeName,
      });

      // Run the pipeline AFTER the response is sent using Next.js after()
      // This is non-blocking: the user gets redirected to /dashboard immediately
      // while generation runs in the background (works on Vercel Hobby)
      const capturedClientId = clientId;
      const capturedArticleId = articleId;
      after(async () => {
        try {
          await convex.mutation(api.articles.updateArticleStatus, {
            id: capturedArticleId,
            status: "generating",
          });

          const pipeline = await runArticlePipeline({
            storeName,
            storeUrl,
            niche: niche || "general",
            language: "en",
            articleType: "guide",
            wordCount: 1500,
            clientId: capturedClientId as string,
          });

          if (pipeline.success && pipeline.article) {
            const { article } = pipeline;
            await convex.mutation(api.userArticles.updateGeneratedArticle, {
              id: capturedArticleId,
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
          } else {
            // Requeue on failure
            await convex.mutation(api.articles.updateArticleStatus, {
              id: capturedArticleId,
              status: "queued",
            });
          }
        } catch {
          // Requeue on error — daily cron will pick it up
          if (capturedArticleId) {
            await convex.mutation(api.articles.updateArticleStatus, {
              id: capturedArticleId,
              status: "queued",
            }).catch(() => {});
          }
        }
      });
    } catch {
      // Non-blocking — daily cron will handle generation
    }

    return NextResponse.json({
      success: true,
      storeId: result.storeId,
      isFirstStore: result.isFirstStore,
      discountMultiplier: result.discountMultiplier,
      storeIndex: result.storeIndex,
      articleQueued: !!articleId,
    });
  } catch (error) {
    console.error("Store create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
