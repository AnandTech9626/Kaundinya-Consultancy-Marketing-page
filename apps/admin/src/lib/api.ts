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

export type AdminDigitalDocumentStatus =
  | "submitted"
  | "documents_received"
  | "processing"
  | "completed";

export type AdminDigitalDocument = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  clientCode: string | null;
  docType: string;
  fileName: string;
  url: string | null;
  watermark: string;
  status: AdminDigitalDocumentStatus;
  createdAt: string;
};

export type AdminPrintStatus =
  | "queued"
  | "printing"
  | "ready_for_pickup"
  | "completed";

export type AdminPrintJob = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  clientCode: string | null;
  fileName: string;
  url: string | null;
  pages: number;
  copies: number;
  paperSize: "A4" | "A3";
  colorMode: "bw" | "color";
  sides: "single" | "double";
  binding: "none" | "staple" | "spiral";
  price: number;
  status: AdminPrintStatus;
  autoDeletedAt: string | null;
  createdAt: string;
};

export type DigitalServicesStats = {
  documentsTotal: number;
  documentsPending: number;
  printJobsTotal: number;
  printJobsQueued: number;
  printJobsReady: number;
};

export type HomeServicesStats = {
  jobsTotal: number;
  jobsRequested: number;
  jobsActive: number;
  jobsCompleted: number;
  measurementsPending: number;
  interiorsPending: number;
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
  images?: string[];
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

export async function fetchDigitalServicesStats(): Promise<DigitalServicesStats> {
  const response = await apiFetch(`${API_BASE}/api/admin/digital-services/stats`);
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: DigitalServicesStats }
    | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message ||
        `Could not load Digital Services stats (${response.status}).`,
    );
  }
  return payload.data;
}

export async function fetchAdminDigitalDocuments(): Promise<
  AdminDigitalDocument[]
> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/digital-services/documents`,
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminDigitalDocument[] }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not load documents (${response.status}).`,
    );
  }
  return payload.data ?? [];
}

export function updateAdminDigitalDocument(
  id: string,
  patch: { status?: AdminDigitalDocumentStatus },
): Promise<void> {
  return patchAdmin(`/api/admin/digital-services/documents/${id}`, patch);
}

export async function deleteAdminDigitalDocument(id: string): Promise<void> {
  await deleteAdminResource(`/api/admin/digital-services/documents/${id}`);
}

export async function fetchAdminPrintJobs(): Promise<AdminPrintJob[]> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/digital-services/printouts`,
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminPrintJob[] }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Could not load print jobs (${response.status}).`,
    );
  }
  return payload.data ?? [];
}

export function updateAdminPrintJob(
  id: string,
  patch: { status?: AdminPrintStatus },
): Promise<void> {
  return patchAdmin(`/api/admin/digital-services/printouts/${id}`, patch);
}

