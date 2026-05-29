"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Church, Copy, Heart, MapPin, Wine, X } from "lucide-react";
import confetti from "canvas-confetti";

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

/* ── Confetti scattered around the headline block ────────────────────────── */
const CONFETTI_SCATTER = [
  { top: "4%",  left: "72%", w: "6px",  h: "2.5px", color: "#D4AF37", r:  18, delay: 0.0 },
  { top: "12%", left: "88%", w: "3px",  h: "3px",   color: "#F5E080", r: -35, delay: 0.7 },
  { top: "22%", left: "5%",  w: "7px",  h: "2px",   color: "#C8A028", r:  50, delay: 1.1 },
  { top: "30%", left: "80%", w: "4px",  h: "4px",   color: "#FFF0A0", r: -12, delay: 1.8 },
  { top: "40%", left: "65%", w: "5px",  h: "2px",   color: "#B8920A", r:  70, delay: 2.3 },
  { top: "50%", left: "2%",  w: "5px",  h: "2px",   color: "#C8A028", r: -22, delay: 0.4 },
  { top: "58%", left: "78%", w: "4px",  h: "4px",   color: "#D4AF37", r:  42, delay: 1.0 },
  { top: "68%", left: "15%", w: "6px",  h: "2.5px", color: "#F5E080", r: -55, delay: 1.6 },
  { top: "77%", left: "60%", w: "3px",  h: "3px",   color: "#FFF0A0", r:  16, delay: 2.2 },
  { top: "86%", left: "90%", w: "5px",  h: "2px",   color: "#B8920A", r: -30, delay: 0.9 },
  { top: "18%", left: "50%", w: "4px",  h: "2px",   color: "#D4AF37", r:  60, delay: 1.4 },
  { top: "62%", left: "42%", w: "6px",  h: "2px",   color: "#C8A028", r: -40, delay: 2.0 },
];

/* ── Image with gold-bordered placeholder shown while loading ────────────── */
function CoupleImg({ src, alt, className, imgStyle }: { src: string; alt: string; className?: string; imgStyle?: React.CSSProperties }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {/* Placeholder */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ background: "#FAF8F5", border: "2px solid #D4AF37" }}
        aria-hidden="true"
      >
        {/* Inner gold frame */}
        <div className="absolute inset-[8px] pointer-events-none"
          style={{ border: "1px solid rgba(212,175,55,0.35)" }} />
        {/* Monogram */}
        <p className="font-display text-2xl tracking-[0.4em] font-light select-none"
          style={{ color: "#B8920A" }}>G · N</p>
        {/* Script names */}
        <p className="font-wedding text-3xl select-none mt-1"
          style={{ color: "#C8A028" }}>Grace &amp; Noelvie</p>
        {/* Date */}
        <p className="text-[8px] tracking-[0.35em] uppercase select-none mt-2"
          style={{ color: "rgba(184,146,10,0.55)" }}>August 22 · 2026</p>
      </div>

      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
        style={imgStyle}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

