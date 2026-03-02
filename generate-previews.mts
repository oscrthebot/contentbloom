#!/usr/bin/env tsx
/**
 * Generate personalised preview articles for cold outreach leads.
 *
 * Reads leads with status "new" that don't have a previewSlug yet,
 * runs the article pipeline in preview mode (QA threshold 65),
 * saves to the previewArticles table, and updates the lead.
 *
 * Usage:
 *   npx tsx generate-previews.mts              # process up to 50 leads
 *   npx tsx generate-previews.mts --limit 2    # process up to 2 leads (testing)
 *   npx tsx generate-previews.mts --dry-run    # list leads without generating
 */

import 'dotenv/config';

const { runArticlePipeline } = await import('./generator/pipeline-runner');
const { generateSlug } = await import('./lib/slug-generator');

// ── Config ───────────────────────────────────────────────────────────────────

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const CONVEX_KEY = process.env.CONVEX_DEPLOY_KEY!;

if (!CONVEX_URL || !CONVEX_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_DEPLOY_KEY in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const MAX_LEADS = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 50;

// ── Convex helpers ───────────────────────────────────────────────────────────

async function convexQuery(path: string, queryArgs: Record<string, any> = {}): Promise<any> {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args: queryArgs, format: 'json' }),
  });
  if (!res.ok) throw new Error(`Query ${path} failed: ${res.status} ${await res.text()}`);
  const data = await res.json() as any;
  return data.value;
}

async function convexMutation(path: string, mutArgs: Record<string, any> = {}): Promise<any> {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: {
      'Authorization': `Convex ${CONVEX_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, args: mutArgs }),
  });
  if (!res.ok) throw new Error(`Mutation ${path} failed: ${res.status} ${await res.text()}`);
  const data = await res.json() as any;
  return data.value;
}

// ── Default author for previews ──────────────────────────────────────────────

const PREVIEW_AUTHOR = {
  fullName: 'BloomContent Team',
  bio: 'We help Shopify stores grow organic traffic with AI-powered blog content.',
  yearsExperience: 5,
  niche: 'ecommerce SEO',
};

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌸 BloomContent Preview Generator`);
  console.log(`   Max leads: ${MAX_LEADS} | Dry run: ${DRY_RUN}\n`);

  // Fetch new leads without previewSlug
  const allNewLeads = await convexQuery('leads:list', { status: 'new' });
  const leads = allNewLeads
    .filter((l: any) => !l.previewSlug)
    .slice(0, MAX_LEADS);

  console.log(`📋 Found ${allNewLeads.length} new leads, ${leads.length} without preview (capped at ${MAX_LEADS})\n`);

  if (leads.length === 0) {
    console.log('✅ Nothing to do — all leads have previews or none are new.');
    return;
  }

  if (DRY_RUN) {
    for (const lead of leads) {
      console.log(`  [DRY] ${lead.storeName} (${lead.domain}) — ${lead.niche} [${lead.language}]`);
    }
    console.log(`\n🏁 Dry run complete. ${leads.length} leads would be processed.`);
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const label = `[${i + 1}/${leads.length}] ${lead.storeName}`;
    console.log(`\n━━━ ${label} ━━━`);
    console.log(`  🌐 ${lead.domain} | ${lead.niche} | ${lead.language}`);

    try {
      // Build pipeline request in preview mode
      const storeUrl = lead.domain.startsWith('http') ? lead.domain : `https://${lead.domain}`;
      const pipelineReq = {
        storeName: lead.storeName,
        storeUrl,
        niche: lead.niche,
        language: lead.language,
        articleType: 'guide' as const,
        wordCount: 1200,
        clientId: 'preview_placeholder', // not used in preview mode
        authorProfile: PREVIEW_AUTHOR,
        previewMode: true,
      };

      const result = await runArticlePipeline(pipelineReq);

      if (!result.success || !result.article) {
        console.log(`  ❌ Pipeline failed: ${result.error ?? 'unknown error'}`);
        failed++;
        continue;
      }

      const article = result.article;
      const slug = article.slug;

      // Extract preview (first ~120 words)
      const plainText = article.content.replace(/<[^>]+>/g, '').replace(/[#*_`]/g, '');
      const words = plainText.split(/\s+/);
      const preview = words.slice(0, 120).join(' ') + (words.length > 120 ? '…' : '');

      // Save to previewArticles
      await convexMutation('preview:seed', {
        slug,
        title: article.title,
        targetSite: storeUrl,
        businessName: lead.storeName,
        preview,
        content: article.content,
        keyword: article.targetKeyword,
        seoScore: article.qaScore,
        wordCount: article.wordCount,
        monthlyVolume: article.monthlyVolume,
        language: lead.language,
      });

      // Update lead with previewSlug
      await convexMutation('leads:updatePreviewSlug', {
        id: lead._id,
        previewSlug: slug,
      });

      console.log(`  ✅ Saved: "${article.title}" → /p/${slug} (QA: ${article.qaScore})`);
      success++;
    } catch (err) {
      console.error(`  ❌ Error: ${String(err).slice(0, 200)}`);
      failed++;
    }
  }

  console.log(`\n━━━ Summary ━━━`);
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  📊 Total:   ${leads.length}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
