import { readStaffToken, type StaffUser } from "./staff-session";

export type AdminPropertyStatus =
  | "draft"
  | "active"
  | "sold"
  | "rented"
  | "rejected";

export type AdminProperty = {
  id: string;
  title: string;
  description: string;
  listingType: "rent" | "sale";
  propertyType: string;
  bhk: string;
  location: string;
  city: string;
  pincode: string;
  price: number;
  priceUnit: "month" | "total";
  areaSqft: number;
  furnishing?: string;
  amenities: string[];
  images: string[];
  reraAgentNumber?: string;
  status: AdminPropertyStatus;
  featured: boolean;
  createdAt: string;
};

export type AdminEnquiry = {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  serviceCategory: string;
  specificService: string;
  pinCode: string;
  comments: string;
  status: string;
  priority: string;
  source: string;
  assignedTo: string | null;
  followUpAt: string | null;
  createdAt: string;
  notes: Array<{
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }>;
};

export type AdminValuation = {
  id: string;
  ownerName: string;
  mobile: string;
  propertyType: string;
  location: string;
  pincode: string;
  expectedPrice?: number;
  notes?: string;
  advisor?: string;
  intent?: "rent" | "sale";
  adminNotes?: string;
  status: string;
  createdAt: string;
};

export type AdminSiteVisit = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  mobile: string;
  date: string;
  slot: string;
  status: string;
  notes?: string;
  adviserId?: string;
  createdAt: string;
};

export type AdminJobStatus =
  | "requested"
  | "assigned"
  | "en_route"
  | "in_progress"
  | "completed"
  | "cancelled";

export type AdminJob = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  clientCode: string | null;
  serviceId?: string;
  serviceName: string;
  status: AdminJobStatus;
  technician: string | null;
  technicianPhone: string | null;
  technicianId: string | null;
  scheduledAt: string | null;
  rating: number | null;
  ratingComment: string | null;
  address: string | null;
  notes: string | null;
  issueTypes: string[];
  amount: number | null;
  createdAt: string;
};

export type AdminMeasurement = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  clientCode: string | null;
  serviceId: string;
  serviceName: string;
  address: string;
  pincode: string;
  date: string;
  slot: string;
  surveyor: string | null;
  notes: string | null;
  status: "requested" | "scheduled" | "completed";
  createdAt: string;
};

export type AdminInterior = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  clientCode: string | null;
  style: string;
  budget: string;
  notes: string | null;
  advisor: string | null;
  adminNotes: string | null;
  status: "requested" | "contacted" | "scheduled" | "completed";
  createdAt: string;
};

export type AdminDocument = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  clientCode: string | null;
  docType: string;
  fileName: string;
  url: string | null;
  watermark: string;
  createdAt: string;
};

export type HomeServicesStats = {
  jobsTotal: number;
  jobsRequested: number;
  jobsActive: number;
  jobsCompleted: number;
  measurementsPending: number;
  interiorsPending: number;
  documentsTotal: number;
};

export type AdminPropertyFilters = {
  q?: string;
  status?: string;
  listingType?: string;
  bhk?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type AdminStats = {
  propertiesTotal: number;
  pendingProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  enquiryTotal: number;
  newEnquiries: number;
  valuationsPending: number;
  siteVisitsPending: number;
};

export type AdminAuditLog = {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string | null;
  createdAt: string;
};

export type AdminRealEstateRequests = {
  enquiries: AdminEnquiry[];
  valuations: AdminValuation[];
  siteVisits: AdminSiteVisit[];
  listings: AdminProperty[];
};

export type AdminRequestKind = "enquiry" | "valuation" | "site-visit";

export type AdminPropertyPatch = {
  title?: string;
  description?: string;
  listingType?: "rent" | "sale";
  propertyType?: string;
  bhk?: string;
  location?: string;
  city?: string;
  pincode?: string;
  price?: number;
  areaSqft?: number;
  furnishing?: string | null;
  amenities?: string[];
  reraAgentNumber?: string | null;
  status?: AdminPropertyStatus;
  featured?: boolean;
};

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export const adminApiBase = API_BASE;
function apiFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = readStaffToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return globalThis.fetch(input, { ...init, headers });
}

