import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Calculate discount multiplier for a given store index (0-based). */
function calcDiscount(storeIndex: number): number {
  return Math.pow(0.8, storeIndex);
}

/** Count how many stores a user currently has. */
export const getStoreCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const stores = await ctx.db
      .query("stores")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return stores.length;
  },
});

/** List all stores for the authenticated user (by session token). */
export const getStoresByUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_session_token", (q) =>
        q.eq("sessionToken", args.sessionToken)
      )
      .first();

    if (!session || session.expiresAt < Date.now()) return [];

    return await ctx.db
      .query("stores")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();
  },
});

/** Create a new store for a user. Calculates discount based on existing store count. */
export const createStore = mutation({
  args: {
    userId: v.id("users"),
    storeName: v.string(),
    storeUrl: v.string(),
    niche: v.optional(v.string()),
    plan: v.union(
      v.literal("trial"),
      v.literal("starter"),
      v.literal("growth"),
      v.literal("scale")
    ),
  },
  handler: async (ctx, args) => {
    // Get current store count to determine index
    const existingStores = await ctx.db
      .query("stores")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const storeIndex = existingStores.length;
    const discountMultiplier = calcDiscount(storeIndex);

    const storeId = await ctx.db.insert("stores", {
      userId: args.userId,
      storeName: args.storeName,
      storeUrl: args.storeUrl,
      niche: args.niche,
      plan: args.plan,
      status: "active",
      storeIndex,
      discountMultiplier,
      createdAt: Date.now(),
    });

    return {
      storeId,
      storeIndex,
      discountMultiplier,
      isFirstStore: storeIndex === 0,
    };
  },
});

/** Update store details. */
export const updateStore = mutation({
  args: {
    storeId: v.id("stores"),
    storeName: v.optional(v.string()),
    storeUrl: v.optional(v.string()),
    niche: v.optional(v.string()),
    shopifyDomain: v.optional(v.string()),
    shopifyToken: v.optional(v.string()),
    plan: v.optional(
      v.union(
        v.literal("trial"),
        v.literal("starter"),
        v.literal("growth"),
        v.literal("scale")
      )
    ),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled"))
    ),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { storeId, ...updates } = args;
    // Filter out undefined values
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(storeId, patch);
    return { success: true };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
  },
});

export const saveWordPressCredentials = mutation({
  args: {
    userId: v.id("users"),
    wordpressSiteUrl: v.string(),
    wordpressUsername: v.string(),
    wordpressAppPassword: v.string(),
    storeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if a WordPress store already exists for this user
    const existingStores = await ctx.db
      .query("stores")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();

    const wpStore = existingStores.find(s => (s as any).platform === "wordpress");

    if (wpStore) {
      // Update existing WordPress store
      await ctx.db.patch(wpStore._id, {
        wordpressSiteUrl: args.wordpressSiteUrl,
        wordpressUsername: args.wordpressUsername,
        wordpressAppPassword: args.wordpressAppPassword,
        storeUrl: args.wordpressSiteUrl,
        ...(args.storeName ? { storeName: args.storeName } : {}),
      } as any);
      return { success: true, storeId: wpStore._id };
    }

    // Create new WordPress store
    const storeCount = existingStores.length;
    const newStoreId = await ctx.db.insert("stores", {
      userId: args.userId,
      storeName: args.storeName || "WordPress Site",
      storeUrl: args.wordpressSiteUrl,
      platform: "wordpress",
      wordpressSiteUrl: args.wordpressSiteUrl,
      wordpressUsername: args.wordpressUsername,
      wordpressAppPassword: args.wordpressAppPassword,
      plan: "trial",
      status: "active",
      storeIndex: storeCount,
      discountMultiplier: 1.0,
      createdAt: Date.now(),
    } as any);

    return { success: true, storeId: newStoreId };
  },
});
