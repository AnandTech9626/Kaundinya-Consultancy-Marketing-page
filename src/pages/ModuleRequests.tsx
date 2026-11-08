import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
  Search,
} from "lucide-react";
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
import {
  ConfirmDialog,
  StatusBadge,
  inputClass,
} from "../components/AdminUi";
import { SkeletonKpis, SkeletonList } from "../components/Skeleton";
import { SERVICE_REQUEST_STATUSES } from "../lib/constants";

const PAGE_SIZE = 10;

export function ModuleRequests({
  category,
  moduleLabel,
  modulePath,
}: {
  category: string;
  moduleLabel: string;
  modulePath: string;
}) {
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
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    request: AdminServiceRequest;
    status: AdminServiceRequestStatus;
  } | null>(null);

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
          category,
          q: appliedSearch,
          status: statusFilter,
          page,
          pageSize: PAGE_SIZE,
          focus: useFocus,
        });
        setRequests(result.items);
        setTotal(result.total);
        if (useFocus) {
          focusApplied.current = focusId;
          if (result.page !== page) setPage(result.page);
        }
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load client requests.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [category, appliedSearch, statusFilter, page, focusId],
  );

  useEffect(() => {
    void load();
    void loadStats();
    const interval = window.setInterval(() => {
      void load(true);
      void loadStats();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [load, loadStats]);

  useEffect(() => {
    if (!focusId) return;
    const element = document.getElementById(`module-request-${focusId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, requests]);

  const applyStatus = async (
    request: AdminServiceRequest,
    status: AdminServiceRequestStatus,
  ) => {
    setConfirm(null);
    setUpdating(request.id);
    try {
      await updateAdminServiceRequest(request.id, { status });
      showToast(
        `Request marked ${
          SERVICE_REQUEST_STATUSES.find((option) => option.value === status)?.label ?? status
        }. Client notified.`,
      );
      await Promise.all([load(), loadStats()]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update request.",
        "error",
      );
    } finally {
      setUpdating(null);
    }
  };

  const changeStatus = (
    request: AdminServiceRequest,
    status: AdminServiceRequestStatus,
  ) => {
    if (status === request.status) return;
    if (status === "completed" || status === "cancelled") {
      setConfirm({ request, status });
      return;
    }
    void applyStatus(request, status);
  };

  const categoryStats =
    stats?.categories.find((entry) => entry.category === category) ?? null;

  const kpis = [
    { label: "Total", value: categoryStats?.total ?? 0 },
    { label: "New", value: categoryStats?.new ?? 0 },
    { label: "In progress", value: categoryStats?.inProgress ?? 0 },
    { label: "Completed", value: categoryStats?.completed ?? 0 },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, total);
  const pageNumbers = (() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  })();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            to={modulePath}
            className="inline-flex items-center gap-1 text-xs font-bold text-charcoal hover:text-gold-hover"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {moduleLabel}
          </Link>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gold">
            {moduleLabel}
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-charcoal">
            Client requests
          </h1>
          <p className="mt-1 text-xs text-muted">
            Every request raised from the {moduleLabel} section of the client
            app.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void load();
            void loadStats();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <input
            className={`${inputClass} pl-9`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search client, mobile, KIS id or service"
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
        <SkeletonList rows={6} />
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-gold" />
          <p className="mt-2 text-sm font-bold text-charcoal">
            No client requests yet
          </p>
          <p className="mt-1 text-xs text-muted">
            New requests from this module appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((request) => (
            <div
              key={request.id}
              id={`module-request-${request.id}`}
              className={`flex flex-wrap items-start gap-3 rounded-2xl border bg-white p-4 ${
                focusId === request.id
                  ? "border-gold ring-2 ring-gold/40"
                  : "border-border-subtle"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={request.status} />
                  {request.clientCode && (
                    <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-extrabold text-[#8a6b1a]">
                      {request.clientCode}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-light">
                    {formatDateTime(request.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm font-extrabold text-charcoal">
                  {request.specificService}
                </p>
                <p className="text-[11px] text-muted">
                  {request.clientName} Â· {request.mobile}
                </p>
                {request.comments && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-light">
                    {request.comments}
                  </p>
                )}
              </div>
              <select
                className="rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] font-bold text-charcoal outline-none focus:border-gold disabled:opacity-50"
                value={request.status}
                disabled={updating === request.id}
                onChange={(event) =>
                  changeStatus(
                    request,
                    event.target.value as AdminServiceRequestStatus,
                  )
                }
              >
                {SERVICE_REQUEST_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border-subtle bg-white px-3 py-2">
            <p className="text-[11px] text-muted">
              Showing {pageStart}â€“{pageEnd} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="rounded-lg border border-border-subtle p-1.5 text-charcoal disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
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
                aria-label="Next page"
                className="rounded-lg border border-border-subtle p-1.5 text-charcoal disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={`Mark request ${
            SERVICE_REQUEST_STATUSES.find((option) => option.value === confirm.status)
              ?.label ?? confirm.status
          }?`}
          message={`${confirm.request.clientName} will be notified of this status change.`}
          busy={updating === confirm.request.id}
          confirmLabel="Update status"
          busyLabel="Updating..."
          tone={confirm.status === "cancelled" ? "danger" : "primary"}
          onConfirm={() => void applyStatus(confirm.request, confirm.status)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

