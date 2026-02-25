import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";

/**
 * POST /api/articles/generate
 * Creates a placeholder "generating" article for the user,
 * then triggers the pipeline asynchronously.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("cb_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convex = getConvexClient();
    const user = await convex.query(api.auth.validateSession, { sessionToken });
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!user.storeName || !user.storeUrl) {
      return NextResponse.json({ error: "Store info required" }, { status: 400 });
    }

    // Ensure user has a client record (create one if not)
    let clientId = user.clientId;
    if (!clientId) {
      clientId = await convex.mutation(api.userArticles.ensureClientRecord, {
        userId: user._id,
        storeName: user.storeName,
        storeUrl: user.storeUrl,
        niche: user.niche || "general",
        email: user.email,
      });
    }

    // Create placeholder article with status "generating"
    const placeholderId = await convex.mutation(api.userArticles.createPlaceholder, {
      clientId,
      niche: user.niche || "general",
      storeName: user.storeName,
    });

    // Fire-and-forget: call the actual pipeline runner
    // We don't await this — it runs in the background
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bloomcontent.site";
    fetch(`${baseUrl}/api/articles/run-pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId: placeholderId,
        clientId,
        storeName: user.storeName,
        storeUrl: user.storeUrl,
        niche: user.niche || "general",
        userId: user._id,
      }),
    }).catch(() => {
      // Silent fail — pipeline will retry via cron
    });

    return NextResponse.json({ success: true, articleId: placeholderId });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
