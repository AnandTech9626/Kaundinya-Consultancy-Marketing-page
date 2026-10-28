# Kaundinya — Complete API Specification

> **Who this is for:** the backend developer implementing `apps/api`.
> **What it covers:** every endpoint the frontend already expects — from **marketing OTP** through the **client app** to the **admin panel** — with **exact request payloads** and **exact response bodies**, field by field.
>
> **How to use it:** implement each endpoint to return the documented shapes. The frontend is already coded against these shapes (currently using a mock layer), so matching them means **no frontend changes**.
>
> **Sources of truth:** types in `packages/config/src/types.ts`; mock data layer in `apps/app/src/lib/mockApi.ts` and `apps/admin/src/lib/mockApi.ts`.
>
> _This file is the single hand-off document. Do not delete it._

---

## 0. Quickstart

| Thing | Value |
| --- | --- |
| Marketing site (Pages) | `https://kaundinya.pages.dev` |
| Client app (Workers) | `https://app.kaundinya.workers.dev` |
| Admin panel (Workers) | `https://admin.kaundinya.workers.dev` |
| Backend base URL | `PUBLIC_API_BASE_URL` (env) — e.g. `https://api.kaundinya.com` |
| Redirect target used by marketing | `PUBLIC_APP_URL=https://app.kaundinya.workers.dev` |

**Envelopes (every response):**
```json
{ "success": true,  "message": "optional", "data": <payload> }
{ "success": false, "message": "reason",   "errors": { "<field>": "<reason>" } }
```

**Rules of the road**
- All bodies are JSON: `Content-Type: application/json`.
- Authenticated endpoints require: `Authorization: Bearer <token>`.
- `token` is issued by `POST /api/otp/verify`.
- Dates: `YYYY-MM-DD`. Timestamps (if you ever need them): ISO‑8601 UTC.
- Lists are returned **newest first**.
- IDs are strings (e.g. `req-1001`, `enq-1001`, `st-2`).
- Never trust the client for authorization — scope `/api/requests` & `/api/notifications` to the token's user; scope `/api/admin/*` to staff.

---

## 1. Enumerations (exact allowed string values)

These values must be returned **exactly** as written (lowercase, snake_case where shown).

| Enum | Allowed values |
| --- | --- |
| `RequestStatus` | `"new"`, `"in_progress"`, `"completed"`, `"cancelled"` |
| `EnquiryStatus` | `"new"`, `"contacted"`, `"qualified"`, `"converted"`, `"lost"` |
| `Priority` | `"low"`, `"medium"`, `"high"` |
| `StaffRole` | `"admin"`, `"agent"` |
| Service categories (static) | `"Real Estate"`, `"Insurance"`, `"Property Management & Home Services"`, `"Loans"` |

> The 4 service categories + their sub-services are **static** (in `packages/config/src/constants.ts`) and are **not** served by the API — both frontends import them directly.

---

## 2. Field dictionary (every field)

Legend: **Req** = required. “Rules” are what the backend should enforce.

### 2.1 `User`
| Field | Type | Req | Rules / Allowed | Example |
| --- | --- | --- | --- | --- |
| `name` | string | yes | 2–80 chars, trimmed | `"Ramesh Bujji"` |
| `email` | string | no | valid email or `""` | `"gudipudimani63@gmail.com"` |
| `mobile` | string | yes | exactly 10 digits, unique | `"8688493369"` |

### 2.2 `ServiceRequest` (client)
| Field | Type | Req | Rules / Allowed | Example |
| --- | --- | --- | --- | --- |
| `id` | string | yes | server-generated, stable | `"req-1001"` |
| `serviceCategory` | string | yes | one of the 4 categories | `"Real Estate"` |
| `specificService` | string | yes | must be a sub-service of that category | `"Property rentals (Residential & Commercial)"` |
| `status` | `RequestStatus` | yes | defaults `"new"` on create | `"in_progress"` |
| `createdAt` | string | yes | `YYYY-MM-DD` | `"2026-10-24"` |
| `comments` | string | yes | may be `""`, max 2000 | `"2BHK in Gachibowli"` |

