"use client";
import { useState } from "react";
import { Check } from "lucide-react";

type Tab = { id: string; label: string };

const tabs: Tab[] = [
  { id: "content", label: "AI Content" },
  { id: "shopify", label: "Shopify" },
  { id: "outreach", label: "Outreach" },
];

function ArticleCard() {
  return (
    <div className="card p-6 w-full">
      <div className="text-[11px] font-semibold text-green-500 uppercase tracking-widest mb-3">✦ Today&apos;s article</div>
      <div className="text-sm font-semibold mb-1 leading-snug">
        How to Choose the Right Running Shoes for Marathon Training
      </div>
      <div className="text-xs text-zinc-500 mb-4">Published to your Shopify blog · 3 min ago</div>
      <div className="space-y-2 mb-5">
        {["Introduction & hook", "Section 1: Foot type analysis", "Section 2: Cushioning guide", "Section 3: Top 5 picks", "Buying guide & CTA"].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
            <Check size={10} className="text-green-500 shrink-0" />
            {s}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-zinc-500">
        <span>1,340 words</span>
        <span className="text-green-500 font-medium">SEO Score: 97</span>
        <span>Keyword density: 1.8%</span>
      </div>
    </div>
  );
}

function ShopifyCard() {
  const posts = [
    { title: "Best yoga mats 2026", date: "Today" },
    { title: "Home gym setup guide", date: "Yesterday" },
    { title: "Protein powder comparison", date: "2 days ago" },
    { title: "Recovery tools review", date: "3 days ago" },
  ];
  return (
    <div className="card p-6 w-full">
      <div className="text-xs text-zinc-500 mb-4 font-medium">Shopify Admin → Blog posts</div>
      <div className="space-y-2">
        {posts.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-4 py-3">
            <div>
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{p.date}</div>
            </div>
            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">Published</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-zinc-600 text-center">+ 83 more articles this quarter</div>
    </div>
  );
}

function OutreachCard() {
  return (
    <div className="card p-6 w-full">
      <div className="text-xs text-zinc-500 mb-4 font-medium">Outreach email — sent by ContentBloom</div>
      <div className="bg-zinc-900/60 rounded-xl p-4 text-xs space-y-3">
        <div className="flex gap-3"><span className="text-zinc-600 w-10">To:</span><span>hello@yourbrand.com</span></div>
        <div className="flex gap-3"><span className="text-zinc-600 w-10 shrink-0">Subject:</span><span className="font-medium">Your store + 2 free articles (no catch)</span></div>
        <hr className="border-white/5" />
        <p className="text-zinc-400 leading-relaxed">
          Hi Sarah,<br /><br />
          I noticed your Shopify store has a great product selection but no blog. That&apos;s leaving serious organic traffic on the table.<br /><br />
          We wrote 2 free SEO articles for your niche — no strings attached. Check them out 👇
        </p>
        <div className="flex gap-2 pt-1">
          <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Sent ✓</span>
          <span className="text-zinc-600">Opened · 3 hours ago</span>
        </div>
      </div>
    </div>
  );
}

const tabContent: Record<string, { label: string; title: string; desc: string; bullets: string[]; card: React.ReactNode }> = {
  content: {
    label: "Content automation",
    title: "AI articles on autopilot",
    desc: "Every morning, a new SEO-optimized article lands on your Shopify blog. Written by AI trained on high-ranking e-commerce content — no fluff, no filler.",
    bullets: [
      "Keyword research done automatically with DataForSEO",
      "Articles optimized for Google's E-E-A-T guidelines",
      "Published directly to your Shopify blog via API",
      "Revisions included — send it back if you want changes",
    ],
    card: <ArticleCard />,
  },
  shopify: {
    label: "Shopify integration",
    title: "Built for Shopify stores",
    desc: "Connect once, publish forever. ContentBloom integrates directly with your Shopify blog so every article goes live without you lifting a finger.",
    bullets: [
      "One-click Shopify store connection",
      "Auto-publishes with tags, categories & meta descriptions",
      "Works with every Shopify theme and plan",
      "Full dashboard to review published content",
    ],
    card: <ShopifyCard />,
  },
  outreach: {
    label: "Done-for-you outreach",
    title: "We do the outreach too",
    desc: "Not a customer yet? We find your store, write 2 free sample articles, and send them to you. No strings attached — just proof it works.",
    bullets: [
      "We identify stores with little or no blog content",
      "2 custom articles written for your specific niche",
      "Sent directly to your email — yours to keep forever",
      "Subscribe only if you love the results",
    ],
    card: <OutreachCard />,
  },
};

export function FeaturesSection() {
  const [active, setActive] = useState("content");
  const t = tabContent[active];

  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="badge mb-4">Features</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Everything you need to<br className="hidden md:block" /> grow organic traffic
          </h2>
        </div>

        {/* Tab pills */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-pill ${active === tab.id ? "active" : ""}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left: text */}
          <div>
            <div className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-4">{t.label}</div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">{t.title}</h3>
            <p className="text-zinc-400 leading-relaxed mb-8 text-base">{t.desc}</p>
            <ul className="space-y-4">
              {t.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          {/* Right: card */}
          <div className="float">{t.card}</div>
        </div>
      </div>
    </section>
  );
}
