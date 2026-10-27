# API Contract — Kaundinya Client Portal

> **Owner:** this document is the frontend contract (`apps/app`). The backend (`apps/api`)
> implements it. Frontend code must not change these shapes on its own — propose changes here first.
>
> **Source of truth for types:** `packages/config/src/types.ts`
> **Current frontend data layer (mock):** `apps/app/src/lib/mockApi.ts`
> **When the API is live:** swap each mock function for a `fetch` call in `mockApi.ts`; page code stays unchanged.

---

## 1. Global conventions

| Item | Value |
| --- | --- |
| Base URL | `PUBLIC_API_BASE_URL` (env) — same variable the marketing site uses |
| Auth header | `Authorization: Bearer <token>` |
| Content type | `application/json` |
| API versioning | path is fixed (`/api`); breaking changes require a new major path |
| Date format | `YYYY-MM-DD` (ISO date, no timezone) for all displayed dates |
| Timestamp format | ISO-8601 UTC (`2026-10-26T09:15:00Z`) if a precise time is ever needed |
| Sorting | list endpoints return **newest-first** |
| Pagination | none for now; add `?page=&limit=` only when a list can exceed ~200 rows |
| IDs | opaque strings, stable per record (e.g. `req-1001`) |
| Currency | INR; amounts (if added later) as integer paise |

### Success envelope

Every endpoint returns:

```json
{ "success": true, "message": "optional human message", "data": <payload> }
```

`data` is omitted only for actions with no payload.

### Error envelope

```json
{ "success": false, "message": "Human readable message", "errors": { "field": "reason" } }
```

`errors` is present for validation failures (HTTP 422).

---

## 2. Data models

Types live in `packages/config/src/types.ts`. Field-by-field:

### 2.1 `User`
| Field | Type | Required | Rules / Notes |
| --- | --- | --- | --- |
| `name` | string | yes | 2–80 chars |
| `email` | string | no | valid email or empty string |
| `mobile` | string | yes | 10 digits (India), unique per account |

### 2.2 `ServiceRequest`
| Field | Type | Required | Rules / Notes |
| --- | --- | --- | --- |
| `id` | string | yes | server-generated, stable |
| `serviceCategory` | string | yes | must match one of the 4 category names |
| `specificService` | string | yes | must be a sub-service of that category |
| `status` | `"new" \| "in_progress" \| "completed" \| "cancelled"` | yes | defaults to `"new"` on create |
| `createdAt` | string | yes | `YYYY-MM-DD` |
| `comments` | string | yes | may be empty string `""` |

### 2.3 `AppNotification`
| Field | Type | Required | Rules / Notes |
| --- | --- | --- | --- |
| `id` | string | yes | server-generated |
| `title` | string | yes | short headline |
| `message` | string | yes | body text |
| `createdAt` | string | yes | `YYYY-MM-DD` |
| `read` | boolean | yes | `false` on creation |

### 2.4 `ServiceCategory` (static, from `packages/config/src/constants.ts`)
| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `real-estate` \| `insurance` \| `property-home-services` \| `loans` |
| `name` | string | e.g. `Real Estate` |
| `slug` | string | URL slug |
| `tagline` | string | short line |
| `description` | string | paragraph |
| `services` | string[] | the sub-services |
| `icon` | string | lucide icon key (`Building2`, `ShieldCheck`, `Wrench`, `Coins`) |

> The service catalog is **static** and shared by both apps — it is **not** served by the API.

### 2.5 `EnquiryPayload` (marketing → API, already used by `apps/marketing/src/lib/api.ts`)
| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `fullName` | string | yes | 2–80 chars |
| `email` | string | yes | valid email (marketing defaults to `not-provided@client.local`) |
| `mobile` | string | yes | 10 digits |
| `serviceCategory` | string | yes | one of the 4 category names |
| `specificService` | string | no | sub-service |
| `pinCode` | string | no | 6 digits, first digit 1–9 |
| `comments` | string | no | free text, max 2000 chars |
| `consent` | boolean | yes | must be `true` |

