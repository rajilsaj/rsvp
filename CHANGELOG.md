# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-05-28 (pass 4 — directions per event, hero date)

### Changed
- **Hero section date corrected**: Large display date in the main hero section updated from `JUN 20, 2026` to `AUG 22, 2026` to match the actual wedding date.
- **"Get Directions" per event card**: Refactored `handleGetDirections` into a reusable `openDirections(address: string)` helper. Each event card now renders a `Get Directions →` link directly beneath its address, calling `openDirections(event.address)` — which routes to `maps://` on iOS, `geo:` on Android, or Google Maps on desktop. The link is hidden for past events.

## [Unreleased] — 2026-05-28 (pass 3 — events, dates, directions)

### Changed
- **Wedding date updated to August 22, 2026**: All references to June 20, 2026 replaced across `app/page.tsx`, `app/layout.tsx`, `app/rsvp/page.tsx`, `app/photos/page.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, and `app/api/updates/route.ts`. Countdown target updated to `2026-08-22T13:00:00` (ceremony start). "Save to Calendar" link updated to `20260822T130000/20260822T010000`.
- **Upcoming Celebrations — events replaced**: Removed "Meeting with Parents", "Pre-Wedding Dinner", and "Wedding Rehearsal" from `incomingEvents`. Replaced with two structured events: **Ceremony** (1:00 PM – 3:00 PM, Unity of the Triangle Church) and **Reception** (5:00 PM – 1:00 AM, Pine Hill Pavilion), both on Saturday August 22, 2026.
- **Event cards — structured layout with filigran icon**: `EventItem` type extended with optional `time`, `venue`, `address`, `note`, and `Icon` fields. Cards now render each field distinctly — time in bold, venue name, address with a `MapPin` icon, italic note — instead of a flat description string. A large semi-transparent background icon (`Church` for ceremony, `Wine` for reception) is rendered as a watermark in the bottom-right corner of each card.
- **PlusOnes cap lowered from 10 to 3**: `Math.min` guard updated in both `app/page.tsx` and `app/rsvp/page.tsx`; `z.number().max(3)` added to the API schema in `app/api/rsvp/route.ts`.
- **Get Directions opens native maps app on mobile**: Replaced static `<a href>` with an `onClick` handler (`handleGetDirections`) that routes to `maps://maps.apple.com/?daddr=…` on iOS, `geo:0,0?q=…` on Android, and `window.open(mapUrl)` on desktop. Applied to both direction links in the venue section.

## [Unreleased] — 2026-05-28 (pass 2 — cookie audit)

### Fixed (cookie & auth system audit)
- **Race condition: spinner cleared before guest fetch resolved** (`app/page.tsx`): `setChecking(false)` was called immediately after the cookie was found, before the `/api/guests` fetch returned. This meant the homepage rendered with `myRsvp = null` and an empty RSVP form for the entire API round-trip. Moved `setChecking(false)` into the `.finally()` block so the spinner stays until the guest list resolves.
- **RSVP form shown with empty name on fetch miss** (`app/page.tsx`): When the guest fetch returned an empty list (e.g., just registered — Google Sheets propagation lag, or API error), `inviteeName` stayed `""`. The RSVP form opened blank, forcing the user to retype their name. Added an `else`/`.catch()` branch that pre-fills `inviteeName` from the cookie value as a fallback.
- **Cookie values not URL-encoded** (`lib/cookies.ts`): `setCookie` stored raw string values and `getCookie` returned raw string values. Guest names containing `&`, `+`, `%`, or other URI-special characters could silently corrupt or truncate the cookie on round-trip. `setCookie` now wraps values in `encodeURIComponent`; `getCookie` wraps the read value in `decodeURIComponent` with a try/catch fallback for pre-existing unencoded cookies (backwards-compatible).
- **Unused `savedPhone` variable** (`app/page.tsx`): `getCookie("wedding_rsvp_phone")` was read into `savedPhone` but never consumed after the previous refactor removed the `setInviteePhone(savedPhone || "")` call. Removed the dead read.
- **Unused `Button` import** (`app/page.tsx`): The shadcn `Button` component import was left behind after the RSVP form was rewritten to use native `<input>` and `<button>` elements. Removed.

