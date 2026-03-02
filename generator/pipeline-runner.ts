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
  generateArticleSectioned,
  generateFAQ,
  humanizeContent,
  reviewArticle,
  detectStoreLanguage,
  fetchShopifyProducts,
  fixQAIssues,
  analyzeSearchIntent,
  analyzeSERP,
  SearchIntent,
  SERPData,
} from './article-generator';
import { scrapeLinkedInProfile, buildLinkedInEnrichment, LinkedInProfile } from '../app/lib/linkedin-scraper';
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

  // Preview mode: lower QA threshold (65), skip saving to articles table
  previewMode?: boolean;
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
    qaCriticalIssues: string[];
    frontmatter: string;
    monthlyVolume?: number;
    productBanners?: Array<{
      name: string;
      imageUrl?: string;
      price?: string;
      description?: string;
      url: string;
    }>;
  };
  convexArticleId?: string;
  error?: string;
  qaScore?: number;
  qaIssues?: string[];
  qaCriticalIssues?: string[];
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

      // Fetch authorProfile from user record if not provided in request
      if (!authorProfile) {
        try {
          const user = await convex.query(api.users.getById, {
            userId: request.userId as any,
          });
          if (user?.authorProfile) {
            authorProfile = user.authorProfile;
            console.log(`  👤 Loaded authorProfile for: ${authorProfile.fullName}`);
          }
        } catch {
          // Could not load authorProfile, continue without
        }
      }
    }
    // LinkedIn enrichment: if author has a LinkedIn URL, scrape real profile data
    let linkedInProfile: LinkedInProfile | null = null;
    if (authorProfile?.linkedinUrl) {
      try {
        console.log(`  🔗 Scraping LinkedIn: ${authorProfile.linkedinUrl}`);
        linkedInProfile = await scrapeLinkedInProfile(authorProfile.linkedinUrl);
        const enrichment = buildLinkedInEnrichment(linkedInProfile);
        if (enrichment) {
          // Enrich the author profile bio with real LinkedIn data
          authorProfile = {
            ...authorProfile,
            bio: authorProfile.bio + '\n\nLinkedIn data:\n' + enrichment,
            // Use real photo URL if scraped
            ...(linkedInProfile.photoUrl ? { photoUrl: linkedInProfile.photoUrl } as any : {}),
          };
          console.log(`  ✅ LinkedIn enrichment applied for ${authorProfile!.fullName}`);
        }
      } catch {
        // LinkedIn scraping failed gracefully — continue without enrichment
      }
    }

    steps.push({ step: '2-context', status: 'ok', durationMs: t(), note: authorProfile ? `Author: ${authorProfile.fullName}${linkedInProfile?.headline ? ` (${linkedInProfile.headline})` : ''}` : 'No author profile' });

    // Step 2b: Language detection — user's saved language is authoritative
    t = stepTimer();
    let language = request.language;

    // Try to load user's saved language preference first (most reliable)
    if (request.userId) {
      try {
        const user = await convex.query(api.users.getById, { userId: request.userId as any });
        if (user?.language && user.language !== 'en') {
          language = user.language;
          console.log(`  🌐 Using user's saved language: ${language}`);
        } else if (!language || language === 'en') {
          // Fall back to content-based detection only if no user preference
          // Detect from page text content, not HTML lang attribute (unreliable)
          const detected = await detectStoreLanguage(request.storeUrl);
          if (detected !== 'en') {
            language = detected;
            console.log(`  🌐 Detected store language: ${detected}`);
          }
        }
      } catch {
        // Could not load user language, fall back to request.language
      }
    } else if (!language || language === 'en') {
      const detected = await detectStoreLanguage(request.storeUrl);
      if (detected !== 'en') {
        language = detected;
        console.log(`  🌐 Detected store language: ${detected}`);
      }
    }

    if (!language) language = 'en';

    // Save detected language back to user record only if not already set
    if (request.userId && language !== request.language) {
      try {
        await convex.mutation(api.users.updateProfile, {
          userId: request.userId as any,
          language,
        } as any);
      } catch {}
    }
    steps.push({ step: '2b-language', status: 'ok', durationMs: t(), note: `Language: ${language}` });

    // Step 2c: Search Intent Analysis
    t = stepTimer();
    let intent: SearchIntent;
    try {
      intent = await analyzeSearchIntent(keywords.targetKeyword);
      console.log(`  🎯 Intent: ${intent.intent} (${intent.expectedFormat}), angle: ${intent.contentAngle}`);
      steps.push({ step: '2c-intent', status: 'ok', durationMs: t(), note: `${intent.intent}/${intent.expectedFormat}` });
    } catch (e) {
      intent = { intent: 'informational', expectedFormat: 'guide', contentAngle: 'comprehensive guide', recommendedWordCount: 1500 };
      steps.push({ step: '2c-intent', status: 'error', durationMs: t(), note: String(e).slice(0, 100) });
    }

    // Step 2d: SERP Analysis
    t = stepTimer();
    let serpData: SERPData;
    try {
      serpData = await analyzeSERP(keywords.targetKeyword);
      console.log(`  🔍 SERP: ${serpData.topTitles.length} competitor titles found`);
      steps.push({ step: '2d-serp', status: 'ok', durationMs: t(), note: `${serpData.topTitles.length} titles` });
    } catch (e) {
      serpData = { topTitles: [], commonH2s: [], avgWordCount: 1500, contentGaps: [] };
      steps.push({ step: '2d-serp', status: 'error', durationMs: t(), note: String(e).slice(0, 100) });
    }

    // Step 3: Generate article (section-based)
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
      authorProfile: authorProfile ?? undefined,
      existingArticles: existingArticles.length > 0 ? existingArticles : undefined,
      language,
      isPaidFeature: request.isPaidFeature,
    };

    let generated: GeneratedArticle;
    try {
      generated = await generateArticleSectioned(articleRequest, intent, serpData);
      console.log(`  ✅ Section-based generation: ${generated.wordCount} words, ${generated.title}`);
    } catch (e) {
      console.log(`  ⚠️ Section-based generation failed, falling back to monolithic: ${String(e).slice(0, 100)}`);
      generated = await generateArticle(articleRequest);
    }
    steps.push({ step: '3-generate', status: 'ok', durationMs: t(), note: `${generated.wordCount} words` });

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
      author: authorProfile
        ? {
            name: authorProfile.fullName,
            url: authorProfile.linkedinUrl,
            linkedinUrl: authorProfile.linkedinUrl,
            photoUrl: linkedInProfile?.photoUrl,
          }
        : undefined,
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

    // QA retry loop: always retry if critical issues exist, or score < threshold, or style issues > 2 (max 2 retries)
    // In preview mode: lower threshold and no retries (save API costs — previews are demos)
    const QA_THRESHOLD = request.previewMode ? 40 : 85;
    const MAX_QA_RETRIES = request.previewMode ? 0 : 2;
    let regenerationCount = 0;
    for (
      let retry = 1;
      retry <= MAX_QA_RETRIES &&
        (qa.criticalIssues.length > 0 || qa.score < QA_THRESHOLD || qa.issues.length > 2);
      retry++
    ) {
      regenerationCount = retry;
      t = stepTimer();
      const issuesSummary = [...qa.criticalIssues.map(i => `[CRITICAL] ${i}`), ...qa.issues].join('; ');
      console.log(
        `  🔄 QA retry ${retry}: score=${qa.score}, issues=${qa.issues.length}, criticalIssues=${qa.criticalIssues.length}`
      );
      console.log(`     Fixing: ${issuesSummary}`);
      humanizedContent = await fixQAIssues(humanizedContent, qa.issues, qa.criticalIssues);
      const prevScore = qa.score;
      const prevIssues = qa.issues.length;
      qa = await reviewArticle(humanizedContent, keywords.targetKeyword, request.storeName);
      console.log(`  ✅ After retry ${retry}: score ${prevScore}→${qa.score}, issues ${prevIssues}→${qa.issues.length}`);
      steps.push({ step: `8-qa-retry-${retry}`, status: 'ok', durationMs: t(), note: `Score: ${qa.score}, issues: ${qa.issues.length}, critical: ${qa.criticalIssues.length}` });
    }

    // If critical issues remain OR score still < 85 after retries → DO NOT save, return failure
    const hasCriticalRemaining = qa.criticalIssues.length > 0;
    const scoreBelowThreshold = qa.score < QA_THRESHOLD;
    // In preview mode, only check score threshold — ignore critical issues (previews are demos, not published content)
    const needsManualReview = request.previewMode
      ? scoreBelowThreshold
      : (hasCriticalRemaining || scoreBelowThreshold);
    if (needsManualReview) {
      console.warn(`  🚫 Article below QA threshold after ${MAX_QA_RETRIES} retries — score=${qa.score}, critical=${qa.criticalIssues.length}. NOT saving.`);
      return {
        success: false,
        error: `QA score ${qa.score}/100 below threshold (${QA_THRESHOLD}) after ${MAX_QA_RETRIES} retries. Critical issues: ${qa.criticalIssues.length}. Article not saved.`,
        qaScore: qa.score,
        qaIssues: qa.issues,
        qaCriticalIssues: qa.criticalIssues,
        steps,
      };
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

    // Step 10: Save to Convex — only reaches here if score >= threshold and no critical issues
    // In preview mode, skip saving to articles table (caller saves to previewArticles instead)
    t = stepTimer();
    let convexArticleId: string | undefined;
    if (request.previewMode) {
      steps.push({ step: '10-save', status: 'skipped', durationMs: t(), note: 'Preview mode — caller handles save' });
    } else try {
      const finalStatus = 'review'; // passed quality gate, ready for user review

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
        qaCriticalIssues: qa.criticalIssues,
        monthlyVolume: keywords.monthlyVolume,
        status: finalStatus,
        isPaidFeature: request.isPaidFeature ?? false,
        regenerationCount,
        productBanners: products.slice(0, 6).map(p => ({
          name: p.name,
          imageUrl: p.imageUrl,
          price: p.price,
          description: p.description?.slice(0, 120),
          url: p.url,
        })),
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
        qaCriticalIssues: qa.criticalIssues,
        frontmatter,
        monthlyVolume: keywords.monthlyVolume,
        productBanners: products.map(p => ({
          name: p.name,
          imageUrl: p.imageUrl,
          price: p.price,
          description: p.description?.slice(0, 120),
          url: p.url,
        })),
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
