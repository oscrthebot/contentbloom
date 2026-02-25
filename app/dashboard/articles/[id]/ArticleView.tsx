"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Article {
  _id: string;
  title: string;
  metaDescription: string;
  content: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  wordCount: number;
  status: string;
}

interface Feedback {
  rating: string;
  comment?: string;
  submittedAt: number;
}

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
  const [copied, setCopied] = useState(false);

  const readingTime = Math.ceil(article.wordCount / 250);

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

  function copyContent() {
    navigator.clipboard.writeText(article.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <Link href="/dashboard" style={{ color: "#6b7280", fontSize: 13, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>
        ← Back to articles
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 16 }}>{article.title}</h1>

      {/* Meta panel */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: "Target keyword", value: article.targetKeyword },
          { label: "Word count", value: `${article.wordCount} words` },
          { label: "Reading time", value: `${readingTime} min` },
          { label: "Status", value: article.status },
        ].map((item) => (
          <div key={item.label} style={{
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            padding: "12px 16px",
          }}>
            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* SEO metadata */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: 20,
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 8 }}>SEO Metadata</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
          <strong>Meta description:</strong> {article.metaDescription}
        </div>
        {article.secondaryKeywords.length > 0 && (
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            <strong>Secondary keywords:</strong> {article.secondaryKeywords.join(", ")}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: 24,
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Article content</div>
          <button
            onClick={copyContent}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
              color: copied ? "#16a34a" : "#374151",
            }}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
        <div
          style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{
            __html: article.content
              .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;margin:20px 0 8px;color:#111827">$1</h3>')
              .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px;color:#111827">$1</h2>')
              .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;margin:28px 0 12px;color:#111827">$1</h1>')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>')
          }}
        />
      </div>

      {/* Feedback */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: 24,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Feedback</div>

        {submitted || feedback ? (
          <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 8, fontSize: 14, color: "#166534" }}>
            {feedback?.rating === "good" || (!feedback && submitted)
              ? "Thanks for your feedback!"
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
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      background: "transparent",
                      border: "1px solid #e5e7eb",
                      fontSize: 14,
                      cursor: "pointer",
                      color: "#6b7280",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => submitFeedback("good")}
                  disabled={submitting}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Looks good
                </button>
                <button
                  onClick={() => setShowRevisionForm(true)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    background: "transparent",
                    border: "1px solid #e5e7eb",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    color: "#374151",
                  }}
                >
                  Needs revision
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
