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

const ACCENT: Record<Banner["type"], { bg: string; border: string; badge: string; badgeText: string }> = {
  product:    { bg: "#fff",              border: "rgb(227,225,225)",  badge: "rgba(22,163,74,.10)",  badgeText: "#16a34a" },
  pricing:    { bg: "#fff",              border: "rgb(227,225,225)",  badge: "rgba(22,163,74,.10)",  badgeText: "#16a34a" },
  newsletter: { bg: "rgb(240,234,229)",  border: "rgb(210,208,208)",  badge: "rgba(0,0,0,.06)",      badgeText: "#757372" },
  cta:        { bg: "#1a1615",           border: "#1a1615",           badge: "rgba(255,255,255,.12)", badgeText: "#fff" },
};

export function BannerCard({ banner }: { banner: Banner }) {
  const c = ACCENT[banner.type];
  const isDark = banner.type === "cta";

  return (
    <a
      href={banner.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "24px 0",
        padding: "18px 20px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        textDecoration: "none",
        transition: "transform .15s, box-shadow .15s",
        boxShadow: "0 2px 12px rgba(0,0,0,.05)",
        cursor: "pointer",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,.05)"; }}
    >
      {/* Image or icon */}
      {banner.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt={banner.title}
          style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "rgb(240,234,229)" }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          {banner.badge && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", background: c.badge, color: isDark ? "#a3e635" : c.badgeText, padding: "2px 8px", borderRadius: 100 }}>
              {banner.badge}
            </span>
          )}
          {banner.price && (
            <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#fff" : "#16a34a" }}>
              {banner.price}
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#fff" : "#1a1615", marginBottom: 2, lineHeight: 1.3 }}>
          {banner.title}
        </p>
        <p style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,.65)" : "#757372", lineHeight: 1.5 }}>
          {banner.description}
        </p>
      </div>

      {/* CTA */}
      <div style={{
        flexShrink: 0,
        padding: "9px 16px",
        borderRadius: 100,
        background: isDark ? "rgba(255,255,255,.12)" : "#1a1615",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}>
        {banner.ctaText} →
      </div>
    </a>
  );
}
