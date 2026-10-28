import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  Coins,
  RefreshCw,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import type { AppNotification, NotificationKind } from "@kaundinya/config";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";

const KIND_META: Record<
  NotificationKind,
  { icon: LucideIcon; label: string; className: string }
> = {
  request: {
    icon: ClipboardList,
    label: "Request",
    className: "bg-gold-light text-[#B8860B]",
  },
  job: {
    icon: Wrench,
    label: "Job",
    className: "bg-blue-50 text-blue-600",
  },
  loan: {
    icon: Coins,
    label: "Loan",
    className: "bg-emerald-50 text-emerald-600",
  },
  renewal: {
    icon: RefreshCw,
    label: "Renewal",
    className: "bg-amber-50 text-amber-600",
  },
  policy: {
    icon: ShieldCheck,
    label: "Policy",
    className: "bg-gold-light text-[#B8860B]",
  },
  site_visit: {
    icon: CalendarDays,
    label: "Site visit",
    className: "bg-purple-50 text-purple-600",
  },
  system: {
    icon: Bell,
    label: "Update",
    className: "bg-gold-light text-[#B8860B]",
  },
};

export function Notifications() {
  const { data, loading, error, refetch } = useAsync(fetchNotifications);
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    void markAllNotificationsRead();
  };

  const openNotification = (notification: AppNotification) => {
    if (notification.read) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      )
    );
    void markNotificationRead(notification.id);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Notifications
          </h1>
          <p className="text-muted mt-1">
            {loading
              ? "Loading notifications..."
              : unread > 0
                ? `${unread} unread notification${unread > 1 ? "s" : ""}`
                : "You're all caught up"}
          </p>
        </div>
        {!loading && unread > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-gold hover:text-gold-hover cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load your notifications.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">No notifications yet</p>
          <p className="text-sm text-muted">
            Updates about your requests will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const meta = KIND_META[n.kind ?? "system"];
            const Icon = meta.icon;
            const card = (
              <Card hoverable={Boolean(n.href)} className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      n.read ? "bg-ivory text-muted" : meta.className
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-charcoal">{n.title}</p>
                      {!n.read && <Badge variant="gold">New</Badge>}
                    </div>
                    <p className="text-xs text-muted leading-relaxed mt-0.5">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-muted-light">
                        {n.createdAt}
                      </span>
                    </div>
                  </div>
                  {n.href && (
                    <ChevronRight className="w-4 h-4 text-muted-light shrink-0 mt-2" />
                  )}
                </div>
              </Card>
            );

            return n.href ? (
              <Link
                key={n.id}
                to={n.href}
                onClick={() => openNotification(n)}
                className="block"
              >
                {card}
              </Link>
            ) : (
              <div key={n.id}>{card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
