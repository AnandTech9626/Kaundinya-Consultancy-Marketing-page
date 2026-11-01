import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppNotification } from "@kaundinya/config";
import { apiBaseUrl } from "./api";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./mockApi";
import { readToken } from "./session";

export type NotificationToast = {
  key: string;
  notification: AppNotification;
};

type NotificationContextValue = {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  toasts: NotificationToast[];
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissToast: (key: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const FALLBACK_POLL_MS = 60000;
const TOAST_TTL_MS = 7000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const seen = useRef<Set<string> | null>(null);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const dismissToast = useCallback((key: string) => {
    setToasts((current) => current.filter((toast) => toast.key !== key));
  }, []);

  const showToasts = useCallback(
    (notifications: AppNotification[]) => {
      if (notifications.length === 0) return;
      const additions: NotificationToast[] = notifications
        .slice(0, 3)
        .map((notification) => ({
          key: `${notification.id}-${Date.now()}-${Math.random()}`,
          notification,
        }));

      setToasts((current) => [...additions, ...current].slice(0, 3));
      for (const toast of additions) {
        window.setTimeout(() => dismissToast(toast.key), TOAST_TTL_MS);
      }
    },
    [dismissToast],
  );

  const refresh = useCallback(async () => {
    try {
      const next = await fetchNotifications();
      setItems(next);
      setError(null);

      const seenIds = seen.current;
      if (!seenIds) {
        seen.current = new Set(next.map((item) => item.id));
        showToasts(next.filter((item) => !item.read).slice(0, 1));
        return;
      }

      const fresh = next.filter(
        (item) => !item.read && !seenIds.has(item.id),
      );
      for (const item of next) {
        seenIds.add(item.id);
      }
      showToasts(fresh);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, [showToasts]);

  // SSE stream: one snapshot on connect, then push-only updates.
  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;
    let retry: number | null = null;

    const handleBlock = (block: string) => {
      let event = "message";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) return;

      let parsed: { notifications?: AppNotification[]; notification?: AppNotification };
      try {
        parsed = JSON.parse(data);
      } catch {
        return;
      }

      if (event === "snapshot" && Array.isArray(parsed.notifications)) {
        setItems(parsed.notifications);
        const seenIds = seen.current ?? new Set<string>();
        for (const item of parsed.notifications) seenIds.add(item.id);
        seen.current = seenIds;
        setLoading(false);
      }

      if (event === "notification" && parsed.notification) {
        const notification = parsed.notification;
        setItems((current) => [
          notification,
          ...current.filter((item) => item.id !== notification.id),
        ]);
        const seenIds = seen.current ?? new Set<string>();
        if (!seenIds.has(notification.id) && !notification.read) {
          showToasts([notification]);
        }
        seenIds.add(notification.id);
        seen.current = seenIds;
      }
    };

    const connect = async () => {
      if (cancelled) return;
      const token = readToken();
      if (!token) return;

      controller = new AbortController();
      try {
        const response = await fetch(`${apiBaseUrl}/api/notifications/stream`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let index = buffer.indexOf("\n\n");
          while (index >= 0) {
            handleBlock(buffer.slice(0, index));
            buffer = buffer.slice(index + 2);
            index = buffer.indexOf("\n\n");
          }
        }
      } catch {
        // Reconnect below unless unmounted.
      } finally {
        if (!cancelled) {
          retry = window.setTimeout(() => void connect(), 5000);
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;
      controller?.abort();
      if (retry !== null) window.clearTimeout(retry);
    };
  }, [showToasts]);

  // Slow safety-net polling (SSE is primary).
  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh();
    }, FALLBACK_POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const markRead = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    );
    void markNotificationRead(id).catch(() => undefined);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((current) =>
      current.map((item) => (item.read ? item : { ...item, read: true })),
    );
    void markAllNotificationsRead().catch(() => undefined);
  }, []);

  const value: NotificationContextValue = {
    items,
    unreadCount: items.filter((item) => !item.read).length,
    loading,
    error,
    toasts,
    panelOpen,
    openPanel,
    closePanel,
    refresh,
    markRead,
    markAllRead,
    dismissToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationsProvider");
  }
  return context;
}
