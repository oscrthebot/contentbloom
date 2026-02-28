"use client";

export interface Banner {
  type: "product" | "newsletter" | "cta" | "pricing";
  insertAfterHeading: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl?: string;
  price?: string;
  badge?: string;
}

export function BannerCard({ banner }: { banner: Banner }) {
  const isDark = banner.type === "cta";

  if (isDark) {
    // Dark CTA variant — full-width dark card
    return (
      <a
        href={banner.ctaUrl}
        target={banner.ctaUrl.startsWith("mailto") ? "_self" : "_blank"}
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          margin: "28px 0",
          padding: "20px 24px",
          background: "#1a1615",
          borderRadius: 16,
          textDecoration: "none",
          transition: "opacity .15s",
          cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      >
        <div>
          {banner.badge && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 6, display: "block" }}>
              {banner.badge}
            </span>
          )}
          <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>{banner.title}</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>{banner.description}</p>
        </div>
        <div style={{
          flexShrink: 0,
          padding: "10px 20px",
          borderRadius: 100,
          background: "#fff",
          color: "#1a1615",
          fontSize: 14,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}>
          {banner.ctaText} →
        </div>
      </a>
    );
  }

  // Product / pricing variant — matches the example screenshot
  return (
    <a
      href={banner.ctaUrl}
      target={banner.ctaUrl.startsWith("mailto") ? "_self" : "_blank"}
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "20px 0",
        padding: "16px 20px",
        background: "#fff",
        border: "1px solid rgb(230,228,226)",
        borderRadius: 16,
        textDecoration: "none",
        boxShadow: "0 1px 8px rgba(0,0,0,.06)",
        transition: "box-shadow .15s, transform .15s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,.10)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 8px rgba(0,0,0,.06)";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      {/* Product image */}
      {banner.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt={banner.title}
          style={{
            width: 60,
            height: 60,
            borderRadius: 12,
            objectFit: "cover",
            flexShrink: 0,
            background: "rgb(245,243,241)",
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badge + price row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
          {banner.badge && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".07em",
              textTransform: "uppercase",
              color: "#16a34a",
              background: "rgba(22,163,74,.10)",
              padding: "2px 8px",
              borderRadius: 100,
            }}>
              {banner.badge}
            </span>
          )}
          {banner.price && (
            <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
              {banner.price}
            </span>
          )}
        </div>

        {/* Title */}
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1615", marginBottom: 3, lineHeight: 1.3 }}>
          {banner.title}
        </p>

        {/* Description */}
        <p style={{ fontSize: 13, color: "#757372", lineHeight: 1.5, margin: 0 }}>
          {banner.description}
        </p>
      </div>

      {/* CTA button — black pill like the example */}
      <div style={{
        flexShrink: 0,
        padding: "10px 18px",
        borderRadius: 100,
        background: "#1a1615",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}>
        {banner.ctaText} →
      </div>
    </a>
  );
}
