"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultUrl(null);

    if (!content.trim()) {
      setError("Paste content cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create paste.");
        return;
      }

      setResultUrl(data.url);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e5e7eb",
        padding: "3rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#020617",
          borderRadius: 12,
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Pastebin Lite</h1>
        <p style={{ color: "#94a3b8", marginBottom: 24 }}>
          Create a paste and share it securely with optional expiry and view
          limits.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Paste Content
          </label>
          <textarea
            placeholder="Write your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              color: "#e5e7eb",
              marginBottom: 20,
              resize: "vertical",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1 }}>
              <label>TTL (seconds)</label>
              <input
                type="number"
                min={1}
                placeholder="Optional"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>Max Views</label>
              <input
                type="number"
                min={1}
                placeholder="Optional"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              background: loading ? "#334155" : "#2563eb",
              color: "#fff",
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {loading ? "Creating paste..." : "Create Paste"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 12,
              background: "#7f1d1d",
              borderRadius: 8,
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {resultUrl && (
          <div
            style={{
              marginTop: 20,
              padding: 12,
              background: "#022c22",
              borderRadius: 8,
              color: "#bbf7d0",
            }}
          >
            <p>Paste created successfully:</p>
            <a
              href={resultUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#4ade80", wordBreak: "break-all" }}
            >
              {resultUrl}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e5e7eb",
};
