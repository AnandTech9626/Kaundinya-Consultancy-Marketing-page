import type { AppNotification, ServiceRequest, User } from "@kaundinya/config";
import { MOCK_NOTIFICATIONS, MOCK_REQUESTS } from "./mockData";

/**
 * Mock API layer.
 *
 * Every function here mirrors the shape the real Hono API will expose (see
 * docs/api-contract.md). Pages consume these, so when the backend is ready we
 * only swap the internals of this file for `fetch(...)` calls — no page edits.
 */

const LATENCY_MS = 650;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Session-scoped in-memory stores so newly created items appear immediately.
let requestsStore: ServiceRequest[] = [...MOCK_REQUESTS];
let notificationsStore: AppNotification[] = [...MOCK_NOTIFICATIONS];

export interface CreateRequestInput {
  serviceCategory: string;
  specificService: string;
  comments?: string;
}

export function fetchRequests(): Promise<ServiceRequest[]> {
  return delay([...requestsStore]);
}

export function fetchRequest(id: string): Promise<ServiceRequest | null> {
  return delay(requestsStore.find((r) => r.id === id) ?? null);
}

export function createRequest(input: CreateRequestInput): Promise<ServiceRequest> {
  const created: ServiceRequest = {
    id: `req-${Date.now()}`,
    serviceCategory: input.serviceCategory,
    specificService: input.specificService,
    status: "new",
    createdAt: new Date().toISOString().slice(0, 10),
    comments: input.comments?.trim() ?? "",
  };
  requestsStore = [created, ...requestsStore];
  return delay(created);
}

export function fetchNotifications(): Promise<AppNotification[]> {
  return delay([...notificationsStore]);
}

export function markAllNotificationsRead(): Promise<AppNotification[]> {
  notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }));
  return delay([...notificationsStore]);
}

export interface OtpVerifyResult {
  token: string;
  user: User;
}

/** POST /api/otp/send — currently mocked. */
export function otpSend(_mobile: string): Promise<{ expiresInSeconds: number }> {
  return delay({ expiresInSeconds: 60 });
}

/** POST /api/otp/verify — currently mocked (accepts any 6-digit code). */
export function otpVerify(mobile: string, otp: string): Promise<OtpVerifyResult> {
  if (!/^\d{6}$/.test(otp)) {
    return Promise.reject(new Error("Invalid OTP"));
  }
  return delay({
    token: `mock-${mobile}`,
    user: { name: "Kaundinya Client", email: "", mobile },
  });
}