---

## 3. Authentication & OTP

Flow: phone number → OTP → token. The token is what enables `/api/me` and all `/api/requests` / `/api/notifications` calls.

### 3.1 `POST /api/otp/send`
- **Auth:** none
- **Request:**
  ```json
  { "mobile": "7093320947" }
  ```
- **Validation:** `mobile` = exactly 10 digits.
- **Response 200:**
  ```json
  { "success": true, "message": "OTP sent", "data": { "expiresInSeconds": 60 } }
  ```
- **Errors:** `422` invalid mobile; `429` too many requests (see §6).

### 3.2 `POST /api/otp/verify`
- **Auth:** none
- **Request:**
  ```json
  { "mobile": "7093320947", "otp": "123456" }
  ```
- **Validation:** `otp` = exactly 6 digits.
- **Response 200:**
  ```json
  { "success": true, "data": { "token": "<jwt-or-opaque>", "user": { "name": "…", "email": "…", "mobile": "7093320947" } } }
  ```
- **Errors:** `400` wrong/expired OTP; `404` no pending OTP for that mobile; `429` too many attempts.
- **Frontend behaviour:** marketing site receives success → redirects to `{PUBLIC_APP_URL}/auth/callback?token=<token>`; the app stores the token and routes to `/dashboard`. (Dev fallback currently passes `?mobile=` and mocks the session — will be replaced by `token`.)

### 3.3 `GET /api/me`
- **Auth:** bearer token
- **Response 200:** `{ "success": true, "data": <User> }`
- **Errors:** `401` missing/invalid token.

### 3.4 `PATCH /api/me`
- **Auth:** bearer token
- **Request (all optional, at least one field):**
  ```json
  { "name": "Sampath Krishna Goud", "email": "s@example.com", "pinCode": "500081" }
  ```
- **Validation:** same as §2.1; `pinCode` 6 digits if provided; `mobile` is **not** editable here (changes require re-verification).
- **Response 200:** `{ "success": true, "data": <User> }`

### 3.5 `POST /api/auth/logout`
- **Auth:** bearer token
- **Response 204** (no body). Frontend clears stored token.

---

## 4. Requests ("My Requests")

All require a bearer token; results are scoped to the authenticated user.

### 4.1 `GET /api/requests`
- **Response 200:** `{ "success": true, "data": ServiceRequest[] }`
- Returns only the current user's requests, newest-first.

