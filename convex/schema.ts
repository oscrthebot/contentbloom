import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Leads - potential customers
  leads: defineTable({
    domain: v.string(),
    storeName: v.string(),
    niche: v.string(),
    email: v.string(),
    language: v.union(v.literal("en"), v.literal("es"), v.literal("de"), v.literal("fr")),
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
    score: v.number(),
    ownerName: v.optional(v.string()),
    productCount: v.optional(v.number()),
    blogPostCount: v.optional(v.number()),
    firstContact: v.optional(v.string()),
    lastContact: v.optional(v.string()),
    nextAction: v.optional(v.string()),
    notes: v.array(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_domain", ["domain"]),

  // Clients - paying customers
  clients: defineTable({
    leadId: v.optional(v.id("leads")),
    domain: v.string(),
    storeName: v.string(),
    email: v.string(),
    ownerName: v.optional(v.string()),
    plan: v.union(v.literal("starter"), v.literal("growth"), v.literal("scale")),
    articlesPerDay: v.number(),
    language: v.union(v.literal("en"), v.literal("es"), v.literal("de"), v.literal("fr")),
    niche: v.string(),
    startDate: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled")),
    deliveredCount: v.number(),
    keywords: v.array(v.string()),
    notes: v.array(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),

  // Articles - generated content
  articles: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    metaDescription: v.string(),
    content: v.string(),
    targetKeyword: v.string(),
    secondaryKeywords: v.array(v.string()),
    wordCount: v.number(),
    status: v.union(
      v.literal("queued"),
      v.literal("generating"),
      v.literal("review"),
      v.literal("delivered"),
      v.literal("revision")
    ),
    deliveredAt: v.optional(v.string()),
    revisionNotes: v.optional(v.string()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"]),

  // Outreach log - email history
  outreachLog: defineTable({
    leadId: v.optional(v.id("leads")),
    clientId: v.optional(v.id("clients")),
    type: v.string(),
    email: v.string(),
    subject: v.string(),
    status: v.union(v.literal("sent"), v.literal("opened"), v.literal("replied"), v.literal("bounced")),
    sentAt: v.string(),
  })
    .index("by_lead", ["leadId"])
    .index("by_type", ["type"]),

  // Outreach preview articles — for cold email landing pages
  previewArticles: defineTable({
    slug: v.string(),
    title: v.string(),
    targetSite: v.string(),
    businessName: v.string(),
    logoUrl: v.optional(v.string()),   // scraped from target site
    preview: v.string(),   // first ~120 words shown freely
    content: v.string(),   // full article, revealed after email unlock
    keyword: v.string(),
    seoScore: v.number(),
    wordCount: v.number(),
    keywordMonthlyVolume: v.optional(v.number()),    // primary keyword monthly searches
    keywordRelatedVolume: v.optional(v.number()),    // cluster of related keywords
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  // Emails of people who unlocked an article
  articleUnlocks: defineTable({
    slug: v.string(),
    email: v.string(),
    unlockedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_email", ["email"]),

  // Daily reports
  reports: defineTable({
    date: v.string(),
    newContacts: v.number(),
    followUps: v.number(),
    replies: v.number(),
    conversions: v.number(),
    articlesGenerated: v.number(),
    articlesDelivered: v.number(),
    activeClients: v.number(),
    mrr: v.number(),
  })
    .index("by_date", ["date"]),
});
