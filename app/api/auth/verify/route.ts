import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  try {
    const convex = getConvexClient();
    const result = await convex.mutation(api.auth.verifyMagicLink, { token });

    if ("error" in result) {
      return NextResponse.redirect(new URL(`/login?error=${result.error}`, req.url));
    }

    const redirectPath =
      result.isNewUser
        ? `/onboard${result.onboardingPlan ? `?plan=${result.onboardingPlan}` : ""}`
        : "/dashboard";

    const response = NextResponse.redirect(new URL(redirectPath, req.url));
    response.cookies.set("cb_session", result.sessionToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.redirect(new URL("/login?error=verification_failed", req.url));
  }
}