### 2.3 `AppNotification` (client)
| Field | Type | Req | Rules | Example |
| --- | --- | --- | --- | --- |
| `id` | string | yes | server-generated | `"ntf-1"` |
| `title` | string | yes | short headline | `"Request received"` |
| `message` | string | yes | body text | `"Your request is in progress."` |
| `createdAt` | string | yes | `YYYY-MM-DD` | `"2026-10-24"` |
| `read` | boolean | yes | `false` on create | `false` |

### 2.4 `Enquiry` (admin — a marketing lead)
| Field | Type | Req | Rules / Allowed | Example |
| --- | --- | --- | --- | --- |
| `id` | string | yes | server-generated | `"enq-1001"` |
| `fullName` | string | yes | 2–80 | `"Ramesh Bujji"` |
| `email` | string | yes | valid email | `"gudipudimani63@gmail.com"` |
| `mobile` | string | yes | 10 digits | `"8688493369"` |
| `serviceCategory` | string | yes | one of 4 | `"Insurance"` |
| `specificService` | string | yes | sub-service | `"Comprehensive health & family floater insurance"` |
| `pinCode` | string | yes | 6 digits (may be `""` if skipped) | `"522617"` |
| `comments` | string | yes | ≤ 2000, may be `""` | `"Family floater for 4 members."` |
| `consent` | boolean | yes | must be `true` to accept | `true` |
| `status` | `EnquiryStatus` | yes | defaults `"new"` | `"contacted"` |
| `priority` | `Priority` | yes | defaults `"medium"` | `"high"` |
| `assignedTo` | string \| null | yes | staff `id` or `null` | `"st-2"` |
| `followUpAt` | string \| null | yes | `YYYY-MM-DD` or `null` | `"2026-10-28"` |
| `source` | string | yes | origin, currently `"marketing"` | `"marketing"` |
| `createdAt` | string | yes | `YYYY-MM-DD` | `"2026-10-24"` |
| `notes` | `EnquiryNote[]` | yes | `[]` if none | see below |

### 2.5 `EnquiryNote`
| Field | Type | Req | Rules | Example |
| --- | --- | --- | --- | --- |
| `id` | string | yes | server-generated | `"note-1"` |
| `author` | string | yes | staff name (from token) | `"Harika Garre"` |
| `text` | string | yes | 1–2000 | `"Called client, scheduled visit."` |
| `createdAt` | string | yes | `YYYY-MM-DD` | `"2026-10-24"` |

### 2.6 `Staff`
| Field | Type | Req | Rules | Example |
| --- | --- | --- | --- | --- |
| `id` | string | yes | server-generated | `"st-2"` |
| `name` | string | yes | 2–80 | `"Harika Garre"` |
| `email` | string | yes | valid email | `"harika@kaundinya.com"` |
| `role` | `StaffRole` | yes | `admin` \| `agent` | `"agent"` |
| `active` | boolean | yes | — | `true` |

### 2.7 `ClientRecord` (admin)
| Field | Type | Req | Rules | Example |
| --- | --- | --- | --- | --- |
| `id` | string | yes | server-generated | `"cl-1"` |
| `name` | string | yes | — | `"Ramesh Bujji"` |
| `email` | string | yes | — | `"gudipudimani63@gmail.com"` |
| `mobile` | string | yes | 10 digits | `"8688493369"` |
| `joinedAt` | string | yes | `YYYY-MM-DD` | `"2026-10-24"` |
| `requestsCount` | number | yes | integer ≥ 0 | `1` |
| `verified` | boolean | yes | OTP-verified | `true` |

### 2.8 `AdminRequest` (admin view of a client request, adds client info)
| Field | Type | Req | Example |
| --- | --- | --- | --- |
| `id` | string | yes | `"req-1001"` |
| `clientName` | string | yes | `"Ramesh Bujji"` |
| `mobile` | string | yes | `"8688493369"` |
| `serviceCategory` | string | yes | `"Insurance"` |
| `specificService` | string | yes | `"Comprehensive health & family floater insurance"` |
| `status` | `RequestStatus` | yes | `"in_progress"` |
| `assignedTo` | string \| null | yes | `"st-3"` |
| `createdAt` | string | yes | `"2026-10-24"` |
| `comments` | string | yes | `"..."` |

### 2.9 `AdminStats`
| Field | Type | Example |
| --- | --- | --- |
| `totalEnquiries` | number | `7` |
| `newEnquiries` | number | `2` |
| `converted` | number | `1` |
| `openRequests` | number | `3` |
| `completedRequests` | number | `1` |
| `byService` | `{ name: string; count: number }[]` | `[{ "name": "Real Estate", "count": 2 }]` |
| `byStatus` | `{ status: EnquiryStatus; count: number }[]` | `[{ "status": "new", "count": 2 }]` |

