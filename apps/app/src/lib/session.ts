import type { User } from "@kaundinya/config";

export interface Session {
  token: string;
  user: User;
}

const STORAGE_KEY = "kaundinya.session";
const LEGACY_USER_KEY = "kaundinya.user";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function readSession(): Session | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session> | null;
    if (!parsed?.token || !parsed.user?.mobile) return null;
    return { token: parsed.token, user: parsed.user };
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  storage()?.setItem(STORAGE_KEY, JSON.stringify(session));
  storage()?.removeItem(LEGACY_USER_KEY);
}

export function clearSession(): void {
  const store = storage();
  if (!store) return;
  store.removeItem(STORAGE_KEY);
  store.removeItem(LEGACY_USER_KEY);
}

export function readToken(): string | null {
  return readSession()?.token ?? null;
}
