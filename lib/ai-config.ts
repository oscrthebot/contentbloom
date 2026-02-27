/**
 * AI Configuration - Model Tiering for BloomContent
 * 
 * Tier 1 (Opus): Content generation - highest quality
 * Tier 2 (Sonnet): Analysis, follow-ups, QA - balanced cost
 * Tier 3 (Haiku): Classification, simple tasks - cheapest
 * 
 * All calls go through Anthropic directly. No OpenRouter.
 */

export type AITier = 'content' | 'analysis' | 'classification';

export interface AIConfig {
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}

const TIER_CONFIGS: Record<AITier, AIConfig> = {
  content: {
    model: 'claude-opus-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    maxTokens: 6000,
    temperature: 0.7,
  },
  analysis: {
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    maxTokens: 4000,
    temperature: 0.5,
  },
  classification: {
    model: 'claude-3-haiku-20240307',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    maxTokens: 500,
    temperature: 0.1,
  },
};

export function getAIConfig(tier: AITier): AIConfig {
  const config = TIER_CONFIGS[tier];
  if (!config.apiKey) {
    throw new Error(`No ANTHROPIC_API_KEY set for tier: ${tier}`);
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
  content: { input: 15, output: 75 },
  analysis: { input: 3, output: 15 },
  classification: { input: 0.25, output: 1.25 },
};

export function estimateCost(tier: AITier, inputTokens: number, outputTokens: number): number {
  const costs = COST_PER_1M_TOKENS[tier];
  return (inputTokens / 1_000_000) * costs.input + (outputTokens / 1_000_000) * costs.output;
}
