"use client";
import { useState } from "react";
import { Check } from "lucide-react";

const TABS = [
  { id: "content",  label: "AI Content" },
  { id: "shopify",  label: "Shopify" },
  { id: "outreach", label: "Outreach" },
];

function ArticleCard() {
  return (
    <div className="card" style={{ padding: "28px" }}>
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

function ShopifyCard() {
  return (
    <div className="card" style={{ padding: "28px" }}>
      <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 16, fontWeight: 500 }}>Shopify Admin → Blog posts</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {[
          { title: "Best yoga mats 2026", date: "Today" },
          { title: "Home gym setup guide", date: "Yesterday" },
          { title: "Protein powder comparison", date: "2 days ago" },
          { title: "Recovery tools review", date: "3 days ago" },
        ].map((p, i) => (
          <div key={i} className="card-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)" }}>{p.title}</p>
              <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{p.date}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "var(--accent-lt)", padding: "3px 10px", borderRadius: 100 }}>Published</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--t3)", textAlign: "center" }}>+ 83 more articles this quarter</p>
    </div>
  );
}

function OutreachCard() {
  return (
    <div className="card" style={{ padding: "28px" }}>
      <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 16, fontWeight: 500 }}>Outreach email — sent by ContentBloom</p>
      <div className="card-inner" style={{ padding: "18px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 13 }}>
          <span style={{ color: "var(--t3)", minWidth: 50 }}>To:</span>
          <span style={{ color: "var(--t1)" }}>hello@yourbrand.com</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 13 }}>
          <span style={{ color: "var(--t3)", minWidth: 50, flexShrink: 0 }}>Subject:</span>
          <span style={{ color: "var(--t1)", fontWeight: 600 }}>Your store + 2 free articles (no catch)</span>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>
            Hi Sarah,<br /><br />
            I noticed your Shopify store has no blog. That&apos;s leaving serious organic traffic on the table.<br /><br />
            We wrote 2 free SEO articles for your niche — no strings attached 👇
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "var(--accent-lt)", padding: "3px 10px", borderRadius: 100 }}>Sent ✓</span>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>Opened · 3 hours ago</span>
        </div>
      </div>
    </div>
  );
}

const DATA: Record<string, { label: string; title: string; desc: string; bullets: string[]; card: React.ReactNode }> = {
  content: {
    label: "Content automation",
    title: "AI articles on autopilot",
    desc: "Every morning, a new SEO-optimized article lands on your Shopify blog. Written by AI trained on high-ranking e-commerce content — no fluff, no filler.",
    bullets: ["Keyword research done automatically with DataForSEO", "Articles optimized for Google's E-E-A-T guidelines", "Published directly to your Shopify blog via API", "Revisions included — send it back if you want changes"],
    card: <ArticleCard />,
  },
  shopify: {
    label: "Shopify integration",
    title: "Built for Shopify stores",
    desc: "Connect once, publish forever. ContentBloom integrates directly with your Shopify blog so every article goes live without you lifting a finger.",
    bullets: ["One-click Shopify store connection", "Auto-publishes with tags, categories & meta descriptions", "Works with every Shopify theme and plan", "Full dashboard to review published content"],
    card: <ShopifyCard />,
  },
  outreach: {
    label: "Done-for-you outreach",
    title: "We do the outreach too",
    desc: "Not a customer yet? We find your store, write 2 free sample articles, and send them to you. No strings attached — just proof it works.",
    bullets: ["We identify stores with little or no blog content", "2 custom articles written for your specific niche", "Sent directly to your email — yours to keep forever", "Subscribe only if you love the results"],
    card: <OutreachCard />,
  },
};

export function FeaturesSection() {
  const [active, setActive] = useState("content");
  const t = DATA[active];
  return (
    <section id="features" className="section-warm section-divider">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p className="label" style={{ marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--t1)" }}>
            Everything you need to<br />grow organic traffic
          </h2>
        </div>

        {/* Tabs */}
        <div className="tabs-wrap">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab ${active === tab.id ? "on" : ""}`} onClick={() => setActive(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid-2">
          <div>
            <p className="label" style={{ marginBottom: 12 }}>{t.label}</p>
            <h3 style={{ fontSize: "clamp(26px,3vw,38px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 16 }}>{t.title}</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--t2)", marginBottom: 32 }}>{t.desc}</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {t.bullets.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "var(--t1)" }}>
                  <Check size={15} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="afloat">{t.card}</div>
        </div>
      </div>
    </section>
  );
}