export type AdminCreatePropertyInput = {
  title: string;
  description?: string;
  listingType: "rent" | "sale";
  propertyType: string;
  bhk: string;
  location: string;
  pincode: string;
  price: number;
  areaSqft: number;
  furnishing?: string;
  amenities?: string[];
  status?: AdminPropertyStatus;
  featured?: boolean;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await apiFetch(`${API_BASE}/api/admin/stats`);
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminStats }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not load stats (${response.status}).`,
    );
  }

  return payload.data;
}

export async function fetchAuditLogs(limit = 25): Promise<AdminAuditLog[]> {
  const response = await apiFetch(`${API_BASE}/api/admin/audit?limit=${limit}`);
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminAuditLog[] }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not load activity (${response.status}).`,
    );
  }

  return payload.data ?? [];
}

async function deleteAdminResource(path: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(
      payload?.message || `Could not delete (${response.status}).`,
    );
  }
}

async function patchAdmin(
  path: string,
  body: Record<string, unknown>,
): Promise<void> {
  const response = await apiFetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not save changes (${response.status}).`,
    );
  }
}

export function updateAdminValuation(
  id: string,
  patch: {
    status?: string;
    advisor?: string | null;
    intent?: "rent" | "sale" | null;
    adminNotes?: string | null;
  },
): Promise<void> {
  return patchAdmin(`/api/admin/valuations/${id}`, patch);
}

export function updateAdminSiteVisit(
  id: string,
  patch: {
    status?: string;
    date?: string;
    slot?: string;
    adviserId?: string | null;
  },
): Promise<void> {
  return patchAdmin(`/api/admin/site-visits/${id}`, patch);
}

export function updateAdminEnquiry(
  id: string,
  patch: {
    status?: string;
    priority?: string;
    assignedTo?: string | null;
    followUpAt?: string | null;
  },
): Promise<void> {
  return patchAdmin(`/api/admin/enquiries/${id}`, patch);
}

export async function addAdminEnquiryNote(
  id: string,
  text: string,
): Promise<void> {
  const response = await apiFetch(`${API_BASE}/api/admin/enquiries/${id}/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not add note (${response.status}).`,
    );
  }
}

export async function createAdminProperty(
  input: AdminCreatePropertyInput,
): Promise<AdminProperty> {
  const response = await apiFetch(`${API_BASE}/api/admin/properties`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminProperty }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not add property (${response.status}).`,
    );
  }

  return payload.data;
}

export async function updateAdminProperty(
  id: string,
  patch: AdminPropertyPatch,
): Promise<AdminProperty> {
  const response = await apiFetch(`${API_BASE}/api/admin/properties/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminProperty }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not update property (${response.status}).`,
    );
  }

  return payload.data;
}

export async function deleteAdminProperty(id: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/api/admin/properties/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(
      payload?.message || `Could not delete property (${response.status}).`,
    );
  }
}

export async function updateAdminRequest(
  kind: AdminRequestKind,
  id: string,
  status: string,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/real-estate/requests/${kind}/${id}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not update request (${response.status}).`,
    );
  }
}

export async function fetchAdminRealEstateRequests(
  query = "",
): Promise<AdminRealEstateRequests> {
  const url = new URL(`${API_BASE}/api/admin/real-estate/requests`);
  if (query.trim()) {
    url.searchParams.set("q", query.trim());
  }

  const response = await apiFetch(url.toString());
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminRealEstateRequests }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not load requests (${response.status}).`,
    );
  }

  return payload.data;
}

export async function fetchHomeServicesStats(): Promise<HomeServicesStats> {
  const response = await apiFetch(`${API_BASE}/api/admin/home-services/stats`);
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: HomeServicesStats }
    | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not load Home Services stats (${response.status}).`,
    );
  }
  return payload.data;
}

export async function fetchAdminJobs(): Promise<AdminJob[]> {
  const response = await apiFetch(`${API_BASE}/api/admin/home-services/jobs`);
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminJob[] }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Could not load jobs (${response.status}).`);
  }
  return payload.data ?? [];
}

export function updateAdminJob(
  id: string,
  patch: {
    status?: AdminJobStatus;
    serviceName?: string;
    address?: string;
    issueTypes?: string[];
    notes?: string | null;
    technicianName?: string | null;
    technicianPhone?: string | null;
    technicianId?: string | null;
    scheduledAt?: string | null;
    amount?: number | null;
  },
): Promise<void> {
  return patchAdmin(`/api/admin/home-services/jobs/${id}`, patch);
}

export async function deleteAdminJob(id: string): Promise<void> {
  await deleteAdminResource(`/api/admin/home-services/jobs/${id}`);
}

export async function fetchAdminMeasurements(): Promise<AdminMeasurement[]> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/home-services/measurements`,
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminMeasurement[] }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not load measurements (${response.status}).`,
    );
  }
  return payload.data ?? [];
}

