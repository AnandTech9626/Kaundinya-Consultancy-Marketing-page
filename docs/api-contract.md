# API Contract & OTP Integration Spec — Kaundinya Client Portal

> **Purpose:** single reference for the backend team. It lists **every OTP flow we built**,
> and **each endpoint** with:
> - what the **frontend sends** (payload: fields, types, required, example), and
> - what the **backend must return** (response params/values).
>
> **Ownership:** frontend owns this contract (`apps/app` + `apps/marketing`). Backend (`apps/api`) implements it.
> **Types source of truth:** `packages/config/src/types.ts`
> **Current frontend data layer (mock):** `apps/app/src/lib/mockApi.ts`
> **When the API is live:** replace each mock function with a `fetch` to the endpoint below — page code stays unchanged.
>
> **Status: HELD FILE** — do not delete. Backend will pick this up when ready.

---

## 0. Environments & live URLs

| Item | Value |
| --- | --- |
| Marketing (Cloudflare Pages) | `https://kaundinyaconsultancy.pages.dev` |
| Main app (Cloudflare Workers) | `https://kaundinya-app.attack-surface.workers.dev` |
| Backend base URL (future) | `PUBLIC_API_BASE_URL` (env) |
| App redirect target (env) | `PUBLIC_APP_URL` → currently `https://kaundinya-app.attack-surface.workers.dev` |

Global conventions:
- Auth header: `Authorization: Bearer <token>`
- JSON only; `Content-Type: application/json`
- Dates: `YYYY-MM-DD`; timestamps (if needed): ISO-8601 UTC
- Money (future): integer paise (INR)
- Lists: newest-first
- Success: `{ "success": true, "message"?: string, "data": <payload> }`
- Error: `{ "success": false, "message": string, "errors"?: { "<field>": "reason" } }`

---

## 1. OTP — all flows we built (frontend side)

All OTP flows use the **same two endpoints**: `POST /api/otp/send` and `POST /api/otp/verify`.

| # | Flow | Where (UI) | What happens now (mock) | Backend calls needed |
| --- | --- | --- | --- | --- |
| 1 | **New user — marketing enquiry** | Marketing `ConsultationModal` / `EnquiryForm` → button **"Send Verification Code"** | validates form, waits 600ms, redirects to `{PUBLIC_APP_URL}/login?mobile=<10 digits>&step=otp` | **POST `/api/enquiries`** (save form) → **POST `/api/otp/send`** { mobile } → redirect |
| 2 | **OTP verify → app session** | App `Login` (arrives with `?mobile=&step=otp`) → **"Verify OTP"** | mock accepts any 6 digits; creates session `{ name: "Kaundinya Client", mobile }`; navigates `/dashboard` | **POST `/api/otp/verify`** { mobile, otp } → `{ token, user }`; store token; go `/dashboard` |
| 3 | **Resend OTP** | App `OtpVerification` → "Resend OTP" (30s timer) | clears boxes, restarts timer; no call | **POST `/api/otp/send`** { mobile } |
| 4 | **Edit mobile** | App `OtpVerification` → "Edit" | returns to mobile step | — (no call) |
| 5 | **Returning user login** | App `/login` → enter mobile → **"Send OTP"** → OTP step → verify | `otpSend` mock then `otpVerify` mock | **POST `/api/otp/send`** → **POST `/api/otp/verify`** |

**Rules for OTP:**
- `mobile`: exactly **10 digits** (India). Frontend always normalizes to digits only.
- `otp`: exactly **6 digits**.
- OTP send/verify responses power the redirect: on success the app stores the token and shows the dashboard.
- Only the **mobile number** is carried across the marketing→app handoff today; name/email/service are posted to `/api/enquiries` (future), **not** put in the URL.

### 1.1 Marketing → App handoff (exact)
```
Marketing form (valid) 
  └─ 600ms simulated send
  └─ window.location = {PUBLIC_APP_URL}/login?mobile=<10 digits>&step=otp

App /login?mobile=...&step=otp
  └─ opens directly on OTP step (mobile pre-filled)
  └─ user enters 6-digit OTP → POST /api/otp/verify
  └─ on success: store token → /dashboard
```

---

## 2. Data models

Types in `packages/config/src/types.ts`.

### `User`
| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | 2–80 chars |
| `email` | string | no | valid email or `""` |
| `mobile` | string | yes | 10 digits, unique |

### `ServiceRequest`
| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | server-generated |
| `serviceCategory` | string | yes | one of the 4 categories |
| `specificService` | string | yes | must belong to category |
| `status` | `"new" \| "in_progress" \| "completed" \| "cancelled"` | yes | defaults `"new"` |
| `createdAt` | string | yes | `YYYY-MM-DD` |
| `comments` | string | yes | may be `""` |

