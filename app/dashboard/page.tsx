import { cookies } from "next/headers";
import { getConvexClient } from "../../lib/convex";
import { api } from "../../convex/_generated/api";
import { ArticlesList } from "./ArticlesList";
import { ArticleGenerating } from "./ArticleGenerating";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")!.value;

  const convex = getConvexClient();
  const user = await convex.query(api.auth.validateSession, { sessionToken });
  const result = await convex.query(api.userArticles.listForUser, { sessionToken });

  const articles = ("articles" in result ? result.articles : []) ?? [];

  // Check if any article is currently generating
  const isGenerating = articles.some((a: { status: string }) => a.status === "generating");

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Articles</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total articles", value: articles.filter((a: { status: string }) => a.status !== "generating").length },
          { label: "Delivered", value: articles.filter((a: { status: string }) => a.status === "delivered").length },
          { label: "Pending feedback", value: articles.filter((a: { status: string; feedback?: unknown }) => a.status === "delivered" && !a.feedback).length },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Currently generating */}
      {isGenerating && (
        <div style={{ marginBottom: 24 }}>
          <ArticleGenerating storeName={user?.storeName || "your store"} />
        </div>
      )}

      {/* No articles and not generating */}
      {articles.filter((a: { status: string }) => a.status !== "generating").length === 0 && !isGenerating ? (
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 48,
          textAlign: "center",
        }}>
          {!user?.storeName ? (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                Set up your store to get started
              </h3>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
                We need a few details about your store to generate your first SEO article.
              </p>
              <a
                href="/onboard"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: "#16a34a",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Complete setup →
              </a>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                No articles yet
              </h3>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                Your first article will appear here once it has been generated for <strong>{user.storeName}</strong>.
              </p>
            </>
          )}
        </div>
      ) : (
        <ArticlesList articles={articles.filter((a: { status: string }) => a.status !== "generating")} />
      )}
    </div>
  );
}
