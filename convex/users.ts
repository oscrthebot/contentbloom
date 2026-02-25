import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();
  },
});

export const getBySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_session_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || session.expiresAt < Date.now()) return null;
    return await ctx.db.get(session.userId);
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    storeName: v.optional(v.string()),
    storeUrl: v.optional(v.string()),
    niche: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const filtered: Record<string, string> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(userId, filtered);
  },
});

export const updateStripe = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    plan: v.optional(
      v.union(v.literal("trial"), v.literal("starter"), v.literal("growth"), v.literal("scale"), v.literal("cancelled"))
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const filtered: Record<string, string> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(userId, filtered);
  },
});
