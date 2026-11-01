import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@kaundinya/config";
import { api, ApiError } from "./api";
import {
  clearSession,
  readSession,
  writeRememberedMobile,
  writeSession,
  type Session,
} from "./session";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (session: Session) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [ready, setReady] = useState(false);

  const login = useCallback((next: Session) => {
    writeSession(next);
    setSession(next);
  }, []);

  const updateUser = useCallback((user: User) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user };
      writeSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    if (session?.token) {
      void api.post("/auth/logout").catch(() => undefined);
    }
    clearSession();
    setSession(null);
  }, [session?.token]);

  useEffect(() => {
    const token = session?.token;
    if (!token) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await api.get<User>("/me");
        if (cancelled) return;
        updateUser(me);
        writeRememberedMobile(me.mobile);
      } catch (err) {
        if (cancelled) return;
        // Network hiccups should not hold the app on the loader; keep the
        // cached session. A true 401 is handled by the API client.
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          setSession(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      ready,
      login,
      updateUser,
      logout,
    }),
    [session, ready, login, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
