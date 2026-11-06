# Client Frontend Skills

This is the working skill sheet for the Kaundinya client app (`apps/app`).

## Stack

| Skill | Where it is used |
| --- | --- |
| React 19 | All pages and components |
| TypeScript 6 | Strict app code and page props |
| Vite 8 | Development server and production build |
| React Router 7 | Client-side routing |
| Tailwind CSS 4 | Layout and styling |
| lucide-react | Icons |
| Fetch + Bearer tokens | API requests through `src/lib/mockApi.ts` |
| Server-Sent Events | Notification stream in `src/lib/notifications.tsx` |
| Cloudflare Workers | Deployment target for the client app |

## Monorepo context

The client lives in:

```text
apps/app
```

Shared workspaces:

- `@kaundinya/config` — service catalog, module metadata, status types
- `@kaundinya/ui` — shared UI components
- `@kaundinya/tokens` — brand/design tokens
- `@kaundinya/api-client` — shared API client pieces

Do not duplicate config that belongs in `packages/config`.

## Important folders

```text
src/
  App.tsx                 Route table
  components/             Shell, sidebar, topbar, cards, panels
  lib/
    mockApi.ts            The app's API layer (name is historical; it calls the real backend)
    auth.tsx              Client auth context
    session.ts            Session token storage
    notifications.tsx     Client notification feed + SSE
    moduleData.ts         Module display metadata and sample/fallback data
    status.ts             Status labels and visual mapping
  pages/                  One file per route
  styles/global.css       Global Tailwind styles
```

## Main client routes

- `/login`, `/onboarding`
- `/dashboard`
- `/real-estate/*` — listings, property detail, sell/rent listing, valuation
- `/home-services/*` — services, detail, measurements, interiors, jobs
- `/digital-services/*` — hub, ID updates, printouts
- `/insurance` — consultancy hub, health, motor, policy vault and support
- `/loans` — consultancy hub, product guidance and support
- `/requests/:id` — request detail (deep links from notifications and dialogue flows)
- `/jobs/:id` — Home Services job tracking

The Insurance and Loans modules are live and use local mock data. The old direct-apply loan pages were removed; `/loans/apply`, `/loans/credit-health` and `/loans/applications*` redirect into the consultancy flow.

## API conventions

- All backend calls go through `src/lib/mockApi.ts`.
- The backend base URL comes from the app environment.
- Authenticated calls send `Authorization: Bearer <token>`.
- Client endpoints are under `/api/*`; admin endpoints are never called from this app.
- Uploads use `FormData`.
- Digital Services print pricing displayed in the UI must match the backend: `pages x copies x ₹5`.

## Auth and session rules

- Session tokens are stored in `sessionStorage`.
- A new browser session requires PIN/OTP login again.
- Remembered mobile uses `localStorage`.
- Protected pages use `ProtectedRoute`.
- Profile completion is required before protected modules.
- Never store secrets in client code.

## UI conventions

- Use the semantic theme tokens: `bg-surface`, `bg-surface-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-brand`, `text-brand`, `bg-inverse`, `bg-sidebar`.
- Do not add raw palette classes like `bg-white`, `bg-ivory`, `text-charcoal` or `bg-gold`; light/dark switching depends on semantic tokens.
- The theme toggle lives in the topbar beside notifications and persists in `localStorage` under `kaundinya.theme`.
- Use existing components and Tailwind classes.
- Keep the existing brand colors and typography.
- Use `lucide-react` for icons.
- Follow the existing status/timeline patterns for request tracking.
- Keep pages responsive on mobile and desktop.
- Do not add new component libraries without approval.
- Reuse `packages/config` metadata instead of hardcoding service lists.

## Notifications

- `src/lib/notifications.tsx` handles the client notification feed.
- It uses fetch streaming with Bearer auth, not `EventSource`.
- Keep SSE snapshot + reconnect behavior intact when editing.
- Notification deep links must point to real client routes.

## Commands

```bash
npm run dev:app          # from monorepo root
npm run typecheck:app    # from monorepo root
npm run build:app        # from monorepo root
```

Or from `apps/app`:

```bash
npm run dev
npm run typecheck
npm run build
```

## Definition of done

1. Route added to `App.tsx` if the page is new.
2. Sidebar or in-page navigation updated.
3. API calls added to `src/lib/mockApi.ts`.
4. Shared types/status values updated in `packages/config` when needed.
5. `npm run typecheck:app` passes.
6. `npm run build:app` passes.
7. Checked on mobile width and desktop.
