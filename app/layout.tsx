import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Save the Date — Wedding",
  description: "A beautiful save-the-date with venue details, RSVP, seating, wishlist, and a love story timeline.",
  openGraph: {
    title: "Save the Date — Wedding",
    description: "A beautiful save-the-date with venue details, RSVP, seating, wishlist, and a love story timeline.",
    type: "website",
    images: ["https://replit.com/public/images/opengraph.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@replit",
    title: "Save the Date — Wedding",
    description: "A beautiful save-the-date with venue details, RSVP, seating, wishlist, and a love story timeline.",
    images: ["https://replit.com/public/images/opengraph.png"],
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
