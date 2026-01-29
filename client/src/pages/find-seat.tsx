import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Armchair, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type Rsvp = {
  id: number;
  name: string;
  phone: string;
  guests: number;
  status: string;
  notes: string | null;
  seatId: string | null;
  createdAt: string | null;
};

type Seat = {
  id: string;
  table: string;
  seat: string;
};

const seats: Seat[] = [
  { id: "t1s1", table: "Table 1", seat: "1" },
  { id: "t1s2", table: "Table 1", seat: "2" },
  { id: "t1s3", table: "Table 1", seat: "3" },
  { id: "t1s4", table: "Table 1", seat: "4" },
  { id: "t2s1", table: "Table 2", seat: "1" },
  { id: "t2s2", table: "Table 2", seat: "2" },
  { id: "t2s3", table: "Table 2", seat: "3" },
  { id: "t2s4", table: "Table 2", seat: "4" },
  { id: "t3s1", table: "Table 3", seat: "1" },
  { id: "t3s2", table: "Table 3", seat: "2" },
  { id: "t3s3", table: "Table 3", seat: "3" },
  { id: "t3s4", table: "Table 3", seat: "4" },
];

function formatSeat(seat: Seat) {
  return `${seat.table} • Seat ${seat.seat}`;
}

export default function FindSeat() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundRsvp, setFoundRsvp] = useState<Rsvp | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch() {
    const query = searchQuery.trim();
    if (!query) {
      toast({
        title: "Enter your name or phone",
        description: "Please enter your name or phone number to find your seat.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setFoundRsvp(null);

    try {
      const res = await fetch(`/api/rsvps/lookup?phone=${encodeURIComponent(query)}`);
      if (res.ok) {
        const rsvp = await res.json();
        setFoundRsvp(rsvp);
      } else {
        const allRsvps = await fetch("/api/rsvps").then(r => r.json());
        const match = allRsvps.find((r: Rsvp) => 
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.phone.includes(query)
        );
        if (match) {
          setFoundRsvp(match);
        } else {
          setNotFound(true);
        }
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  }

  const assignedSeat = foundRsvp?.seatId 
    ? seats.find(s => s.id === foundRsvp.seatId) 
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/">
          <Button variant="ghost" className="mb-6 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invitation
          </Button>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h1 className="font-display text-4xl tracking-tight mb-2">Find Your Seat</h1>
          <p className="text-muted-foreground">
            Enter your name or phone number to see your table assignment
          </p>
        </div>

        <Card className="surface rounded-3xl p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Your name or phone number"
                className="rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                className="rounded-xl px-6"
                disabled={isSearching}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {isSearching && (
              <div className="text-center py-8 text-muted-foreground">
                Searching...
              </div>
            )}

            {foundRsvp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6"
              >
                <div className="rounded-2xl bg-primary/10 p-6 text-center">
                  <Heart className="h-10 w-10 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Welcome, {foundRsvp.name}!</h3>
                  
                  {assignedSeat ? (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Your seat assignment</p>
                      <div className="inline-flex items-center gap-3 bg-background rounded-xl px-6 py-4">
                        <Armchair className="h-8 w-8 text-primary" />
                        <div className="text-left">
                          <p className="text-2xl font-bold text-primary">{assignedSeat.table}</p>
                          <p className="text-muted-foreground">Seat {assignedSeat.seat}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Badge variant="secondary" className="rounded-full">
                        Seat will be assigned soon
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {notFound && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-muted-foreground"
              >
                <p className="mb-2">We couldn't find your RSVP.</p>
                <p className="text-sm">Please make sure you've submitted your RSVP or try a different name/phone number.</p>
                <Link href="/">
                  <Button variant="outline" className="mt-4 rounded-full">
                    Submit RSVP
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Grace & Noelvie's Wedding • June 20, 2026
        </p>
      </motion.div>
    </div>
  );
}
