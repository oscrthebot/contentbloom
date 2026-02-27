"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { marked, Renderer } from "marked";

interface ProductBanner {
  name: string;
  imageUrl?: string;
  price?: string;
  description?: string;
  url: string;
}

interface Article {
  _id: string;
  title: string;
  slug?: string;
  metaTitle?: string;
  metaDescription: string;
  content: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  wordCount: number;
  readingTime?: number;
  status: string;
  qaScore?: number;
  qaIssues?: string[];
  qaCriticalIssues?: string[];
  faqItems?: Array<{ question: string; answer: string }>;
  monthlyVolume?: number;
  storeName?: string;
  productBanners?: ProductBanner[];
  shopifyArticleId?: string;
  shopifyPublishedAt?: string;
  _creationTime?: number;
}

function formatArticleDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return `Today at ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  if (isYesterday) return `Yesterday at ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface ShopifyConfig {
  hasCredentials: boolean;
  shopifyDomain?: string;
}

interface Feedback {
  rating: string;
  comment?: string;
  submittedAt: number;
}

// ─── Product banner renderer ──────────────────────────────────────────────────
// Reuses the exact BannerCard design from cold outreach preview pages.

function buildProductMap(banners?: ProductBanner[]): Map<string, ProductBanner> {
  const map = new Map<string, ProductBanner>();
  if (!banners) return map;
  for (const b of banners) {
    map.set(b.name.toLowerCase().trim(), b);
    // Also index by URL handle: "moisturizer-spf-30" → "moisturizer spf 30"
    const handle = b.url.split("/").pop()?.replace(/-/g, " ").toLowerCase() ?? "";
    if (handle) map.set(handle, b);
  }
  return map;
}

