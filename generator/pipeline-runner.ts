/**
 * BloomContent - Article Pipeline Runner (v2)
 *
 * Orchestrates the full 10-step article generation pipeline.
 */

import {
  ArticleRequest,
  AuthorProfile,
  Product,
  ExistingArticle,
  GeneratedArticle,
  FAQItem,
  QAResult,
  KeywordData,
  researchKeywords,
  generateArticle,
  generateFAQ,
  humanizeContent,
  reviewArticle,
  detectStoreLanguage,
  fetchShopifyProducts,
  fixQAIssues,
} from './article-generator';
import { generateArticleSchema } from '../lib/schema-generator';
import { generateSlug } from '../lib/slug-generator';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// ---------- Types ----------

export interface PipelineRequest {
  // Store info
  storeName: string;
  storeUrl: string;
  niche: string;
  language: string;

  // Content config
  articleType: 'guide' | 'howto' | 'comparison' | 'listicle' | 'story';
  wordCount: number;
  seedKeywords?: string[];

  // Convex references
  clientId: string;
  userId?: string;

  // Optional overrides
  targetKeyword?: string;
  products?: Product[];
  authorProfile?: AuthorProfile;
  isPaidFeature?: boolean;
}

export interface PipelineResult {
  success: boolean;
  article?: {
    title: string;
    slug: string;
    content: string;
    rawContent: string;
    metaTitle: string;
    metaDescription: string;
    targetKeyword: string;
    secondaryKeywords: string[];
    schemaMarkup: string;
    faqItems: FAQItem[];
    wordCount: number;
    readingTime: number;
    qaScore: number;
    qaIssues: string[];
    frontmatter: string;
    monthlyVolume?: number;
  };
  convexArticleId?: string;
  error?: string;
  steps: Array<{ step: string; status: 'ok' | 'skipped' | 'error'; durationMs: number; note?: string }>;
}

// ---------- Helpers ----------

