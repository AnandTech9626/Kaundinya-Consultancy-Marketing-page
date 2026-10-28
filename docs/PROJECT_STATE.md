# PROJECT STATE — Handoff / Resume Guide

> **Purpose:** start a new opencode session and resume exactly where we left off.
> Paste this into the new session: *“Read `docs/PROJECT_STATE.md` and continue.”*
> This file is committed, so it survives across sessions.

---

## 1. What this repo is
Kaundinya Consultancy monorepo (npm workspaces):
- `apps/marketing` — Astro marketing site → **Cloudflare Pages**
- `apps/app` — React client portal (user) → **Cloudflare Workers** (worker `app`)
- `apps/admin` — React admin panel → **Cloudflare Workers** (worker `admin`)
- `apps/api` — **NOT OURS** (another dev). Do not touch.
- `packages/tokens` — Tailwind v4 theme (gold `#F5B900`, charcoal `#171717`, ivory `#F7F4EC`, border `#E5DFD1`, Manrope/Inter/Playfair)
- `packages/ui` — shared React components (Card, Button, Input, Select, Textarea, FormField, Badge, SectionHeading, StatCard, Spinner, Skeleton, OtpVerification)
- `packages/config` — shared constants (`SITE_INFO`, `SERVICE_CATEGORIES`, `CONTACT_PERSONS`) + all TS types

## 2. Live URLs
| App | URL |
| --- | --- |
| Marketing (Pages) | https://kaundinya.pages.dev |
| Client app (Workers) | https://app.kaundinya.workers.dev |
| Admin (Workers) | https://admin.kaundinya.workers.dev |

`workers.dev` account subdomain = **`kaundinya`**.

## 3. Git
- Working branch: **`sagar/dev`**
- Flow: `sagar/dev` → `developer` → `main` (never straight to main)
- Deploy happens on push to `main`.

## 4. CI/CD (GitHub Actions)
- `.github/workflows/ci.yml` — typecheck + build for **marketing, app, admin** (on PR/push to main/developer)
- `.github/workflows/deploy.yml` — marketing → Pages project `kaundinya` (env `PUBLIC_APP_URL=https://app.kaundinya.workers.dev`)
- `.github/workflows/deploy-app.yml` — app → Workers `app`
- `.github/workflows/deploy-admin.yml` — admin → Workers `admin`
- Secrets required: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## 5. Build / run commands
```
npm install
npm run dev         # marketing (Astro, :4321)
npm run dev:app     # app (Vite, :5173)
npm run dev:admin   # admin (Vite, :5175)
npm run check       # marketing astro check
npm run build       # marketing
npm run typecheck:app   ; npm run build:app
npm run typecheck:admin ; npm run build:admin
```

## 6. What is BUILT (all UI, mock data — no backend yet)
### Marketing
- Home, About, Services (4 categories), Contact, Privacy.
- Enquiry form + consultation modal: **“Send Verification Code”** → redirects to
  `{PUBLIC_APP_URL}/login?mobile=<10 digits>&step=otp` (email regex fixed).

### Client app (`apps/app`)
- Login/OTP (accepts `?mobile=&step=otp` handoff), mock session (`localStorage`).
- Dashboard (KPIs + recent), My Requests (filter), Request Detail (timeline),
  Services (master–detail: tabs + live preview; mobile accordion), Service Detail (request form),
  Profile (two-column rail), Notifications.
- Mock data layer: `apps/app/src/lib/mockApi.ts` (+ `useAsync`, `mockData`, `status`, `formats`, `icons`).

### Admin (`apps/admin`) — single role, mock login
- Login → Overview (KPIs + by-service/by-status bars), Enquiries (list/search/filter), Enquiry Detail
  (status/assign/notes), Clients, Requests, Team, Services (catalog), Notifications (broadcast),
  Settings. Mock layer: `apps/admin/src/lib/mockApi.ts`, data in `mockData.ts`.
