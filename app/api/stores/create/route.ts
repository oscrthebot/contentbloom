import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";

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

    // Create the store (discount calculated server-side based on existing count)
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

    // If it's the first store, also update the user's primary profile fields
    if (result.isFirstStore) {
      await convex.mutation(api.users.updateProfile, {
        userId: user._id,
        storeName,
        storeUrl,
        niche: niche || undefined,
      });
    }

    // Trigger article generation asynchronously (fire and forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bloomcontent.site";
    fetch(`${baseUrl}/api/articles/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward session cookie so the generate endpoint can auth the user
        Cookie: `cb_session=${sessionToken}`,
      },
    }).catch(() => {
      // Silent fail — generation will be retried via cron
    });

    return NextResponse.json({
      success: true,
      storeId: result.storeId,
      isFirstStore: result.isFirstStore,
      discountMultiplier: result.discountMultiplier,
      storeIndex: result.storeIndex,
    });
  } catch (error) {
    console.error("Store create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
