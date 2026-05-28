"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, VolumeX } from "lucide-react";

type MusicCtx = { playing: boolean; toggle: () => void; ready: boolean };
const MusicContext = createContext<MusicCtx>({ playing: false, toggle: () => {}, ready: false });
export const useMusic = () => useContext(MusicContext);

/* ─────────────────────────────────────────────────────────────
   Module-level singleton — lives outside React's component tree.
   Navigation, re-renders, and StrictMode double-invocations
   cannot touch this object once it's created.
───────────────────────────────────────────────────────────────*/
const VIDEO_ID = "2bOXtkFb9FY";
let _player: any = null;
let _ready = false;
const _listeners = new Set<(playing: boolean, ready: boolean) => void>();

function notify(playing: boolean, ready: boolean) {
  _listeners.forEach((fn) => fn(playing, ready));
}

function getOrCreateDiv() {
  let el = document.getElementById("yt-bg-player");
  if (!el) {
    el = document.createElement("div");
    el.id = "yt-bg-player";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none;";
    document.body.appendChild(el);
  }
  return el;
}

function createPlayer() {
  if (_player) return;
  getOrCreateDiv();

  _player = new (window as any).YT.Player("yt-bg-player", {
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: VIDEO_ID,
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onReady: () => {
        _ready = true;
        _player?.playVideo();
        notify(true, true);
      },
      onStateChange: (e: any) => {
        if (e.data === 1) notify(true, true);           // playing
        if (e.data === 2 || e.data === -1) notify(false, true); // paused / buffering
        if (e.data === 0) _player?.playVideo();          // ended → loop
      },
    },
  });
}

function bootstrapYT() {
  if (typeof window === "undefined") return;
  if (_player) return; // already running

  if ((window as any).YT?.Player) {
    createPlayer();
  } else {
    // Queue up: called once the API script fires its global callback
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      createPlayer();
    };
    if (!document.getElementById("yt-api-script")) {
      const s = document.createElement("script");
      s.id = "yt-api-script";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  }
}
/* ─────────────────────────────────────────────────────────────*/

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Sync React state with the singleton
    const listener = (isPlaying: boolean, isReady: boolean) => {
      setPlaying(isPlaying);
      setReady(isReady);
    };
    _listeners.add(listener);

    // If player already exists (e.g., navigated back to this page), sync immediately
    if (_player && _ready) {
      setReady(true);
      setPlaying(_player.getPlayerState?.() === 1);
    } else {
      bootstrapYT();
    }

    // On unmount (HMR / dev re-mount), remove the listener — but DO NOT destroy the player
    return () => { _listeners.delete(listener); };
  }, []);

  function toggle() {
    if (!_player || !_ready) return;
    if (playing) {
      _player.pauseVideo();
    } else {
      _player.playVideo();
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
