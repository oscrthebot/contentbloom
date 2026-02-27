/**
 * POST /api/wordpress/save-credentials
 * Saves WordPress credentials to Convex after successful verification.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";

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

    const { siteUrl, username, applicationPassword } = await req.json();

    await convex.mutation(api.stores.saveWordPressCredentials, {
      userId: user._id,
      wordpressSiteUrl: siteUrl,
      wordpressUsername: username,
      wordpressAppPassword: applicationPassword,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
