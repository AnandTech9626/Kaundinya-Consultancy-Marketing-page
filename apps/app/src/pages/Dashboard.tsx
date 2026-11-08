import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Search,
} from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import {
  MODULE_META,
  type ServiceCategoryId,
} from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { fetchMyRequests, type MyRequestItem } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate } from "../lib/formats";
import { getServiceIcon } from "../lib/icons";
import { useMockRequests } from "../lib/mockRequests";
import { STATUS_META } from "../lib/status";
import { POLICIES } from "../lib/moduleData";
import { BRAND_MARK_URL } from "../lib/brand";
import { InfoTip } from "../components/InfoTip";
import { SocialLinksCard } from "../components/SocialLinks";

const QUICK_MODULES: { id: ServiceCategoryId; to: string }[] = [
  { id: "real-estate", to: "/real-estate" },
  { id: "property-home-services", to: "/home-services" },
  { id: "digital-services", to: "/digital-services" },
  { id: "insurance", to: "/insurance" },
  { id: "loans", to: "/loans" },
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
  if (status === "expiring") return "warning";
  if (status === "requested" || status === "draft") return "warning";
  if (status === "sold" || status === "rented") return "neutral";
  return "info";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
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
  const { requests: mockRequests } = useMockRequests();

  const [module, setModule] = useState<"" | MyRequestItem["module"]>("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [needsRenewal, setNeedsRenewal] = useState(false);

  const all = [
    ...(data?.items ?? []),
    ...mockRequests
      .filter(
        (request) =>
          request.serviceCategory === "Insurance" ||
          request.serviceCategory === "Loans"
      )
      .map((request): MyRequestItem => ({
        id: request.id,
        reference: request.id.toUpperCase(),
        title: request.specificService,
        module:
          request.serviceCategory === "Insurance" ? "Insurance" : "Loans",
        status: request.status,
        statusLabel: STATUS_META[request.status].label,
        createdAt: request.createdAt,
        href: `/requests/${request.id}`,
      })),
  ];

  const renewalItems: MyRequestItem[] = useMemo(() => {
    const policyRows: MyRequestItem[] = POLICIES.filter(
      (policy) => policy.status === "expiring"
    )
      .slice()
      .sort((a, b) => (a.renewalDate < b.renewalDate ? -1 : 1))
      .map((policy) => ({
        id: `policy-${policy.id}`,
        reference: policy.policyNumber.toUpperCase(),
        title: `${policy.provider} ${policy.type} renewal`,
        module: "Insurance",
        status: "expiring",
        statusLabel: "Renewal due",
        createdAt: policy.renewalDate,
        href: "/insurance/policies",
      }));

    const requestRows: MyRequestItem[] = mockRequests
      .filter(
        (request) =>
          request.specificService.toLowerCase().includes("renewal") &&
          (request.status === "new" || request.status === "in_progress")
      )
      .map((request): MyRequestItem => ({
        id: request.id,
        reference: request.id.toUpperCase(),
        title: request.specificService,
        module:
          request.serviceCategory === "Loans" ? "Loans" : "Insurance",
        status: request.status,
        statusLabel: STATUS_META[request.status].label,
        createdAt: request.createdAt,
        href: `/requests/${request.id}`,
      }));

    return [...policyRows, ...requestRows];
  }, [mockRequests]);

  const visibleBase = needsRenewal ? renewalItems : all;

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

  const statuses = useMemo(
    () => Array.from(new Set(visibleBase.map((item) => item.status))).sort(),
    [visibleBase],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return visibleBase.filter((item) => {
      if (!needsRenewal && module && item.module !== module) return false;
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

      <section className="space-y-4" aria-label="Your services">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {QUICK_MODULES.map(({ id, to }) => {
            const meta = MODULE_META[id];
            const Icon = getServiceIcon(meta.icon);
            return (
              <Link
                key={id}
                to={to}
                className="block group"
                aria-label={`Open ${meta.shortName}`}
              >
                <Card className="relative h-full overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-strong ring-1 ring-brand/20 transition-colors duration-300 group-hover:bg-brand group-hover:text-on-brand group-hover:ring-brand motion-reduce:transition-none">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand motion-reduce:transform-none motion-reduce:transition-none" />
                  </div>
                  <p className="mt-3 text-sm font-extrabold text-foreground">
                    {meta.shortName}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {meta.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <SocialLinksCard />

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

          {/* Roomier break before the table; overrides the tight snapshot rhythm above. */}
          <section className="mt-8! space-y-4">
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

            {filtered.length === 0 ? (
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
                    Open Policy Vault
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
                      {filtered.map((item: MyRequestItem) => (
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
              </Card>
            )}
          </section>
        </>
      )}
      </section>
    </div>
  );
}
