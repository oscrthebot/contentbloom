"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateButton({ storeName }: { storeName: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/articles/generate", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "11px 28px",
          borderRadius: 8,
          background: loading ? "#9ca3af" : "#16a34a",
          color: "#fff",
          border: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff", borderRadius: "50%",
              animation: "spin 0.8s linear infinite", display: "inline-block"
            }} />
            Starting generation…
          </>
        ) : (
          `Generate first article for ${storeName} →`
        )}
      </button>
      {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{error}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
