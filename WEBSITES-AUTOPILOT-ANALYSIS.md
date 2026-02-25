# 🔍 ANÁLISIS: Venta de Websites en Autopilot con OpenClaw

**Fecha:** 2026-02-22  
**Autor:** OSCR (Subagent — Business & Technical Analysis)  
**Estado:** COMPLETO

---

## 1. VIABILIDAD DE REUTILIZACIÓN (BloomContent → Website Autopilot)

### ✅ Lo que se puede reutilizar directamente

| Componente | Reutilizable | Notas |
|---|---|---|
| **email-scheduler.py** | ✅ 80% | La lógica de envío con warmup, SMTP vía Zoho, y el scheduling es casi idéntico. Solo cambian los templates |
| **check-inbox.py** | ✅ 90% | Monitoreo de respuestas + notificación Telegram — funciona tal cual |
| **Cuentas email (Zoho)** | ⚠️ Parcial | Las cuentas ya en warmup son valiosas, pero el dominio bloomcontent.site suena a "content marketing", no a "web design" |
| **Convex backend** | ✅ 70% | El modelo de datos necesita adaptarse pero la infra ya está |
| **Next.js dashboard** | ✅ 50% | Estructura base útil, pero las vistas serían diferentes |
| **Pipeline pattern** | ✅ 90% | El flujo scraper→email→follow-up→conversión es exactamente el mismo |

### 🆕 Lo que hay que construir desde cero

- **Scout agent** — Google Places API scraper (el actual usa DataForSEO para Shopify stores)
- **Intel agent** — PageSpeed + crawling de websites locales
- **Builder agent** — Generación de websites HTML/CSS + deploy
- **Video pipeline** — Walkthrough con Puppeteer/ffmpeg + UGC
- **Twilio SMS integration** — Nuevo canal de outreach
- **Closer agent** — Call brief generator

### 🌐 ¿Dominio nuevo o compartir bloomcontent.site?

**RECOMENDACIÓN: Dominio nuevo.** Razones:
1. "BloomContent" suena a content marketing, no a web design para negocios locales
2. Las cuentas email en warmup tardan ~3 semanas — no es tanto tiempo perdido
3. Separar dominios protege la reputación de email de BloomContent si algo sale mal
4. Sugerencias: **localwebpro.site**, **siteboost.agency**, **webcraft.site**

**Coste:** ~€10-15/año dominio + ~€3/mes cuentas email Zoho

---

## 2. ANÁLISIS DE CADA AGENTE

### 🔍 SCOUT — Encuentra y puntúa leads locales

| Aspecto | Evaluación |
|---|---|
| **Viable con OpenClaw?** | ✅ Sí — es un script programable |
| **APIs necesarias** | Google Places API (nueva), PageSpeed Insights API (gratis) |
| **Ya tenemos** | Patrón de scraping (lead-scraper.py), Convex para almacenar |
| **Tiempo implementación** | 1-2 semanas |
| **Coste API** | ~€20-50/mes (Places API: $0.032/request para Text Search) |
| **Mayor riesgo** | Rate limits de Google Places. Para 500 negocios/día en múltiples ciudades = ~$16/día = ~€450/mes. Se puede optimizar reduciendo volumen |

**Alternativas más baratas:** Yelp Fusion API (gratis hasta 5000/día), Outscraper, o web scraping directo de Google Maps (gris legalmente).

### 🕵️ INTEL — Auditoría web y brief de ventas

| Aspecto | Evaluación |
|---|---|
| **Viable con OpenClaw?** | ✅ Sí — combinación de APIs + LLM |
| **APIs necesarias** | PageSpeed Insights (gratis), Puppeteer/playwright para crawl |
| **Ya tenemos** | Claude para generación de briefs, servidor con Node.js |
| **Tiempo implementación** | 1-2 semanas |
| **Coste** | Prácticamente €0 (PageSpeed es gratis, Claude ya se paga) |
| **Mayor riesgo** | Calidad del brief. Necesita iteración en prompts para que sea vendedor, no técnico |

**Este es el agente más fácil y de mayor ROI.** El brief de ventas es lo que diferencia esta estrategia de spam genérico.

### 🏗️ BUILDER — Genera demo sites y videos UGC

