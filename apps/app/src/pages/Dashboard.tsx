import { Link } from "react-router-dom";
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Badge, Card, Skeleton, StatCard } from "@kaundinya/ui";
import { MODULE_META, type ServiceCategoryId } from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { fetchRequests } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { STATUS_META } from "../lib/status";
import { getServiceIcon } from "../lib/icons";

const QUICK_MODULES: { id: ServiceCategoryId; to: string }[] = [
  { id: "real-estate", to: "/real-estate" },
  { id: "insurance", to: "/insurance" },
  { id: "property-home-services", to: "/home-services" },
  { id: "loans", to: "/loans" },
];

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
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32 mt-2" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAsync(fetchRequests);
  const requests = data ?? [];

  const total = requests.length;
  const inProgress = requests.filter((r) => r.status === "in_progress").length;
  const completed = requests.filter((r) => r.status === "completed").length;
  const newCount = requests.filter((r) => r.status === "new").length;
  const recent = requests.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-muted mt-1">
            Track your service requests and discover what we can help you with.
          </p>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold shadow-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Request a Service
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_MODULES.map(({ id, to }) => {
          const meta = MODULE_META[id];
          const Icon = getServiceIcon(meta.icon);
          return (
            <Link key={id} to={to} className="block">
              <Card hoverable className="p-4 h-full space-y-2">
                <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-extrabold text-charcoal">{meta.shortName}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Requests" value={total} icon={<ClipboardList className="w-5 h-5" />} />
            <StatCard label="In Progress" value={inProgress} icon={<Loader2 className="w-5 h-5" />} />
            <StatCard label="Completed" value={completed} icon={<CheckCircle2 className="w-5 h-5" />} />
            <StatCard label="New" value={newCount} icon={<Sparkles className="w-5 h-5" />} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-charcoal tracking-tight">
                Recent Requests
              </h2>
              {requests.length > 0 && (
                <Link
                  to="/requests"
                  className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {recent.length === 0 ? (
              <Card className="p-10 text-center space-y-3">
                <p className="text-sm font-bold text-charcoal">No requests yet</p>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  You haven't submitted any service requests. Explore our services to get started.
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  Request your first service
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recent.map((req) => (
                  <Card key={req.id} className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-charcoal">{req.specificService}</p>
                        <p className="text-xs text-muted">{req.serviceCategory}</p>
                      </div>
                      <Badge variant={STATUS_META[req.status].badge}>
                        {STATUS_META[req.status].label}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
