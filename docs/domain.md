# Domain, DNS and Email (OTP) — working notes

Last updated: 2026-11-19

This file is the single source of truth for the `kaundinya.co.in` rollout:
domain ownership, DNS, Cloudflare surfaces, Resend email-OTP setup and the
open items. Keep it updated as each step completes.

---

## 1. Domain record

| Field | Value |
| --- | --- |
| Domain | `kaundinya.co.in` |
| Registrar | GoDaddy India |
| Bought | 2026-11-19 (personal account) |
| Account email | `gudipudimani63@gmail.com` |
| First-year price | ₹99 + 18% GST (≈ ₹116.82), new-customer 1-year promo |
| Renewal | ₹749–799 + 18% GST per year |
| Auto-renew | ON |
| Renewal reminders | **PARKED — set up tomorrow** (calendar + verify GoDaddy emails) |
| WHOIS privacy | Not available on `.co.in` (registry restriction) |
| Status | **Live delegation.** KYC cleared 2026-11-20; GoDaddy nameservers changed to `holly.ns.cloudflare.com` / `norman.ns.cloudflare.com`; Cloudflare zone `cbd55a1c50bb409a756d7ec0f90b47bc` is **active**. |

Ownership note: the account is in the developer's name. The client asked to be
told at renewal time. GoDaddy supports a free "move domain to another GoDaddy
account" later if the client ever wants ownership; no 60-day lock applies to
account moves (that lock is for registrar transfers).

---

## 2. Target DNS map (after cutover)

| Hostname | Target | Proxy |
| --- | --- | --- |
| `kaundinya.co.in` | Pages project `kaundinya` | proxied |
| `www.kaundinya.co.in` | Pages project `kaundinya` | proxied |
| `app.kaundinya.co.in` | Worker `app` | proxied |
| `admin.kaundinya.co.in` | Worker `admin` | proxied |
| `api.kaundinya.co.in` | Vercel `kaundinya-backend` → `cname.vercel-dns.com` | **DNS-only** |
| `send.kaundinya.co.in` | Resend MX + SPF | MX/TXT |
| `resend._domainkey` | Resend DKIM | TXT |
| `_dmarc` | `v=DMARC1; p=none; rua=mailto:...` | TXT |

Decision taken: **DNS authority moves to Cloudflare** (free plan), nameservers
changed at GoDaddy. This makes apex + `www` attach to Pages cleanly and keeps
Resend records in one place.

Rollback: re-enter the two GoDaddy nameservers (captured before the change).

---

## 3. Email / OTP (Resend)

The marketing "Send Verification Code" and the app login use **email OTP**
(`POST /api/otp/send` with `{ email }`). Resend requires a verified domain
before it will send to arbitrary recipients.

### Records Resend will ask for

Resend's 2026 layout for this domain (region `apne1`, verified 2026-11-20):

| Type | Name | Content | Proxy | Status |
| --- | --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGf...` (full DKIM value) | n/a | verified |
| CNAME | `rsend` | `rsend-apne1.forge.rmta.net` | DNS only | verified |
| CNAME | `send` | `send.forge.rmta.net` | DNS only | live in DNS, Resend lagging |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | n/a | added 2026-11-20 |

Public DNS confirms all four (`send.kaundinya.co.in` resolves through the CNAME to
`v=spf1 include:amazonses.com ~all`). Resend's `send` row may still show
`pending` until its verifier re-runs.

Optional and **not** enabled: Resend "Enable receiving" adds `MX @` ->
`receive-apne1.forge.rmta.net` (priority 10). Skip it until inbound mail exists.

Host field must contain only the host part (`send`, `rsend`,
`resend._domainkey`, `_dmarc`); Cloudflare appends the zone. CNAMEs must be
**DNS only (grey cloud)**.

### Backend env (Vercel — `kaundinya-backend`)

| Variable | Current (local) | Target |
| --- | --- | --- |
| `EMAIL_PROVIDER` | `resend` | `resend` |
| `RESEND_API_KEY` | set | keep |
| `EMAIL_FROM` | set | `Kaundinya Group <no-reply@kaundinya.co.in>` |
| `EMAIL_REPLY_TO` | set | client email |
| `EMAIL_TEST_REDIRECT` | **set (non-empty)** | **clear — otherwise all OTPs redirect** |
| `PUBLIC_BASE_URL` | local | `https://api.kaundinya.co.in` |
| `CORS_ORIGINS` | local | apex + www + app + admin |