export function updateAdminMeasurement(
  id: string,
  patch: {
    status?: "requested" | "scheduled" | "completed";
    serviceName?: string;
    address?: string;
    pincode?: string;
    date?: string;
    slot?: string;
    surveyor?: string | null;
    notes?: string | null;
  },
): Promise<void> {
  return patchAdmin(`/api/admin/home-services/measurements/${id}`, patch);
}

export async function deleteAdminMeasurement(id: string): Promise<void> {
  await deleteAdminResource(`/api/admin/home-services/measurements/${id}`);
}

export async function fetchAdminInteriors(): Promise<AdminInterior[]> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/home-services/interiors`,
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminInterior[] }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not load consultations (${response.status}).`,
    );
  }
  return payload.data ?? [];
}

export function updateAdminInterior(
  id: string,
  patch: {
    status?: "requested" | "contacted" | "scheduled" | "completed";
    name?: string;
    mobile?: string;
    style?: string;
    budget?: string;
    notes?: string | null;
    advisor?: string | null;
    adminNotes?: string | null;
  },
): Promise<void> {
  return patchAdmin(`/api/admin/home-services/interiors/${id}`, patch);
}

export async function deleteAdminInterior(id: string): Promise<void> {
  await deleteAdminResource(`/api/admin/home-services/interiors/${id}`);
}

export async function fetchAdminDocuments(): Promise<AdminDocument[]> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/home-services/documents`,
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminDocument[] }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not load documents (${response.status}).`,
    );
  }
  return payload.data ?? [];
}

export async function deleteAdminDocument(id: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/home-services/documents/${id}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(
      payload?.message || `Could not delete document (${response.status}).`,
    );
  }
}

