/**
 * BloomContent - SEO Article Generator (v3)
 *
 * AI-powered pipeline using Anthropic directly with tiered models:
 * - Opus: content generation, outlines
 * - Sonnet: analysis, humanizer, QA, FAQ
 * - Haiku: classification, intent analysis
 *
 * Keyword research via DataForSEO with Google Suggest fallback.
 */

import Anthropic from '@anthropic-ai/sdk';
import { getAIConfig, AITier } from '../lib/ai-config';

// ---------- Types ----------

export interface AuthorProfile {
  fullName: string;
  bio: string;
  yearsExperience: number;
  niche: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  credentials?: string;
}

export interface Product {
  name: string;
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: string;
}

export interface ExistingArticle {
  title: string;
  slug: string;
  keyword: string;
}

export interface ArticleRequest {
  storeName: string;
  storeUrl: string;
  niche: string;
  products: Product[];
  targetKeyword: string;
  secondaryKeywords: string[];
  articleType: 'guide' | 'howto' | 'comparison' | 'listicle' | 'story';
  wordCount: number;
  authorProfile?: AuthorProfile;
  existingArticles?: ExistingArticle[];
  language: string;
  isPaidFeature?: boolean;
}

export interface GeneratedArticle {
  title: string;
  metaDescription: string;
  content: string;
  secondaryKeywords: string[];
  wordCount: number;
  readingTime: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface QAResult {
  score: number;
  scores?: {
    seo: number;
    eeat: number;
    readability: number;
    depth: number;
    originality: number;
  };
  issues: string[];
  criticalIssues: string[];
  strengths?: string[];
}

// ---------- AI Client (Tiered) ----------

async function aiCall(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4000,
  tier: AITier = 'analysis'
): Promise<string> {
  const config = getAIConfig(tier);
  const apiKey = config.apiKey;
  const isOAuth = apiKey.startsWith('sk-ant-oat');

  if (isOAuth) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'oauth-2025-04-20',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        temperature: config.temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
    const block = data.content?.[0];
    return block?.type === 'text' ? block.text : '';
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: config.model,
    max_tokens: maxTokens,
    temperature: config.temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

// ---------- Language Detection ----------

export async function detectStoreLanguage(storeUrl: string): Promise<string> {
  try {
    const url = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await res.text();
    const match = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
    if (match) return match[1].split('-')[0].toLowerCase();
  } catch {}
  return 'en';
}

// ---------- Shopify Product Fetching ----------

export async function fetchShopifyProducts(storeUrl: string): Promise<Product[]> {
  try {
    const base = (storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`).replace(/\/$/, '');
    const res = await fetch(`${base}/products.json?limit=10`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).slice(0, 6).map((p: any) => ({
      name: p.title,
      url: `${base}/products/${p.handle}`,
      description: p.body_html?.replace(/<[^>]*>/g, '').slice(0, 120) || '',
      price: p.variants?.[0]?.price ? `$${p.variants[0].price}` : undefined,
      imageUrl: p.images?.[0]?.src || p.featured_image?.src || undefined,
    }));
  } catch {
    return [];
  }
}

// ---------- QA Fix Pass ----------

export async function fixQAIssues(
  content: string,
  issues: string[],
  criticalIssues?: string[]
): Promise<string> {
  const allIssues = [
    ...(criticalIssues && criticalIssues.length > 0
      ? criticalIssues.map(i => `[CRITICAL] ${i}`)
      : []),
    ...issues,
  ];

  const prompt = `You are an expert editor. Fix the following issues in this article, one by one.
CRITICAL issues marked with [CRITICAL] must be fixed first and thoroughly — they involve factual errors, health misinformation, or misleading claims.
Do NOT add new content beyond what is needed to fix the issues.
Only fix the specific problems listed.

Issues to fix:
${allIssues.map((i, n) => `${n + 1}. ${i}`).join('\n')}

Return ONLY the corrected article text, no commentary.`;

  return await aiCall(prompt, content, 8000, 'analysis');
}

// ---------- Keyword Research (DataForSEO + fallback) ----------

export interface KeywordData {
  targetKeyword: string;
  secondaryKeywords: string[];
  monthlyVolume?: number;
  difficulty?: number;
}

interface DataForSEOKeyword {
  keyword: string;
  search_volume: number;
  competition: number;
}

function getDataForSEOAuth(): string | null {
  const login = process.env.DATAFORSEO_API_LOGIN || process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_API_PASSWORD || process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return null;
  return Buffer.from(`${login}:${password}`).toString('base64');
}

async function fetchKeywordSuggestions(seed: string, language = 'English', location = 'United States'): Promise<string[]> {
  const auth = getDataForSEOAuth();
  if (!auth) return [];

  try {
    const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ keywords: [seed], language_name: language, location_name: location }]),
    });
    const data = await res.json();
    const items = data?.tasks?.[0]?.result || [];
    return items.map((item: any) => item.keyword).filter(Boolean).slice(0, 20);
  } catch (e) {
    console.log('  ⚠️ DataForSEO suggestions failed:', String(e).slice(0, 120));
    return [];
  }
}

async function fetchSearchVolumes(keywords: string[]): Promise<DataForSEOKeyword[]> {
  if (keywords.length === 0) return [];
  const auth = getDataForSEOAuth();
  if (!auth) return keywords.map(k => ({ keyword: k, search_volume: 0, competition: 0.5 }));

  try {
    const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ keywords }]),
    });
    const data = await res.json();
    const items = data?.tasks?.[0]?.result || [];
    return items.map((item: any) => ({
      keyword: item.keyword,
      search_volume: item.search_volume ?? 0,
      competition: item.competition ?? 0.5,
    }));
  } catch (e) {
    console.log('  ⚠️ DataForSEO volumes failed:', String(e).slice(0, 120));
    return keywords.map(k => ({ keyword: k, search_volume: 0, competition: 0.5 }));
  }
}

function selectBestKeyword(keywords: DataForSEOKeyword[]): DataForSEOKeyword {
  if (keywords.length === 0) return { keyword: '', search_volume: 0, competition: 0.5 };
  // Score = volume / (competition + 0.1) to favor high volume + low competition
  return keywords.reduce((best, k) => {
    const score = k.search_volume / (k.competition + 0.1);
    const bestScore = best.search_volume / (best.competition + 0.1);
    return score > bestScore ? k : best;
  });
}

async function googleSuggestFallback(seed: string): Promise<string[]> {
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return (data[1] || []).slice(0, 10);
  } catch {
    return [];
  }
}

export async function researchKeywords(
  niche: string,
  storeName: string,
  seedKeywords?: string[]
): Promise<KeywordData> {
  const seed = seedKeywords?.[0] || niche;

  // Try DataForSEO first
  let suggestions = await fetchKeywordSuggestions(seed);

  // Fallback to Google Suggest if DataForSEO fails
  if (suggestions.length === 0) {
    console.log('  ⚠️ DataForSEO unavailable, using Google Suggest fallback');
    suggestions = await googleSuggestFallback(seed);
  }

  // If we have suggestions, get volumes
  if (suggestions.length > 0) {
    const withVolume = await fetchSearchVolumes(suggestions.slice(0, 10));
    const best = selectBestKeyword(withVolume);

    if (best.keyword) {
      return {
        targetKeyword: best.keyword,
        secondaryKeywords: withVolume
          .filter(k => k.keyword !== best.keyword)
          .slice(0, 5)
          .map(k => k.keyword),
        monthlyVolume: best.search_volume,
        difficulty: best.competition,
      };
    }
  }

  // Final fallback: generate from seed
  return {
    targetKeyword: `best ${seed} ${new Date().getFullYear()}`,
    secondaryKeywords: [
      `${seed} guide`,
      `how to choose ${seed}`,
      `${seed} for beginners`,
      `top ${seed} products`,
    ],
    monthlyVolume: 0,
  };
}

// ---------- Search Intent Analysis (MEJORA 3) ----------

export interface SearchIntent {
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  expectedFormat: 'listicle' | 'guide' | 'howto' | 'comparison' | 'review';
  contentAngle: string;
  recommendedWordCount: number;
}

export async function analyzeSearchIntent(keyword: string): Promise<SearchIntent> {
  const result = await aiCall(
    `Classify search intent for the keyword. Return ONLY valid JSON, no markdown.`,
    `Keyword: "${keyword}"

Analyze and return:
{
  "intent": "informational|transactional|navigational|commercial",
  "expectedFormat": "listicle|guide|howto|comparison|review",
  "contentAngle": "one sentence describing what the user wants to find",
  "recommendedWordCount": number between 800 and 3000
}`,
    500,
    'classification'
  );
  try {
    const cleaned = result.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : cleaned);
  } catch {
    return { intent: 'informational', expectedFormat: 'guide', contentAngle: 'comprehensive guide', recommendedWordCount: 1500 };
  }
}

// ---------- SERP Analysis (MEJORA 4) ----------

export interface SERPData {
  topTitles: string[];
  commonH2s: string[];
  avgWordCount: number;
  contentGaps: string[];
}

export async function analyzeSERP(keyword: string): Promise<SERPData> {
  const auth = getDataForSEOAuth();
  if (!auth) return { topTitles: [], commonH2s: [], avgWordCount: 1500, contentGaps: [] };

  try {
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        keyword,
        language_code: 'es',
        location_code: 2724,
        depth: 10,
      }]),
    });
    const data = await response.json();
    const results = data?.tasks?.[0]?.result?.[0]?.items || [];

    return {
      topTitles: results.filter((r: any) => r.type === 'organic').slice(0, 5).map((r: any) => r.title).filter(Boolean),
      commonH2s: [],
      avgWordCount: 1500,
      contentGaps: [],
    };
  } catch {
    return { topTitles: [], commonH2s: [], avgWordCount: 1500, contentGaps: [] };
  }
}

// ---------- Section-based Generation (MEJORA 5) ----------

interface OutlineSection {
  heading: string;
  subsections: string[];
  keyPoints: string[];
}

interface ArticleOutline {
  title: string;
  sections: OutlineSection[];
}

async function generateOutline(
  keyword: string,
  intent: SearchIntent,
  serpData: SERPData,
  niche: string,
  language: string
): Promise<ArticleOutline> {
  const raw = await aiCall(
    `You are an expert SEO content strategist. Create a detailed article outline. Return ONLY valid JSON, no markdown fences.`,
    `Create an outline for an article targeting: "${keyword}"

Search intent: ${intent.intent} (${intent.expectedFormat})
Content angle: ${intent.contentAngle}
Competitor titles: ${serpData.topTitles?.join(', ') || 'none available'}
Target word count: ${intent.recommendedWordCount}
Niche: ${niche}
Language: ${language}

Return JSON:
{
  "title": "SEO-optimized article title in ${language}",
  "sections": [
    {
      "heading": "H2 heading",
      "subsections": ["H3 subheading 1", "H3 subheading 2"],
      "keyPoints": ["key point to cover", "specific data to include"]
    }
  ]
}

Create 5-8 sections. Make the outline unique vs competitors.`,
    1500,
    'content'
  );

  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : cleaned);
  } catch {
    // Fallback outline
    return {
      title: `${keyword} - Complete Guide`,
      sections: [
        { heading: `What is ${keyword}?`, subsections: [], keyPoints: ['definition', 'overview'] },
        { heading: `Benefits of ${keyword}`, subsections: [], keyPoints: ['key advantages'] },
        { heading: `How to Choose the Best ${keyword}`, subsections: [], keyPoints: ['selection criteria'] },
        { heading: `Top Recommendations`, subsections: [], keyPoints: ['expert picks'] },
        { heading: `Conclusion`, subsections: [], keyPoints: ['summary', 'next steps'] },
      ],
    };
  }
}

async function generateSection(
  heading: string,
  subsections: string[],
  keyPoints: string[],
  context: { keyword: string; previousContent: string; products: Product[]; authorVoice: string; language: string }
): Promise<string> {
  return await aiCall(
    `You are an expert content writer. Write ONLY the section content in ${context.language}. No JSON wrapper, no markdown fences. Just the section text with proper markdown headings.`,
    `Write the section "${heading}" for an article about "${context.keyword}".

Subsections to cover: ${subsections.join(', ') || 'none specified'}
Key points to include: ${keyPoints.join(', ')}

Author voice (use naturally): ${context.authorVoice}

Previous article content (for context/flow):
${context.previousContent.slice(-1000)}

${context.products.length > 0 ? `If this section is a good fit, include ONE product recommendation using EXACTLY this markdown blockquote format:
> **[Product Name]** — [one-sentence pitch relevant to this section].
> [Ver producto →](product_url)

Available products:
${context.products.slice(0, 2).map(p => `- Name: "${p.name || p.title}" | URL: ${p.url}${p.description ? ` | Info: ${p.description.slice(0, 80)}` : ''}${p.price ? ` | Price: ${p.price}` : ''}`).join('\n')}

Only include a product banner if it fits naturally. Do NOT force it in every section.` : ''}

Requirements:
- 200-400 words for this section
- Natural, expert tone
- Include first-person observation if relevant
- No keyword stuffing
- Write in ${context.language}`,
    1500,
    'content'
  );
}

function assembleArticle(outline: ArticleOutline, sections: string[]): string {
  return sections.join('\n\n');
}

// ---------- Public: Section-based Article Generation ----------

export async function generateArticleSectioned(
  request: ArticleRequest,
  intent: SearchIntent,
  serpData: SERPData
): Promise<GeneratedArticle> {
  const language = request.language || 'en';
  const authorVoice = request.authorProfile
    ? `${request.authorProfile.fullName}, ${request.authorProfile.yearsExperience} years in ${request.authorProfile.niche}. ${request.authorProfile.bio}`
    : `Expert in ${request.niche}`;

  // Step 1: Generate outline
  console.log('  📝 Generating article outline...');
  const outline = await generateOutline(
    request.targetKeyword, intent, serpData, request.niche, language
  );
  console.log(`  📋 Outline: "${outline.title}" with ${outline.sections.length} sections`);

  // Step 2: Generate each section
  const sectionTexts: string[] = [];
  let previousContent = '';

  for (let i = 0; i < outline.sections.length; i++) {
    const section = outline.sections[i];
    console.log(`  ✍️  Section ${i + 1}/${outline.sections.length}: ${section.heading}`);
    const text = await generateSection(
      section.heading,
      section.subsections,
      section.keyPoints,
      {
        keyword: request.targetKeyword,
        previousContent,
        products: request.products.slice(i % request.products.length, (i % request.products.length) + 2),
        authorVoice,
        language,
      }
    );
    sectionTexts.push(text);
    previousContent += '\n\n' + text;
  }

  // Step 3: Assemble
  const content = assembleArticle(outline, sectionTexts);
  const wordCount = content.split(/\s+/).length;

  // Generate meta description
  const metaRaw = await aiCall(
    'Generate a compelling SEO meta description. Return ONLY the text, 150-160 characters.',
    `Article title: "${outline.title}"\nKeyword: "${request.targetKeyword}"\nLanguage: ${language}`,
    200,
    'classification'
  );

  return {
    title: outline.title,
    metaDescription: metaRaw.trim().slice(0, 160),
    content,
    secondaryKeywords: request.secondaryKeywords,
    wordCount,
    readingTime: Math.ceil(wordCount / 200),
  };
}

// ---------- Legacy: Monolithic Article Generation (kept as fallback) ----------

const langInstructions: Record<string, string> = {
  en: 'Write entirely in English (American English).',
  es: 'Write entirely in Spanish (Spain). Use natural, fluent Spanish throughout — including headings, CTAs, and all text. Do NOT mix languages.',
  de: 'Write entirely in German.',
  fr: 'Write entirely in French.',
};

export function buildArticlePrompt(params: ArticleRequest): string {
  const productList = params.products
    .map(p => `- ${p.name}: ${p.url}${p.description ? ` — ${p.description}` : ''}${p.price ? ` (${p.price})` : ''}`)
    .join('\n');

  const lang = params.language || 'en';
  const langInstruction = langInstructions[lang] || langInstructions['en'];
  const ctaText = lang === 'es' ? 'Ver producto →' : lang === 'de' ? 'Produkt ansehen →' : lang === 'fr' ? 'Voir le produit →' : 'Shop now';

  const authorSection = params.authorProfile
    ? `\n**AUTHOR VOICE (mandatory):**
You are writing as ${params.authorProfile.fullName}, ${params.authorProfile.yearsExperience} years of experience in ${params.authorProfile.niche}.
Bio: "${params.authorProfile.bio}"${params.authorProfile.credentials ? `\nCredentials: ${params.authorProfile.credentials}` : ''}
- Write at least 3 first-person observations in the article
- Reference their expertise naturally in the text
- The author voice should feel authentic, not promotional\n`
    : '';

  const internalLinksSection = params.existingArticles?.length
    ? `\n**Internal Links:** Include 2-3 internal links to these existing articles where relevant:\n${params.existingArticles.map(a => `- "${a.title}" → /blog/${a.slug} (keyword: ${a.keyword})`).join('\n')}\n`
    : '';

  return `You are an expert SEO copywriter for e-commerce stores. ${langInstruction}

Write a ${params.wordCount}+ word ${params.articleType} article for ${params.storeName} (${params.storeUrl}), an online store in the ${params.niche} space.

**Target Keyword:** "${params.targetKeyword}"
**Secondary Keywords:** ${params.secondaryKeywords.join(', ')}
${authorSection}
**IMPORTANT RULES:**
- Include 2-3 first-person observations naturally
- Include 2-3 in-content product callouts referencing THESE specific products. Use EXACTLY this blockquote format (two lines):
  > **[Product Name]** — [one-line pitch relevant to the surrounding content].
  > [${ctaText}](url)

**Products to feature:**
${productList}
${internalLinksSection}
**SEO Requirements:**
- Target keyword in title, first paragraph, and 2-3 times naturally throughout
- Use H2 and H3 headings with keyword variations
- Compelling meta description (150-160 characters)

**Tone:** Friendly, expert, conversational. Help the reader, don't hard-sell.

**Output as JSON only:**
{
  "title": "SEO-optimized title",
  "metaDescription": "150-160 char description",
  "content": "Full article in markdown",
  "secondaryKeywords": ["kw1", "kw2", "kw3"]
}`;
}

const ARTICLE_GENERATION_SYSTEM = `You are an SEO article writer. Return only valid JSON.

STYLE RULES (strict):
- Use the target keyword naturally — maximum once every 200 words.
- Write in a consistent tone throughout: informative and conversational.
- Every paragraph must add new information. Delete filler.
- Include maximum ONE product CTA per section. Never repeat the same product twice.
- Vary sentence length: mix short punchy sentences with longer flowing ones.`;

export async function generateArticle(request: ArticleRequest): Promise<GeneratedArticle> {
  const prompt = buildArticlePrompt(request);
  const raw = await aiCall(ARTICLE_GENERATION_SYSTEM, prompt, 6000, 'content');

  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const jsonMatch = (stripped || raw).match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('  ❌ Raw AI response (first 500 chars):', raw.slice(0, 500));
    throw new Error('Failed to parse article JSON from AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const wordCount = parsed.content.split(/\s+/).length;
  return {
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    content: parsed.content,
    secondaryKeywords: parsed.secondaryKeywords,
    wordCount,
    readingTime: Math.ceil(wordCount / 200),
  };
}

// ---------- FAQ Generation ----------

export async function generateFAQ(keyword: string, content: string): Promise<FAQItem[]> {
  const prompt = `Based on this article about "${keyword}", generate 4 FAQ entries that a real person would search on Google. Each answer should be 40-60 words.

Article excerpt (first 2000 chars):
${content.slice(0, 2000)}

Return ONLY a JSON array:
[{"question": "...", "answer": "..."}, ...]`;

  const raw = await aiCall('You generate FAQ content. Return only valid JSON array.', prompt, 4000, 'analysis');
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const jsonMatch = (stripped || raw).match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]) as FAQItem[];
}

// ---------- Humanizer Pass (Multi-pass) ----------

const HUMANIZER_SYSTEM = `You are an editor removing AI-generated writing patterns. Edit the text to:
- Remove: "ultimate guide", "comprehensive", "expert tips", "groundbreaking", "in conclusion", "dive into", "delve into", "it's worth noting"
- Remove em dash overuse (replace with comma or period)
- Remove "rule of three" lists where not natural
- Remove promotional adjectives: "stunning", "vibrant", "breathtaking", "game-changing"
- Replace "serves as / stands as" with "is / has / does"
- Remove filler: "In order to", "At this point in time", "It is important to note"
- Vary sentence length: mix short punchy sentences with longer flowing ones
- Keep all factual content, internal links, product callouts, and SEO keywords intact
- Do NOT add new content, only edit existing text
Return only the edited text, no commentary.`;

export async function humanizeContent(content: string, passes = 2): Promise<string> {
  let current = content;

  for (let pass = 0; pass < passes; pass++) {
    const systemPrompt = pass === 0
      ? HUMANIZER_SYSTEM
      : `You are an editor doing a second polish pass. Your job:
- Vary sentence rhythm more aggressively. Mix very short sentences with flowing ones.
- Shorten some paragraphs to 1-2 sentences.
- Add 1-2 conversational asides ("Honestly, ...", "In my experience, ...").
- Break some compound sentences into simpler ones.
- Add minor imperfections in formality — real writers aren't perfectly polished.
- Keep ALL factual content, links, product callouts, and keywords intact.
- Do NOT add new sections or substantially new content.
Return only the edited text, no commentary.`;

    console.log(`  🔄 Humanizer pass ${pass + 1}/${passes}`);
    current = await aiCall(systemPrompt, current, 8000, 'analysis');
  }

  return current;
}

// ---------- QA Review (Multi-dimensional) ----------

export async function reviewArticle(
  contentOrArticle: string | GeneratedArticle,
  keyword: string,
  storeName: string
): Promise<QAResult> {
  const content = typeof contentOrArticle === 'string' ? contentOrArticle : contentOrArticle.content;
  const title = typeof contentOrArticle === 'string' ? '' : contentOrArticle.title;
  const wordCount = content.split(/\s+/).length;

  const prompt = `Review this article across multiple dimensions.

Article title: ${title || '(not provided)'}
Target keyword: ${keyword}
Store: ${storeName}
Word count: ${wordCount}

Article content (full):
${content.slice(0, 6000)}

Evaluate and return JSON:
{
  "scores": {
    "seo": 0-100,
    "eeat": 0-100,
    "readability": 0-100,
    "depth": 0-100,
    "originality": 0-100
  },
  "score": 0-100,
  "issues": ["style/flow issue 1", ...],
  "criticalIssues": ["critical issue 1", ...],
  "strengths": ["what's working well"]
}

Score weights: seo=25%, eeat=30%, readability=15%, depth=20%, originality=10%

CRITICAL issues (go in criticalIssues) BLOCK delivery:
- Factual errors or invented statistics
- Health misinformation
- Missing the core topic entirely
- Misleading claims

Be strict. A score of 85+ means this article would genuinely help rank.`;

  const raw = await aiCall(
    'You are a senior SEO editor and content quality auditor. Be strict and honest. Return only valid JSON.',
    prompt,
    2000,
    'analysis'
  );

  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const jsonMatch = (stripped || raw).match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { score: 70, issues: ['Could not parse QA response'], criticalIssues: [] };

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    score: parsed.score ?? 70,
    scores: parsed.scores,
    issues: parsed.issues ?? [],
    criticalIssues: parsed.criticalIssues ?? [],
    strengths: parsed.strengths,
  };
}
