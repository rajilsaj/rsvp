import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    bride: "Your Sister",
    groom: "Partner",
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
    <div className="min-h-dvh bg-background text-foreground">
      <div
        className="grain relative overflow-hidden"
        data-testid="section-hero"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/.35),transparent_70%)] blur-2xl" />
          <div className="absolute -bottom-56 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--accent)/.30),transparent_70%)] blur-2xl" />
          <div className="absolute -bottom-48 -right-44 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/.75),transparent_70%)] blur-2xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span data-testid="text-save-the-date">Save the date</span>
            </div>

            <Button
              variant="secondary"
              className="gap-2"
              onClick={handleCopyLink}
              data-testid="button-copy-link"
            >
              <Copy className="h-4 w-4" />
              Copy invite link
            </Button>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl"
                data-testid="text-title"
              >
                {wedding.couple.bride} & {wedding.couple.groom}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
                data-testid="text-subtitle"
              >
                You’re warmly invited to celebrate love, laughter, and a forever kind of
                day.
              </motion.p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="gap-2 rounded-full"
                  data-testid="badge-date"
                >
                  <CalendarDays className="h-4 w-4" />
                  {wedding.dateLabel}
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-2 rounded-full"
                  data-testid="badge-time"
                >
                  <PartyPopper className="h-4 w-4" />
                  {wedding.timeLabel}
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-2 rounded-full"
                  data-testid="badge-city"
                >
                  <MapPin className="h-4 w-4" />
                  {wedding.cityLabel}
                </Badge>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Card className="surface rounded-2xl p-4" data-testid="card-venue">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-[hsl(var(--primary)/.10)] p-2 text-[hsl(var(--primary))]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div
                        className="text-sm font-semibold"
                        data-testid="text-venue-name"
                      >
                        {wedding.venue.name}
                      </div>
                      <div
                        className="mt-1 text-sm text-muted-foreground"
                        data-testid="text-venue-address"
                      >
                        {wedding.venue.address}
                      </div>
                      <a
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--accent))] hover:underline"
                        href={wedding.venue.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="link-open-map"
                      >
                        Open map
                        <span aria-hidden>→</span>
                      </a>
                    </div>
                  </div>
                </Card>

                <Card
                  className="surface rounded-2xl p-4"
                  data-testid="card-seat-preview"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-[hsl(var(--accent)/.12)] p-2 text-[hsl(var(--accent))]">
                      <Armchair className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" data-testid="text-seat">
                        Your seat (after RSVP)
                      </div>
                      <div
                        className="mt-1 text-sm text-muted-foreground"
                        data-testid="text-seat-value"
                      >
                        {assignedSeatForName
                          ? formatSeat(assignedSeatForName)
                          : "RSVP to get an automatic seat suggestion."}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Card className="surface rounded-3xl p-5" data-testid="card-rsvp">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-[hsl(var(--primary)/.10)] p-2 text-[hsl(var(--primary))]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold" data-testid="text-rsvp-title">
                      RSVP
                    </div>
                    <div
                      className="text-sm text-muted-foreground"
                      data-testid="text-rsvp-subtitle"
                    >
                      Let us know if you can make it.
                    </div>
                  </div>
                </div>
                <Badge
                  className="rounded-full"
                  data-testid="badge-rsvp-count"
                >
                  {rsvps.length} received
                </Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <div>
                  <div
                    className="mb-1 text-sm font-medium"
                    data-testid="label-name"
                  >
                    Your name
                  </div>
                  <Input
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                    placeholder="e.g., Amina Hassan"
                    data-testid="input-name"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div
                      className="mb-1 text-sm font-medium"
                      data-testid="label-contact"
                    >
                      Phone or email
                    </div>
                    <Input
                      value={inviteeContact}
                      onChange={(e) => setInviteeContact(e.target.value)}
                      placeholder="Optional"
                      data-testid="input-contact"
                    />
                  </div>
                  <div>
                    <div
                      className="mb-1 text-sm font-medium"
                      data-testid="label-guests"
                    >
                      Guests
                    </div>
                    <Input
                      type="number"
                      value={inviteeCount}
                      onChange={(e) => setInviteeCount(Number(e.target.value))}
                      min={1}
                      max={10}
                      data-testid="input-guests"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <div
                    className="text-sm font-medium"
                    data-testid="label-status"
                  >
                    Attendance
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={inviteeStatus === "yes" ? "default" : "secondary"}
                      className="w-full"
                      onClick={() => setInviteeStatus("yes")}
                      data-testid="button-status-yes"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={inviteeStatus === "maybe" ? "default" : "secondary"}
                      className="w-full"
                      onClick={() => setInviteeStatus("maybe")}
                      data-testid="button-status-maybe"
                    >
                      Maybe
                    </Button>
                    <Button
                      type="button"
                      variant={inviteeStatus === "no" ? "default" : "secondary"}
                      className="w-full"
                      onClick={() => setInviteeStatus("no")}
                      data-testid="button-status-no"
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div>
                  <div
                    className="mb-1 text-sm font-medium"
                    data-testid="label-notes"
                  >
                    Note (dietary, etc.)
                  </div>
                  <Textarea
                    value={inviteeNotes}
                    onChange={(e) => setInviteeNotes(e.target.value)}
                    placeholder="Optional"
                    className="min-h-[88px]"
                    data-testid="input-notes"
                  />
                </div>

                <Button
                  className="mt-1 w-full"
                  onClick={submitRSVP}
                  data-testid="button-submit-rsvp"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit RSVP
                </Button>

                <div
                  className="rounded-2xl border bg-card/60 p-3 text-sm text-muted-foreground"
                  data-testid="status-storage"
                >
                  This is a prototype: RSVPs, seating, and wishlist claims are stored
                  only in this browser session.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Tabs defaultValue="timeline" className="mt-6" data-testid="tabs-main">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
            <TabsTrigger value="timeline" data-testid="tab-timeline">
              <Heart className="mr-2 h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="venue" data-testid="tab-venue">
              <MapPin className="mr-2 h-4 w-4" />
              Venue
            </TabsTrigger>
            <TabsTrigger value="wishlist" data-testid="tab-wishlist">
              <Gift className="mr-2 h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="seating" data-testid="tab-seating">
              <Armchair className="mr-2 h-4 w-4" />
              Seating
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <section className="grid gap-4" data-testid="section-timeline">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2
                    className="font-display text-2xl tracking-tight"
                    data-testid="text-timeline-title"
                  >
                    Their story
                  </h2>
                  <p
                    className="mt-1 text-sm text-muted-foreground"
                    data-testid="text-timeline-subtitle"
                  >
                    A few milestones we love.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {timeline.map((item) => (
                  <Card
                    key={item.id}
                    className="surface rounded-2xl p-4"
                    data-testid={`card-timeline-${item.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/.10)] text-[hsl(var(--primary))]"
                        data-testid={`badge-timeline-${item.id}`}
                      >
                        <Heart className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div
                            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            data-testid={`text-timeline-date-${item.id}`}
                          >
                            {item.dateLabel}
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <div
                            className="text-sm font-semibold"
                            data-testid={`text-timeline-title-${item.id}`}
                          >
                            {item.title}
                          </div>
                        </div>
                        <div
                          className="mt-1 text-sm text-muted-foreground"
                          data-testid={`text-timeline-desc-${item.id}`}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="venue" className="mt-6">
            <section className="grid gap-4" data-testid="section-venue">
              <Card className="surface rounded-2xl p-5" data-testid="card-venue-full">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-xl">
                    <h2
                      className="font-display text-2xl tracking-tight"
                      data-testid="text-venue-title"
                    >
                      Venue details
                    </h2>
                    <p
                      className="mt-1 text-sm text-muted-foreground"
                      data-testid="text-venue-desc"
                    >
                      Tap the map link for directions. We’ll share dress code and program
                      closer to the date.
                    </p>

                    <div className="mt-4 grid gap-3">
                      <div className="rounded-2xl border bg-card/60 p-4">
                        <div
                          className="text-sm font-semibold"
                          data-testid="text-venue-name-2"
                        >
                          {wedding.venue.name}
                        </div>
                        <div
                          className="mt-1 text-sm text-muted-foreground"
                          data-testid="text-venue-address-2"
                        >
                          {wedding.venue.address}
                        </div>
                        <a
                          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--accent))] hover:underline"
                          href={wedding.venue.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          data-testid="link-open-map-2"
                        >
                          Open in Google Maps
                          <span aria-hidden>→</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-sm">
                    <div className="surface rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-xl bg-[hsl(var(--accent)/.12)] p-2 text-[hsl(var(--accent))]">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" data-testid="text-quick">
                            Quick info
                          </div>
                          <div
                            className="text-xs text-muted-foreground"
                            data-testid="text-quick-sub"
                          >
                            Handy details at a glance.
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span data-testid="text-quick-date">{wedding.dateLabel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Time</span>
                          <span data-testid="text-quick-time">{wedding.timeLabel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">City</span>
                          <span data-testid="text-quick-city">{wedding.cityLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="wishlist" className="mt-6">
            <section className="grid gap-4" data-testid="section-wishlist">
              <div>
                <h2
                  className="font-display text-2xl tracking-tight"
                  data-testid="text-wishlist-title"
                >
                  Wishlist
                </h2>
                <p
                  className="mt-1 text-sm text-muted-foreground"
                  data-testid="text-wishlist-subtitle"
                >
                  If you’d like to gift something, here are a few ideas.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {wishlist.map((item) => {
                  const isClaimed = Boolean(claimed[item.id]);
                  return (
                    <Card
                      key={item.id}
                      className="surface rounded-2xl p-4"
                      data-testid={`card-wishlist-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="text-sm font-semibold"
                              data-testid={`text-wishlist-item-${item.id}`}
                            >
                              {item.title}
                            </div>
                            <Badge
                              variant="secondary"
                              className="rounded-full"
                              data-testid={`badge-wishlist-priority-${item.id}`}
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          {item.note ? (
                            <div
                              className="mt-1 text-sm text-muted-foreground"
                              data-testid={`text-wishlist-note-${item.id}`}
                            >
                              {item.note}
                            </div>
                          ) : null}
                          {isClaimed ? (
                            <div
                              className="mt-3 text-xs text-muted-foreground"
                              data-testid={`status-wishlist-claimed-${item.id}`}
                            >
                              Claimed by <span className="font-medium">{claimed[item.id]}</span>
                            </div>
                          ) : (
                            <div
                              className="mt-3 text-xs text-muted-foreground"
                              data-testid={`status-wishlist-open-${item.id}`}
                            >
                              Not claimed yet
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col gap-2">
                          {!isClaimed ? (
                            <Button
                              onClick={() => claimItem(item.id)}
                              className="gap-2"
                              data-testid={`button-claim-${item.id}`}
                            >
                              <Gift className="h-4 w-4" />
                              Claim
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => unclaimItem(item.id)}
                              data-testid={`button-unclaim-${item.id}`}
                            >
                              Unclaim
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="seating" className="mt-6">
            <section className="grid gap-4" data-testid="section-seating">
              <div>
                <h2
                  className="font-display text-2xl tracking-tight"
                  data-testid="text-seating-title"
                >
                  Seating allocation
                </h2>
                <p
                  className="mt-1 text-sm text-muted-foreground"
                  data-testid="text-seating-subtitle"
                >
                  RSVP assigns an available seat automatically. You can also pick a seat
                  manually here.
                </p>
              </div>

              <Card className="surface rounded-2xl p-5" data-testid="card-seating">
                <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
                  <div>
                    <div className="rounded-2xl border bg-card/60 p-4">
                      <div
                        className="text-sm font-semibold"
                        data-testid="text-your-seat-title"
                      >
                        Your assigned seat
                      </div>
                      <div
                        className="mt-1 text-sm text-muted-foreground"
                        data-testid="text-your-seat-value"
                      >
                        {assignedSeatForName
                          ? formatSeat(assignedSeatForName)
                          : "Add your name above, then RSVP (or pick a seat)."}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="secondary"
                          className="gap-2"
                          onClick={() => {
                            const key = slugify(inviteeName);
                            if (!key) {
                              toast({
                                title: "Add your name",
                                description: "Type your name first.",
                                variant: "destructive",
                              });
                              return;
                            }
                            if (availableSeatIds.length === 0) {
                              toast({
                                title: "No seats left",
                                description: "All seats in this prototype are taken.",
                                variant: "destructive",
                              });
                              return;
                            }
                            setSeatAssignments((prev) => ({
                              ...prev,
                              [key]: availableSeatIds[0],
                            }));
                            toast({
                              title: "Seat assigned",
                              description: "We picked the next available seat.",
                            });
                          }}
                          data-testid="button-auto-seat"
                        >
                          <Sparkles className="h-4 w-4" />
                          Auto assign
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => {
                            const key = slugify(inviteeName);
                            if (!key) return;
                            setSeatAssignments((prev) => {
                              if (!prev[key]) return prev;
                              const next = { ...prev };
                              delete next[key];
                              return next;
                            });
                          }}
                          data-testid="button-clear-seat"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border bg-card/60 p-4">
                      <div
                        className="text-sm font-semibold"
                        data-testid="text-seats-left"
                      >
                        Seats left
                      </div>
                      <div
                        className="mt-1 text-sm text-muted-foreground"
                        data-testid="text-seats-left-value"
                      >
                        {availableSeatIds.length} available
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {seats.map((seat) => {
                        const takenBy = Object.entries(seatAssignments).find(
                          ([, seatId]) => seatId === seat.id,
                        )?.[0];
                        const isTaken = Boolean(takenBy);
                        const displayName =
                          isTaken && takenBy ? takenBy.replace(/-/g, " ") : "";

                        return (
                          <button
                            key={seat.id}
                            className={`surface group relative w-full rounded-2xl p-4 text-left transition hover:translate-y-[-1px] ${
                              isTaken ? "opacity-75" : ""
                            }`}
                            onClick={() => {
                              const key = slugify(inviteeName);
                              if (!key) {
                                toast({
                                  title: "Add your name",
                                  description: "Type your name first.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              const taken = new Set(Object.values(seatAssignments));
                              const seatIsTaken = taken.has(seat.id);
                              const currentlyAssigned = seatAssignments[key];

                              if (seatIsTaken && currentlyAssigned !== seat.id) {
                                toast({
                                  title: "Seat taken",
                                  description: "Pick another seat.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              setSeatAssignments((prev) => ({ ...prev, [key]: seat.id }));
                            }}
                            data-testid={`button-seat-${seat.id}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div
                                  className="text-sm font-semibold"
                                  data-testid={`text-seat-label-${seat.id}`}
                                >
                                  {formatSeat(seat)}
                                </div>
                                <div
                                  className="mt-1 text-xs text-muted-foreground"
                                  data-testid={`text-seat-status-${seat.id}`}
                                >
                                  {isTaken
                                    ? `Reserved for ${displayName}`
                                    : "Available"}
                                </div>
                              </div>
                              <div
                                className={`rounded-xl p-2 ${
                                  isTaken
                                    ? "bg-[hsl(var(--muted)/.6)] text-muted-foreground"
                                    : "bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]"
                                }`}
                              >
                                <Armchair className="h-5 w-5" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </TabsContent>
        </Tabs>

        <footer
          className="mt-12 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground"
          data-testid="footer"
        >
          <div className="inline-flex items-center gap-2">
            <Heart className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span data-testid="text-footer">With love, we can’t wait to celebrate.</span>
          </div>
          <div data-testid="text-footer-note">
            Tip: replace the names, date, venue and timeline text with your real details.
          </div>
        </footer>
      </div>
    </div>
  );
}