export async function deleteAdminPrintJob(id: string): Promise<void> {
  await deleteAdminResource(`/api/admin/digital-services/printouts/${id}`);
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
  insurerLogoUrl?: string | null;
  brochureUrl?: string | null;
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
  serialNo: number;
  type: "Life & Term" | "Health" | "Motor" | "Property";
  provider: string;
  policyNumber: string;
  coverAmount: number;
  premium: number;
  renewalDate: string;
  status: "pending" | "active" | "expiring" | "lapsed";
  holder?: string;
  validFrom?: string;
  vehicleType?: "2W" | "4W" | null;
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
  insurerLogoUrl?: string | null;
  brochureUrl?: string | null;
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
    status?: "pending" | "active" | "expiring" | "lapsed";
    provider?: string;
    policyNumber?: string;
    type?: AdminPolicy["type"];
    vehicleType?: "2W" | "4W" | null;
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

export type CreateAdminPolicyInput = {
  clientMobile: string;
  policyNumber: string;
  provider: string;
  type: AdminPolicy["type"];
  vehicleType?: "2W" | "4W" | null;
  holder?: string | null;
  coverAmount: number;
  premium: number;
  validFrom?: string | null;
  renewalDate: string;
  status?: "pending" | "active" | "expiring" | "lapsed";
};

export function createAdminPolicy(
  input: CreateAdminPolicyInput,
): Promise<AdminPolicy> {
  return jsonRequest<AdminPolicy>("/api/admin/policies", "POST", input);
}

export type PolicyImportResult = {
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
};

export async function importAdminPoliciesCsv(
  file: File,
): Promise<PolicyImportResult> {
  const form = new FormData();
  form.append("file", file);
  const response = await apiFetch(`${API_BASE}/api/admin/policies/import`, {
    method: "POST",
    body: form,
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: PolicyImportResult }
    | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Import failed (${response.status}).`,
    );
  }
  return payload.data as PolicyImportResult;
}

export async function downloadPolicyImportTemplate(): Promise<void> {
  const response = await apiFetch(
    `${API_BASE}/api/admin/policies/import/template`,
  );
  if (!response.ok) {
    throw new Error(`Could not download the template (${response.status}).`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "insurance-policies-template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function uploadInsuranceMedia(
  file: File,
): Promise<{ url: string; name: string; mimeType: string; size: number }> {
  const form = new FormData();
  form.append("file", file);
  const response = await apiFetch(`${API_BASE}/api/admin/insurance/media`, {
    method: "POST",
    body: form,
  });
  const payload = (await response.json().catch(() => null)) as
    | {
        success?: boolean;
        message?: string;
        data?: { url: string; name: string; mimeType: string; size: number };
      }
    | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Upload failed (${response.status}).`,
    );
  }
  return payload.data;
}

export function runAdminRenewalEngine(): Promise<{
  checked: number;
  reminded: number;
}> {
  return jsonRequest<{ checked: number; reminded: number }>(
    "/api/admin/renewals/run",
    "POST",
  );
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

/* --------------------- Bank plans & client requirements ------------------ */

export type LoanType = "Home" | "Personal" | "Business" | "Mortgage";
export type IncomeSource = "salaried" | "business";

export type AdminLoanPlan = {
  id: string;
  bank: string;
  product: string;
  loanType: LoanType;
  employmentTypes: IncomeSource[];
  minMonthlyIncome: number;
  annualRate: number;
  maxTenureMonths: number;
  minAmount: number;
  maxAmount: number;
  active: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLoanPlanInput = {
  bank: string;
  product: string;
  loanType: LoanType;
  employmentTypes: IncomeSource[];
  minMonthlyIncome: number;
  annualRate: number;
  maxTenureMonths: number;
  minAmount: number;
  maxAmount: number;
  active?: boolean;
};

export type AdminLoanRequirement = {
  id: string;
  userId: string;
  clientName: string;
  mobile: string;
  sourceOfIncome: IncomeSource;
  monthlyIncome: number;
  monthlyEmis: number;
  eligibleAmount: number;
  indicativeEmi: number;
  recommendedPlanIds: string[];
  topBank: string | null;
  topRateBps: number | null;
  createdAt: string;
};

export type LoanRequirementFilters = {
  q?: string;
  from?: string;
  to?: string;
  bank?: string;
};

function loanRequirementQuery(filters: LoanRequirementFilters): string {
  const url = new URL(`${API_BASE}/api/admin/loan-requirements`);
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.from) url.searchParams.set("from", filters.from);
  if (filters.to) url.searchParams.set("to", filters.to);
  if (filters.bank) url.searchParams.set("bank", filters.bank);
  return url.toString();
}

export function fetchAdminLoanPlans(
  filters: { q?: string; active?: boolean } = {},
): Promise<AdminLoanPlan[]> {
  const url = new URL(`${API_BASE}/api/admin/loan-plans`);
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.active !== undefined) {
    url.searchParams.set("active", String(filters.active));
  }
  return jsonRequest<AdminLoanPlan[]>(url.toString(), "GET");
}

