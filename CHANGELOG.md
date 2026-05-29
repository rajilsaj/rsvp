# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-05-28 (pass 13 — Wax-seal loading screen)

### Added
- **`WeddingLoader` component** (`app/page.tsx`): Two-phase animated loading screen displayed during the cookie/guest-data check on the homepage.
  - **Phase 1 — Wax seal (0–2.4 s)**: A burgundy SVG circle (`#5C1E2A`) with a gold-dashed outer ring, inner decorative ring, `G · N` monogram in Display serif, and four cardinal corner dots scales in with a spring ease, pulses with a warm `drop-shadow` glow, then breaks open (`scale: 1 → 1.6, opacity: 1 → 0`).
  - **Phase 2 — Invitation card (1.9 s →)**: A dark card (`rgba(10,8,8,0.6)`) with a 1.5 px gold border, double inset frame, and glowing gold corner dots materialises behind the seal. Sequential reveals: top ornament line draws from center → tagline "You are cordially invited to" → "Grace & Noelvie" sweeps up in the gold gradient → "Wedding" and "August 22 · 2026" fade in → bottom ornament line → `✦` sparkles in via spring → three pulsing gold dots.
  - **Background**: 8 gold confetti pieces (`#D4AF37`, `#F5E080`, `#C8A028`, `#B8920A`) at varied rotations drift up/down via `loader-drift` CSS keyframe. Warm radial `rgba(114,47,55,0.10)` glow behind everything.
- **`seal-pulse` and `loader-drift` keyframes** (`styles/globals.css`): `seal-pulse` animates `drop-shadow` intensity for the wax seal glow; `loader-drift` creates a gentle vertical float with `translateY` keyed to `--r` CSS custom property for per-piece rotation.
- **`app/loading.tsx` redesigned** (Next.js route-level Suspense boundary): Shows the wax seal SVG (identical markup) with CSS-only `seal-in` (scale-from-0.5) and `seal-pulse` animations — no Framer Motion required. Below the seal, "Grace & Noelvie" in the gold gradient script and "Opening Invitation…" tracking text fade up via `fade-up` keyframe defined inline in a `<style>` tag.

### Changed
- **Homepage spinner removed**: `checking` state previously returned a plain white page with a 6 px spinning ring. Now returns `<WeddingLoader />`.

---

## [Unreleased] — 2026-05-28 (pass 12 — Hero section beautification)

### Changed
- **Hero section fully split into separate mobile and desktop layouts** (`app/page.tsx`): Eliminated the shared `grid-cols-1 lg:grid-cols-3` that forced three tall blocks to stack on mobile, causing visual compression and overlap.
  - **Desktop (`hidden lg:grid`)**: 3-column grid with `lg:gap-10 xl:gap-12`, items side-by-side. Left: headline right-aligned with ornament `✦` + flex divider. Center: photo `w-[19rem] xl:w-[22rem]` rotated 1.5°, deep shadow. Right: event details left-aligned with `space-y-2.5` and `my-6` dividers.
  - **Mobile (`lg:hidden`)**: Three visually separated blocks divided by `border-b border-dark-teal/8` hairlines: (1) tagline + headline + scripture, (2) photo centered at `w-[200px] sm:w-[240px]` flat (no rotation), (3) compact event summary with full date on one line, venue, and inline Get Directions / Save to Calendar links.
- **Photo no longer overlaps text on mobile**: Photo moved to `order-2` (after headline) and rotation removed on mobile — `lg:rotate-[1.5deg]` only.
- **Navbar RSVP button**: Changed from outlined text to a solid burgundy gradient pill (`linear-gradient(135deg, #722F37, #8E3D47)`). Hamburger lines animate width on hover.
- **Countdown strip**: Changed from centered-only to `flex-row` on sm+, nav links left / countdown right. Countdown digit size reduced to `text-2xl sm:text-3xl`.
- **`justify-center` scoped to `lg:justify-center`**: Removed forced vertical centering on mobile so content flows naturally without compression.

---

## [Unreleased] — 2026-05-28 (pass 11 — Gold text & image placeholder)

### Added
- **`CoupleImg` component** (`app/page.tsx`): Wraps every homepage `<img>` with a gold-bordered placeholder shown while the image loads.
  - Placeholder: cream `#FAF8F5` background, `2px solid #D4AF37` outer border, `1px rgba(212,175,55,0.35)` inner inset frame, `G · N` monogram in antique gold `#B8920A`, "Grace & Noelvie" in the wedding script font `#C8A028`, date `August 22 · 2026` in faded gold.
  - Image starts at `opacity-0` and transitions to `opacity-100` on `onLoad`; placeholder fades out simultaneously over 500 ms.
  - Applied to: hero portrait and all four Our Story timeline images. Story image containers updated with `relative` class to anchor the placeholder.

