import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Staff } from "@kaundinya/config";
import { api } from "./api";
import {
  clearAdminSession,
  readAdminSession,
  writeAdminSession,
  type AdminSession,
} from "./session";

interface AuthContextValue {
  staff: Staff | null;
  token: string | null;
  login: (session: AdminSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => readAdminSession());

  const login = useCallback((next: AdminSession) => {
    writeAdminSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    const token = session?.token;
    clearAdminSession();
    setSession(null);
    if (token) {
      void api.post("/auth/logout").catch(() => undefined);
    }
  }, [session?.token]);

  const value = useMemo(
    () => ({
      staff: session?.staff ?? null,
      token: session?.token ?? null,
      login,
      logout,
    }),
    [session, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
