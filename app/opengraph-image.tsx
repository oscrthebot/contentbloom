import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BloomContent — AI Blog Content for Shopify Stores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #15803d 100%)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo / Icon */}
        <div
          style={{
            fontSize: "96px",
            marginBottom: "32px",
            display: "flex",
          }}
        >
          🌸
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "#ffffff",
            letterSpacing: "-2px",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          BloomContent
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "32px",
            color: "#bbf7d0",
            textAlign: "center",
            maxWidth: "800px",
            display: "flex",
          }}
        >
          AI blog content for Shopify stores
        </div>

        {/* Tag line */}
        <div
          style={{
            marginTop: "32px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "40px",
            padding: "12px 32px",
            fontSize: "24px",
            color: "#dcfce7",
            display: "flex",
          }}
        >
          Starting at €49/month
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
