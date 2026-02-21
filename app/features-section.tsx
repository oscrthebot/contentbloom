"use client";
import { useState } from "react";
import { Check } from "lucide-react";

const tabs = [
  { id: "content", label: "AI Content" },
  { id: "shopify", label: "Shopify" },
  { id: "outreach", label: "Outreach" },
];

function ArticleCard() {
  return (
    <div className="card p-6">
      <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{color:"var(--accent)"}}>✦ Today&apos;s article</div>
      <div className="text-sm font-semibold mb-1 leading-snug" style={{color:"var(--text-1)"}}>
        How to Choose Running Shoes for Marathon Training
      </div>
      <div className="text-xs mb-4" style={{color:"var(--text-3)"}}>Published to your Shopify blog · 3 min ago</div>
      <div className="space-y-2.5 mb-5">
        {["Introduction & hook", "Section 1: Foot type analysis", "Section 2: Cushioning guide", "Section 3: Top 5 picks", "Buying guide & CTA"].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs" style={{color:"var(--text-2)"}}>
            <Check size={10} style={{color:"var(--accent)", flexShrink:0}} />
            {s}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4" style={{borderTop:"1px solid var(--border)"}}>
        <span className="text-xs" style={{color:"var(--text-3)"}}>1,340 words</span>
        <span className="text-xs font-semibold" style={{color:"var(--accent)"}}>SEO Score: 97</span>
        <span className="text-xs" style={{color:"var(--text-3)"}}>Keyword density: 1.8%</span>
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
    <div className="card p-6">
      <div className="text-xs font-medium mb-4" style={{color:"var(--text-3)"}}>Shopify Admin → Blog posts</div>
      <div className="space-y-2">
        {posts.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
            <div>
              <div className="text-sm font-medium" style={{color:"var(--text-1)"}}>{p.title}</div>
              <div className="text-xs mt-0.5" style={{color:"var(--text-3)"}}>{p.date}</div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{color:"var(--accent)", background:"var(--accent-lt)"}}>
              Published
            </span>
          </div>
        ))}
      </div>
      <div className="text-xs text-center mt-4" style={{color:"var(--text-3)"}}>+ 83 more articles this quarter</div>
    </div>
  );
}

function OutreachCard() {
  return (
    <div className="card p-6">
      <div className="text-xs font-medium mb-4" style={{color:"var(--text-3)"}}>Outreach email — sent by ContentBloom</div>
      <div className="rounded-xl p-4 text-xs space-y-3" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
        <div className="flex gap-3">
          <span style={{color:"var(--text-3)", width:40}}>To:</span>
          <span style={{color:"var(--text-1)"}}>hello@yourbrand.com</span>
        </div>
        <div className="flex gap-3">
          <span style={{color:"var(--text-3)", width:40, flexShrink:0}}>Subject:</span>
          <span className="font-semibold" style={{color:"var(--text-1)"}}>Your store + 2 free articles (no catch)</span>
        </div>
        <div style={{borderTop:"1px solid var(--border)"}} className="pt-3">
          <p className="leading-relaxed" style={{color:"var(--text-2)"}}>
            Hi Sarah,<br /><br />
            I noticed your Shopify store has no blog. That&apos;s leaving serious organic traffic on the table.<br /><br />
            We wrote 2 free SEO articles for your niche — no strings attached 👇
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <span className="px-2 py-0.5 rounded-full font-medium" style={{color:"var(--accent)", background:"var(--accent-lt)"}}>Sent ✓</span>
          <span style={{color:"var(--text-3)"}}>Opened · 3 hours ago</span>
        </div>
      </div>
    </div>
  );
}

const content: Record<string, {label:string; title:string; desc:string; bullets:string[]; card:React.ReactNode}> = {
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
    desc: "Not a customer yet? We find your store, write 2 free sample articles, and send them to you. No strings attached — just proof that it works.",
    bullets: ["We identify stores with little or no blog content", "2 custom articles written for your specific niche", "Sent directly to your email — yours to keep forever", "Subscribe only if you love the results"],
    card: <OutreachCard />,
  },
};

export function FeaturesSection() {
  const [active, setActive] = useState("content");
  const t = content[active];
  return (
    <section id="features" className="py-28 px-6" style={{background:"var(--bg-warm)"}}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="sec-label mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{color:"var(--text-1)", lineHeight:1.1}}>
            Everything you need to<br />grow organic traffic
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-1.5 mb-12 p-1 rounded-xl w-fit mx-auto" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
          {tabs.map(tab => (
            <button key={tab.id} className={`tab ${active===tab.id?"on":""}`} onClick={()=>setActive(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="sec-label mb-3">{t.label}</p>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{color:"var(--text-1)", lineHeight:1.15}}>{t.title}</h3>
            <p className="text-base leading-relaxed mb-8" style={{color:"var(--text-2)"}}>{t.desc}</p>
            <ul className="space-y-3.5">
              {t.bullets.map((b,i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{color:"var(--text-1)"}}>
                  <Check size={15} style={{color:"var(--accent)", marginTop:2, flexShrink:0}} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="float">{t.card}</div>
        </div>
      </div>
    </section>
  );
}
