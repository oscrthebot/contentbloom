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
