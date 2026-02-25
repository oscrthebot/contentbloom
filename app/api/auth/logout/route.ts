import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("cb_session")?.value;
  if (sessionToken) {
    try {
      const convex = getConvexClient();
      await convex.mutation(api.auth.logout, { sessionToken });
    } catch (e) {
      console.error("Logout error:", e);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("cb_session", "", { maxAge: 0, path: "/" });
  return response;
}
