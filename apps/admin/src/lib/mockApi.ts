import type {
  ClientRecord,
  Enquiry,
  EnquiryStatus,
  Staff,
} from "@kaundinya/config";
import {
  ADMIN_REQUESTS,
  CLIENTS,
  ENQUIRIES,
  STAFF,
  type AdminRequest,
} from "./mockData";

const LATENCY_MS = 550;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let enquiriesStore: Enquiry[] = [...ENQUIRIES];
let clientsStore: ClientRecord[] = [...CLIENTS];
let requestsStore: AdminRequest[] = [...ADMIN_REQUESTS];
const staffStore: Staff[] = [...STAFF];

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

export function fetchStaff(): Promise<Staff[]> {
  return delay([...staffStore]);
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