### Changed
- **`.gold-word` → `.gold-headline`** (`styles/globals.css`, `app/page.tsx`): Replaced the `display: inline-block` gradient-text approach (which clipped Great Vibes glyphs at the box edge) with `.gold-headline` applied directly to the block-level `<h1>`. The `h1` fills the full column width so glyph ink that overflows the character's logical advance stays within the block — never touching the page's `overflow-x: hidden` clip boundary. Removed `SparkleWord` wrapper spans and `CONFETTI` per-word data.
- **Confetti repositioned to block container**: `CONFETTI_SCATTER` array of 12 pieces now uses `%` positions relative to a `relative w-full` div wrapping the `h1`. All `left` values ≤ 90 % to prevent horizontal overflow.
- **`seal-pulse` and `loader-drift` keyframes added to `globals.css`** (see pass 13).

---

## [Unreleased] — 2026-05-28 (pass 10 — Gold confetti text effect)

### Added
- **Gold static gradient on "We're getting married"** (`styles/globals.css`): `.gold-word` (later renamed `.gold-headline`) applies a `160deg` diagonal gradient (`#9A7808 → #D4AF37 → #F5E080 → #C8A028 → #9A7808`) via `background-clip: text` — no animation, static elegant gold.
- **Confetti texture** (`styles/globals.css`, `app/page.tsx`): `.confetti-piece` class renders small rectangular gold pieces (`border-radius: 1px`) with a `confetti-float` keyframe that translates `Y` ±4 px using a `--r` CSS custom property for per-piece rotation. 12 pieces scattered across the headline block in four gold tones, each with a unique animation delay creating a living confetti effect.

---

## [Unreleased] — 2026-05-28 (pass 9 — Homepage images & Celebrations section)

### Changed
- **Homepage images — full color** (`app/page.tsx`): Removed `grayscale` from the hero portrait and `grayscale hover:grayscale-0 active:grayscale-0` from all four Our Story timeline images. Images now always display in full color. Photos page retains the grayscale-to-color hover interaction.
- **Celebrations section — FloralBackground removed** (`app/page.tsx`): Replaced `floralGradient` (near-black floral gradient) and `<FloralBackground />` (SVG rose clusters + parchment texture) with a clean `linear-gradient(160deg, #4A1520 → #722F37 → #8E3D4E → #7A2D3E → #4A1520)` — a velvety softened burgundy with a subtle lighter centre. A very-low-opacity (`0.04`) parchment noise texture adds warmth without visual weight.
- **Event cards beautified** (`app/page.tsx`): `rounded-xl` → `rounded-2xl`, gold top/bottom strips `h-1` → `h-[3px]` with improved gradient opacity, card shadow deepened to `0_28px_72px_-8px_rgba(30,8,14,0.65)`, venue name `font-medium` → `font-semibold`, `space-y-1` → `space-y-1.5`, gold ornament divider lines use fade-to-transparent gradients.
- **`FloralBackground` and `floralGradient` import removed** from `app/page.tsx` — no longer used on the homepage. Both exports remain in `components/RsvpFloral.tsx` for future use.
- **RSVP page — FloralBackground removed** (`components/RsvpFloral.tsx`): `RsvpFloral` wrapper updated to use a center-lit radial burgundy gradient (`#8E3D4E → #722F37 → #380F1A`) with corner vignette overlay, minimal parchment texture, and a thin gold frame visible on desktop. No SVG rose clusters.
- **RSVP card beautified** (`app/rsvp/page.tsx`): `bg-white/90 backdrop-blur-sm` → `bg-white`, deeper shadow `0_32px_80px_-8px_rgba(30,8,14,0.7)`, gold border `rgba(212,175,55,0.4)`, photo fade extended to `h-28` with `via-white/80`.
- **Story image hover shadow** (`app/page.tsx`): Added `shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)]` at rest and `hover:shadow-[0_16px_48px_-8px_rgba(114,47,55,0.28)]` (burgundy-tinted) on hover. Hero portrait shadow updated to neutral `rgba(0,0,0,0.5)`.
- **`global-error.tsx` inline hex values updated**: `#1d3d37` → `#141212`, `#3d5c54` → `#4A4040`, `#3d8b7a` → `#722F37` (button background).

---

## [Unreleased] — 2026-05-28 (pass 8 — Black · White · Burgundy · Gold redesign)

