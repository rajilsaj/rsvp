"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Guest } from "@/lib/google-sheets";

type Row = Guest & { editTable: string; editSeats: string; saving: boolean };

export default function SeatingPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seating")
      .then((r) => r.json())
      .then((data: Guest[]) =>
        setRows(
          data.map((g) => ({
            ...g,
            editTable: g.table,
            editSeats: g.seats,
            saving: false,
          }))
        )
      )
      .finally(() => setLoading(false));
  }, []);

  function update(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function handleSave(index: number) {
    const g = rows[index];
    update(index, { saving: true });
    try {
      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: g.row, table: g.editTable, seats: g.editSeats }),
      });
      if (!res.ok) throw new Error();
      update(index, { table: g.editTable, seats: g.editSeats, saving: false });
      toast({ title: "Saved", description: `${g.names}'s seating updated.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save. Try again.",
        variant: "destructive",
      });
      update(index, { saving: false });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading…
      </div>
    );
  }

  const assigned = rows.filter((r) => r.table).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl mb-1">Seating</h1>
        <p className="text-muted-foreground text-sm">
          Assign tables and seats to confirmed guests
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Confirmed", value: rows.length },
          { label: "Seated", value: assigned },
          { label: "Unassigned", value: rows.length - assigned },
        ].map((s) => (
          <Card key={s.label} className="surface rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="surface rounded-2xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-medium">Guest Assignments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Table can be any label (e.g. &quot;Table 1&quot;). Seats can be comma-separated
            numbers (e.g. &quot;3, 4, 5&quot;).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-muted-foreground">Guest</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Party</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Table</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Seats</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Save</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium">{g.names}</p>
                    {!g.table && (
                      <p className="text-xs text-muted-foreground">Not assigned</p>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="secondary" className="rounded-full">
                      {1 + g.plusOnes}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Input
                      value={g.editTable}
                      onChange={(e) => update(i, { editTable: e.target.value })}
                      placeholder="Table 1"
                      className="rounded-xl h-9 w-32"
                    />
                  </td>
                  <td className="p-4">
                    <Input
                      value={g.editSeats}
                      onChange={(e) => update(i, { editSeats: e.target.value })}
                      placeholder="1, 2, 3"
                      className="rounded-xl h-9 w-32"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => handleSave(i)}
                      disabled={g.saving}
                    >
                      {g.saving ? "…" : <Save className="w-4 h-4" />}
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">
                    No confirmed guests yet.
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
