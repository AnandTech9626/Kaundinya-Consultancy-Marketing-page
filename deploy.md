# DEPLOYMENT & CI/CD WORKFLOW — READ FIRST

> Mandatory for anyone merging branches or deploying. Follow this order exactly.

## 1. Branch flow (never skip)

```
sagar/dev (child)  ──►  developer  ──►  main  ──►  deploy
```

Rules:

1. All work happens on a child branch (e.g. `sagar/dev`).
2. **Merge the child branch into `developer` FIRST** (via a pull request).
   - Never merge a child branch directly into `main`.
3. Merge `developer` into `main` (via a pull request) only after `developer` is green.
4. **Deploy happens only after `main` is updated.**

## 2. CI pipeline (runs automatically)

`.github/workflows/ci.yml` runs on every pull request to `developer` and `main`:

1. `npm ci`
2. `npm run check` — `astro check` (typecheck)
3. `npm run build` — `astro build`

Rules:

- A PR that fails CI **must not be merged**.
- Enable **branch protection** (require a pull request + require the `CI` status check) on **both** `developer` and `main`.

## 3. CD / deployment

- **Marketing** (`apps/marketing`) → **Cloudflare Pages** (static Astro)
  - Build command: `npm install && npm run build`
  - Output directory: `apps/marketing/dist`
  - Deploys automatically on push to `main` via Pages Git integration.
- **App** (`apps/app`) → **Cloudflare Workers** (future)
- **API** (`apps/api`) → see `BACKEND.md` (future)

## 4. Correct order, summarized

1. Merge child branch → `developer` (CI must pass)
2. Merge `developer` → `main` (CI must pass)
3. `main` updated → Cloudflare Pages deploys automatically.
