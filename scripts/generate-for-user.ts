/**
 * Generate a trial article for a specific user by email.
 * Usage: npx ts-node scripts/generate-for-user.ts rafa@happyoperators.com
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { runArticlePipeline } from '../generator/pipeline-runner';
import { Id } from '../convex/_generated/dataModel';

const email = process.argv[2] || 'rafa@happyoperators.com';

async function main() {
  console.log(`\n🚀 Generating article for: ${email}`);
  
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  // 1. Find user by email
  const user = await convex.query(api.users.getByEmail, { email });
  if (!user) {
    console.error('❌ User not found:', email);
    process.exit(1);
  }
  console.log(`✅ User found: ${user.name || user.email} | store: ${user.storeName || 'none'} | plan: ${user.plan}`);

  if (!user.storeName || !user.storeUrl) {
    console.error('❌ No store configured for this user');
    process.exit(1);
  }

  // 2. Ensure client record exists
  let clientId = user.clientId;
  if (!clientId) {
    console.log('📋 Creating client record...');
    clientId = await convex.mutation(api.userArticles.ensureClientRecord, {
      userId: user._id,
      storeName: user.storeName,
      storeUrl: user.storeUrl,
      niche: user.niche || 'general',
      email: user.email,
    });
    console.log('✅ Client record created:', clientId);
  } else {
    console.log('✅ Client record exists:', clientId);
  }

  // 3. Create generating placeholder
  console.log('\n📝 Creating generating placeholder...');
  const articleId: Id<'articles'> = await convex.mutation(api.userArticles.createPlaceholder, {
    clientId,
    niche: user.niche || 'general',
    storeName: user.storeName,
  });
  
  await convex.mutation(api.articles.updateArticleStatus, {
    id: articleId,
    status: 'generating',
  });
  console.log('✅ Placeholder created, status: generating');

  // 4. Run the pipeline
  console.log('\n⚙️  Running 10-step pipeline...');
  console.log(`   Store: ${user.storeName} (${user.storeUrl})`);
  console.log(`   Niche: ${user.niche || 'general'}\n`);

  const result = await runArticlePipeline({
    storeName: user.storeName,
    storeUrl: user.storeUrl,
    niche: user.niche || 'general',
    language: user.language || 'en',
    articleType: 'guide',
    wordCount: 1500,
    clientId: clientId as string,
    userId: user._id as string,
    authorProfile: user.authorProfile ?? undefined,
  });

  // 5. Log step results
  console.log('\n📊 Pipeline steps:');
  for (const step of result.steps) {
    const icon = step.status === 'ok' ? '✅' : step.status === 'skipped' ? '⏭️' : '❌';
    console.log(`   ${icon} ${step.step} (${step.durationMs}ms)${step.note ? ' — ' + step.note : ''}`);
  }

  if (!result.success || !result.article) {
    console.error('\n❌ Pipeline failed:', result.error);
    await convex.mutation(api.articles.updateArticleStatus, { id: articleId, status: 'queued' });
    process.exit(1);
  }

  const { article } = result;

  // 6. Save to Convex
  console.log('\n💾 Saving article to Convex...');
  await convex.mutation(api.userArticles.updateGeneratedArticle, {
    id: articleId,
    title: article.title,
    slug: article.slug,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    content: article.content,
    rawContent: article.rawContent ?? undefined,
    targetKeyword: article.targetKeyword,
    secondaryKeywords: article.secondaryKeywords,
    wordCount: article.wordCount,
    readingTime: article.readingTime,
    schemaMarkup: article.schemaMarkup ? JSON.stringify(article.schemaMarkup) : undefined,
    faqItems: article.faqItems ?? [],
    qaScore: article.qaScore ?? undefined,
    qaIssues: article.qaIssues ?? undefined,
    monthlyVolume: article.monthlyVolume ?? undefined,
    status: 'review',
  });

  console.log('\n🎉 Article generated successfully!');
  console.log(`   Title:    ${article.title}`);
  console.log(`   Keyword:  ${article.targetKeyword}`);
  console.log(`   Words:    ${article.wordCount}`);
  console.log(`   QA Score: ${article.qaScore}/100`);
  if (article.qaIssues?.length) {
    console.log(`   QA Issues: ${article.qaIssues.join(', ')}`);
  }
  console.log(`\n   Article is now in "review" status in the dashboard.\n`);
}

main().catch(console.error);