### 2.10 `EnquiryPayload` (what the marketing form submits)
| Field | Type | Req | Rules |
| --- | --- | --- | --- |
| `fullName` | string | yes | 2–80 |
| `email` | string | yes | valid email (marketing may send `not-provided@client.local` if blank) |
| `mobile` | string | yes | 10 digits |
| `serviceCategory` | string | yes | one of 4 |
| `specificService` | string | no | sub-service |
| `pinCode` | string | no | 6 digits |
| `comments` | string | no | ≤ 2000 |
| `consent` | boolean | yes | must be `true` |

---

## 3. Authentication & OTP

### 3.1 OTP flows the frontend implements
| # | Flow | Trigger | Endpoints |
| --- | --- | --- | --- |
| 1 | New user via marketing | “Send Verification Code” button | `POST /api/enquiries` → `POST /api/otp/send` → redirect to app |
| 2 | App OTP verify | “Verify OTP” in app | `POST /api/otp/verify` → token → `/dashboard` |
| 3 | Resend OTP | “Resend OTP” (30s timer) | `POST /api/otp/send` |
| 4 | Edit mobile | “Edit” | no call (back to input) |
| 5 | Returning user | enter mobile → OTP | `POST /api/otp/send` → `POST /api/otp/verify` |

Handoff: marketing redirects to `{PUBLIC_APP_URL}/login?mobile=<10 digits>&step=otp` → app opens on OTP step.

### 3.2 `POST /api/otp/send`
- **Auth:** none
- **Request**
  ```json
  { "mobile": "8688493369" }
  ```
  | Field | Type | Req | Rules |
  | --- | --- | --- | --- |
  | `mobile` | string | yes | exactly 10 digits |
- **Response 200**
  ```json
  { "success": true, "message": "OTP sent", "data": { "expiresInSeconds": 60 } }
  ```
- **Errors:** `422` invalid mobile · `429` rate-limited

### 3.3 `POST /api/otp/verify`
- **Auth:** none
- **Request**
  ```json
  { "mobile": "8688493369", "otp": "123456" }
  ```
  | Field | Type | Req | Rules |
  | --- | --- | --- | --- |
  | `mobile` | string | yes | 10 digits |
  | `otp` | string | yes | exactly 6 digits |
- **Response 200**
  ```json
  { "success": true, "data": {
      "token": "<jwt-or-opaque>",
      "user": { "name": "Ramesh Bujji", "email": "gudipudimani63@gmail.com", "mobile": "8688493369" }
  } }
  ```
- **Errors:** `400` wrong/expired · `404` no pending OTP · `429` too many attempts

### 3.4 `GET /api/me`
- **Auth:** Bearer — **Response 200:** `{ "success": true, "data": User }`

### 3.5 `PATCH /api/me`
- **Auth:** Bearer
- **Request** (any subset; `mobile` is **not** editable)
  ```json
  { "name": "Ramesh Bujji", "email": "gudipudimani63@gmail.com", "pinCode": "522617" }
  ```
- **Response 200:** `{ "success": true, "data": User }`

### 3.6 `POST /api/auth/logout`
- **Auth:** Bearer — **Response:** `204` (no body)

---

## 4. Enquiries (marketing → backend)

### 4.1 `POST /api/enquiries`
- **Auth:** none (rate-limit by IP + mobile)
- **Request** — `EnquiryPayload` (§2.10):
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
- **Response 201**
  ```json
  { "success": true, "message": "Enquiry received", "data": { "id": "enq-1024" } }
  ```
- **Errors:** `422` validation · `429` rate-limited

---

## 5. Client requests (app)

### 5.1 `GET /api/requests`
- **Auth:** Bearer
- **Response 200**
  ```json
  { "success": true, "data": [
    { "id": "req-1001", "serviceCategory": "Real Estate",
      "specificService": "Property rentals (Residential & Commercial)",
      "status": "in_progress", "createdAt": "2026-10-22",
      "comments": "2BHK in Gachibowli" }
  ] }
  ```

