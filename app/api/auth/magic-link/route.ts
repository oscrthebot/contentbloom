import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { sendMagicLinkEmail, sendOnboardingEmail } from "../../../../lib/emails";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, plan } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose required" }, { status: 400 });
    }

    const convex = getConvexClient();
    const result = await convex.mutation(api.auth.generateMagicLink, {
      email,
      purpose: purpose as "login" | "onboarding",
      plan,
    });

    if (purpose === "onboarding" && plan) {
      await sendOnboardingEmail(email, result.token, plan);
    } else {
      await sendMagicLinkEmail(email, result.token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
  }
}
