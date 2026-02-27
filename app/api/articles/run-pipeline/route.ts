import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/articles/run-pipeline
 *
 * Delegates to the local pipeline server running on the OSCR machine
 * via Cloudflare tunnel (hooks.oscr.cool/pipeline/run).
 *
 * This avoids Vercel's 60s serverless timeout without needing Vercel Pro.
 * The pipeline server runs indefinitely on our own machine.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, clientId, storeName, storeUrl, niche, userId } = body;

    if (!articleId || !clientId || !storeName || !storeUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pipelineUrl = process.env.PIPELINE_SERVER_URL || "https://hooks.oscr.cool/pipeline/run";
    const pipelineSecret = process.env.PIPELINE_SECRET || "";

    // Fire-and-forget to our local pipeline server (no timeout issues)
    const pipelineRes = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${pipelineSecret}`,
      },
      body: JSON.stringify({ articleId, clientId, storeName, storeUrl, niche, userId }),
    });

    if (!pipelineRes.ok) {
      const err = await pipelineRes.text();
      console.error("Pipeline server error:", err);
      return NextResponse.json({ error: "Pipeline server unavailable" }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: "Pipeline started on pipeline server" });
  } catch (error) {
    console.error("Run pipeline error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
