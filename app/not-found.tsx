import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#faf9f6] flex flex-col items-center justify-center px-5 text-center">

      {/* Monogram */}
      <div className="mb-10">
        <p className="font-display text-xl tracking-[0.3em] text-dark-teal font-light">G · N</p>
        <p className="text-[8px] tracking-[0.35em] uppercase text-dark-teal/40 mt-0.5">Grace &amp; Noelvie</p>
      </div>

      {/* Ghost number + script overlay */}
      <div className="relative mb-8 flex items-center justify-center">
        <span className="font-display font-light text-[9rem] sm:text-[13rem] leading-none select-none text-dark-teal/[0.05]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-wedding text-5xl sm:text-7xl text-teal-accent">Lost…</p>
        </div>
      </div>

      <div className="h-px w-10 bg-dark-teal/15 mx-auto mb-6" />

      <h1 className="font-display text-2xl sm:text-3xl font-light text-dark-teal mb-3">
        Page not found
      </h1>
      <p className="text-sm text-dark-teal/50 max-w-xs leading-relaxed mb-10">
        This page doesn&apos;t exist — but the celebration does.
        <br />Head back and join us.
      </p>

      <Link
        href="/"
        className="text-[9px] tracking-[0.28em] uppercase text-dark-teal border border-dark-teal/25 px-7 py-3 hover:bg-dark-teal hover:text-[#faf9f6] transition-all"
      >
        Back to the celebration →
      </Link>

      <p className="mt-16 text-[8px] tracking-[0.3em] uppercase text-dark-teal/20">
        Saturday · 22 August 2026 · Youngsville NC
      </p>
    </div>
  );
}
