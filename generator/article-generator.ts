/**
 * ContentBloom - SEO Article Generator (v2)
 *
 * Full AI-powered pipeline using OpenRouter/Claude for:
 * - Article generation with E-E-A-T author voice
 * - FAQ generation
 * - Humanizer pass
 * - QA review
 */

import OpenAI from 'openai';

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
  issues: string[];
}

// ---------- AI Client ----------

function getAIClient(): OpenAI {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openrouterKey) {
    return new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openrouterKey,
    });
  }
  if (anthropicKey) {
    return new OpenAI({
      baseURL: 'https://api.anthropic.com/v1',
      apiKey: anthropicKey,
    });
  }
  throw new Error('No AI API key found. Set OPENROUTER_API_KEY or ANTHROPIC_API_KEY.');
}

const MODEL = 'anthropic/claude-sonnet-4-6';

async function aiCall(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = getAIClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 8000,
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content ?? '';
}

// ---------- Step 3a: Article Generation ----------

export function buildArticlePrompt(params: ArticleRequest): string {
  const productList = params.products
    .map(p => `- ${p.name}: ${p.url}${p.description ? ` — ${p.description}` : ''}`)
    .join('\n');

  const authorSection = params.authorProfile
    ? `\n**Author Voice:** Write as ${params.authorProfile.fullName}. ${params.authorProfile.bio}. They have ${params.authorProfile.yearsExperience} years of experience in ${params.authorProfile.niche}. Use their voice and experience throughout.${params.authorProfile.credentials ? ` Credentials: ${params.authorProfile.credentials}` : ''}\n`
    : '';

  const internalLinksSection = params.existingArticles?.length
    ? `\n**Internal Links:** Include 2-3 internal links to these existing articles where relevant:\n${params.existingArticles.map(a => `- "${a.title}" → /blog/${a.slug} (keyword: ${a.keyword})`).join('\n')}\n`
    : '';

  return `You are an expert SEO copywriter for e-commerce stores. Write in ${params.language === 'en' ? 'American English' : params.language}.

Write a ${params.wordCount}+ word ${params.articleType} article for ${params.storeName} (${params.storeUrl}), an online store in the ${params.niche} space.

**Target Keyword:** "${params.targetKeyword}"
**Secondary Keywords:** ${params.secondaryKeywords.join(', ')}
${authorSection}
**IMPORTANT RULES:**
- Include 2-3 first-person observations naturally (e.g. "I've tested...", "In my experience...", "What I've found is...")
- Include 2-3 in-content product callouts referencing THESE specific products. Format as:
  > **[Product name]** — [one-line pitch]. [Shop now](url)

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

export async function generateArticle(request: ArticleRequest): Promise<GeneratedArticle> {
  const prompt = buildArticlePrompt(request);
  const raw = await aiCall('You are an SEO article writer. Return only valid JSON.', prompt);

  // Extract JSON from response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse article JSON from AI response');

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
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
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

Check for:
- Invented statistics without sources
- Keyword stuffing (keyword used unnaturally >5 times)
- Inconsistent tone
- Filler paragraphs
- Overly aggressive CTAs
- Factual claims that seem wrong

Article:
${content.slice(0, 6000)}

Return ONLY JSON: {"score": 0-100, "issues": ["issue1", "issue2"]}
Score 80+ is acceptable.`;

  const raw = await aiCall('You are an article QA reviewer. Return only valid JSON.', prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { score: 70, issues: ['Could not parse QA response'] };
  return JSON.parse(jsonMatch[0]) as QAResult;
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
