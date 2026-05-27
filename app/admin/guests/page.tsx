"use client";

import { useEffect, useState } from "react";
import { Check, Mail, Phone, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Guest } from "@/lib/google-sheets";

type Filter = "all" | "confirmed" | "declined" | "pending";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/guests")
      .then((r) => r.json())
      .then(setGuests)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.attending === "yes").length,
    declined: guests.filter((g) => g.attending === "no").length,
    pending: guests.filter((g) => g.attending === "").length,
  };

  const filtered = guests.filter((g) => {
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
      <div>
        <h1 className="font-display text-3xl mb-1">Guests</h1>
        <p className="text-muted-foreground text-sm">All guest RSVPs and their status</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { label: "Total", value: stats.total },
            { label: "Confirmed", value: stats.confirmed },
            { label: "Declined", value: stats.declined },
            { label: "Pending", value: stats.pending },
          ] as const
        ).map((s) => (
          <Card key={s.label} className="surface rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "confirmed", "pending", "declined"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="rounded-full capitalize"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <Card className="surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Attending</th>
                <th className="text-center p-4 font-medium text-muted-foreground">+Ones</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Seating</th>
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
                    {g.attending === "yes" ? (
                      <Badge className="rounded-full text-xs">Yes</Badge>
                    ) : g.attending === "no" ? (
                      <Badge variant="destructive" className="rounded-full text-xs">No</Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full text-xs">—</Badge>
                    )}
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {g.attending === "yes" ? (
                      g.plusOnes > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <Check className="w-3 h-3 text-primary" />
                          {g.plusOnes}
                        </span>
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground mx-auto" />
                      )
                    ) : "—"}
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {g.table ? `${g.table} / ${g.seats}` : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No guests found.
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
