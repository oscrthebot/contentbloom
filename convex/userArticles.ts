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

/**
 * Ensure a user has a client record (for self-serve users).
 * Creates one if missing and links it to the user.
 * Returns the clientId.
 */
export const ensureClientRecord = mutation({
  args: {
    userId: v.id("users"),
    storeName: v.string(),
    storeUrl: v.string(),
    niche: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already has a clientId
    const user = await ctx.db.get(args.userId);
    if (user?.clientId) return user.clientId;

    // Create a new client record
    const clientId = await ctx.db.insert("clients", {
      domain: args.storeUrl.replace(/^https?:\/\//, "").split("/")[0],
      storeName: args.storeName,
      email: args.email,
      plan: "starter",
      articlesPerDay: 0,
      language: "en",
      niche: args.niche,
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
      deliveredCount: 0,
      keywords: [],
      notes: [],
    });

    // Link to user
    await ctx.db.patch(args.userId, { clientId });

    return clientId;
  },
});

/**
 * Update a placeholder article with real generated content.
 */
export const updateGeneratedArticle = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    metaTitle: v.string(),
    metaDescription: v.string(),
    content: v.string(),
    rawContent: v.optional(v.string()),
    targetKeyword: v.string(),
    secondaryKeywords: v.array(v.string()),
    wordCount: v.number(),
    readingTime: v.number(),
    schemaMarkup: v.optional(v.string()),
    faqItems: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
    qaScore: v.optional(v.number()),
    qaIssues: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("queued"), v.literal("generating"), v.literal("review"),
      v.literal("approved"), v.literal("published"), v.literal("delivered"), v.literal("revision")
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

/**
 * Create a placeholder article with status "generating".
 * Used to show the loading state in the dashboard immediately.
 */
export const createPlaceholder = mutation({
  args: {
    clientId: v.id("clients"),
    niche: v.string(),
    storeName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("articles", {
      clientId: args.clientId,
      title: `Generating SEO article for ${args.storeName}…`,
      slug: `generating-${Date.now()}`,
      metaTitle: "",
      metaDescription: "",
      content: "",
      targetKeyword: args.niche,
      secondaryKeywords: [],
      wordCount: 0,
      status: "generating",
    });
  },
});
