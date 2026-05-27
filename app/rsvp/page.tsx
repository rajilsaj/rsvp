"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Cookie helpers
function setCookie(name: string, value: string, days: number = 365) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name: string) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const DARK_TEAL = "#1d3d37";
const TEAL = "#3d8b7a";
const MINT_BG = "#c5e0da";
const ERROR_COLOR = "#e11d48";

type Fields = "names" | "phone" | "email" | "attending";

function validateFields(
  names: string,
  phone: string,
  email: string,
  attending: string
): Partial<Record<Fields, string>> {
  const errs: Partial<Record<Fields, string>> = {};

  if (!names.trim()) {
    errs.names = "Full name is required.";
  }

  const digits = phone.replace(/\D/g, "");
  if (!phone.trim()) {
    errs.phone = "Phone number is required.";
  } else if (digits.length < 10) {
    errs.phone = "Enter a valid 10-digit US phone number.";
  }

  if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errs.email = "Enter a valid email address.";
  }

  if (!attending) {
    errs.attending = "Please let us know if you'll attend.";
  }

  return errs;
}

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

  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});

  // If already RSVP'd (checked via cookie), redirect to home
  useEffect(() => {
    const savedName = getCookie("wedding_rsvp_name");
    if (savedName) {
      router.push("/");
    }
  }, [router]);

  function touch(field: Fields) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateFields(names, phone, email, attending);
    setErrors((prev) => ({ ...prev, [field]: errs[field] ?? "" }));
  }

  async function handleNameBlur() {
    touch("names");
    if (!names.trim()) return;

    try {
      // Check if user exists as soon as they finish typing their name
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: names.trim(),
          phone: "CHECK_ONLY", // Special flag for our API to know we're just checking
          attending: "yes",
          plusOnes: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // If the API returns a guest that was already in the sheet (logic we already have)
        // AND it's not a newly created one (we'll check for the existence of an ID or Token)
        if (data.id) {
          setCookie("wedding_rsvp_name", data.names || names.trim());
          setCookie("wedding_rsvp_phone", data.phone || "");
          setSubmitted(true);
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      }
    } catch (err) {
      // Silently fail for the background check to not disturb the user flow
    }
  }

  function inputStyle(field: Fields): React.CSSProperties {
    const hasError = touched[field] && errors[field];
    return {
      border: `1px solid ${hasError ? ERROR_COLOR : "#e5e7eb"}`,
      backgroundColor: "white",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Partial<Record<Fields, boolean>> = {
      names: true, phone: true, email: true, attending: true,
    };
    setTouched(allTouched);

    const errs = validateFields(names, phone, email, attending);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

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
      
      // Save to Cookies
      setCookie("wedding_rsvp_name", data.names || names.trim());
      setCookie("wedding_rsvp_phone", data.phone || phone.trim());
      
      setSubmitted(true);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
      
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: MINT_BG }}>
        <div
          className="w-full max-w-md rounded-2xl p-10 text-center shadow-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
        >
          <div className="text-5xl mb-4">💌</div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: DARK_TEAL }}>
            {attending === "yes" ? "See you there!" : "We'll miss you!"}
          </h2>
          <p className="text-sm mb-6" style={{ color: DARK_TEAL, opacity: 0.65 }}>
            {attending === "yes"
              ? "Thank you for your RSVP. We can't wait to celebrate with you."
              : "Thank you for letting us know. We'll be thinking of you on our special day."}
          </p>
          <div className="animate-pulse text-xs uppercase tracking-widest" style={{ color: TEAL }}>
            Redirecting to the website...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: MINT_BG }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: DARK_TEAL, opacity: 0.6 }}>
            You are invited
          </p>
          <h1 className="text-5xl mb-2" style={{ fontFamily: "var(--font-wedding, Georgia, serif)", color: DARK_TEAL }}>
            Grace &amp; Noelvie
          </h1>
          <p className="text-sm" style={{ color: DARK_TEAL, opacity: 0.6 }}>
            Saturday, June 20, 2026 · Pine Hill Pavilion, Youngsville NC
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl p-6 shadow-sm space-y-4"
          style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
        >
          <h2 className="font-semibold text-base mb-2" style={{ color: DARK_TEAL }}>
            RSVP
          </h2>

          {/* Full Names */}
          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: DARK_TEAL, opacity: 0.6 }}>
              Full Name(s) <span style={{ color: TEAL }}>*</span>
            </label>
            <input
              type="text"
              value={names}
              onChange={(e) => {
                setNames(e.target.value);
                if (touched.names) {
                  const errs = validateFields(e.target.value, phone, email, attending);
                  setErrors((prev) => ({ ...prev, names: errs.names ?? "" }));
                }
              }}
              onBlur={handleNameBlur}
              placeholder="Your full name"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-700"
              style={inputStyle("names")}
            />
            {touched.names && errors.names && (
              <p className="text-xs mt-1" style={{ color: ERROR_COLOR }}>{errors.names}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: DARK_TEAL, opacity: 0.6 }}>
              Phone <span style={{ color: TEAL }}>*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (touched.phone) {
                  const errs = validateFields(names, e.target.value, email, attending);
                  setErrors((prev) => ({ ...prev, phone: errs.phone ?? "" }));
                }
              }}
              onBlur={() => touch("phone")}
              placeholder="(919) 555-0100"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-700"
              style={inputStyle("phone")}
            />
            {touched.phone && errors.phone && (
              <p className="text-xs mt-1" style={{ color: ERROR_COLOR }}>{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: DARK_TEAL, opacity: 0.6 }}>
              Email <span className="font-normal" style={{ opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  const errs = validateFields(names, phone, e.target.value, attending);
                  setErrors((prev) => ({ ...prev, email: errs.email ?? "" }));
                }
              }}
              onBlur={() => touch("email")}
              placeholder="you@email.com"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-700"
              style={inputStyle("email")}
            />
            {touched.email && errors.email && (
              <p className="text-xs mt-1" style={{ color: ERROR_COLOR }}>{errors.email}</p>
            )}
          </div>

          {/* Attending */}
          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: DARK_TEAL, opacity: 0.6 }}>
              Will you attend? <span style={{ color: TEAL }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setAttending("yes");
                  setTouched((prev) => ({ ...prev, attending: true }));
                  setErrors((prev) => ({ ...prev, attending: "" }));
                }}
                className="py-3 rounded-xl text-sm font-medium transition-all"
                style={
                  attending === "yes"
                    ? { backgroundColor: `${TEAL}18`, border: `2px solid ${TEAL}`, color: TEAL }
                    : touched.attending && errors.attending
                    ? { backgroundColor: "transparent", border: `2px solid ${ERROR_COLOR}`, color: "#6b7280" }
                    : { backgroundColor: "transparent", border: "2px solid #e5e7eb", color: "#6b7280" }
                }
              >
                ✓ Yes, I&apos;ll be there
              </button>
              <button
                type="button"
                onClick={() => {
                  setAttending("no");
                  setTouched((prev) => ({ ...prev, attending: true }));
                  setErrors((prev) => ({ ...prev, attending: "" }));
                }}
                className="py-3 rounded-xl text-sm font-medium transition-all"
                style={
                  attending === "no"
                    ? { backgroundColor: "#fff1f2", border: "2px solid #fb7185", color: "#e11d48" }
                    : touched.attending && errors.attending
                    ? { backgroundColor: "transparent", border: `2px solid ${ERROR_COLOR}`, color: "#6b7280" }
                    : { backgroundColor: "transparent", border: "2px solid #e5e7eb", color: "#6b7280" }
                }
              >
                ✗ Sorry, I can&apos;t
              </button>
            </div>
            {touched.attending && errors.attending && (
              <p className="text-xs mt-1" style={{ color: ERROR_COLOR }}>{errors.attending}</p>
            )}
          </div>

          {/* Plus Ones */}
          <div>
            <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: DARK_TEAL, opacity: 0.6 }}>
              Plus ones
            </label>
            <p className="text-xs mb-2" style={{ color: DARK_TEAL, opacity: 0.45 }}>
              How many additional guests are you bringing?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))}
                className="w-10 h-10 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center"
                style={{ border: "1.5px solid #e5e7eb", color: "#6b7280", backgroundColor: "white" }}
              >
                −
              </button>
              <span className="flex-1 text-center text-base font-semibold" style={{ color: DARK_TEAL }}>
                {plusOnes === 0 ? "None" : `+${plusOnes}`}
              </span>
              <button
                type="button"
                onClick={() => setPlusOnes(Math.min(10, plusOnes + 1))}
                className="w-10 h-10 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center"
                style={{ border: "1.5px solid #e5e7eb", color: "#6b7280", backgroundColor: "white" }}
              >
                +
              </button>
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-center" style={{ color: ERROR_COLOR }}>{submitError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: TEAL }}
          >
            {loading ? "Submitting…" : "Submit RSVP"}
          </button>
        </form>
      </div>
    </div>
  );
}
