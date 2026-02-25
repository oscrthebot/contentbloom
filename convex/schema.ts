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
    slug: v.optional(v.string()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.string(),
    content: v.string(),
    rawContent: v.optional(v.string()),
    targetKeyword: v.string(),
    secondaryKeywords: v.array(v.string()),
    schemaMarkup: v.optional(v.string()),
    faqItems: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
    readingTime: v.optional(v.number()),
    wordCount: v.number(),
    canonicalUrl: v.optional(v.string()),
    qaScore: v.optional(v.number()),
    qaIssues: v.optional(v.array(v.string())),
    isPaidFeature: v.optional(v.boolean()),
    status: v.union(
      v.literal("queued"),
      v.literal("generating"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("published"),
      v.literal("delivered"),
      v.literal("revision")
    ),
    deliveredAt: v.optional(v.string()),
    revisionNotes: v.optional(v.string()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_keyword", ["targetKeyword"]),

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
    keywordMonthlyVolume: v.optional(v.number()),
    keywordRelatedVolume: v.optional(v.number()),
    banners: v.optional(v.array(v.object({
      type: v.union(v.literal("product"), v.literal("newsletter"), v.literal("cta"), v.literal("pricing")),
      insertAfterHeading: v.string(),  // exact H2/H3 text to insert after, or "END"
      title: v.string(),
      description: v.string(),
      ctaText: v.string(),
      ctaUrl: v.string(),
      imageUrl: v.optional(v.string()),
      price: v.optional(v.string()),
      badge: v.optional(v.string()),
    }))),
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

  // Authenticated user accounts
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    storeName: v.optional(v.string()),
    storeUrl: v.optional(v.string()),
    niche: v.optional(v.string()),
    plan: v.union(v.literal("trial"), v.literal("starter"), v.literal("growth"), v.literal("scale"), v.literal("cancelled")),
    trialArticleUsed: v.boolean(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
    authorProfile: v.optional(v.object({
      fullName: v.string(),
      bio: v.string(),
      yearsExperience: v.number(),
      niche: v.string(),
      linkedinUrl: v.optional(v.string()),
      twitterUrl: v.optional(v.string()),
      credentials: v.optional(v.string()),
    })),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  // Magic link tokens for passwordless auth
  authTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    purpose: v.union(v.literal("login"), v.literal("onboarding")),
    onboardingPlan: v.optional(v.string()),
    metadata: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"]),

  // Sessions for logged-in users
  userSessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_session_token", ["sessionToken"])
    .index("by_user", ["userId"]),

  // Article feedback
  articleFeedback: defineTable({
    articleId: v.id("articles"),
    userId: v.id("users"),
    rating: v.union(v.literal("good"), v.literal("needs_revision")),
    comment: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_user", ["userId"]),

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
