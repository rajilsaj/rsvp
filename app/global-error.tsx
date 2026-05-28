"use client";

import { RefreshCw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#faf9f6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
          fontFamily: "sans-serif",
          color: "#1d3d37",
        }}
      >
        <p style={{ letterSpacing: "0.3em", fontSize: "11px", color: "rgba(29,61,55,0.4)", marginBottom: "32px", textTransform: "uppercase" }}>
          G · N — Grace &amp; Noelvie
        </p>

        <p style={{ fontSize: "5rem", fontWeight: 300, color: "rgba(29,61,55,0.05)", marginBottom: "-2rem", lineHeight: 1 }}>!</p>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, marginBottom: "12px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "rgba(29,61,55,0.5)", marginBottom: "32px", maxWidth: "380px", lineHeight: 1.6, fontSize: "14px" }}>
          A critical error occurred. This has been noted. Please refresh the page to continue.
        </p>

        <button
          onClick={reset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            background: "#3d8b7a",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "10px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          ↺ Try again
        </button>

        <p style={{ marginTop: "64px", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(29,61,55,0.2)" }}>
          Saturday · 22 August 2026 · Youngsville NC
        </p>
      </body>
    </html>
  );
}