function buildRenderer(productMap: Map<string, ProductBanner>) {
  const renderer = new Renderer();

  renderer.blockquote = ({ tokens }: { tokens: any }) => {
    const innerHtml = (marked as any).parser(tokens, { renderer: new Renderer() });

    // Product banner: blockquote that contains a hyperlink
    const isProductBanner = /<a\s[^>]*href=/i.test(innerHtml);
    if (!isProductBanner) return `<blockquote>${innerHtml}</blockquote>`;

    // Extract CTA link
    const linkMatches = [...innerHtml.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    const lastLink  = linkMatches[linkMatches.length - 1];
    const ctaHref   = lastLink ? lastLink[1] : "#";
    const ctaText   = lastLink ? lastLink[2].replace(/<[^>]+>/g, "").trim() : "Shop now";

    // Extract product name
    const strongMatch = innerHtml.match(/<strong>([\s\S]*?)<\/strong>/i);
    const productName = strongMatch ? strongMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // Extract description
    const afterStrong = strongMatch
      ? innerHtml.slice(innerHtml.indexOf(strongMatch[0]) + strongMatch[0].length)
      : innerHtml;
    const descRaw = lastLink
      ? afterStrong.slice(0, afterStrong.lastIndexOf(lastLink[0]))
      : afterStrong;
    const description = descRaw.replace(/<[^>]+>/g, "").replace(/^[\s\u2014\-–—|]+|[\s\u2014\-–—|]+$/g, "").trim();

    // Lookup real product data
    const key  = productName.toLowerCase().trim();
    const data = productMap.get(key) ?? [...productMap.values()].find(p => ctaHref.includes(p.url.split("/").pop() ?? "___"));

    const imageUrl  = data?.imageUrl;
    const price     = data?.price;
    const ctaLabel  = (ctaText || "Shop now").replace(/[→>»]+$/, "").trim();

    const imgHtml = imageUrl
      ? `<img src="${imageUrl}" alt="${productName}" class="pcard-img" onerror="this.style.display='none'" />`
      : `<div class="pcard-img pcard-img-placeholder">🛍️</div>`;

    const badgeRow = price
      ? `<div class="pcard-top"><span class="pcard-badge">RECOMMENDED</span><span class="pcard-price">${price}</span></div>`
      : `<div class="pcard-top"><span class="pcard-badge">RECOMMENDED</span></div>`;

    return `<a href="${ctaHref}" class="pcard" target="_blank" rel="noopener noreferrer">${imgHtml}<div class="pcard-body">${badgeRow}<div class="pcard-name">${productName || description.slice(0, 50)}</div><div class="pcard-desc">${description.slice(0, 140)}</div></div><div class="pcard-cta">${ctaLabel} →</div></a>`;
  };

  return renderer;
}

// Strip internal generation artifacts (Style Notes, Q&A sections) from user-facing content
function stripInternalSections(md: string): string {
  // Remove entire sections that start with headings matching internal artifact names
  // Matches ## Style Notes, ## Q&A, ## Style Notes:, etc. and everything until the next ## heading or end
  return md
    .replace(/^##\s+(Style Notes?|Q&A|Questions?\s*&\s*Answers?|Internal Notes?)[^\n]*\n[\s\S]*?(?=^##\s|\Z)/gim, '')
    .replace(/^##\s+(Style Notes?|Q&A|Questions?\s*&\s*Answers?|Internal Notes?)[^\n]*\n[\s\S]*/gim, '')
    .trim();
}

function renderMarkdown(md: string, productBanners?: ProductBanner[]): string {
  const cleaned    = stripInternalSections(md);
  const productMap = buildProductMap(productBanners);
  const renderer   = buildRenderer(productMap);
  marked.use({ renderer, breaks: false, gfm: true });
  return marked.parse(cleaned) as string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ArticleView({
  article,
  feedback,
  sessionToken,
  shopifyConfig,
}: {
  article: Article;
  feedback: Feedback | null;
  sessionToken: string;
  shopifyConfig?: ShopifyConfig;
}) {
  const router = useRouter();
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(!!feedback);
  const [copyState,  setCopyState]  = useState<"idle" | "html" | "md">("idle");
  const [qaOpen,     setQaOpen]     = useState(false);
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [shopifyPublishing, setShopifyPublishing] = useState(false);
  const [shopifyResult, setShopifyResult] = useState<{
    articleId?: string;
    articleUrl?: string;
    publishedAt?: string;
    error?: string;
  } | null>(
    article.shopifyArticleId
      ? { articleId: article.shopifyArticleId, publishedAt: article.shopifyPublishedAt }
      : null
  );

  const readingTime = article.readingTime ?? Math.ceil(article.wordCount / 250);

  useEffect(() => {
    setRenderedHtml(renderMarkdown(article.content, article.productBanners));
  }, [article.content, article.productBanners]);

  async function submitFeedback(rating: "good" | "needs_revision") {
    setSubmitting(true);
    try {
      const res = await fetch("/api/articles/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article._id,
          rating,
          comment: rating === "needs_revision" ? comment : undefined,
        }),
      });
      if (res.ok) { setSubmitted(true); router.refresh(); }
    } finally { setSubmitting(false); }
  }

  function copyHtml() {
    navigator.clipboard.writeText(renderMarkdown(article.content, article.productBanners));
    setCopyState("html");
    setTimeout(() => setCopyState("idle"), 2000);
  }
  function copyMarkdown() {
    navigator.clipboard.writeText(article.content);
    setCopyState("md");
    setTimeout(() => setCopyState("idle"), 2000);
  }
  function downloadHtml() {
    const html = renderMarkdown(article.content, article.productBanners);
    const full = `<h1>${article.title}</h1>\n${html}`;
    downloadFile(`${article.slug || "article"}.html`, full);
  }

  async function handlePublishToShopify() {
    setShopifyPublishing(true);
    setShopifyResult(null);
    try {
      const res = await fetch("/api/shopify/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShopifyResult({ error: data.error || "Failed to publish" });
      } else {
        setShopifyResult({
          articleId: data.shopifyArticleId,
          articleUrl: data.shopifyArticleUrl,
          publishedAt: new Date().toISOString(),
        });
        router.refresh();
      }
    } catch (err) {
      setShopifyResult({ error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setShopifyPublishing(false);
    }
  }

  const hasFeedback = submitted || !!feedback;

  // ─── Traffic opportunity chart ──────────────────────────────────────────
  const trafficCard = (() => {
    if (!article.monthlyVolume || article.monthlyVolume <= 0) return null;
    const vol    = article.monthlyVolume;
    const growth = [0, 0, 1, 2, 4, 8, 15, 28, 45, 65, 82, 100];
    const maxMo  = vol * 0.035;
    const monthly  = growth.map(p => Math.round(maxMo * p / 100));
    const organicYr1 = monthly.reduce((a, b) => a + b, 0);
    const customers  = Math.round(organicYr1 * 0.02);
    const displayVol = vol >= 1000 ? `${(vol / 1000).toFixed(1)}k` : String(vol);
    const store      = article.storeName || "your store";

    // SVG
    const W=560, H=100, pL=8, pR=8, pT=8, pB=20;
    const cW=W-pL-pR, cH=H-pT-pB, maxV=Math.max(...monthly, 1);
    const pts = monthly.map((v, i) => `${pL+(i/11)*cW},${pT+cH-(v/maxV)*cH}`);
    const fill = `M${pL},${pT+cH} L${pts.join(" L")} L${pL+cW},${pT+cH} Z`;
    const xLbls = [{i:0,l:"Jan"},{i:3,l:"Apr"},{i:6,l:"Jul"},{i:9,l:"Oct"}];

    return (
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ background: "var(--accent)", color: "#fff", padding: "10px 20px", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
          📊 Traffic Opportunity
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "55% 45%", gap: 24, alignItems: "center", padding: "4px 0 8px" }}>
          <div>
            <p style={{ padding: "14px 20px 10px", fontSize: 14, color: "var(--t2)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--t1)" }}>{vol.toLocaleString()}</strong> people/month search "{article.targetKeyword}". What consistent SEO could mean for <strong style={{ color: "var(--t1)" }}>{store}</strong> in 12 months:
            </p>
            <div style={{ display: "flex", gap: 10, padding: "0 20px 12px" }}>
              {[
                { n: displayVol, l: "Monthly searches", s: "for your keyword cluster" },
                { n: organicYr1.toLocaleString(), l: "Organic visitors", s: "projected year 1" },
                { n: customers.toLocaleString(), l: "Potential customers", s: "at 2% conversion", green: true },
              ].map(({ n, l, s, green }) => (
                <div key={l} style={{ flex: 1, background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: green ? "var(--accent)" : "var(--t1)" }}>{n}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)", margin: "2px 0" }}>{l}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ paddingRight: 20 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6, fontWeight: 500 }}>Projected organic visitors — 12 months</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="120" style={{ display: "block" }}>
              <path d={fill} fill="#dcfce7" opacity="0.7" />
              <polyline points={pts.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {xLbls.map(({ i, l }) => (
                <text key={i} x={pL+(i/11)*cW} y={H-2} fontSize="10" fill="#b0adac" textAnchor="middle">{l}</text>
              ))}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0 20px 12px", fontSize: 11, color: "var(--t3)" }}>
          Estimate based on avg position 5-8, 3.5% CTR, 2% visitor-to-customer conversion.
        </div>
      </div>
    );
  })();

  return (
    <>
      {/* ─── Global styles ────────────────────────────────────────────────── */}
      <style>{`
        /* ── Article body ── */
        .ab h1 { font-size:23px; font-weight:800; margin:28px 0 12px; color:var(--t1); letter-spacing:-.02em; line-height:1.25; }
        .ab h2 { font-size:19px; font-weight:700; margin:28px 0 10px; color:var(--t1); letter-spacing:-.015em; border-bottom:1px solid var(--border); padding-bottom:8px; }
        .ab h3 { font-size:16px; font-weight:700; margin:20px 0 8px; color:var(--t1); }
        .ab p  { margin:0 0 16px; line-height:1.8; color:var(--t2); font-size:15px; }
        .ab hr { border:none; border-top:1px solid var(--border); margin:28px 0; }
        .ab a  { color:var(--accent); text-decoration:underline; }
        .ab ul,.ab ol { margin:0 0 16px; padding-left:22px; }
        .ab li { margin-bottom:7px; line-height:1.7; color:var(--t2); font-size:15px; }
        .ab blockquote { border-left:3px solid var(--border-md); padding-left:16px; color:var(--t3); font-style:italic; margin:16px 0; }
        .ab strong { color:var(--t1); font-weight:700; }
        /* ── Product card (BannerCard style) ── */
        .pcard {
          display:flex; align-items:center; gap:16px;
          margin:28px 0; padding:18px 20px;
          background:#fff; border:1px solid var(--border);
          border-radius:14px; text-decoration:none !important;
          box-shadow:0 2px 12px rgba(0,0,0,.05);
          transition:transform .15s, box-shadow .15s;
          cursor:pointer;
        }
        .pcard:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,.10); }
        .pcard-img {
          width:56px; height:56px; border-radius:10px;
          object-fit:cover; flex-shrink:0;
          background:var(--bg); border:1px solid var(--border);
        }
        .pcard-img-placeholder {
          display:flex; align-items:center; justify-content:center;
          font-size:22px;
        }
        .pcard-body { flex:1; min-width:0; }
        .pcard-top { display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap; }
        .pcard-badge {
          font-size:10px; font-weight:700; letter-spacing:.06em;
          text-transform:uppercase; background:rgba(22,163,74,.10);
          color:var(--accent); padding:2px 8px; border-radius:100px;
        }
        .pcard-price { font-size:13px; font-weight:700; color:var(--accent); }
        .pcard-name { font-size:14px; font-weight:700; color:var(--t1); margin-bottom:3px; line-height:1.3; }
        .pcard-desc { font-size:13px; color:var(--t2); line-height:1.5; }
        .pcard-cta {
          flex-shrink:0; padding:9px 16px;
          border-radius:100px; background:var(--t1);
          color:#fff !important; font-size:13px; font-weight:600;
          white-space:nowrap; text-decoration:none !important;
        }
        @media(max-width:600px){
          .pcard { flex-wrap:wrap; }
          .pcard-cta { width:100%; text-align:center; }
        }
        /* ── UI chips / tags ── */
        .chip { display:inline-flex; align-items:center; gap:5px; background:#fff; border:1px solid var(--border); border-radius:100px; padding:5px 12px; font-size:12px; color:var(--t2); font-weight:500; }
        .kwtag { display:inline-block; background:var(--accent-lt); color:#166534; border:1px solid rgba(22,163,74,.25); border-radius:12px; padding:2px 10px; font-size:12px; font-weight:500; margin:2px; }
        /* ── Top action bar ── */
        .topbar { position:sticky; top:0; z-index:50; background:rgba(249,248,248,.92); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:10px 0; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
        /* ── Sections ── */
        .section { background:#fff; border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:16px; box-shadow:var(--shadow-sm); }
        .section-title { font-size:13px; font-weight:700; color:var(--t1); margin-bottom:14px; letter-spacing:.01em; text-transform:uppercase; }
        /* ── Buttons ── */
        .btn-g { padding:8px 16px; border-radius:100px; background:var(--accent); color:#fff; border:none; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:opacity .15s; }
        .btn-g:hover { opacity:.85; }
        .btn-o { padding:8px 16px; border-radius:100px; background:transparent; color:var(--t2); border:1px solid var(--border-md); font-size:13px; font-weight:500; cursor:pointer; white-space:nowrap; }
        .btn-o:hover { background:rgba(0,0,0,.04); }
        .btn-sm { padding:6px 12px; border-radius:100px; background:transparent; color:var(--t2); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; white-space:nowrap; }
        .btn-sm:hover { background:rgba(0,0,0,.04); }
        /* ── FAQ ── */
        .faq-item { border:1px solid var(--border); border-radius:10px; overflow:hidden; margin-bottom:8px; }
        .faq-q { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; cursor:pointer; background:#fff; font-size:14px; font-weight:600; color:var(--t1); }
        .faq-q:hover { background:var(--bg); }
        .faq-a { padding:12px 16px; font-size:14px; color:var(--t2); line-height:1.7; border-top:1px solid var(--border); background:var(--bg); }
      `}</style>

      {/* ─── Sticky top bar ──────────────────────────────────────────────── */}
      <div className="topbar">
        <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
          <Link href="/dashboard" style={{ color:"var(--t3)", fontSize:13, textDecoration:"none", whiteSpace:"nowrap" }}>
            ← Back
          </Link>
          <span style={{ fontSize:14, fontWeight:600, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {article.title}
          </span>
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0, alignItems:"center" }}>
          {/* Shopify publish button */}
          {shopifyConfig?.hasCredentials && (
            shopifyResult?.articleId ? (
              <span style={{ fontSize:13, color:"#16a34a", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                🛍️ Published
                {shopifyResult.articleUrl && (
                  <a
                    href={shopifyResult.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize:12, color:"#2563eb", fontWeight:500, marginLeft:4 }}
                  >
                    View →
                  </a>
                )}
              </span>
            ) : (
              <button
                className="btn-o"
                onClick={handlePublishToShopify}
                disabled={shopifyPublishing}
                style={{ display:"flex", alignItems:"center", gap:5, borderColor:"#7c3aed", color:"#7c3aed" }}
              >
                {shopifyPublishing ? "Publishing…" : "🛍️ Publish to Shopify"}
              </button>
            )
          )}
          {hasFeedback ? (
            <span style={{ fontSize:13, color:"var(--accent)", fontWeight:500 }}>✓ Feedback submitted</span>
          ) : (
            <>
              <button className="btn-g" onClick={() => submitFeedback("good")} disabled={submitting}>✓ Approve</button>
              <button className="btn-o" onClick={() => { setShowRevisionForm(true); window.scrollTo({ top: document.body.scrollHeight, behavior:"smooth" }); }}>✗ Revise</button>
            </>
          )}
        </div>
      </div>

      {/* ─── Critical QA (blocking) ──────────────────────────────────────── */}
      {article.qaCriticalIssues && article.qaCriticalIssues.length > 0 && (
        <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderLeft:"4px solid #dc2626", borderRadius:12, marginBottom:16, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:"#991b1b" }}>
            🚫 Critical QA Issues — Article held for review ({article.qaCriticalIssues.length})
          </div>
          <ul style={{ margin:0, padding:"0 16px 12px 32px" }}>
            {article.qaCriticalIssues.map((issue, i) => (
              <li key={i} style={{ fontSize:13, color:"#7f1d1d", marginBottom:4, lineHeight:1.5 }}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Style QA — hidden from user-facing view (internal artifact) ── */}
      {/* Style notes are internal QA feedback; only shown in admin/editor context */}

      {/* ─── Shopify status ─────────────────────────────────────────────── */}
      {shopifyResult?.error && (
        <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#991b1b" }}>
          ⚠️ Shopify publish failed: {shopifyResult.error}
        </div>
      )}
      {shopifyConfig && !shopifyConfig.hasCredentials && (
        <div style={{ background:"#faf5ff", border:"1px solid #e9d5ff", borderRadius:10, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#6b21a8" }}>
          🛍️ <strong>Connect Shopify</strong> to publish articles directly to your store.{" "}
          <a href="/dashboard/stores" style={{ color:"#7c3aed", fontWeight:600 }}>Set up in Settings →</a>
        </div>
      )}

      {/* ─── Hero product image ──────────────────────────────────────────── */}
      {article.productBanners && article.productBanners.length > 0 && article.productBanners[0].imageUrl && (
        <div style={{ marginBottom:20, borderRadius:14, overflow:"hidden", border:"1px solid var(--border)", background:"#f9f9f9", maxHeight:280, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img
            src={article.productBanners[0].imageUrl}
            alt={article.productBanners[0].name}
            style={{ width:"100%", maxHeight:280, objectFit:"cover", display:"block" }}
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* ─── Stats chips ─────────────────────────────────────────────────── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
        <span className="chip">🔍 {article.targetKeyword}</span>
        <span className="chip">📝 {article.wordCount.toLocaleString()} words</span>
        <span className="chip">⏱ {readingTime} min read</span>
        {article._creationTime != null && (
          <span className="chip">📅 {formatArticleDate(article._creationTime)}</span>
        )}
        {article.qaScore != null && (
          <span className="chip" style={{ color: article.qaScore >= 85 ? "var(--accent)" : "#b45309" }}>
            ⭐ QA {article.qaScore}/100
          </span>
        )}
      </div>

      {/* ─── Traffic Opportunity Card ─────────────────────────────────────── */}
      {trafficCard}

      {/* ─── SEO Metadata ────────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-title">SEO Metadata</div>
        <div style={{ display:"grid", gap:10 }}>
          {article.metaTitle && (
            <div>
              <div style={{ fontSize:11, color:"var(--t3)", fontWeight:600, marginBottom:2, textTransform:"uppercase", letterSpacing:".04em" }}>Meta title</div>
              <div style={{ fontSize:14, color:"var(--t1)" }}>{article.metaTitle}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize:11, color:"var(--t3)", fontWeight:600, marginBottom:2, textTransform:"uppercase", letterSpacing:".04em" }}>Meta description</div>
            <div style={{ fontSize:14, color:"var(--t2)", lineHeight:1.65 }}>{article.metaDescription}</div>
          </div>
          {article.secondaryKeywords.length > 0 && (
            <div>
              <div style={{ fontSize:11, color:"var(--t3)", fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:".04em" }}>Secondary keywords</div>
              <div>{article.secondaryKeywords.map(kw => <span key={kw} className="kwtag">{kw}</span>)}</div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Article Content ─────────────────────────────────────────────── */}
      <div className="section">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:8 }}>
          <div className="section-title" style={{ margin:0 }}>Article Content</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <button className="btn-g" onClick={copyHtml} style={{ fontSize:12, padding:"6px 14px" }}>
              {copyState === "html" ? "Copied!" : "📋 Copy HTML"}
            </button>
            <button className="btn-sm" onClick={copyMarkdown}>
              {copyState === "md" ? "Copied!" : "Copy Markdown"}
            </button>
            <button className="btn-sm" onClick={downloadHtml}>⬇ Download</button>
          </div>
        </div>
        <div className="ab" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      {article.faqItems && article.faqItems.length > 0 && (
        <div className="section">
          <div className="section-title">Frequently Asked Questions</div>
          {article.faqItems.map((item, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{item.question}</span>
                <span style={{ fontSize:12, color:"var(--t3)", marginLeft:8 }}>{openFaq === i ? "▲" : "▼"}</span>
              </div>
              {openFaq === i && <div className="faq-a">{item.answer}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ─── Feedback ────────────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-title">Feedback</div>
        {hasFeedback ? (
          <div style={{ padding:16, background:"#f0fdf4", borderRadius:10, fontSize:14, color:"#166534" }}>
            {feedback?.rating === "good" || (!feedback && submitted)
              ? "✓ Thanks! Your article is approved."
              : "Thanks! We'll revise and let you know when it's ready."}
          </div>
        ) : (
          <div>
            <p style={{ fontSize:14, color:"var(--t2)", marginBottom:16 }}>How does this article look?</p>
            {showRevisionForm ? (
              <div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="What would you like changed? Be as specific as possible."
                  rows={4}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid var(--border-md)", fontSize:14, resize:"vertical", marginBottom:12, boxSizing:"border-box", background:"var(--bg)" }}
                />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => submitFeedback("needs_revision")} disabled={submitting} style={{ padding:"10px 20px", borderRadius:100, background:"#f59e0b", color:"#fff", border:"none", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                    {submitting ? "Submitting…" : "Request revision"}
                  </button>
                  <button className="btn-o" onClick={() => setShowRevisionForm(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", gap:10 }}>
                <button className="btn-g" onClick={() => submitFeedback("good")} disabled={submitting} style={{ padding:"10px 22px", fontSize:14 }}>
                  ✓ Looks good
                </button>
                <button className="btn-o" onClick={() => setShowRevisionForm(true)} style={{ padding:"10px 22px", fontSize:14 }}>
                  ✗ Needs revision
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
