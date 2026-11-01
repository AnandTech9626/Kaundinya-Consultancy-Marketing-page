import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Inbox, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  fetchAdminStats,
  fetchAuditLogs,
  fetchServiceRequestStats,
  type AdminAuditLog,
  type AdminStats,
  type ServiceRequestStats,
} from "../lib/api";
import { formatDateTime } from "../lib/format";

type ModuleCard = {
  name: string;
  description: string;
  icon: LucideIcon;
  to?: string;
};

const MODULES: ModuleCard[] = [
  {
    name: "Requests",
    description: "Every client request across all modules.",
    icon: Inbox,
    to: "/requests",
  },
  {
    name: "Real Estate",
    description: "Properties, listings, valuations and site visits.",
    icon: Building2,
    to: "/real-estate",
  },
  {
    name: "Home Services",
    description: "Jobs, technicians and dispatch.",
    icon: Wrench,
    to: "/home-services",
  },
];

export function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requestStats, setRequestStats] =
    useState<ServiceRequestStats | null>(null);
  const [activity, setActivity] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchAdminStats(),
      fetchAuditLogs(8),
      fetchServiceRequestStats().catch(() => null),
    ])
      .then(([nextStats, nextActivity, nextRequests]) => {
        if (!cancelled) {
          setStats(nextStats);
          setActivity(nextActivity);
          setRequestStats(nextRequests);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = [
    { label: "Total properties", value: stats?.propertiesTotal ?? 0 },
    { label: "Pending listings", value: stats?.pendingProperties ?? 0 },
    { label: "Live listings", value: stats?.activeProperties ?? 0 },
    { label: "New enquiries", value: stats?.newEnquiries ?? 0 },
    { label: "Valuations pending", value: stats?.valuationsPending ?? 0 },
    { label: "Site visits pending", value: stats?.siteVisitsPending ?? 0 },
    { label: "New client requests", value: requestStats?.new ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
          Welcome back, Admin
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage the Kaundinya consultancy from one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-border-subtle bg-white p-4"
          >
            <p className="text-2xl font-extrabold tracking-tight text-charcoal">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-muted">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODULES.map(({ name, description, icon: Icon, to }) => {
          const active = Boolean(to);
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    active
                      ? "bg-gold-light text-[#8a6b1a]"
                      : "bg-ivory text-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {active ? (
                  <ArrowRight className="h-4 w-4 text-gold" />
                ) : (
                  <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-light">
                    Soon
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h2 className="text-sm font-extrabold text-charcoal">{name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {description}
                </p>
              </div>
            </>
          );

          const className = `flex flex-col rounded-2xl border border-border-subtle bg-white p-5 text-left transition-all ${
            active
              ? "hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-md"
              : "opacity-70"
          }`;

          return active ? (
            <Link key={name} to={to as string} className={className}>
              {content}
            </Link>
          ) : (
            <div key={name} className={className}>
              {content}
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border-subtle bg-white p-5">
        <h2 className="text-sm font-extrabold tracking-tight text-charcoal">
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <p className="mt-2 text-xs text-muted">
            No admin activity recorded yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border-subtle">
            {activity.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-charcoal">
                    {item.action}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                    {item.entityType}
                    {item.detail ? ` · ${item.detail}` : ""}
                  </p>
                </div>
                <time className="shrink-0 text-[10px] font-semibold text-muted-light">
                  {formatDateTime(item.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