| Aspecto | Evaluación |
|---|---|
| **Viable con OpenClaw?** | ⚠️ Parcialmente — la web sí, el video UGC es el punto más complejo |
| **APIs necesarias** | Claude (tenemos), hosting (Vercel/Netlify gratis), Puppeteer+ffmpeg (tenemos), ElevenLabs ($5-22/mes), Nano Banana Pro (⚠️), Kling (⚠️) |
| **Ya tenemos** | Claude, servidor con Node.js, capacidad de deploy |
| **Tiempo implementación** | 3-5 semanas (web: 1 sem, walkthrough: 1 sem, UGC: 2-3 sem si viable) |
| **Coste** | €30-130/mes (hosting + ElevenLabs + video AI) |
| **Mayor riesgo** | **UGC video pipeline es el eslabón más débil** — ver Sección 3 sobre Nano Banana Pro y Kling |

**Recomendación:** Empezar SIN video UGC. El demo site + video walkthrough (Puppeteer scroll-through) es suficiente para el MVP y es 100% viable hoy.

### 📧 OUTREACH — Emails personalizados + SMS

| Aspecto | Evaluación |
|---|---|
| **Viable con OpenClaw?** | ✅ Sí — es lo que BloomContent ya hace |
| **APIs necesarias** | SMTP (tenemos), Twilio SMS (nuevo) |
| **Ya tenemos** | email-scheduler.py, warmup logic, templates, Zoho SMTP |
| **Tiempo implementación** | 1 semana (adaptar templates + integrar Twilio) |
| **Coste** | SMS: ~€0.07-0.09/SMS en Europa vía Twilio + €1/mes número |
| **Mayor riesgo** | **GDPR para SMS en Europa es SERIO** — necesitas consentimiento previo o "interés legítimo" demostrable. Cold SMS a negocios B2B tiene cierta tolerancia pero varía por país. UK post-Brexit tiene PECR. España = AEPD estricta |

**⚠️ IMPORTANTE sobre SMS:** El claim de "40% open rates en Europa" es para SMS marketing con opt-in, NO para cold SMS. Cold SMS sin consentimiento puede resultar en multas GDPR de hasta €20M o 4% facturación. **Recomendación: empezar solo con email, añadir SMS solo cuando haya opt-in.**

### 🤝 CLOSER — Convierte leads calientes

| Aspecto | Evaluación |
|---|---|
| **Viable con OpenClaw?** | ✅ Trivial — es generación de texto con contexto |
| **APIs necesarias** | Claude (tenemos), acceso al email thread (tenemos) |
| **Ya tenemos** | Todo |
| **Tiempo implementación** | 2-3 días |
| **Coste** | €0 adicional |
| **Mayor riesgo** | Ninguno técnico. El riesgo es comercial: la call la haces tú |

### 📈 GROWTH — Monitoreo y upsell

| Aspecto | Evaluación |
|---|---|
| **Viable con OpenClaw?** | ✅ Sí — cron jobs + PageSpeed + email |
| **APIs necesarias** | PageSpeed (gratis), SMTP (tenemos) |
| **Ya tenemos** | Casi todo |
| **Tiempo implementación** | 1 semana |
| **Coste** | €0 adicional |
| **Mayor riesgo** | Solo relevante cuando hay clientes. No es prioridad para MVP |

---

## 3. ANÁLISIS DEL STACK TECNOLÓGICO

### Google Places API
- **Coste:** $0.032/request (Text Search), $200 crédito gratis/mes
- **Limitaciones:** Los $200 free dan ~6,250 búsquedas/mes — suficiente para MVP
- **Alternativas:** Outscraper (~$3/1000 resultados), scraping directo (riesgo legal)
- **Veredicto:** ✅ Viable, el free tier cubre el MVP

### PageSpeed Insights API
- **Coste:** GRATIS, sin límite duro (pero rate limit ~400 req/100sec)
- **Limitaciones:** Velocidad de respuesta (~10-30 seg por análisis)
- **Veredicto:** ✅ Perfecto para este uso

### ⚠️ Nano Banana Pro — BANDERA ROJA
- **¿Es real?** Parcialmente. El sitio nanobanana.pro existe y ofrece text-to-image AI
- **¿Genera video?** **NO.** Es un modelo de text-to-image, no de video. No genera "talking heads" ni video UGC
- **¿Es legítimo?** El sitio existe pero es un wrapper/frontend sobre otros modelos. No tiene presencia en comunidades AI serias, no hay papers, no hay reviews en ProductHunt, no aparece en comparativas de herramientas AI
- **¿Tiene API?** No se encontró documentación de API pública
- **Veredicto:** 🔴 **NO USAR.** No es lo que el post original dice que es. Para talking heads, las alternativas reales son: **HeyGen** ($24/mes), **D-ID** ($5.99/mes), **Synthesia** ($22/mes)

