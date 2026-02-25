/**
 * BloomContent — Outreach Setup Script
 * Populates Convex with:
 *   1. All 4 BloomContent mailboxes
 *   2. Leads migrated from coldpipe SQLite
 *   3. "BloomContent Launch" campaign with improved sequence
 *
 * Usage: npx tsx scripts/setup-outreach.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexHttpClient(CONVEX_URL);

// ── 1. Mailboxes ──────────────────────────────────────────────────────────────

const MAILBOXES = [
  {
    email:       "rafa@bloomcontent.site",
    displayName: "Rafa from BloomContent",
    domain:      "bloomcontent.site",
    status:      "active" as const,
    warmupDay:   28,    // already warmed
    dailyLimit:  10,
  },
  {
    email:       "matt.roberts@bloomcontent.site",
    displayName: "Matt Roberts · BloomContent",
    domain:      "bloomcontent.site",
    status:      "active" as const,
    warmupDay:   28,    // already warmed
    dailyLimit:  10,
  },
  {
    email:       "rafa@trybloomcontent.site",
    displayName: "Rafa from BloomContent",
    domain:      "trybloomcontent.site",
    status:      "warming" as const,
    warmupDay:   1,     // started 2026-02-25
    dailyLimit:  2,
  },
  {
    email:       "matt@trybloomcontent.site",
    displayName: "Matt from BloomContent",
    domain:      "trybloomcontent.site",
    status:      "warming" as const,
    warmupDay:   1,
    dailyLimit:  2,
  },
];

// ── 2. Campaign + Sequence ───────────────────────────────────────────────────
// Templates follow cold-outreach-sequence skill principles:
//   - Specific opener (personalized per store — generated at send time via {{opener}})
//   - No "I noticed your store" generic lines
//   - Short, conversational, value-first
//   - Subject lines that feel personal not promotional

const CAMPAIGN = {
  name:           "BloomContent — Shopify Stores Q1 2026",
  dailyLimitTotal: 10,
  sendWindowStart: "09:00",
  sendWindowEnd:   "18:00",
  timezone:        "Europe/Madrid",
};

const SEQUENCE = [
  {
    stepNumber: 0,
    delayDays:  0,
    isReply:    false,
    subjectTemplate: "{{store_name}}'s blog",
    bodyTemplate: `{{opener}}

Quick question — are you publishing content on {{store_name}}'s blog? I checked and it looks like there isn't much there yet.

I run BloomContent. We write weekly SEO articles for Shopify stores — fully done for you, optimised for Google, published automatically.

Worth sending you a free sample article so you can see the quality first-hand? No catch, just a real article for your store.

{{sender_name}}`,
  },
  {
    stepNumber: 1,
    delayDays:  3,
    isReply:    true,
    subjectTemplate: "Re: {{store_name}}'s blog",
    bodyTemplate: `Bumping this up in case it got buried.

The short version: we write SEO blog content for Shopify stores. I'd send you a free article first — you decide if you want more.

If the timing's off, totally fine.

{{sender_name}}`,
  },
  {
    stepNumber: 2,
    delayDays:  5,
    isReply:    true,
    subjectTemplate: "Re: {{store_name}}'s blog",
    bodyTemplate: `One last try.

I have a sample article ready for {{store_name}} — about 1,500 words, SEO-optimised for a keyword your customers are already searching.

If you want it, just say the word. Otherwise, I'll leave you alone.

{{sender_name}}`,
  },
  {
    stepNumber: 3,
    delayDays:  7,
    isReply:    true,
    subjectTemplate: "Re: {{store_name}}'s blog",
    bodyTemplate: `I'll take this as a pass — no worries at all.

If {{store_name}}'s content strategy becomes a priority down the road, feel free to come back.

Good luck with the store.

{{sender_name}}`,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 BloomContent outreach setup\n");

  // 1. Mailboxes
  console.log("📬 Registering mailboxes...");
  for (const mb of MAILBOXES) {
    await (convex as any).mutation(api.outreach.upsertMailbox, {
      ...mb,
      smtpHost: "smtp.zoho.eu",
      smtpPort: 587,
      imapHost: "imappro.zoho.eu",
      imapPort: 993,
    });
    console.log(`  ✓ ${mb.email} [${mb.status}]`);
  }

  // 2. Campaign
  console.log("\n📋 Creating campaign...");
  const campaignId = await (convex as any).mutation(api.outreach.createCampaign, CAMPAIGN);
  console.log(`  ✓ Campaign created: ${campaignId}`);

  // 3. Sequence steps
  console.log("\n✉  Adding sequence steps...");
  for (const step of SEQUENCE) {
    await (convex as any).mutation(api.outreach.upsertSequenceStep, {
      campaignId,
      ...step,
    });
    console.log(`  ✓ Step ${step.stepNumber}: "${step.subjectTemplate}"`);
  }

  console.log("\n👥 Lead migration → run: python3 scripts/migrate-leads.py\n");

  console.log("\n✅ Done! Check Convex dashboard:");
  console.log("   https://dashboard.convex.dev\n");
}

main().catch(console.error);
