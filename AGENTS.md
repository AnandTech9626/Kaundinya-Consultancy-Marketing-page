# Agent Guide — Kaundinya Marketing + Client Monorepo

## Backend

The backend is a standalone repository:

```text
C:\Users\Sagar Babu\kaundinya-backend
```

Read that repo's `README.md`, `SKILLS.md`, and `docs/` before backend or API work.

The active admin console is also separate: `C:\Users\Sagar Babu\kaundinya-admin`.

## Structure

Monorepo with npm workspaces:

- `apps/marketing` — Astro marketing site
- `apps/app` — React + Vite client app
- `apps/admin` — old admin app, unused
- `packages/ui` — shared React components
- `packages/config` — shared content/data/status metadata
- `packages/tokens` — shared design tokens / Tailwind preset
- `packages/api-client` — shared API client pieces

## Development

Install from the root:

```bash
npm install
```

Run the marketing site:

```bash
npm run dev
```

Run the client app:

```bash
npm run dev:app
```

Typecheck and build the client app:

```bash
npm run typecheck:app
npm run build:app
```

## Deployment

- Marketing: Cloudflare Pages, output `apps/marketing/dist`
- Client app: Cloudflare Workers
- Admin console: separate deployment
- Backend: Vercel/Node, database stays on Neon

Before merging or deploying, read `deploy.md`.

Branch flow: child branch → `developer` → `main`. Never merge a child branch directly into `main`.

## Documentation

- [Marketing Astro docs](https://docs.astro.build)
- [Astro routing](https://docs.astro.build/en/guides/routing/)
- [Astro React integration](https://docs.astro.build/en/guides/framework-components/)
- [Astro styling and Tailwind](https://docs.astro.build/en/guides/styling/)
- Client app skills: `apps/app/skills.md`
- Frontend overview: `skills.md`

## Rules

- Do not add backend code to this monorepo.
- Keep shared data, types and design tokens in `packages/*`.
- API calls in the client app go through `apps/app/src/lib/mockApi.ts`.
- Do not expose secrets in frontend code.
- Run `npm run typecheck:app` and `npm run build:app` after client changes.
