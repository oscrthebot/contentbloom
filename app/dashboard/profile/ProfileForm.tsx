"use client";

import { useState } from "react";

interface UserData {
  email: string;
  name: string;
  storeName: string;
  storeUrl: string;
  niche: string;
  plan: string;
}

export function ProfileForm({ user }: { user: UserData }) {
  const [form, setForm] = useState({
    name: user.name,
    storeName: user.storeName,
    storeUrl: user.storeUrl,
    niche: user.niche,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

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
    <div style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      padding: 24,
      maxWidth: 520,
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Email</label>
          <input value={user.email} disabled style={{ ...inputStyle, background: "#f9fafb", color: "#9ca3af" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Current plan</label>
          <input value={user.plan} disabled style={{ ...inputStyle, background: "#f9fafb", color: "#9ca3af", textTransform: "capitalize" }} />
        </div>

        {[
          { key: "name", label: "Name" },
          { key: "storeName", label: "Store name" },
          { key: "storeUrl", label: "Store URL" },
          { key: "niche", label: "Niche / Industry" },
        ].map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{label}</label>
            <input
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={inputStyle}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: saving ? "#9ca3af" : "#16a34a",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        {saved && (
          <span style={{ marginLeft: 12, fontSize: 13, color: "#16a34a" }}>Saved!</span>
        )}
      </form>
    </div>
  );
}
