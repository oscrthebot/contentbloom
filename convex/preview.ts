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
      keywordMonthlyVolume: article.keywordMonthlyVolume,
      keywordRelatedVolume: article.keywordRelatedVolume,
      banners: article.banners,
      language: article.language ?? "en",
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
    keywordMonthlyVolume: v.optional(v.number()),
    keywordRelatedVolume: v.optional(v.number()),
    language: v.optional(v.string()),
    banners: v.optional(v.array(v.object({
      type: v.union(v.literal("product"), v.literal("newsletter"), v.literal("cta"), v.literal("pricing")),
      insertAfterHeading: v.string(),
      title: v.string(),
      description: v.string(),
      ctaText: v.string(),
      ctaUrl: v.string(),
      imageUrl: v.optional(v.string()),
      price: v.optional(v.string()),
      badge: v.optional(v.string()),
    }))),
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

// Analytics: aggregate unlock statistics
export const getUnlockStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { startDate, endDate }) => {
    let allUnlocks = await ctx.db.query("articleUnlocks").collect();

    if (startDate !== undefined) {
      allUnlocks = allUnlocks.filter((u) => u.unlockedAt >= startDate!);
    }
    if (endDate !== undefined) {
      allUnlocks = allUnlocks.filter((u) => u.unlockedAt <= endDate!);
    }

    const totalUnlocks = allUnlocks.length;
    const uniqueEmails = new Set(allUnlocks.map((u) => u.email)).size;

    // unlocksByDay — last 30 days buckets
    const byDay: Record<string, number> = {};
    for (const unlock of allUnlocks) {
      const date = new Date(unlock.unlockedAt).toISOString().split("T")[0];
      byDay[date] = (byDay[date] || 0) + 1;
    }
    const unlocksByDay = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // topArticles — by unlock count
    const bySlug: Record<string, number> = {};
    for (const unlock of allUnlocks) {
      bySlug[unlock.slug] = (bySlug[unlock.slug] || 0) + 1;
    }
    const slugsSorted = Object.entries(bySlug)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topArticles = await Promise.all(
      slugsSorted.map(async ([slug, unlockCount]) => {
        const article = await ctx.db
          .query("previewArticles")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
        return {
          slug,
          title: article?.title ?? slug,
          unlockCount,
        };
      })
    );

    // unlocksByDomain — email domain breakdown
    const byDomain: Record<string, number> = {};
    for (const unlock of allUnlocks) {
      const domain = unlock.email.split("@")[1] ?? "unknown";
      byDomain[domain] = (byDomain[domain] || 0) + 1;
    }
    const unlocksByDomain = Object.entries(byDomain)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    // totalArticlesWithUnlocks
    const totalArticlesWithUnlocks = Object.keys(bySlug).length;

    return {
      totalUnlocks,
      uniqueEmails,
      unlocksByDay,
      topArticles,
      unlocksByDomain,
      totalArticlesWithUnlocks,
    };
  },
});

// Analytics: all unlocks for a specific article
export const getUnlocksByArticle = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("articleUnlocks")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .order("desc")
      .collect();
  },
});

// Analytics: paginated recent unlocks with search
export const listAllUnlocks = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, { page = 0, pageSize = 25, search }) => {
    let all = await ctx.db
      .query("articleUnlocks")
      .order("desc")
      .collect();

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      all = all.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.slug.toLowerCase().includes(q)
      );
    }

    const total = all.length;
    const items = all.slice(page * pageSize, (page + 1) * pageSize);

    // Enrich with article titles
    const enriched = await Promise.all(
      items.map(async (unlock) => {
        const article = await ctx.db
          .query("previewArticles")
          .withIndex("by_slug", (q) => q.eq("slug", unlock.slug))
          .first();
        return {
          ...unlock,
          title: article?.title ?? unlock.slug,
        };
      })
    );

    return { items: enriched, total, page, pageSize };
  },
});

// Analytics: quick stats for the current week (for dashboard home widget)
export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const allUnlocks = await ctx.db.query("articleUnlocks").collect();
    const weekUnlocks = allUnlocks.filter((u) => u.unlockedAt >= weekAgo);

    const totalThisWeek = weekUnlocks.length;
    const uniqueEmailsThisWeek = new Set(weekUnlocks.map((u) => u.email)).size;

    // Most unlocked article this week
    const bySlug: Record<string, number> = {};
    for (const unlock of weekUnlocks) {
      bySlug[unlock.slug] = (bySlug[unlock.slug] || 0) + 1;
    }
    const topEntry = Object.entries(bySlug).sort((a, b) => b[1] - a[1])[0];
    let topArticleThisWeek: { slug: string; title: string; count: number } | null = null;
    if (topEntry) {
      const article = await ctx.db
        .query("previewArticles")
        .withIndex("by_slug", (q) => q.eq("slug", topEntry[0]))
        .first();
      topArticleThisWeek = {
        slug: topEntry[0],
        title: article?.title ?? topEntry[0],
        count: topEntry[1],
      };
    }

    return { totalThisWeek, uniqueEmailsThisWeek, topArticleThisWeek };
  },
});

// Export: return all unlock data (admin only — used for CSV/JSON download)
export const exportUnlocks = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, { startDate, endDate, slug }) => {
    let all = await ctx.db.query("articleUnlocks").collect();

    if (slug) {
      all = all.filter((u) => u.slug === slug);
    }
    if (startDate !== undefined) {
      all = all.filter((u) => u.unlockedAt >= startDate!);
    }
    if (endDate !== undefined) {
      all = all.filter((u) => u.unlockedAt <= endDate!);
    }

    // Enrich with titles
    const enriched = await Promise.all(
      all.map(async (unlock) => {
        const article = await ctx.db
          .query("previewArticles")
          .withIndex("by_slug", (q) => q.eq("slug", unlock.slug))
          .first();
        return {
          slug: unlock.slug,
          title: article?.title ?? unlock.slug,
          email: unlock.email,
          unlockedAt: new Date(unlock.unlockedAt).toISOString(),
        };
      })
    );

    return enriched.sort(
      (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
    );
  },
});
