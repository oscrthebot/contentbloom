import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add an outreach log entry
export const add = mutation({
  args: {
    leadId: v.optional(v.id("leads")),
    type: v.string(),       // "cold", "follow_up_1", "follow_up_2", "follow_up_3", "demo"
    email: v.string(),
    subject: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("opened"),
      v.literal("replied"),
      v.literal("bounced")
    ),
    sentAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("outreachLog", args);
  },
});

// Update outreach status (e.g. when reply detected)
export const updateStatus = mutation({
  args: {
    id: v.id("outreachLog"),
    status: v.union(
      v.literal("sent"),
      v.literal("opened"),
      v.literal("replied"),
      v.literal("bounced")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// List recent outreach
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const entries = await ctx.db.query("outreachLog").order("desc").take(args.limit ?? 50);
    return entries;
  },
});
