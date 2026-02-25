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
  faqItems?: Array<{ question: string; answer: string }>;
  monthlyVolume?: number;
}

interface Feedback {
  rating: string;
  comment?: string;
  submittedAt: number;
}

// ---------- marked setup ----------
function buildRenderer() {
  const renderer = new Renderer();

  // Blockquote: detect product banners by presence of a CTA link
  renderer.blockquote = ({ tokens }: { tokens: any }) => {
    // Re-render inner tokens to HTML first
    const innerHtml = (marked as any).parser(tokens, { renderer: new Renderer() });
    // Product banner detection: contains a link with CTA text
    const isProductBanner =
      /href=/.test(innerHtml) &&
      /(shop now|view product|buy now|get it here|order now)/i.test(innerHtml);

    if (isProductBanner) {
      // Extract the CTA link
      const linkMatch = innerHtml.match(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/i);
      const ctaHref = linkMatch ? linkMatch[1] : "#";
      const ctaText = linkMatch ? linkMatch[2].replace(/<[^>]+>/g, "") : "Shop now";

      // Strip the CTA link from the inner content for display
      const contentWithoutCta = innerHtml.replace(/<a[^>]+href="[^"]*"[^>]*>.*?<\/a>/gi, "").trim();
      // Remove surrounding <p> tags if any, we'll structure manually
      const cleanContent = contentWithoutCta.replace(/^<p>([\s\S]*?)<\/p>$/i, "$1").trim();

      return `<div class="product-banner"><div class="product-banner-text">${cleanContent}</div><a href="${ctaHref}" target="_blank" rel="noopener noreferrer">${ctaText} →</a></div>`;
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
        .product-banner-text strong { font-size: 15px; color: #111827; display: block; margin-bottom: 4px; }
        .product-banner-text p { font-size: 13px; color: #374151; margin: 0; }
        .product-banner > a { background: #16a34a; color: white !important; padding: 8px 16px; border-radius: 6px; text-decoration: none !important; font-size: 13px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .stat-chip { display: inline-flex; align-items: center; gap: 5px; background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 5px 12px; font-size: 13px; color: #374151; font-weight: 500; }
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

      {/* ---- QA Issues panel (yellow, collapsible) ---- */}
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
            <span>⚠️ QA Notes ({article.qaIssues.length} issue{article.qaIssues.length !== 1 ? "s" : ""})</span>
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
        {article.monthlyVolume != null ? (
          <span className="stat-chip">📊 {article.monthlyVolume.toLocaleString()} searches/mo</span>
        ) : (
          <span className="stat-chip">📊 — searches/mo</span>
        )}
        <span className="stat-chip">📝 {article.wordCount.toLocaleString()} words</span>
        <span className="stat-chip">⏱ {readingTime} min read</span>
        {article.qaScore != null && (
          <span className="stat-chip">⭐ QA: {article.qaScore}/100</span>
        )}
      </div>

      {/* Revenue estimates */}
      {article.monthlyVolume != null && article.monthlyVolume > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <span className="stat-chip">📈 {Math.round(article.monthlyVolume * 0.03 * 12).toLocaleString()} visits/yr</span>
          <span className="stat-chip">💰 €{Math.round(article.monthlyVolume * 0.03 * 12 * 0.02 * 50).toLocaleString()}/yr</span>
          <span className="stat-chip" title="Based on 3% CTR, 2% conversion, €50 avg order" style={{ cursor: "help" }}>ℹ️ Estimates</span>
        </div>
      )}

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
