import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Search,
} from "lucide-react";
import { Badge, Card, Skeleton, StatCard } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import { MODULE_META, type ServiceCategoryId } from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { fetchMyRequests, type MyRequestItem } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate } from "../lib/formats";
import { getServiceIcon } from "../lib/icons";

const QUICK_MODULES: { id: ServiceCategoryId; to: string }[] = [
  { id: "real-estate", to: "/real-estate" },
  { id: "property-home-services", to: "/home-services" },
];

const IN_PROGRESS = new Set([
  "assigned",
  "en_route",
  "in_progress",
  "scheduled",
  "contacted",
  "confirmed",
]);
const NEW = new Set(["requested", "draft"]);

function statusVariant(status: string): BadgeVariant {
  if (status === "completed" || status === "active") return "success";
  if (status === "cancelled") return "danger";
  if (status === "requested" || status === "draft") return "warning";
  if (status === "sold" || status === "rented") return "neutral";
  return "info";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-12" />
          </Card>
        ))}
      </div>
      <Card className="p-5 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAsync(
    () => fetchMyRequests({ limit: 50 }),
    [],
  );

  const [module, setModule] = useState<"" | "Real Estate" | "Home Services">(
    "",
  );
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const all = data?.items ?? [];

  const statuses = useMemo(
    () => Array.from(new Set(all.map((item) => item.status))).sort(),
    [all],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return all.filter((item) => {
      if (module && item.module !== module) return false;
      if (status && item.status !== status) return false;
      if (!needle) return true;
      return (
        item.title.toLowerCase().includes(needle) ||
        item.reference.toLowerCase().includes(needle) ||
        item.statusLabel.toLowerCase().includes(needle)
      );
    });
  }, [all, module, status, search]);

  const total = all.length;
  const newCount = all.filter((item) => NEW.has(item.status)).length;
  const inProgress = all.filter((item) =>
    IN_PROGRESS.has(item.status),
  ).length;
  const completed = all.filter((item) => item.status === "completed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted mt-1">
          Track your Real Estate and Home Services requests in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_MODULES.map(({ id, to }) => {
          const meta = MODULE_META[id];
          const Icon = getServiceIcon(meta.icon);
          return (
            <Link key={id} to={to} className="block">
              <Card hoverable className="p-4 h-full space-y-2">
                <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-extrabold text-charcoal">
                  {meta.shortName}
                </p>
                <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                  {meta.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load your dashboard.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Requests"
              value={total}
              icon={<ClipboardList className="w-5 h-5" />}
            />
            <StatCard
              label="New"
              value={newCount}
              icon={<ClipboardList className="w-5 h-5" />}
            />
            <StatCard
              label="In Progress"
              value={inProgress}
              icon={<Loader2 className="w-5 h-5" />}
            />
            <StatCard
              label="Completed"
              value={completed}
              icon={<CheckCircle2 className="w-5 h-5" />}
            />
          </div>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-charcoal tracking-tight">
                  All requests
                </h2>
                <p className="text-[11px] text-muted">
                  Real Estate and Home Services, newest first.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex rounded-lg border border-border-subtle bg-white p-1">
                  {(["", "Real Estate", "Home Services"] as const).map(
                    (option) => (
                      <button
                        key={option || "all"}
                        type="button"
                        onClick={() => setModule(option)}
                        className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                          module === option
                            ? "bg-charcoal text-white"
                            : "text-muted hover:text-charcoal"
                        }`}
                      >
                        {option || "All"}
                      </button>
                    ),
                  )}
                </div>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-charcoal outline-none focus:border-gold"
                >
                  <option value="">All statuses</option>
                  {statuses.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search"
                    className="w-36 rounded-lg border border-border-subtle bg-white py-1.5 pl-8 pr-3 text-[11px] text-charcoal outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <Card className="p-10 text-center space-y-3">
                <p className="text-sm font-bold text-charcoal">
                  No requests found
                </p>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  Requests you raise in Real Estate or Home Services will appear
                  here.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Link
                    to="/real-estate"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
                  >
                    Real Estate
                  </Link>
                  <Link
                    to="/home-services"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-white text-charcoal text-sm font-bold hover:border-gold/60"
                  >
                    Home Services
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle bg-ivory text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Request</th>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item: MyRequestItem) => (
                        <tr
                          key={`${item.module}-${item.id}`}
                          className="border-b border-border-subtle last:border-b-0 hover:bg-ivory/60"
                        >
                          <td className="px-4 py-3 text-[11px] font-bold text-muted">
                            {item.reference}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-charcoal">
                              {item.title}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold text-charcoal-light">
                              {item.module}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant(item.status)}>
                              {item.statusLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-muted">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to={item.href}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-gold-hover"
                            >
                              View
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
