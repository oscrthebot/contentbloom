import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getArticlesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get user's client ID, then query articles by client
    const user = await ctx.db.get(args.userId);
    if (!user?.clientId) return [];
    return await ctx.db
      .query("articles")
      .withIndex("by_client", (q) => q.eq("clientId", user.clientId!))
      .collect();
  },
});

export const createArticle = mutation({
  args: {
    clientId: v.id("clients"),
    title: v.string(),
    slug: v.string(),
    targetKeyword: v.string(),
    secondaryKeywords: v.array(v.string()),
    content: v.string(),
    rawContent: v.optional(v.string()),
    metaTitle: v.string(),
    metaDescription: v.string(),
    schemaMarkup: v.string(),
    faqItems: v.array(v.object({ question: v.string(), answer: v.string() })),
    readingTime: v.number(),
    wordCount: v.number(),
    canonicalUrl: v.optional(v.string()),
    qaScore: v.optional(v.number()),
    qaIssues: v.optional(v.array(v.string())),
    qaCriticalIssues: v.optional(v.array(v.string())),
    monthlyVolume: v.optional(v.number()),
    status: v.union(
      v.literal("generating"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("published"),
      v.literal("queued"),
      v.literal("delivered"),
      v.literal("revision"),
      v.literal("needs_review")
    ),
    isPaidFeature: v.boolean(),
    regenerationCount: v.optional(v.number()),
    productBanners: v.optional(v.array(v.object({
      name: v.string(),
      imageUrl: v.optional(v.string()),
      price: v.optional(v.string()),
      description: v.optional(v.string()),
      url: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("articles", {
      ...args,
      deliveredAt: undefined,
      revisionNotes: undefined,
    });
  },
});

export const updateArticleStatus = mutation({
  args: {
    id: v.id("articles"),
    status: v.union(
      v.literal("generating"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("published"),
      v.literal("queued"),
      v.literal("delivered"),
      v.literal("revision"),
      v.literal("needs_review")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteArticle = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const markShopifyPublished = mutation({
  args: {
    articleId: v.id("articles"),
    shopifyArticleId: v.string(),
    shopifyPublishedAt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      shopifyArticleId: args.shopifyArticleId,
      shopifyPublishedAt: args.shopifyPublishedAt,
    });
  },
});

export const getArticlesByKeyword = query({
  args: { clientId: v.id("clients"), keyword: v.string() },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    return articles.filter(
      (a) =>
        a.targetKeyword.toLowerCase().includes(args.keyword.toLowerCase()) ||
        args.keyword.toLowerCase().includes(a.targetKeyword.toLowerCase())
    );
  },
});

// ── Revision System ────────────────────────────────────────────────────────

export const requestRevision = mutation({
  args: {
    articleId: v.id("articles"),
    feedback: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return { error: "Article not found" };

    // Get user to check plan
    const user = await ctx.db.get(args.userId);
    if (!user) return { error: "User not found" };

    // Trial users get 0 revisions
    if (user.plan === "trial") {
      return { error: "Revisions are not available on trial plans" };
    }

    // Check if revision already requested for this article
    const currentRevisionCount = article.revisionCount ?? 0;
    if (currentRevisionCount >= 1) {
      return { error: "Revision limit reached for this article" };
    }

    // Update article with revision request
    await ctx.db.patch(args.articleId, {
      revisionRequested: true,
      revisionCount: currentRevisionCount + 1,
      revisionFeedback: args.feedback,
      revisionStatus: "requested",
    });

    return { success: true };
  },
});

export const startRevision = mutation({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return { error: "Article not found" };

    await ctx.db.patch(args.articleId, {
      revisionStatus: "in_progress",
    });

    return { success: true };
  },
});

export const completeRevision = mutation({
  args: {
    originalArticleId: v.id("articles"),
    newArticleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const originalArticle = await ctx.db.get(args.originalArticleId);
    if (!originalArticle) return { error: "Original article not found" };

    // Mark original as completed
    await ctx.db.patch(args.originalArticleId, {
      revisionStatus: "completed",
    });

    // Update new article with reference to original
    await ctx.db.patch(args.newArticleId, {
      originalArticleId: args.originalArticleId,
    });

    return { success: true };
  },
});

export const getArticlesNeedingRevision = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status", (q) => q.eq("status", "revision"))
      .collect();

    return articles.filter(
      (a) => a.revisionStatus === "requested" || a.revisionStatus === "in_progress"
    );
  },
});