SMS is **not** part of this rollout: `FAST2SMS_SENDER_ID` and
`FAST2SMS_TEMPLATE_ID` are empty, so the DLT route cannot send. Marketing OTP is
email-only today.

---

## 4. Cloudflare inventory (verified via API on 2026-11-19)

Account `b811941795b09ce62ffbc94cc72696b6` — "Gudipudimani63@gmail.com's Account"
(this is the account the repo's tokens target):

| Type | Name | Notes |
| --- | --- | --- |
| Pages | `kaundinya` | **live marketing** — `kaundinya.pages.dev` (200) |
| Pages | `kaundinyaconsultancy` | legacy duplicate, stale since 2026-11-02 (200) |
| Worker | `app` | client app — `app.kaundinya.workers.dev` (200) |
| Worker | `admin` | admin console — `admin.kaundinya.workers.dev` (200) |
| Worker | `kaundinya-consultancy-marketing-page` | stray Git-integration worker |
| Worker | `vault-icons` | unrelated project |
| Pages | `ansa1734`, `zaithra`, `ansa-dental`, `shiftmatch` | unrelated projects |

Second account `8d7d5b47ce333c694841813c0980427d` — still linked to this GitHub
repo via the Cloudflare Git integration. It produces the failing PR checks:

- Pages `kaundinya-consultancy-marketing-page` (522)
- Pages `kaundinya-consultancy-marketing-page-updated` (522)
- Worker `kaundinya-consultancy-marketing-page` (build fails)

These are **not** the live site. Disconnect the repo / delete those projects in
that account so they stop running on every push (dashboard access needed).

Worker name collision: `admin` is declared in both
`apps/admin/wrangler.jsonc` (unused) and the separate `kaundinya-admin` repo.
Only one worker can own the name — keep the active repo, rename the other.

---

## 5. Repo CI/CD facts and fixes

Workflows:
- `.github/workflows/deploy.yml` — marketing → Pages project `kaundinya`
- `.github/workflows/deploy-app.yml` — app → Worker `app`
- `.github/workflows/ci.yml` — astro check + builds on PRs to `developer`/`main`

Problems found on 2026-11-19:
1. `CLOUDFLARE_API_TOKEN` secret was invalid for Workers (`9109`) and the single
   token cannot cover both products. Added two scoped secrets:
   `CLOUDFLARE_API_TOKEN_PAGES` and `CLOUDFLARE_API_TOKEN_WORKERS`.
   **Workflow files still reference the old secret** — blocked by the git
   credential lacking the `workflow` scope.
2. `CLOUDFLARE_ACCOUNT_ID` updated to `b811941795b09ce62ffbc94cc72696b6`.
3. Repo variable `VITE_API_BASE_URL` pointed at `https://kaundinyaconsultancy.com`
   which does **not resolve**. Changed to `https://kaundinya-backend.vercel.app`.
4. `apps/marketing/astro.config.mjs` sets `site` to
   `https://kaundinyaconsultancy.pages.dev`; must become `https://kaundinya.co.in`
   during cutover.

Because of (1), pushes to `main` still fail the two Deploy workflows. Manual
deploys on 2026-11-19 succeeded and are live:
- App worker version `aa87e3d8-dd1f-4139-968e-8316d1e62da5`, built against
  `https://kaundinya-backend.vercel.app`.
- Pages production deployment at commit `65e5827`, branch `main`.

---

## 6. Open items

- [x] **Clear GoDaddy Registrar Hold** — KYC finished 2026-11-20; nameserver
      editing is enabled.
- [x] **Complete GoDaddy KYC ("Validate")** — domain no longer `Idle`.
- [x] **Cloudflare zone is pending delegation** — set the GoDaddy nameservers to
      `holly.ns.cloudflare.com` and `norman.ns.cloudflare.com`.
- [x] **Cloudflare zone active** — delegation confirmed 2026-11-20.
- [ ] **New Resend API key** — the key stored in `kaundinya-backend/.env` returns
      401 Unauthorized; rotate it and update Vercel + local env before OTP tests.
- [ ] **CI**: refresh git credentials with `workflow` scope (`gh auth refresh -s workflow`)
      or push workflow edits from an IDE, then switch the two deploy workflows to
      the per-service tokens.
- [ ] **Renewal reminders** (parked to 2026-11-20): calendar event ~30 days
      before expiry + confirm GoDaddy renewal emails are enabled and not in spam.
- [ ] **Cloudflare zone**: add `kaundinya.co.in`, change GoDaddy nameservers.
- [ ] **Resend**: add domain, publish DKIM/SPF/DMARC, verify, send test.
- [ ] **Clear `EMAIL_TEST_REDIRECT`** in Vercel production env.
- [ ] **Custom domains**: apex/www → Pages, `app`/`admin` → workers,
      `api` → Vercel (DNS-only).
- [ ] **Env switch**: `PUBLIC_API_BASE_URL`, `PUBLIC_APP_URL`,
      `VITE_API_BASE_URL` → `*.kaundinya.co.in`; update workflows + Astro `site`.
- [ ] **Cleanup**: retire `kaundinyaconsultancy` Pages project, disconnect the
      `8d7d5b47...` Git integration, resolve the duplicate `admin` worker name.
- [ ] **Ownership handover** (decision deferred): Resend + Vercel accounts and
      the GoDaddy account; client only asked to be told at renewal.

---

## 7. Changelog

- 2026-11-19 — `kaundinya.co.in` purchased on GoDaddy (personal account);
  auto-renew ON; renewal reminders parked.
- 2026-11-19 — App + marketing code merged to `main` (`57397e8`); CI green.
- 2026-11-19 — Found dead `VITE_API_BASE_URL`, invalid CI token, duplicate
  Cloudflare projects; repo variable fixed, scoped secrets added.
- 2026-11-19 — Manual production deploys succeeded (app worker + Pages).
- 2026-11-19 — Cloudflare zone added, but registry RDAP still returns 404 and
  DNS is NXDOMAIN for `kaundinya.co.in`: the GoDaddy purchase may not have
  completed. Verify the order before changing nameservers.
- 2026-11-19 — GoDaddy shows the domain as Active but blocks nameserver edits
  with **Registrar Hold**. DNS cutover is blocked until support clears it.
- 2026-11-19 — GoDaddy triggered identity verification through **DigiLocker**
  (masked Aadhaar + name/DOB/gender, consent valid 31 days) to clear the hold.
  No identity numbers are recorded in this repo.
- 2026-11-19 — GoDaddy also requires **account email verification** before the
  site hold is lifted; awaiting the verification email on the account address.
- 2026-11-19 — Registry-policy **KYC/contact validation** step reached: the
  registrant name/phone on the domain must match the Aadhaar identity exactly
  before clicking Verify. Contact data is not stored in this repo.
- 2026-11-19 — GoDaddy domain page shows status **Idle** with a KYC banner and a
  **Validate** button; nameserver changes stay disabled until KYC completes.
  Current nameservers are GoDaddy defaults (`NS47/NS48.DOMAINCONTROL.COM`).
- 2026-11-19 — Registrant contact update submitted and is "in progress".
  GoDaddy's QR prompt is only the optional mobile app (sensitive-change
  approvals / 2FA); it is not required for KYC. Await registry sync, then
  re-run Validate.
