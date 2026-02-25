/**
 * Cleanup duplicate/placeholder articles. Keeps only the best article per client.
 * Usage: npx tsx scripts/cleanup-articles.ts rafa@happyoperators.com
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

const email = process.argv[2] || 'rafa@happyoperators.com';

async function main() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const user = await convex.query(api.users.getByEmail, { email });
  if (!user?.clientId) { console.error('No client found'); process.exit(1); }

  const result = await convex.query(api.userArticles.listForUser, {
    sessionToken: '__admin__', // won't work — use direct query
  });

  // Use direct articles query instead
  const articles = await convex.query(api.articles.getArticlesByUser, { userId: user._id as any });

  console.log(`Found ${articles.length} articles for ${email}:`);
  articles.forEach((a: any, i: number) => {
    console.log(`  ${i+1}. [${a.status}] ${a.title} (${a.wordCount}w, QA:${a.qaScore || '?'})`);
  });

  // Keep: articles with real content (wordCount > 0) that are in 'review' status
  // Delete: placeholders (wordCount = 0 or title starts with "Generating"), duplicates
  const toKeep = articles
    .filter((a: any) => a.wordCount > 0 && a.status === 'review')
    .sort((a: any, b: any) => (b.qaScore || 0) - (a.qaScore || 0)); // best QA score first

  // From duplicates with same title, keep only the first (highest QA)
  const seenTitles = new Set<string>();
  const keepIds = new Set<string>();
  for (const a of toKeep) {
    if (!seenTitles.has(a.title)) {
      seenTitles.add(a.title);
      keepIds.add(a._id);
    }
  }

  const toDelete = articles.filter((a: any) => !keepIds.has(a._id));

  console.log(`\nKeeping ${keepIds.size} articles:`);
  articles.filter((a: any) => keepIds.has(a._id)).forEach((a: any) => {
    console.log(`  ✅ ${a.title} (QA: ${a.qaScore || '?'})`);
  });

  console.log(`\nDeleting ${toDelete.length} articles:`);
  for (const a of toDelete) {
    console.log(`  🗑️  ${a.title} [${a.status}]`);
    await convex.mutation(api.articles.deleteArticle, { id: a._id });
  }

  console.log('\n✅ Cleanup complete.');
}

main().catch(console.error);
