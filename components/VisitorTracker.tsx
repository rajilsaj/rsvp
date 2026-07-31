"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_ID_KEY = "visitor-session-id";
const TRACKED_PREFIX = "visitor-tracked:";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage unavailable (private mode) — server groups by IP+UA instead
    return "";
  }
}

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    try {
      // One record per page per session, but every page gets recorded once
      if (sessionStorage.getItem(TRACKED_PREFIX + pathname)) return;
      sessionStorage.setItem(TRACKED_PREFIX + pathname, "1");
    } catch {
      // still record the visit
    }

    fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionId: getSessionId() }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
