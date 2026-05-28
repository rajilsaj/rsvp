"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

type BannerState = "offline" | "back-online" | "hidden";

export function OfflineBanner() {
  const [state, setState] = useState<BannerState>("hidden");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function goOffline() {
      clearTimeout(timer);
      setState("offline");
    }

    function goOnline() {
      setState("back-online");
      timer = setTimeout(() => setState("hidden"), 3500);
    }

    // Check immediately on mount
    if (!navigator.onLine) setState("offline");

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {state !== "hidden" && (
        <motion.div
          key={state}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2.5 px-5 py-3 shadow-xl
            ${state === "offline"
              ? "bg-dark-teal text-[#faf9f6]"
              : "bg-teal-accent text-white"}`}
          role="alert"
          aria-live="assertive"
        >
          {state === "offline" ? (
            <>
              <WifiOff className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="text-[9px] tracking-[0.28em] uppercase font-medium">No connection</p>
                <p className="text-[8px] text-[#faf9f6]/60 mt-0.5">Check your internet and try again.</p>
              </div>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 flex-shrink-0" />
              <p className="text-[9px] tracking-[0.28em] uppercase font-medium">Back online!</p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
