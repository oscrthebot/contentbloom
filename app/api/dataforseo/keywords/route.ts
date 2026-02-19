import { NextRequest, NextResponse } from "next/server";

/**
 * DataForSEO Keywords API Endpoint
 * 
 * Fetches keyword data for a given niche or product using DataForSEO API
 * 
 * POST /api/dataforseo/keywords
 * Body: { niche: string, location?: string, language?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, location = "United States", language = "en" } = body;

    if (!niche) {
      return NextResponse.json(
        { error: "Niche parameter is required" },
        { status: 400 }
      );
    }

    // Check for API credentials
    const username = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { error: "DataForSEO credentials not configured" },
        { status: 500 }
      );
    }

    // DataForSEO API endpoint for keyword suggestions
    const apiUrl = "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live";

    // Prepare request payload
    const payload = [
      {
        keyword: niche,
        location_name: location,
        language_name: language,
        limit: 50, // Get top 50 keyword suggestions
        include_seed_keyword: true,
        include_serp_info: true,
      },
    ];

    // Make request to DataForSEO
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract and format keywords
    const keywords = data.tasks?.[0]?.result?.[0]?.items?.map((item: any) => ({
      keyword: item.keyword,
      searchVolume: item.keyword_info?.search_volume || 0,
      competition: item.keyword_info?.competition || 0,
      cpc: item.keyword_info?.cpc || 0,
      difficulty: item.keyword_properties?.keyword_difficulty || 0,
    })) || [];

    return NextResponse.json({
      success: true,
      niche,
      location,
      language,
      keywords,
      totalResults: keywords.length,
    });

  } catch (error) {
    console.error("DataForSEO API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch keywords", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "DataForSEO Keywords API",
    status: "active",
    requiredEnv: ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"],
    configured: !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD),
  });
}
