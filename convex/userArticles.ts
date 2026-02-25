import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getUserFromSession(ctx: any, sessionToken: string) {
  const session = await ctx.db
    .query("userSessions")
    .withIndex("by_session_token", (q: any) => q.eq("sessionToken", sessionToken))
    .first();
  if (!session || session.expiresAt < Date.now()) return null;
  return await ctx.db.get(session.userId);
}

export const listForUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromSession(ctx, args.sessionToken);
    if (!user) return { error: "Not authenticated" };
    if (!user.clientId) return { articles: [] };

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_client", (q) => q.eq("clientId", user.clientId!))
      .collect();

    // Get feedback for each article
    const feedbacks = await ctx.db
      .query("articleFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const feedbackMap = new Map(feedbacks.map((f) => [f.articleId, f]));

    return {
      articles: articles.map((a) => ({
        _id: a._id,
        title: a.title,
        targetKeyword: a.targetKeyword,
        wordCount: a.wordCount,
        status: a.status,
        deliveredAt: a.deliveredAt,
        feedback: feedbackMap.get(a._id) || null,
      })),
    };
  },
});

export const getForUser = query({
  args: { sessionToken: v.string(), articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const user = await getUserFromSession(ctx, args.sessionToken);
    if (!user) return { error: "Not authenticated" };

    const article = await ctx.db.get(args.articleId);
    if (!article || !user.clientId || article.clientId !== user.clientId) {
      return { error: "Article not found" };
    }

    const feedback = await ctx.db
      .query("articleFeedback")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .first();

    return { article, feedback: feedback?.userId === user._id ? feedback : null };
  },
});

export const submitFeedback = mutation({
  args: {
    sessionToken: v.string(),
    articleId: v.id("articles"),
    rating: v.union(v.literal("good"), v.literal("needs_revision")),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromSession(ctx, args.sessionToken);
    if (!user) return { error: "Not authenticated" };

    const article = await ctx.db.get(args.articleId);
    if (!article || !user.clientId || article.clientId !== user.clientId) {
      return { error: "Article not found" };
    }

    // Check if feedback already exists
    const existing = await ctx.db
      .query("articleFeedback")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    if (existing.some((f) => f.userId === user._id)) {
      return { error: "Feedback already submitted" };
    }

    await ctx.db.insert("articleFeedback", {
      articleId: args.articleId,
      userId: user._id,
      rating: args.rating,
      comment: args.comment,
      submittedAt: Date.now(),
    });

    // Update article status if revision requested
    if (args.rating === "needs_revision") {
      await ctx.db.patch(args.articleId, {
        status: "revision",
        revisionNotes: args.comment || "Revision requested by client",
      });
    }

    return { success: true };
  },
});