function getConvexClient(): ConvexHttpClient {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

function stepTimer() {
  const start = Date.now();
  return () => Date.now() - start;
}

// ---------- Pipeline ----------

export async function runArticlePipeline(request: PipelineRequest): Promise<PipelineResult> {
  const steps: PipelineResult['steps'] = [];
  const convex = getConvexClient();

  try {
    // Step 1: Keyword Research
    let t = stepTimer();
    let keywords: KeywordData;
    if (request.targetKeyword) {
      keywords = {
        targetKeyword: request.targetKeyword,
        secondaryKeywords: request.seedKeywords ?? [],
      };
      steps.push({ step: '1-keywords', status: 'skipped', durationMs: t(), note: 'Using provided keyword' });
    } else {
      keywords = await researchKeywords(request.niche, request.storeName, request.seedKeywords);
      steps.push({ step: '1-keywords', status: 'ok', durationMs: t() });
    }

    // Step 2: Load author/brand context + fetch products
    t = stepTimer();
    let authorProfile = request.authorProfile;
    let products = request.products ?? [];
    let existingArticles: ExistingArticle[] = [];

    // Fetch real products from Shopify if none provided
    if (products.length === 0 && request.storeUrl) {
      const shopifyProducts = await fetchShopifyProducts(request.storeUrl);
      if (shopifyProducts.length > 0) {
        products = shopifyProducts;
        console.log(`  📦 Fetched ${shopifyProducts.length} products from Shopify`);
      }
    }

    // Try to load from Convex if we have userId
    if (request.userId) {
      try {
        const userArticles = await convex.query(api.articles.getArticlesByUser, {
          userId: request.userId as any,
        });
        existingArticles = userArticles.map((a: any) => ({
          title: a.title,
          slug: a.slug ?? generateSlug(a.title, a.targetKeyword),
          keyword: a.targetKeyword,
        }));
      } catch {
        // Convex query failed, continue without
      }
    }
    steps.push({ step: '2-context', status: 'ok', durationMs: t() });

    // Step 2b: Language detection
    t = stepTimer();
    let language = request.language;
    if (!language || language === 'en') {
      const detected = await detectStoreLanguage(request.storeUrl);
      if (detected !== 'en') {
        language = detected;
        console.log(`  🌐 Detected store language: ${detected}`);
      }
    }
    // Save detected language back to user record
    if (request.userId && language !== request.language) {
      try {
        await convex.mutation(api.users.updateProfile, {
          userId: request.userId as any,
          language,
        } as any);
      } catch {}
    }
    steps.push({ step: '2b-language', status: 'ok', durationMs: t(), note: `Language: ${language}` });

    // Step 3: Generate article
    t = stepTimer();
    const articleRequest: ArticleRequest = {
      storeName: request.storeName,
      storeUrl: request.storeUrl,
      niche: request.niche,
      products,
      targetKeyword: keywords.targetKeyword,
      secondaryKeywords: keywords.secondaryKeywords,
      articleType: request.articleType,
      wordCount: request.wordCount,
      authorProfile: request.isPaidFeature ? authorProfile : undefined,
      existingArticles: existingArticles.length > 0 ? existingArticles : undefined,
      language,
      isPaidFeature: request.isPaidFeature,
    };
    const generated: GeneratedArticle = await generateArticle(articleRequest);
    steps.push({ step: '3-generate', status: 'ok', durationMs: t() });

    // Step 4: Internal linking (already injected via prompt if existingArticles provided)
    t = stepTimer();
    steps.push({
      step: '4-internal-links',
      status: existingArticles.length > 0 ? 'ok' : 'skipped',
      durationMs: t(),
      note: existingArticles.length > 0 ? `${existingArticles.length} articles available` : 'No existing articles',
    });

    // Step 5: FAQ generation
    t = stepTimer();
    const faqItems = await generateFAQ(keywords.targetKeyword, generated.content);
    steps.push({ step: '5-faq', status: 'ok', durationMs: t() });

    // Step 6: Schema markup
    t = stepTimer();
    const slug = generateSlug(generated.title, keywords.targetKeyword);
    const articleUrl = `${request.storeUrl}/blog/${slug}`;
    const schema = generateArticleSchema({
      title: generated.title,
      description: generated.metaDescription,
      url: articleUrl,
      datePublished: new Date().toISOString(),
      author: authorProfile ? { name: authorProfile.fullName, url: authorProfile.linkedinUrl } : undefined,
      publisher: { name: request.storeName, url: request.storeUrl },
      faqItems,
    });
    const schemaMarkup = JSON.stringify(schema);
    steps.push({ step: '6-schema', status: 'ok', durationMs: t() });

    // Step 7: Humanizer pass
    t = stepTimer();
    const rawContent = generated.content;
    let humanizedContent = await humanizeContent(generated.content);
    steps.push({ step: '7-humanizer', status: 'ok', durationMs: t() });

    // Step 8: QA review + auto-retry
    t = stepTimer();
    let qa: QAResult = await reviewArticle(humanizedContent, keywords.targetKeyword, request.storeName);
    steps.push({ step: '8-qa', status: 'ok', durationMs: t(), note: `Score: ${qa.score}` });

    // QA retry loop: if score < 85, fix and re-review (max 2 retries)
    const QA_THRESHOLD = 85;
    const MAX_QA_RETRIES = 2;
    for (let retry = 1; retry <= MAX_QA_RETRIES && qa.score < QA_THRESHOLD && qa.issues.length > 0; retry++) {
      t = stepTimer();
      console.log(`  🔄 QA retry ${retry}: score was ${qa.score}, issues: [${qa.issues.join('; ')}], retrying...`);
      humanizedContent = await fixQAIssues(humanizedContent, qa.issues);
      qa = await reviewArticle(humanizedContent, keywords.targetKeyword, request.storeName);
      steps.push({ step: `8-qa-retry-${retry}`, status: 'ok', durationMs: t(), note: `Score: ${qa.score}` });
    }

    // Step 9: Export markdown + frontmatter
    t = stepTimer();
    const frontmatter = `---
title: "${generated.title.replace(/"/g, '\\"')}"
slug: "${slug}"
metaDescription: "${generated.metaDescription.replace(/"/g, '\\"')}"
targetKeyword: "${keywords.targetKeyword}"
secondaryKeywords: [${keywords.secondaryKeywords.map(k => `"${k}"`).join(', ')}]
author: "${authorProfile?.fullName ?? request.storeName}"
date: "${new Date().toISOString()}"
readingTime: ${generated.readingTime}
wordCount: ${generated.wordCount}
qaScore: ${qa.score}
---`;
    steps.push({ step: '9-export', status: 'ok', durationMs: t() });

    // Step 10: Save to Convex
    t = stepTimer();
    let convexArticleId: string | undefined;
    try {
      convexArticleId = await convex.mutation(api.articles.createArticle, {
        clientId: request.clientId as any,
        title: generated.title,
        slug,
        targetKeyword: keywords.targetKeyword,
        secondaryKeywords: generated.secondaryKeywords,
        content: humanizedContent,
        rawContent,
        metaTitle: generated.title,
        metaDescription: generated.metaDescription,
        schemaMarkup,
        faqItems,
        readingTime: generated.readingTime,
        wordCount: generated.wordCount,
        canonicalUrl: articleUrl,
        qaScore: qa.score,
        qaIssues: qa.issues,
        monthlyVolume: keywords.monthlyVolume,
        status: qa.score >= 80 ? 'review' : 'generating',
        isPaidFeature: request.isPaidFeature ?? false,
      });
      steps.push({ step: '10-save', status: 'ok', durationMs: t() });
    } catch (e) {
      steps.push({ step: '10-save', status: 'error', durationMs: t(), note: String(e) });
    }

    return {
      success: true,
      article: {
        title: generated.title,
        slug,
        content: humanizedContent,
        rawContent,
        metaTitle: generated.title,
        metaDescription: generated.metaDescription,
        targetKeyword: keywords.targetKeyword,
        secondaryKeywords: generated.secondaryKeywords,
        schemaMarkup,
        faqItems,
        wordCount: generated.wordCount,
        readingTime: generated.readingTime,
        qaScore: qa.score,
        qaIssues: qa.issues,
        frontmatter,
        monthlyVolume: keywords.monthlyVolume,
      },
      convexArticleId: convexArticleId ? String(convexArticleId) : undefined,
      steps,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      steps,
    };
  }
}
