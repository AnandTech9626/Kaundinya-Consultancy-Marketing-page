export type StaffRole = "admin" | "partner";

export interface StaffUser {
  id: string;
  staffCode: string;
  name: string;
  email: string;
  mobile: string;
  role: StaffRole;
  active: boolean;
  hasPin: boolean;
  profileComplete: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface StaffSession {
  token: string;
  staff: StaffUser;
}

const STORAGE_KEY = "kaundinya.staff.session";
const REMEMBERED_MOBILE_KEY = "kaundinya.staff.mobile";

function sessionStore(): Storage | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function localStore(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function readStaffSession(): StaffSession | null {
  const store = sessionStore();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StaffSession> | null;
    if (!parsed?.token || !parsed.staff?.mobile) return null;
    return { token: parsed.token, staff: parsed.staff as StaffUser };
  } catch {
    return null;
  }
}

export function writeStaffSession(session: StaffSession): void {
  sessionStore()?.setItem(STORAGE_KEY, JSON.stringify(session));
  writeRememberedStaffMobile(session.staff.mobile);
}

export function clearStaffSession(): void {
  sessionStore()?.removeItem(STORAGE_KEY);
}

export function readStaffToken(): string | null {
  return readStaffSession()?.token ?? null;
}

export function readRememberedStaffMobile(): string | null {
  const store = localStore();
  if (!store) return null;
  const value = store.getItem(REMEMBERED_MOBILE_KEY);
  return value && /^[6-9]\d{9}$/.test(value) ? value : null;
}

export function writeRememberedStaffMobile(mobile: string): void {
  const clean = mobile.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(clean)) return;
  localStore()?.setItem(REMEMBERED_MOBILE_KEY, clean);
}
