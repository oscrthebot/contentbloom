import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get article by slug (returns preview only — content is gate-locked)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const article = await ctx.db
      .query("previewArticles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!article) return null;
    // Never return full content from a query — only via unlock mutation
    return {
      _id: article._id,
      slug: article.slug,
      title: article.title,
      targetSite: article.targetSite,
      businessName: article.businessName,
      logoUrl: article.logoUrl,
      preview: article.preview,
      keyword: article.keyword,
      seoScore: article.seoScore,
      wordCount: article.wordCount,
    };
  },
});

// Unlock article with email — returns full content
export const unlock = mutation({
  args: { slug: v.string(), email: v.string() },
  handler: async (ctx, { slug, email }) => {
    const article = await ctx.db
      .query("previewArticles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!article) throw new Error("Article not found");

    // Store unlock (allow duplicates — same person can re-unlock)
    const existing = await ctx.db
      .query("articleUnlocks")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!existing) {
      await ctx.db.insert("articleUnlocks", {
        slug,
        email: email.toLowerCase().trim(),
        unlockedAt: Date.now(),
      });
    }

    return { content: article.content };
  },
});

// Admin: seed a preview article
export const seed = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    targetSite: v.string(),
    businessName: v.string(),
    logoUrl: v.optional(v.string()),
    preview: v.string(),
    content: v.string(),
    keyword: v.string(),
    seoScore: v.number(),
    wordCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("previewArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, createdAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("previewArticles", { ...args, createdAt: Date.now() });
  },
});

// Admin: list unlocks for a slug
export const listUnlocks = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("articleUnlocks")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .order("desc")
      .collect();
  },
});
