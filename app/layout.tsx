"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <meta property="og:title" content="Save the Date — Wedding" />
        <meta property="og:description" content="A beautiful save-the-date with venue details, RSVP, seating, wishlist, and a love story timeline." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://replit.com/public/images/opengraph.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@replit" />
        <meta name="twitter:title" content="Save the Date — Wedding" />
        <meta name="twitter:description" content="A beautiful save-the-date with venue details, RSVP, seating, wishlist, and a love story timeline." />
        <meta name="twitter:image" content="https://replit.com/public/images/opengraph.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,200..900;1,9..144,200..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
