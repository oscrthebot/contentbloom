"use client";

import { useState } from "react";

interface AuthorProfile {
  fullName?: string;
  bio?: string;
  yearsExperience?: number;
  niche?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  credentials?: string;
}

interface UserData {
  email: string;
  name: string;
  storeName: string;
  storeUrl: string;
  niche: string;
  plan: string;
  authorProfile?: AuthorProfile;
}

export function ProfileForm({ user }: { user: UserData }) {
  const [form, setForm] = useState({
    name: user.name,
    storeName: user.storeName,
    storeUrl: user.storeUrl,
    niche: user.niche,
  });

  const [authorForm, setAuthorForm] = useState<AuthorProfile>({
    fullName: user.authorProfile?.fullName ?? "",
    bio: user.authorProfile?.bio ?? "",
    yearsExperience: user.authorProfile?.yearsExperience ?? 0,
    niche: user.authorProfile?.niche ?? user.niche ?? "",
    linkedinUrl: user.authorProfile?.linkedinUrl ?? "",
    twitterUrl: user.authorProfile?.twitterUrl ?? "",
    credentials: user.authorProfile?.credentials ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const payload: Record<string, any> = { ...form };

      // Include authorProfile if fullName is filled
      if (authorForm.fullName) {
        payload.authorProfile = {
          fullName: authorForm.fullName,
          bio: authorForm.bio ?? "",
          yearsExperience: Number(authorForm.yearsExperience) || 0,
          niche: authorForm.niche || form.niche || "",
          linkedinUrl: authorForm.linkedinUrl || undefined,
          twitterUrl: authorForm.twitterUrl || undefined,
          credentials: authorForm.credentials || undefined,
        };
      }

      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const wordCount = String(authorForm.bio ?? "").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      padding: 24,
      maxWidth: 560,
    }}>
      <form onSubmit={handleSubmit}>
        {/* ---- Account info ---- */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Account</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Email</label>
          <input value={user.email} disabled style={{ ...inputStyle, background: "#f9fafb", color: "#9ca3af" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
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

        {/* ---- Author profile (E-E-A-T) ---- */}
        <div style={{
          borderTop: "1px solid #e5e7eb",
          marginTop: 24,
          paddingTop: 24,
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Author Profile (E-E-A-T)</div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.5 }}>
            Help Google trust your content. Articles with a verified author bio rank significantly better.
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Full name</label>
          <input
            value={authorForm.fullName ?? ""}
            onChange={(e) => setAuthorForm({ ...authorForm, fullName: e.target.value })}
            placeholder="María García"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
            Bio in first person — 50-100 words
            <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>({wordCount} words)</span>
          </label>
          <textarea
            value={authorForm.bio ?? ""}
            onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
            placeholder="Llevo más de 8 años trabajando en el sector..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
            Years of experience in your niche
          </label>
          <input
            type="number"
            value={authorForm.yearsExperience ?? ""}
            onChange={(e) => setAuthorForm({ ...authorForm, yearsExperience: Number(e.target.value) })}
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
            value={authorForm.linkedinUrl ?? ""}
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
            value={authorForm.credentials ?? ""}
            onChange={(e) => setAuthorForm({ ...authorForm, credentials: e.target.value })}
            placeholder="Certified Nutritionist, Google Analytics Certified"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            <span style={{ fontSize: 13, color: "#16a34a" }}>✓ Saved!</span>
          )}
        </div>
      </form>
    </div>
  );
}
