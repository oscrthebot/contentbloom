"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Unlock, Check, ChevronRight, Star, FileText, ShoppingBag, Globe, Zap } from "lucide-react";
import { TrafficChart } from "./TrafficChart";
import { BannerCard, Banner } from "./BannerCard";

function Skeleton() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 24px 80px" }}>
      {[80, 60, 100, 40].map((w, i) => (
        <div key={i} style={{ height: 18, background: "var(--border)", borderRadius: 6, marginBottom: 16, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 14, color: "var(--t3)" }}>Article not found.</p>
      <Link href="/" style={{ color: "var(--accent)", fontSize: 14 }}>← Go to BloomContent</Link>
    </div>
  );
}

// Render a single line of markdown-lite
function renderLine(line: string, key: number) {
  if (line.startsWith("## "))
    return <h2 key={key} style={{ fontSize: 20, fontWeight: 800, color: "var(--t1)", margin: "32px 0 12px", letterSpacing: "-0.02em" }}>{line.slice(3)}</h2>;
  if (line.startsWith("### "))
    return <h3 key={key} style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", margin: "24px 0 8px" }}>{line.slice(4)}</h3>;
  if (line.startsWith("• ") || line.startsWith("- "))
    return (
      <div key={key} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Check size={14} style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }} />
        <span style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7 }}>{line.slice(2)}</span>
      </div>
    );
  if (line.trim() === "") return <div key={key} style={{ height: 12 }} />;
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={key} style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.8, marginBottom: 4 }}>
      {parts.map((p, j) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={j} style={{ color: "var(--t1)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>
          : p
      )}
    </p>
  );
}

function renderContent(text: string, banners?: Banner[]) {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    result.push(renderLine(line, i));
    // Inject banner after matching heading
    if (banners && (line.startsWith("## ") || line.startsWith("### "))) {
      const headingText = line.replace(/^#+\s+/, "").trim();
      const match = banners.find(b => b.insertAfterHeading.toLowerCase() === headingText.toLowerCase());
      if (match) result.push(<BannerCard key={`banner-${i}`} banner={match} />);
    }
    // Inject END banners at the last line
    if (banners && i === lines.length - 1) {
      banners.filter(b => b.insertAfterHeading === "END").forEach((b, j) =>
        result.push(<BannerCard key={`banner-end-${j}`} banner={b} />)
      );
    }
  });
  return result;
}

