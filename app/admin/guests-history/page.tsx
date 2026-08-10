"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  History,
  Mail,
  Minus,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GuestHistoryEntry } from "@/lib/google-sheets";

type ActionStyle = {
  icon: React.ReactNode;
  ring: string;
  text: string;
};

function actionStyle(action: string): ActionStyle {
  switch (action) {
    case "Guest added":
      return {
        icon: <Plus className="w-3.5 h-3.5" />,
        ring: "border-primary/40 bg-primary/10 text-primary",
        text: "text-primary",
      };
    case "Guest removed":
      return {
        icon: <Minus className="w-3.5 h-3.5" />,
        ring: "border-destructive/40 bg-destructive/10 text-destructive",
        text: "text-destructive",
      };
    case "RSVP changed":
      return {
        icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
        ring: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        text: "text-amber-600 dark:text-amber-400",
      };
    case "RSVP received":
      return {
        icon: <Mail className="w-3.5 h-3.5" />,
        ring: "border-primary/40 bg-primary/10 text-primary",
        text: "text-primary",
      };
    case "+Ones changed":
    default:
      return {
        icon: <Users className="w-3.5 h-3.5" />,
        ring: "border-muted-foreground/30 bg-muted text-muted-foreground",
        text: "text-foreground",
      };
  }
}

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GuestsHistoryPage() {
  const [entries, setEntries] = useState<GuestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/guests-history")
      .then((r) => r.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) =>
    search.trim()
      ? e.guestNames.toLowerCase().includes(search.trim().toLowerCase())
      : true
  );

  // Group entries (already newest-first) by calendar day
  const groups: { label: string; items: GuestHistoryEntry[] }[] = [];
  for (const entry of filtered) {
    const date = new Date(entry.timestamp);
    const label = isNaN(date.getTime()) ? "Unknown date" : dayLabel(date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading history…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl mb-1">Guest History</h1>
        <p className="text-muted-foreground text-sm">
          Every change to the guest list, newest first. The main list stays untouched.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history by guest name…"
          aria-label="Search history by guest name"
          className="rounded-full pl-10 pr-9"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <Card className="surface rounded-2xl p-12 text-center text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground mb-1">No history yet</p>
          <p className="text-sm">
            Changes to the guest list — new guests, removals, RSVP switches and +Ones —
            will show up here.
          </p>
        </Card>
      ) : (
        groups.map((group) => (
          <div key={group.label} className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <Card className="surface rounded-2xl p-2 sm:p-3">
              <ul className="relative">
                {/* Timeline line */}
                <span
                  aria-hidden="true"
                  className="absolute left-[22px] top-4 bottom-4 w-px bg-border sm:left-[26px]"
                />
                {group.items.map((entry, i) => {
                  const style = actionStyle(entry.action);
                  const date = new Date(entry.timestamp);
                  const time = isNaN(date.getTime())
                    ? ""
                    : date.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                  return (
                    <li
                      key={`${entry.timestamp}-${i}`}
                      className="relative flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/30 sm:p-3"
                    >
                      <span
                        className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${style.ring}`}
                      >
                        {style.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className={`font-medium ${style.text}`}>
                            {entry.action}
                          </span>
                          <span className="text-muted-foreground"> — </span>
                          <span className="font-medium break-words">
                            {entry.guestNames}
                          </span>
                        </p>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground mt-0.5 break-words">
                            {entry.details}
                          </p>
                        )}
                      </div>
                      {time && (
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground mt-1">
                          {time}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
