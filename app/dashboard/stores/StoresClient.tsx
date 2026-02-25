"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Store {
  _id: string;
  storeName: string;
  storeUrl: string;
  niche?: string;
  plan: string;
  status: string;
  storeIndex: number;
  discountMultiplier: number;
  createdAt: number;
}

interface StoresClientProps {
  stores: Store[];
  planPrices: Record<string, number>;
}

export function StoresClient({ stores, planPrices }: StoresClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ storeName: "", storeUrl: "", niche: "", plan: "starter" as string });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pricing for the next store
  const nextStoreIndex = stores.length;
  const nextDiscount = Math.pow(0.8, nextStoreIndex);
  const nextPlanPrice = planPrices[form.plan] ?? 49;
  const nextPrice = (nextPlanPrice * nextDiscount).toFixed(2);
  const discountPct = Math.round((1 - nextDiscount) * 100);

  async function handleAddStore(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stores/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create store");

      setShowModal(false);
      setForm({ storeName: "", storeUrl: "", niche: "", plan: "starter" });

      // If plan is paid, go to checkout
      if (form.plan !== "trial" && form.plan !== "") {
        const checkout = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: form.plan }),
        });
        const checkoutData = await checkout.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const planColors: Record<string, string> = {
    trial: "#f59e0b",
    starter: "#16a34a",
    growth: "#2563eb",
    scale: "#7c3aed",
    cancelled: "#9ca3af",
  };

  const statusColors: Record<string, string> = {
    active: "#16a34a",
    paused: "#f59e0b",
    cancelled: "#9ca3af",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>My Stores</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#16a34a",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add another store
        </button>
      </div>

      {/* Multi-store pricing note */}
      {stores.length > 0 && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 24,
          fontSize: 13,
          color: "#166534",
        }}>
          💡 <strong>Multi-store discount:</strong> Each additional store gets 20% off the previous store&apos;s price.
          Your {stores.length + 1 === 2 ? "second" : stores.length + 1 === 3 ? "third" : `${stores.length + 1}th`} store
          would be at <strong>{discountPct}% off</strong>.
        </div>
      )}

      {/* Stores list */}
      {stores.length === 0 ? (
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 48,
          textAlign: "center",
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>No stores yet</h3>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
            Complete the onboarding to set up your first store.
          </p>
          <a
            href="/onboard"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 8,
              background: "#16a34a",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Set up your store →
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {stores.map((store, i) => {
            const discountPct = Math.round((1 - store.discountMultiplier) * 100);
            return (
              <div
                key={store._id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{store.storeName}</span>
                    {i === 0 && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "#f3f4f6",
                        color: "#6b7280",
                      }}>Primary</span>
                    )}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: (statusColors[store.status] || "#9ca3af") + "18",
                      color: statusColors[store.status] || "#9ca3af",
                      textTransform: "capitalize",
                    }}>{store.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                    <a href={store.storeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
                      {store.storeUrl}
                    </a>
                  </div>
                  {store.niche && (
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Niche: {store.niche}</div>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 4,
                    background: (planColors[store.plan] || "#9ca3af") + "18",
                    color: planColors[store.plan] || "#9ca3af",
                    textTransform: "capitalize",
                    display: "block",
                    marginBottom: 4,
                  }}>{store.plan}</span>
                  {discountPct > 0 && (
                    <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 500 }}>
                      {discountPct}% discount applied
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Store Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 32,
            width: "100%",
            maxWidth: 460,
            position: "relative",
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#9ca3af",
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              Add another store
            </h2>

            {/* Pricing preview */}
            {nextPlanPrice > 0 && (
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 13,
                color: "#166534",
              }}>
                {nextStoreIndex === 1
                  ? `Your second store: €${nextPrice}/month (20% off)`
                  : `Store #${nextStoreIndex + 1}: €${nextPrice}/month (${discountPct}% off)`}
              </div>
            )}

            <form onSubmit={handleAddStore}>
              {/* Plan picker */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Plan
                </label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 14,
                    background: "#fff",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="trial">Trial (free)</option>
                  <option value="starter">Starter — €{(planPrices.starter * nextDiscount).toFixed(2)}/mo</option>
                  <option value="growth">Growth — €{(planPrices.growth * nextDiscount).toFixed(2)}/mo</option>
                  <option value="scale">Scale — €{(planPrices.scale * nextDiscount).toFixed(2)}/mo</option>
                </select>
              </div>

              {[
                { key: "storeName", label: "Store name", placeholder: "My Second Store", required: true },
                { key: "storeUrl", label: "Store URL", placeholder: "https://mystore2.com", required: false },
                { key: "niche", label: "Niche / Industry", placeholder: "e.g. fitness gear, home decor", required: false },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    required={required}
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
                  marginTop: 4,
                }}
              >
                {loading ? "Adding store..." : "Add store"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