export async function fetchAdminProperties(
  filters: AdminPropertyFilters = {},
): Promise<AdminProperty[]> {
  const url = new URL(`${API_BASE}/api/admin/properties`);
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.status) url.searchParams.set("status", filters.status);
  if (filters.listingType) {
    url.searchParams.set("listingType", filters.listingType);
  }
  if (filters.bhk) url.searchParams.set("bhk", filters.bhk);
  if (filters.minPrice) url.searchParams.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) url.searchParams.set("maxPrice", String(filters.maxPrice));

  const response = await apiFetch(url.toString());
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminProperty[] }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not load properties (${response.status}).`,
    );
  }

  return payload.data ?? [];
}

/* ------------------------------ Insurance ------------------------------- */

export type AdminInsuranceType = "life" | "health" | "motor" | "property";
export type AdminFamilyOption = "self" | "couple" | "parents" | "family";

export type AdminInsurancePlan = {
  id: string;
  type: AdminInsuranceType;
  insurer: string;
  name: string;
  sumInsured: number;
  premium: number;
  tenureYears: number;
  features: string[];
  cashlessNetwork?: number;
  pospLicense?: string;
  familyOption?: AdminFamilyOption;
  active: boolean;
};

export type InsuranceStats = {
  plansTotal: number;
  plansActive: number;
  policiesTotal: number;
  activePolicies: number;
  renewalsDue: number;
  premiumTotal: number;
};

export type AdminPolicy = {
  id: string;
  type: "Life & Term" | "Health" | "Motor" | "Property";
  provider: string;
  policyNumber: string;
  coverAmount: number;
  premium: number;
  renewalDate: string;
  status: "active" | "expiring" | "lapsed";
  holder?: string;
  validFrom?: string;
  pdfUrl?: string;
  userId: string;
  clientName: string;
  mobile: string;
  reminderSent: boolean;
  createdAt: string;
};

export type AdminRenewal = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  provider: string;
  policyType: string;
  policyNumber: string;
  renewalDate: string;
  premium: number;
  coverAmount: number;
  reminderSent: boolean;
  daysLeft: number;
};

export type AdminInsurancePlanInput = {
  type: AdminInsuranceType;
  insurer: string;
  name: string;
  sumInsured: number;
  premium: number;
  tenureYears: number;
  features?: string[];
  cashlessNetwork?: number | null;
  pospLicense?: string | null;
  familyOption?: AdminFamilyOption | null;
  active?: boolean;
};

async function jsonRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const url =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${API_BASE}${path}`;
  const response = await apiFetch(url, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: T }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Request failed (${response.status}).`,
    );
  }
  return payload.data as T;
}

export function fetchInsuranceStats(): Promise<InsuranceStats> {
  return jsonRequest<InsuranceStats>("/api/admin/insurance/stats", "GET");
}

export function fetchAdminInsurancePlans(
  filters: { q?: string; type?: string } = {},
): Promise<AdminInsurancePlan[]> {
  const url = new URL(`${API_BASE}/api/admin/insurance/plans`);
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.type) url.searchParams.set("type", filters.type);
  return jsonRequest<AdminInsurancePlan[]>(url.toString(), "GET");
}

export function createAdminInsurancePlan(
  input: AdminInsurancePlanInput,
): Promise<AdminInsurancePlan> {
  return jsonRequest<AdminInsurancePlan>(
    "/api/admin/insurance/plans",
    "POST",
    input,
  );
}

export function updateAdminInsurancePlan(
  id: string,
  patch: Partial<AdminInsurancePlanInput>,
): Promise<AdminInsurancePlan> {
  return jsonRequest<AdminInsurancePlan>(
    `/api/admin/insurance/plans/${id}`,
    "PATCH",
    patch,
  );
}

export function deleteAdminInsurancePlan(id: string): Promise<void> {
  return jsonRequest<void>(`/api/admin/insurance/plans/${id}`, "DELETE");
}

export function fetchAdminPolicies(q = ""): Promise<AdminPolicy[]> {
  const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return jsonRequest<AdminPolicy[]>(`/api/admin/policies${query}`, "GET");
}

export function updateAdminPolicy(
  id: string,
  patch: {
    status?: "active" | "expiring" | "lapsed";
    provider?: string;
    policyNumber?: string;
    coverAmount?: number;
    premium?: number;
    renewalDate?: string;
    holder?: string | null;
    validFrom?: string | null;
  },
): Promise<AdminPolicy> {
  return jsonRequest<AdminPolicy>(`/api/admin/policies/${id}`, "PATCH", patch);
}

export function deleteAdminPolicy(id: string): Promise<void> {
  return jsonRequest<void>(`/api/admin/policies/${id}`, "DELETE");
}

export function fetchAdminRenewals(): Promise<AdminRenewal[]> {
  return jsonRequest<AdminRenewal[]>("/api/admin/renewals", "GET");
}

export function sendAdminRenewalReminder(id: string): Promise<AdminRenewal> {
  return jsonRequest<AdminRenewal>(
    `/api/admin/renewals/${id}/remind`,
    "POST",
  );
}

/* -------------------------------- Loans --------------------------------- */

export type AdminLoanStatus =
  | "application"
  | "verified"
  | "submitted"
  | "approved"
  | "disbursed";

export type AdminLoan = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  loanType: "Home" | "Personal" | "Business" | "Mortgage";
  amount: number;
  status: AdminLoanStatus;
  bank: string | null;
  monthlyIncome?: number;
  tenureMonths?: number;
  employmentType?: "salaried" | "self-employed";
  purpose?: string;
  documents: string[];
  advisor: string | null;
  propertyId?: string;
  internalNotes: string | null;
  startedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoansStats = {
  applicationsTotal: number;
  inProgress: number;
  approved: number;
  disbursed: number;
  totalAmount: number;
};

export function fetchLoansStats(): Promise<LoansStats> {
  return jsonRequest<LoansStats>("/api/admin/loans/stats", "GET");
}

export function fetchAdminLoans(
  filters: { q?: string; status?: string } = {},
): Promise<AdminLoan[]> {
  const url = new URL(`${API_BASE}/api/admin/loans/applications`);
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.status) url.searchParams.set("status", filters.status);
  return jsonRequest<AdminLoan[]>(url.toString(), "GET");
}

export function updateAdminLoan(
  id: string,
  patch: {
    status?: AdminLoanStatus;
    bank?: string | null;
    advisor?: string | null;
    internalNotes?: string | null;
  },
): Promise<AdminLoan> {
  return jsonRequest<AdminLoan>(
    `/api/admin/loans/applications/${id}`,
    "PATCH",
    patch,
  );
}

export function deleteAdminLoan(id: string): Promise<void> {
  return jsonRequest<void>(`/api/admin/loans/applications/${id}`, "DELETE");
}

/* --------------------------- Service requests --------------------------- */

export type AdminServiceRequestStatus =
  | "new"
  | "in_progress"
  | "completed"
  | "cancelled";

export type AdminServiceRequest = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  clientCode: string | null;
  serviceCategory: string;
  specificService: string;
  status: AdminServiceRequestStatus;
  comments: string;
  createdAt: string;
};

export type ServiceRequestStats = {
  total: number;
  new: number;
  inProgress: number;
  completed: number;
};

export function fetchServiceRequestStats(): Promise<ServiceRequestStats> {
  return jsonRequest<ServiceRequestStats>(
    "/api/admin/requests/stats",
    "GET",
  );
}

export function fetchAdminServiceRequests(
  filters: { q?: string; category?: string; status?: string } = {},
): Promise<AdminServiceRequest[]> {
  const url = new URL(`${API_BASE}/api/admin/requests`);
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.category) url.searchParams.set("category", filters.category);
  if (filters.status) url.searchParams.set("status", filters.status);
  return jsonRequest<AdminServiceRequest[]>(url.toString(), "GET");
}

export function updateAdminServiceRequest(
  id: string,
  patch: { status: AdminServiceRequestStatus; adminNotes?: string | null },
): Promise<AdminServiceRequest> {
  return jsonRequest<AdminServiceRequest>(
    `/api/admin/requests/${id}`,
    "PATCH",
    patch,
  );
}

/* --------------------------- Admin notifications ------------------------ */

export type AdminNotificationKind =
  | "request"
  | "job"
  | "loan"
  | "policy"
  | "property"
  | "system";

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  kind: AdminNotificationKind;
  href?: string;
  read: boolean;
  clientUserId?: string;
  clientCode?: string;
  clientName?: string;
  clientMobile?: string;
  createdAt: string;
};

export type AdminNotificationStats = {
  total: number;
  unread: number;
};

export function fetchAdminNotifications(
  limit = 100,
): Promise<AdminNotification[]> {
  return jsonRequest<AdminNotification[]>(
    `/api/admin/notifications?limit=${limit}`,
    "GET",
  );
}

export function fetchAdminNotificationStats(): Promise<AdminNotificationStats> {
  return jsonRequest<AdminNotificationStats>(
    "/api/admin/notifications/stats",
    "GET",
  );
}

export function markAdminNotificationRead(
  id: string,
): Promise<AdminNotification> {
  return jsonRequest<AdminNotification>(
    `/api/admin/notifications/${id}/read`,
    "PATCH",
    {},
  );
}

export function markAllAdminNotificationsRead(): Promise<AdminNotification[]> {
  return jsonRequest<AdminNotification[]>(
    "/api/admin/notifications/read-all",
    "POST",
    {},
  );
}

/* ------------------------------- Staff auth ----------------------------- */

export type StaffLoginMethod = {
  exists: boolean;
  hasPin: boolean;
  profileComplete: boolean;
};

export function staffCheckLoginMethod(
  mobile: string,
): Promise<StaffLoginMethod> {
  return jsonRequest<StaffLoginMethod>("/api/staff/login-method", "POST", {
    mobile,
  });
}

export function staffSendOtp(
  mobile: string,
): Promise<{ expiresInSeconds: number; devOtp?: string }> {
  return jsonRequest<{ expiresInSeconds: number; devOtp?: string }>(
    "/api/staff/otp/send",
    "POST",
    { mobile },
  );
}

export function staffVerifyOtp(
  mobile: string,
  otp: string,
): Promise<{ token: string; staff: StaffUser }> {
  return jsonRequest<{ token: string; staff: StaffUser }>(
    "/api/staff/otp/verify",
    "POST",
    { mobile, otp },
  );
}

export function staffPinLogin(
  mobile: string,
  pin: string,
): Promise<{ token: string; staff: StaffUser }> {
  return jsonRequest<{ token: string; staff: StaffUser }>(
    "/api/staff/pin/login",
    "POST",
    { mobile, pin },
  );
}

export function staffMe(): Promise<StaffUser> {
  return jsonRequest<StaffUser>("/api/staff/me", "GET");
}

export function staffSetPin(
  pin: string,
  currentPin?: string,
): Promise<StaffUser> {
  return jsonRequest<StaffUser>("/api/staff/pin/set", "POST", {
    pin,
    currentPin,
  });
}

export function staffChangePin(
  currentPin: string,
  newPin: string,
): Promise<StaffUser> {
  return jsonRequest<StaffUser>("/api/staff/pin/change", "POST", {
    currentPin,
    newPin,
  });
}

export function staffLogout(): Promise<void> {
  return jsonRequest<void>("/api/staff/logout", "POST", {});
}

export function fetchAdminStaff(): Promise<StaffUser[]> {
  return jsonRequest<StaffUser[]>("/api/admin/staff", "GET");
}

export function createAdminPartner(input: {
  name: string;
  mobile: string;
  email?: string;
  pin: string;
}): Promise<StaffUser> {
  return jsonRequest<StaffUser>("/api/admin/staff", "POST", input);
}

export function updateAdminStaff(
  id: string,
  patch: {
    name?: string;
    email?: string;
    active?: boolean;
    pin?: string;
  },
): Promise<StaffUser> {
  return jsonRequest<StaffUser>(`/api/admin/staff/${id}`, "PATCH", patch);
}
