import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Car,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Skeleton, StatCard } from "@kaundinya/ui";
import { COMPLIANCE } from "@kaundinya/config";
import type {
  InsurancePlan,
  PolicyRecord,
  ServiceRequest,
} from "@kaundinya/config";
import {
  fetchInsurancePlans,
  fetchPolicies,
  fetchRequests,
} from "../lib/mockApi";
import { formatDate, formatINR } from "../lib/formats";
import { STATUS_META } from "../lib/status";
import { INSURANCE_TYPE_LABELS } from "../lib/insuranceUi";
import { InsurerLogo } from "../components/InsurerLogo";
import { BrochureDialog } from "../components/BrochureDialog";
import { InsuranceRequestDialog } from "../components/InsuranceRequestDialog";
import { LifeCoverCalculatorDialog } from "../components/LifeCoverCalculatorDialog";

type TabId = "life" | "health" | "motor" | "property";

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "life", label: "Life & Term", icon: ShieldCheck },
  { id: "health", label: "Health & Family", icon: HeartPulse },
  { id: "motor", label: "Motor", icon: Car },
  { id: "property", label: "Property", icon: Home },
];

const TAB_COPY: Record<
  TabId,
  { title: string; description: string; route?: string; routeLabel?: string }
> = {
  life: {
    title: "Life & Term cover",
    description:
      "Pure term protection that replaces income and clears liabilities.",
  },
  health: {
    title: "Health & Family cover",
    description:
      "Individual and family floaters reviewed for room-rent, waiting periods and restoration.",
    route: "/insurance/health",
    routeLabel: "Health insurance guide",
  },
  motor: {
    title: "Motor cover",
    description:
      "Two-wheeler and car cover reviewed for IDV, add-ons and no-claim bonus.",
    route: "/insurance/motor",
    routeLabel: "Motor insurance guide",
  },
  property: {
    title: "Property cover",
    description:
      "Home and contents protection against fire, flooding, electrical events and burglary.",
  },
};

function isClaimOrRenewal(service: string): boolean {
  return /claim|renewal/i.test(service);
}

