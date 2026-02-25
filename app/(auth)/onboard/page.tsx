"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function OnboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const plan = searchParams.get("plan") || ""; // plan is now optional

  const [step, setStep] = useState<"verifying" | "profile" | "done">(token ? "verifying" : "profile");
  const [form, setForm] = useState({ name: "", storeName: "", storeUrl: "", niche: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && step === "verifying") {
      // Token was already verified by /api/auth/verify redirect — user lands here with session cookie
      setStep("profile");
    }
  }, [token, step]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First update the user profile (name)
      const profileRes = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, storeName: form.storeName, storeUrl: form.storeUrl, niche: form.niche }),
      });

      if (!profileRes.ok) throw new Error("Failed to update profile");

      // Create the store record
      const storeRes = await fetch("/api/stores/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.storeName,
          storeUrl: form.storeUrl,
          niche: form.niche,
          plan: plan || "trial",
        }),
      });

      if (!storeRes.ok) throw new Error("Failed to create store");

      // Redirect logic:
      // - If plan is specified (from checkout flow), go to checkout
      // - Otherwise (signup flow / trial), go to dashboard
      if (plan && plan !== "trial") {
        const checkout = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await checkout.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const planLabels: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    scale: "Scale",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ width: "100%", maxWidth: 480, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>ContentBloom</span>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          padding: 32,
          boxShadow: "0 2px 12px rgba(0,0,0,.06)",
        }}>
          {step === "verifying" ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Verifying your link...</p>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                  Welcome! Set up your store
                </h2>
                {plan && planLabels[plan] ? (
                  <p style={{ color: "#6b7280", fontSize: 14 }}>
                    You selected the{" "}
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      background: "#dcfce7",
                      color: "#16a34a",
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 13,
                    }}>{planLabels[plan]}</span>{" "}
                    plan
                  </p>
                ) : (
                  <p style={{ color: "#6b7280", fontSize: 14 }}>
                    Tell us about your store so we can generate your first SEO article.
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                {[
                  { key: "name", label: "Your name", placeholder: "John Smith" },
                  { key: "storeName", label: "Store name", placeholder: "My Awesome Store" },
                  { key: "storeUrl", label: "Store URL", placeholder: "https://mystore.com" },
                  { key: "niche", label: "Niche / Industry", placeholder: "e.g. organic skincare, pet supplies" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      required={key === "name" || key === "storeName"}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}

                {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

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
                    marginTop: 8,
                  }}
                >
                  {loading ? "Setting up..." : "Continue"}
                </button>
              </form>

              {/* Multi-store note */}
              <p style={{
                marginTop: 20,
                fontSize: 12,
                color: "#9ca3af",
                textAlign: "center",
                lineHeight: 1.5,
              }}>
                💡 You can add more stores later from your dashboard
                <br />
                <span style={{ color: "#16a34a", fontWeight: 500 }}>+20% discount for each additional store</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <OnboardContent />
    </Suspense>
  );
}
