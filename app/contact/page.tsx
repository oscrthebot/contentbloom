"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) { setSent(true); }
      else { setError("Something went wrong. Please try again."); }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const input = { padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-md)", fontSize: 14, background: "var(--bg)", color: "var(--t1)", outline: "none", width: "100%", boxSizing: "border-box" as const, fontFamily: "inherit" };

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(249,248,248,.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", zIndex: 100, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="BloomContent" width={24} height={24} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>BloomContent</span>
        </Link>
        <Link href="/#pricing" className="btn btn-dark" style={{ fontSize: 13, padding: "8px 16px" }}>
          Get 2 Free Articles <ArrowRight size={13} />
        </Link>
      </nav>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "100px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.03em", marginBottom: 8 }}>Contact us</h1>
        <p style={{ fontSize: 15, color: "var(--t2)", marginBottom: 40, lineHeight: 1.7 }}>
          Questions about plans, the service, or just want to say hi? We&apos;ll get back to you within 24 hours.
        </p>

        {sent ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <CheckCircle size={40} style={{ color: "var(--accent)", margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>Message sent!</h3>
            <p style={{ fontSize: 14, color: "var(--t2)" }}>We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", display: "block", marginBottom: 6 }}>Name</label>
                <input style={input} placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", display: "block", marginBottom: 6 }}>Email</label>
                <input type="email" style={input} placeholder="you@store.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", display: "block", marginBottom: 6 }}>Message</label>
              <textarea style={{ ...input, minHeight: 140, resize: "vertical" as const }} placeholder="Tell us about your store and what you need..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            </div>
            {error && <p style={{ fontSize: 13, color: "#dc2626" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-dark" style={{ fontSize: 15, padding: "13px 28px", alignSelf: "flex-start" }}>
              {loading ? "Sending…" : "Send message →"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
