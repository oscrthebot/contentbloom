/**
 * Seed script for demo analytics data.
 * Run with: npx convex run seedAnalytics:seedDemoData
 *
 * Creates fake articleUnlocks entries spread over the last 30 days.
 * Safe to run multiple times (clears existing seed data first).
 */

import { mutation } from "./_generated/server";

const DEMO_ARTICLES = [
  {
    slug: "best-running-shoes-marathon-2026",
    title: "10 Best Running Shoes for Marathon Training",
    targetSite: "runnersgear.com",
    businessName: "RunnersGear",
    preview: "Choosing the right running shoe can make or break your marathon preparation...",
    content: "## Introduction\n\nMarathon training requires the right gear...\n\n## Top Picks\n\n• ASICS Gel-Nimbus 26\n• Nike Vaporfly 3\n• Brooks Ghost 16\n",
    keyword: "best running shoes marathon",
    seoScore: 87,
    wordCount: 1850,
    keywordMonthlyVolume: 12400,
    keywordRelatedVolume: 45000,
  },
  {
    slug: "yoga-mat-buying-guide-2026",
    title: "Yoga Mat Buying Guide: Complete 2026 Edition",
    targetSite: "yogaessentials.com",
    businessName: "Yoga Essentials",
    preview: "A quality yoga mat is the foundation of any good practice...",
    content: "## Why Your Mat Matters\n\nThe right yoga mat prevents slipping...\n\n## Best Mats by Category\n\n• Best Overall: Liforme Original\n• Budget Pick: Gaiam Premium\n",
    keyword: "best yoga mat 2026",
    seoScore: 82,
    wordCount: 1600,
    keywordMonthlyVolume: 8900,
    keywordRelatedVolume: 32000,
  },
  {
    slug: "protein-powder-muscle-gain-guide",
    title: "How to Build Muscle with Protein Powder",
    targetSite: "supplementsplus.com",
    businessName: "Supplements Plus",
    preview: "Protein powder is one of the most researched sports supplements...",
    content: "## Protein Basics\n\nMuscle protein synthesis requires adequate protein intake...\n\n## Top Picks\n\n• Whey: Optimum Nutrition Gold Standard\n• Plant: Garden of Life Sport\n",
    keyword: "protein powder muscle gain",
    seoScore: 79,
    wordCount: 1420,
    keywordMonthlyVolume: 6700,
    keywordRelatedVolume: 28000,
  },
  {
    slug: "standing-desk-guide-home-office",
    title: "Best Standing Desks for Home Office 2026",
    targetSite: "officefurnitureco.com",
    businessName: "Office Furniture Co",
    preview: "Sitting all day is harmful to your health. A standing desk can change that...",
    content: "## The Case for Standing\n\nStudies show prolonged sitting increases health risks...\n\n## Top Standing Desks\n\n• Flexispot E7 Pro\n• Uplift V2\n• Branch Standing Desk\n",
    keyword: "best standing desk home office",
    seoScore: 85,
    wordCount: 1700,
    keywordMonthlyVolume: 9200,
    keywordRelatedVolume: 37000,
  },
  {
    slug: "coffee-maker-espresso-machine-comparison",
    title: "Espresso Machine vs. Coffee Maker: Which is Right for You?",
    targetSite: "brewmasters.com",
    businessName: "Brew Masters",
    preview: "The great debate between espresso machines and drip coffee makers...",
    content: "## Key Differences\n\nEspresso machines use pressure to extract concentrated coffee...\n\n## Best Picks\n\n• Espresso: Breville Barista Express\n• Drip: Technivorm Moccamaster\n",
    keyword: "espresso machine vs coffee maker",
    seoScore: 76,
    wordCount: 1300,
    keywordMonthlyVolume: 5400,
    keywordRelatedVolume: 21000,
  },
];

const DEMO_EMAILS = [
  "john.smith@gmail.com",
  "sarah.jones@outlook.com",
  "mike.chen@gmail.com",
  "emma.wilson@yahoo.com",
  "james.brown@hotmail.com",
  "olivia.davis@gmail.com",
  "noah.miller@company.com",
  "ava.garcia@gmail.com",
  "liam.martinez@business.io",
  "sophia.anderson@gmail.com",
  "mason.taylor@shopify.com",
  "isabella.thomas@gmail.com",
  "ethan.jackson@outlook.com",
  "mia.white@yahoo.com",
  "oliver.harris@company.org",
  "charlotte.martin@gmail.com",
  "william.lee@gmail.com",
  "amelia.perez@hotmail.com",
  "james.thompson@business.com",
  "harper.hall@gmail.com",
  "benjamin.walker@gmail.com",
  "evelyn.allen@outlook.com",
  "henry.young@company.co",
  "abigail.hernandez@gmail.com",
  "alexander.king@business.net",
  "emily.wright@gmail.com",
  "daniel.scott@yahoo.com",
  "elizabeth.green@gmail.com",
  "sebastian.baker@shopify.com",
  "sofia.adams@gmail.com",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Seed demo articles
    for (const article of DEMO_ARTICLES) {
      const existing = await ctx.db
        .query("previewArticles")
        .withIndex("by_slug", (q) => q.eq("slug", article.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("previewArticles", {
          ...article,
          createdAt: Date.now() - randomInt(1, 60) * 24 * 60 * 60 * 1000,
        });
      }
    }

    // 2. Seed demo unlock events (last 30 days, weighted toward recent days)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    let inserted = 0;

    for (const article of DEMO_ARTICLES) {
      // Each article gets 8–25 unlocks
      const unlockCount = randomInt(8, 25);
      const usedEmails = new Set<string>();

      for (let i = 0; i < unlockCount; i++) {
        // Pick a random email (no duplicates per article)
        let email: string;
        let attempts = 0;
        do {
          email = DEMO_EMAILS[randomInt(0, DEMO_EMAILS.length - 1)];
          attempts++;
        } while (usedEmails.has(email) && attempts < 50);

        if (usedEmails.has(email)) continue;
        usedEmails.add(email);

        // Timestamp: weighted toward recent (exponential decay)
        const fraction = Math.random() ** 1.5; // skew toward recent
        const ts = thirtyDaysAgo + fraction * (now - thirtyDaysAgo);

        // Check if already exists
        const existing = await ctx.db
          .query("articleUnlocks")
          .withIndex("by_slug", (q) => q.eq("slug", article.slug))
          .filter((q) => q.eq(q.field("email"), email))
          .first();

        if (!existing) {
          await ctx.db.insert("articleUnlocks", {
            slug: article.slug,
            email,
            unlockedAt: Math.round(ts),
          });
          inserted++;
        }
      }
    }

    return {
      message: `✅ Seeded ${DEMO_ARTICLES.length} articles and ${inserted} unlock events`,
      articles: DEMO_ARTICLES.length,
      unlocks: inserted,
    };
  },
});
