/**
 * BloomContent — Local Pipeline Runner
 * Processes a specific article by ID or polls for queued articles.
 * Usage: npx tsx --tsconfig pipeline-server/tsconfig.json pipeline-server/run-queued.ts [articleId]
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '/root/.openclaw/workspace/contentbloom/.env' });

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { runArticlePipeline } from '../generator/pipeline-runner';
import { Id } from '../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function processArticle(articleId?: string) {
  try {
    let target: any;

    if (articleId) {
      // Get specific article
      const article = await convex.query(api.userArticles.getNextQueued, {});
      // Fetch article directly
      const user = await convex.query(api.users.getByEmail, { email: 'rafa@happyoperators.com' });
      target = {
        _id: articleId as Id<'articles'>,
        clientId: user?.clientId,
        storeName: user?.storeName || 'Misihu Cosmetics',
        storeUrl: user?.storeUrl || 'https://misihucosmetics.com',
        niche: user?.niche || 'cosmetics and skincare',
        language: user?.language || 'es',
        userId: user?._id,
        authorProfile: user?.authorProfile,
      };
    } else {
      target = await convex.query(api.userArticles.getNextQueued, {});
    }

    if (!target) {
      console.log(`[${new Date().toISOString()}] No articles to process.`);
      return;
    }

    console.log(`[${new Date().toISOString()}] 🚀 Processing: ${target.storeName} (${target.storeUrl})`);

    const result = await runArticlePipeline({
      storeName: target.storeName,
      storeUrl: target.storeUrl,
      niche: target.niche || 'general',
      language: target.language || 'es',
      articleType: 'guide',
      wordCount: 1500,
      clientId: target.clientId,
      userId: target.userId,
      authorProfile: target.authorProfile,
    });

    if (result.success && result.article) {
      const a = result.article;
      await convex.mutation(api.userArticles.updateGeneratedArticle, {
        id: target._id,
        title: a.title,
        slug: a.slug,
        metaTitle: a.metaTitle,
        metaDescription: a.metaDescription,
        content: a.content,
        rawContent: a.rawContent ?? undefined,
        targetKeyword: a.targetKeyword,
        secondaryKeywords: a.secondaryKeywords,
        wordCount: a.wordCount,
        readingTime: a.readingTime,
        schemaMarkup: a.schemaMarkup ? JSON.stringify(a.schemaMarkup) : undefined,
        faqItems: a.faqItems ?? [],
        qaScore: a.qaScore ?? undefined,
        qaIssues: a.qaIssues ?? undefined,
        productBanners: (a as any).productBanners ?? undefined,
        status: (a.qaScore ?? 0) >= 85 ? 'review' : 'needs_review',
      });
      console.log(`[${new Date().toISOString()}] ✅ Done: "${a.title}" — score ${a.qaScore}`);
      console.log(`View at: https://bloomcontent.site/dashboard/articles/${target._id}`);
    } else {
      console.error(`[${new Date().toISOString()}] ❌ Pipeline failed`);
    }
  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    console.error(err.stack);
  }
}

const articleId = process.argv[2];
processArticle(articleId).then(() => process.exit(0));
