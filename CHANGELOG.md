# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-05-28

### Fixed
- **Homepage Flash for Unregistered Users**: The full homepage was rendering before the cookie check `useEffect` fired, causing a visible flash of content before the redirect to `/rsvp`. Added a `checking` state to `app/page.tsx` that renders a minimal spinner while the cookie is verified — unregistered users now see nothing before being sent to the RSVP page.
- **Music Autoplay Blocked by Browser**: The YouTube player's `onReady` callback called `playVideo()` asynchronously, which browsers silently block under their autoplay policy (audio started outside a user gesture is not allowed). Replaced this with document-level interaction listeners (`click`, `scroll`, `touchstart`, `keydown`) in `components/MusicProvider.tsx` — music now starts automatically on the first user interaction without requiring the dedicated play button.

### Changed
- **MusicProvider autoplay strategy**: Changed `autoplay: 1` to `autoplay: 0` in the YouTube player config and shifted play responsibility to the first-interaction listener. `onReady` no longer unconditionally calls `playVideo()` — it only does so if the user has already interacted. `onStateChange` remains the source of truth for the playing/paused state.

---

## [Unreleased] — 2026-05-27

### Added
- **Architectural Refactor**: Centralized cookie management in `lib/cookies.ts` for consistent session handling.
- **RSVP-First Gateway**: Implemented a redirection system that forces identification via `/rsvp` before allowing access to the main website (`/`).
- **Real-Time Guest Verification**: Added an `onBlur` background check on the RSVP name field to instantly recognize and welcome back registered guests.
- **Global Loading Transition**: Added `app/loading.tsx` featuring a themed spinner, personalized greeting ("Opening Invitation..."), and background sound support.
- **Personalized Persistence**: Switched from `localStorage` to 365-day browser cookies (`wedding_rsvp_name`, `wedding_rsvp_phone`).

### Changed
- **RSVP Page Copy & Layout**: Updated the header text to "You are invited to Grace & Noelvie Wedding" and refined the layout to put "to" and "Wedding" on separate rows for visual emphasis.
- **Optimized Font Loading**: Refactored `app/layout.tsx` to use `next/font/google` for efficient preloading and to prevent flickering (FOUT) using `display: 'block'`.
- **Theme Color Loading**: Updated `app/loading.tsx` and the Tailwind theme to use CSS variables, ensuring brand colors are applied instantly.
- **Tailwind 4 Migration**: Refactored `styles/globals.css` to use Tailwind 4 `@theme` variables, replacing hardcoded hex values with a semantic design system (`bg-mint`, `text-dark-teal`, etc.).
- **Updated Guest Schema**: Expanded Google Sheets integration to support a 12-column schema: `Id`, `Names`, `Phone`, `Email`, `Token`, `Sent`, `Clicked`, `Attending`, `PlusOnes`, `Table`, `Seats`, `OptOut`.
- **Hero Section UI**: Removed the "SAVE THE DATE" badge and replaced the "Save to Calendar" primary button with a heart-themed "RSVP Now" button that smooth-scrolls to the personalized RSVP section.
- **Footer Refinement**: Removed the top border from the footer for a more seamless, modern aesthetic.
- **Metadata Update**: Updated browser titles and social sharing data to "Grace & Noelvie — Our Wedding".

### Fixed
- **CSS Syntax Error**: Resolved an "unknown utility class `border-border`" error by properly defining `--color-border` in the Tailwind 4 `@theme` block.
- **API Property Mapping**: Resolved data inconsistencies by ensuring all frontend components correctly map spreadsheet fields (e.g., `names`) to internal UI properties (e.g., `name`).
- **Reference Errors**: Fixed missing style constants and type definitions in `app/rsvp/page.tsx`.
- **Broken API Paths**: Corrected several invalid endpoint references in the main presentation page.

---

## App Structure Alignment (`2026-05-27`)
- Replaced token-based `/rsvp/[token]` route with a single public `/rsvp` page.
- Renamed `lib/googlesheet.ts` to `lib/google-sheets.ts` with the correct column schema.
- Simplified `/api/guests` to GET-only for admin use.
- Fixed hydration mismatch in `app/page.tsx` using `useEffect`.
