"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const photos = [
  { src: "/images/couple-rsvp.jpg", alt: "Grace & Noelvie" },
  { src: "/images/couple-hero-2.jpg", alt: "Grace & Noelvie" },
  { src: "/images/couple-hero-3.jpg", alt: "Grace & Noelvie" },
  { src: "/images/story-1.jpg", alt: "Our story" },
  { src: "/images/story-2.jpg", alt: "Our story" },
  { src: "/images/story-3.jpg", alt: "Our story" },
  { src: "/images/story-4.jpg", alt: "Our story" },
];

export default function PhotosPage() {
  return (
    <div className="min-h-[100dvh] bg-[#faf9f6] text-dark-teal">

      {/* Header */}
      <header className="flex items-center justify-between px-5 sm:px-10 py-4 border-b border-dark-teal/10">
        <Link href="/" className="text-[8px] tracking-[0.3em] uppercase text-dark-teal/45 hover:text-teal-accent transition-colors">
          ← Back
        </Link>
        <div className="text-center">
          <p className="font-display text-lg sm:text-xl tracking-[0.3em] text-dark-teal font-light leading-none">G · N</p>
          <p className="text-[8px] tracking-[0.35em] uppercase text-dark-teal/40 mt-0.5">Grace &amp; Noelvie</p>
        </div>
        <div className="w-12" />
      </header>

      {/* Page title */}
      <div className="text-center px-5 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <p className="text-[8px] tracking-[0.4em] uppercase text-dark-teal/35 mb-3">Gallery</p>
        <h1 className="font-display text-4xl sm:text-6xl font-light text-dark-teal tracking-tight">Our Photos</h1>
        <div className="mt-4 h-px w-12 bg-dark-teal/15 mx-auto" />
        <p className="mt-6 text-sm text-dark-teal/45 max-w-sm mx-auto leading-relaxed">
          A growing collection of our favorite moments together.
        </p>
      </div>

      {/* Photo grid */}
      <div className="px-5 sm:px-10 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className={`overflow-hidden group ${i === 0 ? "col-span-2 sm:col-span-1 row-span-2" : ""}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className={`w-full object-cover grayscale hover:grayscale-0 active:grayscale-0 group-hover:scale-[1.04] group-active:scale-[1.04] transition-all duration-700 ${i === 0 ? "h-[360px] sm:h-[500px]" : "h-44 sm:h-56"}`}
              />
            </motion.div>
          ))}

          {/* Placeholder tiles */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`ph-${i}`}
              className="h-44 sm:h-56 bg-dark-teal/5 border border-dashed border-dark-teal/15 flex flex-col items-center justify-center gap-2"
            >
              <p className="text-[8px] tracking-[0.3em] uppercase text-dark-teal/25">Coming soon</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[8px] tracking-[0.3em] uppercase text-dark-teal/25">
          More photos will be added after the wedding · June 20, 2026
        </p>
      </div>
    </div>
  );
}
