import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - store user account information
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    plan: v.union(
      v.literal("starter"),
      v.literal("growth"),
      v.literal("scale")
    ),
    stripeId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_stripe", ["stripeId"]),

  // Stores table - e-commerce stores connected to the platform
  stores: defineTable({
    userId: v.id("users"),
    name: v.string(),
    url: v.string(),
    platform: v.union(
      v.literal("shopify"),
      v.literal("woocommerce"),
      v.literal("other")
    ),
    blogUrl: v.optional(v.string()),
    shopifyAccessToken: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("pending")
    ),
    niche: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Leads table - potential customers scraped from the web
  leads: defineTable({
    url: v.string(),
    email: v.optional(v.string()),
    storeName: v.optional(v.string()),
    platform: v.optional(v.string()),
    score: v.number(), // 0-100 lead quality score
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("replied"),
      v.literal("converted"),
      v.literal("dead")
    ),
    // Scraped data
    hasBlog: v.boolean(),
    hasEmail: v.boolean(),
    niche: v.optional(v.string()),
    scrapedData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_score", ["score"])
    .index("by_url", ["url"]),

  // Content table - generated blog posts, social media, videos
  content: defineTable({
    storeId: v.id("stores"),
    type: v.union(
      v.literal("blog"),
      v.literal("social"),
      v.literal("video")
    ),
    title: v.string(),
    content: v.string(), // HTML or markdown
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed")
    ),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    shopifyArticleId: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_store", ["storeId"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledFor"]),

  // Campaigns table - email outreach campaigns
  campaigns: defineTable({
    storeId: v.optional(v.id("stores")),
    name: v.string(),
    subject: v.string(),
    body: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
    emailsSent: v.number(),
    opens: v.number(),
    replies: v.number(),
    conversions: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_store", ["storeId"])
    .index("by_status", ["status"]),
});