### 4.2 `GET /api/requests/:id`
- **Response 200:** `{ "success": true, "data": ServiceRequest }`
- **Errors:** `404` not found or not owned by user (do not leak other users' data).

### 4.3 `POST /api/requests`
- **Request:**
  ```json
  { "serviceCategory": "Real Estate", "specificService": "Property Rentals (Residential)", "comments": "Looking for a 2BHK in Gachibowli" }
  ```
- **Validation:** `serviceCategory` must be one of the 4; `specificService` must belong to it; `comments` optional, max 2000 chars.
- **Response 201:**
  ```json
  { "success": true, "data": ServiceRequest }
  ```
  (`status` = `"new"`, `createdAt` = today.)
- **Side effect:** create an `AppNotification` "Request received".

### 4.4 `PATCH /api/requests/:id` *(admin only — future)*
- **Request:** `{ "status": "in_progress" }`
- **Response 200:** `ServiceRequest`
- Allowed transitions: `new → in_progress → completed`, or `→ cancelled` from `new`/`in_progress`.
- **Errors:** `409` invalid transition; `403` non-admin.

---

## 5. Notifications

Require bearer token; scoped to the user.

### 5.1 `GET /api/notifications`
- **Response 200:** `{ "success": true, "data": AppNotification[] }` (newest-first)

### 5.2 `PATCH /api/notifications/:id/read`
- **Response 200:** `{ "success": true, "data": AppNotification }`

### 5.3 `POST /api/notifications/read-all`
- **Response 200:** `{ "success": true, "data": AppNotification[] }` (all `read: true`)

---

## 6. Enquiries (marketing site)

### 6.1 `POST /api/enquiries`
- **Auth:** none (public form) — rate-limited by IP + mobile.
- **Request:** `EnquiryPayload` (§2.5).
- **Response 201:** `{ "success": true, "message": "…", "data": { "id": "enq-1024" } }`
- **Errors:** `422` validation; `429` rate-limited.

### 6.2 `GET /api/enquiries` *(admin only — future)*
- Query: `?status=&serviceCategory=&page=&limit=`
- **Response 200:** `Enquiry[]`

---

## 7. Validation rules (authoritative)

| Field | Rule |
| --- | --- |
| `mobile` | exactly 10 digits, Indian mobile (starts 6–9) |
| `otp` | exactly 6 digits |
| `pinCode` | exactly 6 digits, first digit 1–9 |
| `email` | RFC-5322-ish; optional in profile, required in enquiry |
| `name` / `fullName` | 2–80 chars, trimmed |
| `serviceCategory` | one of `Real Estate`, `Insurance`, `Property Management & Home Services`, `Loans` |
| `specificService` | must exist within the chosen category |
| `comments` | ≤ 2000 chars |
| `consent` | must be `true` |

---

## 8. Error codes

| HTTP | When | Body `message` example |
| --- | --- | --- |
| 400 | malformed request / bad OTP | "Invalid or expired OTP." |
| 401 | missing/invalid token | "Authentication required." |
| 403 | not allowed (admin-only) | "You do not have access." |
| 404 | resource not found / not owned | "Request not found." |
| 409 | invalid state transition | "Cannot move a completed request." |
| 422 | validation failed | "Validation failed." + `errors` map |
| 429 | rate limited | "Too many requests. Try again in 60s." |
| 500 | server error | "Something went wrong." |

**Rate limits:** `POST /api/otp/send` — max 3 per mobile per 10 min, 10 per IP per 10 min. `POST /api/otp/verify` — max 5 attempts per OTP.

---

## 9. Flow sequences

### 9.1 Enquiry → OTP → app dashboard
```
marketing form
  └─ POST /api/enquiries
  └─ POST /api/otp/send {mobile}
  └─ POST /api/otp/verify {mobile, otp}  → { token, user }
  └─ redirect {PUBLIC_APP_URL}/auth/callback?token=…
app /auth/callback
  └─ store token → GET /api/me → /dashboard
```

### 9.2 New request
```
app /services/:slug → POST /api/requests {serviceCategory, specificService, comments}
  → 201 ServiceRequest(status=new)
  → GET /api/requests refreshes list
  → notification "Request received"
```

---

## 10. Mock layer mapping (current frontend)

| Mock function (`apps/app/src/lib/mockApi.ts`) | Endpoint |
| --- | --- |
| `fetchRequests()` | `GET /api/requests` |
| `fetchRequest(id)` | `GET /api/requests/:id` |
| `createRequest(input)` | `POST /api/requests` |
| `fetchNotifications()` | `GET /api/notifications` |
| `markAllNotificationsRead()` | `POST /api/notifications/read-all` |

Login OTP in `apps/app/src/pages/Login.tsx` and the marketing `OtpVerification` mock
`POST /api/otp/send` / `POST /api/otp/verify`.

---

## 11. Environment variables

| Variable | Used by | Example |
| --- | --- | --- |
| `PUBLIC_API_BASE_URL` | marketing + app | `https://api.kaundinyaconsultancy.com` |
| `PUBLIC_APP_URL` | marketing (redirect target) | `https://app.kaundinyaconsultancy.com` |

> Public (`PUBLIC_`) variables are exposed to the browser. Never put secrets here.

---

## 12. Out of scope (for this contract)

- Admin platform endpoints (separate contract later).
- Payments.
- File uploads.
- Multi-language.
