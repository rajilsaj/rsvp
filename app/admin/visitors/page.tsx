"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Globe,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Visitor } from "@/lib/google-sheets";

const ALL = "all";
const ANONYMOUS = "John Doe";

type Session = {
  key: string;
  name: string;
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  userAgent: string;
  hits: { path: string; timestamp: string }[];
  firstTs: number;
  lastTs: number;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function flagEmoji(code: string): string {
  const cc = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(
    ...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

function formatDuration(session: Session): string {
  const sec = Math.round((session.lastTs - session.firstTs) / 1000);
  if (session.hits.length < 2 || sec <= 0) return "—";
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function formatCreatedOn(ts: number): { day: string; time: string } {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return { day: "—", time: "" };
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return { day: "Today", time };
  if (sameDay(d, yesterday)) return { day: "Yesterday", time };
  return {
    day: d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }),
    time,
  };
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return isNaN(d.getTime())
    ? timestamp
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function deviceIcon(device: string) {
  if (device === "Mobile") return Smartphone;
  if (device === "Tablet") return Tablet;
  if (device === "Bot") return Bot;
  return Monitor;
}

function toTs(timestamp: string): number {
  const t = new Date(timestamp).getTime();
  return isNaN(t) ? 0 : t;
}

function groupSessions(visitors: Visitor[]): Session[] {
  const map = new Map<string, Session>();
  for (const v of visitors) {
    // Legacy rows have no sessionId — group by IP + UA + day instead
    const key =
      v.sessionId ||
      `${v.ip}|${v.userAgent}|${(v.timestamp || "").slice(0, 10)}`;
    const ts = toTs(v.timestamp);
    const existing = map.get(key);
    if (existing) {
      existing.hits.push({ path: v.path, timestamp: v.timestamp });
      existing.firstTs = Math.min(existing.firstTs, ts);
      existing.lastTs = Math.max(existing.lastTs, ts);
      if (!existing.name && v.name) existing.name = v.name;
      if (!existing.countryCode && v.countryCode) existing.countryCode = v.countryCode;
    } else {
      map.set(key, {
        key,
        name: v.name,
        ip: v.ip,
        country: v.country,
        countryCode: v.countryCode,
        region: v.region,
        city: v.city,
        device: v.device,
        browser: v.browser,
        os: v.os,
        userAgent: v.userAgent,
        hits: [{ path: v.path, timestamp: v.timestamp }],
        firstTs: ts,
        lastTs: ts,
      });
    }
  }
  for (const s of map.values()) {
    s.hits.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  return Array.from(map.values()).sort((a, b) => b.firstTs - a.firstTs);
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [country, setCountry] = useState(ALL);
  const [region, setRegion] = useState(ALL);
  const [device, setDevice] = useState(ALL);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/visitors")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setVisitors)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const sessions = useMemo(() => groupSessions(visitors), [visitors]);

  const countries = useMemo(() => unique(sessions.map((s) => s.country)), [sessions]);
  const devices = useMemo(() => unique(sessions.map((s) => s.device)), [sessions]);
  const regions = useMemo(
    () =>
      unique(
        sessions
          .filter((s) => country === ALL || s.country === country)
          .map((s) => s.region)
      ),
    [sessions, country]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions
      .filter((s) => country === ALL || s.country === country)
      .filter((s) => region === ALL || s.region === region)
      .filter((s) => device === ALL || s.device === device)
      .filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.ip.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q) ||
          s.hits.some((h) => h.path.toLowerCase().includes(q))
      );
  }, [sessions, country, region, device, search]);

  const stats = {
    total: sessions.length,
    countries: unique(sessions.map((s) => s.country)).length,
    mobile: sessions.filter((s) => s.device === "Mobile" || s.device === "Tablet").length,
    desktop: sessions.filter((s) => s.device === "Desktop").length,
  };

  const hasActiveFilter = country !== ALL || region !== ALL || device !== ALL || search !== "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading visitors…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Could not load visitors. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl mb-1">Visitors</h1>
        <p className="text-muted-foreground text-sm">
          One row per visit — pages viewed, duration, device and location
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { label: "Total Visits", value: stats.total, icon: Users },
            { label: "Countries", value: stats.countries, icon: Globe },
            { label: "Mobile / Tablet", value: stats.mobile, icon: Smartphone },
            { label: "Desktop", value: stats.desktop, icon: Laptop },
          ] as const
        ).map((s) => (
          <Card key={s.label} className="surface rounded-2xl p-4 text-center">
            <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="surface rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Country</label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setRegion(ALL);
              }}
              className={selectClass}
            >
              <option value={ALL}>All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={selectClass}
            >
              <option value={ALL}>All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Device</label>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className={selectClass}
            >
              <option value={ALL}>All devices</option>
              {devices.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Search</label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, IP, city, page…"
            />
          </div>
        </div>
        {hasActiveFilter && (
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} of {sessions.length} visits
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setCountry(ALL);
                setRegion(ALL);
                setDevice(ALL);
                setSearch("");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((s) => {
          const created = formatCreatedOn(s.firstTs);
          const DeviceIcon = deviceIcon(s.device);
          const isOpen = expanded === s.key;
          return (
            <Card key={s.key} className="surface rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {flagEmoji(s.countryCode) && (
                      <span className="mr-1.5">{flagEmoji(s.countryCode)}</span>
                    )}
                    {s.name || ANONYMOUS}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[s.city, s.country].filter(Boolean).join(", ") || "Unknown location"}
                    {s.ip ? ` · ${s.ip}` : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full text-xs shrink-0">
                  <DeviceIcon className="w-3 h-3 mr-1" />
                  {s.device || "—"}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">Pages: </span>
                  {s.hits.length}
                </span>
                <span>
                  <span className="font-medium text-foreground">Duration: </span>
                  {formatDuration(s)}
                </span>
                <span>
                  <span className="font-medium text-foreground">When: </span>
                  {created.day} {created.time}
                </span>
              </div>
              <button
                onClick={() => setExpanded(isOpen ? null : s.key)}
                className="mt-3 text-xs font-medium text-primary"
              >
                {isOpen ? "Hide pages" : "View pages"}
              </button>
              {isOpen && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {s.hits.map((h, j) => (
                    <li key={j} className="flex justify-between gap-3">
                      <span className="truncate">{h.path || "/"}</span>
                      <span className="shrink-0">{formatTime(h.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="surface rounded-2xl p-10 text-center text-muted-foreground">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No visitors found.
          </Card>
        )}
      </div>

      {/* Desktop: one row per visit, like a session log */}
      <Card className="surface rounded-2xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-muted-foreground w-12">#</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Visitor</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Pages</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Duration</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Device</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Browser / OS</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Created on</th>
                <th className="p-4 w-24" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const created = formatCreatedOn(s.firstTs);
                const DeviceIcon = deviceIcon(s.device);
                const isOpen = expanded === s.key;
                return (
                  <Fragment key={s.key}>
                    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-muted-foreground">
                        {filtered.length - i}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 min-w-0">
                          {flagEmoji(s.countryCode) && (
                            <span className="text-base leading-none">
                              {flagEmoji(s.countryCode)}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate">{s.name || ANONYMOUS}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {[s.city, s.country].filter(Boolean).join(", ") ||
                                "Unknown location"}
                              {s.ip ? ` · ${s.ip}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">{s.hits.length}</td>
                      <td className="p-4 text-center text-muted-foreground">
                        {formatDuration(s)}
                      </td>
                      <td className="p-4 text-center">
                        <DeviceIcon className="w-4 h-4 mx-auto text-muted-foreground" />
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {[s.browser, s.os].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-xs font-medium">{created.day}</p>
                        <p className="text-xs text-muted-foreground">{created.time}</p>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={isOpen ? "secondary" : "outline"}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => setExpanded(isOpen ? null : s.key)}
                        >
                          View
                          {isOpen ? (
                            <ChevronUp className="w-3 h-3 ml-1" />
                          ) : (
                            <ChevronDown className="w-3 h-3 ml-1" />
                          )}
                        </Button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b last:border-0 bg-muted/20">
                        <td colSpan={8} className="px-4 pb-4 pt-1">
                          <div className="grid gap-4 sm:grid-cols-2 text-xs">
                            <div>
                              <p className="font-medium mb-1.5">Pages viewed</p>
                              <ul className="space-y-1 text-muted-foreground">
                                {s.hits.map((h, j) => (
                                  <li key={j} className="flex justify-between gap-4 max-w-xs">
                                    <span className="truncate">{h.path || "/"}</span>
                                    <span className="shrink-0">{formatTime(h.timestamp)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-1 text-muted-foreground">
                              <p>
                                <span className="font-medium text-foreground">Location: </span>
                                {[s.city, s.region, s.country].filter(Boolean).join(", ") || "—"}
                              </p>
                              <p>
                                <span className="font-medium text-foreground">IP: </span>
                                {s.ip || "—"}
                              </p>
                              <p className="break-all">
                                <span className="font-medium text-foreground">User agent: </span>
                                {s.userAgent || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No visitors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
