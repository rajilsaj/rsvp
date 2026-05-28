"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/lib/cookies";

export default function RsvpPage() {
  const router = useRouter();
  const [names, setNames] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [plusOnes, setPlusOnes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [existingGuestName, setExistingGuestName] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If already RSVP'd (checked via cookie), redirect to home
  useEffect(() => {
    const savedName = getCookie("wedding_rsvp_name");
    if (savedName) {
      router.push("/");
    }
  }, [router]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!names.trim()) errs.names = "Full name is required.";
    
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (digits.length < 10 && phone !== "CHECK_ONLY") {
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

  async function handleNameBlur() {
    setTouched(prev => ({ ...prev, names: true }));
    if (!names.trim()) return;

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: names.trim(),
          phone: "CHECK_ONLY",
          attending: "yes",
          plusOnes: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          setExistingGuestName(data.names || names.trim());
          setCookie("wedding_rsvp_name", data.names || names.trim());
          setCookie("wedding_rsvp_phone", data.phone || "");
          setSubmitted(true);
          setTimeout(() => router.push("/"), 2000);
        }
      }
    } catch (err) {
      // Background check failed, allow normal flow
    }
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
          phone: phone.trim(),
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
      setCookie("wedding_rsvp_phone", data.phone || phone.trim());
      setSubmitted(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mint">
        <div className="w-full max-w-md rounded-2xl p-10 text-center shadow-sm bg-white/85">
          <div className="text-5xl mb-4">💌</div>
          <h2 className="text-2xl font-semibold mb-2 text-dark-teal">
            {existingGuestName 
              ? `Welcome back, ${existingGuestName}!` 
              : attending === "yes" ? "See you there!" : "We'll miss you!"}
          </h2>
          <p className="text-sm mb-6 text-dark-teal/65">
            {existingGuestName 
              ? "You're already registered. Redirecting you to the website..."
              : "Thank you for your RSVP. Redirecting you to the website..."}
          </p>
          <div className="animate-pulse text-xs uppercase tracking-widest text-teal-accent">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mint text-dark-teal">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2 opacity-60">You are invited</p>
          <h1 className="text-5xl mb-2 font-wedding">Grace &amp; Noelvie</h1>
          <p className="text-sm opacity-60">Saturday, June 20, 2026 · Youngsville NC</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl p-6 shadow-sm space-y-4 bg-white/85">
          <h2 className="font-semibold text-base mb-2">RSVP</h2>

          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5 opacity-60">Full Name(s) *</label>
            <input
              type="text"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              onBlur={handleNameBlur}
              className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white border ${touched.names && errors.names ? 'border-error' : 'border-gray-200'}`}
              placeholder="Your full name"
            />
            {touched.names && errors.names && <p className="text-xs mt-1 text-error">{errors.names}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5 opacity-60">Phone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white border ${touched.phone && errors.phone ? 'border-error' : 'border-gray-200'}`}
              placeholder="(919) 555-0100"
            />
            {touched.phone && errors.phone && <p className="text-xs mt-1 text-error">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5 opacity-60">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5 opacity-60">Will you attend? *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttending("yes")}
                className={`py-3 rounded-xl text-sm font-medium transition-all border-2 ${attending === 'yes' ? 'bg-teal-accent/10 border-teal-accent text-teal-accent' : 'border-gray-100 text-gray-500'}`}
              >
                ✓ Yes
              </button>
              <button
                type="button"
                onClick={() => setAttending("no")}
                className={`py-3 rounded-xl text-sm font-medium transition-all border-2 ${attending === 'no' ? 'bg-rose-50 border-rose-400 text-rose-600' : 'border-gray-100 text-gray-500'}`}
              >
                ✗ No
              </button>
            </div>
            {touched.attending && errors.attending && <p className="text-xs mt-1 text-error">{errors.attending}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5 opacity-60">Plus ones</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))} className="w-10 h-10 rounded-xl bg-white border border-gray-200">−</button>
              <span className="flex-1 text-center font-semibold">{plusOnes === 0 ? "None" : `+${plusOnes}`}</span>
              <button type="button" onClick={() => setPlusOnes(Math.min(10, plusOnes + 1))} className="w-10 h-10 rounded-xl bg-white border border-gray-200">+</button>
            </div>
          </div>

          {submitError && <p className="text-sm text-center text-error">{submitError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold bg-teal-accent disabled:opacity-50 transition-opacity"
          >
            {loading ? "Submitting…" : "Submit RSVP"}
          </button>
        </form>
      </div>
    </div>
  );
}
