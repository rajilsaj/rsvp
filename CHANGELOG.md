# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-05-27

### Changed

#### RSVP Form — Controlled Inputs & Per-Field Validation (`app/rsvp/page.tsx`)

- Added `touched` state to track which fields the user has interacted with, so errors only appear after a field loses focus (not on initial render).
- Added `errors` state with per-field error messages driven by a shared `validateFields()` function.
- Added live re-validation on `onChange` — once a field is touched, its error clears immediately as the user types a valid value.
- Added `onBlur` handlers on all text inputs to trigger field-level validation.
- Submit now marks all fields as touched and runs full validation before posting — invalid forms are blocked with inline error feedback instead of silently failing.
- Inputs display a red border when they are touched and invalid.
- Error messages appear below each field in red.
- Attending buttons turn red-bordered when submit is attempted without a selection.
- Replaced single bottom-level `error` state with a dedicated `submitError` for API-level errors, keeping field errors and network errors separate.
- Added `noValidate` to the `<form>` element to disable browser-native validation bubbles in favor of the custom error UI.

#### Validation rules

| Field | Rule |
|---|---|
| Full Name(s) | Required |
| Phone | Required, minimum 10 digits |
| Email | Optional — validated only if a value is entered |
| Attending | One of yes / no must be selected |
| Plus Ones | No validation — stepper clamped to 0–10 |

---

### Previous Updates

#### App Structure Alignment (`2026-05-27`)
- Replaced token-based `/rsvp/[token]` route with a single public `/rsvp` page.
- Renamed `lib/googlesheet.ts` to `lib/google-sheets.ts` with the correct column schema (Id, Names, Phone, Email, Attending, PlusOnes, Table, Seats, OptOut) — removed Token, Sent, Clicked columns.
- Removed `app/find-seat/`, `app/api/rsvps/`, `lib/tokens.ts`, `lib/phone.ts`, `lib/seating.ts`, and `script/sendInvites.ts`.
- Simplified `/api/guests` to GET-only for admin use.
- Updated `/api/updates` to remove the "new guests" target (which depended on the removed `Sent` column).
- Fixed hydration mismatch in `app/page.tsx` — replaced `typeof window !== "undefined"` in JSX with a `useEffect`-initialized state value.
- Removed token-specific UI from admin guests page (copy link, Sent/Clicked columns).
- Plus Ones field made always visible on the RSVP form (no longer conditional on Attending = yes), using a stepper (−/+) instead of a dropdown.
