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

export default function ArticlePreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = useQuery(api.preview.getBySlug, { slug });
  const unlockMutation = useMutation(api.preview.unlock);

  const [email, setEmail] = useState("");
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="BloomContent" width={24} height={24} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>BloomContent</span>
        </Link>
        <a href="mailto:rafa@happyoperators.com?subject=I%20want%20to%20start%20automating%20my%20blog!" className="btn btn-dark" style={{ fontSize: 13, padding: "8px 16px", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          Start now <ArrowRight size={13} />
        </a>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "88px 24px 80px" }}>

        {/* Business logo card — personalises the page */}
        <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, padding: "16px 20px", background: "#fff", border: "1px solid var(--border)", borderRadius: 16, width: "fit-content", boxShadow: "var(--shadow-sm)" }}>
          {/* BloomContent rocket */}
          <Image src="/rocket.svg" alt="BloomContent" width={28} height={28} style={{ imageRendering: "pixelated", opacity: 0.7 }} />
          <span style={{ fontSize: 18, color: "var(--border-md)", fontWeight: 300 }}>×</span>
          {/* Business logo */}
          {article.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.logoUrl}
              alt={article.businessName}
              width={40}
              height={40}
              style={{ borderRadius: 10, objectFit: "contain", background: "var(--bg-section)", padding: 2 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-section)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={20} style={{ color: "var(--t3)" }} />
            </div>
          )}
          <div>
            <p style={{ fontSize: 11, color: "var(--t3)", fontWeight: 500, marginBottom: 2 }}>Free SEO article written for</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{article.businessName} <span style={{ color: "var(--t3)", fontWeight: 400, fontSize: 12 }}>· {article.targetSite}</span></p>
          </div>
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
                Read the full article — free
              </h3>
              <p style={{ fontSize: 14, color: "var(--t2)", maxWidth: 380, margin: "0 auto 24px" }}>
                Enter your email to read and download the full article — yours to keep, no account needed.
              </p>
              <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, margin: "0 auto" }}>
                <input
                  type="email"
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ padding: "13px 18px", borderRadius: 10, border: "1px solid var(--border-md)", fontSize: 14, background: "var(--bg)", color: "var(--t1)", outline: "none", textAlign: "center" }}
                  required
                />
                <button type="submit" disabled={loading} className="unlock-btn">
                  {loading ? "Unlocking…" : "Get your free article"}
                </button>
              </form>
              {error && <p style={{ fontSize: 13, color: "#dc2626", marginTop: 12 }}>{error}</p>}
              <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 14 }}>
                No spam. We&apos;ll only use your email to send you relevant articles.
              </p>
            </div>
          </>
        ) : (
          <div className="fade-in">
            {/* Unlocked badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "var(--accent-lt)", borderRadius: 10, marginBottom: 32, width: "fit-content" }}>
              <Unlock size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Article unlocked — enjoy the full read</span>
            </div>

            {/* Full article content with inline banners */}
            {renderContent(fullContent, article.banners as Banner[] | undefined)}

            {/* What's included section */}
            <div style={{ marginTop: 56, padding: "32px", background: "var(--bg-section)", borderRadius: 16, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>What BloomContent does for you</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {[
                  { icon: <FileText size={15} />, text: "Daily SEO articles, keyword-researched" },
                  { icon: <ShoppingBag size={15} />, text: "Auto-publish to Shopify (WordPress coming soon)" },
                  { icon: <Globe size={15} />, text: "Internal links automatically added" },
                  { icon: <Star size={15} />, text: "5 product reviews per month" },
                  { icon: <Zap size={15} />, text: "Competitor alternative pages" },
                  { icon: <Check size={15} />, text: "E-E-A-T author bios & schema markup" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing table */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.02em", marginBottom: 8, textAlign: "center" }}>
                Simple, transparent pricing
              </h3>
              <p style={{ fontSize: 14, color: "var(--t2)", textAlign: "center", marginBottom: 28 }}>
                Start free. No credit card. Cancel anytime.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {[
                  { name: "Starter", price: "€49/mo", articles: "15 articles/mo", reviews: "2 reviews/mo", color: "var(--border)" },
                  { name: "Growth", price: "€99/mo", articles: "30 articles/mo", reviews: "5 reviews/mo", color: "var(--accent)", highlight: true },
                  { name: "Scale", price: "€199/mo", articles: "Daily articles", reviews: "10 reviews/mo", color: "var(--accent)" },
                ].map((plan, i) => (
                  <a
                    key={i}
                    href={`mailto:rafa@happyoperators.com?subject=I%20want%20to%20start%20automating%20my%20blog!&body=Hi%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(plan.name)}%20plan%20for%20${encodeURIComponent(article.businessName)}.`}
                    style={{
                      display: "block",
                      padding: "24px 20px",
                      borderRadius: 14,
                      border: `1.5px solid ${plan.highlight ? "var(--accent)" : "var(--border)"}`,
                      background: plan.highlight ? "var(--accent-lt)" : "#fff",
                      textDecoration: "none",
                      transition: "transform .15s, box-shadow .15s",
                      position: "relative",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,0,0,.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    {plan.highlight && (
                      <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>
                        MOST POPULAR
                      </span>
                    )}
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t3)", marginBottom: 6 }}>{plan.name}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.03em", marginBottom: 12 }}>{plan.price}</p>
                    <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 4 }}>✓ {plan.articles}</p>
                    <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 4 }}>✓ {plan.reviews}</p>
                    <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 4 }}>✓ Auto-publish to Shopify</p>
                    <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 16 }}>✓ Internal links included</p>
                    <div style={{ padding: "10px 16px", borderRadius: 100, background: "var(--t1)", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                      Start now →
                    </div>
                  </a>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", marginTop: 16 }}>
                Not sure which plan? <a href="mailto:rafa@happyoperators.com?subject=I%20want%20to%20start%20automating%20my%20blog!" style={{ color: "var(--accent)", textDecoration: "none" }}>Reply to this email</a> — we&apos;ll figure it out together.
              </p>
            </div>

            {/* E-E-A-T author section */}
            <div style={{ marginTop: 40, padding: "28px 32px", background: "#fff", border: "1px solid var(--border)", borderRadius: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-section)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
                  👤
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>Written by</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>
                    {article.businessName} Team
                    <span style={{ marginLeft: 8, fontSize: 11, background: "rgba(234,179,8,.12)", color: "#92400e", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>Auto-generated placeholder</span>
                  </p>
                  <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 10 }}>
                    This article was written on behalf of {article.businessName}. When you sign up, BloomContent builds a real E-E-A-T author profile for your store — including your name, experience, credentials, and social profiles — so every article ranks stronger in Google&apos;s Helpful Content system.
                  </p>
                  <p style={{ fontSize: 12, color: "var(--t3)" }}>
                    ✦ Real author bio · ✦ Person schema markup · ✦ Social profile links · ✦ First-person voice trained on your experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