export function Insurance() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<TabId>("life");
  const [dialog, setDialog] = useState<{
    service: string;
    kind: string;
    notes?: string;
  } | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [brochurePlan, setBrochurePlan] = useState<InsurancePlan | null>(null);
  const [vehicleType, setVehicleType] = useState<"2W" | "4W">("4W");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([fetchInsurancePlans(), fetchPolicies(), fetchRequests()])
      .then(([nextPlans, nextPolicies, nextRequests]) => {
        if (!active) return;
        setPlans(nextPlans);
        setPolicies(nextPolicies);
        setRequests(
          nextRequests.filter(
            (request) => request.serviceCategory === "Insurance"
          )
        );
      })
      .catch(() => {
        if (!active) return;
        setPlans([]);
        setPolicies([]);
        setRequests([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openConsultation = (
    service = "",
    kind = "Insurance consultation",
    notes = ""
  ) => setDialog({ service, kind, notes });

  const handleCalculatorReview = (summary: string) => {
    setCalculatorOpen(false);
    setDialog({
      service: "Life & Term review",
      kind: "Insurance consultation",
      notes: summary,
    });
  };

  const completedRequests = requests.filter(
    (request) => request.status === "completed"
  );
  const resolvedCount = completedRequests.filter((request) =>
    isClaimOrRenewal(request.specificService)
  ).length;
  const completedCount = completedRequests.length - resolvedCount;
  const openCount = requests.filter(
    (request) => request.status === "new"
  ).length;
  const inProgressCount = requests.filter(
    (request) => request.status === "in_progress"
  ).length;
  const cancelledCount = requests.filter(
    (request) => request.status === "cancelled"
  ).length;

  const activePolicies = policies.filter(
    (policy) => policy.status === "active"
  );
  const totalCover = policies
    .filter((policy) => policy.status !== "lapsed")
    .reduce((sum, policy) => sum + policy.coverAmount, 0);

  const daysUntil = (date: string) =>
    Math.ceil(
      (new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000
    );

  const renewalAlerts = policies
    .filter(
      (policy) =>
        policy.status === "expiring" || daysUntil(policy.renewalDate) <= 45
    )
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));

  const tabPlans = plans.filter((plan) => plan.type === tab);
  const tabCopy = TAB_COPY[tab];
  const recentRequests = requests.slice(0, 3);

  const tracker = [
    { label: "Open", value: openCount, dot: "bg-amber-500" },
    { label: "In progress", value: inProgressCount, dot: "bg-blue-500" },
    { label: "Resolved", value: resolvedCount, dot: "bg-emerald-500" },
    { label: "Completed", value: completedCount, dot: "bg-teal-500" },
    { label: "Cancelled", value: cancelledCount, dot: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Insurance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Policies, renewals and consultations in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openConsultation()}>
            <ShieldCheck className="w-4 h-4" />
            Talk to a consultant
          </Button>
          <Link
            to="/insurance/policies"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border hover:border-brand/60 text-foreground text-sm font-bold transition-colors"
          >
            Policy Vault
          </Link>
        </div>
      </div>

      {renewalAlerts.length > 0 && (
        <Card className="overflow-hidden border-warning-fg/20">
          <div className="flex items-center gap-2 border-b border-warning-fg/15 bg-warning-soft px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-warning-fg" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-warning-fg">
              Renewal reminders
            </p>
          </div>
          <div className="divide-y divide-border">
            {renewalAlerts.map((policy) => {
              const days = daysUntil(policy.renewalDate);
              const when =
                days < 0
                  ? `overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`
                  : days === 0
                    ? "renews today"
                    : `renews in ${days} day${days === 1 ? "" : "s"}`;
              return (
                <div
                  key={policy.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <InsurerLogo insurer={policy.provider} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {policy.provider} {policy.type} policy
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {policy.policyNumber} · Renewal{" "}
                      {formatDate(policy.renewalDate)} · {when}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      openConsultation(
                        `Renewal help - ${policy.provider} ${policy.policyNumber}`,
                        "Renewal help"
                      )
                    }
                  >
                    Get renewal help
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:max-w-xl">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:max-w-xl">
          <StatCard
            label="Active policies"
            value={activePolicies.length}
            hint={`${formatINR(totalCover)} total cover`}
            icon={<ShieldCheck className="w-5 h-5" />}
          />
          <StatCard
            label="Renewals due"
            value={renewalAlerts.length}
            hint="Next 45 days"
            icon={<CalendarClock className="w-5 h-5" />}
          />
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-foreground">
              Request tracker
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Resolved covers completed claims/renewals; Completed covers
              consultations.
            </p>
          </div>
          <Link
            to="/insurance/support"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover"
          >
            View all requests
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {tracker.map((stage) => (
            <div
              key={stage.label}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {stage.label}
                </p>
              </div>
              <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
                {stage.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
              tab === id
                ? "bg-charcoal text-white"
                : "border border-border bg-surface text-foreground hover:border-brand/60"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">
              {tabCopy.title}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {tabCopy.description}
            </p>
            {tabCopy.route && (
              <Link
                to={tabCopy.route}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover"
              >
                {tabCopy.routeLabel}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          ) : tabPlans.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Plans for this category will appear here.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tabPlans.map((plan) => (
                <Card key={plan.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    {plan.insurerLogoUrl ? (
                      <img
                        src={plan.insurerLogoUrl}
                        alt={plan.insurer}
                        className="h-9 w-9 shrink-0 rounded-lg border border-border bg-white object-contain p-1"
                      />
                    ) : (
                      <InsurerLogo insurer={plan.insurer} size={36} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {plan.insurer}
                      </p>
                      <h3 className="text-sm font-extrabold text-foreground">
                        {plan.name}
                      </h3>
                    </div>
                    <Badge variant="neutral">
                      {INSURANCE_TYPE_LABELS[plan.type] ?? plan.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-muted px-3 py-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                        Cover
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {formatINR(plan.sumInsured)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                        Premium
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {formatINR(plan.premium)}
                        {plan.tenureYears > 1
                          ? ` / ${plan.tenureYears}y`
                          : " / yr"}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1.5">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-1.5 text-[11px] text-foreground-soft"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setBrochurePlan(plan)}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Brochure
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        openConsultation(`${plan.insurer} ${plan.name}`)
                      }
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Schedule
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {tab === "life" && (
            <Card className="p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Life cover estimator
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  A starting point based on income, dependents and liabilities —
                  reviewed with you before any recommendation.
                </p>
              </div>
              <Button className="w-full" onClick={() => setCalculatorOpen(true)}>
                Calculate cover
              </Button>
              <button
                type="button"
                onClick={() => openConsultation("Life & Term review")}
                className="w-full text-center text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
              >
                Talk to a consultant
              </button>
            </Card>
          )}

          {tab === "health" && (
            <Card className="p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Schedule a consultation
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  No online application. Our team reviews waiting periods,
                  room-rent limits and network hospitals with you.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => openConsultation("Health & Family review")}
              >
                <Phone className="w-4 h-4" />
                Schedule consultation
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => openConsultation("Health claim assistance", "Claim assistance")}
              >
                Claim assistance
              </Button>
            </Card>
          )}

          {tab === "motor" && (
            <Card className="p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Vehicle type
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["2W", "Two-wheeler"],
                      ["4W", "Four-wheeler"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVehicleType(value)}
                      className={`rounded-lg border px-2 py-2 text-xs font-bold transition-colors cursor-pointer ${
                        vehicleType === value
                          ? "border-brand bg-brand-soft/60 text-foreground"
                          : "border-border bg-surface text-muted-foreground hover:border-brand/60"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {vehicleType === "2W"
                    ? "Two-wheeler renewals and claims."
                    : "Car renewals and claims."}{" "}
                  IDV, add-ons and no-claim bonus are checked before renewal.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  openConsultation("Motor renewal help", "Renewal help")
                }
              >
                Get renewal help
              </Button>
              <Link
                to="/insurance/motor"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-brand/60 transition-colors"
              >
                Motor guide
                <ArrowRight className="w-3.5 h-3.5 text-brand" />
              </Link>
            </Card>
          )}

          {tab === "property" && (
            <Card className="p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Property review
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Structure and contents are valued separately, then matched to
                  fire, flood and burglary cover.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => openConsultation("Property insurance review")}
              >
                <Phone className="w-4 h-4" />
                Schedule consultation
              </Button>
            </Card>
          )}

          <Card className="p-4 bg-surface-muted/60">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">
                No online application.
              </span>{" "}
              Final terms, premium and claim decisions rest with the insurer. Our
              team coordinates the paperwork with you.
            </p>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-5 border-b border-border">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Recent insurance requests
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Consultations, claims and renewal help from your account.
            </p>
          </div>
          <Link
            to="/insurance/support"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover whitespace-nowrap"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-brand mx-auto" />
            <p className="text-sm font-bold text-foreground">
              No insurance requests yet
            </p>
            <p className="text-xs text-muted-foreground">
              Raise a consultation and it will appear here with its status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/requests/${request.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface-muted/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {request.specificService}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {request.id.toUpperCase()} · {request.createdAt}
                  </p>
                </div>
                <Badge variant={STATUS_META[request.status].badge}>
                  {STATUS_META[request.status].label}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 bg-surface-muted/60">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-foreground">
              {COMPLIANCE.irdai.label}: {COMPLIANCE.irdai.value}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {COMPLIANCE.irdai.note} {COMPLIANCE.dpdp.note}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Insurance is the subject matter of solicitation. Final terms,
              premium and claim decisions rest with the insurer.
            </p>
          </div>
        </div>
      </Card>

      <InsuranceRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Insurance consultation"}
        defaultNotes={dialog?.notes ?? ""}
      />

      <LifeCoverCalculatorDialog
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onRequestReview={handleCalculatorReview}
      />

      <BrochureDialog plan={brochurePlan} onClose={() => setBrochurePlan(null)} />
    </div>
  );
}
