"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { marked, Renderer } from "marked";

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
}

interface Feedback {
  rating: string;
  comment?: string;
  submittedAt: number;
}

// ---------- marked setup ----------
function buildRenderer() {
  const renderer = new Renderer();

  // Blockquote: detect product banners by presence of any link (<a href)
  // Format in markdown: > **Product Name** — description. [Ver producto →](url)
  renderer.blockquote = ({ tokens }: { tokens: any }) => {
    // Re-render inner tokens to HTML using a plain renderer
    const innerHtml = (marked as any).parser(tokens, { renderer: new Renderer() });

    // Product banner detection: any blockquote that contains a hyperlink
    const isProductBanner = /<a\s[^>]*href=/i.test(innerHtml);

    if (isProductBanner) {
      // Extract the last link as the CTA
      const linkMatches = [...innerHtml.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
      const lastLink = linkMatches[linkMatches.length - 1];
      const ctaHref = lastLink ? lastLink[1] : "#";
      const ctaText = lastLink ? lastLink[2].replace(/<[^>]+>/g, "").trim() : "Ver producto →";

      // Strip all links from inner content to show only text + icon
      const contentWithoutLinks = innerHtml.replace(/<a[^>]+href="[^"]*"[^>]*>[\s\S]*?<\/a>/gi, "").trim();
      // Remove wrapping <p> tags for clean layout
      const cleanContent = contentWithoutLinks
        .replace(/^<p>([\s\S]*?)<\/p>$/i, "$1")
        .replace(/\s*—\s*$/, "") // trim trailing em-dash if link was at end
        .trim();

      return `<div class="product-banner"><div class="product-banner-text">🛍️ ${cleanContent}</div><a href="${ctaHref}" target="_blank" rel="noopener noreferrer" class="product-banner-btn">${ctaText}</a></div>`;
    }

    return `<blockquote>${innerHtml}</blockquote>`;
  };

  return renderer;
}

function renderMarkdown(md: string): string {
  const renderer = buildRenderer();
  marked.use({ renderer, breaks: false, gfm: true });
  return marked.parse(md) as string;
}

// ---------- Helper: download file ----------
function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Component ----------
export function ArticleView({
  article,
  feedback,
  sessionToken,
}: {
  article: Article;
  feedback: Feedback | null;
  sessionToken: string;
}) {
  const router = useRouter();
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!feedback);
  const [copyState, setCopyState] = useState<"idle" | "html" | "md">("idle");
  const [qaOpen, setQaOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [renderedHtml, setRenderedHtml] = useState("");

  const readingTime = article.readingTime ?? Math.ceil(article.wordCount / 250);

  useEffect(() => {
    setRenderedHtml(renderMarkdown(article.content));
  }, [article.content]);

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
      if (res.ok) {
        setSubmitted(true);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function copyHtml() {
    const html = renderMarkdown(article.content);
    navigator.clipboard.writeText(html);
    setCopyState("html");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  function copyMarkdown() {
    navigator.clipboard.writeText(article.content);
    setCopyState("md");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  function downloadHtml() {
    const html = renderMarkdown(article.content);
    const full = `<h1>${article.title}</h1>\n${html}`;
    const slug = article.slug || article.title.toLowerCase().replace(/\s+/g, "-");
    downloadFile(`${slug}.html`, full);
  }

  const hasFeedback = submitted || !!feedback;

  // ---- render ----
  return (
    <>
      {/* ---- Inline styles ---- */}
      <style>{`
        .article-body h1 { font-size: 24px; font-weight: 700; margin: 28px 0 12px; color: #111827; }
        .article-body h2 { font-size: 20px; font-weight: 700; margin: 24px 0 10px; color: #111827; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
        .article-body h3 { font-size: 17px; font-weight: 600; margin: 20px 0 8px; color: #111827; }
        .article-body p { margin: 0 0 16px; line-height: 1.75; color: #374151; }
        .article-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
        .article-body a { color: #16a34a; text-decoration: underline; }
        .article-body ul, .article-body ol { margin: 0 0 16px; padding-left: 24px; }
        .article-body li { margin-bottom: 6px; line-height: 1.65; color: #374151; }
        .article-body blockquote { border-left: 3px solid #e5e7eb; padding-left: 16px; color: #6b7280; font-style: italic; margin: 16px 0; }
        .product-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 16px 20px; margin: 24px 0; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .product-banner-text { font-size: 14px; color: #374151; flex: 1; }
        .product-banner-text strong { font-size: 15px; color: #111827; font-weight: 600; }
        .product-banner-btn { background: #16a34a; color: white !important; padding: 8px 16px; border-radius: 6px; text-decoration: none !important; font-size: 13px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .product-banner-btn:hover { background: #15803d; }
        .stat-chip { display: inline-flex; align-items: center; gap: 5px; background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 5px 12px; font-size: 13px; color: #374151; font-weight: 500; }
        .traffic-card { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 16px; overflow: hidden; }
        .traffic-card-header { background: #16a34a; color: #fff; padding: 12px 20px; font-size: 14px; font-weight: 700; letter-spacing: .02em; }
        .traffic-card-desc { padding: 14px 20px 8px; font-size: 13px; color: #374151; line-height: 1.55; }
        .traffic-stat-row { display: flex; gap: 12px; padding: 8px 20px 12px; }
        .traffic-stat-box { flex: 1; background: #f5f4f2; border-radius: 8px; padding: 14px 16px; min-width: 0; }
        .traffic-stat-num { font-size: 22px; font-weight: 800; color: #111827; }
        .traffic-stat-num.green { color: #16a34a; }
        .traffic-stat-label { font-size: 12px; font-weight: 600; color: #374151; margin: 2px 0 0; }
        .traffic-stat-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
        .traffic-card-footer { padding: 8px 20px 14px; font-size: 11px; color: #9ca3af; }
        .kw-tag { display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 12px; padding: 2px 10px; font-size: 12px; font-weight: 500; margin: 2px; }
        .faq-item { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
        .faq-question { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; cursor: pointer; background: #fff; font-size: 14px; font-weight: 600; color: #111827; }
        .faq-question:hover { background: #f9fafb; }
        .faq-answer { padding: 12px 16px; font-size: 14px; color: #374151; line-height: 1.7; border-top: 1px solid #f3f4f6; background: #fafafa; }
        .top-bar { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid #e5e7eb; padding: 10px 0; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .btn-green { padding: 8px 16px; border-radius: 8px; background: #16a34a; color: #fff; border: none; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .btn-green:hover { background: #15803d; }
        .btn-outline { padding: 8px 16px; border-radius: 8px; background: transparent; color: #374151; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; }
        .btn-outline:hover { background: #f9fafb; }
        .btn-outline-sm { padding: 6px 12px; border-radius: 6px; background: transparent; color: #374151; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; }
        .btn-outline-sm:hover { background: #f9fafb; }
        .card { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 16px; }
      `}</style>

      {/* ---- Sticky top action bar ---- */}
      <div className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Link
            href="/dashboard"
            style={{ color: "#6b7280", fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            ← Back
          </Link>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {article.title}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {hasFeedback ? (
            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>✓ Feedback submitted</span>
          ) : (
            <>
              <button
                className="btn-green"
                onClick={() => submitFeedback("good")}
                disabled={submitting}
              >
                ✓ Approve
              </button>
              <button
                className="btn-outline"
                onClick={() => { setShowRevisionForm(true); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
              >
                ✗ Needs revision
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---- CRITICAL QA Issues panel (RED, blocking) ---- */}
      {article.qaCriticalIssues && article.qaCriticalIssues.length > 0 && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderLeft: "4px solid #dc2626",
          borderRadius: 10,
          marginBottom: 16,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            fontSize: 13,
            fontWeight: 700,
            color: "#991b1b",
          }}>
            <span>🚫 Critical QA Issues — Article held for review ({article.qaCriticalIssues.length})</span>
          </div>
          <ul style={{ margin: 0, padding: "0 16px 12px 32px" }}>
            {article.qaCriticalIssues.map((issue, i) => (
              <li key={i} style={{ fontSize: 13, color: "#7f1d1d", marginBottom: 4, lineHeight: 1.5 }}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ---- Style QA Issues panel (yellow, collapsible) ---- */}
      {article.qaIssues && article.qaIssues.length > 0 && (
        <div style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 10,
          marginBottom: 16,
          overflow: "hidden",
        }}>
          <button
            onClick={() => setQaOpen(!qaOpen)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "#92400e",
            }}
          >
            <span>⚠️ Style Notes ({article.qaIssues.length} issue{article.qaIssues.length !== 1 ? "s" : ""})</span>
            <span style={{ fontSize: 11, color: "#b45309" }}>{qaOpen ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {qaOpen && (
            <ul style={{ margin: 0, padding: "0 16px 12px 32px" }}>
              {article.qaIssues.map((issue, i) => (
                <li key={i} style={{ fontSize: 13, color: "#78350f", marginBottom: 4, lineHeight: 1.5 }}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---- Keyword stats chips ---- */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <span className="stat-chip">🔍 {article.targetKeyword}</span>
        <span className="stat-chip">📝 {article.wordCount.toLocaleString()} words</span>
        <span className="stat-chip">⏱ {readingTime} min read</span>
        {article.qaScore != null && (
          <span className="stat-chip">⭐ QA: {article.qaScore}/100</span>
        )}
      </div>

      {/* ---- Traffic Opportunity Card ---- */}
      {article.monthlyVolume != null && article.monthlyVolume > 0 && (() => {
        const volume = article.monthlyVolume!;
        const growthPct = [0, 0, 1, 2, 4, 8, 15, 28, 45, 65, 82, 100];
        const maxMonthly = volume * 0.035;
        const monthlyVisitors = growthPct.map(p => Math.round(maxMonthly * p / 100));
        const organicYr1 = monthlyVisitors.reduce((a, b) => a + b, 0);
        const customers = Math.round(organicYr1 * 0.02);
        const displayVol = volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : String(volume);
        const storeName = article.storeName || "tu tienda";

        // SVG chart
        const svgW = 560; const svgH = 100;
        const padL = 8; const padR = 8; const padT = 8; const padB = 20;
        const chartW = svgW - padL - padR;
        const chartH = svgH - padT - padB;
        const maxV = Math.max(...monthlyVisitors, 1);
        const pts = monthlyVisitors.map((v, i) => {
          const x = padL + (i / 11) * chartW;
          const y = padT + chartH - (v / maxV) * chartH;
          return `${x},${y}`;
        });
        const firstX = padL; const firstY = padT + chartH;
        const lastX = padL + chartW; const lastY = padT + chartH;
        const polyline = pts.join(' ');
        const fillPath = `M${firstX},${firstY} L${pts.join(' L')} L${lastX},${lastY} Z`;
        // X-axis label positions: month indices 0=Jan,3=Abr,6=Jul,9=Oct
        const xLabels = [
          { i: 0, label: 'Ene' },
          { i: 3, label: 'Abr' },
          { i: 6, label: 'Jul' },
          { i: 9, label: 'Oct' },
        ];

        return (
          <div className="traffic-card">
            <div className="traffic-card-header">📊 OPORTUNIDAD DE TRÁFICO</div>
            <div className="traffic-card-desc">
              <strong>{volume.toLocaleString()}</strong> personas/mes buscan &ldquo;{article.targetKeyword}&rdquo;. Esto es lo que el SEO consistente podría suponer para <strong>{storeName}</strong> en 12 meses:
            </div>
            <div className="traffic-stat-row">
              <div className="traffic-stat-box">
                <div className="traffic-stat-num">{displayVol}</div>
                <div className="traffic-stat-label">Búsquedas mensuales</div>
                <div className="traffic-stat-sub">para tu cluster de keywords</div>
              </div>
              <div className="traffic-stat-box">
                <div className="traffic-stat-num">{organicYr1.toLocaleString()}</div>
                <div className="traffic-stat-label">Visitantes orgánicos (año 1)</div>
                <div className="traffic-stat-sub">estimación conservadora acumulada</div>
              </div>
              <div className="traffic-stat-box">
                <div className="traffic-stat-num green">{customers.toLocaleString()}</div>
                <div className="traffic-stat-label">Clientes potenciales</div>
                <div className="traffic-stat-sub">al 2% de conversión</div>
              </div>
            </div>
            {/* SVG Growth Chart */}
            <div style={{ padding: "0 20px 4px" }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Visitantes orgánicos acumulados — proyección 12 meses</div>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="140" style={{ display: "block" }}>
                {/* Filled area */}
                <path d={fillPath} fill="#dcfce7" opacity="0.7" />
                {/* Line */}
                <polyline points={polyline} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {/* X-axis labels */}
                {xLabels.map(({ i, label }) => (
                  <text
                    key={i}
                    x={padL + (i / 11) * chartW}
                    y={svgH - 2}
                    fontSize="10"
                    fill="#9ca3af"
                    textAnchor="middle"
                  >{label}</text>
                ))}
              </svg>
            </div>
            <div className="traffic-card-footer">Proyección basada en posición media 5-8, CTR 3.5%, conversión 2% visitante-cliente.</div>
          </div>
        );
      })()}

      {/* ---- SEO metadata card ---- */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 12 }}>SEO Metadata</div>
        <div style={{ display: "grid", gap: 8 }}>
          {article.metaTitle && (
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>Meta title</div>
              <div style={{ fontSize: 13, color: "#111827" }}>{article.metaTitle}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>Meta description</div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{article.metaDescription}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>Target keyword</div>
            <div style={{ fontSize: 13, color: "#374151" }}>{article.targetKeyword}</div>
          </div>
          {article.secondaryKeywords.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>Secondary keywords</div>
              <div>
                {article.secondaryKeywords.map((kw) => (
                  <span key={kw} className="kw-tag">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Article content ---- */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Article content</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              className="btn-green"
              onClick={copyHtml}
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              {copyState === "html" ? "Copied!" : "Copy HTML"}
            </button>
            <button
              className="btn-outline-sm"
              onClick={copyMarkdown}
            >
              {copyState === "md" ? "Copied!" : "Copy Markdown"}
            </button>
            <button
              className="btn-outline-sm"
              onClick={downloadHtml}
            >
              ⬇ Download HTML
            </button>
          </div>
        </div>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      {/* ---- FAQ section ---- */}
      {article.faqItems && article.faqItems.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Frequently Asked Questions</div>
          {article.faqItems.map((item, i) => (
            <div key={i} className="faq-item">
              <div
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{item.question}</span>
                <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{openFaq === i ? "▲" : "▼"}</span>
              </div>
              {openFaq === i && (
                <div className="faq-answer">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---- Feedback section ---- */}
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Feedback</div>

        {hasFeedback ? (
          <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 8, fontSize: 14, color: "#166534" }}>
            {feedback?.rating === "good" || (!feedback && submitted)
              ? "✓ Thanks for your feedback! Your article is approved."
              : "Thanks! We'll revise and notify you when the updated version is ready."}
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>How does this article look?</p>

            {showRevisionForm ? (
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What would you like changed? Be as specific as possible."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 14,
                    resize: "vertical",
                    marginBottom: 12,
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => submitFeedback("needs_revision")}
                    disabled={submitting}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      background: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {submitting ? "Submitting..." : "Request revision"}
                  </button>
                  <button
                    onClick={() => setShowRevisionForm(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn-green"
                  onClick={() => submitFeedback("good")}
                  disabled={submitting}
                  style={{ padding: "10px 20px", fontSize: 14 }}
                >
                  ✓ Looks good
                </button>
                <button
                  className="btn-outline"
                  onClick={() => setShowRevisionForm(true)}
                  style={{ padding: "10px 20px", fontSize: 14 }}
                >
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
