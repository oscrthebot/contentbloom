"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Unlock, Check, ChevronRight } from "lucide-react";

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
      <Link href="/" style={{ color: "var(--accent)", fontSize: 14 }}>← Go to ContentBloom</Link>
    </div>
  );
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
    setLoading(true);
    setError("");
    try {
      const result = await unlockMutation({ slug, email });
      setFullContent(result.content);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Render markdown-lite: bold, headers
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: 20, fontWeight: 800, color: "var(--t1)", margin: "32px 0 12px", letterSpacing: "-0.02em" }}>{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", margin: "24px 0 8px" }}>{line.slice(4)}</h3>;
      if (line.startsWith("• ") || line.startsWith("- ")) return (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <Check size={14} style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }} />
          <span style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7 }}>{line.slice(2)}</span>
        </div>
      );
      if (line.trim() === "") return <div key={i} style={{ height: 12 }} />;
      // Bold: **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.8, marginBottom: 4 }}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j} style={{ color: "var(--t1)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>
              : p
          )}
        </p>
      );
    });
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fade-up .45s ease both; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(249,248,248,.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", zIndex: 100, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="ContentBloom" width={24} height={24} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>ContentBloom</span>
        </Link>
        <Link href="/signup" className="btn btn-dark" style={{ fontSize: 13, padding: "8px 16px" }}>
          Get 2 Free Articles <ArrowRight size={13} />
        </Link>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px 80px" }}>

        {/* Meta badges */}
        <div className="fade-in" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", background: "var(--accent-lt)", padding: "3px 10px", borderRadius: 100 }}>
            SEO Score: {article.seoScore}
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)", padding: "3px 10px", border: "1px solid var(--border)", borderRadius: 100 }}>
            {article.wordCount.toLocaleString()} words
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)", padding: "3px 10px", border: "1px solid var(--border)", borderRadius: 100 }}>
            Written for {article.businessName}
          </span>
        </div>

        {/* Title */}
        <h1 className="fade-in" style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 24 }}>
          {article.title}
        </h1>

        {/* Preview text */}
        <div className="fade-in" style={{ marginBottom: 0 }}>
          {renderContent(article.preview)}
        </div>

        {/* Gate or full content */}
        {!fullContent ? (
          <>
            {/* Fade overlay */}
            <div style={{ position: "relative", height: 80, marginBottom: 0, background: "linear-gradient(to bottom, transparent, var(--bg))", pointerEvents: "none" }} />

            {/* Email gate card */}
            <div className="fade-in card" style={{ padding: "36px 32px", textAlign: "center", marginBottom: 48 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-lt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Lock size={20} style={{ color: "var(--accent)" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--t1)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                Read the full article — free
              </h3>
              <p style={{ fontSize: 14, color: "var(--t2)", marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
                Enter your email and the full article is yours — no account, no credit card.
              </p>
              <form onSubmit={handleUnlock} style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto", flexWrap: "wrap" }}>
                <input
                  type="email"
                  placeholder="you@yourstore.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: "11px 16px", borderRadius: 10, border: "1px solid var(--border-md)", fontSize: 14, background: "var(--bg)", color: "var(--t1)", outline: "none" }}
                  required
                />
                <button type="submit" disabled={loading} className="btn btn-dark" style={{ fontSize: 14, padding: "11px 22px" }}>
                  {loading ? "Unlocking…" : <>Unlock <Unlock size={14} /></>}
                </button>
              </form>
              {error && <p style={{ fontSize: 13, color: "#dc2626", marginTop: 12 }}>{error}</p>}
              <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 16 }}>
                We&apos;ll only use your email to send you relevant articles. No spam.
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

            {/* Full article content */}
            {renderContent(fullContent)}

            {/* CTA after reading */}
            <div className="card" style={{ padding: "40px 36px", textAlign: "center", marginTop: 56, background: "var(--bg-section)" }}>
              <p className="label" style={{ marginBottom: 12 }}>Like what you read?</p>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.02em", marginBottom: 12 }}>
                Get one article like this<br />every day, automatically
              </h3>
              <p style={{ fontSize: 15, color: "var(--t2)", marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
                ContentBloom writes and publishes daily SEO articles to {article.targetSite}. Automated, optimized, done for you.
              </p>
              <Link href="/#pricing" className="btn btn-dark" style={{ fontSize: 15, padding: "13px 28px" }}>
                See Plans — from €49/mo <ChevronRight size={15} />
              </Link>
              <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 12 }}>Start with 2 free articles. No credit card.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
