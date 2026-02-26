import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("cb_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { articleId, feedback } = await req.json();

    if (!articleId || !feedback || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "Article ID and feedback are required" },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Validate session and get user
    const user = await convex.query(api.auth.validateSession, { sessionToken });
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Request revision through the articles mutation
    const result = await convex.mutation(api.articles.requestRevision, {
      articleId: articleId as Id<"articles">,
      feedback: feedback.trim(),
      userId: user._id,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revision request error:", error);
    return NextResponse.json(
      { error: "Failed to submit revision request" },
      { status: 500 }
    );
  }
}