### 5.2 `GET /api/requests/:id`
- **Auth:** Bearer — **Response 200:** `{ "success": true, "data": ServiceRequest }`
- **Errors:** `404` not found / not owned

### 5.3 `POST /api/requests`
- **Auth:** Bearer
- **Request**
  ```json
  { "serviceCategory": "Real Estate", "specificService": "Property loans (Purchase / Construction)", "comments": "Looking for a 2BHK" }
  ```
  | Field | Type | Req | Rules |
  | --- | --- | --- | --- |
  | `serviceCategory` | string | yes | one of 4 |
  | `specificService` | string | yes | sub-service of category |
  | `comments` | string | no | ≤ 2000 |
- **Response 201:** `{ "success": true, "data": ServiceRequest }` (status `"new"`, `createdAt` today)
- **Side effect:** create an `AppNotification` titled “Request received”

### 5.4 `PATCH /api/requests/:id` (admin only — future)
- **Auth:** Bearer (staff) — **Request:** `{ "status": "in_progress" }` — **Response 200:** `ServiceRequest`
- Allowed transitions: `new → in_progress → completed`, or `→ cancelled`. `409` if invalid.

---

## 6. Client notifications

### 6.1 `GET /api/notifications`
- **Auth:** Bearer — **Response 200:** `{ "success": true, "data": AppNotification[] }`

### 6.2 `PATCH /api/notifications/:id/read`
- **Auth:** Bearer — **Response 200:** `{ "success": true, "data": AppNotification }`

### 6.3 `POST /api/notifications/read-all`
- **Auth:** Bearer — **Response 200:** `{ "success": true, "data": AppNotification[] }` (all `read: true`)

---

## 7. Admin panel

All admin endpoints require a **staff** bearer token. For now there is a **single role** (`admin`); enforce staff authorization.

### 7.1 `GET /api/admin/stats`
- **Request:** none
- **Response 200:**
  ```json
  { "success": true, "data": {
      "totalEnquiries": 7, "newEnquiries": 2, "converted": 1,
      "openRequests": 3, "completedRequests": 1,
      "byService": [ { "name": "Real Estate", "count": 2 } ],
      "byStatus": [ { "status": "new", "count": 2 } ]
  } }
  ```

### 7.2 `GET /api/admin/enquiries`
- **Query:** `?status=<EnquiryStatus>&q=<search>` (both optional)
- **Response 200:** `{ "success": true, "data": Enquiry[] }`

### 7.3 `GET /api/admin/enquiries/:id`
- **Response 200:** `{ "success": true, "data": Enquiry }` — `404` if missing

### 7.4 `PATCH /api/admin/enquiries/:id`
- **Request** (any subset):
  ```json
  { "status": "contacted", "priority": "high", "assignedTo": "st-2", "followUpAt": "2026-10-28" }
  ```
  | Field | Type | Rules |
  | --- | --- | --- |
  | `status` | EnquiryStatus | pipeline stage |
  | `priority` | Priority | low/medium/high |
  | `assignedTo` | string \| null | staff id or null |
  | `followUpAt` | string \| null | `YYYY-MM-DD` |
- **Response 200:** `{ "success": true, "data": Enquiry }`

### 7.5 `POST /api/admin/enquiries/:id/notes`
- **Request:** `{ "text": "Called client, scheduled site visit." }`
  - `author` is taken from the token (do not trust client)
- **Response 200:** `{ "success": true, "data": Enquiry }` (new note appended)

### 7.6 `GET /api/admin/clients`
- **Response 200:** `{ "success": true, "data": ClientRecord[] }`

### 7.7 `GET /api/admin/requests`
- **Query:** `?status=<RequestStatus>` (optional)
- **Response 200:** `{ "success": true, "data": AdminRequest[] }`

### 7.8 `GET /api/admin/staff`
- **Response 200:** `{ "success": true, "data": Staff[] }`

### 7.9 `POST /api/admin/notifications/broadcast`
- **Request:**
  ```json
  { "title": "New service available", "message": "We now offer ...", "audience": "all" }
  ```
  | Field | Type | Req | Rules |
  | --- | --- | --- | --- |
  | `title` | string | yes | 1–120 |
  | `message` | string | yes | 1–2000 |
  | `audience` | `"all"` \| `"verified"` | yes | recipient scope |
- **Response 200:** `{ "success": true, "data": { "id": "ntf-broadcast-1", "recipients": 5 } }`

