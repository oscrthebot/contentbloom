"use client";

import Link from "next/link";

interface Article {
  _id: string;
  title: string;
  targetKeyword: string;
  wordCount: number;
  status: string;
  deliveredAt?: string;
  _creationTime?: number;
  feedback: { rating: string } | null;
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

const statusLabels: Record<string, string> = {
  needs_review: "⚠️ Needs Review",
};

const statusColors: Record<string, { bg: string; color: string }> = {
  queued: { bg: "#fef3c7", color: "#92400e" },
  generating: { bg: "#dbeafe", color: "#1e40af" },
  review: { bg: "#e0e7ff", color: "#3730a3" },
  delivered: { bg: "#dcfce7", color: "#166534" },
  revision: { bg: "#fee2e2", color: "#991b1b" },
  needs_review: { bg: "#fff7ed", color: "#c2410c" },
};

export function ArticlesList({ articles }: { articles: Article[] }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      overflow: "hidden",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            {["Title", "Keyword", "Words", "Created", "Status", "Feedback"].map((h) => (
              <th key={h} style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: 12,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => {
            const sc = statusColors[article.status] || statusColors.queued;
            return (
              <tr key={article._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "14px 16px" }}>
                  <Link
                    href={`/dashboard/articles/${article._id}`}
                    style={{ color: "#111827", fontWeight: 500, fontSize: 14, textDecoration: "none" }}
                  >
                    {article.title}
                  </Link>
                </td>
                <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: 13 }}>{article.targetKeyword}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: 13 }}>{article.wordCount}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: 12, whiteSpace: "nowrap" }}>
                  {article._creationTime ? formatArticleDate(article._creationTime) : "—"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    background: sc.bg,
                    color: sc.color,
                    textTransform: "capitalize",
                  }}>
                    {statusLabels[article.status] ?? article.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>
                  {article.feedback ? (
                    <span style={{ color: article.feedback.rating === "good" ? "#16a34a" : "#f59e0b" }}>
                      {article.feedback.rating === "good" ? "Approved" : "Revision requested"}
                    </span>
                  ) : article.status === "delivered" ? (
                    <span style={{ color: "#9ca3af" }}>Pending</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
