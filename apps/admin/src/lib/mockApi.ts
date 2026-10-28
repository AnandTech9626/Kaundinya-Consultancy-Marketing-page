import type {
  ClientRecord,
  Enquiry,
  EnquiryStatus,
  ServiceCategoryId,
  Staff,
} from "@kaundinya/config";
import {
  ADMIN_REQUESTS,
  CLIENTS,
  ENQUIRIES,
  STAFF,
  type AdminRequest,
} from "./mockData";
import { PIPELINE_RECORDS, type PipelineRecord } from "./pipelineData";
import {
  ADMIN_JOBS,
  ADMIN_PROPERTIES,
  ADMIN_RENEWALS,
  ADMIN_SERVICES,
  ADMIN_SITE_VISITS,
  ADMIN_VALUATIONS,
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

const LATENCY_MS = 550;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let enquiriesStore: Enquiry[] = [...ENQUIRIES];
let clientsStore: ClientRecord[] = [...CLIENTS];
let requestsStore: AdminRequest[] = [...ADMIN_REQUESTS];
let pipelineStore: PipelineRecord[] = [...PIPELINE_RECORDS];
let propertiesStore: AdminProperty[] = [...ADMIN_PROPERTIES];
let valuationsStore: AdminValuation[] = [...ADMIN_VALUATIONS];
let siteVisitsStore: AdminSiteVisit[] = [...ADMIN_SITE_VISITS];
let jobsStore: AdminJob[] = [...ADMIN_JOBS];
let renewalsStore: AdminRenewal[] = [...ADMIN_RENEWALS];
let servicesStore: AdminService[] = [...ADMIN_SERVICES];
let staffStore: Staff[] = [...STAFF];

export function fetchEnquiries(): Promise<Enquiry[]> {
  return delay([...enquiriesStore]);
}

export function fetchEnquiry(id: string): Promise<Enquiry | null> {
  return delay(enquiriesStore.find((e) => e.id === id) ?? null);
}

export function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<Enquiry | null> {
  enquiriesStore = enquiriesStore.map((e) => (e.id === id ? { ...e, status } : e));
  return delay(enquiriesStore.find((e) => e.id === id) ?? null);
}

export function assignEnquiry(
  id: string,
  staffId: string | null
): Promise<Enquiry | null> {
  enquiriesStore = enquiriesStore.map((e) =>
    e.id === id ? { ...e, assignedTo: staffId } : e
  );
  return delay(enquiriesStore.find((e) => e.id === id) ?? null);
}

export function addEnquiryNote(
  id: string,
  author: string,
  text: string
): Promise<Enquiry | null> {
  enquiriesStore = enquiriesStore.map((e) =>
    e.id === id
      ? {
          ...e,
          notes: [
            ...e.notes,
            {
              id: `note-${Date.now()}`,
              author,
              text,
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ],
        }
      : e
  );
  return delay(enquiriesStore.find((e) => e.id === id) ?? null);
}

export function fetchClients(): Promise<ClientRecord[]> {
  return delay([...clientsStore]);
}

export function fetchRequests(): Promise<AdminRequest[]> {
  return delay([...requestsStore]);
}

export function fetchAdminServices(): Promise<AdminService[]> {
  return delay([...servicesStore]);
}

export function updateServiceActive(
  id: string,
  active: boolean
): Promise<AdminService | null> {
  servicesStore = servicesStore.map((service) =>
    service.id === id ? { ...service, active } : service
  );
  return delay(servicesStore.find((service) => service.id === id) ?? null);
}

export function updateServicePricing(
  id: string,
  pricingLabel: string
): Promise<AdminService | null> {
  servicesStore = servicesStore.map((service) =>
    service.id === id ? { ...service, pricingLabel } : service
  );
  return delay(servicesStore.find((service) => service.id === id) ?? null);
}

export function fetchStaff(): Promise<Staff[]> {
  return delay([...staffStore]);
}

export interface StaffInput {
  name: string;
  email: string;
  role: Staff["role"];
}

export function createStaff(input: StaffInput): Promise<Staff> {
  const created: Staff = {
    id: `st-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
    active: true,
  };
  staffStore = [...staffStore, created];
  return delay(created);
}

export function updateStaff(
  id: string,
  input: Partial<Pick<Staff, "name" | "email" | "role" | "active">>
): Promise<Staff | null> {
  staffStore = staffStore.map((member) =>
    member.id === id ? { ...member, ...input } : member
  );
  return delay(staffStore.find((member) => member.id === id) ?? null);
}

export function fetchPipeline(
  module: ServiceCategoryId
): Promise<PipelineRecord[]> {
  return delay(pipelineStore.filter((record) => record.module === module));
}

export function updatePipelineStatus(
  id: string,
  status: string
): Promise<PipelineRecord | null> {
  pipelineStore = pipelineStore.map((record) =>
    record.id === id ? { ...record, status } : record
  );
  return delay(pipelineStore.find((record) => record.id === id) ?? null);
}

export function fetchAdminProperties(): Promise<AdminProperty[]> {
  return delay([...propertiesStore]);
}

export function updatePropertyStatus(
  id: string,
  status: AdminPropertyStatus
): Promise<AdminProperty | null> {
  propertiesStore = propertiesStore.map((property) =>
    property.id === id ? { ...property, status } : property
  );
  return delay(propertiesStore.find((property) => property.id === id) ?? null);
}

export function fetchAdminValuations(): Promise<AdminValuation[]> {
  return delay([...valuationsStore]);
}

export function updateValuationStatus(
  id: string,
  status: AdminValuationStatus
): Promise<AdminValuation | null> {
  valuationsStore = valuationsStore.map((valuation) =>
    valuation.id === id ? { ...valuation, status } : valuation
  );
  return delay(valuationsStore.find((valuation) => valuation.id === id) ?? null);
}

export function fetchAdminSiteVisits(): Promise<AdminSiteVisit[]> {
  return delay([...siteVisitsStore]);
}

export function updateSiteVisitStatus(
  id: string,
  status: AdminVisitStatus
): Promise<AdminSiteVisit | null> {
  siteVisitsStore = siteVisitsStore.map((visit) =>
    visit.id === id ? { ...visit, status } : visit
  );
  return delay(siteVisitsStore.find((visit) => visit.id === id) ?? null);
}

export function assignSiteVisitAdviser(
  id: string,
  adviserId: string | null
): Promise<AdminSiteVisit | null> {
  siteVisitsStore = siteVisitsStore.map((visit) =>
    visit.id === id ? { ...visit, adviserId } : visit
  );
  return delay(siteVisitsStore.find((visit) => visit.id === id) ?? null);
}

export function fetchAdminJobs(): Promise<AdminJob[]> {
  return delay([...jobsStore]);
}

export function assignJobTechnician(
  id: string,
  technicianId: string | null
): Promise<AdminJob | null> {
  jobsStore = jobsStore.map((job) =>
    job.id === id ? { ...job, technicianId } : job
  );
  return delay(jobsStore.find((job) => job.id === id) ?? null);
}

export function updateJobStatus(
  id: string,
  status: string
): Promise<AdminJob | null> {
  jobsStore = jobsStore.map((job) =>
    job.id === id ? { ...job, status } : job
  );
  return delay(jobsStore.find((job) => job.id === id) ?? null);
}

export function fetchAdminRenewals(): Promise<AdminRenewal[]> {
  return delay([...renewalsStore]);
}

export function sendRenewalReminder(
  id: string
): Promise<AdminRenewal | null> {
  renewalsStore = renewalsStore.map((renewal) =>
    renewal.id === id ? { ...renewal, reminderSent: true } : renewal
  );
  return delay(renewalsStore.find((renewal) => renewal.id === id) ?? null);
}

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
  const byServiceMap = new Map<string, number>();
  enquiriesStore.forEach((e) =>
    byServiceMap.set(e.serviceCategory, (byServiceMap.get(e.serviceCategory) ?? 0) + 1)
  );

  const statuses: EnquiryStatus[] = ["new", "contacted", "qualified", "converted", "lost"];
  const stats: AdminStats = {
    totalEnquiries: enquiriesStore.length,
    newEnquiries: enquiriesStore.filter((e) => e.status === "new").length,
    converted: enquiriesStore.filter((e) => e.status === "converted").length,
    openRequests: requestsStore.filter(
      (r) => r.status === "new" || r.status === "in_progress"
    ).length,
    completedRequests: requestsStore.filter((r) => r.status === "completed").length,
    byService: Array.from(byServiceMap.entries()).map(([name, count]) => ({ name, count })),
    byStatus: statuses.map((status) => ({
      status,
      count: enquiriesStore.filter((e) => e.status === status).length,
    })),
  };
  return delay(stats);
}
