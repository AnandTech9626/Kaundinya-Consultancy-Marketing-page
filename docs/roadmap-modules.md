# Kaundinya — 4-Module Roadmap (Phased)

> **Scope:** turn the 4 services (Real Estate, Insurance, Property Management & Home Services, Loans)
> from the current *generic request* MVP into the full module experiences described in the
> “Business & UX Architecture” brief.
>
> **Where it's built:** all UI in **`apps/app`** (client portal) + relevant screens in **`apps/admin`**.
> **Backend:** UI-first with mock data (like today). `apps/api` is **not ours** — we only define the
> contract in `docs/api-contract.md`.
> **Design:** same tokens/components (`packages/tokens`, `packages/ui`, `packages/config`).

---

## Guiding principles
- **UI-first, mock-backed.** Every phase ships real screens against a mock layer; swap to real API later with no page rewrites.
- **No duplication.** Shared types in `packages/config`; shared components in `packages/ui`.
- **Per-module data models.** Replace the single generic `ServiceRequest` with module-specific payloads (property, policy, job, loan) that still share a common request envelope.
- **Status = domain-specific pipelines.** Real Estate / Jobs / Loans each get their own tracker states.
- **Compliance visible in UI** (TS-RERA, IRDAI POSP, RBI disclaimers, DPDP notices) — copy blocks each module must render.

---

## Phase 0 — Foundation (shared, do first)
Everything else depends on this.
- **Catalog expansion:** richer sub-services/tiers (per-sq-ft, service tiers, issue types) in `packages/config`.
- **Request envelope v2:** `BaseRequest { id, module, status, createdAt, assignedTo }` + module-specific `details` object.
- **Reusable widgets (packages/ui):**
  - `Stepper` / `StatusTimeline` (variable steps)
  - `Wizard` (multi-step form)
  - `Calculator` surface (EMI, premium, coverage)
  - `FileDropzone` (upload + compression hint)
  - `PillSelect` (issue/diagnostic chips)
  - `CalendarSlotPicker` (site visit / measurement)
  - `MapPicker` / pincode input
  - `StatCard`, tables already exist
- **Admin:** generic “pipeline board” (columns by status) reusable per module.
- **Mock layer:** `apps/app/src/lib/mockApi.ts` gains per-module functions.

**Deliverable:** catalog + components + envelope + admin pipeline shell.

---

## Module 1 — Real Estate

### Phase 1.1 — Discover (search + catalog)
- Routes: `/real-estate` (search), `/real-estate/:id` (property detail).
- Smart filters: **Location, Budget, BHK, Rent vs Buy**.
- Property cards: images, price, BHK, amenities icons (covered parking, 24/7 security).
- Lead CTA: “Enquire”, “Book Site Visit”.

### Phase 1.2 — Owner flows
- `/real-estate/list` — **listing wizard** (property type, floor, expected rent/price, features, photo upload).
- `/real-estate/valuation` — **“Book a Free Valuation”** lead form (expert physical assessment).

### Phase 1.3 — Scheduling
- `CalendarSlotPicker` for **Site Visit** booking → created as `SiteVisit`.
- Admin sees scheduled visits in a calendar list.

### Phase 1.4 — Docs / education + compliance
- Tooltips/accordions: stamp duty, TS-RERA, registration.
- Render **TS-RERA agent number** + DPDP/KYC notice.
- Optional in-app KYC upload (see `FileDropzone`).

### Phase 1.5 — Cross-sell
- On listing: prompt to book **Home Services** (AC/deep clean) before move-in.
- **Financing widget** on property detail: “Get this home for ₹X/month — Check Home Loan eligibility” (links to Module 4 calculator).

**Admin:** properties list, listings moderation, site-visit schedule, valuations queue.

---

## Module 2 — Insurance

### Phase 2.1 — Needs analysis & calculators
- `/insurance` hub (Life & Term, Health, Motor).
- **Coverage/premium calculators** (needs-analysis wizard: age, income, dependents, lifestyle).
- CTA is **“Schedule Expert Consultation”** (never “Buy now”).

### Phase 2.2 — Compare + Policy Vault + renewals
- Side-by-side **policy comparison** table.
- **Policy Vault** in dashboard: stored policy records + download.
- **Renewal alerts** (admin CRM triggers 30 days prior; client sees notification).

### Phase 2.3 — Health
- Family toggle (Self / Spouse / Parents) → dynamic age fields + policy filtering.
- **Network hospitals by pincode** (e.g. “145 cashless hospitals near Kukatpally”).

