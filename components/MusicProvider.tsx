"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, VolumeX } from "lucide-react";

type MusicCtx = { playing: boolean; toggle: () => void; ready: boolean };
const MusicContext = createContext<MusicCtx>({ playing: false, toggle: () => {}, ready: false });
export const useMusic = () => useContext(MusicContext);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (audioRef.current) return; // already created (StrictMode double-mount guard)

    const audio = new Audio("/music.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => setReady(true), { once: true });
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("ended", () => setPlaying(false));

    // Play on first user interaction — works on iOS because play() is called
    // synchronously inside the event handler with no async gap.
    function onFirstInteraction() {
      audio.play().catch(() => {});
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
    }

    document.addEventListener("click", onFirstInteraction, { passive: true });
    document.addEventListener("touchstart", onFirstInteraction, { passive: true });
    document.addEventListener("keydown", onFirstInteraction, { passive: true });

    return () => {
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  return (
    <MusicContext.Provider value={{ playing, toggle, ready }}>
      {children}

      {/* ── Floating music button ── */}
      <button
        onClick={toggle}
        disabled={!ready}
        className={`fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all
          ${!ready
            ? "bg-dark-teal/40 cursor-wait"
            : playing
              ? "bg-teal-accent hover:bg-dark-teal"
              : "bg-dark-teal hover:bg-teal-accent"}`}
        aria-label={playing ? "Pause music" : "Play music"}
        title={!ready ? "Loading music…" : playing ? "Pause" : "Play our song"}
      >
        <AnimatePresence mode="wait">
          {!ready ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-4 w-4 rounded-full border-2 border-[#faf9f6]/60 border-t-transparent animate-spin"
            />
          ) : playing ? (
            <motion.span
              key="playing"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              className="relative flex items-center justify-center w-full h-full"
            >
              <span className="absolute inset-0 rounded-full bg-teal-accent/40 animate-ping" />
              <VolumeX className="h-4 w-4 text-[#faf9f6] relative" />
            </motion.span>
          ) : (
            <motion.span
              key="paused"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
            >
              <Music className="h-4 w-4 text-[#faf9f6]" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </MusicContext.Provider>
  );
}