- 2026-11-19 — GoDaddy states KYC can take **up to 24 hours**; the domain is not
  functional until verification completes. Re-check on 2026-11-20; if the status
  is still `Idle`, open GoDaddy support chat.
- 2026-11-19 — Added `scripts/check-domain.mjs` (`npm run check:domain`) so the
  next session can verify NS, DNS, Resend and HTTPS in one command; ignored
  stray local log files.
- 2026-11-20 — KYC cleared at GoDaddy; nameserver editing enabled. Cloudflare
  zone `cbd55a1c50bb409a756d7ec0f90b47bc` assigned
  `holly.ns.cloudflare.com` / `norman.ns.cloudflare.com` (status `pending`).
  Next action: set those two at GoDaddy, wait for the zone to become `active`.
- 2026-11-20 — GoDaddy nameservers switched; Cloudflare zone is **active** and
  Google DNS resolves the Cloudflare pair. Automation limits found: the stored
  Resend key returns 401 and neither Cloudflare token has DNS:Edit, so the
  Resend records must be added in the dashboard (or with a new DNS-edit token).

---

## 8. Manual cutover steps (click-by-click)

Use the account that owns the domain and the Cloudflare projects
(`b811941795b09ce62ffbc94cc72696b6`). Deep links may ask you to pick an account.

### Phase 1 — Cloudflare zone

1. Open <https://dash.cloudflare.com/?to=/:account/add-site>
2. Enter `kaundinya.co.in` → **Continue** → select **Free** → **Continue**.
3. Let Cloudflare scan existing DNS, keep whatever it finds (there should be
   little or nothing on a fresh domain) → **Continue**.
