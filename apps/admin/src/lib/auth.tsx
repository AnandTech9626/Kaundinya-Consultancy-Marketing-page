import { createContext, useContext, useState, type ReactNode } from "react";
import type { Staff } from "@kaundinya/config";

const STORAGE_KEY = "kaundinya.admin";

interface AuthContextValue {
  staff: Staff | null;
  login: (staff: Staff) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Staff) : null;
    } catch {
      return null;
    }
  });

  const login = (next: Staff) => {
    setStaff(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ staff, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
