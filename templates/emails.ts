/**
 * BloomContent - Email Templates
 * 
 * All emails OSCR sends autonomously:
 * - Cold outreach
 * - Demo delivery
 * - Follow-ups
 * - Revision responses
 */

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface StoreContext {
  storeName: string;
  ownerName?: string;
  niche: string;
  domain: string;
  productCount?: number;
  language: 'en' | 'es' | 'de' | 'fr';
}

/**
 * Cold outreach - First contact
 * Key: No pitch, just value. 2 free articles, no strings.
 */
export function coldOutreach(ctx: StoreContext): EmailTemplate {
  const templates = {
    en: {
      subject: `Free SEO content for ${ctx.storeName} - no strings attached`,
      body: `Hi${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

I came across ${ctx.storeName} and noticed you have great products in the ${ctx.niche} space.

I'm working on an AI-powered content service for e-commerce stores, and I'd like to offer you a free trial - genuinely free, no credit card, no follow-up sales calls.

Here's what I'll send you:
- 2 SEO-optimized blog articles (1,500+ words each)
- Tailored to your products and target audience
- Ready to publish, with meta descriptions and suggested images
- A mini content strategy with 10 article ideas for your store

Why free? I'm building case studies and want to prove the quality speaks for itself.

If you're interested, just reply "yes" and I'll have the content ready in 48 hours.

Best,
Rafael
BloomContent

P.S. Here's a sample article I wrote for a similar store: [link]`
    },
    es: {
      subject: `Contenido SEO gratis para ${ctx.storeName} - sin compromisos`,
      body: `Hola${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

Encontré ${ctx.storeName} y me gustaron mucho vuestros productos de ${ctx.niche}.

Estoy desarrollando un servicio de contenido con IA para tiendas online, y me gustaría ofrecerte una prueba gratis - realmente gratis, sin tarjeta, sin llamadas de venta.

Lo que te enviaré:
- 2 artículos de blog optimizados para SEO (1.500+ palabras)
- Adaptados a tus productos y audiencia
- Listos para publicar, con meta descripciones e imágenes sugeridas
- Una mini estrategia con 10 ideas de artículos para tu tienda

¿Por qué gratis? Estoy creando casos de éxito y quiero demostrar que la calidad habla por sí sola.

Si te interesa, responde "sí" y tendrás el contenido en 48 horas.

Un saludo,
Rafael
BloomContent

PD: Aquí tienes un artículo de ejemplo que escribí para una tienda similar: [link]`
    },
    de: {
      subject: `Kostenloser SEO-Content für ${ctx.storeName} - unverbindlich`,
      body: `Hallo${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

Ich bin auf ${ctx.storeName} gestoßen und finde eure Produkte im Bereich ${ctx.niche} sehr ansprechend.

Ich entwickle einen KI-gestützten Content-Service für E-Commerce-Shops und möchte euch ein kostenloses Testangebot machen - wirklich kostenlos, keine Kreditkarte, keine Verkaufsanrufe.

Das bekommt ihr:
- 2 SEO-optimierte Blogartikel (1.500+ Wörter)
- Speziell auf eure Produkte und Zielgruppe zugeschnitten
- Veröffentlichungsfertig, mit Meta-Beschreibungen und Bildvorschlägen
- Eine Mini-Content-Strategie mit 10 Artikelideen für euren Shop

Warum kostenlos? Ich baue Case Studies auf und möchte beweisen, dass die Qualität für sich spricht.

Bei Interesse einfach mit "Ja" antworten - in 48 Stunden habt ihr den Content.

Beste Grüße,
Rafael
BloomContent

PS: Hier ein Beispielartikel für einen ähnlichen Shop: [link]`
    },
    fr: {
      subject: `Contenu SEO gratuit pour ${ctx.storeName} - sans engagement`,
      body: `Bonjour${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

J'ai découvert ${ctx.storeName} et j'apprécie beaucoup vos produits dans le domaine ${ctx.niche}.

Je développe un service de contenu IA pour les boutiques e-commerce, et j'aimerais vous offrir un essai gratuit - vraiment gratuit, sans carte bancaire, sans appels commerciaux.

Ce que je vous enverrai :
- 2 articles de blog optimisés SEO (1 500+ mots)
- Adaptés à vos produits et votre audience
- Prêts à publier, avec méta-descriptions et suggestions d'images
- Une mini-stratégie avec 10 idées d'articles pour votre boutique

Pourquoi gratuit ? Je construis des études de cas et je veux prouver que la qualité parle d'elle-même.

Si ça vous intéresse, répondez simplement "oui" et vous aurez le contenu en 48 heures.

Cordialement,
Rafael
BloomContent

PS : Voici un article exemple écrit pour une boutique similaire : [link]`
    }
  };
  
  return templates[ctx.language] || templates.en;
}

/**
 * Demo delivery - Sending the free content
 */
