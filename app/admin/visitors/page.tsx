"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe, Laptop, Smartphone, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Visitor } from "@/lib/google-sheets";

const ALL = "all";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function formatDate(timestamp: string): string {
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? timestamp : d.toLocaleString();
}

function deviceBadgeVariant(device: string): "default" | "secondary" | "destructive" {
  if (device === "Mobile") return "default";
  if (device === "Bot") return "destructive";
  return "secondary";
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const countries = useMemo(() => unique(visitors.map((v) => v.country)), [visitors]);
  const devices = useMemo(() => unique(visitors.map((v) => v.device)), [visitors]);
  const regions = useMemo(
    () =>
      unique(
        visitors
          .filter((v) => country === ALL || v.country === country)
          .map((v) => v.region)
      ),
    [visitors, country]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visitors
      .filter((v) => country === ALL || v.country === country)
      .filter((v) => region === ALL || v.region === region)
      .filter((v) => device === ALL || v.device === device)
      .filter(
        (v) =>
          !q ||
          v.ip.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.country.toLowerCase().includes(q) ||
          v.region.toLowerCase().includes(q)
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [visitors, country, region, device, search]);

  const stats = {
    total: visitors.length,
    countries: unique(visitors.map((v) => v.country)).length,
    mobile: visitors.filter((v) => v.device === "Mobile" || v.device === "Tablet").length,
    desktop: visitors.filter((v) => v.device === "Desktop").length,
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
          Who visited the site — by country, region, IP and device
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
              placeholder="IP, city, country…"
            />
          </div>
        </div>
        {hasActiveFilter && (
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} of {visitors.length} visits
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
        {filtered.map((v) => (
          <Card key={v.id} className="surface rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium break-all">{v.ip || "Unknown IP"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(v.timestamp)}
                </p>
              </div>
              <Badge variant={deviceBadgeVariant(v.device)} className="rounded-full text-xs shrink-0">
                {v.device || "—"}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">Location: </span>
                {[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}
              </span>
              <span>
                <span className="font-medium text-foreground">Browser: </span>
                {[v.browser, v.os].filter(Boolean).join(" · ") || "—"}
              </span>
              {v.path && (
                <span>
                  <span className="font-medium text-foreground">Page: </span>
                  {v.path}
                </span>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="surface rounded-2xl p-10 text-center text-muted-foreground">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No visitors found.
          </Card>
        )}
      </div>

      {/* Desktop: table */}
      <Card className="surface rounded-2xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">IP Address</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Country</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Region / City</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Device</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Browser / OS</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Page</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(v.timestamp)}
                  </td>
                  <td className="p-4 font-medium">{v.ip || "—"}</td>
                  <td className="p-4">{v.country || "—"}</td>
                  <td className="p-4 text-muted-foreground">
                    {[v.region, v.city].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={deviceBadgeVariant(v.device)} className="rounded-full text-xs">
                      {v.device || "—"}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {[v.browser, v.os].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">{v.path || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted-foreground">
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
