import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Great_Vibes } from "next/font/google";
import { Providers } from "./providers";
import { OfflineBanner } from "@/components/OfflineBanner";
import { MusicProvider } from "@/components/MusicProvider";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "block", // Use 'block' to hide text until font is ready, minimizing FOUT
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "block",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-wedding",
  display: "block",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Grace & Noelvie — Our Wedding",
  description: "Join us to celebrate the wedding of Grace & Noelvie on August 22, 2026. RSVP, find your seat, and explore our story.",
  openGraph: {
    title: "Grace & Noelvie — Our Wedding",
    description: "Join us to celebrate the wedding of Grace & Noelvie on August 22, 2026.",
    type: "website",
    images: [{ url: "/images/couple-rsvp.jpg", width: 1200, height: 630, alt: "Grace & Noelvie" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grace & Noelvie — Our Wedding",
    description: "Join us to celebrate the wedding of Grace & Noelvie on August 22, 2026.",
    images: ["/images/couple-rsvp.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#722F37",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${greatVibes.variable}`}>
      <body className="antialiased">
        <Providers>
          <MusicProvider>
            {children}
            <OfflineBanner />
          </MusicProvider>
        </Providers>
      </body>
    </html>
  );
}
