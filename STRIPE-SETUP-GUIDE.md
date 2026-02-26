# Stripe Integration - Setup Guide

*Qué falta para activar pagos en BloomContent*

---

## Estado Actual

El código de Stripe está preparado pero **comentado**. Los archivos existen:
- ✅ `app/api/checkout/route.ts` - Crear sesión de pago
- ✅ `app/api/webhooks/stripe/route.ts` - Recibir eventos de Stripe
- ✅ `app/api/portal/route.ts` - Customer portal (gestión de suscripción)
- ✅ Schema Convex con `stripeCustomerId` y `stripeSubscriptionId`

---

## Variables de Entorno Necesarias (Vercel)

Añade estas 7 variables en Vercel Dashboard → Project Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
PRICE_ID_STARTER=price_xxxxx
PRICE_ID_GROWTH=price_xxxxx
PRICE_ID_SCALE=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Paso 1: Crear Productos y Precios en Stripe

1. Ve a https://dashboard.stripe.com/products
2. Crea 3 productos:

### Producto: Starter
- Name: "BloomContent Starter"
- Description: "5 articles/month + basic SEO"
- Price: €29/month (recurring)
- Copy the `price_xxxx` ID → `PRICE_ID_STARTER`

### Producto: Growth  
- Name: "BloomContent Growth"
- Description: "15 articles/month + advanced SEO + social"
- Price: €79/month (recurring)
- Copy the `price_xxxx` ID → `PRICE_ID_GROWTH`

### Producto: Scale
- Name: "BloomContent Scale"
- Description: "Unlimited articles + full automation"
- Price: €199/month (recurring)
- Copy the `price_xxxx` ID → `PRICE_ID_SCALE`

---

## Paso 2: Configurar Webhook

1. Ve a https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://bloomcontent.site/api/webhooks/stripe`
4. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Crear endpoint → copiar `Signing secret` (empieza con `whsec_`) → `STRIPE_WEBHOOK_SECRET`

---

## Paso 3: API Keys

1. Ve a https://dashboard.stripe.com/apikeys
2. Copy **Secret key** (sk_live_...) → `STRIPE_SECRET_KEY`
3. Copy **Publishable key** (pk_live_...) → `STRIPE_PUBLISHABLE_KEY` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

⚠️ **IMPORTANTE**: Usa las keys de Live, no Test, para producción.

---

## Paso 4: Activar el Código

Una vez tengas las variables, descomento el código y lo activo. Esto incluye:

1. **Checkout funcional** - Botón "Upgrade" redirige a Stripe
2. **Webhooks** - Auto-activa suscripción tras pago
3. **Customer Portal** - Gestión de suscripción (cancelar, actualizar)
4. **Protección de rutas** - Solo usuarios pagados acceden a features

---

## Flujo de Pago Completo

```
Usuario en /pricing
    ↓
Click "Get Started" en plan
    ↓
POST /api/checkout (crea sesión Stripe)
    ↓
Redirect a Stripe Checkout
    ↓
Usuario paga con tarjeta
    ↓
Stripe redirige a /dashboard?payment=success
    ↓
Webhook checkout.session.completed
    ↓
Convex actualiza: plan, stripeCustomerId, stripeSubscriptionId
    ↓
Usuario tiene acceso completo
```

---

## Qué hacer cuando falle un pago

El webhook `invoice.payment_failed`:
- Marca subscriptionStatus como "past_due"
- Mantiene acceso 3 días (grace period)
- Notifica al usuario para actualizar método de pago
- Tras 3 días, downgrade a "trial" o bloqueo

---

## Checklist Pre-Activación

- [ ] Crear 3 productos en Stripe Dashboard
- [ ] Copiar 3 price IDs
- [ ] Configurar webhook endpoint
- [ ] Copiar webhook secret
- [ ] Copiar API keys (live mode)
- [ ] Añadir 7 variables a Vercel
- [ ] Yo descomento y activo el código
- [ ] Test con tarjeta de prueba: `4242 4242 4242 4242`

---

## Pricing Sugerido

| Plan | Precio | Artículos | Features |
|------|--------|-----------|----------|
| Trial | €0 | 2 | Prueba gratuita |
| Starter | €29/mes | 5 | SEO básico, 1 idioma |
| Growth | €79/mes | 15 | Multi-idioma, social posts |
| Scale | €199/mes | ∞ | White-label, API, prioridad |

¿Quieres ajustar estos precios antes de configurar?
