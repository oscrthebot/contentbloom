import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all clients
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("clients")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("clients").order("desc").collect();
  },
});

// Get a single client
export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create client from lead
export const createFromLead = mutation({
  args: {
    leadId: v.id("leads"),
    plan: v.union(v.literal("starter"), v.literal("growth"), v.literal("scale")),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    const articlesPerDay = {
      starter: 1,
      growth: 3,
      scale: 5,
    };

    // Create client
    const clientId = await ctx.db.insert("clients", {
      leadId: args.leadId,
      domain: lead.domain,
      storeName: lead.storeName,
      email: lead.email,
      ownerName: lead.ownerName,
      plan: args.plan,
      articlesPerDay: articlesPerDay[args.plan],
      language: lead.language,
      niche: lead.niche,
      startDate: new Date().toISOString(),
      status: "active",
      deliveredCount: 0,
      keywords: args.keywords || [],
      notes: [],
    });

    // Update lead status
    await ctx.db.patch(args.leadId, {
      status: "converted",
    });

    return clientId;
  },
});

// Update client
export const update = mutation({
  args: {
    id: v.id("clients"),
    plan: v.optional(v.union(v.literal("starter"), v.literal("growth"), v.literal("scale"))),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled"))),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    if (updates.plan) {
      const articlesPerDay = {
        starter: 1,
        growth: 3,
        scale: 5,
      };
      await ctx.db.patch(id, {
        ...updates,
        articlesPerDay: articlesPerDay[updates.plan],
      });
    } else {
      await ctx.db.patch(id, updates);
    }
  },
});

// Increment delivered count
export const incrementDelivered = mutation({
  args: {
    id: v.id("clients"),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    
    await ctx.db.patch(args.id, {
      deliveredCount: client.deliveredCount + (args.count || 1),
    });
  },
});

// Add note
export const addNote = mutation({
  args: {
    id: v.id("clients"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    
    await ctx.db.patch(args.id, {
      notes: [...client.notes, `[${new Date().toISOString()}] ${args.note}`],
    });
  },
});

// MRR calculation
export const mrr = query({
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const prices = { starter: 49, growth: 99, scale: 149 };
    
    return clients.reduce((sum, client) => sum + prices[client.plan], 0);
  },
});

// Stats
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    const prices = { starter: 49, growth: 99, scale: 149 };
    
    const active = clients.filter(c => c.status === "active");
    
    return {
      total: clients.length,
      active: active.length,
      paused: clients.filter(c => c.status === "paused").length,
      cancelled: clients.filter(c => c.status === "cancelled").length,
      mrr: active.reduce((sum, c) => sum + prices[c.plan], 0),
      totalDelivered: clients.reduce((sum, c) => sum + c.deliveredCount, 0),
    };
  },
});
