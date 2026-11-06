import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Home,
  ShieldCheck,
  Car,
  type LucideIcon,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  StatCard,
} from "@kaundinya/ui";
import {
  COMPLIANCE,
  INSURANCE_COVERAGE_TYPES,
  INSURANCE_HELP,
} from "@kaundinya/config";
import { useInsuranceRequests } from "../lib/mockRequests";
import { POLICIES } from "../lib/moduleData";
import { formatDate, formatINR } from "../lib/formats";
import { STATUS_META } from "../lib/status";
import { InsuranceRequestDialog } from "../components/InsuranceRequestDialog";
import { LifeCoverCalculatorDialog } from "../components/LifeCoverCalculatorDialog";

const COVERAGE_ICONS: Record<string, LucideIcon> = {
  life: ShieldCheck,
  health: HeartPulse,
  motor: Car,
  property: Home,
};

export function Insurance() {
  const requests = useInsuranceRequests();
  const [dialog, setDialog] = useState<{
    service: string;
    kind: string;
    notes?: string;
  } | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const activePolicies = POLICIES.filter(
    (policy) => policy.status === "active"
  ).length;
  const renewalsDue = POLICIES.filter(
    (policy) => policy.status === "expiring"
  ).length;
  const totalCover = POLICIES.filter(
    (policy) => policy.status !== "lapsed"
  ).reduce((sum, policy) => sum + policy.coverAmount, 0);
  const openRequests = requests.filter(
    (request) => request.status === "new" || request.status === "in_progress"
  ).length;
  const resolvedRequests = requests.filter(
    (request) => request.status === "completed"
  ).length;
  const expiringPolicy = POLICIES.find(
    (policy) => policy.status === "expiring"
  );
  const recentRequests = requests.slice(0, 3);

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Insurance
          </h1>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active policies"
          value={activePolicies}
          hint={`${formatINR(totalCover)} total cover`}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Renewals due"
          value={renewalsDue}
          hint="Next 30 days"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          label="Open requests"
          value={openRequests}
          hint="With our team"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <StatCard
          label="Resolved"
          value={resolvedRequests}
          hint="Differences cleared"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {expiringPolicy && (
        <Card className="p-4 border-warning-fg/20 bg-warning-soft flex flex-col sm:flex-row sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-fg shrink-0" />
          <p className="text-xs text-warning-fg flex-1">
            <span className="font-bold">
              {expiringPolicy.provider} {expiringPolicy.type} policy
            </span>{" "}
            is due for renewal on {formatDate(expiringPolicy.renewalDate)}. We
            can review the renewal quote with you.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              openConsultation(
                `Renewal help · ${expiringPolicy.provider} ${expiringPolicy.policyNumber}`,
                "Renewal help"
              )
            }
          >
            Get renewal help
          </Button>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            Coverage types we help you navigate
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose a category to see what we review before you commit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {INSURANCE_COVERAGE_TYPES.map((coverage) => {
            const Icon = COVERAGE_ICONS[coverage.id] ?? ShieldCheck;
            const detailRoute =
              coverage.id === "health"
                ? "/insurance/health"
                : coverage.id === "motor"
                  ? "/insurance/motor"
                  : null;

            return (
              <Card key={coverage.id} className="p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    {coverage.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-brand mt-0.5">
                    {coverage.tagline}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {coverage.description}
                </p>
                <ul className="space-y-1">
                  {coverage.review.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-[11px] text-foreground-soft"
                    >
                      <CheckCircle2 className="w-3 h-3 text-brand shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2 space-y-2">
                  {coverage.id === "life" ? (
                    <>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setCalculatorOpen(true)}
                      >
                        Calculate cover
                      </Button>
                      <button
                        type="button"
                        onClick={() => openConsultation("Life & Term review")}
                        className="w-full text-center text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                      >
                        Talk to a consultant
                      </button>
                    </>
                  ) : detailRoute ? (
                    <Link
                      to={detailRoute}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-brand/60 transition-colors"
                    >
                      Explore guidance
                      <ArrowRight className="w-3.5 h-3.5 text-brand" />
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        openConsultation(`${coverage.name} review`)
                      }
                    >
                      Talk to a consultant
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            How we help
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Advice first, paperwork second. No pressure to buy.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {INSURANCE_HELP.map((item, index) => (
            <Card key={item.title} className="p-5 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">
                0{index + 1}
              </span>
              <h3 className="text-sm font-extrabold text-foreground">
                {item.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              {item.title === "Needs analysis" && (
                <button
                  type="button"
                  onClick={() => setCalculatorOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                >
                  Open calculator
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </Card>
          ))}
        </div>
      </section>

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

        {recentRequests.length === 0 ? (
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
    </div>
  );
}