---

## 8. Validation rules (authoritative)

| Field | Rule |
| --- | --- |
| `mobile` | exactly 10 digits, starts 6–9 |
| `otp` | exactly 6 digits |
| `pinCode` | exactly 6 digits, first digit 1–9 (optional/empty allowed on enquiry) |
| `email` | valid email (optional in profile; required in enquiry) |
| `name` / `fullName` | 2–80 chars, trimmed |
| `serviceCategory` | one of the 4 categories |
| `specificService` | must exist within the chosen category |
| `comments` / `text` | ≤ 2000 chars |
| `consent` | must be `true` |
| `priority` | `low` \| `medium` \| `high` |
| `status` (enquiry) | `new` \| `contacted` \| `qualified` \| `converted` \| `lost` |
| `status` (request) | `new` \| `in_progress` \| `completed` \| `cancelled` |

---

## 9. Error codes & rate limits

| HTTP | Meaning | Example message |
| --- | --- | --- |
| 400 | bad request / wrong OTP | "Invalid or expired OTP." |
| 401 | missing/invalid token | "Authentication required." |
| 403 | forbidden (non-staff) | "You do not have access." |
| 404 | not found / not owned | "Request not found." |
| 409 | invalid state transition | "Cannot move a completed request." |
| 422 | validation failed | "Validation failed." + `errors` map |
| 429 | rate limited | "Too many requests. Try again in 60s." |
| 500 | server error | "Something went wrong." |

**Rate limits**: `POST /api/otp/send` — 3/mobile/10min, 10/IP/10min. `POST /api/otp/verify` — 5 attempts per OTP.

---

## 10. Frontend mock → endpoint map (what to wire)

| Frontend feature | Mock (current) | Endpoint to implement |
| --- | --- | --- |
| Marketing “Send Verification Code” | simulated | `POST /api/enquiries` + `POST /api/otp/send` |
| App OTP step | `otpSend` / `otpVerify` | `POST /api/otp/send` / `POST /api/otp/verify` |
| Dashboard / My Requests | `fetchRequests` | `GET /api/requests` |
| Request detail | `fetchRequest` | `GET /api/requests/:id` |
| Request this service | `createRequest` | `POST /api/requests` |
| Notifications | `fetchNotifications` | `GET /api/notifications` |
| Mark all read | `markAllNotificationsRead` | `POST /api/notifications/read-all` |
| Profile save | local only | `PATCH /api/me` |
| Admin overview | `fetchStats` | `GET /api/admin/stats` |
| Admin enquiries list/detail | `fetchEnquiries` / `fetchEnquiry` | `GET /api/admin/enquiries` / `:id` |
| Admin status/assign | `updateEnquiryStatus` / `assignEnquiry` | `PATCH /api/admin/enquiries/:id` |
| Admin notes | `addEnquiryNote` | `POST /api/admin/enquiries/:id/notes` |
| Admin clients | `fetchClients` | `GET /api/admin/clients` |
| Admin requests | `fetchRequests` | `GET /api/admin/requests` |
| Admin team | `fetchStaff` | `GET /api/admin/staff` |
| Admin broadcast | simulated | `POST /api/admin/notifications/broadcast` |

---

## 11. Backend acceptance checklist
1. `POST /api/otp/verify` returns a `token` + `user`; app stores it and sends `Authorization: Bearer`.
2. `/api/requests` and `/api/notifications` are scoped to the token's user.
3. `/api/admin/*` requires a staff token (single role now).
4. Dates returned as `YYYY-MM-DD`; enums returned exactly as defined in §1.
5. Status transitions enforced server-side (not just UI).
6. `author` on notes / `source` / `createdAt` set server-side, never trusted from client.
7. All list endpoints newest-first.

## 12. Module-specific APIs (planned — UI to be built in phases)

> These extend the generic request model into the full 4-module experiences.
> See `docs/roadmap-modules.md` for phasing. Implement in `apps/api`; the frontend will
> consume them from `apps/app` (and `apps/admin`). **Not yet built** — this is the contract to build against.

### 12.1 Shared additions