### Phase 2.4 — Motor (fast lane)
- Enter **vehicle registration number** → **Vahan** lookup (make/model/year) → quote → UPI → PDF policy.
- Target flow: number → pay → PDF in < 3 min.

### Phase 2.5 — Compliance
- Display **IRDAI / POSP license**; medical-data privacy (DPDP) notice.

**Admin:** quotes/leads, policy records, renewal pipeline, network-provider data (if managed).

---

## Module 3 — Property Management & Home Services

### Phase 3.1 — Catalog + measurement
- `/home-services` catalog with **per-sq-ft pricing** (nets, invisible grills) and tiles (AC service, electrical, interiors).
- **Free laser-measurement booking** (instead of asking sq-ft).

### Phase 3.2 — Diagnostic booking
- **PillSelect** issue chips (`[Not Cooling]`, `[Water Leaking]`, `[House Wiring]`) → accurate dispatch payload.

### Phase 3.3 — Document portal + printouts
- Secure **document portal** (Aadhaar/Voter updates) — uploads auto-watermarked “For Kaundinya ID Update Only”.
- **Printouts**: remote PDF upload with live pricing; auto-delete after print (state clearly in UI).

### Phase 3.4 — Live job tracker + OTP + rating
- Job status: **Accepted → Technician Assigned → En Route → Work in Progress → Rate Job**.
- **Start-Job OTP** the user shares with the technician.
- Post-job **rating** capture.

### Phase 3.5 — Interiors
- Portfolio **gallery** + “Book Initial Consultation”.

### Phase 3.6 — Admin dispatch
- Ticketing & **technician dispatch** board, assignment, live status updates, ratings view.

**Compliance:** labor compliance + digital liability waivers for high-risk work.

---

## Module 4 — Loans

### Phase 4.1 — Calculators + checklists
- **EMI calculator** + eligibility estimator; KYC **document checklist**.
- **5-step tracker**: Application → Verified → Submitted → Approved → Disbursed.

### Phase 4.2 — Home / Mortgage
- Auto-fill property details if arriving from Module 1.
- **Document dropzone** (payslips, ITR) with PDF auto-compression.
- **“Check Credit Health”** soft pull (no CIBIL impact) → route to bank/NBFC.

### Phase 4.3 — Personal loans
- Branching: **Salaried** (corporate email verify) vs **Self-employed** (business details).

### Phase 4.4 — Business loans
- **GSTIN** autofill (business name/address), annual turnover, P&L upload.
- Stalled apps → prompt “Consult a Kaundinya financial advisor”.

### Phase 4.5 — Compliance
- **RBI guidelines** disclaimer; final approval by banks; strict non-disclosure.

**Admin:** loan pipeline (5 stages), document review, credit-pull status, advisor assignment.

---

## Cross-cutting (all modules)
- **Dashboard** gains per-module cards/summaries.
- **Status trackers** per domain (Real Estate, Jobs, Loans).
- **Notifications**: renewals, job updates, loan stage changes.
- **Document storage** abstraction (upload/download/watermark/auto-delete).
- **Payments** (UPI) for motor insurance + printouts + service bookings (future).

---

## Integrations inventory (backend/3rd-party)
| Need | Used by |
| --- | --- |
| Vahan (vehicle) API | Motor insurance |
| Credit bureau soft pull | Loans (eligibility) |
| Banking partner APIs | Loans (submission) |
| UPI / payment gateway | Motor, printouts, bookings |
| KYC/OCR + secure storage | Real estate, loans, document portal |
| SMS/OTP provider | Jobs (Start-Job OTP), auth |
| Maps / pincode lookup | Network hospitals, service area |
| PDF generation/compression | Motor policy, loans, printouts |
| E-sign | Loans/agreements (future) |

---

## Recommended sequencing (fastest value first)
1. **Phase 0** — foundation (unblocks everything).
2. **Module 1** (Real Estate) — mostly UI, high visibility.
3. **Module 3** (Home Services) — mostly UI + job tracker.
4. **Module 2** (Insurance) — needs calculators + provider data.
5. **Module 4** (Loans) — most integrations/back-and-forth.

## Definition of done (per phase)
- Screens built in `apps/app` (+ admin where noted) against mock data.
- Types added to `packages/config`; reusable UI in `packages/ui`.
- `docs/api-contract.md` updated with the endpoints used.
- `typecheck` + `build` green; responsive (desktop + mobile).
- Deploy to Workers (`app`) / Pages (`kaundinya`) as appropriate.

_End of roadmap._
