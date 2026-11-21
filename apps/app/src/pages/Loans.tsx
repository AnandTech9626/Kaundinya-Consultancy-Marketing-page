import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  ClipboardList,
  Loader2,
  ShieldCheck,
  Store,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Skeleton,
} from "@kaundinya/ui";
import type { ServiceRequest } from "@kaundinya/config";
import {
  fetchRequests,
  recommendLoanPlans,
  type LoanIncomeSource,
  type LoanRecommendationResult,
} from "../lib/mockApi";
import { ApiError } from "../lib/api";
import { statusMeta } from "../lib/status";
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
    loanType?: "Home" | "Personal" | "Business" | "Mortgage";
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
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyEmis, setMonthlyEmis] = useState("");
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
      loanType?: "Home" | "Personal" | "Business" | "Mortgage";
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
        loanType: plan.loanType,
        requirement: currentRequirement(),
      }
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Loans
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Check eligibility, compare lender plans and get help with documents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              openConsultation("", "Loan consultation", "", {
                requirementId: recommendation?.id,
                bank: recommendation?.plans[0]?.bank,
                loanType: recommendation?.plans[0]?.loanType,
                requirement: recommendation
                  ? currentRequirement()
                  : undefined,
              })
            }
          >
            <ShieldCheck className="w-4 h-4" />
            Talk to a loan advisor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="overflow-hidden p-0 scroll-mt-24">
            <div className="border-b border-border bg-gradient-to-r from-brand-soft/70 via-surface to-surface px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand shadow-sm">
                    <Calculator className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                      Check your loan eligibility
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                      Answer three questions and we will show the loan amount you
                      may qualify for, plus the bank plans that fit your profile.
                    </p>
                  </div>
                </div>
                <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:inline-flex">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-strong" />
                  No application submitted
                </span>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div id="loan-eligibility" className="scroll-mt-24">
                <p className="mb-2 text-xs font-bold text-foreground">
                  Source of income
                </p>
                <div className="grid grid-cols-2 gap-2 sm:max-w-md">
                  {(
                    [
                      ["salaried", "Salaried", Briefcase],
                      ["business", "Business", Store],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSourceOfIncome(value)}
                      aria-pressed={sourceOfIncome === value}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all cursor-pointer ${
                        sourceOfIncome === value
                          ? "border-brand bg-brand text-on-brand shadow-sm"
                          : "border-border bg-surface text-foreground hover:border-brand/60 hover:bg-brand-soft/40"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          sourceOfIncome === value
                            ? "text-on-brand"
                            : "text-brand-strong"
                        }`}
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Monthly income (₹)"
                  htmlFor="loan-income"
                  required
                >
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

                <FormField
                  label="Monthly EMIs (₹)"
                  htmlFor="loan-emis"
                  required
                >
                  <Input
                    id="loan-emis"
                    inputMode="numeric"
                    value={monthlyEmis}
                    onChange={(event) =>
                      setMonthlyEmis(
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 9)
                      )
                    }
                    placeholder="0 if none"
                  />
                </FormField>
              </div>

              {requirementError && (
                <p className="text-xs font-semibold text-danger-fg">
                  {requirementError}
                </p>
              )}

              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Takes a few seconds. Estimates are indicative only.
                </p>
                <Button
                  onClick={() => void checkEligibility()}
                  disabled={checking}
                  className="w-full sm:w-auto"
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check eligibility"
                  )}
                </Button>
              </div>
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        </div>

        <Card className="flex h-full flex-col overflow-hidden xl:col-span-1">
          <div className="flex items-start justify-between gap-2 border-b border-border p-5">
            <div>
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                Recent requests
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Consultations, document help and lender coordination.
              </p>
            </div>
            <Link
              to="/loans/support"
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-brand hover:text-brand-hover"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {requestsLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <ClipboardList className="w-8 h-8 text-brand" />
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
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-muted/60"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">
                      {request.specificService}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {request.id.toUpperCase()} · {request.createdAt}
                    </p>
                  </div>
                  <Badge variant={statusMeta(request.status).badge}>
                    {statusMeta(request.status).label}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <LoanRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Loan consultation"}
        defaultNotes={dialog?.notes ?? ""}
        requirementId={dialog?.requirementId}
        bank={dialog?.bank}
        loanType={dialog?.loanType}
        requirement={dialog?.requirement}
      />
    </div>
  );
}
