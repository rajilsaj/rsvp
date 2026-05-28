# ⚠️ READ THIS ENTIRE FILE BEFORE WRITING ANY CODE ⚠️
> These instructions are mandatory and apply to every single task in this project.

---

# Wedding Planner Hub — Claude Instructions

## Project Overview
This is a wedding planning web application built with Next.js 16 (App Router),
TypeScript, and Tailwind CSS 4. The system uses a "gateway" workflow where
guests must identify themselves via RSVP before accessing the full site.

---

## ⚠️ Critical Rules — Always Follow

1. **NEVER modify any existing UI, design, styling, or frontend code** unless
   explicitly asked. Preserve all existing components, colors, layouts,
   animations, and Tailwind classes.
2. Always use TypeScript (Strict Mode).
3. Always use the App Router (`app/` directory).
4. Use centralized utilities in `lib/` (e.g., `lib/cookies.ts` for session management).
5. Never hardcode API keys or credentials. Use `.env.local`.
6. Maintain the "RSVP-first" gateway workflow.

---

## Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x (with semantic `@theme` variables)
- **Database**: Google Spreadsheets (Primary Data Store)
- **Persistence**: Browser Cookies (365-day expiry)
- **Design**: Radix UI, Framer Motion, Lucide React

---

## Project Structure
```
Wedding-Planner-Hub/
├── app/
│   ├── loading.tsx             # Global themed loader
│   ├── rsvp/
│   │   └── page.tsx            # Entry gateway form (Returning guests are recognized here)
│   ├── admin/
│   │   ├── guests/             # Guest list management
│   │   ├── seating/            # Seating assignment dashboard
│   │   └── updates/            # Broadcast message center
│   └── api/
│       ├── rsvp/               # RSVP submission & real-time name lookup
│       ├── guests/             # Admin guest list retrieval
│       └── updates/            # Broadcast logic
├── lib/
│   ├── google-sheets.ts        # Spreadsheet read/write logic (12-column schema)
│   ├── cookies.ts              # Centralized cookie helpers
│   └── utils.ts                # Tailwind class merging (cn)
└── styles/
    └── globals.css             # Tailwind 4 theme & base styles
```

---

## User Flow (Gateway Architecture)

### Guest Flow
1. **The Gateway**: Guest visits `/`. If no `wedding_rsvp_name` cookie exists, they are redirected to `/rsvp`.
2. **Identification**: On `/rsvp`, guest enters their name. 
   - **Returning Guest**: Recognition happens on `onBlur`. They see a personalized "Welcome back!" and are redirected to `/`.
   - **New Guest**: They fill out Phone and PlusOnes, then are redirected to `/` upon submission.
3. **Personalization**: Once at `/`, the page fetches their specific seating and attendance data from the spreadsheet.

### Admin Flow
1. Admin manages the "Guests" sheet to assign Tables and Seats.
2. Admin uses the updates dashboard to send broadcast messages (SMS/Email).

---

## Google Spreadsheet Structure ("Guests" Sheet)

| Id | Names | Phone | Email | Token | Sent | Clicked | Attending | PlusOnes | Table | Seats | OptOut |
|----|-------|-------|-------|-------|------|---------|-----------|----------|-------|-------|--------|

**Key Rules:**
- `Id`: Auto-generated UUID.
- `Names`: Mandatory (Primary identifier).
- `Token`: Auto-generated 8-char unique string for private access.
- `PlusOnes`: Mandatory numeric field (defaults to 0).
- `Attending`: `yes` or `no` (lowercase).
- `OptOut`: `TRUE` or `FALSE` (uppercase).
- Data starts at row 2 (Row 1 is headers).

---

## US SMS Compliance (TCPA)
- Every SMS must include: "Reply STOP to unsubscribe".
- Always check the `OptOut` column before sending.

---

## Environment Variables
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
```
