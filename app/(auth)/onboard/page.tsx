"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "../../../components/Logo";

interface StoreForm {
  name: string;
  storeName: string;
  storeUrl: string;
  niche: string;
}

interface AuthorForm {
  fullName: string;
  bio: string;
  yearsExperience: string;
  linkedinUrl: string;
  credentials: string;
}

interface ShopifyForm {
  shopifyDomain: string;
  shopifyAccessToken: string;
}

function OnboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const plan = searchParams.get("plan") || "";

  const [step, setStep] = useState<"verifying" | "store" | "author" | "shopify" | "done">(
    token ? "verifying" : "store"
  );
  const [storeForm, setStoreForm] = useState<StoreForm>({
    name: "",
    storeName: "",
    storeUrl: "",
    niche: "",
  });
  const [authorForm, setAuthorForm] = useState<AuthorForm>({
    fullName: "",
    bio: "",
    yearsExperience: "",
    linkedinUrl: "",
    credentials: "",
  });
  const [shopifyForm, setShopifyForm] = useState<ShopifyForm>({
    shopifyDomain: "",
    shopifyAccessToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && step === "verifying") {
      setStep("store");
    }
  }, [token, step]);

  async function handleStoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const profileRes = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeForm.name,
          storeName: storeForm.storeName,
          storeUrl: storeForm.storeUrl,
          niche: storeForm.niche,
        }),
      });
      if (!profileRes.ok) throw new Error("Failed to update profile");

      const storeRes = await fetch("/api/stores/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeForm.storeName,
          storeUrl: storeForm.storeUrl,
          niche: storeForm.niche,
          plan: plan || "trial",
        }),
      });
      if (!storeRes.ok) throw new Error("Failed to create store");

      // Advance to author profile step
      setStep("author");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthorSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveAuthorAndContinue(authorForm);
  }

  async function handleSkipAuthor() {
    await saveAuthorAndContinue(null);
  }

  async function saveAuthorAndContinue(author: AuthorForm | null) {
    setLoading(true);
    setError("");

    try {
      if (author && author.fullName && author.bio) {
        await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorProfile: {
              fullName: author.fullName,
              bio: author.bio,
              yearsExperience: author.yearsExperience ? Number(author.yearsExperience) : 0,
              niche: storeForm.niche,
              linkedinUrl: author.linkedinUrl || undefined,
              credentials: author.credentials || undefined,
            },
          }),
        });
      }
      setStep("shopify");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShopifySubmit(e: React.FormEvent) {
    e.preventDefault();
    await finishOnboarding(shopifyForm);
  }

  async function handleSkipShopify() {
    await finishOnboarding(null);
  }

  async function finishOnboarding(shopify: ShopifyForm | null) {
    setLoading(true);
    setError("");

    try {
      if (shopify && shopify.shopifyDomain && shopify.shopifyAccessToken) {
        await fetch("/api/shopify/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shopifyDomain: shopify.shopifyDomain,
            shopifyAccessToken: shopify.shopifyAccessToken,
          }),
        });
      }

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

  const inputStyle = {
    width: "100%" as const,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ width: "100%", maxWidth: 520, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo size="lg" href="/" />
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          padding: 32,
          boxShadow: "0 2px 12px rgba(0,0,0,.06)",
        }}>
          {step === "verifying" && (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Verifying your link...</p>
          )}

          {/* ---- Step 1: Store profile ---- */}
          {step === "store" && (
            <>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {["Store", "Author", "Shopify"].map((label, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: i === 0 ? "#16a34a" : "#e5e7eb",
                      color: i === 0 ? "#fff" : "#9ca3af",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 11, color: i === 0 ? "#16a34a" : "#9ca3af", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

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

              <form onSubmit={handleStoreSubmit}>
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
                      value={storeForm[key as keyof StoreForm]}
                      onChange={(e) => setStoreForm({ ...storeForm, [key]: e.target.value })}
                      placeholder={placeholder}
                      required={key === "name" || key === "storeName"}
                      style={inputStyle}
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
                  {loading ? "Setting up..." : "Continue →"}
                </button>
              </form>

              <p style={{ marginTop: 20, fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 1.5 }}>
                💡 You can add more stores later from your dashboard
                <br />
                <span style={{ color: "#16a34a", fontWeight: 500 }}>+20% discount for each additional store</span>
              </p>
            </>
          )}

          {/* ---- Step 2: Author profile (E-E-A-T) ---- */}
          {step === "author" && (
            <>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {["Store", "Author", "Shopify"].map((label, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: i <= 1 ? "#16a34a" : "#e5e7eb",
                      color: i <= 1 ? "#fff" : "#9ca3af",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                    }}>{i === 0 ? "✓" : i + 1}</div>
                    <span style={{ fontSize: 11, color: i <= 1 ? "#16a34a" : "#9ca3af", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 6 }}>
                  Add your author profile for E-E-A-T SEO
                </h2>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.55 }}>
                  Google rewards content with real author expertise. Adding your bio helps your articles rank higher with the E-E-A-T signal.
                </p>
              </div>

              {/* E-E-A-T explainer pill */}
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 12,
                color: "#166534",
                lineHeight: 1.5,
              }}>
                🏆 <strong>Experience · Expertise · Authoritativeness · Trustworthiness</strong> — Google's 2023 quality signal. Articles with a real author bio consistently outrank anonymous content.
              </div>

              <form onSubmit={handleAuthorSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Full name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={authorForm.fullName}
                    onChange={(e) => setAuthorForm({ ...authorForm, fullName: e.target.value })}
                    placeholder="María García"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Bio in first person — 50-100 words{" "}
                    <span style={{ color: "#dc2626" }}>*</span>
                    <span style={{ color: "#9ca3af", fontWeight: 400 }}> ({authorForm.bio.trim().split(/\s+/).filter(Boolean).length} words)</span>
                  </label>
                  <textarea
                    value={authorForm.bio}
                    onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                    placeholder="Llevo más de 8 años trabajando en el sector del cuidado de mascotas. He probado cientos de productos y mi objetivo es ayudarte a elegir lo mejor para tu compañero."
                    required
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }}
                  />
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    Write as if introducing yourself to a reader. Include your background and why they should trust you.
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Years of experience in {storeForm.niche || "your niche"}
                  </label>
                  <input
                    type="number"
                    value={authorForm.yearsExperience}
                    onChange={(e) => setAuthorForm({ ...authorForm, yearsExperience: e.target.value })}
                    placeholder="5"
                    min="0"
                    max="50"
                    style={{ ...inputStyle, width: "120px" }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    LinkedIn URL <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={authorForm.linkedinUrl}
                    onChange={(e) => setAuthorForm({ ...authorForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/yourname"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Credentials / Certifications <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={authorForm.credentials}
                    onChange={(e) => setAuthorForm({ ...authorForm, credentials: e.target.value })}
                    placeholder="e.g. Certified Nutritionist, Google Analytics Certified"
                    style={inputStyle}
                  />
                </div>

                {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
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
                    {loading ? "Saving..." : "Save & Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipAuthor}
                    disabled={loading}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 8,
                      background: "transparent",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                      fontSize: 14,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ---- Step 3: Shopify Connection ---- */}
          {step === "shopify" && (
            <>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {["Store", "Author", "Shopify"].map((label, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "#16a34a",
                      color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                    }}>{i < 2 ? "✓" : "3"}</div>
                    <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 6 }}>
                  Connect your Shopify store
                </h2>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.55 }}>
                  Automatically publish articles to your Shopify blog — no copy-pasting needed.
                </p>
              </div>

              {/* Shopify explainer */}
              <div style={{
                background: "#faf5ff",
                border: "1px solid #e9d5ff",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 12,
                color: "#6b21a8",
                lineHeight: 1.5,
              }}>
                🛍️ <strong>Admin API Access Token</strong> — Go to Shopify Admin → Settings → Apps → Develop apps → Create a custom app → Install app → Copy the <em>Admin API access token</em>.
              </div>

              <form onSubmit={handleShopifySubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Shopify store domain
                  </label>
                  <input
                    type="text"
                    value={shopifyForm.shopifyDomain}
                    onChange={(e) => setShopifyForm({ ...shopifyForm, shopifyDomain: e.target.value })}
                    placeholder="your-store.myshopify.com"
                    style={inputStyle}
                  />
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    Your myshopify.com domain (e.g. my-store.myshopify.com)
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Admin API Access Token
                  </label>
                  <input
                    type="password"
                    value={shopifyForm.shopifyAccessToken}
                    onChange={(e) => setShopifyForm({ ...shopifyForm, shopifyAccessToken: e.target.value })}
                    placeholder="shpat_xxx..."
                    style={inputStyle}
                  />
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    Admin API Access Token from Shopify Partners &gt; Apps &gt; Custom apps
                  </div>
                </div>

                {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: 8,
                      background: loading ? "#9ca3af" : "#7c3aed",
                      color: "#fff",
                      border: "none",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Connecting..." : "Connect Shopify"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipShopify}
                    disabled={loading}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 8,
                      background: "transparent",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                      fontSize: 14,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    Skip for now
                  </button>
                </div>
              </form>

              <p style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                You can connect later in Settings → Stores
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
