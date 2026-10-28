import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Coins,
  Home,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  CalculatorPanel,
  Card,
  RangeField,
  Skeleton,
} from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import type { LoanEligibility } from "@kaundinya/config";
import { COMPLIANCE, MODULE_STAGES } from "@kaundinya/config";
import {
  calculateEmi,
  estimateLoanEligibility,
  fetchLoanApplications,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const STAGES = MODULE_STAGES.loans;

const STAGE_BADGE: Record<string, BadgeVariant> = {
  application: "gold",
  verified: "info",
  submitted: "warning",
  approved: "success",
  disbursed: "success",
};

const PRODUCTS = [
  {
    type: "home",
    title: "Home loan",
    description: "Purchase, construction or plot funding with multi-lender comparison.",
    icon: Home,
    docs: ["PAN", "Aadhaar", "Payslips", "Bank statement"],
  },
  {
    type: "personal",
    title: "Personal loan",
    description: "Unsecured funding with salaried and self-employed pathways.",
    icon: Wallet,
    docs: ["PAN", "Aadhaar", "Income proof"],
  },
  {
    type: "business",
    title: "Business loan",
    description: "Working capital and expansion funding with GSTIN autofill.",
    icon: Briefcase,
    docs: ["GSTIN", "P&L", "ITR"],
  },
  {
    type: "mortgage",
    title: "Loan against property",
    description: "Unlock property equity while retaining ownership.",
    icon: Building2,
    docs: ["Title deed", "Valuation report", "ITR"],
  },
];

export function Loans() {
  const [principal, setPrincipal] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(240);

  const [income, setIncome] = useState(100000);
  const [obligations, setObligations] = useState(15000);
  const [age, setAge] = useState(32);
  const [employment, setEmployment] = useState<"salaried" | "self-employed">("salaried");
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [eligibilityBusy, setEligibilityBusy] = useState(false);

  const { data: emi, loading: emiLoading } = useAsync(
    () => calculateEmi(principal, rate, tenure),
    [principal, rate, tenure]
  );
  const { data: applications, loading: applicationsLoading } =
    useAsync(fetchLoanApplications);

  const runEligibility = async () => {
    setEligibilityBusy(true);
    try {
      const result = await estimateLoanEligibility(
        income,
        obligations,
        age,
        employment
      );
      setEligibility(result);
    } finally {
      setEligibilityBusy(false);
    }
  };

  const loans = applications ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
            Loans
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Plan your borrowing
          </h1>
          <p className="text-muted mt-1 max-w-2xl">
            Calculate EMIs, estimate eligibility and track every application from
            submission to disbursal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/loans/apply"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold transition-colors"
          >
            Apply for a loan
          </Link>
          <Link
            to="/loans/credit-health"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-border-subtle hover:border-gold/60 text-charcoal text-sm font-bold transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Check credit health
          </Link>
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <CalculatorPanel
          title="EMI calculator"
          description="Move the sliders to see the monthly outgo, total interest and total repayment."
          results={[
            {
              label: "Monthly EMI",
              value:
                emi && !emiLoading ? formatINR(emi.emi) : "—",
              emphasis: true,
            },
            {
              label: "Total interest",
              value:
                emi && !emiLoading ? formatINR(emi.totalInterest) : "—",
            },
            {
              label: "Total payable",
              value:
                emi && !emiLoading ? formatINR(emi.totalPayable) : "—",
              hint: "Indicative at the selected rate and tenure.",
            },
          ]}
          footer={
            <p className="text-[10px] text-ivory/50 leading-relaxed">
              Final rates depend on the lender, credit profile and property valuation.
            </p>
          }
        >
          <RangeField
            label="Loan amount"
            value={principal}
            min={100000}
            max={10000000}
            step={100000}
            onChange={setPrincipal}
            format={(value) => formatINR(value)}
          />
          <RangeField
            label="Interest rate (p.a.)"
            value={rate}
            min={6}
            max={16}
            step={0.1}
            onChange={setRate}
            format={(value) => `${value.toFixed(1)}%`}
          />
          <RangeField
            label="Tenure"
            value={tenure}
            min={12}
            max={360}
            step={12}
            onChange={setTenure}
            format={(value) => `${Math.round(value / 12)} yrs`}
          />
        </CalculatorPanel>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-charcoal tracking-tight">
              Eligibility estimator
            </h2>
            <p className="text-xs text-muted mt-0.5">
              A quick read on how much lenders may offer.
            </p>
          </div>

          <RangeField
            label="Monthly income"
            value={income}
            min={20000}
            max={500000}
            step={5000}
            onChange={setIncome}
            format={(value) => formatINR(value)}
          />
          <RangeField
            label="Existing EMIs / obligations"
            value={obligations}
            min={0}
            max={150000}
            step={5000}
            onChange={setObligations}
            format={(value) => formatINR(value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RangeField
              label="Age"
              value={age}
              min={21}
              max={60}
              onChange={setAge}
              format={(value) => `${value} yrs`}
            />
            <div>
              <p className="text-xs font-bold text-charcoal mb-1.5">Employment</p>
              <div className="grid grid-cols-2 gap-2">
                {(["salaried", "self-employed"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setEmployment(option)}
                    className={`rounded-lg border px-2 py-2 text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                      employment === option
                        ? "border-gold bg-gold-light/60 text-charcoal"
                        : "border-border-subtle bg-white text-muted hover:border-gold/60"
                    }`}
                  >
                    {option.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={runEligibility} disabled={eligibilityBusy}>
            {eligibilityBusy ? "Estimating..." : "Estimate eligibility"}
          </Button>

          {eligibility && (
            <div className="rounded-xl bg-ivory p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                You may be eligible for
              </p>
              <p className="text-2xl font-extrabold text-charcoal">
                {formatINR(eligibility.eligibleAmount)}
              </p>
              <p className="text-[11px] text-muted">
                Up to {Math.round(eligibility.maxTenureMonths / 12)} years · approx. EMI{" "}
                {formatINR(eligibility.estimatedEmi)}
              </p>
              <p className="text-[10px] text-muted-light leading-relaxed">
                {eligibility.note}
              </p>
            </div>
          )}
        </Card>

        <div className="space-y-3">
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <Link key={product.type} to={`/loans/apply?type=${product.type}`} className="block">
                <Card hoverable className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-charcoal">{product.title}</p>
                    <p className="text-[11px] text-muted leading-snug">
                      {product.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gold shrink-0" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
            My applications
          </h2>
          <Link
            to="/loans/apply"
            className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
          >
            New application
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applicationsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="p-5 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-full" />
              </Card>
            ))}
          </div>
        ) : loans.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <Coins className="w-8 h-8 text-gold mx-auto" />
            <p className="text-sm font-bold text-charcoal">No applications yet</p>
            <p className="text-xs text-muted">
              Start an application and we'll track every stage for you.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loans.map((loan) => {
              const index = STAGES.findIndex((stage) => stage.id === loan.status);
              const progress = index < 0 ? 0 : ((index + 1) / STAGES.length) * 100;
              return (
                <Link key={loan.id} to={`/loans/applications/${loan.id}`} className="block">
                  <Card hoverable className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-extrabold text-charcoal">
                          {loan.loanType} loan
                        </p>
                        <p className="text-xs text-muted">
                          {formatINR(loan.amount)} · {loan.bank ?? "Lender matching"}
                        </p>
                      </div>
                      <Badge variant={STAGE_BADGE[loan.status] ?? "neutral"}>
                        {STAGES.find((stage) => stage.id === loan.status)?.label ??
                          loan.status}
                      </Badge>
                    </div>
                    <div className="h-1.5 rounded-full bg-ivory-dark overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-gold"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-light">
                      Started {formatDate(loan.createdAt)}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Card className="p-4 bg-ivory/60">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted leading-relaxed">
            <span className="font-bold text-charcoal">{COMPLIANCE.rbi.label}.</span>{" "}
            {COMPLIANCE.rbi.note} {COMPLIANCE.dpdp.note}
          </p>
        </div>
      </Card>
    </div>
  );
}
