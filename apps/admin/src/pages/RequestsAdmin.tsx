import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Inbox, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  fetchAdminServiceRequests,
  fetchServiceRequestStats,
  updateAdminServiceRequest,
  type AdminServiceRequest,
  type AdminServiceRequestStatus,
  type ServiceRequestStats,
} from "../lib/api";
import { formatDateTime } from "../lib/format";
import { showToast } from "../lib/toast";
import { StatusBadge, inputClass } from "../components/AdminUi";

const CATEGORIES = [
  "Real Estate",
  "Property Management & Home Services",
];

const STATUSES: Array<{
  value: AdminServiceRequestStatus;
  label: string;
}> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function RequestsAdmin() {
  const [params] = useSearchParams();
  const focusId = params.get("focus");
  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const knownTotal = useRef<number | null>(null);

  const loadStats = useCallback(async (announceNew: boolean) => {
    try {
      const next = await fetchServiceRequestStats();
      if (
        announceNew &&
        knownTotal.current !== null &&
        next.total > knownTotal.current
      ) {
        showToast("New client request received.");
      }
      knownTotal.current = next.total;
      setStats(next);
    } catch {
      // Non-critical.
    }
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const list = await fetchAdminServiceRequests({
          q: appliedSearch,
          category,
          status,
        });
        setRequests(
          list.filter(
            (item) =>
              item.serviceCategory !== "Insurance" &&
              item.serviceCategory !== "Loans",
          ),
        );
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error ? err.message : "Could not load requests.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [appliedSearch, category, status],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadStats(false);
    const interval = window.setInterval(() => {
      void load(true);
      void loadStats(true);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [load, loadStats]);

  useEffect(() => {
    if (!focusId) return;
    const element = document.getElementById(`request-${focusId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, requests]);

  const onFilter = (event: FormEvent) => {
    event.preventDefault();
    setAppliedSearch(search);
  };

  const changeStatus = async (
    request: AdminServiceRequest,
    next: AdminServiceRequestStatus,
  ) => {
    setUpdating(request.id);
    try {
      await updateAdminServiceRequest(request.id, { status: next });
      showToast(
        `Request updated. ${request.clientCode ?? request.clientName} notified.`,
      );
      await load(true);
      await loadStats(false);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update request.",
        "error",
      );
    } finally {
      setUpdating(null);
    }
  };

  const kpis = [
    { label: "Total requests", value: stats?.total ?? 0 },
    { label: "New", value: stats?.new ?? 0 },
    { label: "In progress", value: stats?.inProgress ?? 0 },
    { label: "Completed", value: stats?.completed ?? 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Client requests
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-charcoal">
            Requests inbox
          </h1>
          <p className="mt-1 text-xs text-muted">
            Every service request raised from the client app, across all modules.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
Live · refreshes every 30s
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-border-subtle bg-white p-4"
          >
            <p className="text-xl font-extrabold tracking-tight text-charcoal">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-muted">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <form onSubmit={onFilter} className="flex flex-1 gap-2">
          <input
            className={`${inputClass} max-w-xs`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search client, KIS id or service"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
        <select
          className={`${inputClass} max-w-[15rem]`}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          className={`${inputClass} max-w-[11rem]`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-gold" />
          <p className="mt-2 text-sm font-bold text-charcoal">
            No requests match this filter
          </p>
          <p className="mt-1 text-xs text-muted">
            New client requests appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((request) => (
            <div
              key={request.id}
              id={`request-${request.id}`}
              className={`flex flex-wrap items-start gap-3 rounded-2xl border bg-white p-4 ${
                focusId === request.id
                  ? "border-gold ring-2 ring-gold/40"
                  : "border-border-subtle"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={request.status} />
                  <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold text-charcoal-light">
                    {request.serviceCategory}
                  </span>
                  {request.clientCode && (
                    <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-extrabold text-[#8a6b1a]">
                      {request.clientCode}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-extrabold text-charcoal">
                  {request.specificService}
                </p>
                <p className="text-[11px] text-muted">
                  {request.clientName} · {request.mobile} ·{" "}
                  {formatDateTime(request.createdAt)}
                </p>
                {request.comments && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-light">
                    {request.comments}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  className="rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] font-bold text-charcoal outline-none focus:border-gold"
                  value={request.status}
                  disabled={updating === request.id}
                  onChange={(event) =>
                    void changeStatus(
                      request,
                      event.target.value as AdminServiceRequestStatus,
                    )
                  }
                >
                  {STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
