import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Search,
} from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";
import { fetchMyRequests, fetchPolicies, type MyRequestItem } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate } from "../lib/formats";
import { statusMeta, statusVariant } from "../lib/status";
import { isPolicyRenewalSolved } from "../lib/renewals";
import { BRAND_MARK_URL } from "../lib/brand";
import { InfoTip } from "../components/InfoTip";
import { SocialLinksButtons } from "../components/SocialLinks";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
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

const PAGE_SIZE = 10;

export function Dashboard() {
  const { user } = useAuth();
  const [module, setModule] = useState<"" | MyRequestItem["module"]>("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [needsRenewal, setNeedsRenewal] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setAppliedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [module, status, appliedSearch, needsRenewal]);

  const { data, loading, error, refetch } = useAsync(
    () =>
      fetchMyRequests({
        module: module || undefined,
        status: status || undefined,
        q: appliedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    [module, status, appliedSearch, page]
  );
  const { data: policies } = useAsync(fetchPolicies);
  const { data: renewalRequests } = useAsync(
    () => fetchMyRequests({ q: "renewal", limit: 100 }),
    []
  );

  const pageItems = data?.items ?? [];
  const stats = data?.stats;

  const renewalItems: MyRequestItem[] = useMemo(() => {
    const policyRows: MyRequestItem[] = (policies ?? [])
      .filter(
        (policy) =>
          policy.status === "expiring" &&
          !isPolicyRenewalSolved(policy, renewalRequests?.items ?? [])
      )
      .slice()
      .sort((a, b) => (a.renewalDate < b.renewalDate ? -1 : 1))
      .map((policy) => ({
        id: `policy-${policy.id}`,
        reference: policy.policyNumber.toUpperCase(),
        title: `${policy.provider} ${policy.type} renewal`,
        module: "Insurance",
        status: policy.status,
        statusLabel: statusMeta(policy.status).label,
        createdAt: policy.renewalDate,
        href: "/insurance/policies",
      }));

    const requestRows: MyRequestItem[] = (renewalRequests?.items ?? [])
      .filter(
        (request) =>
          (request.module === "Insurance" || request.module === "Loans") &&
          request.title.toLowerCase().includes("renewal") &&
          (request.status === "new" || request.status === "in_progress")
      )
      .map((request) => ({
        ...request,
      }));

    return [...policyRows, ...requestRows];
  }, [policies, renewalRequests]);

  const renewalVisible = useMemo(() => {
    const needle = appliedSearch.toLowerCase();
    return renewalItems.filter((item) => {
      if (status && item.status !== status) return false;
      if (!needle) return true;
      return (
        item.title.toLowerCase().includes(needle) ||
        item.reference.toLowerCase().includes(needle) ||
        item.statusLabel.toLowerCase().includes(needle)
      );
    });
  }, [renewalItems, status, appliedSearch]);

  const rows = needsRenewal ? renewalVisible : pageItems;

  const selectModule = (option: "" | MyRequestItem["module"]) => {
    setModule(option);
    setNeedsRenewal(false);
  };

  const toggleRenewal = () => {
    if (!needsRenewal) {
      setModule("");
      setStatus("");
    }
    setNeedsRenewal(!needsRenewal);
  };

  const statuses = useMemo(() => {
    const set = new Set(pageItems.map((item) => item.status));
    if (status) set.add(status);
    return Array.from(set).sort();
  }, [pageItems, status]);

  const total = stats?.total ?? 0;
  const newCount = stats?.new ?? 0;
  const inProgress = stats?.inProgress ?? 0;
  const completed = stats?.completed ?? 0;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const rangeStart =
    (data?.total ?? 0) === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(data?.total ?? 0, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-1/2 z-0 hidden -translate-y-1/2 select-none md:block lg:right-4"
      >
        <img
          src={BRAND_MARK_URL}
          alt=""
          draggable={false}
          className="w-[420px] opacity-[0.08] grayscale [mask-image:radial-gradient(circle_at_60%_40%,black,transparent_72%)] lg:w-[560px] xl:w-[640px] dark:opacity-[0.09] dark:brightness-0 dark:invert"
        />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] ?? "there"}
            </h1>
            <InfoTip
              label="About the dashboard"
              text="Your dashboard brings together every request across Real Estate, Home Services, Digital Services, Insurance and Loans, with current status and next actions."
            />
          </div>
          <p className="text-muted-foreground mt-1">
            Track your Real Estate, Home Services, Digital Services, Insurance and
            Loans requests in one place.
          </p>
        </div>
        <SocialLinksButtons />
      </div>

      <section className="space-y-3" aria-label="Totals">
      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">We couldn't load your dashboard.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Total Requests",
                value: total,
                icon: ClipboardList,
                divider: "",
              },
              {
                label: "New",
                value: newCount,
                icon: ClipboardList,
                divider: "border-l border-border",
              },
              {
                label: "In Progress",
                value: inProgress,
                icon: Loader2,
                divider: "border-border max-lg:border-t lg:border-l",
              },
              {
                label: "Completed",
                value: completed,
                icon: CheckCircle2,
                divider: "border-l border-border max-lg:border-t",
              },
            ].map(({ label, value, icon: Icon, divider }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${divider}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                  <span className="block text-2xl font-extrabold tracking-tight text-foreground">
                    {value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="mr-auto text-xl font-extrabold text-foreground tracking-tight">
                All requests
              </h2>
              <div className="flex max-w-full items-center overflow-x-auto rounded-lg border border-border bg-surface p-1">
                {(
                  [
                    "",
                    "Real Estate",
                    "Home Services",
                    "Digital Services",
                    "Insurance",
                    "Loans",
                  ] as const
                ).map(
                    (option) => (
                      <button
                        key={option || "all"}
                        type="button"
                        onClick={() => selectModule(option)}
                      className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                        module === option
                          ? "bg-inverse text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option || "All"}
                    </button>
                  ),
                )}
                </div>
                <span
                  className="hidden h-6 w-px shrink-0 bg-border sm:block"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={toggleRenewal}
                  aria-pressed={needsRenewal}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    needsRenewal
                      ? "border-warning-fg/50 bg-warning-soft text-warning-fg ring-2 ring-warning-fg/30"
                      : "border-border bg-surface text-muted-foreground hover:border-warning-fg/50 hover:text-warning-fg"
                  }`}
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  Needs Renewal
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning-fg/15 px-1 text-[10px] font-extrabold">
                    {renewalItems.length}
                  </span>
                </button>
                <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="shrink-0 rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] font-bold text-foreground outline-none focus:border-brand"
              >
                <option value="">All statuses</option>
                {statuses.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <div className="relative shrink-0">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="w-36 rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-[11px] text-foreground outline-none focus:border-brand"
                />
              </div>
            </div>

            {rows.length === 0 ? (
              needsRenewal ? (
                <Card className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-warning-soft text-warning-fg flex items-center justify-center mx-auto">
                    <CalendarClock className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    No renewals due right now
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Policies nearing renewal and open renewal requests will
                    appear here.
                  </p>
                  <Link
                    to="/insurance/policies"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold"
                  >
                    View active policies
                  </Link>
                </Card>
              ) : (
              <Card className="p-10 text-center space-y-3">
                <p className="text-sm font-bold text-foreground">
                  No requests found
                </p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Requests you raise in Real Estate, Home Services, Digital
                  Services, Insurance or Loans will appear here.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Link
                    to="/real-estate"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold"
                  >
                    Real Estate
                  </Link>
                  <Link
                    to="/home-services"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-foreground text-sm font-bold hover:border-brand/60"
                  >
                    Home Services
                  </Link>
                  <Link
                    to="/digital-services"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-foreground text-sm font-bold hover:border-brand/60"
                  >
                    Digital Services
                  </Link>
                  <Link
                    to="/insurance"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-foreground text-sm font-bold hover:border-brand/60"
                  >
                    Insurance
                  </Link>
                  <Link
                    to="/loans"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-foreground text-sm font-bold hover:border-brand/60"
                  >
                    Loans
                  </Link>
                </div>
              </Card>
              )
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-muted text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Request</th>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((item: MyRequestItem) => (
                        <tr
                          key={`${item.module}-${item.id}`}
                          className="border-b border-border last:border-b-0 hover:bg-surface-muted/60"
                        >
                          <td className="px-4 py-3 text-[11px] font-bold text-muted-foreground">
                            {item.reference}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-foreground">
                              {item.title}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-foreground-soft">
                              {item.module}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant(item.status)}>
                              {item.statusLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to={item.href}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover"
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
                {!needsRenewal && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
                    <span>
                      10 per page · Showing {rangeStart}-{rangeEnd} of{" "}
                      {data?.total ?? 0}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPage((value) => Math.max(1, value - 1))
                        }
                        disabled={page <= 1}
                        className="cursor-pointer rounded border border-border px-2 py-1 font-bold text-foreground transition-colors hover:border-brand/60 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span>
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((value) => Math.min(totalPages, value + 1))
                        }
                        disabled={page >= totalPages}
                        className="cursor-pointer rounded border border-border px-2 py-1 font-bold text-foreground transition-colors hover:border-brand/60 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                {needsRenewal && (
                  <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
                    Showing {renewalVisible.length} renewal
                    {renewalVisible.length === 1 ? "" : "s"}
                  </div>
                )}
              </Card>
            )}
          </section>
        </>
      )}
      </section>
    </div>
  );
}
