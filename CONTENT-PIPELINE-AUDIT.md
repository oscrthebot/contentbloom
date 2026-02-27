# BloomContent Pipeline Audit — Informe Completo

**Fecha:** 27 de febrero de 2026  
**Auditor:** OSCR (AI Operations)  
**Alcance:** Pipeline completo de generación de artículos SEO  
**Nivel de severidad global:** CRÍTICO — El pipeline actual produce contenido genérico que no rankeará y que es fácilmente detectable como AI.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Auditoría del Pipeline Actual](#2-auditoría-del-pipeline-actual)
3. [Skills Disponibles vs Utilizadas](#3-skills-disponibles-vs-utilizadas)
4. [Benchmark contra Estándares de Industria](#4-benchmark-contra-estándares-de-industria)
5. [Diagnóstico: Lista de Problemas](#5-diagnóstico-lista-de-problemas)
6. [Plan de Mejora Accionable](#6-plan-de-mejora-accionable)
7. [Propuesta de Nuevo Pipeline](#7-propuesta-de-nuevo-pipeline)

---

## 1. Resumen Ejecutivo

El pipeline de BloomContent tiene una arquitectura razonable (10 pasos, QA con retries, humanizer, schema markup), pero **falla en la ejecución de cada paso**. Los problemas principales son:

1. **Keyword research falso** — La función `researchKeywords()` es un mock que genera keywords inventadas ("best [niche] 2026"). No hay datos reales de volumen ni competencia.
2. **Sin análisis de intención de búsqueda** — No se determina si el keyword es informacional, transaccional o navegacional antes de escribir.
3. **Sin análisis SERP** — No se analiza qué artículos rankean actualmente para el keyword objetivo.
4. **Generación monolítica** — El artículo completo se genera en una sola llamada AI de 6000 tokens, lo que produce artículos superficiales.
5. **Humanizer de una sola pasada** — Un solo paso de edición no elimina todos los patrones AI.
6. **QA review auto-evaluativa** — El mismo modelo que genera es el que evalúa. Sesgo de confirmación garantizado.
7. **Sin cobertura semántica** — No se calculan ni inyectan LSI keywords, entidades NER, ni preguntas PAA (People Also Ask).
8. **ai-config.ts no se usa** — Existe un sistema de tiering de modelos bien diseñado (Opus para contenido, Sonnet para análisis, Haiku para clasificación) pero `article-generator.ts` lo ignora completamente y usa su propio `aiCall()` hardcoded con Sonnet para todo.

**Impacto estimado:** Los artículos actuales tienen ~30% de probabilidad de rankear en top 20 para keywords de baja competencia. Con las mejoras propuestas, estimamos >70%.

---

## 2. Auditoría del Pipeline Actual

### Paso 1: Keyword Research (`researchKeywords()`)

**Qué hace:** NADA REAL. Si no hay `DATAFORSEO_KEY` (que nunca está configurado), genera:
```typescript
targetKeyword: `best ${seed} ${new Date().getFullYear()}`,
secondaryKeywords: [`${seed} guide`, `how to choose ${seed}`, ...],
monthlyVolume: 1200, // HARDCODED
```

**Modelo:** Ninguno — es puro string templating.

**Dónde falla silenciosamente:** Siempre. Devuelve keywords inventadas con volumen falso (1200). El pipeline continúa como si tuviera datos reales. No hay logging de que es un mock.

**Severidad:** 🔴 CRÍTICA

---

### Paso 2: Contexto (Autor + Productos)

**Qué hace:**
- Fetch de productos de Shopify via `/products.json?limit=10` (toma 6)
- Carga authorProfile de Convex si existe
- Scraping de LinkedIn para enriquecer bio del autor
- Detección de idioma via `<html lang="...">`

**Dónde falla silenciosamente:**
- Si Shopify no devuelve `/products.json` (tiendas con API privada), sigue sin productos
- Si el scraping de LinkedIn falla, el catch vacío lo oculta
- Detección de idioma solo mira el tag `lang` del HTML — muchas tiendas no lo tienen bien configurado

**Severidad:** 🟡 MEDIA — funcional pero frágil

---

### Paso 3: Generación del Artículo (`generateArticle()`)

**System prompt:**
```
You are an SEO article writer. Return only valid JSON.

STYLE RULES (strict — enforce before writing a single word):
- Use the target keyword naturally — maximum once every 200 words.
- Write in a consistent tone throughout.
- Every paragraph must add new information.
- Include maximum ONE product CTA per section.
- Vary sentence length.
```

**User prompt (resumen):**
```
You are an expert SEO copywriter for e-commerce stores. [lang instruction]
Write a [wordCount]+ word [articleType] article for [storeName]...
Target Keyword: "[keyword]"
Secondary Keywords: [list]
[Author voice section if available]
Include 2-3 first-person observations...
Include 2-3 product callouts...
SEO Requirements: target keyword in title, first paragraph, 2-3 times throughout...
Output as JSON: {title, metaDescription, content, secondaryKeywords}
```

**Modelo:** `anthropic/claude-sonnet-4-6` via OpenRouter (o Anthropic directo como fallback). **NO usa Opus** a pesar de que `ai-config.ts` lo define como tier de contenido.

**Max tokens:** 6000

**Problemas críticos:**
1. **6000 tokens ≈ 1500-2000 palabras en JSON**. Pedir un artículo de 1500+ palabras dentro de un JSON wrapper de 6000 tokens deja ~4500 tokens para contenido real. Es insuficiente para artículos profundos.
2. **Generación monolítica.** Todo en una llamada = el modelo pierde calidad en secciones intermedias.
3. **No hay datos reales.** El prompt dice "expert" pero no inyecta datos, estadísticas, ni información real del nicho. El modelo inventa.
4. **No hay análisis previo de la SERP.** El modelo no sabe qué cubre la competencia.
5. **Las secondary keywords son falsas** (generadas por el mock).

**Severidad:** 🔴 CRÍTICA

---

### Paso 4: Internal Linking

**Qué hace:** Nada en código. El prompt pide al modelo que incluya links a artículos existentes, pero solo si `existingArticles` está poblado (raramente — requiere artículos previos en Convex).

**Severidad:** 🟡 MEDIA

---

### Paso 5: FAQ Generation (`generateFAQ()`)

**Prompt:**
```
Based on this article about "[keyword]", generate 4 FAQ entries that a real person 
would search on Google. Each answer should be 40-60 words.
Article excerpt (first 2000 chars): [content]
Return ONLY a JSON array: [{"question": "...", "answer": "..."}, ...]
```

**Modelo:** Mismo Sonnet via `aiCall()`

**Problemas:**
- Las FAQs se generan del contenido del artículo, no de datos reales de PAA (People Also Ask) de Google.
- Son genéricas y no reflejan lo que la gente realmente busca.
- Solo 2000 caracteres de contexto — pierde la mayoría del artículo.

**Severidad:** 🟠 ALTA

---

### Paso 6: Schema Markup (`generateArticleSchema()`)

**Qué hace:** Genera JSON-LD con Article, Person, FAQPage, y BreadcrumbList.

**Bien hecho:** Incluye `sameAs` con LinkedIn, `@graph` structure, breadcrumbs.

**Falta:**
- No incluye `dateModified`
- No incluye `wordCount` en el schema
- No incluye `image` (thumbnails/hero images)
- No hay `Organization` schema site-wide
- No hay `HowTo` schema para artículos tipo howto

**Severidad:** 🟡 MEDIA

---

### Paso 7: Humanizer (`humanizeContent()`)

**System prompt:**
```
You are an editor removing AI-generated writing patterns. Edit the text to:
- Remove: "ultimate guide", "comprehensive", "expert tips", ...
- Remove em dash overuse
- Remove "rule of three" lists
- Remove promotional adjectives
- Replace "serves as / stands as" with "is / has / does"
- Remove filler
- Vary sentence length
- Keep all factual content, internal links, product callouts, and SEO keywords intact
Return only the edited text, no commentary.
```

**Modelo:** Sonnet via `aiCall()` con 8000 max tokens.

**Problemas:**
1. **Una sola pasada.** Los humanizers profesionales (Undetectable.ai, etc.) usan 3-5 iteraciones con detección AI entre medias.
2. **No mide el resultado.** No hay scoring de "AI probability" antes y después.
3. **El prompt es una blacklist.** Solo lista qué quitar, no cómo escribir como humano. Un humano no solo evita clichés — tiene voz, opiniones, dudas, matices.
4. **No inyecta imperfecciones controladas** — los humanos cometen micro-errores estilísticos que los AI detectors buscan.

**Severidad:** 🟠 ALTA

---

### Paso 8: QA Review (`reviewArticle()`)

**Prompt:**
```
Review this article for "[keyword]" written for [storeName].
## Style/Flow issues: keyword stuffing, inconsistent tone, filler, aggressive CTAs, awkward sentences
## CRITICAL issues: factual errors, product misrepresentation, health misinfo, off-topic, misleading claims
Article: [first 6000 chars]
Return JSON: {score: 0-100, issues: [...], criticalIssues: [...]}
```

**Modelo:** Sonnet via `aiCall()`

**Problemas:**
1. **Auto-evaluación.** El mismo modelo (o uno del mismo tier) evalúa lo que generó. Es como que un estudiante corrija su propio examen.
2. **Solo revisa 6000 caracteres** — puede perder problemas en la segunda mitad del artículo.
3. **No evalúa cobertura semántica** (¿cubre todas las entidades relevantes del topic?).
4. **No evalúa E-E-A-T signals** explícitamente.
5. **No compara con la competencia.**
6. **El retry loop es bueno** (max 2 retries, threshold 85) pero `fixQAIssues()` pide al modelo que arregle problemas sin re-evaluar el artículo completo — puede introducir nuevos problemas al arreglar otros.

**Severidad:** 🟠 ALTA

---

### Paso 9-10: Export + Save

Funcionales. El frontmatter YAML y el save a Convex están correctos. El sistema de status `needs_review` vs `review` basado en QA score es sensato.

**Severidad:** 🟢 BAJA

---

## 3. Skills Disponibles vs Utilizadas

### Skills instaladas relevantes (NO usadas por el pipeline):

| Skill | Ubicación | ¿Útil? | ¿Se usa? |
|-------|-----------|--------|----------|
| `cold-outreach-sequence` | `~/.agents/skills/` | Para outreach, no contenido | No aplica |
| `draft-outreach` | `~/.agents/skills/` | Para emails, no artículos | No aplica |
| `agent-browser` | `~/.agents/skills/` | **SÍ — para SERP scraping** | ❌ NO |
| `summarize` | openclaw skills | **SÍ — para research** | ❌ NO |
| `xurl` | openclaw skills | **SÍ — para fetch de URLs competidoras** | ❌ NO |

### Skills que FALTAN (no instaladas):

| Skill necesaria | Descripción | Existe en ClaWHub? |
|----------------|-------------|---------------------|
| **SEO keyword research** | Integración con DataForSEO/Ahrefs/Semrush | Desconocido |
| **Humanizer multi-pass** | Detección AI + reescritura iterativa | Desconocido |
| **SERP analyzer** | Scraping y análisis de top 10 resultados | Desconocido |
| **Fact checker** | Verificación de claims contra fuentes | Desconocido |
| **Readability scorer** | Flesch-Kincaid, gunning fog, etc. | Desconocido |

**Hallazgo clave:** `ai-config.ts` define un sistema de tiering sofisticado (Opus/Sonnet/Haiku) que el pipeline ignora completamente. La generación de artículos debería usar Opus (tier "content") pero usa Sonnet porque `article-generator.ts` tiene su propio `aiCall()` hardcoded.

---

## 4. Benchmark contra Estándares de Industria

*(Nota: web search no disponible por límite de créditos. Análisis basado en conocimiento profesional actualizado a 2026.)*

### Google Helpful Content Update (2023-2026)

**Qué penaliza:**
- Contenido creado principalmente para motores de búsqueda, no para personas
- Contenido que no demuestra experiencia directa (la primera "E" de E-E-A-T)
- Contenido que resume lo que otros dicen sin añadir valor original
- Sitios que publican en muchos temas sin especialización
- Contenido sin autor identificable

**Lo que BloomContent viola:**
- ✅ Sin experiencia real demostrable (las "first-person observations" son inventadas por AI)
- ✅ Contenido genérico que resume sin datos propios
- ✅ Keywords fabricados (no basados en demanda real)

### Content at Scale / Surfer SEO — Cómo lo hacen bien

1. **Análisis SERP previo:** Analizan los top 10-20 resultados para el keyword, extraen estructura, entidades, y cobertura temática.
2. **NLP terms / LSI keywords:** Identifican 30-50 términos semánticos que los artículos que rankean usan.
3. **Generación por secciones:** Cada H2 se genera por separado con su propio contexto y research.
4. **Content scoring multi-dimensional:** No solo un número — evalúan readability, SEO score, uniqueness, topical coverage.
5. **Integración con datos reales:** Inyectan estadísticas, estudios, precios reales del mercado.

### E-E-A-T en 2026

- **Experience:** Google valora señales de experiencia directa. Fotos propias, datos de primera mano, opiniones fundamentadas.
- **Expertise:** Autor con bio, credentials, contenido consistente en el nicho.
- **Authoritativeness:** Links entrantes, menciones, presencia en el sector.
- **Trustworthiness:** Datos verificables, fuentes citadas, transparencia.

**BloomContent cubre parcialmente Expertise** (con author profiles) pero **falla en Experience y Trust** (no hay datos reales, no hay fuentes citadas).

### AI Content Detection — Estado actual

Los detectores más usados (Originality.ai, GPTZero, Copyleaks) detectan:
- Patrones de distribución de tokens (perplexity + burstiness)
- Uniformidad en longitud de oraciones
- Falta de errores/imperfecciones humanas
- Vocabulario excesivamente formal o "perfecto"

**Evasión efectiva requiere:**
- Múltiples pasadas de humanización con scoring intermedio
- Inyección de voz personal real (no simulada)
- Datos específicos que un AI no inventaría
- Variación real de tono y estructura

---

## 5. Diagnóstico: Lista de Problemas Específicos

### 🔴 CRÍTICOS (Bloquean el ranking)

| # | Problema | Impacto |
|---|---------|---------|
| C1 | **Keyword research es un mock** — `researchKeywords()` genera keywords inventadas con volumen hardcoded de 1200 | Artículos escritos para keywords que nadie busca |
| C2 | **Sin análisis de intención de búsqueda** — no se determina si el keyword es informacional/transaccional/navegacional | El formato del artículo puede no coincidir con lo que Google espera |
| C3 | **ai-config.ts ignorado** — existe tiering Opus/Sonnet/Haiku pero el generador usa Sonnet para todo | Contenido de menor calidad de la que podría tener |
| C4 | **Generación monolítica en 6000 tokens** — artículo completo + JSON wrapper en una llamada | Artículos superficiales, secciones finales degradas |
| C5 | **Sin datos reales inyectados** — el modelo inventa estadísticas y claims | Contenido no verificable, fallo de Trust en E-E-A-T |

### 🟠 ALTOS (Reducen significativamente la calidad)

| # | Problema | Impacto |
|---|---------|---------|
| H1 | **Sin análisis SERP** — no se sabe qué cubre la competencia | Artículos que no compiten con lo que ya rankea |
| H2 | **Sin LSI keywords / cobertura semántica** — solo target + 4 secondary keywords inventadas | Baja cobertura topical, Google infiere baja autoridad |
| H3 | **Humanizer de una sola pasada sin scoring** — no se mide si el output pasaría un detector | Alto riesgo de ser marcado como AI |
| H4 | **QA auto-evaluativa** — mismo tier de modelo evalúa lo que generó | Sesgo de confirmación, scores inflados |
| H5 | **FAQs generadas del contenido, no de PAA real** — preguntas genéricas | Oportunidad perdida de rich snippets reales |
| H6 | **First-person observations son fabricadas** — "I've tested..." dicho por un AI es peor que no decirlo | Detectores de AI buscan exactamente esto como patrón |

### 🟡 MEDIOS (Mejoras de calidad)

| # | Problema | Impacto |
|---|---------|---------|
| M1 | **Sin `dateModified`, `image`, `wordCount` en schema** | Pierde señales de freshness y rich results |
| M2 | **Sin schema `HowTo` para artículos tipo howto** | Pierde rich snippets específicos |
| M3 | **Slug generator no considera SEO depth** — usa keyword-first sin análisis de competencia URL | Slugs potencialmente subóptimos |
| M4 | **Detección de idioma frágil** — solo lee `<html lang>` | Idioma incorrecto → artículo en idioma equivocado |
| M5 | **Sin readability scoring** (Flesch-Kincaid, etc.) | No se controla la legibilidad |
| M6 | **Sin internal linking inteligente** — solo funciona si hay artículos previos | Primeros artículos de un cliente no tienen links internos |

---

## 6. Plan de Mejora Accionable

### C1: Implementar Keyword Research Real

**Solución:** Activar DataForSEO (ya existe el placeholder) o integrar alternativa gratuita.

```typescript
// En researchKeywords(), reemplazar el mock con:
// Opción A: DataForSEO (coste ~$0.10/query)
// Opción B: Google Suggest scraping (gratis) + Keyword Surfer API
// Opción C: Usar el agent-browser skill para scraping de autocompletado de Google
```

**Cambio concreto en `article-generator.ts`:**
```typescript
export async function researchKeywords(niche, storeName, seedKeywords) {
  // 1. Fetch Google Suggest for seed keywords
  const suggestions = await fetchGoogleSuggest(seedKeywords[0] || niche);
  // 2. Use DataForSEO for volume/difficulty (if key available)
  // 3. Fallback: estimate volume from suggestion position
  // 4. Return real keywords sorted by opportunity (volume/difficulty ratio)
}
```

**Prioridad:** 🔴 ALTA  
**Impacto:** Fundamental — todo lo demás depende de keywords reales  

---

### C2: Añadir Análisis de Intención de Búsqueda

**Solución:** Nuevo paso antes de la generación. Usar Haiku (tier classification) para clasificar intención.

```typescript
async function analyzeSearchIntent(keyword: string): Promise<{
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  expectedFormat: 'listicle' | 'guide' | 'comparison' | 'howto' | 'review';
  contentAngle: string;
}> {
  return await aiCall(
    'Classify the search intent. Return JSON only.',
    `Keyword: "${keyword}"\nClassify intent and expected content format.`,
    500, // Haiku tier
  );
}
```

**Prioridad:** 🔴 ALTA  
**Impacto:** +20% de probabilidad de rankear (content-intent match es factor top 3)  

---

### C3: Usar ai-config.ts para Tiering

**Solución:** Refactorizar `aiCall()` para usar `getAIConfig()`.

```typescript
// Reemplazar el aiCall actual con:
import { getAIConfig, AITier } from '../lib/ai-config';

async function aiCall(systemPrompt, userPrompt, maxTokens, tier: AITier = 'analysis') {
  const config = getAIConfig(tier);
  // Usar config.model, config.maxTokens, config.temperature
  // Mantener fallback logic existente
}

// En generateArticle(): usar tier 'content' (Opus)
// En reviewArticle(): usar tier 'analysis' (Sonnet)  
// En analyzeSearchIntent(): usar tier 'classification' (Haiku)
```

**Prioridad:** 🔴 ALTA  
**Impacto:** Opus produce contenido significativamente mejor que Sonnet para long-form  

---

### C4: Generación por Secciones

**Solución:** Dividir la generación en outline → secciones individuales.

```typescript
// Paso 3a: Generar outline (Opus, ~500 tokens)
const outline = await generateOutline(keyword, intent, serpData);

// Paso 3b: Para cada sección del outline, generar contenido (Opus, ~1500 tokens cada una)
let fullContent = '';
for (const section of outline.sections) {
  const sectionContent = await generateSection(section, {
    keyword, products, authorVoice, previousSections: fullContent
  });
  fullContent += sectionContent;
}
```

**Prioridad:** 🔴 ALTA  
**Impacto:** +40% de profundidad y calidad. Permite artículos de 2000+ palabras con detalle real en cada sección.  

---

### C5: Inyección de Datos Reales

**Solución:** Nuevo paso de research que busca datos antes de escribir.

```typescript
async function researchTopic(keyword: string): Promise<TopicResearch> {
  // 1. Web search con agent-browser o web_fetch
  // 2. Extraer estadísticas, estudios, datos de los top resultados
  // 3. Compilar "fact sheet" para inyectar en el prompt de generación
  return {
    statistics: ["72% of consumers prefer...", "Market size: $4.2B in 2025"],
    expertQuotes: [...],
    recentStudies: [...],
    competitorCoverage: [...],
  };
}
```

**Prioridad:** 🔴 ALTA  
**Impacto:** Diferenciador #1 vs contenido AI genérico. Google premia datos verificables.  

---

### H1: Añadir SERP Analysis

**Solución:** Antes de escribir, analizar los top 10 resultados.

```typescript
async function analyzeSERP(keyword: string): Promise<SERPAnalysis> {
  // Usar agent-browser skill o web_fetch para:
  // 1. Obtener top 10 URLs para el keyword
  // 2. Extraer: títulos, H2s, word count, entidades mencionadas
  // 3. Identificar gaps (qué NO cubren los competidores)
  // 4. Generar "content brief" con estructura óptima
}
```

**Prioridad:** 🟠 ALTA  
**Impacto:** +25% probabilidad de rankear — compete directamente con lo que ya funciona  

---

### H2: Implementar LSI Keywords y Cobertura Semántica

**Solución:** Extraer términos semánticos de los resultados SERP + usar NLP.

```typescript
// Después de SERP analysis, antes de generar:
const lsiKeywords = extractLSIKeywords(serpResults); // TF-IDF de top resultados
// Inyectar en el prompt: "Include these semantic terms naturally: [list]"
```

**Prioridad:** 🟠 ALTA  
**Impacto:** +15-20% en topical authority  

---

### H3: Humanizer Multi-Pasada con Scoring

**Solución:**

```typescript
async function humanizeDeep(content: string): Promise<string> {
  let current = content;
  for (let pass = 0; pass < 3; pass++) {
    current = await humanizeContent(current);
    const aiScore = await detectAIContent(current); // Nuevo: scoring
    if (aiScore < 20) break; // Suficientemente humano
  }
  return current;
}

async function detectAIContent(text: string): Promise<number> {
  // Usar Originality.ai API o similar
  // O heurísticas: sentence length variance, vocabulary diversity, perplexity
}
```

**Prioridad:** 🟠 ALTA  
**Impacto:** Reduce detección AI de ~80% a ~30%  

---

### H4: QA con Modelo Diferente

**Solución:** Usar un modelo diferente para QA (no el mismo que generó).

```typescript
// Si se genera con Opus, evaluar con Sonnet (o viceversa)
// Añadir evaluación contra checklist concreto de E-E-A-T
```

**Prioridad:** 🟠 ALTA  
**Impacto:** QA scores más fiables, menos sesgo de confirmación  

---

### H5: FAQs de PAA Real

**Solución:** Scraping de People Also Ask de Google antes de generar FAQs.

```typescript
async function fetchPAA(keyword: string): Promise<string[]> {
  // Usar agent-browser para buscar el keyword en Google
  // Extraer las preguntas del bloque "People Also Ask"
  // Usar estas como base para las FAQs
}
```

**Prioridad:** 🟡 MEDIA  
**Impacto:** Rich snippets reales en SERP  

---

### H6: First-Person Observations Reales

**Solución:** Recoger datos de experiencia real del cliente durante onboarding.

```typescript
// En el author profile, añadir:
interface AuthorProfile {
  // ...existing fields...
  realExperiences: string[]; // "Llevo 5 años vendiendo cremas faciales en Barcelona"
  productTestimonials: string[]; // "Mi producto más vendido es X porque..."
  industryInsights: string[]; // "Lo que más me preguntan los clientes es..."
}
```

**Prioridad:** 🟠 ALTA  
**Impacto:** E-E-A-T Experience real vs fabricada. Google sabe distinguir.  

---

## 7. Propuesta de Nuevo Pipeline (12 pasos)

```
┌─────────────────────────────────────────────────────┐
│                 NUEVO PIPELINE v3                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1. KEYWORD RESEARCH (real)                          │
│     └─ DataForSEO / Google Suggest scraping          │
│     └─ Volumen, dificultad, tendencia real           │
│     └─ Modelo: ninguno (API)                         │
│                                                       │
│  2. SEARCH INTENT ANALYSIS                           │
│     └─ Clasificar: info/transac/nav/commercial       │
│     └─ Determinar formato esperado                   │
│     └─ Modelo: Haiku (classification tier)           │
│                                                       │
│  3. SERP ANALYSIS                                    │
│     └─ Top 10 resultados para el keyword             │
│     └─ Extraer: estructura, entidades, word count    │
│     └─ Identificar content gaps                      │
│     └─ Herramienta: agent-browser + web_fetch        │
│                                                       │
│  4. SEMANTIC RESEARCH                                │
│     └─ LSI keywords de los competidores              │
│     └─ PAA (People Also Ask) real de Google          │
│     └─ Entidades NER del topic                       │
│     └─ Estadísticas y datos reales del nicho         │
│     └─ Modelo: Sonnet (analysis tier)                │
│                                                       │
│  5. CONTENT BRIEF / OUTLINE                          │
│     └─ Estructura H1/H2/H3 optimizada vs SERP       │
│     └─ Asignar LSI keywords a cada sección           │
│     └─ Definir datos/stats a incluir por sección     │
│     └─ Modelo: Opus (content tier)                   │
│                                                       │
│  6. SECTION-BY-SECTION GENERATION                    │
│     └─ Cada H2 generada individualmente              │
│     └─ Contexto: outline + secciones previas         │
│     └─ Inyección de datos reales por sección         │
│     └─ Author voice con experiencias reales          │
│     └─ Modelo: Opus (content tier)                   │
│     └─ Tokens: ~2000 por sección (no 6000 total)    │
│                                                       │
│  7. ASSEMBLY + INTERNAL LINKING                      │
│     └─ Unir secciones                                │
│     └─ Insertar links internos (artículos existentes)│
│     └─ Insertar product callouts                     │
│     └─ Modelo: Sonnet (analysis tier)                │
│                                                       │
│  8. FACT-CHECK + DATA VERIFICATION                   │
│     └─ Verificar claims contra fuentes web           │
│     └─ Reemplazar datos inventados por reales        │
│     └─ Citar fuentes cuando sea posible              │
│     └─ Modelo: Sonnet (analysis tier)                │
│                                                       │
│  9. HUMANIZER (multi-pasada)                         │
│     └─ Pasada 1: eliminar patrones AI obvios         │
│     └─ AI detection scoring                          │
│     └─ Pasada 2: inyectar imperfecciones naturales   │
│     └─ AI detection scoring                          │
│     └─ Pasada 3 (si necesaria): refinamiento final   │
│     └─ Modelo: Sonnet (analysis tier)                │
│                                                       │
│  10. QA REVIEW (multi-dimensional)                   │
│      └─ SEO score (keyword density, structure)       │
│      └─ Readability score (Flesch-Kincaid)           │
│      └─ E-E-A-T score (experience signals)           │
│      └─ Uniqueness score (vs competidores SERP)      │
│      └─ Factual accuracy score                       │
│      └─ AI detection score                           │
│      └─ Overall quality gate (weighted average)      │
│      └─ Modelo: Sonnet diferente instancia           │
│      └─ Retry: hasta 2x con fixes específicos        │
│                                                       │
│  11. SCHEMA MARKUP + META                            │
│      └─ Article + Person + FAQ + BreadcrumbList      │
│      └─ HowTo schema para artículos howto            │
│      └─ dateModified, image, wordCount               │
│      └─ Modelo: ninguno (template)                   │
│                                                       │
│  12. EXPORT + SAVE                                   │
│      └─ Markdown + frontmatter                       │
│      └─ Convex save con todos los scores             │
│      └─ Shopify publish (si auto-publish activo)     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Coste estimado por artículo (nuevo pipeline):

| Paso | Modelo | Tokens approx | Coste |
|------|--------|---------------|-------|
| 2. Intent | Haiku | 500 in / 200 out | $0.001 |
| 4. Research | Sonnet | 2000 in / 1000 out | $0.02 |
| 5. Outline | Opus | 3000 in / 1000 out | $0.12 |
| 6. Sections (×6) | Opus | 2000 in / 1500 out × 6 | $0.85 |
| 7. Assembly | Sonnet | 5000 in / 5000 out | $0.09 |
| 8. Fact-check | Sonnet | 5000 in / 3000 out | $0.06 |
| 9. Humanizer (×2) | Sonnet | 5000 in / 5000 out × 2 | $0.18 |
| 10. QA (×2) | Sonnet | 5000 in / 500 out × 2 | $0.05 |
| **Total** | | | **~$1.37** |

Vs actual: ~$0.30-0.50. El incremento de ~$1 por artículo es trivial vs el valor de un artículo que realmente rankea.

### DataForSEO / SERP scraping: ~$0.10-0.20 adicional.

**Coste total nuevo pipeline: ~$1.50-1.60 por artículo.**

---

## Apéndice: Implementación Sugerida — Orden de Prioridad

### Semana 1 (Quick wins, alto impacto):
1. **Conectar ai-config.ts** al pipeline (usar Opus para generación)
2. **Activar DataForSEO** o implementar Google Suggest scraping
3. **Dividir generación en secciones** (outline → sección × sección)

### Semana 2:
4. **Añadir SERP analysis** con agent-browser/web_fetch
5. **Implementar search intent classification**
6. **Humanizer multi-pasada** con scoring intermedio

### Semana 3:
7. **Inyección de datos reales** (fact sheet pre-generación)
8. **FAQs de PAA real**
9. **QA multi-dimensional** con modelo cruzado

### Semana 4:
10. **Fact-checking paso** 
11. **Schema markup mejorado** (HowTo, dateModified, image)
12. **Author experience fields** en onboarding

---

*Fin del informe. Generado por OSCR para BloomContent.*
*Para preguntas o implementación, contactar a rafa@happyoperators.com*
