"use client";

/* ── Next.js route-level loading boundary ────────────────────────────────── */
/* Shows while app/page.tsx is loading its JS bundle.                         */
/* Uses CSS-only animations so no provider/context is needed.                 */

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "#080606" }}
    >
      {/* Warm ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(114,47,55,0.10) 0%, transparent 68%)",
        }}
      />

      {/* Wax seal SVG — CSS scale-in + pulse */}
      <div
        className="seal-glow"
        style={{
          animation:
            "seal-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both, seal-pulse 1.4s ease-in-out 0.9s infinite",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="57" stroke="rgba(212,175,55,0.45)" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx="60" cy="60" r="50" fill="#5C1E2A" />
          <circle cx="60" cy="60" r="50" stroke="rgba(212,175,55,0.85)" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="43" stroke="rgba(212,175,55,0.30)" strokeWidth="0.7" strokeDasharray="3 2" />
          <text x="60" y="52" textAnchor="middle" fill="#D4AF37" fontSize="20" fontFamily="Georgia,serif" fontWeight="300">G</text>
          <line x1="42" y1="62" x2="78" y2="62" stroke="rgba(212,175,55,0.55)" strokeWidth="0.8" />
          <text x="60" y="78" textAnchor="middle" fill="#D4AF37" fontSize="20" fontFamily="Georgia,serif" fontWeight="300">N</text>
          <circle cx="60" cy="12"  r="2.5" fill="rgba(212,175,55,0.55)" />
          <circle cx="108" cy="60" r="2.5" fill="rgba(212,175,55,0.55)" />
          <circle cx="60" cy="108" r="2.5" fill="rgba(212,175,55,0.55)" />
          <circle cx="12"  cy="60" r="2.5" fill="rgba(212,175,55,0.55)" />
        </svg>
      </div>

      {/* "Grace & Noelvie — Opening Invitation" below the seal */}
      <div
        className="absolute text-center"
        style={{
          bottom: "12%",
          animation: "fade-up 0.7s ease-out 0.8s both",
        }}
      >
        <p
          className="font-wedding"
          style={{
            fontSize: "1.6rem",
            background:
              "linear-gradient(160deg,#9A7808 0%,#D4AF37 40%,#F5E080 55%,#C8A028 80%,#9A7808 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px",
          }}
        >
          Grace &amp; Noelvie
        </p>
        <p
          style={{
            fontSize: "8px",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Opening Invitation…
        </p>
      </div>

      {/* Keyframes via a style tag — runs before providers are ready */}
      <style>{`
        @keyframes seal-in {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
