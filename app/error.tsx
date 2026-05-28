"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WifiOff, AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  const msg = error?.message ?? "";
  const isNetwork =
    msg.toLowerCase().includes("network") ||
    msg.toLowerCase().includes("fetch") ||
    msg.toLowerCase().includes("failed to fetch") ||
    msg.toLowerCase().includes("load failed") ||
    !navigator.onLine;

  return (
    <div className="min-h-[100dvh] bg-[#faf9f6] flex flex-col items-center justify-center px-5 text-center">

      {/* Monogram */}
      <div className="mb-10">
        <p className="font-display text-xl tracking-[0.3em] text-dark-teal font-light">G · N</p>
        <p className="text-[8px] tracking-[0.35em] uppercase text-dark-teal/40 mt-0.5">Grace &amp; Noelvie</p>
      </div>

      {/* Icon */}
      <div className="relative mb-8 flex items-center justify-center">
        <span className="font-display font-light text-[9rem] sm:text-[12rem] leading-none select-none text-dark-teal/[0.05]">
          {isNetwork ? "!" : "!"}
        </span>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {isNetwork
            ? <WifiOff className="h-10 w-10 text-teal-accent/60" strokeWidth={1.5} />
            : <AlertTriangle className="h-10 w-10 text-amber-400/70" strokeWidth={1.5} />}
          <p className="font-wedding text-4xl sm:text-5xl text-teal-accent">
            {isNetwork ? "Offline" : "Oops!"}
          </p>
        </div>
      </div>

      <div className="h-px w-10 bg-dark-teal/15 mx-auto mb-6" />

      <h1 className="font-display text-2xl sm:text-3xl font-light text-dark-teal mb-3">
        {isNetwork ? "Connection lost" : "Something went wrong"}
      </h1>

      <p className="text-sm text-dark-teal/50 max-w-sm leading-relaxed mb-4">
        {isNetwork
          ? "It looks like you're offline or the server is unreachable. Check your internet connection and try again."
          : "An unexpected error occurred. You can try reloading the page or head back home."}
      </p>

      {/* Readable error pill */}
      {msg && (
        <div className="flex items-center gap-2 bg-dark-teal/5 border border-dark-teal/10 px-4 py-2 mb-8 max-w-sm">
          <span className="text-[8px] tracking-[0.2em] uppercase text-dark-teal/30 flex-shrink-0">Error</span>
          <span className="text-[10px] font-mono text-dark-teal/40 truncate">{msg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          onClick={reset}
          className="flex items-center gap-2 text-[9px] tracking-[0.25em] uppercase text-[#faf9f6] bg-teal-accent px-6 py-3 hover:bg-dark-teal transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
        <Link
          href="/"
          className="text-[9px] tracking-[0.25em] uppercase text-dark-teal border border-dark-teal/25 px-6 py-3 hover:bg-dark-teal hover:text-[#faf9f6] transition-all"
        >
          Back home
        </Link>
      </div>

      <p className="mt-16 text-[8px] tracking-[0.3em] uppercase text-dark-teal/20">
        Saturday · 20 June 2026 · Youngsville NC
      </p>
    </div>
  );
}
