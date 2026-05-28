# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-05-28

### Added
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