### Changed
- **Global color palette replaced — Black · White · Burgundy · Gold** (`styles/globals.css`):
  All teal/mint/crimson tokens replaced with a monochromatic black-and-white base plus burgundy and gold accents.
  - `--teal-accent` `#3d8b7a` → `#722F37` (burgundy — buttons, borders, focus rings, `bg-teal-accent`, `border-teal-accent`)
  - `--dark-teal` `#1d3d37` → `#141212` (near-black charcoal — all primary text)
  - `--teal-muted` `#3d5c54` → `#4A4040` (charcoal-warm — secondary/muted text; ≈10:1 contrast on white, WCAG AAA)
  - `--floral-crimson` `#8B1A2E` → `#722F37` (burgundy — accent text, headings, interactive hover states)
  - `--mint-bg` `#c5e0da` → `#0D0B0B` (near-black — full-screen nav overlay dark background)
  - Added `--gold: #B8920A` and `--gold-light: #D4AF37` tokens registered in `@theme` as `--color-gold` / `--color-gold-light`
- **Full-screen nav overlay redesigned for dark background** (`app/page.tsx`):
  Overlay background changed from mint-green to near-black `#0D0B0B`. All text updated for readability: `text-dark-teal` → `text-white/90`, `text-teal-muted` → `text-white/50`, dividers → `border-white/15` and `border-white/12`, hover states → `hover:text-[#D4AF37]` and `hover:border-[#D4AF37]` (gold). Close button `text-white/50 hover:text-white/90`. Footer label `text-white/50`.
- **FloralBackground SVG color palette** (`components/RsvpFloral.tsx`):
  Removed all crimson/blush/rose colors. New palette: `burgundyRose` (outer `#8E3D47` · mid `#722F37` · inner `#4A1520`), `mauveRose` (outer `#C09098` · mid `#A07080` · inner `#7A5060`), leaves stay in earthy dark-olive. Blossom petals remain ivory-cream (`#FFF8F0`) with gold center (`#B8920A`/`#D4AF37`). Sparkle opacity raised to 0.7 for better visibility on dark background.
- **`floralGradient` updated** (`components/RsvpFloral.tsx`):
  Replaced rose/dusty-pink radial gradient with a deep dark-burgundy gradient: `#1A0810 → #2B1018 → #3F1522 → #531A2C → #672035 → #7A2940`. Creates an elegant near-black center radiating to deep wine at edges. Applied to `/rsvp` page background and the Celebrations section on homepage.
- **FloralBackground gold frame** (`components/RsvpFloral.tsx`):
  Gold border opacity increased (`rgba(212,175,55,0.5)`) and inner shadow updated (`rgba(212,175,55,0.18)`) for better contrast against the dark gradient.
- **Confetti colors updated** (`app/page.tsx`, `app/rsvp/page.tsx`):
  Changed from teal/pink palette to `["#722F37", "#D4AF37", "#FAF8F5", "#8E3D47", "#B8920A", "#ffffff"]` — burgundy, gold, ivory, and white.
- **FloatingPetals hue** (`app/page.tsx`):
  Changed from soft pink `hsl(340+, 85%, 82%)` to deep burgundy `hsl(345+, 60%, 44%)` — petals now match the burgundy/wine wedding palette.
- **Event status pills inline styles** (`app/page.tsx`):
  Changed inline `rgba(139,26,46,…)` crimson hex values to `rgba(114,47,55,…)` burgundy and `#8B1A2E` → `#722F37`.
- **Footer heart icon** (`app/page.tsx`):
  Changed from `text-rose-400 fill-rose-400` to `text-floral-crimson fill-current` (burgundy).
- **Admin layout** (`app/admin/layout.tsx`):
  Uses semantic tokens (`text-primary`, `bg-background`, `surface`) — automatically inherits burgundy as primary accent from the updated globals. No file changes required.
- **`FloralBackground` removed from red/crimson**: All previously crimson-red elements (roses, inner petals, highlights) are now deep burgundy/wine — the warm red that was "not good looking" has been eliminated entirely.

---

## [Unreleased] — 2026-05-28 (pass 7 — events redesign, crimson token, story fix)

