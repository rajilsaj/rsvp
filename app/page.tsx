"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Heart, MapPin, X } from "lucide-react";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCookie, setCookie } from "@/lib/cookies";

/* ─── Rose petal particle types ─── */
type PetalConfig = {
  id: number;
  left: number;       // % from left
  size: number;       // px
  duration: number;   // seconds to fall
  delay: number;      // seconds before starting
  xDrift: number;     // px of horizontal drift
  initRotate: number; // starting rotation
  hue: number;        // slight hue variation
};

function FloatingPetals() {
  const [petals, setPetals] = useState<PetalConfig[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 12,
        duration: 14 + Math.random() * 12,
        delay: Math.random() * 12,
        xDrift: (Math.random() - 0.5) * 120,
        initRotate: Math.random() * 360,
        hue: Math.random() * 30, // 0–30 for pink-to-rose range
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.left}%`, top: "-6%" }}
          animate={{
            y: ["0vh", "112vh"],
            x: [0, p.xDrift],
            rotate: [p.initRotate, p.initRotate + 540],
            opacity: [0, 0.65, 0.65, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            opacity: { times: [0, 0.08, 0.85, 1] },
          }}
        >
          {/* Petal shape: two overlapping rounded divs */}
          <div
            style={{
              width: p.size,
              height: p.size * 1.7,
              background: `linear-gradient(160deg, hsl(${340 + p.hue}, 85%, 82%), hsl(${345 + p.hue}, 75%, 70%))`,
              borderRadius: "60% 40% 55% 45% / 70% 45% 55% 30%",
              boxShadow: `inset 0 1px 2px rgba(255,255,255,0.4)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function launchConfetti() {
  const colors = ["#3d8b7a", "#c5e0da", "#fda4af", "#f9a8d4", "#fef9c3", "#ffffff"];

  // Left cannon
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 65,
    origin: { x: 0, y: 0.75 },
    colors,
    gravity: 1.1,
    scalar: 1.1,
  });

  // Right cannon
  confetti({
    particleCount: 70,
    angle: 120,
    spread: 65,
    origin: { x: 1, y: 0.75 },
    colors,
    gravity: 1.1,
    scalar: 1.1,
  });

  // Small centre burst with hearts
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      colors,
      shapes: ["circle"],
      scalar: 0.8,
    });
  }, 250);
}

type RSVPStatus = "yes" | "no" | "maybe";

type Rsvp = {
  id: string | number;
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
  dateISO: string;
  description: string;
  accentBg: string;
  accentBorder: string;
};

const incomingEvents: EventItem[] = [
  {
    id: "parents",
    title: "Meeting with Parents",
    date: "May 15, 2026",
    dateISO: "2026-05-15",
    description: "Traditional introduction and family gathering.",
    accentBg: "bg-emerald-500",
    accentBorder: "border-emerald-500",
  },
  {
    id: "dinner",
    title: "Pre-Wedding Dinner",
    date: "June 18, 2026",
    dateISO: "2026-06-18",
    description: "An intimate dinner with our closest friends and family.",
    accentBg: "bg-amber-400",
    accentBorder: "border-amber-400",
  },
  {
    id: "rehearsal",
    title: "Wedding Rehearsal",
    date: "June 19, 2026",
    dateISO: "2026-06-19",
    description: "Final run-through at the venue.",
    accentBg: "bg-rose-400",
    accentBorder: "border-rose-400",
  },
  {
    id: "wedding",
    title: "Wedding Day",
    date: "June 20, 2026",
    dateISO: "2026-06-20",
    description: "The big day! Join us to celebrate.",
    accentBg: "bg-teal-accent",
    accentBorder: "border-teal-accent",
  },
];

type Seat = { id: string; table: string; seat: string };

const wedding = {
  couple: { bride: "Grace", groom: "Noelvie" },
  dateLabel: "Saturday • 20 June 2026",
  timeLabel: "4:00 PM",
  cityLabel: "Youngsville, NC",
  venue: {
    name: "Pine Hill Pavilion",
    address: "375 Moores Pond Rd, Youngsville, NC 27596",
    phone: "(919) 746-3331",
    email: "Pinehillpavilion@gmail.com",
    mapUrl: "https://maps.google.com/?q=375+Moores+Pond+Rd+Youngsville+NC+27596",
  },
};

