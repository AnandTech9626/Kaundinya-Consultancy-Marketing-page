import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, FormField, Input } from "@kaundinya/ui";
import { COMPLIANCE } from "@kaundinya/config";
import type { ServiceRequest } from "@kaundinya/config";
import {
  fetchRequests,
  recommendLoanPlans,
  type LoanIncomeSource,
  type LoanRecommendationResult,
} from "../lib/mockApi";
import { ApiError } from "../lib/api";
import { STATUS_META } from "../lib/status";
import { formatINR } from "../lib/formats";
import { LoanRequestDialog } from "../components/LoanRequestDialog";
import { BankLogo } from "../components/BankLogo";

const LOAN_TYPE_LABEL: Record<string, string> = {
  Home: "Home loan",
  Personal: "Personal loan",
  Business: "Business loan",
  Mortgage: "Loan against property",
};

export function Loans() {
  const [dialog, setDialog] = useState<{
    service: string;
    kind: string;
    notes?: string;
    requirementId?: string;
    bank?: string;
    requirement?: {
      sourceOfIncome: LoanIncomeSource;
      monthlyIncome: number;
      monthlyEmis: number;
    };
  } | null>(null);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchRequests()
      .then((list) => {
        if (!active) return;
        setRequests(list.filter((item) => item.serviceCategory === "Loans"));
      })
      .catch(() => {
        if (active) setRequests([]);
      })
      .finally(() => {
        if (active) setRequestsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const recentRequests = requests.slice(0, 3);

  const [sourceOfIncome, setSourceOfIncome] =
    useState<LoanIncomeSource>("salaried");
  const [monthlyIncome, setMonthlyIncome] = useState("100000");
  const [monthlyEmis, setMonthlyEmis] = useState("15000");
  const [requirementError, setRequirementError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [recommendation, setRecommendation] =
    useState<LoanRecommendationResult | null>(null);

  const openConsultation = (
    service = "",
    kind = "Loan consultation",
    notes = "",
    extra?: {
      requirementId?: string;
      bank?: string;
      requirement?: {
        sourceOfIncome: LoanIncomeSource;
        monthlyIncome: number;
        monthlyEmis: number;
      };
    }
  ) => setDialog({ service, kind, notes, ...extra });

  const currentRequirement = () => {
    const income = Number(monthlyIncome.replace(/[^0-9]/g, ""));
    const emis = Number(monthlyEmis.replace(/[^0-9]/g, "") || "0");
    if (!Number.isFinite(income) || income <= 0) return undefined;
    return {
      sourceOfIncome,
      monthlyIncome: income,
      monthlyEmis: Number.isFinite(emis) && emis >= 0 ? emis : 0,
    };
  };

  const checkEligibility = async () => {
    const income = Number(monthlyIncome.replace(/[^0-9]/g, ""));
    const emis = Number(monthlyEmis.replace(/[^0-9]/g, "") || "0");
    if (!Number.isFinite(income) || income <= 0) {
      setRequirementError("Enter your monthly income to check eligibility.");
      setRecommendation(null);
      return;
    }
    if (!Number.isFinite(emis) || emis < 0) {
      setRequirementError("Existing EMIs must be zero or a positive number.");
      setRecommendation(null);
      return;
    }
    setRequirementError(null);
    setChecking(true);
    try {
      setRecommendation(
        await recommendLoanPlans({
          sourceOfIncome,
          monthlyIncome: income,
          monthlyEmis: emis,
        })
      );
    } catch (error) {
      setRecommendation(null);
      setRequirementError(
        error instanceof ApiError
          ? error.message
          : "Could not check eligibility. Please try again."
      );
    } finally {
      setChecking(false);
    }
  };

  const talkAboutPlan = (planId: string) => {
    const plan = recommendation?.plans.find((entry) => entry.id === planId);
    if (!plan || !recommendation) return;
    openConsultation(
      `${plan.bank} ${plan.product}`,
      "Loan consultation",
      "",
      {
        requirementId: recommendation.id,
        bank: plan.bank,
        requirement: currentRequirement(),
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Loans
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              openConsultation("", "Loan consultation", "", {
                requirementId: recommendation?.id,
                bank: recommendation?.plans[0]?.bank,
                requirement: recommendation
                  ? currentRequirement()
                  : undefined,
              })
            }
          >
            <ShieldCheck className="w-4 h-4" />
            Talk to a loan advisor
          </Button>
          <Link
            to="/loans/support"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border hover:border-brand/60 text-foreground text-sm font-bold transition-colors"
          >
            Loan support
          </Link>
        </div>
      </div>

      <Card className="p-5 sm:p-6 scroll-mt-24">
        <div id="loan-eligibility" className="mb-4 space-y-1">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            Check your loan eligibility
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Answer three questions and we will show the loan amount you may
            qualify for, plus the bank plans that fit your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-bold text-foreground mb-1.5">
              Source of income
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["salaried", "Salaried"],
                  ["business", "Business"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSourceOfIncome(value)}
                  className={`rounded-lg border px-2 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    sourceOfIncome === value
                      ? "border-brand bg-brand-soft/60 text-foreground"
                      : "border-border bg-surface text-muted-foreground hover:border-brand/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Monthly income (₹)" htmlFor="loan-income" required>
            <Input
              id="loan-income"
              inputMode="numeric"
              value={monthlyIncome}
              onChange={(event) =>
                setMonthlyIncome(
                  event.target.value.replace(/[^0-9]/g, "").slice(0, 9)
                )
              }
              placeholder="e.g. 100000"
            />
          </FormField>

          <FormField label="Monthly EMIs (₹)" htmlFor="loan-emis" required>
            <Input
              id="loan-emis"
              inputMode="numeric"
              value={monthlyEmis}
              onChange={(event) =>
                setMonthlyEmis(
                  event.target.value.replace(/[^0-9]/g, "").slice(0, 9)
                )
              }
              placeholder="e.g. 15000 (0 if none)"
            />
          </FormField>
        </div>

        {requirementError && (
          <p className="mt-3 text-xs font-semibold text-danger-fg">
            {requirementError}
          </p>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => void checkEligibility()}
            disabled={checking}
            className="sm:w-auto"
          >
            {checking ? "Checking..." : "Check eligibility"}
          </Button>
          <p className="text-[11px] text-muted-foreground leading-relaxed sm:self-center">
            Takes a few seconds. No application is submitted.
          </p>
        </div>
      </Card>

      {recommendation && (
        <Card className="p-5 sm:p-6 space-y-5">
          <div className="rounded-2xl bg-inverse p-5 text-white space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-inverse-foreground/60">
              Eligibility result
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-inverse-foreground/60">
                  You may be eligible for
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                  {formatINR(recommendation.eligibleAmount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-inverse-foreground/60">
                  Indicative EMI
                </p>
                <p className="text-lg font-bold text-white">
                  {formatINR(recommendation.indicativeEmi)}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-inverse-foreground/50 leading-relaxed">
              {recommendation.rateBasis}
            </p>
          </div>

          {recommendation.plans.length === 0 ? (
            <div className="rounded-xl bg-surface-muted p-5 text-center space-y-2">
              <p className="text-sm font-extrabold text-foreground">
                No bank plans match this profile yet
              </p>
              <p className="text-xs text-muted-foreground">
                An advisor can still review your requirement and suggest
                options.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  openConsultation(
                    "Loan eligibility review",
                    "Loan consultation",
                    "",
                    {
                      requirementId: recommendation.id,
                      requirement: currentRequirement(),
                    }
                  )
                }
              >
                Talk to an advisor
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-foreground tracking-tight">
                  Recommended plans for you
                </h3>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {recommendation.plans.length} match
                  {recommendation.plans.length === 1 ? "" : "es"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendation.plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="p-4 space-y-3 border-brand/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <BankLogo bank={plan.bank} size={34} />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {plan.bank}
                          </p>
                          <h4 className="text-sm font-extrabold text-foreground">
                            {plan.product}
                          </h4>
                          <p className="text-[10px] font-semibold text-brand">
                            {LOAN_TYPE_LABEL[plan.loanType] ?? plan.loanType}
                          </p>
                        </div>
                      </div>
                      <Badge variant="gold">
                        {plan.annualRate.toFixed(1)}% p.a.
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-muted px-3 py-2">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                          Up to
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {formatINR(plan.eligibleAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                          EMI
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {formatINR(plan.emi)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                          Tenure
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {Math.round(plan.maxTenureMonths / 12)} yrs
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Fits your EMI headroom of{" "}
                      {formatINR(recommendation.capacity)}/month at{" "}
                      {plan.annualRate.toFixed(1)}% p.a.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => talkAboutPlan(plan.id)}
                    >
                      Talk to an advisor
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-5 border-b border-border">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Recent loan requests
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Consultations, document help and lender coordination.
            </p>
          </div>
          <Link
            to="/loans/support"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover whitespace-nowrap"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requestsLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading your loan requests...
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-brand mx-auto" />
            <p className="text-sm font-bold text-foreground">
              No loan requests yet
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
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">
              {COMPLIANCE.rbi.label}.
            </span>{" "}
            {COMPLIANCE.rbi.note} {COMPLIANCE.dpdp.note}
          </p>
        </div>
      </Card>

      <LoanRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Loan consultation"}
        defaultNotes={dialog?.notes ?? ""}
        requirementId={dialog?.requirementId}
        bank={dialog?.bank}
        requirement={dialog?.requirement}
      />
    </div>
  );
}
