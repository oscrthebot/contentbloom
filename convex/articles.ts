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
      v.literal("revision")
    ),
    isPaidFeature: v.boolean(),
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
      v.literal("revision")
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
