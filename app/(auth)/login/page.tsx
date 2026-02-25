"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "../../../components/Logo";

export default function LoginPage() {
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
                We sent a login link to <strong>{email}</strong>. Click the link to sign in.
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
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Sign in</h2>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
                Enter your email to receive a login link.
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
                  {loading ? "Sending..." : "Send login link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#9ca3af" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#16a34a", textDecoration: "none", fontWeight: 500 }}>
            Sign up free
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#9ca3af" }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}