### Added
- **Cookie flow smoke-test suite** (`test-cookie-flow.mjs`): 10 Playwright test suites (19 assertions) covering: no-cookie redirect to `/rsvp`; cookie-present redirect away from `/rsvp`; spinner-then-content on homepage load; RSVP form pre-fill from cookie when guest not found in sheet; confirmation card shown when guest found; form validation error messages; phone mask placeholder; `/photos` page load; `/rsvp` page validation; and `encodeURIComponent`/`decodeURIComponent` round-trip with special characters. All 19 pass.

### Added (earlier this session)
- **Netlify Deployment Config**: Added `netlify.toml` specifying `npm run build` as the build command, `.next` as the publish directory, Node 20 as the runtime, and `@netlify/plugin-nextjs` for SSR support.

### Fixed
- **Homepage Flash for Unregistered Users**: The full homepage was rendering before the cookie check `useEffect` fired, causing a visible flash of content before the redirect to `/rsvp`. Added a `checking` state to `app/page.tsx` that renders a minimal spinner while the cookie is verified — unregistered users now see nothing before being sent to the RSVP page.
- **Music Replaced YouTube IFrame with Local MP3**: Ripped out the YouTube IFrame API singleton entirely from `components/MusicProvider.tsx`. YouTube's autoplay policy made reliable audio impossible regardless of interaction listeners. Replaced with a native `<Audio>` element pointing at `public/music.mp3`, which browsers allow to play synchronously inside a user gesture handler with no async gap — including iOS. First-interaction listeners (`click`, `touchstart`, `keydown`) call `audio.play()` directly; `canplaythrough`, `play`, `pause`, and `ended` events drive the React state.
- **Music Stops on Photos Navigation**: The "Our Photos" nav link was a plain `<a href="/photos">`, causing a full browser reload that destroyed the `MusicProvider` audio object. Changed to Next.js `<Link href="/photos">` for client-side navigation so the layout — and audio — stays mounted across page transitions.
- **Grayscale Hover Effect Not Triggering on Mobile**: Touch devices do not fire CSS `:hover`, so the `grayscale → color` reveal on photo cards never triggered on mobile. Added `active:grayscale-0` and `group-active:scale-[1.04]` (Photos page) / `group-active:scale-[1.03]` (homepage story images) alongside the existing `hover:` classes so tapping a photo triggers the color reveal while the finger is pressed.

### Changed
- **Next.js Downgraded to 15.5.18**: Reverted from the erroneous `^16.2.6` back to the stable `^15.5.18` in `package.json`.
- **tsconfig.json `jsx` corrected to `"preserve"`**: Changed from `"react-jsx"` — Next.js requires `"preserve"` so it can apply its own JSX transform. Also removed the Turbopack `root` option from `next.config.js`.
- **`.nvmrc` Node version fixed**: Updated `.nvmrc` to correctly pin the project's Node version (aligns with the Node 20 target specified in `netlify.toml`).
- **Homepage RSVP Form Parity with `/rsvp` Page**: Replaced the simple name/phone/attendance form in the homepage RSVP section with the full form matching `app/rsvp/page.tsx`. Changes: phone field now uses the same ghost-mask `(XXX) XXX-XXXX` overlay with cursor management; email (optional) field added; attendance changed from a 3-option flex row ("Yes / Maybe / No") to a 2-column Yes ✓ / No ✗ grid; plus-ones `−/None/+` counter added; inline validation with touch-aware error messages added for name, phone, and email; submit button relabelled "Submit RSVP". The `Input` shadcn component was removed in favour of native `<input>` elements consistent with the `/rsvp` page.

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