// Language strings
const UI_STRINGS: Record<string, Record<string, string>> = {
  en: {
    writtenFor: "Free SEO article written for",
    readFull: "Read the full article — free",
    enterEmail: "Enter your email to read and download the full article — yours to keep, no account needed.",
    emailPlaceholder: "you@yourcompany.com",
    getArticle: "Get your free article",
    unlocking: "Unlocking…",
    noSpam: "No spam. We'll only use your email to send relevant articles.",
    unlocked: "Article unlocked — enjoy the full read",
    startNow: "Start now",
    pricingTitle: "Simple, transparent pricing",
    pricingSubtitle: "Start free. No credit card. Cancel anytime.",
    notSure: "Not sure which plan?",
    replyEmail: "Reply to this email",
    figureOut: "— we'll figure it out together.",
    whatWeDo: "What BloomContent does for you",
    feature1: "Daily SEO articles, keyword-researched",
    feature2: "Auto-publish to Shopify (WordPress coming soon)",
    feature3: "Internal links automatically added",
    feature4: "5 product reviews per month",
    feature5: "Competitor alternative pages",
    feature6: "E-E-A-T author bios & schema markup",
    eeатBy: "Written by",
    eeatBadge: "Auto-generated placeholder",
    eeatDesc: "When you sign up, BloomContent builds a real E-E-A-T author profile for your store — including your name, experience, credentials, and social profiles — so every article ranks stronger in Google's Helpful Content system.",
    eeatFeatures: "✦ Real author bio · ✦ Person schema markup · ✦ Social profile links · ✦ First-person voice trained on your experience",
    mostPopular: "MOST POPULAR",
    planStarter: "Starter", planGrowth: "Growth", planScale: "Scale",
    planStarterPrice: "€49/mo", planGrowthPrice: "€99/mo", planScalePrice: "€199/mo",
    planStarterArticles: "15 articles/mo", planGrowthArticles: "30 articles/mo", planScaleArticles: "Daily articles",
    planStarterReviews: "2 reviews/mo", planGrowthReviews: "5 reviews/mo", planScaleReviews: "10 reviews/mo",
    planShopify: "Auto-publish to Shopify", planLinks: "Internal links included",
    planCta: "Start now",
  },
  es: {
    writtenFor: "Artículo SEO gratuito escrito para",
    readFull: "Lee el artículo completo — gratis",
    enterEmail: "Introduce tu email para leer y descargar el artículo completo. Sin cuenta, sin compromiso.",
    emailPlaceholder: "tu@tienda.com",
    getArticle: "Leer artículo completo",
    unlocking: "Desbloqueando…",
    noSpam: "Sin spam. Solo usaremos tu email para enviarte artículos relevantes.",
    unlocked: "Artículo desbloqueado — ¡buena lectura!",
    startNow: "Empezar ahora",
    pricingTitle: "Precios simples y transparentes",
    pricingSubtitle: "Empieza gratis. Sin tarjeta. Cancela cuando quieras.",
    notSure: "¿No sabes qué plan elegir?",
    replyEmail: "Responde a este email",
    figureOut: "— lo vemos juntos.",
    whatWeDo: "Qué hace BloomContent por tu tienda",
    feature1: "Artículos SEO diarios con keyword research incluido",
    feature2: "Publicación automática en Shopify (WordPress próximamente)",
    feature3: "Enlaces internos añadidos automáticamente",
    feature4: "5 reseñas de productos al mes",
    feature5: "Páginas alternativas de la competencia",
    feature6: "Perfiles de autor E-E-A-T y schema markup",
    eeатBy: "Escrito por",
    eeatBadge: "Perfil de demostración",
    eeatDesc: "Al registrarte, BloomContent crea un perfil de autor E-E-A-T real para tu tienda — con tu nombre, experiencia, credenciales y perfiles sociales — para que cada artículo posicione mejor en el sistema de Contenido Útil de Google.",
    eeatFeatures: "✦ Bio de autor real · ✦ Schema markup Person · ✦ Perfiles en redes · ✦ Voz en primera persona entrenada con tu experiencia",
    mostPopular: "MÁS POPULAR",
    planStarter: "Básico", planGrowth: "Crecimiento", planScale: "Escala",
    planStarterPrice: "49€/mes", planGrowthPrice: "99€/mes", planScalePrice: "199€/mes",
    planStarterArticles: "15 artículos/mes", planGrowthArticles: "30 artículos/mes", planScaleArticles: "Artículos diarios",
    planStarterReviews: "2 reseñas/mes", planGrowthReviews: "5 reseñas/mes", planScaleReviews: "10 reseñas/mes",
    planShopify: "Publicación automática en Shopify", planLinks: "Enlaces internos incluidos",
    planCta: "Empezar ahora",
  },
};

