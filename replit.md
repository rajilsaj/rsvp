# replit.md

## Overview

This is a wedding "Save the Date" web application that allows guests to RSVP, view venue details, find their seating assignments, browse a gift wishlist, and read the couple's love story timeline. The application is built with Next.js and React, using a PostgreSQL database for persistent storage of RSVPs and wishlist claims.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js with React (App Router pattern in `/app` directory)
- **Styling**: Tailwind CSS v4 with PostCSS, using CSS variables for theming
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives
- **Animations**: Framer Motion for scroll-based and interactive animations
- **State Management**: TanStack React Query for server state and data fetching
- **Fonts**: DM Sans (sans-serif) and Fraunces (serif) from Google Fonts
- **Icons**: Lucide React icon library

### Legacy Client Architecture
- There is also a Vite-based client in `/client` directory using Wouter for routing
- This appears to be a legacy setup; the primary application uses Next.js in `/app`

### Backend Architecture
- **API Routes**: Express.js server in `/server` directory with REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database queries
- **Schema Validation**: Zod with drizzle-zod for runtime validation
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)

### Data Models
1. **RSVPs** (`rsvps` table):
   - Guest name, phone, number of guests, RSVP status (yes/no/maybe)
   - Optional notes and auto-assigned seat ID
   - Seats follow pattern: t{table}s{seat} (e.g., t1s1 for Table 1, Seat 1)

2. **Wishlist Claims** (`wishlist_claims` table):
   - Item ID reference and claimer name
   - Tracks which gifts have been claimed by guests

### API Endpoints
- `GET /api/rsvps` - List all RSVPs
- `GET /api/rsvps/lookup?phone=` - Find RSVP by phone number
- `POST /api/rsvps` - Create new RSVP
- `GET /api/wishlist-claims` - List claimed wishlist items
- `POST /api/wishlist-claims` - Claim a wishlist item
- `DELETE /api/wishlist-claims/:itemId` - Remove a claim

### Key Design Decisions
- **Auto-seat assignment**: When a guest RSVPs "yes" without specifying a seat, the system automatically assigns the next available seat from a predefined list of 12 seats (3 tables × 4 seats)
- **Phone-based lookup**: Guests can look up their RSVP and seating by phone number
- **Dual client setup**: The project maintains both Next.js (primary) and Vite (legacy) frontend configurations

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **pg**: Node.js PostgreSQL client
- **connect-pg-simple**: PostgreSQL session store

### UI/UX Libraries
- **Radix UI**: Full suite of accessible UI primitives (dialog, dropdown, tabs, etc.)
- **qrcode.react**: QR code generation for venue/event details
- **embla-carousel-react**: Carousel component
- **react-day-picker**: Calendar/date picker
- **vaul**: Drawer component
- **cmdk**: Command palette component
- **sonner**: Toast notifications

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **esbuild**: Server bundling for production
- **Vite plugins**: Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)