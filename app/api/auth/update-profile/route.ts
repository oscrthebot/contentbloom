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
    const { name, storeName, storeUrl, niche } = body;

    // Build authorProfile if any fields are provided
    let authorProfile: {
      fullName: string;
      bio: string;
      yearsExperience: number;
      niche: string;
      linkedinUrl?: string;
      twitterUrl?: string;
      credentials?: string;
    } | undefined;

    if (body.authorProfile) {
      authorProfile = {
        fullName: body.authorProfile.fullName ?? "",
        bio: body.authorProfile.bio ?? "",
        yearsExperience: Number(body.authorProfile.yearsExperience) || 0,
        niche: body.authorProfile.niche ?? niche ?? "",
        linkedinUrl: body.authorProfile.linkedinUrl || undefined,
        twitterUrl: body.authorProfile.twitterUrl || undefined,
        credentials: body.authorProfile.credentials || undefined,
      };
    }

    await convex.mutation(api.users.updateProfile, {
      userId: user._id,
      name,
      storeName,
      storeUrl,
      niche,
      ...(authorProfile ? { authorProfile } : {}),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
