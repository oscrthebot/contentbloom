"use client";
import { Check, FileText, TrendingUp, Zap, RefreshCw } from "lucide-react";

function ArticleCard() {
  return (
    <div className="card" style={{ padding: "28px", height: "100%" }}>
      <p className="label" style={{ marginBottom: 12 }}>✦ Today&apos;s article</p>
      <p style={{ fontWeight: 600, fontSize: 15, color: "var(--t1)", marginBottom: 4, lineHeight: 1.4 }}>
        How to Choose Running Shoes for Marathon Training
      </p>
      <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 20 }}>Published to your Shopify blog · 3 min ago</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {["Introduction & hook", "Section 1: Foot type analysis", "Section 2: Cushioning guide", "Section 3: Top 5 picks", "Buying guide & CTA"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--t2)" }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--t3)" }}>1,340 words</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>SEO Score: 97</span>
        <span style={{ fontSize: 12, color: "var(--t3)" }}>Keyword density: 1.8%</span>
      </div>
    </div>
  );
}

const BENEFITS = [
  { icon: <FileText size={18} />, title: "Daily fresh content", desc: "A new long-form SEO article lands on your blog every morning — automatically. No action needed from you." },
  { icon: <TrendingUp size={18} />, title: "Built to rank on Google", desc: "Every article is keyword-researched, E-E-A-T optimized, and structured to climb search results." },
  { icon: <Zap size={18} />, title: "Publishes to Shopify automatically", desc: "Articles go live with proper titles, meta descriptions, tags, and categories — without touching your admin." },
  { icon: <RefreshCw size={18} />, title: "Revisions included", desc: "Not happy with an article? Send it back and we'll rewrite it until it's exactly what you want." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-warm section-divider">
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="label" style={{ marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--t1)" }}>
            Everything you need to<br />grow organic traffic
          </h2>
        </div>

        {/* Main 2-col: copy + mockup */}
        <div className="grid-2" style={{ marginBottom: "4rem", alignItems: "start" }}>
          <div>
            <p className="label" style={{ marginBottom: 12 }}>Content automation</p>
            <h3 style={{ fontSize: "clamp(26px,3vw,38px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 16 }}>
              AI articles on autopilot
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--t2)", marginBottom: 32 }}>
              Every morning, a new SEO-optimized article lands on your Shopify blog.
              Written by AI trained on high-ranking e-commerce content — no fluff, no filler.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Keyword research done automatically for every article",
                "Optimized for Google's E-E-A-T guidelines",
                "Published directly to your Shopify blog via API",
                "Revisions included — send it back if you want changes",
              ].map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "var(--t1)" }}>
                  <Check size={15} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="afloat">
            <ArticleCard />
          </div>
        </div>

        {/* Shopify Coming Soon card */}
        <div className="card" style={{ padding: "28px 32px", marginBottom: "2rem", display: "flex", alignItems: "center", gap: 20, background: "rgba(149,191,71,.06)", border: "1px solid rgba(149,191,71,.25)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://cdn.simpleicons.org/shopify/95bf47" alt="Shopify" width={40} height={40} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>Publish automatically to Shopify</h4>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", background: "#95bf47", color: "#fff", padding: "2px 8px", borderRadius: 100 }}>Coming Soon</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
              One-click connection. Every article goes live on your Shopify blog with proper tags, meta descriptions, and internal links — no manual publishing, ever.
            </p>
          </div>
        </div>

        {/* 4 benefit cards */}
        <div className="grid-4">
          {BENEFITS.map((b, i) => (
            <div key={i} className="card" style={{ padding: "28px 24px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-lt)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {b.icon}
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>{b.title}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--t2)" }}>{b.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
