/**
 * BloomContent - SEO Article Generator (v2)
 *
 * Full AI-powered pipeline using OpenRouter/Claude for:
 * - Article generation with E-E-A-T author voice
 * - FAQ generation
 * - Humanizer pass
 * - QA review
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

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
  issues: string[];          // style/flow issues
  criticalIssues: string[]; // factual errors, misleading claims, health misinformation
}

// ---------- AI Client ----------

const OPENROUTER_MODEL = process.env.AI_MODEL || 'anthropic/claude-sonnet-4-6';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

async function aiCall(systemPrompt: string, userPrompt: string, maxTokens = 4000): Promise<string> {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Try OpenRouter first
  if (openrouterKey) {
    try {
      const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: openrouterKey,
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://bloomcontent.site',
          'X-Title': 'BloomContent',
        },
      });
      const response = await client.chat.completions.create({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: Math.min(maxTokens, 3000), // cap for credit management
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content ?? '';
    } catch (e: any) {
      const msg = String(e?.message || '');
      const isFallbackError = msg.includes('402') || msg.includes('429') || msg.includes('credits') || msg.includes('quota');
      if (!isFallbackError || !anthropicKey) throw e;
      console.log('  ⚠️ OpenRouter error (fallback to Anthropic):', msg.slice(0, 120));
    }
  }

  // Fallback to direct Anthropic SDK
  if (anthropicKey) {
    const isOAuth = anthropicKey.startsWith('sk-ant-oat');

    if (isOAuth) {
      // OAuth tokens: use direct fetch with Authorization: Bearer header
      // (some Anthropic SDK versions handle this inconsistently)
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'oauth-2025-04-20',
          'Authorization': `Bearer ${anthropicKey}`,
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
      const block = data.content?.[0];
      return block?.type === 'text' ? block.text : '';
    }

    const client = new Anthropic({ apiKey: anthropicKey });
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  throw new Error('No AI API key found. Set OPENROUTER_API_KEY or ANTHROPIC_API_KEY.');
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

  return await aiCall(prompt, content);
}

// ---------- Language Instructions ----------

const langInstructions: Record<string, string> = {
  en: 'Write entirely in English (American English).',
  es: 'Write entirely in Spanish (Spain). Use natural, fluent Spanish throughout — including headings, CTAs, and all text. Do NOT mix languages.',
  de: 'Write entirely in German.',
  fr: 'Write entirely in French.',
};

// ---------- Step 3a: Article Generation ----------

export function buildArticlePrompt(params: ArticleRequest): string {
  const productList = params.products
    .map(p => `- ${p.name}: ${p.url}${p.description ? ` — ${p.description}` : ''}${(p as any).price ? ` (${(p as any).price})` : ''}`)
    .join('\n');

  const lang = params.language || 'en';
  const langInstruction = langInstructions[lang] || langInstructions['en'];
  const ctaText = lang === 'es' ? 'Ver producto →' : lang === 'de' ? 'Produkt ansehen →' : lang === 'fr' ? 'Voir le produit →' : 'Shop now';

  const authorSection = params.authorProfile
    ? `\n**AUTHOR VOICE (mandatory):**
You are writing as ${params.authorProfile.fullName}, ${params.authorProfile.yearsExperience} years of experience in ${params.authorProfile.niche}.
Bio: "${params.authorProfile.bio}"${params.authorProfile.credentials ? `\nCredentials: ${params.authorProfile.credentials}` : ''}
- Write at least 3 first-person observations in the article: "En mi experiencia...", "He probado...", "Después de años trabajando con clientes..."
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
- Include 2-3 first-person observations naturally (e.g. "I've tested...", "In my experience...", "What I've found is...")
- Include 2-3 in-content product callouts referencing THESE specific products. Format as:
  > **[Product name]** — [one-line pitch]. [${ctaText}](url)

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

STYLE RULES (strict — enforce before writing a single word):
- Use the target keyword naturally — maximum once every 200 words. Never in multiple consecutive headings.
- Write in a consistent tone throughout: informative and conversational, not switching between formal/casual.
- Every paragraph must add new information. Delete filler ("In today's world...", "It's important to note...", "In conclusion...").
- Include maximum ONE product CTA per section. Never repeat the same product twice.
- Vary sentence length: mix 8-word punchy sentences with longer flowing ones. Avoid starting 3 sentences in a row with the same word.`;

export async function generateArticle(request: ArticleRequest): Promise<GeneratedArticle> {
  const prompt = buildArticlePrompt(request);
  // Use 6000 tokens for article generation to accommodate long articles in JSON format
  const raw = await aiCall(ARTICLE_GENERATION_SYSTEM, prompt, 6000);

  // Strip markdown code fences if present (```json ... ```)
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  // Extract JSON from response
  const jsonMatch = (stripped || raw).match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('  ❌ Raw AI response (first 500 chars):', raw.slice(0, 500));
    throw new Error('Failed to parse article JSON from AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    title: string;
    metaDescription: string;
    content: string;
    secondaryKeywords: string[];
  };

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

// ---------- Step 3b: FAQ Generation ----------

export async function generateFAQ(keyword: string, content: string): Promise<FAQItem[]> {
  const prompt = `Based on this article about "${keyword}", generate 4 FAQ entries that a real person would search on Google. Each answer should be 40-60 words.

Article excerpt (first 2000 chars):
${content.slice(0, 2000)}

Return ONLY a JSON array:
[{"question": "...", "answer": "..."}, ...]`;

  const raw = await aiCall('You generate FAQ content. Return only valid JSON array.', prompt);
  const strippedFaq = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const jsonMatch = (strippedFaq || raw).match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]) as FAQItem[];
}

// ---------- Step 3c: Humanizer Pass ----------

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

export async function humanizeContent(content: string): Promise<string> {
  return await aiCall(HUMANIZER_SYSTEM, content);
}

// ---------- Step 3d: QA Review ----------

export async function reviewArticle(
  content: string,
  keyword: string,
  storeName: string
): Promise<QAResult> {
  const prompt = `Review this article for "${keyword}" written for ${storeName}.

## Style/Flow issues (go in "issues"):
- Keyword stuffing (keyword used unnaturally >5 times)
- Inconsistent tone or voice
- Filler paragraphs that add no value
- Overly aggressive or repetitive CTAs
- Awkward sentence construction

## CRITICAL issues (go in "criticalIssues") — these BLOCK delivery:
- Factual errors or invented statistics without credible basis
- Product misrepresentation (wrong prices, features, claims)
- Health misinformation (dangerous advice, exaggerated health claims)
- Missing the core topic entirely (article doesn't address "${keyword}")
- Misleading claims that could harm the reader or ${storeName}'s reputation

Article:
${content.slice(0, 6000)}

Return ONLY JSON:
{
  "score": 0-100,
  "issues": ["style issue 1", "style issue 2"],
  "criticalIssues": ["critical issue 1"]
}
Score 80+ is acceptable. criticalIssues should be empty [] if none found.`;

  const raw = await aiCall('You are an article QA reviewer. Return only valid JSON.', prompt);
  const strippedQa = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const jsonMatch = (strippedQa || raw).match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { score: 70, issues: ['Could not parse QA response'], criticalIssues: [] };
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    score: parsed.score ?? 70,
    issues: parsed.issues ?? [],
    criticalIssues: parsed.criticalIssues ?? [],
  };
}

// ---------- Keyword Research (DataForSEO or mock) ----------

export interface KeywordData {
  targetKeyword: string;
  secondaryKeywords: string[];
  monthlyVolume?: number;
}

export async function researchKeywords(
  niche: string,
  storeName: string,
  seedKeywords?: string[]
): Promise<KeywordData> {
  const dataForSEOKey = process.env.DATAFORSEO_KEY;

  if (dataForSEOKey) {
    // Real DataForSEO implementation would go here
    // For now, fall through to mock
  }

  // Mock keyword research
  const seed = seedKeywords?.[0] ?? niche;
  return {
    targetKeyword: `best ${seed} ${new Date().getFullYear()}`,
    secondaryKeywords: [
      `${seed} guide`,
      `how to choose ${seed}`,
      `${seed} for beginners`,
      `top ${seed} products`,
    ],
    monthlyVolume: 1200,
  };
}
