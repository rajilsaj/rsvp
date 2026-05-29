"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/lib/cookies";
import { RsvpFloral } from "@/components/RsvpFloral";
import confetti from "canvas-confetti";

function launchConfetti() {
  const colors = ["#722F37", "#D4AF37", "#FAF8F5", "#8E3D47", "#B8920A", "#ffffff"];
  confetti({ particleCount: 70, angle: 60, spread: 65, origin: { x: 0, y: 0.75 }, colors, gravity: 1.1 });
  confetti({ particleCount: 70, angle: 120, spread: 65, origin: { x: 1, y: 0.75 }, colors, gravity: 1.1 });
  setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { x: 0.5, y: 0.6 }, colors, shapes: ["circle"], scalar: 0.8 }), 250);
}

export default function RsvpPage() {
  const router = useRouter();
  const [names, setNames] = useState("");
  const [phone, setPhone] = useState(""); // digits only, e.g. "9195550100"
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [plusOnes, setPlusOnes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [existingGuestName, setExistingGuestName] = useState("");
  const [checkingName, setCheckingName] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If already RSVP'd (checked via cookie), redirect to home
  useEffect(() => {
    const savedName = getCookie("wedding_rsvp_name");
    if (savedName) {
      router.push("/");
    }
  }, [router]);

  // Always returns the full 14-char mask: (XXX) XXX-XXXX with _ for unfilled slots
  function buildPhoneDisplay(digits: string): string {
    return (
      "(" +
      (digits[0] ?? "_") + (digits[1] ?? "_") + (digits[2] ?? "_") +
      ") " +
      (digits[3] ?? "_") + (digits[4] ?? "_") + (digits[5] ?? "_") +
      "-" +
      (digits[6] ?? "_") + (digits[7] ?? "_") + (digits[8] ?? "_") + (digits[9] ?? "_")
    );
  }

  // Maps digit count → cursor position in the 14-char mask string
  function phoneCursorPos(n: number): number {
    if (n < 3) return 1 + n;
    if (n === 3) return 6; // jump past ") "
    if (n < 6) return 6 + (n - 3);
    if (n === 6) return 10; // jump past "-"
    return 10 + (n - 6);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    const pos = phoneCursorPos(digits.length);
    requestAnimationFrame(() => {
      phoneRef.current?.setSelectionRange(pos, pos);
    });
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Backspace" || phone.length === 0) return;
    const cursorAt = phoneRef.current?.selectionStart ?? 0;
    const charBefore = buildPhoneDisplay(phone)[cursorAt - 1];
    // If cursor is right after a separator, delete the last real digit instead
    if (charBefore && /[() \-_]/.test(charBefore)) {
      e.preventDefault();
      const newDigits = phone.slice(0, -1);
      setPhone(newDigits);
      const pos = phoneCursorPos(newDigits.length);
      requestAnimationFrame(() => {
        phoneRef.current?.setSelectionRange(pos, pos);
      });
    }
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!names.trim()) errs.names = "Full name is required.";

    if (!phone) {
      errs.phone = "Phone number is required.";
    } else if (phone.length < 10) {
      errs.phone = "Enter a valid 10-digit US phone number.";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!attending && !existingGuestName) {
      errs.attending = "Please let us know if you'll attend.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function runNameCheck(value: string) {
    if (!value.trim()) { setCheckingName(false); return; }
    setCheckingName(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: value.trim(),
          phone: "CHECK_ONLY",
          attending: "yes",
          plusOnes: 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          setExistingGuestName(data.names || value.trim());
          setCookie("wedding_rsvp_name", data.names || value.trim());
          setCookie("wedding_rsvp_phone", data.phone || "");
          setSubmitted(true);
          setTimeout(() => router.push("/"), 2000);
        }
      }
    } catch {
      // Background check failed, allow normal flow
    } finally {
      setCheckingName(false);
    }
  }

  function handleNamesChange(value: string) {
    setNames(value);
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    if (!value.trim()) { setCheckingName(false); return; }
    setCheckingName(true);
    nameTimerRef.current = setTimeout(() => runNameCheck(value), 600);
  }

  function handleNameBlur() {
    setTouched(prev => ({ ...prev, names: true }));
    if (nameTimerRef.current) { clearTimeout(nameTimerRef.current); nameTimerRef.current = null; }
    runNameCheck(names);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ names: true, phone: true, email: true, attending: true });
    if (!validate()) return;

    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: names.trim(),
          phone: buildPhoneDisplay(phone), // submits formatted "(XXX) XXX-XXXX"
          email: email.trim(),
          attending,
          plusOnes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Failed to submit");
      }

      const data = await res.json();
      setCookie("wedding_rsvp_name", data.names || names.trim());
      setCookie("wedding_rsvp_phone", data.phone || buildPhoneDisplay(phone));
      setSubmitted(true);
      if (attending === "yes") launchConfetti();
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const phoneDisplay = buildPhoneDisplay(phone);

  if (submitted) {
    return (
      <RsvpFloral>
        <div className="w-full max-w-md rounded-2xl p-8 sm:p-10 text-center bg-white shadow-[0_32px_80px_-8px_rgba(30,8,14,0.7),0_4px_20px_-4px_rgba(0,0,0,0.3)]" style={{ border: "1px solid rgba(212,175,55,0.35)" }}>
          <div className="text-5xl mb-4">💌</div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-dark-teal">
            {existingGuestName
              ? `Welcome back, ${existingGuestName}!`
              : attending === "yes" ? "See you there!" : "We'll miss you!"}
          </h2>
          <p className="text-sm mb-6 text-teal-muted leading-relaxed">
            {existingGuestName
              ? "You're already registered. Redirecting you to the website..."
              : "Thank you for your RSVP. Redirecting you to the website..."}
          </p>
          <div className="animate-pulse text-xs uppercase tracking-widest text-floral-crimson">
            Loading...
          </div>
        </div>
      </RsvpFloral>
    );
  }

  return (
    <RsvpFloral>
      {/* ── Single invitation card ── */}
      <div className="w-full max-w-md rounded-3xl overflow-hidden bg-white shadow-[0_32px_80px_-8px_rgba(30,8,14,0.7),0_4px_20px_-4px_rgba(0,0,0,0.3)]" style={{ border: "1px solid rgba(212,175,55,0.4)" }}>

        {/* Photo header — top of the card */}
        <div className="relative w-full aspect-[4/3]">
          <Image
            src="/images/couple-rsvp.jpg"
            alt="Grace & Noelvie"
            fill
            priority
            className="object-cover object-top"
            sizes="448px"
          />
          {/* Smooth photo fade into card body */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>

        {/* Card body */}
        <div className="px-6 pb-8 -mt-4">

          {/* Title */}
          <div className="text-center mb-6 text-dark-teal">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2 text-teal-muted">You are invited to</p>
            <h1 className="text-4xl sm:text-5xl mb-1 font-wedding">Grace &amp; Noelvie</h1>
            <h1 className="text-4xl sm:text-5xl mb-2 font-wedding">Wedding</h1>
            <p className="text-xs text-teal-muted tracking-wide">Saturday, August 22, 2026 · Youngsville NC</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Full Name(s) *</label>
            <div className="relative">
              <input
                type="text"
                value={names}
                onChange={(e) => handleNamesChange(e.target.value)}
                onBlur={handleNameBlur}
                className={`w-full rounded-xl px-4 py-3 text-base text-gray-700 bg-white border outline-none focus:border-teal-accent transition-colors ${touched.names && errors.names ? "border-error" : "border-gray-200"} ${checkingName ? "pr-10" : ""}`}
                placeholder="Your full name"
              />
              {checkingName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-4 h-4 rounded-full border-2 border-teal-accent border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            {touched.names && errors.names && <p className="text-xs mt-1 text-error">{errors.names}</p>}
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Phone *</label>
            {/* Ghost overlay: mask stays visible as user types */}
            <div className={`relative w-full rounded-xl bg-white border transition-colors focus-within:border-teal-accent ${touched.phone && errors.phone ? "border-error" : "border-gray-200"}`}>
              {/* Ghost mask layer */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center px-4 text-base pointer-events-none select-none"
              >
                {Array.from(phoneDisplay).map((ch, i) => (
                  <span
                    key={i}
                    className={
                      /\d/.test(ch) ? "text-gray-700" :
                      ch === "_" ? "text-gray-300" :
                      "text-gray-400"
                    }
                  >
                    {ch}
                  </span>
                ))}
              </div>
              {/* Actual input — text invisible so ghost shows through, caret stays visible */}
              <input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                value={phoneDisplay}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                onFocus={() => {
                  const pos = phoneCursorPos(phone.length);
                  requestAnimationFrame(() => {
                    phoneRef.current?.setSelectionRange(pos, pos);
                  });
                }}
                className="relative w-full rounded-xl px-4 py-3 text-base bg-transparent outline-none text-transparent caret-gray-700"
              />
            </div>
            {touched.phone && errors.phone && <p className="text-xs mt-1 text-error">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-base text-gray-700 bg-white border border-gray-200 outline-none focus:border-teal-accent transition-colors"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Will you attend? *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttending("yes")}
                className={`py-3.5 rounded-xl text-sm font-medium transition-all border-2 ${attending === "yes" ? "bg-teal-accent/10 border-teal-accent text-floral-crimson" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
              >
                ✓ Yes
              </button>
              <button
                type="button"
                onClick={() => setAttending("no")}
                className={`py-3.5 rounded-xl text-sm font-medium transition-all border-2 ${attending === "no" ? "bg-rose-50 border-rose-400 text-rose-600" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
              >
                ✗ No
              </button>
            </div>
            {touched.attending && errors.attending && <p className="text-xs mt-1 text-error">{errors.attending}</p>}
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 text-teal-muted">Additional guests you&apos;re bringing</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50">−</button>
              <span className="flex-1 text-center font-semibold text-base">{plusOnes === 0 ? "None" : `+${plusOnes}`}</span>
              <button type="button" onClick={() => setPlusOnes(Math.min(3, plusOnes + 1))} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50">+</button>
            </div>
          </div>

          {submitError && <p className="text-sm text-center text-error animate-shake">{submitError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white text-base font-semibold bg-teal-accent disabled:opacity-50 transition-all hover:brightness-105 active:scale-[0.98] shadow-md"
          >
            {loading ? "Submitting…" : "Submit RSVP"}
          </button>
        </form>
        </div> {/* card body */}
      </div> {/* invitation card */}
    </RsvpFloral>
  );
}
