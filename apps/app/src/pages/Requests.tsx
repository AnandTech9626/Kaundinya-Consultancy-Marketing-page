import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList } from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import type { RequestStatus } from "@kaundinya/config";
import { fetchRequests } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { STATUS_META } from "../lib/status";

const FILTERS: { key: RequestStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export function Requests() {
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const { data, loading, error, refetch } = useAsync(fetchRequests);
  const requests = data ?? [];

  const filtered = requests.filter(
    (r) => filter === "all" || r.status === filter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          My Requests
        </h1>
        <p className="text-muted mt-1">All your service requests in one place.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              filter === f.key
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal border border-border-subtle hover:border-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load your requests.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-28" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">No requests found</p>
          <p className="text-sm text-muted">
            {requests.length === 0
              ? "You haven't submitted any requests yet."
              : "Nothing matches this filter. Try a different one."}
          </p>
          {requests.length === 0 && (
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
            >
              Request a Service
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <Link key={req.id} to={`/requests/${req.id}`} className="block">
              <Card className="p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:border-gold/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">
                      {req.specificService}
                    </p>
                    <p className="text-xs text-muted">{req.serviceCategory}</p>
                    <p className="text-[11px] text-muted-light">{req.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={STATUS_META[req.status].badge}>
                      {STATUS_META[req.status].label}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-light" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