export function createAdminLoanPlan(
  input: AdminLoanPlanInput,
): Promise<AdminLoanPlan> {
  return jsonRequest<AdminLoanPlan>("/api/admin/loan-plans", "POST", input);
}

export function updateAdminLoanPlan(
  id: string,
  patch: Partial<AdminLoanPlanInput>,
): Promise<AdminLoanPlan> {
  return jsonRequest<AdminLoanPlan>(
    `/api/admin/loan-plans/${id}`,
    "PATCH",
    patch,
  );
}

export function deleteAdminLoanPlan(id: string): Promise<void> {
  return jsonRequest<void>(`/api/admin/loan-plans/${id}`, "DELETE");
}

export function convertAdminLoanRequirement(
  id: string,
): Promise<AdminServiceRequest> {
  return jsonRequest<AdminServiceRequest>(
    `/api/admin/loan-requirements/${id}/convert`,
    "POST",
  );
}

export function fetchAdminLoanRequirements(
  filters: LoanRequirementFilters = {},
): Promise<AdminLoanRequirement[]> {
  return jsonRequest<AdminLoanRequirement[]>(
    loanRequirementQuery(filters),
    "GET",
  );
}

export function fetchLoanRequirementBanks(): Promise<string[]> {
  return jsonRequest<string[]>(
    "/api/admin/loan-requirements/banks",
    "GET",
  );
}

export async function downloadLoanRequirementsCsv(
  filters: LoanRequirementFilters = {},
): Promise<void> {
  const exportUrl = new URL(loanRequirementQuery(filters));
  exportUrl.pathname = "/api/admin/loan-requirements/export";
  exportUrl.searchParams.set("format", "csv");

  const response = await apiFetch(exportUrl.toString(), { method: "GET" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(
      payload?.message || `Export failed (${response.status}).`,
    );
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const matched = /filename="?([^";]+)"?/i.exec(disposition);
  const fileName =
    matched?.[1] ??
    `loan-requirements-${new Date().toISOString().slice(0, 10)}.csv`;

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
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
  loanBank?: string | null;
  loanType?: "Home" | "Personal" | "Business" | "Mortgage" | null;
  requirementSource?: "salaried" | "business" | null;
  requirementMonthlyIncome?: number | null;
  requirementMonthlyEmis?: number | null;
  createdAt: string;
};

export type AdminLoanConsultationPage = {
  items: AdminServiceRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function fetchAdminLoanConsultations(
  filters: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
  } = {},
): Promise<AdminLoanConsultationPage> {
  const url = new URL(`${API_BASE}/api/admin/loan-consultations`);
  url.searchParams.set("page", String(filters.page ?? 1));
  url.searchParams.set("pageSize", String(filters.pageSize ?? 10));
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.status) url.searchParams.set("status", filters.status);
  return jsonRequest<AdminLoanConsultationPage>(url.toString(), "GET");
}

export type ServiceRequestStats = {
  total: number;
  new: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  categories: Array<{
    category: string;
    total: number;
    new: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }>;
};

export function fetchServiceRequestStats(): Promise<ServiceRequestStats> {
  return jsonRequest<ServiceRequestStats>(
    "/api/admin/requests/stats",
    "GET",
  );
}

