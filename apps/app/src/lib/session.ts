import type { User } from "@kaundinya/config";

export interface Session {
  token: string;
  user: User;
}

const STORAGE_KEY = "kaundinya.session";
const LEGACY_USER_KEY = "kaundinya.user";
const REMEMBERED_MOBILE_KEY = "kaundinya.lastMobile";
const REMEMBERED_EMAIL_KEY = "kaundinya.lastEmail";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function localStore(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function readSession(): Session | null {
  const store = storage();
  if (!store) return null;
  try {
    let raw = store.getItem(STORAGE_KEY);

    // Move any previous long-lived session into this tab only, so the next
    // fresh browser session requires the PIN again.
    if (!raw) {
      const legacy = localStore()?.getItem(STORAGE_KEY);
      if (legacy) {
        store.setItem(STORAGE_KEY, legacy);
        localStore()?.removeItem(STORAGE_KEY);
        raw = legacy;
      }
    }

    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session> | null;
    if (!parsed?.token || !parsed.user?.mobile) return null;
    return { token: parsed.token, user: parsed.user as User };
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  const store = storage();
  store?.setItem(STORAGE_KEY, JSON.stringify(session));
  localStore()?.removeItem(LEGACY_USER_KEY);
  localStore()?.removeItem(STORAGE_KEY);
  writeRememberedMobile(session.user.mobile);
  writeRememberedEmail(session.user.email);
}

export function clearSession(): void {
  const store = storage();
  store?.removeItem(STORAGE_KEY);
  localStore()?.removeItem(LEGACY_USER_KEY);
  localStore()?.removeItem(STORAGE_KEY);
}

export function readToken(): string | null {
  return readSession()?.token ?? null;
}

export function readRememberedMobile(): string | null {
  const store = localStore();
  if (!store) return null;
  const value = store.getItem(REMEMBERED_MOBILE_KEY);
  return value && /^[6-9]\d{9}$/.test(value) ? value : null;
}

export function writeRememberedMobile(mobile: string): void {
  const clean = mobile.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(clean)) return;
  localStore()?.setItem(REMEMBERED_MOBILE_KEY, clean);
}

export function readRememberedEmail(): string | null {
  const store = localStore();
  if (!store) return null;
  const value = store.getItem(REMEMBERED_EMAIL_KEY);
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

export function writeRememberedEmail(email: string): void {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return;
  localStore()?.setItem(REMEMBERED_EMAIL_KEY, clean);
}
