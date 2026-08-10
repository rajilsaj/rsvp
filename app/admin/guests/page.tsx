"use client";

import { useEffect, useState } from "react";
import { Check, Mail, Minus, Phone, Plus, Search, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Guest } from "@/lib/google-sheets";

type Filter = "all" | "confirmed" | "declined" | "pending";

type NewGuest = {
  names: string;
  phone: string;
  email: string;
  attending: "" | "yes" | "no";
  plusOnes: number;
};

const emptyGuest: NewGuest = {
  names: "",
  phone: "",
  email: "",
  attending: "",
  plusOnes: 0,
};

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewGuest>(emptyGuest);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmGuest, setConfirmGuest] = useState<Guest | null>(null);

  function loadGuests() {
    return fetch("/api/guests")
      .then((r) => r.json())
      .then(setGuests);
  }

  useEffect(() => {
    loadGuests().finally(() => setLoading(false));
  }, []);

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.names.trim()) {
      setFormError("Name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          names: form.names.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          plusOnes: Number(form.plusOnes) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setFormError(data?.message ?? "Failed to add guest.");
        return;
      }

      await loadGuests();
      setForm(emptyGuest);
      setShowForm(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteGuest(g: Guest) {
    if (!window.confirm(`Remove ${g.names} from the guest list?`)) return;
    setBusyId(g.id);
    try {
      const res = await fetch("/api/guests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: g.id }),
      });
      if (res.ok) await loadGuests();
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetAttending(g: Guest, attending: "yes" | "no") {
    setConfirmGuest(null);
    setBusyId(g.id);
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: g.id, attending }),
      });
      if (res.ok) await loadGuests();
    } finally {
      setBusyId(null);
    }
  }

  async function handleAddPlusOne(g: Guest) {
    if (g.plusOnes >= 10) return;
    setBusyId(g.id);
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: g.id, plusOnes: (Number(g.plusOnes) || 0) + 1 }),
      });
      if (res.ok) await loadGuests();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemovePlusOne(g: Guest) {
    if (g.plusOnes <= 0) return;
    setBusyId(g.id);
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: g.id, plusOnes: g.plusOnes - 1 }),
      });
      if (res.ok) await loadGuests();
    } finally {
      setBusyId(null);
    }
  }

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.attending === "yes").length,
    declined: guests.filter((g) => g.attending === "no").length,
    finalGuests: guests
      .filter((g) => g.attending === "yes")
      .reduce((sum, g) => sum + 1 + (Number(g.plusOnes) || 0), 0),
  };

  const filtered = guests.filter((g) => {
    if (search.trim() && !g.names.toLowerCase().includes(search.trim().toLowerCase())) {
      return false;
    }
    if (filter === "confirmed") return g.attending === "yes";
    if (filter === "declined") return g.attending === "no";
    if (filter === "pending") return g.attending === "";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading guests…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl mb-1">Guests</h1>
          <p className="text-muted-foreground text-sm">All guest RSVPs and their status</p>
        </div>
        <Button
          className="rounded-full shrink-0 w-full sm:w-auto"
          onClick={() => {
            setShowForm((s) => !s);
            setFormError(null);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add guest
        </Button>
      </div>

      {showForm && (
        <Card className="surface rounded-2xl p-5">
          <form onSubmit={handleAddGuest} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name(s) *</label>
                <Input
                  value={form.names}
                  onChange={(e) => setForm({ ...form, names: e.target.value })}
                  placeholder="e.g. John & Jane Doe"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Attending</label>
                <select
                  value={form.attending}
                  onChange={(e) =>
                    setForm({ ...form, attending: e.target.value as NewGuest["attending"] })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Pending</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              {form.attending === "yes" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">+Ones</label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={form.plusOnes}
                    onChange={(e) =>
                      setForm({ ...form, plusOnes: Number(e.target.value) })
                    }
                  />
                </div>
              )}
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex gap-2">
              <Button type="submit" className="rounded-full" disabled={submitting}>
                {submitting ? "Adding…" : "Add guest"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyGuest);
                  setFormError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { label: "Total", value: stats.total },
            { label: "Confirmed", value: stats.confirmed },
            { label: "Declined", value: stats.declined },
            { label: "Final Number Guests + Ones", value: stats.finalGuests },
          ] as const
        ).map((s) => (
          <Card key={s.label} className="surface rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guests by name…"
          aria-label="Search guests by name"
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

      <div className="flex gap-2 flex-wrap">
        {(["all", "confirmed", "pending", "declined"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="rounded-full capitalize flex-1 sm:flex-none min-w-[calc(50%-0.25rem)] sm:min-w-0"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((g, i) => (
          <Card key={i} className="surface rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium break-words">{g.names}</p>
                {g.optOut && (
                  <Badge variant="destructive" className="text-xs mt-1 rounded-full">
                    Opted out
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  aria-label={`Change RSVP status for ${g.names}`}
                  title="Change RSVP status"
                  disabled={busyId === g.id}
                  onClick={() => setConfirmGuest(g)}
                  className="rounded-full transition-all hover:opacity-80 hover:ring-2 hover:ring-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {g.attending === "yes" ? (
                    <Badge className="rounded-full text-xs">Yes</Badge>
                  ) : g.attending === "no" ? (
                    <Badge variant="destructive" className="rounded-full text-xs">
                      No
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      Pending
                    </Badge>
                  )}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${g.names}`}
                  title="Remove guest"
                  disabled={busyId === g.id}
                  onClick={() => handleDeleteGuest(g)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-destructive/50 text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {(g.phone || g.email) && (
              <div className="mt-3 space-y-1 text-muted-foreground">
                {g.phone && (
                  <p className="flex items-center gap-1.5 text-xs break-all">
                    <Phone className="w-3 h-3 shrink-0" />
                    {g.phone}
                  </p>
                )}
                {g.email && (
                  <p className="flex items-center gap-1.5 text-xs break-all">
                    <Mail className="w-3 h-3 shrink-0" />
                    {g.email}
                  </p>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">+Ones:</span>
                {g.attending === "yes" ? (
                  g.plusOnes > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary" />
                      {g.plusOnes}
                      <button
                        type="button"
                        aria-label={`Remove one +1 from ${g.names}`}
                        title="Remove one +1"
                        disabled={busyId === g.id}
                        onClick={() => handleRemovePlusOne(g)}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Add one +1 for ${g.names}`}
                        title="Add one +1"
                        disabled={busyId === g.id || g.plusOnes >= 10}
                        onClick={() => handleAddPlusOne(g)}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      0
                      <button
                        type="button"
                        aria-label={`Add one +1 for ${g.names}`}
                        title="Add one +1"
                        disabled={busyId === g.id}
                        onClick={() => handleAddPlusOne(g)}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </span>
                  )
                ) : (
                  "—"
                )}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">Seating:</span>
                {g.table ? `${g.table} / ${g.seats}` : "—"}
              </span>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="surface rounded-2xl p-10 text-center text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No guests found.
          </Card>
        )}
      </div>

      {/* Desktop: table */}
      <Card className="surface rounded-2xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Attending</th>
                <th className="text-center p-4 font-medium text-muted-foreground">+Ones</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Seating</th>
                <th className="p-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium">{g.names}</p>
                    {g.optOut && (
                      <Badge variant="destructive" className="text-xs mt-1 rounded-full">
                        Opted out
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="space-y-0.5">
                      {g.phone && (
                        <p className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 shrink-0" />
                          {g.phone}
                        </p>
                      )}
                      {g.email && (
                        <p className="flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3 shrink-0" />
                          {g.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      aria-label={`Change RSVP status for ${g.names}`}
                      title="Change RSVP status"
                      disabled={busyId === g.id}
                      onClick={() => setConfirmGuest(g)}
                      className="rounded-full transition-all hover:opacity-80 hover:ring-2 hover:ring-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    >
                      {g.attending === "yes" ? (
                        <Badge className="rounded-full text-xs">Yes</Badge>
                      ) : g.attending === "no" ? (
                        <Badge variant="destructive" className="rounded-full text-xs">No</Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full text-xs">—</Badge>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {g.attending === "yes" ? (
                      g.plusOnes > 0 ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Check className="w-3 h-3 text-primary" />
                          {g.plusOnes}
                          <button
                            type="button"
                            aria-label={`Remove one +1 from ${g.names}`}
                            title="Remove one +1"
                            disabled={busyId === g.id}
                            onClick={() => handleRemovePlusOne(g)}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Add one +1 for ${g.names}`}
                            title="Add one +1"
                            disabled={busyId === g.id || g.plusOnes >= 10}
                            onClick={() => handleAddPlusOne(g)}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <X className="w-4 h-4 text-muted-foreground" />
                          <button
                            type="button"
                            aria-label={`Add one +1 for ${g.names}`}
                            title="Add one +1"
                            disabled={busyId === g.id}
                            onClick={() => handleAddPlusOne(g)}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    ) : "—"}
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {g.table ? `${g.table} / ${g.seats}` : "—"}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      aria-label={`Remove ${g.names}`}
                      title="Remove guest"
                      disabled={busyId === g.id}
                      onClick={() => handleDeleteGuest(g)}
                      className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border border-destructive/50 text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No guests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm modal — force a guest's RSVP status */}
      {confirmGuest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmGuest(null)}
          />
          <Card className="surface relative z-10 w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="space-y-1.5">
              <h2 id="rsvp-dialog-title" className="font-display text-xl">
                Change RSVP status
              </h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{confirmGuest.names}</span> is
                currently marked as{" "}
                <span className="font-medium text-foreground">
                  {confirmGuest.attending === "yes"
                    ? "attending"
                    : confirmGuest.attending === "no"
                      ? "not attending"
                      : "pending"}
                </span>
                .
              </p>
              {confirmGuest.attending === "yes" && confirmGuest.plusOnes > 0 && (
                <p className="text-xs text-destructive">
                  Marking them as not attending will also remove their{" "}
                  {confirmGuest.plusOnes} +One{confirmGuest.plusOnes > 1 ? "s" : ""}.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {confirmGuest.attending !== "yes" && (
                <Button
                  className="rounded-full w-full"
                  onClick={() => handleSetAttending(confirmGuest, "yes")}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark as attending
                </Button>
              )}
              {confirmGuest.attending !== "no" && (
                <Button
                  variant="destructive"
                  className="rounded-full w-full"
                  onClick={() => handleSetAttending(confirmGuest, "no")}
                >
                  <X className="w-4 h-4 mr-1" />
                  Mark as not attending
                </Button>
              )}
              <Button
                variant="outline"
                className="rounded-full w-full"
                onClick={() => setConfirmGuest(null)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Floating add button — stays reachable while scrolling on mobile */}
      {!showForm && (
        <Button
          className="sm:hidden fixed bottom-5 right-5 z-20 rounded-full h-14 w-14 p-0 shadow-lg"
          aria-label="Add guest"
          onClick={() => {
            setShowForm(true);
            setFormError(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