const seats: Seat[] = [
  { id: "t1s1", table: "Table 1", seat: "1" }, { id: "t1s2", table: "Table 1", seat: "2" },
  { id: "t1s3", table: "Table 1", seat: "3" }, { id: "t1s4", table: "Table 1", seat: "4" },
  { id: "t2s1", table: "Table 2", seat: "1" }, { id: "t2s2", table: "Table 2", seat: "2" },
  { id: "t2s3", table: "Table 2", seat: "3" }, { id: "t2s4", table: "Table 2", seat: "4" },
  { id: "t3s1", table: "Table 3", seat: "1" }, { id: "t3s2", table: "Table 3", seat: "2" },
  { id: "t3s3", table: "Table 3", seat: "3" }, { id: "t3s4", table: "Table 3", seat: "4" },
];

const timelineItems = [
  { id: "meet", dateLabel: "2015", title: "A friendship begins", description: "Their journey began as a simple friendship — but it was truly the answer to a whispered prayer from both Grace and Noelvie.", image: "/images/story-1.jpg" },
  { id: "first-date", dateLabel: "First Date", title: "The Chinese buffet", description: "At a Chinese Buffet restaurant, Grace gently used his own hands to wipe Noelvie's nose — a tender act that showed his true heart: caring, selfless, and real.", image: "/images/story-2.jpg" },
  { id: "proposal", dateLabel: "2017", title: "The engagement", description: "After two beautiful years of growing together, Grace asked Noelvie to be his fiancée at a traditional engagement filled with family and friends.", image: "/images/story-3.jpg" },
  { id: "wedding", dateLabel: "2026", title: "Wedding day", description: "Now, after years of knowing, growing, laughing, praying, and loving deeply — they are ready to celebrate with family and friends.", image: "/images/story-4.jpg" },
];

const navMenuLinks = [
  { label: "Our Story", id: "story", href: null, active: true },
  { label: "Celebrations", id: "events", href: null, active: true },
  { label: "Venue & RSVP", id: "venue-section", href: null, active: true },
  { label: "Our Photos", id: null, href: "/photos", active: true },
  { label: "Registry", id: null, href: null, active: false },
  { label: "Accommodation", id: null, href: null, active: false },
  { label: "FAQ", id: null, href: null, active: false },
];

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
function formatSeat(seat: Seat) { return `${seat.table} • Seat ${seat.seat}`; }
function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