export function demoDelivery(ctx: StoreContext, articles: string[]): EmailTemplate {
  const templates = {
    en: {
      subject: `Your free SEO articles for ${ctx.storeName} are ready! 🎉`,
      body: `Hi${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

Great news - your content is ready!

Attached you'll find:
📄 Article 1: [Title 1]
📄 Article 2: [Title 2]
📋 Content Strategy: 10 article ideas tailored for ${ctx.storeName}

Each article includes:
- SEO-optimized title and meta description
- Internal linking suggestions
- Image placement recommendations
- Target keywords

**How to publish:**
1. Copy the content to your Shopify blog
2. Add the suggested images (I've included free stock photo links)
3. Set the meta description in your SEO settings
4. Publish!

If you'd like any revisions, just reply with your feedback and I'll update them within 24 hours.

---

**Liked the content?** Here's how we can continue:

- **Starter (€49/month):** 1 article/day, 30 articles/month
- **Growth (€99/month):** 3 articles/day, 90 articles/month  
- **Scale (€149/month):** 5 articles/day, 150 articles/month

All plans include:
✅ SEO-optimized content
✅ Unlimited revisions
✅ Content strategy updates
✅ Cancel anytime

No pressure at all - the free articles are yours to keep either way.

Best,
Rafael
BloomContent`
    },
    es: {
      subject: `¡Tus artículos SEO gratis para ${ctx.storeName} están listos! 🎉`,
      body: `Hola${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

¡Buenas noticias - tu contenido está listo!

Adjunto encontrarás:
📄 Artículo 1: [Título 1]
📄 Artículo 2: [Título 2]
📋 Estrategia de contenido: 10 ideas de artículos para ${ctx.storeName}

Cada artículo incluye:
- Título y meta descripción optimizados para SEO
- Sugerencias de enlaces internos
- Recomendaciones de imágenes
- Keywords objetivo

**Cómo publicar:**
1. Copia el contenido a tu blog de Shopify
2. Añade las imágenes sugeridas (incluyo enlaces a fotos de stock gratuitas)
3. Configura la meta descripción en ajustes SEO
4. ¡Publica!

Si quieres alguna revisión, responde con tu feedback y lo actualizo en 24 horas.

---

**¿Te gustó el contenido?** Así podemos continuar:

- **Starter (€49/mes):** 1 artículo/día, 30 artículos/mes
- **Growth (€99/mes):** 3 artículos/día, 90 artículos/mes
- **Scale (€149/mes):** 5 artículos/día, 150 artículos/mes

Todos los planes incluyen:
✅ Contenido optimizado SEO
✅ Revisiones ilimitadas
✅ Actualizaciones de estrategia
✅ Cancela cuando quieras

Sin presión - los artículos gratis son tuyos de todas formas.

Un saludo,
Rafael
BloomContent`
    }
  };
  
  return templates[ctx.language] || templates.en;
}

/**
 * Follow-up - No response after 3 days
 */
export function followUp(ctx: StoreContext, attempt: 1 | 2 | 3): EmailTemplate {
  const templates = {
    1: {
      subject: `Quick follow-up: Free content for ${ctx.storeName}`,
      body: `Hi${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

Just checking if you saw my previous email about free SEO content for ${ctx.storeName}.

Quick recap: 2 free articles + content strategy, no strings attached.

Interested? Just reply "yes" and I'll have it ready in 48 hours.

Best,
Rafael`
    },
    2: {
      subject: `Last chance: Free articles for ${ctx.storeName}`,
      body: `Hi${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

I'll keep this short - I'm wrapping up my free content offers this week.

If you'd like 2 free SEO articles for ${ctx.storeName}, let me know by Friday.

After that, happy to help if you ever need content in the future.

Best,
Rafael`
    },
    3: {
      subject: `Closing the loop - ${ctx.storeName}`,
      body: `Hi${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

I haven't heard back, so I'll assume the timing isn't right.

No worries at all - I'll remove you from my outreach list.

If you ever need content help down the road, feel free to reach out.

All the best with ${ctx.storeName}!

Rafael`
    }
  };
  
  return templates[attempt];
}

/**
 * Revision response - Client sent feedback
 */
export function revisionResponse(ctx: StoreContext): EmailTemplate {
  return {
    subject: `Re: Revisions for ${ctx.storeName} articles`,
    body: `Hi${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

Thanks for the feedback! I've updated the articles based on your comments.

Changes made:
- [List specific changes]

Please find the revised versions attached.

Let me know if you'd like any other adjustments.

Best,
Rafael`
  };
}

/**
 * Payment/conversion - Client wants to subscribe
 */
export function conversionResponse(ctx: StoreContext, plan: 'starter' | 'growth' | 'scale'): EmailTemplate {
  const prices = { starter: 49, growth: 99, scale: 149 };
  const articles = { starter: 1, growth: 3, scale: 5 };
  
  return {
    subject: `Welcome to BloomContent! 🎉 - ${ctx.storeName}`,
    body: `Hi${ctx.ownerName ? ` ${ctx.ownerName}` : ''},

Awesome - welcome aboard! 🎉

**Your plan:** ${plan.charAt(0).toUpperCase() + plan.slice(1)} (€${prices[plan]}/month)
**Content:** ${articles[plan]} article${articles[plan] > 1 ? 's' : ''} per day

**Next steps:**
1. Payment link: [Stripe link]
2. Once confirmed, I'll start generating content immediately
3. First batch delivered within 24 hours

**What I need from you:**
- Preferred topics/keywords (or I'll research based on your products)
- Any brand voice guidelines
- Products you want to highlight

You can always reply to adjust the content direction.

Excited to help ${ctx.storeName} grow!

Best,
Rafael
BloomContent`
  };
}
