# Admin Frontend Skills

This is the working skill sheet for the Kaundinya admin console.

## Stack

| Skill | Where it is used |
| --- | --- |
| React 19 | All pages and components |
| TypeScript | Strict admin app code |
| Vite 6 | Development server and production build |
| React Router 7 | Admin routes |
| Tailwind CSS 4 | Layout and styling |
| lucide-react | Icons |
| Fetch + Bearer tokens | Admin API calls in `src/lib/api.ts` |
| Server-Sent Events | Admin notification stream |

## Important folders

```text
src/
  App.tsx                     Route table
  components/
    AppShell.tsx              Sidebar + header layout
    AdminUi.tsx              Shared badges, sheets, dialogs, input classes
    StaffProtectedRoute.tsx   Admin auth gate
    AdminNotification*.tsx    Notification panel/toasts
  lib/
    api.ts                    All admin API calls and types
    staff-auth.tsx            Staff auth context
    staff-session.ts          Staff token storage
    admin-notifications.tsx   Notification feed + SSE
    format.ts                 INR and date formatting
    toast.ts                  Toast events
  pages/
    Dashboard.tsx
    RequestsAdmin.tsx
    RealEstateProperties.tsx
    HomeServicesAdmin.tsx
    DigitalServicesAdmin.tsx
    InsuranceAdmin.tsx        Hidden/unrouted legacy
    LoansAdmin.tsx            Hidden/unrouted legacy
```

## Admin routes

- `/login`
- `/setup`
- `/dashboard`
- `/requests`
- `/real-estate`
- `/home-services`
- `/digital-services`

Insurance and Loans admin pages exist but are not routed in the current UI.

## API conventions

- All backend calls go through `src/lib/api.ts`.
- They target `/api/admin/*` and send the staff Bearer token.
- Shared types for admin responses live in `src/lib/api.ts`.
- Do not put fetch calls directly inside pages; add a helper in `src/lib/api.ts`.
- Client tokens must never be used in this app.

## Auth rules

- Staff token is stored in `sessionStorage`.
- `StaffProtectedRoute` gates the console.
- `/setup` is for first-time PIN setup.
- Profile and partner management use the staff auth endpoints.
- Admin endpoints return `401` without a staff token and `403` for the wrong role.

## UI conventions

- Use `src/components/AdminUi.tsx`:
  - `StatusBadge`
  - `SheetShell` for side panels
  - `ConfirmDialog` for destructive actions
  - `inputClass` and `labelClass`
- Use `showToast` for action feedback.
- Use `formatINR` and `formatDateTime` instead of ad-hoc formatting.
- Keep list rows dense and scannable.
- Use right-side sheets for detail/edit flows.
- Keep the existing brand colors and Tailwind tokens.
- No new component libraries without approval.

## Notifications

- `src/lib/admin-notifications.tsx` handles admin notifications.
- Deep links must point to real admin routes such as `/digital-services?tab=printouts&request=...`.
- Keep SSE reconnection behavior intact.

## Commands

```bash
npm run dev
npm run typecheck
npm run build
```

## Definition of done

1. Route added to `src/App.tsx` if the page is new.
2. Sidebar and dashboard entries updated.
3. API helpers and types added to `src/lib/api.ts`.
4. Shared UI primitives reused.
5. Loading, error, empty and filtered states handled.
6. `npm run typecheck` passes.
7. `npm run build` passes.
