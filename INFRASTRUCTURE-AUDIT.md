# BloomContent - Verificación de Infraestructura

*Fecha: 2026-02-26*

---

## Verificación de Afirmaciones

### ✅ Home page funcional
**Estado: VERDADERO**
- URL: https://bloomcontent.site
- HTTP 200 OK
- Página pública accesible

### ✅ Auth con Convex
**Estado: VERDADERO (con matiz)**
- Usa Convex para auth (validateSession, magic links)
- PERO: Es auth simple basado en localStorage/cookies (cb_session), no es Convex Auth oficial
- Middleware protege rutas /dashboard y /admin-dashboard

### ⚠️ Cold outreach + Generación de artículos en Convex
**Estado: PARCIALMENTE VERDADERO**

**Cold Outreach:**
- ✅ Leads se almacenan en Convex (131 leads, 48 contacted, 83 new)
- ✅ Email scheduler corre (Python, no TypeScript/Convex)
- ✅ Envía emails diarios respetando warmup
- ❌ Follow-ups: NO automatizados (no hay sistema de follow-up en código)
- ❌ Respuestas: Inbox monitor corre pero NO hay automatización de respuestas
- ❌ Análisis de respuestas + oferta 50%: NO implementado

**Generación de Artículos:**
- ✅ Artículos se almacenan en Convex
- ✅ Pipeline corre (TypeScript + Convex)
- ✅ Auto-generación al crear store (usando Next.js `after()`)
- ✅ Revisión QA automática con reintentos
- ⚠️ OpenRouter sin créditos → fallback a Anthropic (más caro)

### ❌ "4 cuentas disponibles"
**Estado: FALSO**
- Solo 2 cuentas configuradas en `accounts.json`:
  1. matt.roberts@bloomcontent.site
  2. rafa@bloomcontent.site
- Cada una envía 5 emails/día (límite warmup)

### ❌ Follow-up automatizado
**Estado: FALSO - NO IMPLEMENTADO**
- No hay sistema de follow-up en el código
- No hay lógica de "Day 3, 6, 10"
- No hay gestión de respuestas automática
- OSCR lo hace manualmente según OSCR-OPERATIONS.md

### ⚠️ Onboarding cold outreach
**Estado: PARCIALMENTE VERDADERO**
- ✅ Landing personalizada: `/p/[slug]` - muestra artículo parcial
- ✅ Captura email para ver artículo completo
- ❌ NO crea cuenta en Convex automáticamente (solo guarda lead)

### ⚠️ Onboarding cliente
**Estado: PARCIALMENTE VERDADERO**

**Flujo real:**
1. ✅ Crea cuenta (magic link auth)
2. ❌ **NO hay pago** (Stripe está comentado, no integrado)
3. ✅ Añade tienda Shopify (formulario)
4. ✅ Añade profile info (E-E-A-T step)
5. ✅ Genera primer artículo automáticamente (vía `after()`)
6. ⚠️ Revisión: cliente puede ver y solicitar cambios PERO no está implementado el flujo de "solicitar cambios → IA adapta"

---

## Qué está automatizado vs qué gestiona OSCR

### ✅ Automatizado (Código)

| Proceso | Implementación | Estado |
|---------|---------------|--------|
| Auth (login/signup) | Magic links + Convex | ✅ Funciona |
| Crear store | API route + Convex mutation | ✅ Funciona |
| Generar artículo | Pipeline TypeScript + Convex | ✅ Funciona |
| QA de artículo | Auto-retry con IA | ✅ Funciona |
| Enviar emails | Python scheduler + cron | ✅ Funciona |
| Revisar inbox | Python inbox monitor | ✅ Funciona (pero no procesa) |
| Lead scraping | Python script + cron | ✅ Funciona |

### ❌ Manual (OSCR)

| Proceso | Por qué | Prioridad para automatizar |
|---------|---------|---------------------------|
| Follow-up emails | No hay sistema en código | ALTA |
| Responder a replies | Inbox monitor no procesa respuestas | ALTA |
| Análisis de interés + oferta 50% | No implementado | MEDIA |
| Revisar y editar artículos | Cliente puede solicitar pero OSCR edita manual | MEDIA |
| Buscar nuevos leads | Script corre pero OSCR verifica calidad | BAJA |

---

## Gaps Críticos para Escalar

### 1. Stripe/Payments (ALTA)
- Todo el código de Stripe está comentado
- No hay checkout funcional
- Términos dicen "2 free articles" pero no se cobra después

### 2. Follow-up Automation (ALTA)
- Necesitas sistema que:
  - Trackee fechas de envío
  - Envíe follow-up día 3, 6, 10
  - Pare si hay respuesta
  - Actualice status en Convex

### 3. Procesamiento de Respuestas (ALTA)
- Inbox monitor debe:
  - Leer respuestas
  - Clasificar (interesado/pregunta/no gracias)
  - Actualizar lead status
  - Trigger acciones (enviar demo, responder, etc)

### 4. Flujo de Revisiones (MEDIA)
- Cliente debe poder:
  - Solicitar cambios específicos en dashboard
  - Sistema debe re-generar con instrucciones
  - OSCR actualmente edita manualmente

### 5. Multi-cuenta Email (MEDIA)
- Necesitas las 4 cuentas que mencionas
- Configurar en `accounts.json`
- Rotación automática

---

## Recomendaciones para Escalar

### Fase 1: Automatizar Follow-ups (1-2 semanas)
1. Extender `email-scheduler.py` para trackear `lastEmailSent` y `followUpCount`
2. Añadir lógica de follow-up con delays (3, 6, 10 días)
3. Templates de follow-up en código
4. Actualizar lead status en Convex automáticamente

### Fase 2: Procesar Respuestas (2-3 semanas)
1. Extender `inbox-monitor.py` para leer y clasificar respuestas
2. Usar IA para clasificar: `interested`, `question`, `not_interested`
3. Automatizar respuestas simples
4. Notificar a OSCR solo cuando necesita intervención humana

### Fase 3: Stripe Integration (1-2 semanas)
1. Descomentar código de Stripe existente
2. Configurar webhooks
3. Añadir planes de precios
4. Integrar checkout en onboarding

### Fase 4: Sistema de Revisiones (2-3 semanas)
1. UI en dashboard para "Solicitar cambios"
2. API endpoint para recibir feedback
3. Re-generar artículo con instrucciones específicas
4. QA automático del artículo revisado

---

## Resumen

**Automatizado:** ~40% del flujo completo
**Manual (OSCR):** ~60% del flujo

Para escalar sin depender de OSCR, necesitas implementar:
1. Follow-up automation
2. Reply processing
3. Stripe payments
4. Revision workflow

Todo esto es código que puede (y debe) estar en la app, no depende de OSCR.
