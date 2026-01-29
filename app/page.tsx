"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  CalendarDays,
  Copy,
  Heart,
  MapPin,
  Sparkles,
  Gift,
  Armchair,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type RSVPStatus = "yes" | "no" | "maybe";

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

type WishlistClaim = {
  id: number;
  itemId: string;
  claimerName: string;
  createdAt: string | null;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  description: string;
};

const incomingEvents: EventItem[] = [
  {
    id: "parents",
    title: "Meeting with Parents",
    date: "May 15, 2026",
    description: "Traditional introduction and family gathering.",
  },
  {
    id: "dinner",
    title: "Pre-Wedding Dinner",
    date: "June 18, 2026",
    description: "An intimate dinner with our closest friends and family.",
  },
  {
    id: "rehearsal",
    title: "Wedding Rehearsal",
    date: "June 19, 2026",
    description: "Final run-through at the venue.",
  },
];

type Seat = {
  id: string;
  table: string;
  seat: string;
};

type WishlistItem = {
  id: string;
  title: string;
  note?: string;
  priority: "Must have" | "Nice to have";
};

type TimelineItem = {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
  image: string;
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

const wishlistItems: WishlistItem[] = [
  {
    id: "honeymoon",
    title: "Honeymoon fund contribution",
    note: "Any amount helps — thank you!",
    priority: "Must have",
  },
  {
    id: "cookware",
    title: "Non-stick cookware set",
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
];

const timelineItems: TimelineItem[] = [
  {
    id: "meet",
    dateLabel: "2015",
    title: "A friendship begins",
    description: "Their journey began as a simple friendship — but it was truly the answer to a whispered prayer from both Grace and Noelvie.",
    image: "/images/story-1.jpg",
  },
  {
    id: "first-date",
    dateLabel: "First Date",
    title: "The Chinese buffet",
    description: "At a Chinese Buffet restaurant, Grace gently used his own hands to wipe Noelvie's nose — a tender act that showed his true heart: caring, selfless, and real.",
    image: "/images/story-2.jpg",
  },
  {
    id: "proposal",
    dateLabel: "2017",
    title: "The engagement",
    description: "After two beautiful years of growing together, Grace asked Noelvie to be his fiancee at a traditional engagement filled with family and friends.",
    image: "/images/story-3.jpg",
  },
  {
    id: "wedding",
    dateLabel: "2026",
    title: "Wedding day",
    description: "Now, after years of knowing, growing, laughing, praying, and loving deeply — they are ready to celebrate with family and friends.",
    image: "/images/story-4.jpg",
  },
];

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
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);

  const [inviteeName, setInviteeName] = useState("");
  const [inviteePhone, setInviteePhone] = useState("");
  const [inviteeStatus, setInviteeStatus] = useState<RSVPStatus>("yes");
  const [myRsvp, setMyRsvp] = useState<Rsvp | null>(null);

  useEffect(() => {
    const savedPhone = localStorage.getItem("wedding_rsvp_phone");
    if (savedPhone) {
      setInviteePhone(savedPhone);
      fetch(`/api/rsvps/lookup?phone=${encodeURIComponent(savedPhone)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((rsvp) => {
          if (rsvp) {
            setMyRsvp(rsvp);
            setInviteeName(rsvp.name);
          }
        })
        .catch(() => {});
    }
  }, []);

  const { data: rsvps = [] } = useQuery<Rsvp[]>({
    queryKey: ["/api/rsvps"],
    queryFn: async () => {
      const res = await fetch("/api/rsvps");
      if (!res.ok) throw new Error("Failed to fetch RSVPs");
      return res.json();
    },
  });

  const { data: claims = [] } = useQuery<WishlistClaim[]>({
    queryKey: ["/api/wishlist-claims"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist-claims");
      if (!res.ok) throw new Error("Failed to fetch claims");
      return res.json();
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (newRsvp: {
      name: string;
      phone: string;
      guests: number;
      status: string;
      notes?: string;
      seatId?: string;
    }) => {
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRsvp),
      });
      if (!res.ok) throw new Error("Failed to submit RSVP");
      return res.json();
    },
    onSuccess: (data: Rsvp) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rsvps"] });
      localStorage.setItem("wedding_rsvp_phone", data.phone);
      setMyRsvp(data);
      toast({
        title: "RSVP received",
        description: data.seatId
          ? `You've been assigned to ${seats.find(s => s.id === data.seatId)?.table || "a table"}!`
          : "Thank you — we can't wait to celebrate with you.",
      });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (claim: { itemId: string; claimerName: string }) => {
      const res = await fetch("/api/wishlist-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claim),
      });
      if (!res.ok) throw new Error("Failed to claim item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist-claims"] });
      toast({
        title: "Saved",
        description: "Thanks — this item is now marked as claimed.",
      });
    },
  });

  const unclaimMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/wishlist-claims/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unclaim item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist-claims"] });
    },
  });

  const seatAssignments = useMemo(() => {
    const assignments: Record<string, string> = {};
    rsvps.forEach((r) => {
      if (r.seatId) {
        assignments[slugify(r.name)] = r.seatId;
      }
    });
    return assignments;
  }, [rsvps]);

  const claimedItems = useMemo(() => {
    const c: Record<string, string> = {};
    claims.forEach((cl) => {
      c[cl.itemId] = cl.claimerName;
    });
    return c;
  }, [claims]);

  const assignedSeatForName = useMemo(() => {
    if (myRsvp?.seatId) {
      return seats.find((s) => s.id === myRsvp.seatId);
    }
    const key = slugify(inviteeName);
    if (!key) return undefined;
    const seatId = seatAssignments[key];
    if (!seatId) return undefined;
    return seats.find((s) => s.id === seatId);
  }, [inviteeName, seatAssignments, myRsvp]);

  const availableSeatIds = useMemo(() => {
    const taken = new Set(Object.values(seatAssignments));
    return seats.filter((s) => !taken.has(s.id)).map((s) => s.id);
  }, [seatAssignments]);

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
          title: "Couldn't copy",
          description: "Please copy the URL from the address bar.",
          variant: "destructive",
        });
      }
    );
  }

  function handleSaveToCalendar() {
    const title = `Wedding: ${wedding.couple.bride} & ${wedding.couple.groom}`;
    const details = `Join us for the wedding celebration of ${wedding.couple.bride} and ${wedding.couple.groom} at ${wedding.venue.name}.`;
    const location = wedding.venue.address;

    const startTime = "20260620T160000";
    const endTime = "20260620T230000";

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

    window.open(googleCalendarUrl, "_blank");

    toast({
      title: "Opening Calendar",
      description: "Redirecting to Google Calendar to save the date.",
    });
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

    const key = slugify(name);
    let seatId: string | undefined;
    if (key && !seatAssignments[key] && availableSeatIds.length > 0) {
      seatId = availableSeatIds[0];
    }

    rsvpMutation.mutate({
      name,
      phone: inviteePhone.trim(),
      guests: 1,
      status: inviteeStatus,
      seatId,
    });
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
    claimMutation.mutate({ itemId, claimerName: name });
  }

  function unclaimItem(itemId: string) {
    unclaimMutation.mutate(itemId);
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden bg-background"
    >
      <motion.div
        style={{ y: bgY }}
        className="fixed inset-0 z-0 h-[120vh] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="animate-pulse text-white/50">Loading...</div>
        </div>
        <iframe
          src="https://www.youtube.com/embed/gSOCywBff2Q?autoplay=1&mute=1&loop=1&playlist=gSOCywBff2Q&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&vq=hd1080"
          title="Background Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-[400%] min-w-full min-h-full pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      <div className="relative z-10">
        <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="mx-auto max-w-4xl"
          >
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                <span>SAVE THE DATE</span>
              </div>
              <Button
                onClick={handleSaveToCalendar}
                className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
              >
                <CalendarDays className="mr-2 h-5 w-5" />
                Save to Calendar
              </Button>
            </div>
            <h1 className="font-display text-6xl font-bold leading-[1.1] tracking-tight sm:text-8xl text-white drop-shadow-lg">
              {wedding.couple.bride} <br />
              <span className="text-primary">&</span> {wedding.couple.groom}
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg text-white/90 sm:text-xl drop-shadow-md">
              A celebration of a beautiful journey. Join us as we start our
              forever.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm rounded-full"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {wedding.dateLabel}
              </Badge>
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm rounded-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                {wedding.cityLabel}
              </Badge>
            </div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-20 text-muted-foreground"
            >
              <p className="text-sm uppercase tracking-widest">
                Scroll to explore
              </p>
              <div className="mx-auto mt-2 h-12 w-[1px] bg-gradient-to-b from-muted-foreground to-transparent" />
            </motion.div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              Our Story
            </h2>
            <div className="mx-auto mt-4 h-1 w-12 bg-primary rounded-full" />
          </div>

          <div className="space-y-16">
            {timelineItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col ${index % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"} gap-8 items-center`}
              >
                <div className="w-full sm:w-1/2 overflow-hidden rounded-3xl group cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-110 rounded-3xl"
                  />
                </div>
                <div className={`w-full sm:w-1/2 ${index % 2 === 1 ? "sm:text-right" : ""}`}>
                  <span className="text-sm font-bold tracking-widest text-primary uppercase">
                    {item.dateLabel}
                  </span>
                  <h3 className="mt-2 text-3xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              Upcoming Celebrations
            </h2>
            <p className="mt-4 text-muted-foreground italic">
              Important dates leading up to the big day
            </p>
          </div>

          <div className="grid gap-6">
            {incomingEvents.map((event) => (
              <Card
                key={event.id}
                className="surface rounded-2xl p-6 border-l-4 border-l-primary"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <p className="mt-1 text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="w-fit px-4 py-1.5 rounded-full text-sm"
                  >
                    {event.date}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl mb-6">
                The Venue
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                We've chosen a place that feels like home. Join us at the{" "}
                {wedding.venue.name} for an unforgettable evening.
              </p>

              <Card className="surface rounded-3xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">
                        {wedding.venue.name}
                      </h4>
                      <p className="mt-2 text-muted-foreground">
                        {wedding.venue.address}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-6 rounded-full"
                        asChild
                      >
                        <a
                          href={wedding.venue.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
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
                  <Badge className="rounded-full">
                    {rsvps.filter((r) => r.status === "yes").length} Attending
                  </Badge>
                </div>

                {myRsvp ? (
                  <div className="space-y-6 text-center">
                    <div className="rounded-2xl bg-primary/10 p-6">
                      <Heart className="h-10 w-10 mx-auto text-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">You're all set, {myRsvp.name}!</h3>
                      <p className="text-muted-foreground">
                        {myRsvp.status === "yes" 
                          ? "We're excited to celebrate with you!" 
                          : myRsvp.status === "maybe" 
                            ? "We hope you can make it!" 
                            : "We'll miss you at the celebration."}
                      </p>
                      {myRsvp.seatId && assignedSeatForName && (
                        <div className="mt-4 p-4 bg-background rounded-xl">
                          <p className="text-sm text-muted-foreground">Your seat assignment</p>
                          <p className="text-lg font-bold text-primary">{formatSeat(assignedSeatForName)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Name</label>
                      <Input
                        value={inviteeName}
                        onChange={(e) => setInviteeName(e.target.value)}
                        placeholder="Full name"
                        className="rounded-xl"
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input
                        value={inviteePhone}
                        onChange={(e) => setInviteePhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="rounded-xl"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium block">
                      Will you attend?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(["yes", "maybe", "no"] as RSVPStatus[]).map((status) => (
                        <Button
                          key={status}
                          variant={
                            inviteeStatus === status ? "default" : "outline"
                          }
                          className="rounded-full capitalize"
                          onClick={() => setInviteeStatus(status)}
                          data-testid={`button-rsvp-${status}`}
                        >
                          {status === "yes"
                            ? "Yes, I'll be there"
                            : status === "maybe"
                              ? "Maybe"
                              : "Regretfully, no"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-xl py-6 text-lg font-bold"
                    onClick={submitRSVP}
                    disabled={rsvpMutation.isPending}
                    data-testid="button-submit-rsvp"
                  >
                    {rsvpMutation.isPending ? "Saving..." : "Confirm RSVP"}
                  </Button>
                </div>
                )}
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Gift className="h-6 w-6" />
            </div>
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              Gift Registry
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Your presence is the greatest gift, but if you wish to bless us
              further, here are some ideas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {wishlistItems.map((item) => {
              const claimer = claimedItems[item.id];
              return (
                <Card
                  key={item.id}
                  className={`surface rounded-2xl p-6 transition-all ${claimer ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{item.title}</h4>
                        <Badge
                          variant={
                            item.priority === "Must have"
                              ? "default"
                              : "secondary"
                          }
                          className="rounded-full text-xs"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      {item.note && (
                        <p className="text-sm text-muted-foreground">
                          {item.note}
                        </p>
                      )}
                      {claimer && (
                        <p className="mt-2 text-sm text-primary font-medium">
                          Claimed by {claimer}
                        </p>
                      )}
                    </div>
                    <div>
                      {claimer ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => unclaimItem(item.id)}
                          data-testid={`button-unclaim-${item.id}`}
                        >
                          Unclaim
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => claimItem(item.id)}
                          data-testid={`button-claim-${item.id}`}
                        >
                          I'll get this
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <QrCode className="h-6 w-6" />
            </div>
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              Find Your Seat
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Scan this QR code on wedding day to find your table assignment.
            </p>
          </div>

          <Card className="surface rounded-3xl p-8 text-center max-w-sm mx-auto">
            <div className="bg-white p-6 rounded-2xl inline-block">
              <QRCodeSVG
                value={typeof window !== 'undefined' ? `${window.location.origin}/find-seat` : '/find-seat'}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Point your camera at this code to open the seat finder
            </p>
          </Card>
        </section>

        <footer className="border-t py-12 mt-12">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <p className="font-display text-2xl">
              {wedding.couple.bride} & {wedding.couple.groom}
            </p>
            <p className="mt-2 text-muted-foreground">{wedding.dateLabel}</p>

            <div className="mt-8 flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleCopyLink}
                data-testid="button-copy-link"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Invite Link
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
