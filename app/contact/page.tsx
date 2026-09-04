"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, CheckCircle } from "lucide-react";

const MAILTO = "mailto:rafa@bloomcontent.site";

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
      else { setError("Algo ha fallado. Inténtalo de nuevo o escríbeme a rafa@bloomcontent.site."); }
    } catch {
      setError("Error de conexión. Escríbeme directamente a rafa@bloomcontent.site.");
    } finally {
      setLoading(false);
    }
  }

  const input = { padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-md)", fontSize: 14, background: "var(--bg)", color: "var(--t1)", outline: "none", width: "100%", boxSizing: "border-box" as const, fontFamily: "inherit" };

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(249,248,248,.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", zIndex: 100, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="Bloom" width={24} height={24} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 900, fontSize: 14, color: "var(--t1)", fontFamily: "'Outfit', sans-serif" }}>Bloom</span>
        </Link>
        <a href={MAILTO} className="btn btn-dark" style={{ fontSize: 13, padding: "8px 16px" }}>
          Escríbeme <Mail size={13} />
        </a>
      </nav>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "100px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.03em", marginBottom: 8 }}>Contacto</h1>
        <p style={{ fontSize: 15, color: "var(--t2)", marginBottom: 40, lineHeight: 1.7 }}>
          ¿Quieres una web para tu negocio? Cuéntame qué haces y te respondo en menos de 24 horas.
          También puedes escribirme a{" "}
          <a href={MAILTO} style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>rafa@bloomcontent.site</a>.
        </p>

        {sent ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <CheckCircle size={40} style={{ color: "var(--accent)", margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>¡Mensaje enviado!</h3>
            <p style={{ fontSize: 14, color: "var(--t2)" }}>Te respondo en menos de 24 horas.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", display: "block", marginBottom: 6 }}>Nombre</label>
                <input style={input} placeholder="Tu nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", display: "block", marginBottom: 6 }}>Email</label>
                <input type="email" style={input} placeholder="tu@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", display: "block", marginBottom: 6 }}>Mensaje</label>
              <textarea style={{ ...input, minHeight: 140, resize: "vertical" as const }} placeholder="Cuéntame sobre tu negocio y qué necesitas..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            </div>
            {error && <p style={{ fontSize: 13, color: "#dc2626" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-dark" style={{ fontSize: 15, padding: "13px 28px", alignSelf: "flex-start" }}>
              {loading ? "Enviando…" : "Enviar mensaje →"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