### ⚠️ Kling 2.6 — PRECAUCIÓN
- **¿Existe?** Kling AI existe (klingai.com, de Kuaishou/China). Es un generador de video AI real
- **¿Versión 2.6?** No se puede confirmar que exista una "versión 2.6" específica. Kling ha tenido versiones 1.0, 1.5, 1.6, pero "2.6" no está verificado públicamente
- **Coste:** ~$8-33/mes según plan
- **Calidad:** Competitive con Runway, Pika. Buenos resultados para video corto
- **API?** Tiene API pero principalmente orientada al mercado chino
- **Veredicto:** 🟡 **Kling es real pero la versión "2.6" no está verificada.** Funciona para generación de video pero la integración API desde Europa puede ser problemática. **Alternativas mejores: Runway ML, Luma AI**

### ElevenLabs
- **Coste:** Free (10k chars/mes), Starter $5/mes (30k chars), Creator $22/mes (100k chars)
- **Para este proyecto:** Un voiceover de 30 seg ≈ 400-500 chars. Con Starter ($5/mes) podrías hacer ~60 voiceovers/mes
- **Veredicto:** ✅ Excelente. Precio razonable, calidad top, API bien documentada

### Twilio SMS
- **Coste en Europa:**
  - SMS saliente: €0.0637-0.0935/SMS (varía por país)
  - Número local: ~€1-2/mes
  - Para 500 SMS/mes ≈ €35-50/mes
- **GDPR:** Twilio es procesador de datos (firmará DPA). Pero TÚ eres responsable del consentimiento
- **Regulaciones:** B2B cold SMS es zona gris. España/Francia = estrictos. UK = algo más permisivo para B2B. Alemania = muy estricto
- **Veredicto:** 🟡 **Técnicamente fácil, legalmente arriesgado para cold outreach en EU.** Viable si: (1) solo B2B, (2) tienes "interés legítimo", (3) incluyes opt-out claro, (4) empiezas en mercados más permisivos (UK, Irlanda)

---

## 4. MODELO DE NEGOCIO

### Pricing recomendado

| Servicio | Setup (único) | Mensual |
|---|---|---|
| Website básica (landing page) | €497 | €49/mes (hosting + soporte básico) |
| Website completa (5-10 pág) | €997 | €97/mes (hosting + SEO básico + reportes) |
| Website + gestión ads | €1,497 | €197/mes |

**Ticket medio esperado:** €497 setup + €49/mes = €1,085 en primer año

### Break-even Analysis

**Costes mensuales operativos (MVP):**
| Concepto | Coste |
|---|---|
| Google Places API | €0-20 (free tier) |
| ElevenLabs | €5-22 |
| Dominio + Email | €5 |
| Hosting demos (Vercel) | €0 (free tier) |
| OpenClaw/Claude | Ya pagado |
| Twilio (si se usa) | €35-50 |
| **TOTAL** | **€45-97/mes** |

**Break-even:** 1-2 clientes a €497 setup cubren varios meses de operación.

**Con 5 clientes/mes (razonable con buen pipeline):**
- Revenue: €2,485 setup + €245 recurrente = €2,730/mes
- Costes: ~€100/mes operativos + ~€200/mes en APIs a escala
- **Margen: ~€2,400/mes (~88%)**

### Comparativa con BloomContent

| Métrica | BloomContent | Website Autopilot |
|---|---|---|
| **Ticket medio** | €500-2000/mes (content packages) | €497 setup + €49-97/mes |
| **Ciclo de venta** | Largo (semanas) | Corto (demo ya hecho) |
| **Escalabilidad** | Media (necesita crear contenido) | Alta (webs son generables) |
| **Diferenciación** | Buena (Shopify content) | Media (muchos hacen webs) |
| **Complejidad técnica** | Media | Alta (6 agentes) |
| **Madurez** | LIVE, enviando emails | Concepto |
| **Margen por hora** | Alto | Muy alto (si funciona el autopilot) |

### ¿Cuál tiene más potencial a 12 meses?

**BloomContent a corto plazo (0-6 meses):** Ya está live, está generando datos reales. La prioridad debería ser optimizar conversión aquí.

**Website Autopilot a medio plazo (6-12 meses):** Tiene potencial mayor porque:
1. El mercado de negocios locales sin web decente es ENORME
2. El demo pre-construido es un game changer (nadie más lo hace automatizado)
3. Los márgenes son brutales una vez automatizado
4. El MRR se acumula (hosting + mantenimiento)

