import type {
  ClientRecord,
  Enquiry,
  EnquiryStatus,
  ServiceCategoryId,
  Staff,
} from "@kaundinya/config";
import type { AdminRequest } from "./mockData";
import type { PipelineRecord } from "./pipelineData";
import {
  ADMIN_SERVICES,
  type AdminJob,
  type AdminProperty,
  type AdminPropertyStatus,
  type AdminRenewal,
  type AdminService,
  type AdminSiteVisit,
  type AdminValuation,
  type AdminValuationStatus,
  type AdminVisitStatus,
} from "./moduleAdminData";
import type { AdminSession } from "./session";
import { ApiError, api } from "./api";

/**
 * Admin data layer.
 *
 * Talks to the live Hono API. Exported names/signatures match the previous
 * mock layer so screens stay untouched. Services have no backend endpoint yet,
 * so they remain derived from the static service catalog.
 */

const NOT_FOUND = 404;

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === NOT_FOUND;
}

/* -------------------------------- Mapping -------------------------------- */

interface ApiProperty {
  id: string;
  title: string;
  listingType: "rent" | "sale";
  location: string;
  pincode: string;
  price: number;
  status: AdminPropertyStatus;
  createdAt: string;
}

function toAdminProperty(raw: ApiProperty): AdminProperty {
  return {
    id: raw.id,
    title: raw.title,
    ownerName: "—",
    location: raw.location,
    pincode: raw.pincode,
    listingType: raw.listingType === "rent" ? "Rent" : "Sale",
    price: raw.price,
    status: raw.status,
    submittedAt: raw.createdAt,
  };
}

interface ApiValuation {
  id: string;
  ownerName: string;
  mobile: string;
  propertyType: string;
  location: string;
  expectedPrice?: number;
  status: AdminValuationStatus;
  createdAt: string;
}

function toAdminValuation(raw: ApiValuation): AdminValuation {
  return { ...raw, expectedPrice: raw.expectedPrice ?? 0 };
}

interface ApiSiteVisit {
  id: string;
  propertyTitle: string;
  clientName: string;
  mobile: string;
  date: string;
  slot: string;
  status: AdminVisitStatus;
  adviserId?: string | null;
}

function toAdminSiteVisit(raw: ApiSiteVisit): AdminSiteVisit {
  return { ...raw, adviserId: raw.adviserId ?? null };
}

interface ApiJob {
  id: string;
  serviceName: string;
  clientName?: string;
  mobile: string;
  address?: string;
  status: string;
  technicianId?: string | null;
  scheduledAt?: string | null;
  amount?: number;
  rating?: number | null;
}

function toAdminJob(raw: ApiJob): AdminJob {
  return {
    id: raw.id,
    serviceName: raw.serviceName,
    clientName: raw.clientName || "Client",
    mobile: raw.mobile,
    address: raw.address || "—",
    status: raw.status,
    technicianId: raw.technicianId ?? null,
    scheduledAt: raw.scheduledAt ?? null,
    amount: raw.amount ?? 0,
    rating: raw.rating ?? null,
  };
}

interface ApiPipeline {
  id: string;
  module: string;
  title: string;
  clientName: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  value?: number | string;
}

function toPipelineRecord(raw: ApiPipeline): PipelineRecord {
  const value =
    typeof raw.value === "number"
      ? `₹${raw.value.toLocaleString("en-IN")}`
      : raw.value;

  return {
    id: raw.id,
    module: (raw.module as ServiceCategoryId) ?? "loans",
    title: raw.title,
    clientName: raw.clientName,
    status: raw.status,
    assignedTo: raw.assignedTo,
    createdAt: raw.createdAt,
    value,
  };
}

/* --------------------------------- Auth ---------------------------------- */

export function adminLogin(email: string, password: string): Promise<AdminSession> {
  return api.post<AdminSession>("/admin/auth/login", { email, password });
}

/* ------------------------------- Enquiries ------------------------------- */

export function fetchEnquiries(): Promise<Enquiry[]> {
  return api.get<Enquiry[]>("/admin/enquiries");
}