export default function SaveTheDate() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [checking, setChecking] = useState(true);
  const [inviteeName, setInviteeName] = useState("");
  const [inviteePhoneDigits, setInviteePhoneDigits] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [inviteePlusOnes, setInviteePlusOnes] = useState(0);
  const [inviteeStatus, setInviteeStatus] = useState<RSVPStatus>("yes");
  const [homeTouched, setHomeTouched] = useState<Record<string, boolean>>({});
  const [homeErrors, setHomeErrors] = useState<Record<string, string>>({});
  const homePhoneRef = useRef<HTMLInputElement | null>(null);
  const [myRsvp, setMyRsvp] = useState<Rsvp | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ready: false });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function tick() {
      const target = new Date("2026-06-20T16:00:00");
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, ready: true }); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        ready: true,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const savedName = getCookie("wedding_rsvp_name");
    const savedPhone = getCookie("wedding_rsvp_phone");
    if (!savedName) { router.push("/rsvp"); return; }
    setChecking(false);
    fetch(`/api/guests`)
      .then((res) => (res.ok ? res.json() : []))
      .then((guests: any[]) => {
        const rsvp = guests.find((g) => g.names.trim().toLowerCase() === savedName.trim().toLowerCase());
        if (rsvp) {
          setMyRsvp({ ...rsvp, name: rsvp.names, status: rsvp.attending, guests: (rsvp.plusOnes || 0) + 1 });
          setInviteeName(rsvp.names);
        }
      })
      .catch(() => {});
  }, [router]);

  const { data: rsvps = [] } = useQuery<Rsvp[]>({
    queryKey: ["/api/guests"],
    queryFn: async () => {
      const res = await fetch("/api/guests");
      if (!res.ok) throw new Error("Failed to fetch RSVPs");
      const data = await res.json();
      return data.map((r: any) => ({ ...r, name: r.names, status: r.attending, guests: (r.plusOnes || 0) + 1 }));
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
    mutationFn: async (newRsvp: { name: string; phone: string; email?: string; guests: number; status: string; seatId?: string }) => {
      const res = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ names: newRsvp.name, phone: newRsvp.phone, email: newRsvp.email, attending: newRsvp.status, plusOnes: newRsvp.guests - 1 }) });
      if (!res.ok) throw new Error("Failed to submit RSVP");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      setCookie("wedding_rsvp_name", data.names);
      setCookie("wedding_rsvp_phone", data.phone);
      setMyRsvp({ ...data, name: data.names, status: data.attending, guests: (data.plusOnes || 0) + 1 });
      toast({ title: "RSVP received", description: data.seatId ? `You've been assigned to ${seats.find((s) => s.id === data.seatId)?.table || "a table"}!` : "Thank you — we can't wait to celebrate with you." });
      if (data.attending === "yes") launchConfetti();
    },
    onError: (err: any) => {
      const isNetwork = !navigator.onLine || err?.message?.toLowerCase().includes("fetch");
      toast({
        title: isNetwork ? "No connection" : "Couldn't save your RSVP",
        description: isNetwork
          ? "You appear to be offline. Check your internet and try again."
          : "Something went wrong on our end. Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const seatAssignments = useMemo(() => {
    const a: Record<string, string> = {};
    rsvps.forEach((r) => { if (r.seatId) a[slugify(r.name)] = r.seatId; });
    return a;
  }, [rsvps]);

  const assignedSeatForName = useMemo(() => {
    if (myRsvp?.seatId) return seats.find((s) => s.id === myRsvp.seatId);
    const key = slugify(inviteeName);
    if (!key) return undefined;
    const seatId = seatAssignments[key];
    return seatId ? seats.find((s) => s.id === seatId) : undefined;
  }, [inviteeName, seatAssignments, myRsvp]);

  const availableSeatIds = useMemo(() => {
    const taken = new Set(Object.values(seatAssignments));
    return seats.filter((s) => !taken.has(s.id)).map((s) => s.id);
  }, [seatAssignments]);

  function scrollTo(id: string) {
    setMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast({ title: "Link copied", description: "Share it with your guests to RSVP." }),
      () => toast({ title: "Couldn't copy", description: "Please copy the URL from the address bar.", variant: "destructive" })
    );
  }

  function handleSaveToCalendar() {
    const title = `Wedding: ${wedding.couple.bride} & ${wedding.couple.groom}`;
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=20260620T160000/20260620T230000&details=${encodeURIComponent("Join us at " + wedding.venue.name)}&location=${encodeURIComponent(wedding.venue.address)}`;
    window.open(url, "_blank");
    toast({ title: "Opening Calendar", description: "Redirecting to Google Calendar." });
  }

  function buildHomePhoneDisplay(digits: string): string {
    return (
      "(" +
      (digits[0] ?? "_") + (digits[1] ?? "_") + (digits[2] ?? "_") +
      ") " +
      (digits[3] ?? "_") + (digits[4] ?? "_") + (digits[5] ?? "_") +
      "-" +
      (digits[6] ?? "_") + (digits[7] ?? "_") + (digits[8] ?? "_") + (digits[9] ?? "_")
    );
  }

  function homePhoneCursorPos(n: number): number {
    if (n < 3) return 1 + n;
    if (n === 3) return 6;
    if (n < 6) return 6 + (n - 3);
    if (n === 6) return 10;
    return 10 + (n - 6);
  }

  function handleHomePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setInviteePhoneDigits(digits);
    const pos = homePhoneCursorPos(digits.length);
    requestAnimationFrame(() => homePhoneRef.current?.setSelectionRange(pos, pos));
  }

  function handleHomePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Backspace" || inviteePhoneDigits.length === 0) return;
    const cursorAt = homePhoneRef.current?.selectionStart ?? 0;
    const charBefore = buildHomePhoneDisplay(inviteePhoneDigits)[cursorAt - 1];
    if (charBefore && /[() \-_]/.test(charBefore)) {
      e.preventDefault();
      const newDigits = inviteePhoneDigits.slice(0, -1);
      setInviteePhoneDigits(newDigits);
      const pos = homePhoneCursorPos(newDigits.length);
      requestAnimationFrame(() => homePhoneRef.current?.setSelectionRange(pos, pos));
    }
  }

  function validateHome(): boolean {
    const errs: Record<string, string> = {};
    if (!inviteeName.trim()) errs.names = "Full name is required.";
    if (!inviteePhoneDigits) {
      errs.phone = "Phone number is required.";
    } else if (inviteePhoneDigits.length < 10) {
      errs.phone = "Enter a valid 10-digit US phone number.";
    }
    if (inviteeEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail.trim())) {
      errs.email = "Enter a valid email address.";
    }
    setHomeErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function submitRSVP() {
    setHomeTouched({ names: true, phone: true, email: true });
    if (!validateHome()) return;
    const name = inviteeName.trim();
    const key = slugify(name);
    let seatId: string | undefined;
    if (key && !seatAssignments[key] && availableSeatIds.length > 0) seatId = availableSeatIds[0];
    rsvpMutation.mutate({
      name,
      phone: buildHomePhoneDisplay(inviteePhoneDigits),
      email: inviteeEmail.trim(),
      guests: inviteePlusOnes + 1,
      status: inviteeStatus,
      seatId,
    });
  }

  if (checking) {
    return (
      <div className="min-h-[100dvh] bg-[#faf9f6] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-teal-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#faf9f6] text-dark-teal overflow-x-hidden">


      {/* ══════════════════════════════════
          FULL-SCREEN NAV OVERLAY
      ══════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="nav-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-mint flex flex-col"
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-5 sm:px-10 py-4 border-b border-dark-teal/10">
              <div className="text-center">
                <p className="font-display text-lg tracking-[0.3em] text-dark-teal font-light">G · N</p>
                <p className="text-[8px] tracking-[0.35em] uppercase text-dark-teal/40 mt-0.5">Grace &amp; Noelvie</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-dark-teal/50 hover:text-dark-teal transition-colors" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col justify-center px-8 sm:px-16">
              <div className="space-y-1">
                {navMenuLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                  >
                    {link.active ? (
                      link.href ? (
                        <Link
                          href={link.href}
                          className="group flex items-center gap-4 py-3 border-b border-dark-teal/10 hover:border-teal-accent transition-colors"
                        >
                          <span className="text-[8px] text-dark-teal/30 font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-display text-2xl sm:text-3xl text-dark-teal font-light group-hover:text-teal-accent transition-colors">{link.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => link.id && scrollTo(link.id)}
                          className="group w-full flex items-center gap-4 py-3 border-b border-dark-teal/10 hover:border-teal-accent transition-colors text-left"
                        >
                          <span className="text-[8px] text-dark-teal/30 font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-display text-2xl sm:text-3xl text-dark-teal font-light group-hover:text-teal-accent transition-colors">{link.label}</span>
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-4 py-3 border-b border-dark-teal/5 opacity-30 cursor-not-allowed select-none">
                        <span className="text-[8px] text-dark-teal/30 font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-display text-2xl sm:text-3xl text-dark-teal font-light">{link.label}</span>
                        <span className="ml-auto text-[8px] tracking-[0.25em] uppercase text-dark-teal/30">Soon</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </nav>

            <div className="px-8 sm:px-16 py-8 border-t border-dark-teal/10">
              <p className="text-[8px] tracking-[0.35em] uppercase text-dark-teal/30">{wedding.dateLabel} · {wedding.venue.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative flex flex-col min-h-[100dvh] border-b border-dark-teal/10">
        <FloatingPetals />

        {/* Top navbar */}
        <header className="relative z-[2] flex items-center justify-between px-5 sm:px-10 py-4 border-b border-dark-teal/10">
          <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] group" aria-label="Open menu">
            <span className="block h-px w-7 bg-dark-teal/50 group-hover:bg-teal-accent transition-colors" />
            <span className="block h-px w-4 bg-dark-teal/50 group-hover:bg-teal-accent transition-colors" />
            <span className="block h-px w-7 bg-dark-teal/50 group-hover:bg-teal-accent transition-colors" />
          </button>
          <div className="text-center">
            <p className="font-display text-lg sm:text-xl tracking-[0.3em] text-dark-teal font-light leading-none">G · N</p>
            <p className="text-[8px] tracking-[0.35em] uppercase text-dark-teal/40 mt-0.5">Grace &amp; Noelvie</p>
          </div>
          <button onClick={() => scrollTo("rsvp-section")} className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-dark-teal border border-dark-teal/25 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-dark-teal hover:text-[#faf9f6] transition-all">
            RSVP
          </button>
        </header>

        {/* Hero grid */}
        <div className="relative z-[2] flex-1 flex flex-col justify-center py-10 sm:py-14 px-5 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-10 lg:gap-6 max-w-5xl mx-auto w-full">

            {/* Left: Script headline */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, delay: 0.15 }}
              className="order-2 lg:order-1 flex flex-col items-center lg:items-end text-center lg:text-right pr-0 lg:pr-10">
              <p className="text-[8px] tracking-[0.45em] uppercase text-dark-teal/35 mb-3">Join us to celebrate</p>
              <h1 className="font-wedding text-[3.8rem] sm:text-[5rem] lg:text-[5.5rem] xl:text-[6rem] text-teal-accent leading-[1.05]">
                We&apos;re<br />getting<br />married
              </h1>
              <p className="mt-5 text-[9px] tracking-[0.3em] uppercase text-dark-teal/35 leading-relaxed max-w-[220px]">
                &ldquo;What God has joined together,<br />let no one separate.&rdquo;
                <span className="block mt-1 text-dark-teal/25">— Mark 10:9</span>
              </p>
            </motion.div>

            {/* Center: Single hero photo */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }}
              className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-64 sm:w-80 lg:w-[22rem] xl:w-96 rotate-[1.5deg] shadow-[0_32px_64px_-12px_rgba(29,61,55,0.35)] overflow-hidden flex-shrink-0 rounded-2xl">
                <img src="/images/couple-hero-2.jpg" alt="Grace &amp; Noelvie" className="w-full aspect-[3/4] object-cover object-top grayscale" />
                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-teal/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Right: Event details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, delay: 0.15 }}
              className="order-3 flex flex-col items-center lg:items-start text-center lg:text-left pl-0 lg:pl-10">
              <p className="text-[8px] tracking-[0.45em] uppercase text-dark-teal/35 mb-4">The Event</p>
              <p className="font-display text-3xl sm:text-4xl font-light text-dark-teal leading-tight tracking-tight">
                JUN 20,<br />2026
              </p>
              <div className="my-4 h-px w-10 bg-dark-teal/15" />
              <div className="space-y-1">
                <p className="text-[9px] tracking-[0.28em] uppercase text-dark-teal/70 font-medium">{wedding.venue.name}</p>
                <p className="text-[11px] text-dark-teal/45 leading-relaxed max-w-[180px]">{wedding.venue.address}</p>
                <p className="text-[11px] text-dark-teal/45">{wedding.timeLabel}</p>
              </div>
              <div className="my-4 h-px w-10 bg-dark-teal/15" />
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 items-center lg:items-start">
                <a href={wedding.venue.mapUrl} target="_blank" rel="noreferrer" className="text-[9px] tracking-[0.2em] uppercase text-teal-accent border-b border-teal-accent/40 pb-px hover:border-teal-accent transition-colors">
                  Get Directions →
                </a>
                <button onClick={handleSaveToCalendar} className="text-[9px] tracking-[0.2em] uppercase text-dark-teal/50 border-b border-dark-teal/20 pb-px hover:text-teal-accent hover:border-teal-accent/40 transition-colors">
                  Save to Calendar →
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom strip: section nav + countdown */}
        <div className="relative z-[2] border-t border-dark-teal/10 px-5 py-5 sm:py-6">
          <nav className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-5 gap-y-2 mb-4">
            {[
              { label: "Our Story", id: "story" },
              { label: "Celebrations", id: "events" },
              { label: "Venue", id: "venue-section" },
              { label: "RSVP", id: "rsvp-section" },
            ].map((link, i, arr) => (
              <Fragment key={link.id}>
                <button onClick={() => scrollTo(link.id)} className="text-[8px] sm:text-[9px] tracking-[0.28em] uppercase text-dark-teal/45 hover:text-teal-accent transition-colors">
                  {link.label}
                </button>
                {i < arr.length - 1 && <span className="text-dark-teal/20 text-[10px] leading-none select-none">·</span>}
              </Fragment>
            ))}
          </nav>
          {countdown.ready && (
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {[
                { value: countdown.days,    label: "Days" },
                { value: countdown.hours,   label: "Hrs"  },
                { value: countdown.minutes, label: "Min"  },
                { value: countdown.seconds, label: "Sec"  },
              ].map((unit, i, arr) => (
                <Fragment key={unit.label}>
                  <div className="text-center min-w-[2.5rem] sm:min-w-[3.5rem]">
                    <span className="font-display text-3xl sm:text-4xl font-light text-dark-teal tabular-nums leading-none">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                    <p className="text-[7px] sm:text-[8px] tracking-[0.3em] uppercase text-dark-teal/35 mt-1">{unit.label}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="font-display text-2xl sm:text-3xl text-dark-teal/20 pb-4 select-none">:</span>
                  )}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════
          OUR STORY
      ══════════════════════════════════ */}
      <section id="story" className="mx-auto max-w-4xl px-5 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[8px] tracking-[0.4em] uppercase text-dark-teal/35 mb-3">About us</p>
          <h2 className="font-display text-3xl sm:text-5xl text-dark-teal font-light tracking-tight">Our Story</h2>
          <div className="mt-4 h-px w-12 bg-dark-teal/15 mx-auto" />
        </div>

        <div className="space-y-14 sm:space-y-20">
          {timelineItems.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
              className={`flex flex-col ${index % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"} gap-8 sm:gap-12 items-center`}>
              <div className="w-full sm:w-1/2 overflow-hidden group rounded-2xl">
                <img src={item.image} alt={item.title} className="w-full h-60 sm:h-80 object-cover grayscale hover:grayscale-0 active:grayscale-0 group-hover:scale-[1.03] group-active:scale-[1.03] transition-all duration-700" />
              </div>
              <div className={`w-full sm:w-1/2 ${index % 2 === 1 ? "sm:text-right" : ""}`}>
                <span className="text-[9px] tracking-[0.4em] uppercase text-teal-accent font-medium">{item.dateLabel}</span>
                <h3 className="mt-2 text-2xl sm:text-3xl font-display font-light text-dark-teal">{item.title}</h3>
                <div className={`mt-3 h-px w-8 bg-dark-teal/15 ${index % 2 === 1 ? "ml-auto" : ""}`} />
                <p className="mt-4 text-dark-teal/55 leading-relaxed text-sm sm:text-base">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          CELEBRATIONS — Creative 2×2 grid
      ══════════════════════════════════ */}
      <section id="events" className="bg-mint">
        <div className="max-w-5xl mx-auto px-5 sm:px-10 pt-16 sm:pt-24 pb-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[8px] tracking-[0.4em] uppercase text-dark-teal/35 mb-3">Mark your calendar</p>
            <h2 className="font-display text-3xl sm:text-5xl text-dark-teal font-light tracking-tight">Upcoming Celebrations</h2>
            <div className="mt-4 h-px w-12 bg-dark-teal/15 mx-auto" />
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-dark-teal/10">
          {incomingEvents.map((event, index) => {
            const days = daysUntil(event.dateISO);
            const isPast = days < 0;
            const isToday = days === 0;
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.6 }}
                className={`relative border-b border-r-0 sm:border-r border-dark-teal/10 p-8 sm:p-10 overflow-hidden group hover:bg-white/30 transition-colors ${index % 2 === 1 ? "sm:border-r-0" : ""}`}>
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${event.accentBg} transition-all duration-500 group-hover:h-[5px]`} />

                {/* Ghost number */}
                <span className="absolute -bottom-4 -right-2 font-display text-[8rem] text-dark-teal/[0.06] font-bold leading-none select-none pointer-events-none">
                  0{index + 1}
                </span>

                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <p className={`text-[8px] tracking-[0.35em] uppercase font-medium ${isPast ? "text-dark-teal/30" : "text-dark-teal/50"}`}>
                      {event.date}
                    </p>
                    {isPast ? (
                      <span className="text-[7px] tracking-[0.25em] uppercase text-dark-teal/25 border border-dark-teal/15 px-2 py-0.5">Completed</span>
                    ) : isToday ? (
                      <span className={`text-[7px] tracking-[0.25em] uppercase text-dark-teal border px-2 py-0.5 ${event.accentBorder}`}>Today</span>
                    ) : (
                      <span className="text-[7px] tracking-[0.25em] uppercase text-dark-teal/40">{days}d away</span>
                    )}
                  </div>

                  <h3 className={`font-display text-xl sm:text-2xl font-light leading-tight mb-3 ${isPast ? "text-dark-teal/40" : "text-dark-teal"}`}>
                    {event.title}
                  </h3>
                  <div className={`h-px w-8 mb-3 ${isPast ? "bg-dark-teal/10" : "bg-dark-teal/20"}`} />
                  <p className={`text-sm leading-relaxed ${isPast ? "text-dark-teal/25" : "text-dark-teal/55"}`}>
                    {event.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom quote */}
        <div className="max-w-5xl mx-auto px-5 sm:px-10 py-10 sm:py-12 text-center border-t border-dark-teal/10">
          <p className="font-wedding text-3xl sm:text-4xl text-teal-accent">
            Grace &amp; Noelvie
          </p>
          <p className="mt-2 text-[8px] tracking-[0.35em] uppercase text-dark-teal/30">{wedding.dateLabel}</p>
        </div>
      </section>

      {/* ══════════════════════════════════
          VENUE + RSVP
      ══════════════════════════════════ */}
      <section id="venue-section" className="border-t border-dark-teal/10 px-5 sm:px-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto grid gap-12 lg:grid-cols-2">

          {/* Venue */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-[8px] tracking-[0.4em] uppercase text-dark-teal/35 mb-3">Where we tie the knot</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-dark-teal tracking-tight mb-2">The Venue</h2>
            <div className="mb-6 h-px w-10 bg-dark-teal/15" />
            <p className="text-dark-teal/50 mb-8 text-sm sm:text-base leading-relaxed">
              We&apos;ve chosen a place that feels like home. Join us at{" "}
              <span className="text-dark-teal/70">{wedding.venue.name}</span> for an unforgettable evening.
            </p>

            <div className="bg-white border border-dark-teal/10 rounded-2xl p-6 sm:p-8 mb-4">
              <div className="flex items-start gap-4">
                <div className="bg-teal-accent/10 p-2.5 text-teal-accent flex-shrink-0 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-dark-teal">{wedding.venue.name}</h4>
                  <p className="mt-2 text-sm text-dark-teal/50 leading-relaxed">{wedding.venue.address}</p>
                  <p className="mt-1.5 text-sm text-dark-teal/50">
                    Call/Text:{" "}
                    <a href={`tel:${wedding.venue.phone}`} className="hover:text-teal-accent transition-colors">{wedding.venue.phone}</a>
                  </p>
                  <p className="mt-0.5 text-sm text-dark-teal/50">
                    Email:{" "}
                    <a href={`mailto:${wedding.venue.email}`} className="hover:text-teal-accent transition-colors">{wedding.venue.email}</a>
                  </p>
                  <a href={wedding.venue.mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block text-[9px] tracking-[0.2em] uppercase text-teal-accent border-b border-teal-accent/40 pb-px hover:border-teal-accent transition-colors">
                    Get Directions →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RSVP */}
          <motion.div id="rsvp-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="flex items-start lg:items-center">
            <div className="bg-white border border-dark-teal/10 rounded-2xl p-6 sm:p-8 w-full">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-dark-teal/35 mb-1">Confirm attendance</p>
                  <h2 className="font-display text-3xl font-light text-dark-teal tracking-tight">RSVP</h2>
                </div>
                <span className="text-[9px] tracking-[0.2em] uppercase text-teal-accent border border-teal-accent/30 px-3 py-1.5">
                  {rsvps.filter((r) => r.status === "yes").length} Attending
                </span>
              </div>
              <div className="mb-6 h-px bg-dark-teal/10" />

              {myRsvp ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-teal-accent/10 flex items-center justify-center mx-auto mb-4 rounded-2xl">
                    <Heart className="h-7 w-7 text-teal-accent" />
                  </div>
                  <h3 className="text-lg font-medium text-dark-teal mb-2">You&apos;re all set, {myRsvp.name}!</h3>
                  <p className="text-sm text-dark-teal/50 leading-relaxed">
                    {myRsvp.status === "yes" ? "We're excited to celebrate with you!" : myRsvp.status === "maybe" ? "We hope you can make it!" : "We'll miss you at the celebration."}
                  </p>
                  {myRsvp.seatId && assignedSeatForName && (
                    <div className="mt-5 p-4 bg-teal-accent/5 border border-teal-accent/15 rounded-xl">
                      <p className="text-xs text-dark-teal/45 mb-1">Your seat assignment</p>
                      <p className="text-base font-medium text-teal-accent">{formatSeat(assignedSeatForName)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-dark-teal/60">Full Name(s) *</label>
                    <input
                      type="text"
                      value={inviteeName}
                      onChange={(e) => setInviteeName(e.target.value)}
                      onBlur={() => setHomeTouched(prev => ({ ...prev, names: true }))}
                      data-testid="input-name"
                      placeholder="Your full name"
                      className={`w-full rounded-xl px-4 py-3 text-base text-gray-700 bg-white border outline-none focus:border-teal-accent transition-colors ${homeTouched.names && homeErrors.names ? "border-red-400" : "border-gray-200"}`}
                    />
                    {homeTouched.names && homeErrors.names && <p className="text-xs mt-1 text-red-500">{homeErrors.names}</p>}
                  </div>

                  {/* Phone with ghost mask */}
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-dark-teal/60">Phone *</label>
                    <div className={`relative w-full rounded-xl bg-white border transition-colors focus-within:border-teal-accent ${homeTouched.phone && homeErrors.phone ? "border-red-400" : "border-gray-200"}`}>
                      <div aria-hidden="true" className="absolute inset-0 flex items-center px-4 text-base pointer-events-none select-none">
                        {Array.from(buildHomePhoneDisplay(inviteePhoneDigits)).map((ch, i) => (
                          <span key={i} className={/\d/.test(ch) ? "text-gray-700" : ch === "_" ? "text-gray-300" : "text-gray-400"}>{ch}</span>
                        ))}
                      </div>
                      <input
                        ref={homePhoneRef}
                        type="tel"
                        inputMode="numeric"
                        data-testid="input-phone"
                        value={buildHomePhoneDisplay(inviteePhoneDigits)}
                        onChange={handleHomePhoneChange}
                        onKeyDown={handleHomePhoneKeyDown}
                        onBlur={() => setHomeTouched(prev => ({ ...prev, phone: true }))}
                        onFocus={() => {
                          const pos = homePhoneCursorPos(inviteePhoneDigits.length);
                          requestAnimationFrame(() => homePhoneRef.current?.setSelectionRange(pos, pos));
                        }}
                        className="relative w-full rounded-xl px-4 py-3 text-base bg-transparent outline-none text-transparent caret-gray-700"
                      />
                    </div>
                    {homeTouched.phone && homeErrors.phone && <p className="text-xs mt-1 text-red-500">{homeErrors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-dark-teal/60">Email (optional)</label>
                    <input
                      type="email"
                      value={inviteeEmail}
                      onChange={(e) => setInviteeEmail(e.target.value)}
                      onBlur={() => setHomeTouched(prev => ({ ...prev, email: true }))}
                      placeholder="you@email.com"
                      className={`w-full rounded-xl px-4 py-3 text-base text-gray-700 bg-white border outline-none focus:border-teal-accent transition-colors ${homeTouched.email && homeErrors.email ? "border-red-400" : "border-gray-200"}`}
                    />
                    {homeTouched.email && homeErrors.email && <p className="text-xs mt-1 text-red-500">{homeErrors.email}</p>}
                  </div>

                  {/* Attending yes/no */}
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-dark-teal/60">Will you attend? *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setInviteeStatus("yes")}
                        data-testid="button-rsvp-yes"
                        className={`py-3.5 rounded-xl text-sm font-medium transition-all border-2 ${inviteeStatus === "yes" ? "bg-teal-accent/10 border-teal-accent text-teal-accent" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
                      >
                        ✓ Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setInviteeStatus("no")}
                        data-testid="button-rsvp-no"
                        className={`py-3.5 rounded-xl text-sm font-medium transition-all border-2 ${inviteeStatus === "no" ? "bg-rose-50 border-rose-400 text-rose-600" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
                      >
                        ✗ No
                      </button>
                    </div>
                  </div>

                  {/* Plus-ones counter */}
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-dark-teal/60">Additional guests you&apos;re bringing</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setInviteePlusOnes(Math.max(0, inviteePlusOnes - 1))} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50">−</button>
                      <span className="flex-1 text-center font-semibold text-base">{inviteePlusOnes === 0 ? "None" : `+${inviteePlusOnes}`}</span>
                      <button type="button" onClick={() => setInviteePlusOnes(Math.min(10, inviteePlusOnes + 1))} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50">+</button>
                    </div>
                  </div>

                  <button onClick={submitRSVP} disabled={rsvpMutation.isPending} data-testid="button-submit-rsvp"
                    className="w-full py-3.5 bg-teal-accent text-white text-sm tracking-[0.15em] uppercase font-medium hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm rounded-xl">
                    {rsvpMutation.isPending ? "Saving…" : "Submit RSVP"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="border-t border-dark-teal/10 py-12 px-5 sm:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-wedding text-4xl sm:text-5xl text-teal-accent">{wedding.couple.bride} &amp; {wedding.couple.groom}</p>
          <p className="mt-2 text-[9px] tracking-[0.35em] uppercase text-dark-teal/40">{wedding.dateLabel}</p>
          <div className="mt-6 h-px w-12 bg-dark-teal/10 mx-auto" />
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={handleCopyLink} data-testid="button-copy-link" className="flex items-center gap-2 text-[9px] tracking-[0.22em] uppercase text-dark-teal/45 border border-dark-teal/15 px-4 py-2 hover:border-teal-accent hover:text-teal-accent transition-colors">
              <Copy className="h-3.5 w-3.5" />
              Copy Invite Link
            </button>
          </div>
          <p className="mt-8 text-[9px] tracking-[0.2em] uppercase text-dark-teal/25 flex items-center justify-center gap-1.5">
            Made with <Heart className="h-3 w-3 text-rose-400 fill-rose-400" /> for their day ·{" "}
            <a href="https://rajil.me" target="_blank" rel="noreferrer" className="hover:text-teal-accent transition-colors underline underline-offset-2">Rajil Vembe</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
