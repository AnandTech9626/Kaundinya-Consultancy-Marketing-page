import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@kaundinya/config";
import { api } from "./api";
import { clearSession, readSession, writeSession, type Session } from "./session";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (session: Session) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

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
    const token = session?.token;
    clearSession();
    setSession(null);
    if (token) {
      void api.post("/auth/logout").catch(() => undefined);
    }
  }, [session?.token]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      login,
      updateUser,
      logout,
    }),
    [session, login, updateUser, logout]
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
