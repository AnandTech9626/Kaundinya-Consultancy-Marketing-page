import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Inbox, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchAdminServiceRequests,
  fetchServiceRequestStats,
  type AdminServiceRequest,
  type ServiceRequestStats,
} from "../lib/api";
import { formatDateTime } from "../lib/format";
import { showToast } from "../lib/toast";
import { StatusBadge, inputClass } from "../components/AdminUi";
import {
  SkeletonKpis,
  SkeletonTable,
} from "../components/Skeleton";
import {
  REQUEST_TABS,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_STYLES,
  SERVICE_REQUEST_STATUSES,
  type ServiceCategory,
} from "../lib/constants";

type TabId = "all" | ServiceCategory;

const PAGE_SIZE = 10;

function moduleTarget(request: AdminServiceRequest): string | null {
  const focus = encodeURIComponent(request.id);
  switch (request.serviceCategory) {
    case "Loans":
      return `/loans?tab=consultations&focus=${focus}&q=${encodeURIComponent(
        request.mobile,
      )}`;
    case "Insurance":
      return `/insurance/requests?focus=${focus}`;
    case "Property Management & Home Services":
      return `/home-services/requests?focus=${focus}`;
    case "Digital Services":
      return `/digital-services`;
    case "Real Estate":
      return `/real-estate/requests?focus=${focus}`;
    default:
      return null;
  }
}

export function RequestsAdmin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const focusId = params.get("focus");
  const focusApplied = useRef<string | null>(null);

  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<ServiceRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tab, setTab] = useState<TabId>("all");
  const knownTotal = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchServiceRequestStats());
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
        const useFocus =
          focusId && focusApplied.current !== focusId ? focusId : undefined;
        const result = await fetchAdminServiceRequests({
          category: tab === "all" ? undefined : tab,
          q: appliedSearch,
          status: statusFilter,
          page,
          pageSize: PAGE_SIZE,
          focus: useFocus,
        });

        if (
          knownTotal.current !== null &&
          result.total > knownTotal.current
        ) {
          showToast("New client request received.");
        }
        knownTotal.current = result.total;

        setRequests(result.items);
        setTotal(result.total);

        if (useFocus) {
          focusApplied.current = focusId;
          if (result.page !== page) setPage(result.page);
        }
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
    [tab, appliedSearch, statusFilter, page, focusId],
  );

  useEffect(() => {
    void load();
    void loadStats();
    const interval = window.setInterval(() => {
      void load(true);
      void loadStats();
    }, 60000);
    return () => window.clearInterval(interval);
  }, [load, loadStats]);

  useEffect(() => {
    if (!focusId) return;
    const element = document.getElementById(`request-${focusId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, requests]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of stats?.categories ?? []) {
      map.set(entry.category, entry.total);
    }
    return map;
  }, [stats]);

  const activeCategory =
    tab === "all"
      ? null
      : (stats?.categories.find((entry) => entry.category === tab) ?? null);

  const kpiSource =
    tab === "all"
      ? {
          total: stats?.total ?? 0,
          new: stats?.new ?? 0,
          inProgress: stats?.inProgress ?? 0,
          completed: stats?.completed ?? 0,
        }
      : {
          total: activeCategory?.total ?? 0,
          new: activeCategory?.new ?? 0,
          inProgress: activeCategory?.inProgress ?? 0,
          completed: activeCategory?.completed ?? 0,
        };

  const kpis = [
    { label: "Total", value: kpiSource.total },
    { label: "New", value: kpiSource.new },
    { label: "In progress", value: kpiSource.inProgress },
    { label: "Completed", value: kpiSource.completed },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, total);
  const pageNumbers = (() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  })();

  const activeLabel = REQUEST_TABS.find((entry) => entry.id === tab)?.label ?? "All";

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
            Every service request raised from the client app. Click a row to
            open it in that service.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live Â· refreshes every 60s
        </span>
      </div>

      {stats === null ? (
        <SkeletonKpis count={4} />
      ) : (
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
      )}

      <div className="flex flex-wrap gap-1 rounded-2xl border border-border-subtle bg-white p-2">
        {REQUEST_TABS.map((entry) => {
          const count =
            entry.id === "all"
              ? (stats?.total ?? 0)
              : (categoryCounts.get(entry.id) ?? 0);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setTab(entry.id);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                tab === entry.id
                  ? "bg-gold text-charcoal"
                  : "text-charcoal hover:bg-ivory"
              }`}
            >
              {entry.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  tab === entry.id
                    ? "bg-charcoal/10 text-charcoal"
                    : "bg-ivory text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <input
            className={`${inputClass} pl-9`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search client, KIS id or service"
          />
        </div>
        <select
          className={`${inputClass} max-w-[12rem]`}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {SERVICE_REQUEST_STATUSES.map((option) => (
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

      {loading && requests.length === 0 ? (
        <SkeletonTable rows={8} columns={tab === "all" ? 8 : 7} />
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-gold" />
          <p className="mt-2 text-sm font-bold text-charcoal">
            No requests in {activeLabel}
          </p>
          <p className="mt-1 text-xs text-muted">
            New client requests appear here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-ivory text-[10px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  {tab === "all" && <th className="px-3 py-2">Service</th>}
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Mobile</th>
                  <th className="px-3 py-2">Request</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const target = moduleTarget(request);
                  return (
                    <tr
                      key={request.id}
                      id={`request-${request.id}`}
                      role={target ? "button" : undefined}
                      tabIndex={target ? 0 : undefined}
                      onClick={() => {
                        if (target) navigate(target);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        if (!target) return;
                        event.preventDefault();
                        navigate(target);
                      }}
                      className={`border-t border-border-subtle align-top text-charcoal ${
                        target ? "cursor-pointer hover:bg-ivory/60" : ""
                      } ${
                        focusId === request.id
                          ? "bg-gold/10 ring-1 ring-inset ring-gold/60"
                          : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-[11px] text-muted">
                        {formatDateTime(request.createdAt)}
                      </td>
                      {tab === "all" && (
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              SERVICE_CATEGORY_STYLES[request.serviceCategory] ??
                              "border-border-subtle bg-ivory text-charcoal-light"
                            }`}
                          >
                            {SERVICE_CATEGORY_LABELS[request.serviceCategory] ??
                              request.serviceCategory}
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <p className="font-bold">
                          {request.clientName || "â€”"}
                        </p>
                        <p className="text-[10px] text-muted-light">
                          {request.clientCode ?? "â€”"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[11px] text-muted">
                        {request.mobile}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {request.specificService}
                      </td>
                      <td className="max-w-[22rem] px-3 py-2 text-[11px] text-muted">
                        {request.comments ? (
                          <span className="line-clamp-2">
                            {request.comments}
                          </span>
                        ) : (
                          "â€”"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        {target ? (
                          <ChevronRight className="ml-auto h-4 w-4 text-muted" />
                        ) : (
                          <span className="text-[10px] text-muted-light">
                            â€”
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-3 py-2">
            <p className="text-[11px] text-muted">
              Showing {pageStart}â€“{pageEnd} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border-subtle px-2.5 py-1 text-[11px] font-bold text-charcoal disabled:opacity-40"
              >
                Prev
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    pageNumber === page
                      ? "bg-charcoal text-white"
                      : "border border-border-subtle text-charcoal hover:border-gold/60"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="rounded-lg border border-border-subtle px-2.5 py-1 text-[11px] font-bold text-charcoal disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

