# ⚠️ READ THIS ENTIRE FILE BEFORE WRITING ANY CODE ⚠️
> These instructions are mandatory and apply to every single task in this project.

---

# Wedding Planner Hub — Claude Instructions

## Project Overview
This is a wedding planning web application built with Next.js (App Router),
TypeScript, and Tailwind CSS. The guest list and all data is stored in
Google Spreadsheets.

---

## ⚠️ Critical Rules — Always Follow

1. **NEVER modify any existing UI, design, styling, or frontend code** unless
   explicitly asked. Preserve all existing components, colors, layouts,
   animations, and Tailwind classes.
2. Always use TypeScript.
3. Always use the App Router (`app/` directory), never Pages Router.
4. Keep all sensitive credentials in `.env.local` at the project root.
5. Never hardcode API keys, tokens, or credentials anywhere in the code.
6. Always match existing code style and patterns in the project.
7. Before writing any code, read this file in full.

---

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Google Spreadsheets (primary data store)
- **Email**: Resend
- **SMS**: Twilio (US-based guests)

---

## Project Structure
```
Wedding-Planner-Hub/
├── app/                    # Next.js App Router
│   ├── admin/
│   │   ├── guests/         # Guest list overview
│   │   ├── seating/        # Drag & drop seating chart
│   │   └── updates/        # Broadcast messages & photo albums
│   ├── rsvp/
│   │   └── [token]/        # Unique RSVP page per guest
│   └── api/
│       ├── rsvp/           # Save RSVP response
│       └── seating/        # Push seat assignments to sheet
├── lib/
│   ├── googlesheet.ts      # Read/write Google Spreadsheet
│   ├── tokens.ts           # Generate unique guest tokens
│   ├── sms.ts              # Twilio SMS sending
│   └── email.ts            # Resend email sending
├── script/
│   └── sendInvites.ts      # Bulk send invites to guests
└── .env.local              # All credentials (never commit)
```

---

## Google Spreadsheet Structure

### Sheet 1: "Guests"
| Name | Phone | Email | Token | Sent | Clicked | Attending | PlusOnes | Table | Seats | OptOut |

### Sheet 2: "Updates"
| Date | Message | PhotoAlbumLink | SentTo | SentAt |

---

## Core Features

### 1. RSVP Flow
- Generate a unique token per guest stored in Google Sheet
- Each guest gets a personal link: `yoursite.com/rsvp/[token]`
- RSVP page lets guest confirm attendance + number of plus ones
- On submit: update Google Sheet (Clicked, Attending, PlusOnes columns)

### 2. Seating Assignment
- Admin page shows all confirmed guests with their plus one count
- Assign guests to tables and seats
- Push table + seat assignments back to Google Sheet
- Optionally notify guest of their seat via SMS/email

### 3. Guest Invites
- Script to send initial invite with RSVP link to all guests
- Send via SMS (Twilio) and/or Email (Resend)
- Track sent status in Google Sheet

### 4. Broadcast Updates
- Admin page to compose a message + optional Google Photos album link
- Target: all guests, confirmed only, or specific guests
- Send via SMS and/or Email
- Log sent updates in "Updates" sheet tab

---

## US SMS Compliance (TCPA)
- Always include opt-out instructions in every SMS ("Reply STOP to unsubscribe")
- Twilio handles STOP replies automatically
- Always check the `OptOut` column — never send to opted-out guests

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
NEXT_PUBLIC_BASE_URL=
```

---

## When Adding New Features
- Add new API routes under `app/api/`
- Add new lib utilities under `lib/`
- Add new admin pages under `app/admin/`
- Never touch existing frontend design, components, or styles
- Never remove or rename existing files unless explicitly asked