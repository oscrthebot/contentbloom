/**
 * POST /api/wordpress/verify
 * Verifies a WordPress Application Password connection.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyWordPressConnection } from "../../../lib/wordpress-publisher";

export async function POST(req: NextRequest) {
  try {
    const { siteUrl, username, applicationPassword } = await req.json();

    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: "siteUrl, username, and applicationPassword are required" },
        { status: 400 }
      );
    }

    const result = await verifyWordPressConnection({ siteUrl, username, applicationPassword });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      displayName: result.displayName,
      siteTitle: result.siteTitle,
      siteUrl: result.siteUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
