import { useEffect, useMemo, useState } from "react";
import { Calculator, X } from "lucide-react";
import {
  Button,
  CalculatorPanel,
  RangeField,
} from "@kaundinya/ui";
import { formatINR } from "../lib/formats";

type ToolMode = "emi" | "eligibility";

interface LoanToolsDialogProps {
  open: boolean;
  onClose: () => void;
  onRequestReview: (summary: string) => void;
}

const DEFAULTS = {
  principal: 3000000,
  rate: 8.5,
  tenure: 240,
  income: 100000,
  obligations: 15000,
  age: 32,
  employment: "salaried" as "salaried" | "self-employed",
};

export function LoanToolsDialog({
  open,
  onClose,
  onRequestReview,
}: LoanToolsDialogProps) {
  const [mode, setMode] = useState<ToolMode>("emi");
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [tenure, setTenure] = useState(DEFAULTS.tenure);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [obligations, setObligations] = useState(DEFAULTS.obligations);
  const [age, setAge] = useState(DEFAULTS.age);
  const [employment, setEmployment] = useState(DEFAULTS.employment);

  useEffect(() => {
    if (!open) return;
    setMode("emi");
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setTenure(DEFAULTS.tenure);
    setIncome(DEFAULTS.income);
    setObligations(DEFAULTS.obligations);
    setAge(DEFAULTS.age);
    setEmployment(DEFAULTS.employment);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const emi = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, tenure);
    const monthly =
      monthlyRate === 0
        ? principal / tenure
        : (principal * monthlyRate * factor) / (factor - 1);
    const totalPayable = monthly * tenure;
    return {
      monthly,
      totalInterest: totalPayable - principal,
      totalPayable,
    };
  }, [principal, rate, tenure]);

  const eligibility = useMemo(() => {
    const monthlyRate = 9 / 12 / 100;
    const months = 240;
    const capacity = Math.max(income * 0.5 - obligations, 0);
    const factor = Math.pow(1 + monthlyRate, months);
    const loanFactor = (factor - 1) / (monthlyRate * factor);
    const amount = Math.round((capacity * loanFactor) / 10000) * 10000;
    return {
      amount,
      emi: Math.round(capacity),
      months,
      note:
        employment === "self-employed"
          ? "Self-employed eligibility also depends on ITR continuity and business vintage."
          : "Salaried eligibility also depends on employer category and salary credit history.",
    };
  }, [income, obligations, employment]);

  if (!open) return null;

  const summary =
    mode === "emi"
      ? `Loan EMI estimate: ${formatINR(
          Math.round(emi.monthly)
        )}/month; amount ${formatINR(principal)}, rate ${rate.toFixed(
          1
        )}% p.a., tenure ${Math.round(
          tenure / 12
        )} years; total interest ${formatINR(
          Math.round(emi.totalInterest)
        )}.`
      : `Loan eligibility estimate: up to ${formatINR(
          eligibility.amount
        )}; monthly income ${formatINR(
          income
        )}, existing obligations ${formatINR(
          obligations
        )}, age ${age}, employment ${employment}; indicative EMI ${formatINR(
          eligibility.emi
        )}.`;

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-inverse/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Loan tools"
        className="relative w-full sm:max-w-4xl bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                Loan planning tools
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                Estimates only. We review affordability and lender options with
                you before anything is submitted.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close loan tools"
            className="shrink-0 rounded-lg border border-border p-2 text-foreground hover:border-brand/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex rounded-lg border border-border bg-surface p-1 max-w-md">
            {(
              [
                ["emi", "EMI calculator"],
                ["eligibility", "Eligibility"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  mode === value
                    ? "bg-inverse text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "emi" ? (
            <CalculatorPanel
              title="EMI calculator"
              description="Move the sliders to see the monthly outgo, total interest and total repayment."
              results={[
                {
                  label: "Monthly EMI",
                  value: formatINR(Math.round(emi.monthly)),
                  emphasis: true,
                },
                {
                  label: "Total interest",
                  value: formatINR(Math.round(emi.totalInterest)),
                },
                {
                  label: "Total payable",
                  value: formatINR(Math.round(emi.totalPayable)),
                  hint: "Indicative at the selected rate and tenure.",
                },
              ]}
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
          ) : (
            <CalculatorPanel
              title="Eligibility estimator"
              description="A quick read on how much lenders may offer based on income and existing obligations."
              results={[
                {
                  label: "Eligible amount",
                  value: formatINR(eligibility.amount),
                  emphasis: true,
                },
                {
                  label: "Indicative EMI",
                  value: formatINR(eligibility.emi),
                },
                {
                  label: "Max tenure",
                  value: `${Math.round(eligibility.months / 12)} years`,
                  hint: eligibility.note,
                },
              ]}
            >
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
                  <p className="text-xs font-bold text-foreground mb-1.5">
                    Employment
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["salaried", "self-employed"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setEmployment(option)}
                        className={`rounded-lg border px-2 py-2 text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                          employment === option
                            ? "border-brand bg-brand-soft/60 text-foreground"
                            : "border-border bg-surface text-muted-foreground hover:border-brand/60"
                        }`}
                      >
                        {option.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CalculatorPanel>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onRequestReview(summary)}>
              Review this with a consultant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
