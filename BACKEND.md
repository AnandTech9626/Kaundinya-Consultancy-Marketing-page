# BACKEND & MONOREPO CONVENTIONS — READ THIS FIRST

> Mandatory for anyone (human or agent) working on the **backend / API**.
> If you are about to do any backend work, read this file completely before writing code.

---

## 1. Golden rules (do not break these)

1. **Backend code lives ONLY in `apps/api`.** Nothing backend-related goes in `apps/marketing` or `apps/app`.
2. **Never duplicate code across apps.** Shared code belongs in `packages/*`.
3. **`packages/*` are used by BOTH the marketing site (Astro) and the app (React).** Treat them as one single source of truth.
4. Before creating anything new, **check the existing `packages/*` first** — do not recreate something that already exists there.
5. **Do not touch `apps/marketing` or `apps/app` as part of backend work.** They are separate workspaces.
6. Keep commits scoped and clear, e.g. `feat(api): add enquiry endpoint`.

---

## 2. Monorepo map (this is fixed)

```
apps/
  marketing/   Astro static marketing site            -> Cloudflare Pages
  app/         React + Tailwind SPA (future)          -> Cloudflare Workers
  api/         Backend API                            -> Node server / Workers (see §3)
packages/
  ui/          Shared React components ("islands")    -> used by marketing AND app
  config/      Shared content, data, constants        -> used by marketing AND app
  tokens/      Shared design tokens / Tailwind preset -> used by marketing AND app
  db/          (future) shared DB schema + types      -> shared if API and app need them
```

- Each workspace is an npm workspace with a name under `@kaundinya/*`.
- `apps/marketing` = `@kaundinya/marketing`
- `apps/app` = `@kaundinya/app`
- `apps/api` = `@kaundinya/api`

---

## 3. Backend stack (agreed defaults for `apps/api`)

| Concern   | Choice                                      | Notes                                          |
| --------- | ------------------------------------------- | ---------------------------------------------- |
| Runtime   | Node.js `>= 22` + TypeScript (strict)       | Matches the rest of the monorepo               |
| Framework | **Hono**                                    | Lightweight; runs on Node now, Workers later   |
| Validation| **Zod**                                     | Single source of truth for request schemas     |
| ORM       | **Drizzle ORM** + Postgres (SQLite for dev) | TypeScript-first, keeps schema + types together |
| Env vars  | `.env` (gitignored) + committed `.env.example` | Never commit secrets                          |

### Directory layout inside `apps/api`

```
apps/api/
  src/
    routes/       route handlers (thin; parse + respond)
    services/     business logic
    db/           schema + queries (move to packages/db only if the app also needs it)
    middleware/   auth, validation, error handling
  .env.example
  package.json
  tsconfig.json
```

Package scripts for `@kaundinya/api`: `dev`, `build`, `start`, `typecheck`.

---

## 4. Packages are central — never copy

- **`packages/ui`** — React components shared by marketing (Astro islands) and the app. Add a component here ONCE, import it everywhere. Example already present: `BrandPrincipleCard` lives in the marketing app today; when it's shared, it moves to `packages/ui`.
- **`packages/config`** — content/data/constants. Marketing's `src/lib/constants.ts` will eventually move here so both frontends read the same data.
- **`packages/tokens`** — Tailwind preset / CSS variables shared by both frontends.
- If the API and a frontend need the **same type or data shape**, put it in a package (e.g. `packages/config` or a future `packages/db`), never copy it into two places.

---

## 5. What "done correctly" looks like

- All backend code is inside `apps/api` and builds with `npm run build --workspace @kaundinya/api`.
- Any shared type/constant/component lives in `packages/*` and is imported by both consumers.
- No duplicated logic between `apps/marketing`, `apps/app`, and `apps/api`.
- `apps/marketing` still builds untouched (`npm run build`).