export default function ArticlePreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = useQuery(api.preview.getBySlug, { slug });
  const unlockMutation = useMutation(api.preview.unlock);

  const [email, setEmail] = useState("");
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lang = (article as { language?: string } | null | undefined)?.language ?? "en";
  const t = UI_STRINGS[lang] ?? UI_STRINGS.en;

  if (article === undefined) return <Skeleton />;
  if (article === null) return <NotFound />;

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    try {
      const result = await unlockMutation({ slug, email });
      setFullContent(result.content);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const previewLines = article.preview.split("\n");

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fade-up .45s ease both; }
        .unlock-btn { width: 100%; padding: 14px 24px; border-radius: 100px; background: var(--t1); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity .15s, transform .1s; }
        .unlock-btn:hover { opacity: .88; transform: translateY(-1px); }
        .unlock-btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(249,248,248,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", zIndex: 100, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        {/* Business logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {article.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.logoUrl}
              alt={article.businessName}
              width={32}
              height={32}
              style={{ borderRadius: 8, objectFit: "contain", background: "var(--bg-section)" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-section)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={16} style={{ color: "var(--t3)" }} />
            </div>
          )}
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>{article.businessName}</span>
        </div>
        <a
          href="mailto:rafa@happyoperators.com?subject=I%20want%20to%20start%20automating%20my%20blog!"
          style={{ fontSize: 13, padding: "9px 18px", borderRadius: 100, background: "#1a1615", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}
        >
          {t.startNow} <ArrowRight size={13} />
        </a>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "88px 24px 80px" }}>

        {/* "Written for" pill */}
        <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "8px 14px", background: "#fff", border: "1px solid var(--border)", borderRadius: 100, width: "fit-content", boxShadow: "0 1px 6px rgba(0,0,0,.05)" }}>
          {article.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.logoUrl} alt={article.businessName} width={20} height={20} style={{ borderRadius: 4, objectFit: "contain" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          )}
          <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 500 }}>{t.writtenFor}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)" }}>{article.businessName}</span>
        </div>

        {/* Meta badges */}
        <div className="fade-in" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", background: "var(--accent-lt)", padding: "3px 10px", borderRadius: 100 }}>
            SEO Score: {article.seoScore}
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)", padding: "3px 10px", border: "1px solid var(--border)", borderRadius: 100 }}>
            {article.wordCount.toLocaleString()} words
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)", padding: "3px 10px", border: "1px solid var(--border)", borderRadius: 100 }}>
            Target: &ldquo;{article.keyword}&rdquo;
          </span>
        </div>

        {/* Title */}
        <h1 className="fade-in" style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 28 }}>
          {article.title}
        </h1>

        {/* Gate or full content */}
        {!fullContent ? (
          <>
            {/* Preview — progressive fade: solid top → increasingly transparent bottom */}
            <div className="fade-in" style={{
              position: "relative",
              WebkitMaskImage: "linear-gradient(to bottom, black 30%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.3) 75%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 30%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.3) 75%, transparent 100%)",
              userSelect: "none",
            }}>
              {previewLines.map((line, i) => renderLine(line, i))}
            </div>

            {/* Traffic opportunity chart — visible before unlocking */}
            {article.keywordMonthlyVolume && (
              <TrafficChart metrics={{
                monthlyVolume: article.keywordMonthlyVolume,
                relatedVolume: article.keywordRelatedVolume ?? 0,
                keyword: article.keyword,
                businessName: article.businessName,
              }} />
            )}

            {/* Email gate card */}
            <div className="fade-in card" style={{ padding: "36px 32px", textAlign: "center", marginTop: 20, marginBottom: 48 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-lt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Lock size={20} style={{ color: "var(--accent)" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--t1)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                {t.readFull}
              </h3>
              <p style={{ fontSize: 14, color: "var(--t2)", maxWidth: 380, margin: "0 auto 24px" }}>
                {t.enterEmail}
              </p>
              <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, margin: "0 auto" }}>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ padding: "13px 18px", borderRadius: 10, border: "1px solid var(--border-md)", fontSize: 14, background: "var(--bg)", color: "var(--t1)", outline: "none", textAlign: "center" }}
                  required
                />
                <button type="submit" disabled={loading} className="unlock-btn">
                  {loading ? t.unlocking : t.getArticle}
                </button>
              </form>
              {error && <p style={{ fontSize: 13, color: "#dc2626", marginTop: 12 }}>{error}</p>}
              <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 14 }}>
                {t.noSpam}
              </p>
            </div>
          </>
        ) : (
          <div className="fade-in">
            {/* Unlocked badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "var(--accent-lt)", borderRadius: 10, marginBottom: 32, width: "fit-content" }}>
              <Unlock size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{t.unlocked}</span>
            </div>

            {/* Full article content with inline banners */}
            {renderContent(fullContent, article.banners as Banner[] | undefined)}

            {/* ── E-E-A-T author section — right after article body ── */}
            <div style={{ marginTop: 40, padding: "24px 28px", background: "#fff", border: "1px solid var(--border)", borderRadius: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-section)", border: "2px dashed var(--border-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <p style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>{t.eeатBy}</p>
                    <span style={{ fontSize: 10, background: "rgba(234,179,8,.12)", color: "#92400e", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>{t.eeatBadge}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>
                    {article.businessName} Team
                  </p>
                  <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 10 }}>
                    {t.eeatDesc}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--t3)" }}>{t.eeatFeatures}</p>
                </div>
              </div>
            </div>

            {/* ── What's included ── */}
            <div style={{ marginTop: 40, padding: "28px 32px", background: "var(--bg-section)", borderRadius: 16, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>{t.whatWeDo}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {[t.feature1, t.feature2, t.feature3, t.feature4, t.feature5, t.feature6].map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={14} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Pricing table — vertical stack, clean ── */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.02em", marginBottom: 6, textAlign: "center" }}>
                {t.pricingTitle}
              </h3>
              <p style={{ fontSize: 14, color: "var(--t2)", textAlign: "center", marginBottom: 24 }}>
                {t.pricingSubtitle}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { nameKey: "planStarter", priceKey: "planStarterPrice", articlesKey: "planStarterArticles", reviewsKey: "planStarterReviews", highlight: false },
                  { nameKey: "planGrowth",  priceKey: "planGrowthPrice",  articlesKey: "planGrowthArticles",  reviewsKey: "planGrowthReviews",  highlight: true  },
                  { nameKey: "planScale",   priceKey: "planScalePrice",   articlesKey: "planScaleArticles",   reviewsKey: "planScaleReviews",   highlight: false },
                ].map((plan, i) => (
                  <a
                    key={i}
                    href={`mailto:rafa@happyoperators.com?subject=I%20want%20to%20start%20automating%20my%20blog!&body=${encodeURIComponent(`Hola, me interesa el plan ${t[plan.nameKey as keyof typeof t]} para ${article.businessName}.`)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: 14,
                      border: `1.5px solid ${plan.highlight ? "var(--accent)" : "var(--border)"}`,
                      background: plan.highlight ? "var(--accent-lt)" : "#fff",
                      textDecoration: "none",
                      position: "relative",
                      transition: "box-shadow .15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    {plan.highlight && (
                      <span style={{ position: "absolute", top: -10, left: 20, background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>
                        {t.mostPopular}
                      </span>
                    )}
                    <div>
                      <p style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600, marginBottom: 2 }}>{t[plan.nameKey as keyof typeof t]}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.03em", marginBottom: 4 }}>{t[plan.priceKey as keyof typeof t]}</p>
                      <p style={{ fontSize: 12, color: "var(--t2)" }}>✓ {t[plan.articlesKey as keyof typeof t]} · ✓ {t[plan.reviewsKey as keyof typeof t]} · ✓ {t.planShopify}</p>
                    </div>
                    <div style={{ flexShrink: 0, padding: "10px 18px", borderRadius: 100, background: "#1a1615", color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {t.planCta} →
                    </div>
                  </a>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", marginTop: 14 }}>
                {t.notSure}{" "}
                <a href="mailto:rafa@happyoperators.com?subject=I%20want%20to%20start%20automating%20my%20blog!" style={{ color: "var(--accent)", textDecoration: "none" }}>{t.replyEmail}</a>
                {" "}{t.figureOut}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
