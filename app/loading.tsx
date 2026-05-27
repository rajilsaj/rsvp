"use client";

import { useEffect, useRef } from "react";

export default function Loading() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Attempt to play sound on mount
    // Note: Autoplay might be blocked by browsers until the user interacts with the page
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#c5e0da]">
      {/* Background Sound Placeholder */}
      <audio
        ref={audioRef}
        src="/sounds/loading-chime.mp3"
        loop
      />

      <div className="relative mb-8">
        {/* Main Spinner */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-[#3d8b7a]/20 border-t-[#3d8b7a]"></div>
        
        {/* Inner Pulsing Heart */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <span className="text-2xl text-[#3d8b7a]">💌</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="mb-2 font-wedding text-4xl text-[#1d3d37] animate-pulse">
          Grace & Noelvie
        </h2>
        <p className="text-xs uppercase tracking-[0.3em] text-[#1d3d37]/60">
          Opening Invitation...
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#3d8b7a]/40 animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
}
