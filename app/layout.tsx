import type { Metadata } from "next";
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
  title: "Grace & Noelvie — Our Wedding",
  description: "Join us to celebrate the wedding of Grace & Noelvie on August 22, 2026. RSVP, find your seat, and explore our story.",
  openGraph: {
    title: "Grace & Noelvie — Our Wedding",
    description: "Join us to celebrate the wedding of Grace & Noelvie on August 22, 2026.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grace & Noelvie — Our Wedding",
    description: "Join us to celebrate the wedding of Grace & Noelvie on August 22, 2026.",
  },
  icons: {
    icon: "/favicon.png",
  },
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