### `AppNotification`
| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | server-generated |
| `title` | string | yes | short |
| `message` | string | yes | body |
| `createdAt` | string | yes | `YYYY-MM-DD` |
| `read` | boolean | yes | `false` on create |

### `EnquiryPayload` (marketing form)
| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| `fullName` | string | yes | 2–80 |
| `email` | string | yes | valid (marketing defaults `not-provided@client.local`) |
| `mobile` | string | yes | 10 digits |
| `serviceCategory` | string | yes | one of 4 |
| `specificService` | string | no | sub-service |
| `pinCode` | string | no | 6 digits |
| `comments` | string | no | ≤ 2000 chars |
| `consent` | boolean | yes | must be `true` |

The **4 service categories** (static, from `packages/config/src/constants.ts`, not from the API):
`Real Estate`, `Insurance`, `Property Management & Home Services`, `Loans`.

---

## 3. Endpoints

Legend: **Frontend sends** = request payload; **Backend returns** = response we need.

### 3.1 `POST /api/otp/send`
- **Auth:** none
- **Frontend sends:**
  ```json
  { "mobile": "8688493369" }
  ```
  | field | type | required | notes |
  | --- | --- | --- | --- |
  | mobile | string | yes | 10 digits |
- **Backend returns (200):**
  ```json
  { "success": true, "message": "OTP sent", "data": { "expiresInSeconds": 60 } }
  ```
  | field | type | notes |
  | --- | --- | --- |
  | data.expiresInSeconds | number | used to drive the resend timer (currently 30s client-side) |
- **Errors:** `422` invalid mobile · `429` rate limited

### 3.2 `POST /api/otp/verify`
- **Auth:** none
- **Frontend sends:**
  ```json
  { "mobile": "8688493369", "otp": "123456" }
  ```
  | field | type | required | notes |
  | --- | --- | --- | --- |
  | mobile | string | yes | 10 digits |
  | otp | string | yes | 6 digits |
- **Backend returns (200):**
  ```json
  { "success": true, "data": { "token": "<opaque/jwt>", "user": { "name": "Ramesh Bujji", "email": "gudipudimani63@gmail.com", "mobile": "8688493369" } } }
  ```
  | field | type | notes |
  | --- | --- | --- |
  | data.token | string | bearer token for all authenticated calls |
  | data.user.name/email/mobile | User | profile shown in app + sidebar |
- **Errors:** `400` wrong/expired OTP · `404` no pending OTP · `429` too many attempts

### 3.3 `GET /api/me`
- **Auth:** bearer
- **Frontend sends:** nothing (just token)
- **Backend returns (200):**
  ```json
  { "success": true, "data": { "name": "Ramesh Bujji", "email": "gudipudimani63@gmail.com", "mobile": "8688493369" } }
  ```

### 3.4 `PATCH /api/me`
- **Auth:** bearer
- **Frontend sends (Profile "Save Changes"):**
  ```json
  { "name": "Ramesh Bujji", "email": "gudipudimani63@gmail.com", "pinCode": "522617" }
  ```
  | field | type | required | notes |
  | --- | --- | --- | --- |
  | name | string | no | 2–80 |
  | email | string | no | valid email |
  | pinCode | string | no | 6 digits |
  | mobile | — | — | **not editable** (change requires re-verify) |
- **Backend returns (200):** `{ "success": true, "data": User }`

### 3.5 `POST /api/auth/logout`
- **Auth:** bearer
- **Frontend sends:** nothing
- **Backend returns:** `204` (no body)

### 3.6 `POST /api/enquiries` (marketing form)
- **Auth:** none (public, rate-limited)
- **Frontend sends:** `EnquiryPayload` (§2)
  ```json
  {
    "fullName": "Ramesh Bujji",
    "email": "gudipudimani63@gmail.com",
    "mobile": "8688493369",
    "serviceCategory": "Insurance",
    "specificService": "asa",
    "pinCode": "522617",
    "comments": "asdf",
    "consent": true
  }
  ```
- **Backend returns (201):**
  ```json
  { "success": true, "message": "Enquiry received", "data": { "id": "enq-1024" } }
  ```
- **Errors:** `422` validation · `429` rate limited

### 3.7 `GET /api/requests` (My Requests)
- **Auth:** bearer
- **Frontend sends:** nothing
- **Backend returns (200):**
  ```json
  { "success": true, "data": [ { "id": "req-1001", "serviceCategory": "Real Estate", "specificService": "Property Rentals (Residential)", "status": "in_progress", "createdAt": "2026-10-22", "comments": "2BHK in Gachibowli" } ] }
  ```
  → `ServiceRequest[]`, current user only, newest-first

