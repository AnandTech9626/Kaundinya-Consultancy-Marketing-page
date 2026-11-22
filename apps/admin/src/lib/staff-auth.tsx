import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { staffLogout, staffMe } from "./api";
import {
  clearStaffSession,
  readStaffSession,
  writeStaffSession,
  type StaffSession,
  type StaffUser,
} from "./staff-session";

interface StaffAuthContextValue {
  staff: StaffUser | null;
  token: string | null;
  ready: boolean;
  login: (session: StaffSession) => void;
  updateStaff: (staff: StaffUser) => void;
  logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(() =>
    readStaffSession(),
  );
  const [ready, setReady] = useState(false);

  const login = useCallback((next: StaffSession) => {
    writeStaffSession(next);
    setSession(next);
  }, []);

  const updateStaff = useCallback((staff: StaffUser) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, staff };
      writeStaffSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    if (session?.token) {
      void staffLogout().catch(() => undefined);
    }
    clearStaffSession();
    setSession(null);
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token) {
      setReady(true);
      return;
    }

    let cancelled = false;
    staffMe()
      .then((me) => {
        if (!cancelled) updateStaff(me);
      })
      .catch(() => {
        // Keep the cached staff session on transient errors; never block the
        // UI on the loader. If the token is invalid, API calls will 401.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      staff: session?.staff ?? null,
      token: session?.token ?? null,
      ready,
      login,
      updateStaff,
      logout,
    }),
    [session, ready, login, updateStaff, logout],
  );

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }
  return ctx;
}