export type AdminServiceRequestPage = {
  items: AdminServiceRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function fetchAdminServiceRequests(
  filters: {
    q?: string;
    category?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    focus?: string;
  } = {},
): Promise<AdminServiceRequestPage> {
  const url = new URL(`${API_BASE}/api/admin/requests`);
  if (filters.q?.trim()) url.searchParams.set("q", filters.q.trim());
  if (filters.category) url.searchParams.set("category", filters.category);
  if (filters.status) url.searchParams.set("status", filters.status);
  url.searchParams.set("page", String(filters.page ?? 1));
  url.searchParams.set("pageSize", String(filters.pageSize ?? 10));
  if (filters.focus) url.searchParams.set("focus", filters.focus);
  return jsonRequest<AdminServiceRequestPage>(url.toString(), "GET");
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

export function staffUpdateProfile(input: {
  name?: string;
  email?: string;
}): Promise<StaffUser> {
  return jsonRequest<StaffUser>("/api/staff/me", "PATCH", input);
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

export function fetchStaffAvatar(): Promise<{ url: string | null }> {
  return jsonRequest<{ url: string | null }>("/api/admin/me/avatar", "GET");
}

export async function uploadStaffAvatar(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const response = await apiFetch(`${API_BASE}/api/admin/me/avatar`, {
    method: "POST",
    body: form,
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: { url: string } }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not upload the photo (${response.status}).`,
    );
  }

  return payload.data;
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

/* ------------------------------ Daily tasks ----------------------------- */

export type DailyTaskStatus =
  | "connected_interested"
  | "connected_not_interested"
  | "not_reachable"
  | "call_back";

export type DailyTaskDisplayStatus =
  | DailyTaskStatus
  | "pending"
  | "not_contacted";

export type AdminDailyTask = {
  id: string;
  taskDate: string;
  sortOrder: number;
  mobilePrimary: string;
  mobileSecondary: string;
  customerName: string;
  email: string;
  status: DailyTaskStatus | null;
  displayStatus: DailyTaskDisplayStatus;
  interested: boolean | null;
  reasonNotInterested: string;
  nextStep: string;
  comments: string;
  calledAt: string | null;
  durationMinutes: number | null;
  assignedTo: string;
  assignedByName: string | null;
  assignedByCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminDailyTaskAssignee = {
  id: string;
  name: string;
  staffCode: string;
  role: "admin" | "partner";
};

export type AdminDailyTaskStats = {
  total: number;
  pending: number;
  notContacted: number;
  connectedInterested: number;
  connectedNotInterested: number;
  notReachable: number;
  callBack: number;
};

export type AdminDailyTaskFilters = {
  date?: string;
  status?: string;
  assignedTo?: string;
};

export type AdminDailyTaskCreateInput = {
  taskDate: string;
  sortOrder?: number;
  mobilePrimary: string;
  mobileSecondary?: string;
  customerName?: string;
  email?: string;
  assignedTo?: string;
};

export type AdminDailyTaskPatch = {
  taskDate?: string;
  sortOrder?: number;
  mobilePrimary?: string;
  mobileSecondary?: string;
  customerName?: string;
  email?: string;
  assignedTo?: string;
  status?: DailyTaskStatus | null;
  interested?: boolean | null;
  reasonNotInterested?: string;
  nextStep?: string;
  comments?: string;
  calledAt?: string | null;
  durationMinutes?: number | null;
};

export function fetchDailyTasks(
  filters: AdminDailyTaskFilters = {},
): Promise<AdminDailyTask[]> {
  const params = new URLSearchParams();
  if (filters.date) params.set("date", filters.date);
  if (filters.status) params.set("status", filters.status);
  if (filters.assignedTo) params.set("assignedTo", filters.assignedTo);
  const query = params.toString();
  return jsonRequest<AdminDailyTask[]>(
    `/api/admin/daily-tasks${query ? `?${query}` : ""}`,
    "GET",
  );
}

export function fetchDailyTaskStats(): Promise<AdminDailyTaskStats> {
  return jsonRequest<AdminDailyTaskStats>("/api/admin/daily-tasks/stats", "GET");
}

export function fetchDailyTasksExport(
  from: string,
  to: string,
): Promise<AdminDailyTask[]> {
  const params = new URLSearchParams({ from, to });
  return jsonRequest<AdminDailyTask[]>(
    `/api/admin/daily-tasks/export?${params.toString()}`,
    "GET",
  );
}

export function fetchDailyTaskAssignees(): Promise<AdminDailyTaskAssignee[]> {
  return jsonRequest<AdminDailyTaskAssignee[]>(
    "/api/admin/daily-tasks/agents",
    "GET",
  );
}

export function createDailyTask(
  input: AdminDailyTaskCreateInput,
): Promise<AdminDailyTask> {
  return jsonRequest<AdminDailyTask>("/api/admin/daily-tasks", "POST", input);
}

export function updateDailyTask(
  id: string,
  patch: AdminDailyTaskPatch,
): Promise<AdminDailyTask> {
  return jsonRequest<AdminDailyTask>(
    `/api/admin/daily-tasks/${id}`,
    "PATCH",
    patch,
  );
}

export function deleteDailyTask(id: string): Promise<void> {
  return jsonRequest<void>(`/api/admin/daily-tasks/${id}`, "DELETE");
}
export async function uploadAdminPropertyPhotos(
  id: string,
  files: File[],
): Promise<AdminProperty> {
  const form = new FormData();
  for (const file of files) {
    form.append("photos", file);
  }

  const response = await apiFetch(
    `${API_BASE}/api/admin/properties/${id}/photos`,
    {
      method: "POST",
      body: form,
    },
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminProperty }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not upload photos (${response.status}).`,
    );
  }

  return payload.data;
}
export type AdminStorageBucket = "public" | "private";

export type AdminStorageObject = {
  key: string;
  url: string;
  size: number;
  lastModified: string | null;
  etag: string | null;
};

export type AdminStorageList = {
  bucket: AdminStorageBucket;
  configured: boolean;
  objects: AdminStorageObject[];
  truncated: boolean;
  cursor: string | null;
};

export async function fetchAdminStorageFiles(
  bucket: AdminStorageBucket,
  options: { prefix?: string; cursor?: string | null; limit?: number } = {},
): Promise<AdminStorageList> {
  const url = new URL(`${API_BASE}/api/admin/storage/files`);
  url.searchParams.set("bucket", bucket);
  if (options.prefix) url.searchParams.set("prefix", options.prefix);
  if (options.cursor) url.searchParams.set("cursor", options.cursor);
  url.searchParams.set("limit", String(options.limit ?? 10));

  const response = await apiFetch(url.toString());
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminStorageList }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not load storage (${response.status}).`,
    );
  }

  return payload.data;
}

export async function uploadAdminStorageFiles(
  bucket: AdminStorageBucket,
  files: File[],
): Promise<void> {
  const form = new FormData();
  for (const file of files) {
    form.append("files", file);
  }

  const response = await apiFetch(
    `${API_BASE}/api/admin/storage/upload?bucket=${bucket}`,
    { method: "POST", body: form },
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Upload failed (${response.status}).`,
    );
  }
}

