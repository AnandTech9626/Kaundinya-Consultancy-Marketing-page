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
| Status | Registered. DNS not yet pointed at Cloudflare. |

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

Grab the exact values from Resend → Domains → `kaundinya.co.in` after adding it
(region: Mumbai / `ap-south-1` if offered):

- `MX  send` → `feedback-smtp.ap-south-1.amazonses.com` priority 10
- `TXT send` → `v=spf1 include:amazonses.com ~all`
- `TXT resend._domainkey` → `p=MIGf...` (full DKIM value from dashboard)
- `TXT _dmarc` → `v=DMARC1; p=none; rua=mailto:<client email>`

Host field must contain only the host part (`send`, `resend._domainkey`,
`_dmarc`); Cloudflare appends the zone.

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
