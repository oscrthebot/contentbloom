import { cookies } from "next/headers";
import { getConvexClient } from "../../lib/convex";
import { api } from "../../convex/_generated/api";
import { ArticlesList } from "./ArticlesList";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")!.value;

  const convex = getConvexClient();
  const user = await convex.query(api.auth.validateSession, { sessionToken });
  const result = await convex.query(api.userArticles.listForUser, { sessionToken });

  const articles = ("articles" in result ? result.articles : []) ?? [];
  const plan = user?.plan || "trial";

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Articles</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total articles", value: articles.length },
          { label: "Delivered", value: articles.filter((a) => a.status === "delivered").length },
          { label: "Pending feedback", value: articles.filter((a) => a.status === "delivered" && !a.feedback).length },
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

      {articles.length === 0 ? (
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 48,
          textAlign: "center",
        }}>
          {plan === "trial" ? (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                Your free article is being prepared
              </h3>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                We are generating your first SEO article. You will receive an email when it is ready.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                No articles yet
              </h3>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                Your first article will appear here once it has been generated.
              </p>
            </>
          )}
        </div>
      ) : (
        <ArticlesList articles={articles} />
      )}
    </div>
  );
}
