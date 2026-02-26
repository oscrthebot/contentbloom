# BloomContent - API Unification Guide (Anthropic)

*Configuración para unificar todas las llamadas AI bajo Anthropic*

---

## Model Tiering Strategy

### Tier 1: Opus 4.5 (Highest Quality, Most Expensive)
**Uso:** Generación de contenido premium
- Artículos principales (1500+ palabras)
- Re-escrituras de revisiones
- Contenido que requiere máxima calidad

**Coste:** ~$15-30 por 1M tokens
**Config:** `anthropic/claude-opus-4-6`

### Tier 2: Sonnet (Good Quality, Balanced Cost)
**Uso:** Tareas complejas no-críticas
- Análisis de respuestas de leads
- Generación de follow-ups personalizados
- Content humanization
- QA review

**Coste:** ~$3-8 por 1M tokens
**Config:** `anthropic/claude-sonnet-4-6`

### Tier 3: Haiku (Fast, Cheapest)
**Uso:** Clasificación simple y tareas rápidas
- Clasificación de replies (interested/not_interested/question)
- Detección de idioma
- Extracción simple de datos
- Validaciones básicas

**Coste:** ~$0.25-1 por 1M tokens
**Config:** `anthropic/claude-haiku-3`

---

## Variables de Entorno (Vercel)

Añade en Vercel Dashboard → Project Settings → Environment Variables:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

**Nota:** OpenRouter como fallback si Anthropic falla:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

---

## Configuración en Código

### 1. Crear `lib/ai-config.ts`

```typescript
export const AI_MODELS = {
  content: {
    primary: "anthropic/claude-opus-4-6",
    fallback: "openrouter/moonshotai/kimi-k2.5",
  },
  analysis: {
    primary: "anthropic/claude-sonnet-4-6",
    fallback: "openrouter/moonshotai/kimi-k2.5",
  },
  classification: {
    primary: "anthropic/claude-haiku-3",
    fallback: "openrouter/google/gemini-2.0-flash-lite",
  },
};

export function getAIClient(tier: 'content' | 'analysis' | 'classification') {
  const config = AI_MODELS[tier];
  // Try Anthropic first, fallback to OpenRouter
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return { provider: 'anthropic', model: config.primary, apiKey: anthropicKey };
  }
  return { provider: 'openrouter', model: config.fallback, apiKey: process.env.OPENROUTER_API_KEY };
}
```

### 2. Actualizar `generator/pipeline-runner.ts`

```typescript
// Cambiar llamadas a AI para usar tiering

// ANTES:
const raw = await aiCall(ARTICLE_GENERATION_SYSTEM, prompt, 6000);

// DESPUÉS:
const { provider, model, apiKey } = getAIClient('content');
const raw = await aiCallWithProvider(provider, model, apiKey, ARTICLE_GENERATION_SYSTEM, prompt, 6000);
```

### 3. Actualizar `email-scheduler.py` (Follow-ups)

```python
# Para generar contenido de follow-ups, usar Sonnet (más barato que Opus)
def generate_follow_up_content(store_name, niche):
    return call_anthropic(
        model="claude-sonnet-4-6",
        system_prompt=FOLLOW_UP_SYSTEM_PROMPT,
        user_prompt=f"Generate follow-up for {store_name} in {niche}..."
    )
```

### 4. Actualizar `reply-processor.py` (Clasificación)

```python
# Para clasificar replies, usar Haiku (muy barato)
def classify_reply(reply_text):
    return call_anthropic(
        model="claude-haiku-3",
        system_prompt=CLASSIFICATION_PROMPT,
        user_prompt=reply_text,
        max_tokens=100  # Clasificación es output corto
    )
```

---

## Cost Estimates (Monthly)

Con ~100 artículos/mes + 500 emails/día:

| Uso | Modelo | Tokens/mes | Coste estimado |
|-----|--------|-----------|----------------|
| 100 artículos | Opus 4.5 | ~15M | ~$300-450 |
| 500 replies/día | Haiku | ~5M | ~$15-25 |
| 100 follow-ups/día | Sonnet | ~3M | ~$20-30 |
| QA + Humanizer | Sonnet | ~5M | ~$30-45 |
| **Total** | Mix | ~28M | **~$365-550** |

vs. Solo Opus para todo: ~$800-1200/mes

**Ahorro:** ~50-60%

---

## Fallback Strategy

Si Anthropic falla (rate limit, outage):

1. Intentar con OpenRouter mismo modelo
2. Si sigue fallando, usar NVIDIA Kimi k2.5
3. Si todo falla, encolar para retry + alerta

```typescript
async function callAIWithFallback(tier, prompt, maxRetries = 3) {
  const providers = [
    { name: 'anthropic', ...getAIClient(tier) },
    { name: 'openrouter', model: AI_MODELS[tier].fallback, apiKey: process.env.OPENROUTER_API_KEY },
    { name: 'nvidia', model: 'nvidia/moonshotai/kimi-k2.5', apiKey: process.env.NVIDIA_API_KEY },
  ];
  
  for (const provider of providers) {
    try {
      return await callProvider(provider, prompt);
    } catch (e) {
      console.log(`${provider.name} failed, trying next...`);
      continue;
    }
  }
  
  throw new Error("All AI providers failed");
}
```

---

## Checklist Implementación

- [ ] Rafa añade ANTHROPIC_API_KEY a Vercel
- [ ] Crear `lib/ai-config.ts` con tiering
- [ ] Actualizar pipeline-runner.ts (content → Opus)
- [ ] Actualizar email-scheduler.py (follow-ups → Sonnet)
- [ ] Actualizar reply-processor.py (classification → Haiku)
- [ ] Testear cada tier
- [ ] Monitorear costes
- [ ] Documentar uso real vs estimado