/* ── Wax-seal invitation loader ──────────────────────────────────────────── */
function WeddingLoader() {
  const BG = "#080606";
  const GOLD = "rgba(212,175,55,";
  const drifters = [
    { top:"14%", left:"9%",  w:6, h:2.5, r: 22, d:0.3, c:"#D4AF37" },
    { top:"18%", left:"82%", w:4, h:4,   r:-18, d:0.9, c:"#F5E080" },
    { top:"60%", left:"6%",  w:5, h:2,   r: 55, d:0.6, c:"#C8A028" },
    { top:"72%", left:"87%", w:6, h:2.5, r:-35, d:1.2, c:"#D4AF37" },
    { top:"40%", left:"4%",  w:3, h:3,   r: 10, d:1.6, c:"#F5E080" },
    { top:"28%", left:"91%", w:5, h:2,   r: 70, d:2.0, c:"#B8920A" },
    { top:"82%", left:"20%", w:4, h:2,   r:-50, d:0.4, c:"#D4AF37" },
    { top:"85%", left:"75%", w:6, h:2,   r: 30, d:1.1, c:"#C8A028" },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: BG }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
    >
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(114,47,55,0.10) 0%, transparent 68%)" }} />

      {/* Floating confetti in background */}
      {drifters.map((p, i) => (
        <div key={i} className="absolute rounded-sm"
          style={{
            top: p.top, left: p.left, width: p.w, height: p.h,
            background: p.c, ["--r" as string]: `${p.r}deg`,
            animation: `loader-drift ${2.8 + i * 0.3}s ease-in-out ${p.d}s infinite`,
          }} />
      ))}

      {/* ── PHASE 1: Wax seal ── */}
      <motion.div className="absolute"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.08, 1, 1, 1.6], opacity: [0, 1, 1, 1, 0] }}
        transition={{ times: [0, 0.25, 0.38, 0.72, 1], duration: 2.4, ease: "easeOut" }}
      >
        <div className="seal-glow">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Dashed outer ring */}
            <circle cx="60" cy="60" r="57" stroke={`${GOLD}0.5)`} strokeWidth="1" strokeDasharray="4 3" />
            {/* Seal body */}
            <circle cx="60" cy="60" r="50" fill="#5C1E2A" />
            {/* Gold border */}
            <circle cx="60" cy="60" r="50" stroke={`${GOLD}0.85)`} strokeWidth="1.5" />
            {/* Inner decorative ring */}
            <circle cx="60" cy="60" r="43" stroke={`${GOLD}0.35)`} strokeWidth="0.7" strokeDasharray="3 2" />
            {/* Monogram G */}
            <text x="60" y="52" textAnchor="middle" fill="#D4AF37"
              fontSize="20" fontFamily="Georgia,serif" fontWeight="300">G</text>
            {/* Divider line */}
            <line x1="42" y1="62" x2="78" y2="62" stroke={`${GOLD}0.55)`} strokeWidth="0.8" />
            {/* Monogram N */}
            <text x="60" y="78" textAnchor="middle" fill="#D4AF37"
              fontSize="20" fontFamily="Georgia,serif" fontWeight="300">N</text>
            {/* 4 corner ornament dots */}
            {[[60,12],[108,60],[60,108],[12,60]].map(([cx,cy],i) => (
              <circle key={i} cx={cx} cy={cy} r="2.5" fill={`${GOLD}0.6)`} />
            ))}
          </svg>
        </div>
      </motion.div>

      {/* ── PHASE 2: Invitation card ── */}
      <motion.div className="relative text-center w-[88vw] max-w-[340px]"
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ border: `1.5px solid ${GOLD}0.45)`, padding: "36px 32px", background: "rgba(10,8,8,0.6)" }}
      >
        {/* Double inset frame */}
        <div className="absolute inset-[9px] pointer-events-none"
          style={{ border: `1px solid ${GOLD}0.18)` }} />
        {/* Corner dots */}
        {["-top-[3px] -left-[3px]","-top-[3px] -right-[3px]","-bottom-[3px] -left-[3px]","-bottom-[3px] -right-[3px]"].map((cls,i)=>(
          <div key={i} className={`absolute ${cls} w-[5px] h-[5px] rounded-full`}
            style={{ background: "#D4AF37", boxShadow: `0 0 4px ${GOLD}0.6)` }} />
        ))}

        {/* Top ornament line */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          style={{ height:1, width:72, margin:"0 auto 22px",
            background:`linear-gradient(90deg,transparent,${GOLD}0.9),transparent)` }} />

        {/* Tagline */}
        <motion.p initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, delay:2.45 }}
          style={{ fontSize:8, letterSpacing:"0.58em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.38)", marginBottom:16 }}>
          You are cordially invited to
        </motion.p>

        {/* Names — gold gradient */}
        <motion.p initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:1, delay:2.75, ease:[0.16,1,0.3,1] }}
          className="font-wedding"
          style={{
            fontSize:"clamp(2.1rem,8vw,2.9rem)", lineHeight:1.25, marginBottom:4,
            background:"linear-gradient(160deg,#9A7808 0%,#D4AF37 35%,#F5E080 55%,#C8A028 78%,#9A7808 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          }}>
          Grace &amp; Noelvie
        </motion.p>

        {/* "Wedding" */}
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.5, delay:3.3 }}
          style={{ fontSize:9, letterSpacing:"0.52em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.42)", marginBottom:5 }}>
          Wedding
        </motion.p>

        {/* Date */}
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.5, delay:3.5 }}
          style={{ fontSize:8, letterSpacing:"0.32em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.25)" }}>
          August 22 · 2026
        </motion.p>

        {/* Bottom ornament */}
        <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }}
          transition={{ duration:1, delay:3.65 }}
          style={{ height:1, width:72, margin:"22px auto 18px",
            background:`linear-gradient(90deg,transparent,${GOLD}0.9),transparent)` }} />

        {/* ✦ ornament */}
        <motion.div initial={{ opacity:0, scale:0.4 }} animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.4, delay:3.8, type:"spring", stiffness:260 }}
          style={{ color:`${GOLD}0.65)`, fontSize:11, marginBottom:16 }}>
          ✦
        </motion.div>

        {/* Pulsing gold dots */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ delay:3.9 }}
          style={{ display:"flex", justifyContent:"center", gap:8 }}>
          {[0, 0.22, 0.44].map((d,i) => (
            <motion.span key={i}
              animate={{ opacity:[0.18, 1, 0.18] }}
              transition={{ repeat:Infinity, duration:1.4, delay:d, ease:"easeInOut" }}
              style={{ display:"block", width:4, height:4, borderRadius:"50%",
                background:`${GOLD}0.55)` }} />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

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
              background: `linear-gradient(160deg, hsl(${345 + p.hue}, 60%, ${44 + p.hue * 0.3}%), hsl(${348 + p.hue}, 55%, 34%))`,
              borderRadius: "60% 40% 55% 45% / 70% 45% 55% 30%",
              boxShadow: `inset 0 1px 2px rgba(255,255,255,0.25)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function launchConfetti() {
  const colors = ["#722F37", "#D4AF37", "#FAF8F5", "#8E3D47", "#B8920A", "#ffffff"];

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

type TimelineItem = {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
  image: string;
  objectPosition?: string;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  dateISO: string;
  time?: string;
  venue?: string;
  address?: string;
  note?: string;
  description: string;
  accentBg: string;
  accentBorder: string;
  Icon?: React.ComponentType<{ className?: string }>;
};

const incomingEvents: EventItem[] = [
  {
    id: "ceremony",
    title: "Ceremony",
    date: "Saturday, August 22, 2026",
    dateISO: "2026-08-22",
    time: "1:00 PM – 3:00 PM",
    venue: "Unity of the Triangle Church",
    address: "5570 Munford Rd, Raleigh, NC 27612",
    note: "Pictures will be taken at the reception venue immediately after.",
    description: "1:00 PM – 3:00 PM · Unity of the Triangle Church · 5570 Munford Rd, Raleigh, NC 27612",
    accentBg: "bg-rose-400",
    accentBorder: "border-rose-400",
    Icon: Church,
  },
  {
    id: "reception",
    title: "Reception",
    date: "Saturday, August 22, 2026",
    dateISO: "2026-08-22",
    time: "5:00 PM – 1:00 AM",
    venue: "Pine Hill Pavilion",
    address: "375 Moores Pond Rd, Youngsville, NC 27596",
    description: "5:00 PM – 1:00 AM · Pine Hill Pavilion · 375 Moores Pond Rd, Youngsville, NC 27596",
    accentBg: "bg-teal-accent",
    accentBorder: "border-teal-accent",
    Icon: Wine,
  },
];

type Seat = { id: string; table: string; seat: string };

const wedding = {
  couple: { bride: "Grace", groom: "Noelvie" },
  dateLabel: "Saturday • 22 August 2026",
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

const timelineItems: TimelineItem[] = [
  { id: "meet", dateLabel: "2015", title: "A friendship begins", description: "Their journey began as a simple friendship — but it was truly the answer to a whispered prayer from both Grace and Noelvie.", image: "/images/story-1.jpg", objectPosition: "50% 20%" },
  { id: "first-date", dateLabel: "First Date", title: "The Chinese buffet", description: "On their first date, while driving to the restaurant, Grace gently wiped Noelvie's nose with his bare hands when he realized there were no tissues in the car. That simple yet caring gesture instantly melted Noelvie's heart and revealed the warmth and kindness that defined Grace's character.", image: "/images/story-2.jpg" },
  { id: "proposal", dateLabel: "2017", title: "The engagement", description: "After two beautiful years of growing together, Grace asked Noelvie to be his fiancée at a traditional engagement filled with family and friends.", image: "/images/story-3.jpg" },
  { id: "wedding", dateLabel: "2026", title: "Wedding day", description: "Now, after years of knowing, growing, laughing, praying, and loving deeply — they are ready to celebrate with family and friends.", image: "/images/couple-hero-3.jpg" },
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
      const target = new Date("2026-08-22T13:00:00");
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
    if (!savedName) { router.push("/rsvp"); return; }
    // Show the page immediately — the guest data loads in the background
    setInviteeName(savedName);
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

  function openDirections(address: string) {
    const encoded = encodeURIComponent(address);
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      window.location.href = `maps://maps.apple.com/?daddr=${encoded}`;
    } else if (/Android/.test(ua)) {
      window.location.href = `geo:0,0?q=${encoded}`;
    } else {
      window.open(`https://maps.google.com/?q=${encoded}`, "_blank");
    }
  }

  function handleGetDirections(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    openDirections(wedding.venue.address);
  }

  function handleSaveToCalendar() {
    const title = `Wedding: ${wedding.couple.bride} & ${wedding.couple.groom}`;
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=20260822T130000/20260822T010000&details=${encodeURIComponent("Join us at " + wedding.venue.name)}&location=${encodeURIComponent(wedding.venue.address)}`;
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
    return <WeddingLoader />;
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
            initial={{ opacity: 0.15, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-mint flex flex-col"
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-5 sm:px-10 py-4 border-b border-white/15">
              <div className="text-center">
                <p className="font-display text-lg tracking-[0.3em] text-white/90 font-light">G · N</p>
                <p className="text-[8px] tracking-[0.35em] uppercase text-white/50 mt-0.5">Grace &amp; Noelvie</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-white/50 hover:text-white/90 transition-colors" aria-label="Close menu">
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
                          className="group flex items-center gap-4 py-3 border-b border-white/12 hover:border-[#D4AF37] transition-colors"
                        >
                          <span className="text-[8px] text-white/40 font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-display text-2xl sm:text-3xl text-white/90 font-light group-hover:text-[#D4AF37] transition-colors">{link.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => link.id && scrollTo(link.id)}
                          className="group w-full flex items-center gap-4 py-3 border-b border-white/12 hover:border-[#D4AF37] transition-colors text-left"
                        >
                          <span className="text-[8px] text-white/40 font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-display text-2xl sm:text-3xl text-white/90 font-light group-hover:text-[#D4AF37] transition-colors">{link.label}</span>
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-4 py-3 border-b border-white/8 opacity-30 cursor-not-allowed select-none">
                        <span className="text-[8px] text-white/40 font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-display text-2xl sm:text-3xl text-white/90 font-light">{link.label}</span>
                        <span className="ml-auto text-[8px] tracking-[0.25em] uppercase text-white/40">Soon</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </nav>

            <div className="px-8 sm:px-16 py-8 border-t border-white/15">
              <p className="text-[8px] tracking-[0.35em] uppercase text-white/50">{wedding.dateLabel} · {wedding.venue.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative flex flex-col min-h-[100dvh] border-b border-dark-teal/10">
        <FloatingPetals />

        {/* ── Navbar ── */}
        <header className="relative z-[2] flex items-center justify-between px-6 sm:px-10 py-5 border-b border-dark-teal/8">
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] group p-1" aria-label="Open menu">
            <span className="block h-px w-6 bg-dark-teal/40 group-hover:bg-teal-accent group-hover:w-7 transition-all duration-300" />
            <span className="block h-px w-4 bg-dark-teal/40 group-hover:bg-teal-accent group-hover:w-7 transition-all duration-300" />
            <span className="block h-px w-6 bg-dark-teal/40 group-hover:bg-teal-accent group-hover:w-7 transition-all duration-300" />
          </button>

          {/* Monogram */}
          <div className="text-center">
            <p className="font-display text-base sm:text-lg tracking-[0.35em] text-dark-teal font-light leading-none">G · N</p>
            <p className="text-[7px] tracking-[0.4em] uppercase text-teal-muted mt-1">Grace &amp; Noelvie</p>
          </div>

          {/* RSVP pill */}
          <button onClick={() => scrollTo("rsvp-section")}
            className="text-[8px] sm:text-[9px] tracking-[0.28em] uppercase text-white px-4 sm:px-5 py-2 sm:py-2.5 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #722F37, #8E3D47)" }}>
            RSVP
          </button>
        </header>

        {/* ── Hero content ── */}
        <div className="relative z-[2] flex-1 flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-12">
          <div className="max-w-5xl mx-auto w-full">

            {/* ─── DESKTOP: 3-column grid ─────────────────────────────── */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:items-center lg:gap-10 xl:gap-12">

              {/* Left — headline */}
              <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
                className="flex flex-col items-end text-right">
                <p className="text-[10px] tracking-[0.55em] uppercase text-teal-muted mb-5">Join us to celebrate</p>
                <div className="relative w-full">
                  <h1 className="font-wedding text-[5rem] xl:text-[6rem] leading-[1.45] burgundy-gold-headline">
                    We&apos;re<br />getting<br />married
                  </h1>
                  {CONFETTI_SCATTER.map((p, i) => (
                    <span key={i} aria-hidden="true" className="confetti-piece"
                      style={{ top: p.top, left: p.left, width: p.w, height: p.h,
                        background: p.color, ["--r" as string]: `${p.r}deg`, animationDelay: `${p.delay}s` }} />
                  ))}
                </div>
                <div className="mt-7 flex items-center gap-3 justify-end w-full">
                  <div className="h-px flex-1 bg-dark-teal/10" />
                  <span style={{ color: "rgba(184,146,10,0.6)", fontSize: "9px" }}>✦</span>
                </div>
                <p className="mt-4 text-[11px] tracking-[0.28em] uppercase text-teal-muted leading-[2] max-w-[230px]">
                  &ldquo;What God has joined together,<br />let no one separate.&rdquo;
                  <span className="block mt-1.5 text-teal-muted/60 not-uppercase">— Mark 10:9</span>
                </p>
              </motion.div>

              {/* Center — photo */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
                className="flex justify-center">
                <div className="relative w-[23rem] xl:w-[27rem] rotate-[1.5deg]
                                shadow-[0_40px_80px_-12px_rgba(0,0,0,0.45)]
                                overflow-hidden rounded-2xl
                                ring-1 ring-dark-teal/10">
                  <CoupleImg src="/images/couple-hero-2.jpg" alt="Grace &amp; Noelvie"
                    className="w-full aspect-[3/4] object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>

              {/* Right — event details */}
              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
                className="flex flex-col items-start text-left pl-4">
                <p className="text-[10px] tracking-[0.55em] uppercase text-teal-muted mb-5">The Event</p>
                <p className="font-display text-5xl xl:text-6xl font-light text-dark-teal leading-[1.1] tracking-tight">
                  AUG 22,<br />2026
                </p>
                <div className="my-6 h-px w-12 bg-dark-teal/12" />
                <div className="space-y-2.5">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-dark-teal/70 font-semibold">{wedding.venue.name}</p>
                  <p className="text-sm text-teal-muted leading-relaxed max-w-[190px]">{wedding.venue.address}</p>
                  <p className="text-sm text-teal-muted">{wedding.timeLabel}</p>
                </div>
                <div className="my-6 h-px w-12 bg-dark-teal/12" />
                <div className="flex flex-col gap-3.5">
                  <a href={wedding.venue.mapUrl} onClick={handleGetDirections} rel="noreferrer"
                    className="text-[11px] tracking-[0.22em] uppercase text-floral-crimson border-b border-floral-crimson/30 pb-px hover:border-floral-crimson transition-colors inline-block">
                    Get Directions →
                  </a>
                  <button onClick={handleSaveToCalendar}
                    className="text-[11px] tracking-[0.22em] uppercase text-teal-muted border-b border-teal-muted/25 pb-px hover:text-floral-crimson transition-colors text-left">
                    Save to Calendar →
                  </button>
                </div>
              </motion.div>
            </div>

            {/* ─── MOBILE: stacked, no squeezing ──────────────────────── */}
            <div className="lg:hidden flex flex-col gap-0">

              {/* 1. Tagline + headline */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="text-center pb-8 border-b border-dark-teal/8">
                <p className="text-[10px] tracking-[0.55em] uppercase text-teal-muted mb-5">Join us to celebrate</p>
                <div className="relative w-full">
                  <h1 className="font-wedding text-[4.4rem] sm:text-[5.5rem] leading-[1.45] burgundy-gold-headline">
                    We&apos;re<br />getting<br />married
                  </h1>
                  {CONFETTI_SCATTER.map((p, i) => (
                    <span key={i} aria-hidden="true" className="confetti-piece"
                      style={{ top: p.top, left: p.left, width: p.w, height: p.h,
                        background: p.color, ["--r" as string]: `${p.r}deg`, animationDelay: `${p.delay}s` }} />
                  ))}
                </div>
                <p className="mt-6 text-[11px] tracking-[0.28em] uppercase text-teal-muted leading-[2] max-w-[260px] mx-auto">
                  &ldquo;What God has joined together, let no one separate.&rdquo;
                  <span className="block mt-1.5 text-teal-muted/60">— Mark 10:9</span>
                </p>
              </motion.div>

              {/* 2. Photo */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
                className="flex justify-center py-8 border-b border-dark-teal/8">
                <div className="relative w-[270px] sm:w-[320px] overflow-hidden rounded-2xl
                                shadow-[0_24px_56px_-12px_rgba(0,0,0,0.3)]
                                ring-1 ring-dark-teal/10">
                  <CoupleImg src="/images/couple-hero-2.jpg" alt="Grace &amp; Noelvie"
                    className="w-full aspect-[3/4] object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>

              {/* 3. Event summary — compact horizontal */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
                className="py-8 text-center">
                <p className="text-[11px] tracking-[0.55em] uppercase text-teal-muted mb-5">The Event</p>
                <p className="font-display text-4xl sm:text-5xl font-light text-dark-teal tracking-tight mb-4">
                  Saturday · August 22, 2026
                </p>
                <p className="text-sm tracking-[0.28em] uppercase text-dark-teal/60 mb-1">{wedding.venue.name}</p>
                <p className="text-sm text-teal-muted mb-5">{wedding.venue.address}</p>
                <div className="flex items-center justify-center gap-5">
                  <a href={wedding.venue.mapUrl} onClick={handleGetDirections} rel="noreferrer"
                    className="text-[11px] tracking-[0.22em] uppercase text-floral-crimson border-b border-floral-crimson/30 pb-px hover:border-floral-crimson transition-colors">
                    Get Directions →
                  </a>
                  <span className="text-dark-teal/15 text-xs">|</span>
                  <button onClick={handleSaveToCalendar}
                    className="text-[11px] tracking-[0.22em] uppercase text-teal-muted border-b border-teal-muted/25 pb-px hover:text-floral-crimson transition-colors">
                    Save to Calendar →
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* ── Bottom strip: nav + countdown ── */}
        <div className="relative z-[2] border-t border-dark-teal/8 px-6 sm:px-10 py-5 sm:py-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Section nav */}
            <nav className="flex items-center gap-4 sm:gap-6">
              {[
                { label: "Our Story", id: "story" },
                { label: "Celebrations", id: "events" },
                { label: "Venue", id: "venue-section" },
                { label: "RSVP", id: "rsvp-section" },
              ].map((link, i, arr) => (
                <Fragment key={link.id}>
                  <button onClick={() => scrollTo(link.id)}
                    className="text-[10px] tracking-[0.3em] uppercase text-teal-muted hover:text-floral-crimson transition-colors whitespace-nowrap">
                    {link.label}
                  </button>
                  {i < arr.length - 1 && <span className="text-dark-teal/15 text-[8px] select-none hidden sm:inline">·</span>}
                </Fragment>
              ))}
            </nav>

            {/* Countdown */}
            {countdown.ready && (
              <div className="flex items-end gap-3 sm:gap-4">
                {[
                  { value: countdown.days,    label: "Days" },
                  { value: countdown.hours,   label: "Hrs"  },
                  { value: countdown.minutes, label: "Min"  },
                  { value: countdown.seconds, label: "Sec"  },
                ].map((unit, i, arr) => (
                  <Fragment key={unit.label}>
                    <div className="text-center">
                      <span className="font-display text-2xl sm:text-3xl font-light text-dark-teal tabular-nums leading-none block">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                      <p className="text-[8px] sm:text-[9px] tracking-[0.35em] uppercase text-teal-muted mt-1">{unit.label}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="font-display text-xl sm:text-2xl text-dark-teal/20 mb-4 leading-none select-none">:</span>
                    )}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          OUR STORY
      ══════════════════════════════════ */}
      <section id="story" className="mx-auto max-w-4xl px-5 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[8px] tracking-[0.4em] uppercase text-teal-muted mb-3">About us</p>
          <h2 className="font-display text-3xl sm:text-5xl text-dark-teal font-light tracking-tight">Our Story</h2>
          <div className="mt-4 h-px w-12 bg-dark-teal/15 mx-auto" />
        </div>

        <div className="space-y-14 sm:space-y-20">
          {timelineItems.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0.15, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
              className={`flex flex-col ${index % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"} gap-8 sm:gap-12 items-center`}>
              <div className="relative w-full sm:w-1/2 overflow-hidden group rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] transition-shadow duration-500 hover:shadow-[0_16px_48px_-8px_rgba(114,47,55,0.28)]">
                <CoupleImg src={item.image} alt={item.title} className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-[1.03] group-active:scale-[1.03] transition-transform duration-700"
                  imgStyle={item.objectPosition ? { objectPosition: item.objectPosition } : undefined} />
              </div>
              <div className={`w-full sm:w-1/2 ${index % 2 === 1 ? "sm:text-right" : ""}`}>
                <h3 className="text-2xl sm:text-3xl font-display font-light text-dark-teal">{item.title}</h3>
                <div className={`mt-3 h-px w-8 bg-dark-teal/15 ${index % 2 === 1 ? "ml-auto" : ""}`} />
                <p className="mt-4 text-teal-muted leading-relaxed text-sm sm:text-base">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          CELEBRATIONS — Creative 2×2 grid
      ══════════════════════════════════ */}
      <section id="events" className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #4A1520 0%, #722F37 30%, #8E3D4E 55%, #7A2D3E 78%, #4A1520 100%)" }}>

        {/* Subtle noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "180px 180px" }} />

        <div className="relative z-10 px-5 sm:px-10 py-14 sm:py-20">

          {/* ── Section header ── */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-10 sm:w-24" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.85))" }} />
              <span className="text-[8px] tracking-[0.6em] uppercase text-white/70">
                The Wedding Programme
              </span>
              <div className="h-px w-10 sm:w-24" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.85), transparent)" }} />
            </div>
            <p className="font-wedding text-5xl sm:text-7xl leading-none"
              style={{ color: "#C84060", textShadow: "0 0 40px rgba(200,64,96,0.35)" }}>
              Grace &amp; Noelvie
            </p>
            <p className="mt-3 text-[9px] tracking-[0.42em] uppercase text-white/60">
              Saturday · August 22, 2026 · Youngsville, NC
            </p>
          </div>

          {/* ── Two stationery cards ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-6 max-w-3xl mx-auto">

            {/* Ceremony — tilted left */}
            {(() => {
              const event = incomingEvents[0];
              const days = daysUntil(event.dateISO);
              const isPast = days < 0;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0.15, y: 30, rotate: -2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="w-full sm:w-[300px] flex-shrink-0"
                >
                  <div className="rounded-2xl overflow-hidden bg-[#FEFAF6] shadow-[0_28px_72px_-8px_rgba(30,8,14,0.65),0_4px_16px_-4px_rgba(0,0,0,0.25)]"
                    style={{ border: "1px solid rgba(212,175,55,0.45)" }}>
                    {/* Gold top strip */}
                    <div className="h-[3px]" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.3), rgba(212,175,55,1), rgba(212,175,55,0.3))" }} />
                    <div className="px-7 pt-7 pb-8 text-center">
                      {/* Watermark numeral */}
                      <p className="font-display text-[5rem] leading-none font-bold select-none -mb-4" style={{ color: "rgba(114,47,55,0.07)" }}>I</p>
                      {/* Event name */}
                      <p className="font-wedding text-4xl text-floral-crimson mb-1 drop-shadow-sm">{event.title}</p>
                      {/* Gold ornament */}
                      <div className="flex items-center justify-center gap-2 my-4">
                        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.7))" }} />
                        <span style={{ color: "rgba(212,175,55,0.95)", fontSize: "11px" }}>✦</span>
                        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.7), transparent)" }} />
                      </div>
                      {/* Time */}
                      {event.time && (
                        <p className="font-display text-2xl sm:text-3xl font-light text-dark-teal tracking-tight mb-5">{event.time}</p>
                      )}
                      {/* Venue */}
                      <div className="space-y-1.5 mb-5">
                        {event.venue && <p className="text-sm font-semibold text-dark-teal tracking-wide">{event.venue}</p>}
                        {event.address && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                            onClick={(e) => { e.preventDefault(); openDirections(event.address!); }}
                            rel="noreferrer"
                            className="text-[10px] text-teal-muted hover:text-floral-crimson transition-colors flex items-center justify-center gap-1"
                          >
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {event.address}
                          </a>
                        )}
                      </div>
                      {/* Note */}
                      {event.note && (
                        <p className="text-[10px] italic text-teal-muted border-t pt-4 leading-relaxed" style={{ borderColor: "rgba(212,175,55,0.3)" }}>
                          {event.note}
                        </p>
                      )}
                      {/* Status pill */}
                      {!isPast && (
                        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] tracking-[0.3em] uppercase"
                          style={{ background: "rgba(114,47,55,0.07)", color: "#722F37", border: "1px solid rgba(114,47,55,0.18)" }}>
                          {daysUntil(event.dateISO)}d away
                        </div>
                      )}
                    </div>
                    {/* Gold bottom strip */}
                    <div className="h-[3px]" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.3), rgba(212,175,55,1), rgba(212,175,55,0.3))" }} />
                  </div>
                </motion.div>
              );
            })()}

            {/* Centre ornament — hidden on mobile */}
            <div className="hidden sm:flex flex-col items-center gap-3 flex-shrink-0">
              <div className="w-px h-16" style={{ background: "rgba(200,160,40,0.5)" }} />
              <span style={{ color: "rgba(200,160,40,0.9)", fontSize: "18px" }}>✦</span>
              <div className="w-px h-16" style={{ background: "rgba(200,160,40,0.5)" }} />
            </div>

            {/* Reception — tilted right */}
            {(() => {
              const event = incomingEvents[1];
              const days = daysUntil(event.dateISO);
              const isPast = days < 0;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0.15, y: 30, rotate: 2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 1.5 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
                  className="w-full sm:w-[300px] flex-shrink-0"
                >
                  <div className="rounded-2xl overflow-hidden bg-[#FEFAF6] shadow-[0_28px_72px_-8px_rgba(30,8,14,0.65),0_4px_16px_-4px_rgba(0,0,0,0.25)]"
                    style={{ border: "1px solid rgba(212,175,55,0.45)" }}>
                    <div className="h-[3px]" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.3), rgba(212,175,55,1), rgba(212,175,55,0.3))" }} />
                    <div className="px-7 pt-7 pb-8 text-center">
                      <p className="font-display text-[5rem] leading-none font-bold select-none -mb-4" style={{ color: "rgba(114,47,55,0.07)" }}>II</p>
                      <p className="font-wedding text-4xl text-floral-crimson mb-1 drop-shadow-sm">{event.title}</p>
                      <div className="flex items-center justify-center gap-2 my-4">
                        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.7))" }} />
                        <span style={{ color: "rgba(212,175,55,0.95)", fontSize: "11px" }}>✦</span>
                        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.7), transparent)" }} />
                      </div>
                      {event.time && (
                        <p className="font-display text-2xl sm:text-3xl font-light text-dark-teal tracking-tight mb-5">{event.time}</p>
                      )}
                      <div className="space-y-1.5 mb-5">
                        {event.venue && <p className="text-sm font-semibold text-dark-teal tracking-wide">{event.venue}</p>}
                        {event.address && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                            onClick={(e) => { e.preventDefault(); openDirections(event.address!); }}
                            rel="noreferrer"
                            className="text-[10px] text-teal-muted hover:text-floral-crimson transition-colors flex items-center justify-center gap-1"
                          >
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {event.address}
                          </a>
                        )}
                      </div>
                      {!isPast && (
                        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] tracking-[0.3em] uppercase"
                          style={{ background: "rgba(114,47,55,0.07)", color: "#722F37", border: "1px solid rgba(114,47,55,0.18)" }}>
                          {daysUntil(event.dateISO)}d away
                        </div>
                      )}
                    </div>
                    <div className="h-[3px]" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.3), rgba(212,175,55,1), rgba(212,175,55,0.3))" }} />
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {/* ── Bottom ornament ── */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ background: "rgba(200,160,40,0.55)" }} />
            <span style={{ color: "rgba(200,160,40,0.85)", fontSize: "14px" }}>✦</span>
            <div className="h-px w-16" style={{ background: "rgba(200,160,40,0.55)" }} />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════
          VENUE + RSVP
      ══════════════════════════════════ */}
      <section id="venue-section" className="border-t border-dark-teal/10 px-5 sm:px-10 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto grid gap-12 lg:grid-cols-2">

          {/* Venue */}
          <motion.div initial={{ opacity: 0.15, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-[8px] tracking-[0.4em] uppercase text-teal-muted mb-3">Where we tie the knot</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-dark-teal tracking-tight mb-2">The Venue</h2>
            <div className="mb-6 h-px w-10 bg-dark-teal/15" />
            <p className="text-teal-muted mb-8 text-sm sm:text-base leading-relaxed">
              We&apos;ve chosen a place that feels like home. Join us at{" "}
              <span className="text-dark-teal">{wedding.venue.name}</span> for an unforgettable evening.
            </p>

            <div className="bg-white border border-dark-teal/10 rounded-2xl p-6 sm:p-8 mb-4">
              <div className="flex items-start gap-4">
                <div className="bg-teal-accent/10 p-2.5 text-floral-crimson flex-shrink-0 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-dark-teal">{wedding.venue.name}</h4>
                  <p className="mt-2 text-sm text-teal-muted leading-relaxed">{wedding.venue.address}</p>
                  <p className="mt-1.5 text-sm text-teal-muted">
                    Call/Text:{" "}
                    <a href={`tel:${wedding.venue.phone}`} className="hover:text-floral-crimson transition-colors">{wedding.venue.phone}</a>
                  </p>
                  <p className="mt-0.5 text-sm text-teal-muted">
                    Email:{" "}
                    <a href={`mailto:${wedding.venue.email}`} className="hover:text-floral-crimson transition-colors">{wedding.venue.email}</a>
                  </p>
                  <a href={wedding.venue.mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block text-[9px] tracking-[0.2em] uppercase text-floral-crimson border-b border-teal-accent/40 pb-px hover:border-teal-accent transition-colors">
                    Get Directions →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RSVP */}
          <motion.div id="rsvp-section" initial={{ opacity: 0.15, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="flex items-start lg:items-center">
            <div className="bg-white border border-dark-teal/10 rounded-2xl p-6 sm:p-8 w-full">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-teal-muted mb-1">Confirm attendance</p>
                  <h2 className="font-display text-3xl font-light text-dark-teal tracking-tight">RSVP</h2>
                </div>
                <span className="text-[9px] tracking-[0.2em] uppercase text-floral-crimson border border-teal-accent/30 px-3 py-1.5">
                  {rsvps.filter((r) => r.status === "yes").length} Attending
                </span>
              </div>
              <div className="mb-6 h-px bg-dark-teal/10" />

              {myRsvp ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-teal-accent/10 flex items-center justify-center mx-auto mb-4 rounded-2xl">
                    <Heart className="h-7 w-7 text-floral-crimson" />
                  </div>
                  <h3 className="text-lg font-medium text-dark-teal mb-2">You&apos;re all set, {myRsvp.name}!</h3>
                  <p className="text-sm text-teal-muted leading-relaxed">
                    {myRsvp.status === "yes" ? "We're excited to celebrate with you!" : myRsvp.status === "maybe" ? "We hope you can make it!" : "We'll miss you at the celebration."}
                  </p>
                  {myRsvp.seatId && assignedSeatForName && (
                    <div className="mt-5 p-4 bg-teal-accent/5 border border-teal-accent/15 rounded-xl">
                      <p className="text-xs text-teal-muted mb-1">Your seat assignment</p>
                      <p className="text-base font-medium text-floral-crimson">{formatSeat(assignedSeatForName)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Full Name(s) *</label>
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
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Phone *</label>
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
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Email (optional)</label>
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
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Will you attend? *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setInviteeStatus("yes")}
                        data-testid="button-rsvp-yes"
                        className={`py-3.5 rounded-xl text-sm font-medium transition-all border-2 ${inviteeStatus === "yes" ? "bg-teal-accent/10 border-teal-accent text-floral-crimson" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
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
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Additional guests you&apos;re bringing</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setInviteePlusOnes(Math.max(0, inviteePlusOnes - 1))} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50">−</button>
                      <span className="flex-1 text-center font-semibold text-base">{inviteePlusOnes === 0 ? "None" : `+${inviteePlusOnes}`}</span>
                      <button type="button" onClick={() => setInviteePlusOnes(Math.min(3, inviteePlusOnes + 1))} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50">+</button>
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
          <p className="font-wedding text-4xl sm:text-5xl text-floral-crimson">{wedding.couple.bride} &amp; {wedding.couple.groom}</p>
          <p className="mt-2 text-[9px] tracking-[0.35em] uppercase text-teal-muted">{wedding.dateLabel}</p>
          <div className="mt-6 h-px w-12 bg-dark-teal/10 mx-auto" />
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={handleCopyLink} data-testid="button-copy-link" className="flex items-center gap-2 text-[9px] tracking-[0.22em] uppercase text-teal-muted border border-teal-muted/20 px-4 py-2 hover:border-teal-accent hover:text-floral-crimson transition-colors">
              <Copy className="h-3.5 w-3.5" />
              Copy Invite Link
            </button>
          </div>
          <p className="mt-8 text-[9px] tracking-[0.2em] uppercase text-teal-muted flex items-center justify-center gap-1.5">
            Made with <Heart className="h-3 w-3 text-floral-crimson fill-current" /> for their day ·{" "}
            <a href="https://rajil.me" target="_blank" rel="noreferrer" className="hover:text-floral-crimson transition-colors underline underline-offset-2">Rajil Vembe</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
