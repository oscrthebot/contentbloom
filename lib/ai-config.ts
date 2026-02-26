/**
 * AI Configuration - Model Tiering for BloomContent
 * 
 * Tier 1 (Opus 4.5): Content generation - highest quality
 * Tier 2 (Sonnet): Analysis, follow-ups, QA - balanced cost
 * Tier 3 (Haiku): Classification, simple tasks - cheapest
 */

export type AITier = 'content' | 'analysis' | 'classification';

interface AIConfig {
  provider: 'anthropic' | 'openrouter' | 'nvidia';
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

// Model mapping by tier
const MODELS: Record<AITier, { primary: AIConfig; fallback: AIConfig }> = {
  content: {
    primary: {
      provider: 'anthropic',
      model: 'claude-opus-4-6',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      maxTokens: 6000,
      temperature: 0.7,
    },
    fallback: {
      provider: 'openrouter',
      model: 'openrouter/moonshotai/kimi-k2.5',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      maxTokens: 6000,
      temperature: 0.7,
    },
  },
  analysis: {
    primary: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      maxTokens: 4000,
      temperature: 0.5,
    },
    fallback: {
      provider: 'openrouter',
      model: 'openrouter/moonshotai/kimi-k2.5',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      maxTokens: 4000,
      temperature: 0.5,
    },
  },
  classification: {
    primary: {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      maxTokens: 500,
      temperature: 0.1,
    },
    fallback: {
      provider: 'openrouter',
      model: 'openrouter/google/gemini-2.0-flash-lite',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      maxTokens: 500,
      temperature: 0.1,
    },
  },
};

export function getAIConfig(tier: AITier, useFallback = false): AIConfig {
  const config = useFallback ? MODELS[tier].fallback : MODELS[tier].primary;
  
  // Validate API key exists
  if (!config.apiKey) {
    if (!useFallback) {
      console.warn(`No API key for ${config.provider}, using fallback`);
      return getAIConfig(tier, true);
    }
    throw new Error(`No API key available for tier: ${tier}`);
  }
  
  return config;
}

export function getModelAlias(tier: AITier): string {
  const aliases = {
    content: 'Opus',
    analysis: 'Sonnet',
    classification: 'Haiku',
  };
  return aliases[tier];
}

// Cost tracking (approximate per 1M tokens)
export const COST_PER_1M_TOKENS: Record<AITier, { input: number; output: number }> = {
  content: { input: 15, output: 75 },      // Opus
  analysis: { input: 3, output: 15 },       // Sonnet
  classification: { input: 0.25, output: 1.25 }, // Haiku
};

export function estimateCost(tier: AITier, inputTokens: number, outputTokens: number): number {
  const costs = COST_PER_1M_TOKENS[tier];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}
