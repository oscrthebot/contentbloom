import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all leads
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("leads").order("desc").collect();
  },
});

// Get a single lead
export const get = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add a new lead
export const add = mutation({
  args: {
    domain: v.string(),
    storeName: v.string(),
    niche: v.string(),
    email: v.string(),
    language: v.union(v.literal("en"), v.literal("es"), v.literal("de"), v.literal("fr")),
    score: v.number(),
    ownerName: v.optional(v.string()),
    productCount: v.optional(v.number()),
    blogPostCount: v.optional(v.number()),
    notes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check for duplicates
    const existingByEmail = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingByEmail) {
      throw new Error(`Lead with email ${args.email} already exists`);
    }

    const existingByDomain = await ctx.db
      .query("leads")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .first();
    
    if (existingByDomain) {
      throw new Error(`Lead with domain ${args.domain} already exists`);
    }

    return await ctx.db.insert("leads", {
      ...args,
      status: "new",
      notes: args.notes || [],
    });
  },
});

// Update lead status
export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("demo_sent"),
      v.literal("follow_up_1"),
      v.literal("follow_up_2"),
      v.literal("follow_up_3"),
      v.literal("replied"),
      v.literal("converted"),
      v.literal("rejected")
    ),
    lastContact: v.optional(v.string()),
    nextAction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Set firstContact if this is the first contact
    const lead = await ctx.db.get(id);
    if (lead && !lead.firstContact && args.status === "contacted") {
      await ctx.db.patch(id, {
        ...updates,
        firstContact: new Date().toISOString(),
      });
    } else {
      await ctx.db.patch(id, updates);
    }
  },
});

// Add note to lead
export const addNote = mutation({
  args: {
    id: v.id("leads"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) throw new Error("Lead not found");
    
    await ctx.db.patch(args.id, {
      notes: [...lead.notes, `[${new Date().toISOString()}] ${args.note}`],
    });
  },
});

// Get leads needing follow-up
export const needsFollowUp = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const leads = await ctx.db.query("leads").collect();
    
    return leads.filter(lead => 
      lead.nextAction && 
      lead.nextAction <= now &&
      ["contacted", "follow_up_1", "follow_up_2"].includes(lead.status)
    );
  },
});

// Get new leads to contact
export const getNewLeads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

// Stats
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query("leads").collect();

    return {
      total: leads.length,
      new: leads.filter(l => l.status === "new").length,
      contacted: leads.filter(l => ["contacted", "follow_up_1", "follow_up_2", "follow_up_3"].includes(l.status)).length,
      replied: leads.filter(l => l.status === "replied").length,
      demoSent: leads.filter(l => l.status === "demo_sent").length,
      converted: leads.filter(l => l.status === "converted").length,
      rejected: leads.filter(l => l.status === "rejected").length,
    };
  },
});

// Update lead email status after sending (follow-ups)
export const updateLeadEmailStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("demo_sent"),
      v.literal("follow_up_1"),
      v.literal("follow_up_2"),
      v.literal("follow_up_3"),
      v.literal("replied"),
      v.literal("converted"),
      v.literal("rejected")
    ),
    lastEmailDate: v.string(),  // ISO date string
    followUpCount: v.number(),  // 0-3
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Get leads needing follow-up today
// Follow-up schedule: Day 3, Day 6, Day 10 after initial contact
export const getLeadsForFollowUp = query({
  args: {
    targetDate: v.string(),  // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = new Date(args.targetDate);
    const targetDateStr = args.targetDate.split('T')[0]; // Get just the date part

    // Get all contacted leads (including follow-up statuses)
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "contacted" as any))
      .collect();

    const followUp1Leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "follow_up_1" as any))
      .collect();

    const followUp2Leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "follow_up_2" as any))
      .collect();

    const allLeads = [...leads, ...followUp1Leads, ...followUp2Leads];

    return allLeads.filter(lead => {
      if (!lead.lastEmailDate) return false;

      const lastEmail = new Date(lead.lastEmailDate);
      const daysSinceEmail = Math.floor((targetDate.getTime() - lastEmail.getTime()) / (1000 * 60 * 60 * 24));
      const currentFollowUpCount = lead.followUpCount || 0;

      // Follow-up schedule:
      // Follow-up #1: Day 3 after initial email
      // Follow-up #2: Day 6 after initial email
      // Follow-up #3: Day 10 after initial email
      if (currentFollowUpCount === 0 && daysSinceEmail >= 3) {
        // Needs follow-up #1
        return true;
      }
      if (currentFollowUpCount === 1 && daysSinceEmail >= 3) {
        // Needs follow-up #2 (3 days after follow-up #1)
        return true;
      }
      if (currentFollowUpCount === 2 && daysSinceEmail >= 4) {
        // Needs follow-up #3 (4 days after follow-up #2 = Day 10 total)
        return true;
      }

      return false;
    });
  },
});

// Update lead with preview article slug
export const updatePreviewSlug = mutation({
  args: {
    id: v.id("leads"),
    previewSlug: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { previewSlug: args.previewSlug });
  },
});

// Reset all contacted leads back to new (fresh start)
export const resetAllToNew = mutation({
  args: {},
  handler: async (ctx) => {
    const contacted = await ctx.db.query("leads")
      .filter(q => q.eq(q.field("status"), "contacted"))
      .collect();
    await Promise.all(contacted.map(l => ctx.db.patch(l._id, {
      status: "new",
    })));
    return { reset: contacted.length };
  },
});
