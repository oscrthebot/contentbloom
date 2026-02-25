"use client";

import { useState } from "react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "€49/mo",
    features: ["1 article per day", "SEO optimized", "Dashboard access", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "€99/mo",
    features: ["2 articles per day", "SEO optimized", "Dashboard access", "Priority support", "Keyword research"],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "€199/mo",
    features: ["5 articles per day", "SEO optimized", "Dashboard access", "Priority support", "Keyword research", "Content calendar"],
  },
];

export function PlanView({
  currentPlan,
  subscriptionStatus,
}: {
  currentPlan: string;
  subscriptionStatus?: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong");
    }
  }

  return (
    <div>
      {/* Current plan banner */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: 20,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>Current plan</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>
            {currentPlan}
            {subscriptionStatus && subscriptionStatus !== "active" && (
              <span style={{ fontSize: 13, fontWeight: 500, color: "#f59e0b", marginLeft: 8 }}>
                ({subscriptionStatus})
              </span>
            )}
          </div>
        </div>
        {currentPlan !== "trial" && (
          <button
            onClick={handleManageBilling}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
              color: "#374151",
            }}
          >
            Manage billing
          </button>
        )}
      </div>

      {error && (
        <div style={{
          background: "#fef2f2",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: 13,
          color: "#991b1b",
        }}>
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div key={plan.id} style={{
              background: "#fff",
              borderRadius: 12,
              border: plan.popular ? "2px solid #16a34a" : "1px solid #e5e7eb",
              padding: 24,
              position: "relative",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#16a34a",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 12px",
                  borderRadius: 12,
                }}>
                  Most popular
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 16 }}>{plan.price}</div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 13, color: "#6b7280", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#16a34a" }}>&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && handleUpgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 8,
                  background: isCurrent ? "#f3f4f6" : "#16a34a",
                  color: isCurrent ? "#9ca3af" : "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isCurrent ? "default" : "pointer",
                }}
              >
                {isCurrent ? "Current plan" : loading === plan.id ? "Loading..." : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