**New enums**
| Enum | Allowed values |
| --- | --- |
| `Module` | `"real-estate"`, `"insurance"`, `"home-services"`, `"loans"` |
| `ListingType` | `"rent"`, `"sale"` |
| `PropertyType` | `"apartment"`, `"villa"`, `"plot"`, `"commercial"` |
| `PlanType` | `"life"`, `"health"`, `"motor"` |
| `JobStatus` | `"accepted"`, `"assigned"`, `"en_route"`, `"in_progress"`, `"rating"`, `"completed"` |
| `LoanStage` | `"application"`, `"verified"`, `"submitted"`, `"approved"`, `"disbursed"`, `"rejected"` |

**New shared types**
| Type | Fields |
| --- | --- |
| `FileAsset` | `id`, `url`, `name`, `mimeType`, `size` |
| `Payment` | `id`, `method` (`"upi"`/`"card"`/`"netbanking"`), `amount` (paise), `status` (`"created"`/`"paid"`/`"failed"`), `createdAt` |
| `Pagination` (optional) | `?page=&limit=` on long lists |

---

### 12.2 Real Estate

| Method | Endpoint | Auth | Frontend sends | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/properties` | none | `?listingType=rent\|sale&location=&budgetMin=&budgetMax=&bhk=` | `PropertyListing[]` |
| GET | `/api/properties/:id` | none | path `id` | `PropertyListing` |
| POST | `/api/properties` | Bearer | owner listing wizard payload (below) | `PropertyListing` |
| POST | `/api/properties/:id/photos` | Bearer | multipart files | `FileAsset[]` |
| POST | `/api/valuations` | Bearer | `{ propertyType, location, contactName, mobile, preferredSlot }` | `{ id, status }` |
| POST | `/api/site-visits` | Bearer | `{ propertyId, slot (ISO), name, mobile }` | `SiteVisit` |
| GET | `/api/site-visits` | Bearer | — | `SiteVisit[]` |

**`PropertyListing`**: `id, title, listingType, propertyType, bhk, location, latitude, longitude, price, priceUnit ("month"|"total"), amenities[], images (FileAsset[]), reraAgentNumber, status ("draft"|"active"|"sold"|"rented"), createdAt`
**`SiteVisit`**: `id, propertyId, slot (ISO), status ("requested"|"confirmed"|"done"|"cancelled"), adviserId`

---

### 12.3 Insurance

| Method | Endpoint | Auth | Frontend sends | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/insurance/plans` | none | `?type=life\|health\|motor&insurer=&age=&familySize=` | `InsurancePlan[]` |
| POST | `/api/insurance/needs-analysis` | Bearer | `{ type, age, income, dependents, smoking, liabilities }` | `{ recommendedCoverage, estimatedPremium }` |
| POST | `/api/insurance/compare` | Bearer | `{ planIds: string[] }` | `InsurancePlan[]` |
| POST | `/api/insurance/quotes` | Bearer | needs profile | `PolicyQuote[]` |
| GET | `/api/insurance/network-hospitals` | none | `?pincode=` | `Hospital[]` |
| POST | `/api/insurance/motor/vehicle-lookup` | Bearer | `{ registrationNumber }` (Vahan) | `VehicleInfo` |
| POST | `/api/insurance/motor/checkout` | Bearer | `{ planId, vehicle }` | `{ paymentIntentId, amount }` |
| GET | `/api/policies` | Bearer | `?expiringInDays=30` | `PolicyRecord[]` (Policy Vault) |
| GET | `/api/policies/:id` | Bearer | path `id` | `PolicyRecord` |

**`InsurancePlan`**: `id, type, insurer, name, sumInsured, premium, tenure, features[], cashlessNetwork?, pospLicense`
**`PolicyQuote`**: `id, planId, premium, addons[], validTill`
**`Hospital`**: `id, name, address, pincode, cashless (bool), distanceKm?`
**`VehicleInfo`**: `registrationNumber, make, model, fuelType, year, engineCC`
**`PolicyRecord`**: `id, policyNumber, type, insurer, validFrom, validTo, pdfUrl (FileAsset), status`

---

### 12.4 Property Management & Home Services