**Recomendación:** NO abandonar BloomContent. Construir Website Autopilot en paralelo, empezando con los agentes más fáciles.

---

## 5. ROADMAP DE IMPLEMENTACIÓN

### Orden de implementación (por ROI)

1. **Scout** (semana 1-2) — Sin leads no hay nada
2. **Intel** (semana 2-3) — El brief es lo que vende
3. **Builder - Solo web** (semana 3-5) — Demo site sin video
4. **Outreach** (semana 5-6) — Adaptar email-scheduler.py
5. **Closer** (semana 6) — Trivial
6. **Builder - Video walkthrough** (semana 7-8) — Puppeteer + ffmpeg
7. **Growth** (semana 9+) — Solo cuando haya clientes
8. **Builder - UGC video** (futuro) — Cuando las herramientas maduren

### Timeline MVP funcional: 6-8 semanas

**Semana 1-2:** Scout (Google Places + PageSpeed scoring)  
**Semana 3-4:** Intel (crawl + brief generation con Claude)  
**Semana 5-6:** Builder (web only) + Outreach (email adaptation)  
**Semana 7-8:** Testing, iteración, primeros envíos reales  

### Qué se puede hacer por presupuesto

#### €500
- ✅ Scout + Intel + Outreach (email only, sin SMS)
- ✅ Demo sites estáticas (Claude genera HTML, deploy en Vercel gratis)
- ✅ Closer (call briefs)
- ❌ Sin video, sin SMS, sin UGC
- **Resultado:** Pipeline funcional básico. Email con link a demo site.

#### €2,000
- Todo lo de €500, más:
- ✅ Walkthrough videos (Puppeteer + ffmpeg)
- ✅ ElevenLabs voiceovers en los walkthroughs
- ✅ Dominio propio + emails en warmup
- ✅ Twilio SMS (budget limitado, ~200 SMS)
- ✅ Templates y branding profesional
- **Resultado:** Pipeline completo sin UGC video. Muy competitivo.

#### €5,000
- Todo lo de €2,000, más:
- ✅ UGC video pipeline con HeyGen/D-ID + Runway
- ✅ A/B testing de templates
- ✅ Multi-ciudad / multi-nicho
- ✅ Dashboard personalizado
- ✅ 3-4 meses de operación cubiertos
- **Resultado:** Operación completa y escalable.

---

## 6. RECOMENDACIÓN FINAL

### 🟢 GO — Confianza: 7.5/10

**Razonamiento:**

**A favor (por qué GO):**
1. La infraestructura de BloomContent cubre ~40% del trabajo
2. El concepto de "demo pre-construida" es genuinamente diferenciador
3. Los costes operativos son bajísimos (€50-100/mes)
4. El mercado de negocios locales con webs malas es masivo
5. Los márgenes son >80%
6. MVP alcanzable en 6-8 semanas con €500

**En contra (por qué no 10/10):**
1. **El post original exagera.** Nano Banana Pro no hace lo que dice, Kling 2.6 no existe como tal, cold SMS en Europa tiene riesgo GDPR serio
2. **El UGC video pipeline no es viable hoy** como se describe — necesita herramientas diferentes (HeyGen, D-ID, Runway) y cuesta más
3. **Competencia.** Vender webs a negocios locales es un mercado saturado. La diferenciación está en la automatización y el demo pre-construido, pero el producto final (una web) es commodity
4. **BloomContent está LIVE.** Dividir atención ahora podría dañar ambos proyectos

### ⚡ Recomendación concreta:

1. **No pausar BloomContent** — está generando datos reales, sigue optimizando
2. **Empezar Scout + Intel como proyecto paralelo** (2-3 semanas, ~€50)
3. **Validar demanda** antes de construir todo el pipeline: generar 10 briefs de negocios reales, crear 3 demo sites manualmente, enviar 20 emails personalizados a mano
4. **Si hay respuestas positivas (>5% reply rate)** → construir el pipeline completo
5. **Olvidar el UGC video por ahora** — el demo site + walkthrough video es suficiente y 100% viable
6. **No hacer cold SMS en Europa** hasta consultar con un abogado GDPR

---

*Análisis generado por OSCR. Las valoraciones de herramientas (Nano Banana Pro, Kling 2.6) están basadas en investigación directa de sus sitios web y presencia online a fecha 2026-02-22. Las estimaciones de coste son aproximadas y pueden variar.*
