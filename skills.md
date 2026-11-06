# Kaundinya Frontend Skills

This monorepo contains the marketing site and the client app.

| App | Folder | Stack |
| --- | --- | --- |
| Marketing site | `apps/marketing` | Astro 7, React 19, Tailwind 4 |
| Client app | `apps/app` | React 19, Vite 8, React Router 7, Tailwind 4 |

The separate admin console lives in its own folder (`kaundinya-admin`) and has its own `skills.md`.

## Shared workspaces

- `packages/config` — service catalog, module metadata, status types
- `packages/ui` — shared UI components
- `packages/tokens` — brand/design tokens
- `packages/api-client` — shared API client pieces

## Read next

- Client app skills: [`apps/app/skills.md`](./apps/app/skills.md)
- Backend guide: `../kaundinya-backend/README.md`
- Backend skills: `../kaundinya-backend/SKILLS.md`

## Commands

From the monorepo root:

```bash
npm run dev            # marketing at http://localhost:4321
npm run dev:app        # client app at http://localhost:5173
npm run typecheck:app
npm run build:app
npm run build          # marketing build
```

## Rules

- Put shared service metadata in `packages/config`, not in individual pages.
- Use the shared UI and token packages before adding new primitives.
- API calls belong in the client app’s `src/lib/mockApi.ts` layer.
- Never expose secrets in frontend code.
- Add a `skills.md` entry or update this file when introducing a new app-level pattern.
