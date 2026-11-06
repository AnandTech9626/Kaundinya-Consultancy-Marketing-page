import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  Coins,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AppNotification, NotificationKind } from "@kaundinya/config";
import { useNotifications } from "../lib/notifications";

const KIND_META: Record<
  NotificationKind,
  { icon: LucideIcon; label: string; className: string }
> = {
  request: {
    icon: ClipboardList,
    label: "Request",
    className: "bg-brand-soft text-brand-strong",
  },
  job: {
    icon: Wrench,
    label: "Job",
    className: "bg-info-soft text-info-fg",
  },
  loan: {
    icon: Coins,
    label: "Loan",
    className: "bg-success-soft text-success-fg",
  },
  renewal: {
    icon: RefreshCw,
    label: "Renewal",
    className: "bg-warning-soft text-warning-fg",
  },
  policy: {
    icon: ShieldCheck,
    label: "Policy",
    className: "bg-brand-soft text-brand-strong",
  },
  site_visit: {
    icon: CalendarDays,
    label: "Site visit",
    className: "bg-purple-50 text-purple-600",
  },
  system: {
    icon: Bell,
    label: "Update",
    className: "bg-brand-soft text-brand-strong",
  },
};

export function NotificationPanel() {
  const navigate = useNavigate();
  const {
    items,
    unreadCount,
    loading,
    error,
    panelOpen,
    closePanel,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications();

  useEffect(() => {
    if (panelOpen) void refresh();
  }, [panelOpen, refresh]);

  useEffect(() => {
    if (!panelOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [panelOpen, closePanel]);

  const openNotification = (notification: AppNotification) => {
    if (!notification.read) markRead(notification.id);
    closePanel();
    if (notification.href) navigate(notification.href);
  };

  return (
    <div
      className={`fixed inset-0 z-[80] ${panelOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!panelOpen}
    >
      <div
        className={`absolute inset-0 bg-inverse/50 transition-opacity duration-300 ${
          panelOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closePanel}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand-strong">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Live updates on your requests.
            </p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close notifications"
            className="shrink-0 rounded-lg border border-border p-2 text-foreground hover:border-brand/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="flex justify-end border-b border-border px-5 py-2">
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : error ? (
            <div className="space-y-3 p-10 text-center">
              <p className="text-xs text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-on-brand hover:bg-brand-hover cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="space-y-2 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground">
                Status updates on your requests will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((notification) => {
                const meta = KIND_META[notification.kind ?? "system"];
                const Icon = meta.icon;
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface-muted ${
                        notification.read ? "" : "bg-brand-soft/20"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          notification.read ? "bg-surface-muted text-muted-foreground" : meta.className
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-xs font-extrabold text-foreground">
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                          {notification.message}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          {notification.clientCode && (
                            <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-bold text-foreground-soft">
                              {notification.clientCode}
                            </span>
                          )}
                          <span className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-subtle-foreground">
                            {notification.createdAt}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