### 3.8 `GET /api/requests/:id` (Request Detail)
- **Auth:** bearer
- **Frontend sends:** path param `id`
- **Backend returns (200):** `{ "success": true, "data": ServiceRequest }`
- **Errors:** `404` not found / not owned

### 3.9 `POST /api/requests` ("Request this service")
- **Auth:** bearer
- **Frontend sends:**
  ```json
  { "serviceCategory": "Real Estate", "specificService": "Property Rentals (Residential)", "comments": "Looking for a 2BHK" }
  ```
  | field | type | required | notes |
  | --- | --- | --- | --- |
  | serviceCategory | string | yes | one of 4 |
  | specificService | string | yes | sub-service of category |
  | comments | string | no | ≤ 2000 |
- **Backend returns (201):** `{ "success": true, "data": ServiceRequest }` (status `"new"`, `createdAt` today)
- **Side effect:** create notification "Request received"

### 3.10 `PATCH /api/requests/:id` (admin — future)
- **Auth:** bearer (admin)
- **Frontend sends:** `{ "status": "in_progress" }`
- **Backend returns (200):** `ServiceRequest`
- Transitions: `new → in_progress → completed`, or `→ cancelled`. `409` if invalid.

### 3.11 `GET /api/notifications`
- **Auth:** bearer
- **Frontend sends:** nothing
- **Backend returns (200):** `{ "success": true, "data": AppNotification[] }` (newest-first)

### 3.12 `PATCH /api/notifications/:id/read`
- **Auth:** bearer
- **Frontend sends:** path `id`
- **Backend returns (200):** `{ "success": true, "data": AppNotification }`

### 3.13 `POST /api/notifications/read-all`
- **Auth:** bearer
- **Frontend sends:** nothing
- **Backend returns (200):** `{ "success": true, "data": AppNotification[] }` (all `read:true`)

---

## 4. Validation rules (authoritative)

| Field | Rule |
| --- | --- |
| mobile | exactly 10 digits (starts 6–9) |
| otp | exactly 6 digits |
| pinCode | exactly 6 digits (first 1–9) |
| email | valid email (optional in profile, required in enquiry) |
| name / fullName | 2–80 chars, trimmed |
| serviceCategory | one of the 4 categories |
| specificService | must exist in chosen category |
| comments | ≤ 2000 chars |
| consent | must be `true` |

---

## 5. Error codes & rate limits

| HTTP | Meaning | Example message |
| --- | --- | --- |
| 400 | bad request / wrong OTP | "Invalid or expired OTP." |
| 401 | missing/invalid token | "Authentication required." |
| 403 | forbidden | "You do not have access." |
| 404 | not found / not owned | "Request not found." |
| 409 | invalid state transition | "Cannot move a completed request." |
| 422 | validation failed | "Validation failed." + `errors` |
| 429 | rate limited | "Too many requests. Try again in 60s." |
| 500 | server error | "Something went wrong." |

Rate limits: `/api/otp/send` — 3/mobile/10min, 10/IP/10min. `/api/otp/verify` — 5 attempts/OTP.

---

## 6. Current frontend mock → endpoint mapping

| Frontend (built) | Mock function | Endpoint to implement |
| --- | --- | --- |
| Marketing "Send Verification Code" | (simulated) | `POST /api/enquiries` + `POST /api/otp/send` |
| App OTP step verify (`Login.tsx`) | `otpSend` / `otpVerify` (`mockApi.ts`) | `POST /api/otp/send` / `POST /api/otp/verify` |
| Dashboard / My Requests count | `fetchRequests` | `GET /api/requests` |
| Request Detail | `fetchRequest` | `GET /api/requests/:id` |
| Request this service | `createRequest` | `POST /api/requests` |
| Notifications list | `fetchNotifications` | `GET /api/notifications` |
| Mark all read | `markAllNotificationsRead` | `POST /api/notifications/read-all` |
| Profile save | (local only) | `PATCH /api/me` |

---

## 7. Backend hand-off checklist
1. Implement §3 endpoints with the exact request/response shapes above.
2. Return `token` from `/api/otp/verify`; the app will store it and send `Authorization: Bearer`.
3. Keep `ServiceRequest.status` transitions and date format (`YYYY-MM-DD`).
4. Scope `/api/requests` & `/api/notifications` to the authenticated user.
5. Marketing will call `/api/enquiries` then `/api/otp/send` before redirecting to the app.
6. Frontend will then replace `apps/app/src/lib/mockApi.ts` internals and `apps/marketing/src/lib/api.ts` with real `fetch` calls — **no page rewrites**.

_End of contract._