export async function deleteAdminStorageFile(
  bucket: AdminStorageBucket,
  key: string,
): Promise<void> {
  const url = new URL(`${API_BASE}/api/admin/storage/files`);
  url.searchParams.set("bucket", bucket);
  url.searchParams.set("key", key);

  const response = await apiFetch(url.toString(), { method: "DELETE" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(
      payload?.message || `Delete failed (${response.status}).`,
    );
  }
}

export async function getAdminStorageSignedUrl(
  bucket: AdminStorageBucket,
  key: string,
): Promise<string> {
  const url = new URL(`${API_BASE}/api/admin/storage/signed-url`);
  url.searchParams.set("bucket", bucket);
  url.searchParams.set("key", key);

  const response = await apiFetch(url.toString());
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: { url?: string } }
    | null;

  if (!response.ok || !payload?.success || !payload.data?.url) {
    throw new Error(
      payload?.message || `Could not sign file URL (${response.status}).`,
    );
  }

  return payload.data.url;
}
export type AdminStorageUsage = {
  public: { count: number; size: number };
  private: { count: number; size: number };
};

export async function fetchAdminStorageUsage(): Promise<AdminStorageUsage> {
  const response = await apiFetch(`${API_BASE}/api/admin/storage/usage`);
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: AdminStorageUsage }
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.message || `Could not load storage usage (${response.status}).`,
    );
  }

  return payload.data;
}