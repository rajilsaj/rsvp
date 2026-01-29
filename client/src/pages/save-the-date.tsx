import { useMemo, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Heart,
  MapPin,
  PartyPopper,
  Sparkles,
  Users,
  Gift,
  Armchair,
} from "lucide-react";
import weddingBg from "@/assets/images/wedding-bg.png";
import venueVideo from "@/assets/videos/venue-bg.mp4";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type RSVPStatus = "yes" | "no" | "maybe";

type RSVP = {
  id: string;
  name: string;
  phoneOrEmail: string;
  guests: number;
  status: RSVPStatus;
  notes?: string;
};

type Seat = {
  id: string;
  table: string;
  seat: string;
  reservedFor?: string;
};

type WishlistItem = {
  id: string;
  title: string;
  note?: string;
  priority: "Must have" | "Nice to have";
  claimedBy?: string;
};

type TimelineItem = {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
};

const wedding = {
  couple: {
    bride: "Grace",
    groom: "Noelvie",
  },
  dateLabel: "Saturday • 20 June 2026",
  timeLabel: "4:00 PM",
  cityLabel: "City, Country",
  venue: {
    name: "Venue Name",
    address: "Street address, City",
    mapUrl: "https://maps.google.com/?q=wedding%20venue",
  },
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatSeat(seat: Seat) {
  return `${seat.table} • Seat ${seat.seat}`;
}

export default function SaveTheDate() {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);

  const [inviteeName, setInviteeName] = useState<string>("");
  const [inviteeCount, setInviteeCount] = useState<number>(1);
  const [inviteeContact, setInviteeContact] = useState<string>("");
  const [inviteeNotes, setInviteeNotes] = useState<string>("");
  const [inviteeStatus, setInviteeStatus] = useState<RSVPStatus>("yes");

  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  const seats = useMemo<Seat[]>(
    () =>
      [
        { id: "t1s1", table: "Table 1", seat: "1", reservedFor: "" },
        { id: "t1s2", table: "Table 1", seat: "2", reservedFor: "" },
        { id: "t1s3", table: "Table 1", seat: "3", reservedFor: "" },
        { id: "t1s4", table: "Table 1", seat: "4", reservedFor: "" },
        { id: "t2s1", table: "Table 2", seat: "1", reservedFor: "" },
        { id: "t2s2", table: "Table 2", seat: "2", reservedFor: "" },
        { id: "t2s3", table: "Table 2", seat: "3", reservedFor: "" },
        { id: "t2s4", table: "Table 2", seat: "4", reservedFor: "" },
        { id: "t3s1", table: "Table 3", seat: "1", reservedFor: "" },
        { id: "t3s2", table: "Table 3", seat: "2", reservedFor: "" },
        { id: "t3s3", table: "Table 3", seat: "3", reservedFor: "" },
        { id: "t3s4", table: "Table 3", seat: "4", reservedFor: "" },
      ].map((s) => ({ ...s })),
    [],
  );

  const [seatAssignments, setSeatAssignments] = useState<Record<string, string>>(
    {},
  );

  const wishlist = useMemo<WishlistItem[]>(
    () =>
      [
        {
          id: "honeymoon",
          title: "Honeymoon fund contribution",
          note: "Any amount helps — thank you!",
          priority: "Must have",
        },
        {
          id: "cookware",
          title: "Non‑stick cookware set",
          note: "Neutral colors preferred",
          priority: "Nice to have",
        },
        {
          id: "dinnerware",
          title: "Dinnerware set (12 pieces)",
          note: "Simple + timeless",
          priority: "Nice to have",
        },
        {
          id: "bedding",
          title: "Linen bedding set",
          note: "Queen size",
          priority: "Nice to have",
        },
      ],
    [],
  );

  const [claimed, setClaimed] = useState<Record<string, string>>({});

  const timeline = useMemo<TimelineItem[]>(
    () =>
      [
        {
          id: "meet",
          dateLabel: "2019",
          title: "They met",
          description: "A simple hello that turned into something bigger.",
        },
        {
          id: "first-trip",
          dateLabel: "2021",
          title: "First trip together",
          description: "The moment they realized they were a real team.",
        },
        {
          id: "proposal",
          dateLabel: "2025",
          title: "The proposal",
          description: "A happy yes — and the rest is history.",
        },
        {
          id: "wedding",
          dateLabel: "2026",
          title: "Wedding day",
          description: "Celebrate love, family, and new beginnings.",
        },
      ],
    [],
  );

  const assignedSeatForName = useMemo(() => {
    const key = slugify(inviteeName);
    if (!key) return undefined;
    const seatId = seatAssignments[key];
    if (!seatId) return undefined;
    return seats.find((s) => s.id === seatId);
  }, [inviteeName, seatAssignments, seats]);

  const availableSeatIds = useMemo(() => {
    const taken = new Set(Object.values(seatAssignments));
    return seats.filter((s) => !taken.has(s.id)).map((s) => s.id);
  }, [seatAssignments, seats]);

  function handleCopyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => {
        toast({
          title: "Link copied",
          description: "Share it with your guests to RSVP.",
        });
      },
      () => {
        toast({
          title: "Couldn’t copy",
          description: "Please copy the URL from the address bar.",
          variant: "destructive",
        });
      },
    );
  }

  function submitRSVP() {
    const name = inviteeName.trim();
    if (!name) {
      toast({
        title: "Add a name",
        description: "We need a name to save the RSVP.",
        variant: "destructive",
      });
      return;
    }

    const id = `${Date.now()}`;
    const newRSVP: RSVP = {
      id,
      name,
      phoneOrEmail: inviteeContact.trim(),
      guests: Math.max(1, Math.min(10, inviteeCount || 1)),
      status: inviteeStatus,
      notes: inviteeNotes.trim() ? inviteeNotes.trim() : undefined,
    };

    setRsvps((prev) => [newRSVP, ...prev]);

    const key = slugify(name);
    if (key && !seatAssignments[key] && availableSeatIds.length > 0) {
      const seatId = availableSeatIds[0];
      setSeatAssignments((prev) => ({ ...prev, [key]: seatId }));
    }

    toast({
      title: "RSVP received",
      description: "Thank you — we can’t wait to celebrate with you.",
    });

    setInviteeNotes("");
  }

  function claimItem(itemId: string) {
    const name = inviteeName.trim();
    if (!name) {
      toast({
        title: "Add your name",
        description: "Type your name in RSVP first, then claim an item.",
        variant: "destructive",
      });
      return;
    }
    setClaimed((prev) => {
      if (prev[itemId]) return prev;
      return { ...prev, [itemId]: name };
    });

    toast({
      title: "Saved",
      description: "Thanks — this item is now marked as claimed.",
    });
  }

  function unclaimItem(itemId: string) {
    setClaimed((prev) => {
      if (!prev[itemId]) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Parallax Background */}
      <motion.div 
        style={{ y: bgY }}
        className="fixed inset-0 z-0 h-[120vh] w-full"
      >
        <video
          src={venueVideo}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="mx-auto max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>SAVE THE DATE</span>
            </div>
            <h1 className="font-display text-6xl font-bold leading-[1.1] tracking-tight sm:text-8xl">
              {wedding.couple.bride} <br /> 
              <span className="text-primary">&</span> {wedding.couple.groom}
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground sm:text-xl">
              A celebration of a beautiful journey. Join us as we start our forever.
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full">
                <CalendarDays className="mr-2 h-4 w-4" />
                {wedding.dateLabel}
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full">
                <MapPin className="mr-2 h-4 w-4" />
                {wedding.cityLabel}
              </Badge>
            </div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-20 text-muted-foreground"
            >
              <p className="text-sm uppercase tracking-widest">Scroll to explore</p>
              <div className="mx-auto mt-2 h-12 w-[1px] bg-gradient-to-b from-muted-foreground to-transparent" />
            </motion.div>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">Our Story</h2>
            <div className="mx-auto mt-4 h-1 w-12 bg-primary rounded-full" />
          </div>
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex gap-8 items-center ${index % 2 === 1 ? 'flex-row-reverse text-right' : ''}`}
              >
                <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl surface text-primary">
                  <Heart className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-sm font-bold tracking-widest text-primary uppercase">{item.dateLabel}</span>
                  <h3 className="mt-1 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Venue Section */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl mb-6">The Venue</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                We've chosen a place that feels like home. Join us at the {wedding.venue.name} for an unforgettable evening.
              </p>
              
              <Card className="surface rounded-3xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{wedding.venue.name}</h4>
                      <p className="mt-2 text-muted-foreground">{wedding.venue.address}</p>
                      <Button variant="outline" className="mt-6 rounded-full" asChild>
                        <a href={wedding.venue.mapUrl} target="_blank" rel="noreferrer">
                          Get Directions <span className="ml-2">→</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <Card className="surface rounded-3xl p-8 w-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-3xl tracking-tight">RSVP</h2>
                  <Badge className="rounded-full">{rsvps.length} Attending</Badge>
                </div>
                
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Name</label>
                      <Input 
                        value={inviteeName}
                        onChange={(e) => setInviteeName(e.target.value)}
                        placeholder="Full Name" 
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact</label>
                      <Input 
                        value={inviteeContact}
                        onChange={(e) => setInviteeContact(e.target.value)}
                        placeholder="Email or Phone" 
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Will you attend?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['yes', 'maybe', 'no'].map((s) => (
                        <Button
                          key={s}
                          variant={inviteeStatus === s ? "default" : "secondary"}
                          onClick={() => setInviteeStatus(s as RSVPStatus)}
                          className="rounded-xl capitalize"
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full rounded-xl py-6 text-lg" onClick={submitRSVP}>
                    Celebrate with us
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Seating & Wishlist Section */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl tracking-tight mb-6">Seating Allocation</h2>
              <Card className="surface rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Armchair className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Your Table</h4>
                    <p className="text-sm text-muted-foreground">
                      {assignedSeatForName ? formatSeat(assignedSeatForName) : "RSVP to see your assigned seat"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {seats.map((seat) => {
                    const takenBy = Object.entries(seatAssignments).find(([_, id]) => id === seat.id)?.[0];
                    const isUserSeat = inviteeName && slugify(inviteeName) === Object.entries(seatAssignments).find(([k, v]) => v === seat.id)?.[0];
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => {
                          const key = slugify(inviteeName);
                          if (!key) return toast({ title: "Name required", variant: "destructive" });
                          setSeatAssignments(prev => ({ ...prev, [key]: seat.id }));
                        }}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                          isUserSeat ? 'bg-primary text-primary-foreground scale-105 shadow-lg' : 
                          takenBy ? 'bg-muted/50 opacity-40 cursor-not-allowed' : 'surface hover:bg-accent/10'
                        }`}
                      >
                        <Armchair className="h-4 w-4 mb-1" />
                        <span className="text-[10px] font-bold">T{seat.table.split(' ')[1]}S{seat.seat}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div>
              <h2 className="font-display text-3xl tracking-tight mb-6">Wishlist</h2>
              <div className="grid gap-4">
                {wishlist.map((item) => {
                  const isClaimed = claimed[item.id];
                  return (
                    <Card key={item.id} className="surface rounded-2xl p-5 group">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="secondary" className="mb-2 text-[10px] rounded-full uppercase tracking-widest">{item.priority}</Badge>
                          <h4 className="font-bold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.note}</p>
                          {isClaimed && <p className="text-[10px] text-primary font-bold mt-2 uppercase">Claimed by {isClaimed}</p>}
                        </div>
                        <Button 
                          variant={isClaimed ? "ghost" : "outline"}
                          size="sm"
                          className="rounded-full"
                          onClick={() => isClaimed ? unclaimItem(item.id) : claimItem(item.id)}
                        >
                          {isClaimed ? "Unclaim" : "Claim"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-border/50 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <p className="font-display text-2xl mb-8">See you there!</p>
          <Button variant="ghost" onClick={handleCopyLink} className="rounded-full text-muted-foreground">
            <Copy className="mr-2 h-4 w-4" />
            Share Invitation Link
          </Button>
        </footer>
      </div>
    </div>
  );
}

