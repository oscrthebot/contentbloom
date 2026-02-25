/**
 * BloomContent — Cold Outreach Management
 * Mutations and queries for mailboxes, campaigns, and sequences.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Mailboxes ─────────────────────────────────────────────────────────────────

export const upsertMailbox = mutation({
  args: {
    email: v.string(),
    displayName: v.string(),
    smtpHost: v.string(),
    smtpPort: v.number(),
    imapHost: v.string(),
    imapPort: v.number(),
    dailyLimit: v.number(),
    warmupDay: v.number(),
    status: v.union(v.literal("active"), v.literal("warming"), v.literal("paused")),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mailboxes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("mailboxes", { ...args });
  },
});

export const getMailboxes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mailboxes").collect();
  },
});

export const updateMailboxSendCount = mutation({
  args: { id: v.id("mailboxes"), sentToday: v.number(), lastSentAt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { sentToday: args.sentToday, lastSentAt: args.lastSentAt });
  },
});

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const createCampaign = mutation({
  args: {
    name: v.string(),
    dailyLimitTotal: v.number(),
    sendWindowStart: v.string(),
    sendWindowEnd: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("outreachCampaigns", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
    });
  },
});

export const getCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("outreachCampaigns").collect();
  },
});

export const updateCampaignStatus = mutation({
  args: {
    id: v.id("outreachCampaigns"),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const patch: any = { status: args.status };
    if (args.status === "active") patch.startedAt = Date.now();
    await ctx.db.patch(args.id, patch);
  },
});

// ── Sequence Steps ────────────────────────────────────────────────────────────

export const upsertSequenceStep = mutation({
  args: {
    campaignId: v.id("outreachCampaigns"),
    stepNumber: v.number(),
    subjectTemplate: v.string(),
    bodyTemplate: v.string(),
    delayDays: v.number(),
    isReply: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("outreachSequenceSteps")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("stepNumber"), args.stepNumber))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("outreachSequenceSteps", args);
  },
});

export const getSequenceSteps = query({
  args: { campaignId: v.id("outreachCampaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("outreachSequenceSteps")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

// ── Lead import ───────────────────────────────────────────────────────────────

export const upsertLead = mutation({
  args: {
    email: v.string(),
    domain: v.string(),
    storeName: v.string(),
    niche: v.string(),
    score: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("leads", {
      email: args.email,
      domain: args.domain,
      storeName: args.storeName,
      niche: args.niche,
      score: args.score,
      language: "en",
      status: "new",
      notes: args.notes ? [args.notes] : [],
    });
  },
});