export async function fetchEnquiry(id: string): Promise<Enquiry | null> {
  try {
    return await api.get<Enquiry>(`/admin/enquiries/${id}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<Enquiry | null> {
  return api.patch<Enquiry>(`/admin/enquiries/${id}`, { status });
}

export function assignEnquiry(
  id: string,
  staffId: string | null
): Promise<Enquiry | null> {
  return api.patch<Enquiry>(`/admin/enquiries/${id}`, { assignedTo: staffId });
}

export function addEnquiryNote(
  id: string,
  _author: string,
  text: string
): Promise<Enquiry | null> {
  // The API derives the note author from the signed-in staff token.
  return api.post<Enquiry>(`/admin/enquiries/${id}/notes`, { text });
}

/* -------------------------------- Clients -------------------------------- */

export function fetchClients(): Promise<ClientRecord[]> {
  return api.get<ClientRecord[]>("/admin/clients");
}

export function fetchRequests(): Promise<AdminRequest[]> {
  return api.get<AdminRequest[]>("/admin/requests");
}

/* -------------------------------- Services ------------------------------- */

let servicesStore: AdminService[] = [...ADMIN_SERVICES];

export function fetchAdminServices(): Promise<AdminService[]> {
  return Promise.resolve([...servicesStore]);
}

export function updateServiceActive(
  id: string,
  active: boolean
): Promise<AdminService | null> {
  servicesStore = servicesStore.map((service) =>
    service.id === id ? { ...service, active } : service
  );
  return Promise.resolve(servicesStore.find((service) => service.id === id) ?? null);
}

export function updateServicePricing(
  id: string,
  pricingLabel: string
): Promise<AdminService | null> {
  servicesStore = servicesStore.map((service) =>
    service.id === id ? { ...service, pricingLabel } : service
  );
  return Promise.resolve(servicesStore.find((service) => service.id === id) ?? null);
}

/* --------------------------------- Staff --------------------------------- */

export function fetchStaff(): Promise<Staff[]> {
  return api.get<Staff[]>("/admin/staff");
}

export interface StaffInput {
  name: string;
  email: string;
  role: Staff["role"];
}

export function createStaff(input: StaffInput): Promise<Staff> {
  return api.post<Staff>("/admin/staff", input);
}

export function updateStaff(
  id: string,
  input: Partial<Pick<Staff, "name" | "email" | "role" | "active">>
): Promise<Staff | null> {
  return api.patch<Staff>(`/admin/staff/${id}`, input);
}

/* -------------------------------- Pipeline ------------------------------- */

export async function fetchPipeline(
  module: ServiceCategoryId
): Promise<PipelineRecord[]> {
  const records = await api.get<ApiPipeline[]>("/admin/pipeline", {
    query: { module },
  });
  return records.map(toPipelineRecord);
}

export async function updatePipelineStatus(
  id: string,
  status: string
): Promise<PipelineRecord | null> {
  const updated = await api.patch<ApiPipeline>(`/admin/pipeline/${id}`, { status });
  return toPipelineRecord(updated);
}

/* ------------------------------- Real estate ------------------------------ */

export async function fetchAdminProperties(): Promise<AdminProperty[]> {
  const properties = await api.get<ApiProperty[]>("/admin/properties");
  return properties.map(toAdminProperty);
}

export async function updatePropertyStatus(
  id: string,
  status: AdminPropertyStatus
): Promise<AdminProperty | null> {
  const updated = await api.patch<ApiProperty>(`/admin/properties/${id}`, { status });
  return toAdminProperty(updated);
}

export async function fetchAdminValuations(): Promise<AdminValuation[]> {
  const valuations = await api.get<ApiValuation[]>("/admin/valuations");
  return valuations.map(toAdminValuation);
}

export async function updateValuationStatus(
  id: string,
  status: AdminValuationStatus
): Promise<AdminValuation | null> {
  const updated = await api.patch<ApiValuation>(`/admin/valuations/${id}`, { status });
  return toAdminValuation(updated);
}

export async function fetchAdminSiteVisits(): Promise<AdminSiteVisit[]> {
  const visits = await api.get<ApiSiteVisit[]>("/admin/site-visits");
  return visits.map(toAdminSiteVisit);
}

export async function updateSiteVisitStatus(
  id: string,
  status: AdminVisitStatus
): Promise<AdminSiteVisit | null> {
  const updated = await api.patch<ApiSiteVisit>(`/admin/site-visits/${id}`, { status });
  return toAdminSiteVisit(updated);
}

export async function assignSiteVisitAdviser(
  id: string,
  adviserId: string | null
): Promise<AdminSiteVisit | null> {
  const updated = await api.patch<ApiSiteVisit>(`/admin/site-visits/${id}`, {
    adviserId,
  });
  return toAdminSiteVisit(updated);
}

/* ----------------------------- Home services ----------------------------- */

export async function fetchAdminJobs(): Promise<AdminJob[]> {
  const jobs = await api.get<ApiJob[]>("/admin/jobs");
  return jobs.map(toAdminJob);
}

export async function assignJobTechnician(
  id: string,
  technicianId: string | null
): Promise<AdminJob | null> {
  const updated = await api.patch<ApiJob>(`/admin/jobs/${id}`, { technicianId });
  return toAdminJob(updated);
}

export async function updateJobStatus(
  id: string,
  status: string
): Promise<AdminJob | null> {
  const updated = await api.patch<ApiJob>(`/admin/jobs/${id}`, { status });
  return toAdminJob(updated);
}

/* ------------------------------- Renewals -------------------------------- */

interface ApiRenewal {
  id: string;
  clientName: string;
  provider: string;
  policyType: string;
  policyNumber: string;
  renewalDate: string;
  premium: number;
  reminderSent: boolean;
}

export function fetchAdminRenewals(): Promise<AdminRenewal[]> {
  return api.get<ApiRenewal[]>("/admin/renewals");
}

export async function sendRenewalReminder(
  id: string
): Promise<AdminRenewal | null> {
  await api.post<{ id: string; reminderSent: boolean }>(
    `/admin/renewals/${id}/remind`
  );
  const renewals = await fetchAdminRenewals();
  return renewals.find((renewal) => renewal.id === id) ?? null;
}

/* --------------------------------- Stats --------------------------------- */

export interface AdminStats {
  totalEnquiries: number;
  newEnquiries: number;
  converted: number;
  openRequests: number;
  completedRequests: number;
  byService: { name: string; count: number }[];
  byStatus: { status: EnquiryStatus; count: number }[];
}

export function fetchStats(): Promise<AdminStats> {
  return api.get<AdminStats>("/admin/stats");
}
