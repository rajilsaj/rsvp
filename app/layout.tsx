import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Save the Date — Grace & Noelvie",
  description: "Join us to celebrate the wedding of Grace & Noelvie on June 20, 2026. RSVP, find your seat, and explore our story.",
  openGraph: {
    title: "Save the Date — Grace & Noelvie",
    description: "Join us to celebrate the wedding of Grace & Noelvie on June 20, 2026.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Save the Date — Grace & Noelvie",
    description: "Join us to celebrate the wedding of Grace & Noelvie on June 20, 2026.",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,200..900;1,9..144,200..900&family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