### Changed
- **Global text accent → `text-floral-crimson`**: Every `text-teal-accent` class across all `.tsx` files in `app/` and `components/` replaced with `text-floral-crimson` (`#8B1A2E`). Covers story date labels, section nav hover states, RSVP confirmation, seat assignment display, footer scripts, error/404/loading pages, and photo page links. The teal accent colour is now reserved for backgrounds and borders only.
- **Hero title colour**: "We're getting married" changed from `text-teal-accent` to `text-floral-crimson`, tying the hero directly to the rose/floral palette.
- **Upcoming Celebrations — full redesign ("Wedding Programme" style)**: Replaced the plain card grid with two portrait stationery cards counter-rotated (−1.5° / +1.5°), each styled as a printed wedding invitation — cream `#FDF8F5` background, gradient gold top & bottom strips, Roman numeral (I / II) as a watermark, script event name in `text-floral-crimson`, large display-font time as the hero element, venue name, address link, and a "d away" crimson pill. Cards are separated on desktop by a gold vertical ornament line and `✦` symbol. Section header uses "THE WEDDING PROGRAMME" label + script `Grace & Noelvie` with `textShadow` for readability on the rose background.
- **Upcoming section vertical spacing reduced**: `py-20 sm:py-28` → `py-12 sm:py-16`; section header margin `mb-16 sm:mb-20` → `mb-10 sm:mb-12`; card internal padding `px-8 pt-8 pb-9` → `px-6 pt-6 pb-7`.
- **Story section — first image no longer cuts faces on mobile**: Changed `h-60 object-cover` to `h-72 object-cover object-top` so the image anchors to the top of the frame, showing both faces instead of cropping to torso level.

## [Unreleased] — 2026-05-28 (pass 6 — design & floral theme)

### Added
- **`--floral-crimson: #8B1A2E` design token** (`styles/globals.css`): the deep crimson from the rose clusters, registered as `--color-floral-crimson` in `@theme` so `text-floral-crimson` / `bg-floral-crimson` are available as Tailwind utilities everywhere.

### Changed
- **Hero "We're getting married" colour**: changed from `text-teal-accent` to `text-floral-crimson` (`#8B1A2E`), creating a visual thread between the hero script and the floral events section below.
- **Upcoming Celebrations section — floral background**: replaced the flat `bg-mint` with the same `floralGradient` radial gradient used on `/rsvp`. `FloralBackground` (corner SVG clusters, parchment texture, gold border) extracted as a named export from `RsvpFloral.tsx` and applied to the section. `floralGradient` CSS string also exported so the homepage section matches exactly.
- **Upcoming Celebrations section — card redesign**: replaced transparent `bg-white/15` grid cells with floating white invitation cards (`bg-white/90 backdrop-blur-sm`, warm crimson shadow). Each card has a coloured top band, an icon badge (Church/Wine), large time display, venue name, address link, and an italic note. Text uses `text-dark-teal` / `text-teal-muted` on the white panel — fully readable regardless of background.
- **Section header text**: "Mark your calendar" and "Upcoming Celebrations" use `text-white` with `textShadow` for readability over the rose gradient. Gold divider line replaces the teal one.
- **Section footer**: "Grace & Noelvie" script in white with shadow; date label in `text-white/70`.
- **Homepage spinner eliminated**: `setChecking(false)` now fires immediately after cookie validation instead of waiting for the `/api/guests` response — page renders at once, guest data loads in the background.
- **`whileInView` initial opacity**: changed from `0` to `0.15` across all animated sections in `app/page.tsx` and `app/photos/page.tsx` so content is faintly visible before scrolling in, preventing blank-section flashes.
- **`opacity-60` form labels in `/rsvp`**: 5 remaining `opacity-60` labels replaced with `text-teal-muted`.

## [Unreleased] — 2026-05-28 (pass 5 — accessibility audit)

### Changed
- **WCAG AA accessibility pass — all muted text** (`styles/globals.css`, `app/page.tsx`, `app/rsvp/page.tsx`, `app/photos/page.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx`, `app/global-error.tsx`):
  Every opacity-based muted text value (`text-dark-teal/{n}` with n < 70) that conveys information was replaced with a new solid accessible token `text-teal-muted` (`#3d5c54`).
  - **Contrast ratios verified**: 7.0:1 on the cream background (`#faf9f6`) and 5.3:1 on the mint background (`#c5e0da`) — WCAG AAA on the primary surface, WCAG AA on mint. Every replaced value previously failed WCAG AA (ranging from ~1.3:1 at `/20` to ~3.6:1 at `/60`).
  - **Token added**: `--teal-muted: #3d5c54` registered in `:root` and `@theme` of `globals.css` as `--color-teal-muted`, making `text-teal-muted` / `bg-teal-muted` / `border-teal-muted` available throughout the Tailwind 4 theme.
  - **Scope**: applies to labels, dates, descriptions, venue info, form field labels, RSVP confirmation text, section taglines, footer credits, countdown unit labels, nav item numbers, error messages, loading subtitle, and 404 body text.
  - **Exemptions** (genuinely decorative — no informational purpose, WCAG SC 1.4.3 exception): nav separator dot `·`, countdown colon `:`, ghost "404" number, ghost "!" on error page, filigran card icon watermark. These remain at their existing low opacity.
  - `global-error.tsx` uses inline styles (renders before the stylesheet loads); its `rgba(29,61,55,0.4/0.5/0.2)` values were replaced with the hex literal `#3d5c54`.

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