| Method | Endpoint | Auth | Frontend sends | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/home-services/catalog` | none | — | `HomeServiceItem[]` |
| POST | `/api/home-services/measurements` | Bearer | `{ serviceId, address, slot, name, mobile }` | `MeasurementBooking` |
| POST | `/api/home-services/jobs` | Bearer | `{ serviceId, issueType?, address, slot?, notes? }` | `Job` |
| GET | `/api/jobs` | Bearer | — | `Job[]` |
| GET | `/api/jobs/:id` | Bearer | path `id` | `Job` |
| POST | `/api/jobs/:id/start-otp` | Bearer | — | `{ expiresInSeconds }` |
| POST | `/api/jobs/:id/verify-start` | technician | `{ otp }` | `Job` |
| POST | `/api/jobs/:id/rating` | Bearer | `{ stars (1–5), comment? }` | `JobRating` |
| POST | `/api/documents` | Bearer | multipart (`docType`, file) → watermark | `DocumentRecord` |
| POST | `/api/printouts` | Bearer | `{ fileId, copies }` (auto-delete after print) | `PrintJob` |
| POST | `/api/interiors/consultations` | Bearer | `{ style?, budget?, name, mobile }` | `{ id }` |

**`HomeServiceItem`**: `id, name, category, pricingModel ("fixed"|"per_sqft"), basePrice, unit, issueTypes[], image?`
**`MeasurementBooking`**: `id, serviceId, address, slot, status`
**`Job`**: `id, serviceId, issueType, clientName, mobile, address, status (JobStatus), technician { id, name, phone }?, createdAt`
**`DocumentRecord`**: `id, docType, file (FileAsset), watermark ("For Kaundinya ID Update Only"), createdAt`
**`PrintJob`**: `id, fileId, copies, price, status, autoDeletedAt`

---

### 12.5 Loans

| Method | Endpoint | Auth | Frontend sends | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/loans/emi/calculate` | none | `{ principal, annualRate, tenureMonths }` | `{ emi, totalInterest, totalPayable }` |
| POST | `/api/loans/eligibility` | Bearer | `{ monthlyIncome, obligations, age, employmentType }` | `{ eligibleAmount, maxTenure }` |
| POST | `/api/loans/applications` | Bearer | loan application payload (below) | `LoanApplication` |
| GET | `/api/loans/applications` | Bearer | — | `LoanApplication[]` |
| GET | `/api/loans/applications/:id` | Bearer | path `id` | `LoanApplication` |
| POST | `/api/loans/documents` | Bearer | multipart (payslip/ITR, auto-compress) | `FileAsset` |
| POST | `/api/loans/credit-check` | Bearer | `{ consent: true }` (soft pull) | `{ scoreBand, eligibleProducts[] }` |
| POST | `/api/loans/personal/profile` | Bearer | `{ employmentType ("salaried"\|"self_employed"), corporateEmail?, business? }` | `{ ok }` |
| POST | `/api/loans/business/gstin-lookup` | Bearer | `{ gstin }` | `{ legalName, address }` |

**`LoanApplication`**: `id, loanType ("home"|"personal"|"business"|"lap"), stage (LoanStage), amountRequested, propertyId?, personalProfile?, businessProfile?, documents (FileAsset[]), createdAt`

---

### 12.6 Admin pipeline additions

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/admin/properties` | staff | List/moderate listings |
| PATCH | `/api/admin/properties/:id` | staff | Approve / reject / change status |
| GET | `/api/admin/valuations` | staff | Valuation requests queue |
| GET | `/api/admin/site-visits` | staff | Site-visit schedule |
| GET | `/api/admin/renewals` | staff | Policies expiring (30 days) |
| POST | `/api/admin/renewals/trigger` | staff | Send renewal reminders |
| GET | `/api/admin/jobs` | staff | Job dispatch board |
| PATCH | `/api/admin/jobs/:id` | staff | Assign technician / advance status |
| GET | `/api/admin/loans` | staff | Loan pipeline (5 stages) |
| PATCH | `/api/admin/loans/:id` | staff | Advance stage / assign adviser |
| GET | `/api/admin/ratings` | staff | Job ratings |

### 12.7 Payments & uploads (shared)
| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/payments` | Bearer | Create payment intent (UPI/card) |
| POST | `/api/payments/:id/confirm` | Bearer | Confirm payment |
| POST | `/api/uploads` | Bearer | Generic secure upload → `FileAsset` |

**Integrations the backend must own:** Vahan (vehicle), credit bureau soft pull, banking partner APIs, UPI/payment gateway, KYC/OCR + secure storage, SMS/OTP (auth + Start-Job OTP), maps/pincode, PDF generation + compression, e-sign (future). See `docs/roadmap-modules.md` for the mapping.

_End of specification._
