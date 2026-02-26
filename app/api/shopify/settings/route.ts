import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";

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

    const body = await req.json();
    const { shopifyDomain, shopifyAccessToken, shopifyAutoPublish } = body;

    // If both fields are empty, treat as disconnect
    const isDisconnecting = shopifyDomain === "" && shopifyAccessToken === "";
    if (isDisconnecting) {
      await convex.mutation(api.users.clearShopifySettings, { userId: user._id });
    } else {
      const updates: {
        userId: typeof user._id;
        shopifyDomain?: string;
        shopifyAccessToken?: string;
        shopifyAutoPublish?: boolean;
      } = { userId: user._id };

      if (shopifyDomain !== undefined && shopifyDomain !== "") {
        updates.shopifyDomain = shopifyDomain;
      }
      if (shopifyAccessToken !== undefined && shopifyAccessToken !== "") {
        updates.shopifyAccessToken = shopifyAccessToken;
      }
      if (shopifyAutoPublish !== undefined) {
        updates.shopifyAutoPublish = Boolean(shopifyAutoPublish);
      }

      await convex.mutation(api.users.updateShopifySettings, updates);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shopify settings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 }
    );
  }
}
