import { cookies } from "next/headers";
import { getConvexClient } from "../../../../lib/convex";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ArticleView } from "./ArticleView";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")!.value;

  const convex = getConvexClient();
  const result = await convex.query(api.userArticles.getForUser, {
    sessionToken,
    articleId: id as Id<"articles">,
  });

  if ("error" in result) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Article not found</h2>
        <p style={{ color: "#6b7280", marginTop: 8 }}>This article does not exist or you do not have access to it.</p>
      </div>
    );
  }

  const { article, feedback } = result;

  return <ArticleView article={article!} feedback={feedback} sessionToken={sessionToken} />;
}
