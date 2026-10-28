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

## 7. Docs (hand-off)
- **`docs/api-contract.md`** — complete API spec (auth/OTP, client requests, notifications, admin,
  and §12 planned module APIs). Send to backend dev.
- **`docs/roadmap-modules.md`** — phased plan for the 4 modules (Real Estate, Insurance,
  Home Services, Loans).

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

### Can do now (no backend)
- Implement **Phase 0** foundation (see roadmap) in `apps/app` + `apps/admin`.
- Implement **Module 1 (Real Estate)** → Module 3 → Module 2 → Module 4 (order in roadmap).
- Admin polish: Team add/edit, Services manage, richer charts, mobile tables.
- App favicon link; remove dead code (`marketing/src/lib/api.ts`, legacy `redirectToApp`).
- Optional: admin Stitch designs (partially started — Admin project `17393593163600204216`,
  Admin Login screen done; Overview generation was timing out).

## 10. Conventions / rules
- **Never touch `apps/api`.**
- Types in `packages/config`; shared UI in `packages/ui`; don’t duplicate across apps.
- Marketing is currently “locked” — only change when explicitly asked (email fix was requested).
- Keep everything responsive + reuse the same design tokens.
- No secrets committed.

_Resume: “Read docs/PROJECT_STATE.md and continue.”_