- **Pipeline** (`/pipeline`): generic per-module stage board (Real Estate, Insurance,
  Home Services, Loans); click a card to advance it. `pipelineData.ts` + `fetchPipeline` /
  `updatePipelineStatus`.

### Phase 0 foundation (shared)
- `packages/config`: `SERVICE_CATALOG` (sub-services, tiers, per-sqft pricing, issue types,
  required docs), `MODULE_STAGES`, `MODULE_META`, `COMPLIANCE`; request envelope v2
  (`RequestEnvelope`) + module detail types; records for property/site visit/valuation/
  policy/job/loan.
- `packages/ui`: `Stepper`, `StatusTimeline`, `Wizard`, `FileDropzone`, `PillSelect`,
  `CalendarSlotPicker`, `PincodeInput`, `CalculatorPanel` + `RangeField`, `PipelineBoard`.

### Module 1 — Real Estate (1.1–1.5 UI built)
- `/real-estate` — search: rent/buy, locality/pincode, BHK, budget, property cards,
  upcoming site visits, RERA + DPDP notice.
- `/real-estate/:id` — detail, amenities, compliance, site-visit booking
  (`CalendarSlotPicker`), financing estimate deep-linked to `/loans`, buying/renting
  accordions, KYC `FileDropzone`, home-services cross-sell.
- `/real-estate/list` — 4-step wizard (basics → pricing → amenities → photos) → draft listing.
- `/real-estate/valuation` — free valuation request → `ValuationRequest`.

### Module 3 — Property Management & Home Services (UI built)
- `/home-services` — grouped catalog with per-sq.ft/fixed/tier pricing, active-job banner,
  free measurement and job-tracker CTAs.
- `/home-services/:serviceId` — tiers, issue chips, address/pincode, slot picker, uploads,
  book job or free measurement.
- `/home-services/measurement` — free laser-measurement booking → `MeasurementBooking`.
- `/home-services/documents` — watermarked secure upload portal + uploaded files.
- `/home-services/printouts` — live per-page pricing, auto-delete promise, print history.
- `/home-services/interiors` — portfolio gallery + free consultation form.
- `/jobs` + `/jobs/:id` — live tracker, technician card, Start-Job OTP, post-job rating.

### Module 2 — Insurance (UI built)
- `/insurance` — plan hub, needs-analysis calculator (`CalculatorPanel` + `RangeField`),
  compare up to 3 plans, consultation CTAs, IRDAI/DPDP notices.
- `/insurance/health` — Self / Spouse / Parents toggle, family floater plans, cashless
  network search by pincode.
- `/insurance/motor` — registration → vehicle lookup → quote/add-ons → mock UPI checkout →
  issued policy.
- `/insurance/policies` — Policy Vault with renewal alerts and mock PDF download.

### Module 4 — Loans (UI built)
- `/loans` — live EMI calculator, eligibility estimator, product cards, application tracker.
- `/loans/apply` — 4-step wizard (product/employment → amount/tenure/income → docs → review),
  GSTIN autofill for business loans.
- `/loans/applications/:id` — 5-stage tracker, documents, advisor.
- `/loans/credit-health` — soft-pull result with eligible products (no CIBIL impact copy).

### Admin module screens
- `/properties` — listing moderation (publish/reject/sold/rented).
- `/valuations` — valuation queue with scheduling/completion.
- `/site-visits` — schedule, adviser assignment, confirm/complete/cancel.
- `/dispatch` — technician assignment + job status advance + ratings.
- `/renewals` — 30-day renewal queue with reminder trigger.
- `/pipeline` — generic per-module stage board.

### Data / shared
- `apps/app/src/lib/moduleData.ts` — properties, site visits, valuations, insurance plans,
  hospitals, vehicles, measurements, jobs, documents, print jobs, interiors, policies, loans.
- `apps/admin/src/lib/moduleAdminData.ts` — admin property/valuation/site-visit/job/renewal data.
- Dashboard quick module cards + sidebar entries for all four modules.

