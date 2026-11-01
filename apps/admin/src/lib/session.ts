import type { Staff } from "@kaundinya/config";

export interface AdminSession {
  token: string;
  staff: Staff;
}

const STORAGE_KEY = "kaundinya.admin.session";
const LEGACY_STAFF_KEY = "kaundinya.admin";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function readAdminSession(): AdminSession | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession> | null;
    if (!parsed?.token || !parsed.staff?.email) return null;
    return { token: parsed.token, staff: parsed.staff };
  } catch {
    return null;
  }
}

export function writeAdminSession(session: AdminSession): void {
  const store = storage();
  if (!store) return;
  store.setItem(STORAGE_KEY, JSON.stringify(session));
  store.removeItem(LEGACY_STAFF_KEY);
}

export function clearAdminSession(): void {
  const store = storage();
  if (!store) return;
  store.removeItem(STORAGE_KEY);
  store.removeItem(LEGACY_STAFF_KEY);
}

export function readAdminToken(): string | null {
  return readAdminSession()?.token ?? null;
}