4. Copy the **two nameservers** shown, e.g. `ada.ns.cloudflare.com` and
   `bob.ns.cloudflare.com`.

### Phase 2 — GoDaddy nameservers

5. Open <https://dcc.godaddy.com/control/portfolio> and click `kaundinya.co.in`
   (direct: <https://dcc.godaddy.com/control/portfolio/kaundinya.co.in/settings>).
6. **Nameservers** tab → **Change nameservers** → choose *I'll use my own
   nameservers* → paste both Cloudflare nameservers → **Save** → confirm.
7. Screenshot the previous nameservers first — that is the rollback path.

### Phase 3 — wait for activation

8. Watch <https://dash.cloudflare.com/?to=/:account/kaundinya.co.in> until the
   zone status is **Active** (usually 15–60 minutes, up to 24h).
9. Do not edit GoDaddy DNS after this point — GoDaddy DNS is inert once the
   nameservers move.

### Phase 4 — Resend

10. Open <https://resend.com/domains/create>.
11. Enter `kaundinya.co.in`; region is chosen by Resend (this account resolved
    to `apne1`).
12. Add the records Resend shows (2026 layout):
    - `TXT resend._domainkey` -> full `p=MIGf...` DKIM value (verified)
    - `CNAME rsend` -> `rsend-apne1.forge.rmta.net`, proxy **DNS only**
    - `CNAME send` -> `send.forge.rmta.net`, proxy **DNS only**
    - `TXT _dmarc` -> `v=DMARC1; p=none;`
13. Add them at
    <https://dash.cloudflare.com/?to=/:account/kaundinya.co.in/dns/records>.
    In the **Name** field enter only the host part (`send`, `rsend`,
    `resend._domainkey`, `_dmarc`); Cloudflare appends the zone.
14. Return to <https://resend.com/domains> and click **Verify**.
    Recheck after 30 minutes; DNS can take up to 24h.

### Phase 5 — attach custom domains (after Resend is green)

15. Pages: <https://dash.cloudflare.com/?to=/:account/pages/view/kaundinya> →
    **Custom domains** → add `kaundinya.co.in` and `www.kaundinya.co.in`.
16. Worker app:
    <https://dash.cloudflare.com/?to=/:account/workers/services/view/app> →
    **Settings → Domains & Routes** → **Add custom domain** →
    `app.kaundinya.co.in`.
17. Worker admin: same flow for `admin.kaundinya.co.in` — resolve the duplicate
    `admin` name in `apps/admin/wrangler.jsonc` (unused) first.
18. Vercel backend: <https://vercel.com/dashboard> → `kaundinya-backend` →
    **Settings → Domains** → add `api.kaundinya.co.in`. Then in Cloudflare create
    `CNAME api → cname.vercel-dns.com` with **proxy OFF (DNS only)**.

### Phase 6 — env + redeploy

19. Vercel env: `EMAIL_FROM`, `EMAIL_REPLY_TO`, clear `EMAIL_TEST_REDIRECT`,
    `PUBLIC_BASE_URL`, `CORS_ORIGINS` (see §3). Redeploy.
20. GitHub repo variables/secrets:
    <https://github.com/AnandTech9626/Kaundinya-Consultancy-Marketing-page/settings/secrets/actions>
    and `.../settings/variables/actions`.
21. Update `apps/marketing/astro.config.mjs` `site` to `https://kaundinya.co.in`,
    then PR → `developer` → `main`.

---

## 9. One-command verification

```bash
npm run check:domain
```

Runs `scripts/check-domain.mjs`: resolves NS, apex/www/app/admin/api records,
Resend MX + SPF + DKIM + DMARC, and hits the five HTTPS endpoints. Prints
`OK` / `PENDING` / `MISSING` per row and exits non-zero while anything is still
missing. Pass a different domain with
`node scripts/check-domain.mjs example.com`.

There is no unattended automation: GoDaddy nameserver edits, Cloudflare custom
domains and Resend verification are all dashboard actions, and the KYC gate is
manual. The script is the "run once and see everything" step for the next
session.

---

## 10. Next-session checklist (2026-11-20)

Ordered. Steps 1-2 are hard gates; nothing below works until they pass.

- [ ] 1. **KYC wait ends.** GoDaddy -> `kaundinya.co.in`: status must be
      **Active** (not `Idle`) and the KYC banner gone. Still `Idle` after 24h ->
      support chat: "KYC for kaundinya.co.in pending 24h, registrant name must
      match Aadhaar, please escalate."
- [ ] 2. **Nameservers.** GoDaddy -> Nameservers -> Change -> "I'll use my own" ->
      paste the two `*.ns.cloudflare.com` values -> Save. Then Cloudflare
      Overview -> **Check nameservers now** -> wait for **Active**.
- [ ] 3. **Resend.** Add `kaundinya.co.in` (Mumbai) if not already added; publish
      `send` MX, `send` SPF TXT, `resend._domainkey` TXT, `_dmarc` TXT in
      Cloudflare DNS; click **Verify**.
- [ ] 4. **Vercel env.** Set `EMAIL_FROM`, `EMAIL_REPLY_TO`, `PUBLIC_BASE_URL`,
      `CORS_ORIGINS`; **clear `EMAIL_TEST_REDIRECT`**; redeploy.
- [ ] 5. **Custom domains.** Pages apex + `www`; Worker `app`; Worker `admin`
      (after resolving the duplicate `admin` name); Vercel `api` with
      **proxy OFF** in Cloudflare.
- [ ] 6. **Code PR.** `apps/marketing/astro.config.mjs` `site` -> new domain;
      workflow build envs -> new URLs; merge `sagar/dev` (docs, script, CI
      token fix) -> `developer` -> `main`.
- [ ] 7. **Run** `npm run check:domain`; all rows `OK`; send one real OTP from
      the marketing form and confirm SPF/DKIM/DMARC pass.
- [ ] 8. **Cleanup.** Disconnect repo from Cloudflare account `8d7d5b47...`;
      retire Pages `kaundinyaconsultancy`; confirm only one `admin` worker.
- [ ] 9. **Renewal reminder** (parked from 2026-11-19): calendar event ~30 days
      before expiry + confirm GoDaddy renewal emails are enabled.
- [ ] 10. **CI unblock.** Run `gh auth refresh -h github.com -s workflow`, then
      push the pending two-line workflow change (currently unstaged locally).

- 2026-11-20 - Email DNS complete: DKIM verified, send CNAME verified,
  send CNAME live (Resend verifier lagging), _dmarc added.
- 2026-11-20 - Attached custom domains via API: Pages kaundinya.co.in +
  www (status pending, needs the two CNAMEs to kaundinya.pages.dev),
  Worker pp.kaundinya.co.in, Worker dmin.kaundinya.co.in (DNS resolves,
  edge certificate still provisioning).

- 2026-11-20 - Apex CNAME kaundinya.co.in -> kaundinya.pages.dev (proxied) added;
  hitting the Cloudflare edge returns the real marketing site (local resolvers
  still show a cached GoDaddy lander).
- 2026-11-20 - DNS cleanup required: send currently has CNAME + TXT + MX at the
  same name (invalid), and the MX content is the literal placeholder
  eedback-smtp.<region>.amazonses.com. Delete that MX and the legacy SPF TXT,
  keep only the send CNAME. www CNAME is still missing.

- 2026-11-20 - All four hostnames serve through the Cloudflare edge: apex and www
  return the marketing site, app and admin return the client app. Verified with
  curl against the edge IP (local resolvers still cache the old lander).
- 2026-11-20 - Still present at send: the placeholder MX
  (eedback-smtp.<region>.amazonses.com) and the legacy SPF TXT
  (=spf1 include:amazonses.com ~all). Both must be deleted so the CNAME can
  verify in Resend.

- 2026-11-20 - Vercel: pi.kaundinya.co.in added (verified) and Cloudflare CNAME
  pi -> cname.vercel-dns.com created (DNS only). Backend env updated:
  RESEND_API_KEY rotated, EMAIL_FROM=Kaundinya Group <no-reply@kaundinya.co.in>,
  PUBLIC_BASE_URL=https://api.kaundinya.co.in, CORS_ORIGINS set for apex/www/app/admin,
  EMAIL_TEST_REDIRECT deleted. Production redeployed (dpl_CvbygRos4N3hhaK3m78R5hY8Savq).
- 2026-11-20 - End-to-end OTP verified: POST /api/otp/send returned success and
  Resend shows the message from 
o-reply@kaundinya.co.in as **delivered**.
- 2026-11-20 - 
pm run check:domain: 11/15 rows OK; the four HTTP failures are
  local resolver cache only (verified 200 via curl --resolve against the edge /
  Vercel IPs). Resend domain stays partially_verified only because the optional
  "Receiving" MX is not added.