## 7. Docs (hand-off)
- **`docs/api-contract.md`** — complete API spec. **§10 maps every mock function to an
  endpoint**; §12 defines all module endpoints + exact JS payload shapes (UI-built);
  **§13 covers free-vs-paid third-party integrations** (Vahan, bureau, GSTIN, SMS, UPI,
  storage, DigiLocker) with 2026 pricing/regulatory notes. Send to the backend team as the
  source of truth.
- **`docs/roadmap-modules.md`** — phased plan for the 4 modules (all UI phases implemented).

## 8. Secrets / credentials (NOT in repo)
- Local only: `cloudflare.local.env` (git-ignored) — Cloudflare Account ID + Workers/Pages API tokens + URLs.
- ⚠️ The API tokens were shared in a chat earlier — **rotate/revoke** at
  https://dash.cloudflare.com/profile/api-tokens if concerned.

## 9. Pending / next work
### Blocked on backend
- Replace mocks with real `fetch`: `apps/app/src/lib/mockApi.ts`, `apps/admin/src/lib/mockApi.ts`,
  `apps/marketing/src/lib/api.ts`.
- Real OTP send/verify → token; persist enquiries/requests/notifications; admin data; staff auth.
- Wire `PUBLIC_API_BASE_URL`.

### All UI phases — DONE
- Phase 0, Module 1 (1.1–1.5), Module 3, Module 2, Module 4, and all admin module screens
  are built against mocks. Nothing else is blocked on design decisions.

### Can do now (no backend)
- Backend hand-off only: share `docs/api-contract.md` §10/§12 and wire the mock internals.
- Optional polish: richer admin charts, mobile table refinements, remove dead marketing code
  (`marketing/src/lib/api.ts`, legacy `redirectToApp` — marketing is locked, ask first).
- Optional: admin Stitch designs (partially started — Admin project `17393593163600204216`,
  Admin Login screen done; Overview generation was timing out).

### Frontend polish — DONE
- Module notifications feed (renewal/job/loan/site-visit) with deep links + single-read.
- Property → loan application prefill (`propertyId`, amount, purpose).
- Admin Team add/edit/deactivate and Services management (price/active).
- App favicon; route-level code splitting for app + admin (main chunks now < 500 kB).
- Stalled-loan advisor prompt; listing success move-in cross-sell.

## 10. Conventions / rules
- **Never touch `apps/api`.**
- Types in `packages/config`; shared UI in `packages/ui`; don’t duplicate across apps.
- Marketing is currently “locked” — only change when explicitly asked (email fix was requested).
- Keep everything responsive + reuse the same design tokens.
- No secrets committed.

## 11. Session log
- **2026-10-28 (final polish)** — Module notifications feed, property→loan prefill, admin
  Team/Services management, app favicon, route-level code splitting, stalled-loan prompt,
  listing cross-sell. Contract added admin staff/services + single-notification read.
  **Merged to `developer` and `main`:** commit `c77fbeb` (previous batch). New polish
  commits remain on `sagar/dev` until merged.
- **2026-10-28 (later)** — Completed all remaining UI: Module 1.4–1.5, Module 3 (catalog,
  booking, measurements, jobs/OTP/rating, documents, printouts, interiors), Module 2
  (hub/calculator/compare, health, motor, policy vault), Module 4 (EMI, eligibility,
  apply wizard, tracker, credit health), and admin Properties/Valuations/Site Visits/
  Dispatch/Renewals. `docs/api-contract.md` §10/§12 reconciled with **every** mock
  function. Typecheck/build green for app + admin; marketing untouched.
- **2026-10-28** — Phase 0 + Module 1.1–1.3 built (catalog, widgets, admin pipeline,
  property search/detail/listing/valuation, site-visit booking). `typecheck:app`,
  `typecheck:admin`, `build:app`, `build:admin` all green. `docs/api-contract.md` §10/§12
  updated to match the mock shapes. Marketing untouched.

_Resume: “Read docs/PROJECT_STATE.md and continue.”_
