import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../lib/convex";
import { api } from "../../../convex/_generated/api";
import { runArticlePipeline } from "../../../generator/pipeline-runner";
import { after } from "next/server";

/**
 * Generate a demo article for cold outreach preview
 * POST /api/demo/generate
 * Body: { storeName, storeUrl, niche, email }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeName, storeUrl, niche, email } = body;

    if (!storeName || !storeUrl || !niche) {
      return NextResponse.json(
        { error: "Missing required fields: storeName, storeUrl, niche" },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Create or get demo user
    let user = await convex.query(api.users.getByEmail, { email: email || "demo@example.com" });
    
    if (!user) {
      user = await convex.mutation(api.users.createDemoUser, {
        email: email || "demo@example.com",
        storeName,
        storeUrl,
        niche,
      });
    }

    // Create demo store
    const store = await convex.mutation(api.stores.createDemoStore, {
      userId: user._id,
      storeName,
      storeUrl,
      niche,
    });

    // Create placeholder article
    const articleId = await convex.mutation(api.userArticles.createPlaceholder, {
      clientId: store.clientId,
      niche,
      storeName,
    });

    // Generate article in background
    after(async () => {
      try {
        await runArticlePipeline({
          storeName,
          storeUrl,
          niche,
          language: "en",
          articleType: "guide",
          wordCount: 1500,
          clientId: store.clientId,
          userId: user._id,
          targetKeyword: `best ${niche} tips`,
        });
      } catch (err) {
        console.error("Demo article generation failed:", err);
      }
    });

    return NextResponse.json({
      success: true,
      articleId,
      previewUrl: `https://bloomcontent.site/p/${articleId}`,
      message: "Demo article is being generated. Preview will be available in 2-3 minutes.",
    });

  } catch (error) {
    console.error("Demo generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate demo article" },
      { status: 500 }
    );
  }
}
