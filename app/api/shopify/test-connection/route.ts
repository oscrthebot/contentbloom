import { NextRequest, NextResponse } from "next/server";
import { testShopifyConnection } from "../../../../lib/shopify-publish";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeDomain, accessToken } = body;

    if (!storeDomain || !accessToken) {
      return NextResponse.json(
        { error: "storeDomain and accessToken are required" },
        { status: 400 }
      );
    }

    const result = await testShopifyConnection({ storeDomain, accessToken });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
