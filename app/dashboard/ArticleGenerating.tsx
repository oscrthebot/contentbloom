"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Analysing your store and products…",
  "Researching the best keywords for your niche…",
  "Writing your first SEO article…",
  "Running quality and humanizer checks…",
  "Almost there — finalising your article…",
];

export function ArticleGenerating({ storeName }: { storeName: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState(".");

  // Cycle through steps every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      padding: 48,
      textAlign: "center",
    }}>
      {/* Animated ring */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "3px solid #e5e7eb",
          borderTopColor: "#16a34a",
          animation: "spin 1s linear infinite",
        }} />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
        Generating your first article for <span style={{ color: "#16a34a" }}>{storeName}</span>
      </h3>

      {/* Step indicator */}
      <p
        key={stepIndex}
        style={{
          color: "#6b7280",
          fontSize: 14,
          marginBottom: 24,
          animation: "fadein 0.4s ease",
        }}
      >
        {STEPS[stepIndex]}{dots}
      </p>

      {/* Progress bar */}
      <div style={{
        maxWidth: 320,
        margin: "0 auto 24px",
        height: 6,
        background: "#f3f4f6",
        borderRadius: 99,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${Math.round(((stepIndex + 1) / STEPS.length) * 100)}%`,
          background: "linear-gradient(90deg, #16a34a, #22c55e)",
          borderRadius: 99,
          transition: "width 0.8s ease",
        }} />
      </div>

      <p style={{ fontSize: 12, color: "#9ca3af" }}>
        This usually takes 2–4 minutes. We&apos;ll email you when it&apos;s ready.
      </p>
    </div>
  );
}
