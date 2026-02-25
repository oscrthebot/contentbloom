"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "../../../components/Logo";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "login" }),
      });

      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Logo size="lg" href="/" />
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          padding: 32,
          boxShadow: "0 2px 12px rgba(0,0,0,.06)",
        }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>&#9993;</div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Check your email</h2>
              <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>
                We sent a magic link to <strong>{email}</strong>. Click it to create your account — no password needed.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{
                  marginTop: 24,
                  background: "none",
                  border: "none",
                  color: "#16a34a",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Create your account</h2>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
                Enter your email and we'll send you a link to get started — no password needed.
              </p>

              <form onSubmit={handleSubmit}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 14,
                    outline: "none",
                    marginBottom: 16,
                    boxSizing: "border-box",
                  }}
                />

                {error && (
                  <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 8,
                    background: loading ? "#9ca3af" : "#16a34a",
                    color: "#fff",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Sending link..." : "Get started free"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9ca3af" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "#16a34a", textDecoration: "none", fontWeight: 500 }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#9ca3af" }}>
          By signing up you agree to our{" "}
          <Link href="/terms" style={{ color: "#6b7280", textDecoration: "none" }}>Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "none" }}>Privacy Policy</Link>.
        </p>

        <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#9ca3af" }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}
