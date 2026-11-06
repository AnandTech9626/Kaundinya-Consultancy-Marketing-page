import { useEffect, useMemo, useState } from "react";
import { Calculator, X } from "lucide-react";
import {
  Button,
  CalculatorPanel,
  RangeField,
} from "@kaundinya/ui";
import { formatINR } from "../lib/formats";

interface LifeCoverCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  onRequestReview: (summary: string) => void;
}

const DEFAULTS = {
  age: 32,
  income: 1200000,
  dependents: 2,
  liabilities: 1500000,
  smoker: false,
};

function estimateLifeCover(
  annualIncome: number,
  dependents: number,
  liabilities: number,
  age: number,
  smoker: boolean
) {
  const raw = Math.max(
    annualIncome * 10 + liabilities + dependents * 500000,
    1000000
  );
  const coverage = Math.round(raw / 100000) * 100000;
  let rate = 0.0035 + Math.max(age - 30, 0) * 0.00008;
  if (smoker) rate *= 1.25;
  const premium = Math.round((coverage * rate) / 100) * 100;
  return { coverage, premium };
}

export function LifeCoverCalculatorDialog({
  open,
  onClose,
  onRequestReview,
}: LifeCoverCalculatorDialogProps) {
  const [age, setAge] = useState(DEFAULTS.age);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [dependents, setDependents] = useState(DEFAULTS.dependents);
  const [liabilities, setLiabilities] = useState(DEFAULTS.liabilities);
  const [smoker, setSmoker] = useState(DEFAULTS.smoker);

  useEffect(() => {
    if (!open) return;
    setAge(DEFAULTS.age);
    setIncome(DEFAULTS.income);
    setDependents(DEFAULTS.dependents);
    setLiabilities(DEFAULTS.liabilities);
    setSmoker(DEFAULTS.smoker);
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

  const estimate = useMemo(
    () => estimateLifeCover(income, dependents, liabilities, age, smoker),
    [income, dependents, liabilities, age, smoker]
  );

  if (!open) return null;

  const summary = `Life cover estimate: ${formatINR(
    estimate.coverage
  )} recommended; indicative premium ${formatINR(
    estimate.premium
  )}/year; age ${age}, annual income ${formatINR(
    income
  )}, dependents ${dependents}, outstanding liabilities ${formatINR(
    liabilities
  )}, tobacco use: ${smoker ? "yes" : "no"}.`;

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
        aria-label="Life cover needs analysis"
        className="relative w-full sm:max-w-4xl bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                Life cover needs analysis
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                A starting point, not a sales number. We review the result with
                you before recommending anything.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            className="shrink-0 rounded-lg border border-border p-2 text-foreground hover:border-brand/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <CalculatorPanel
            title="Estimate your cover"
            description="Move the sliders to see a recommended cover and indicative premium."
            results={[
              {
                label: "Recommended cover",
                value: formatINR(estimate.coverage),
                emphasis: true,
              },
              {
                label: "Indicative annual premium",
                value: formatINR(estimate.premium),
                hint: "10x income + liabilities + Rs 5L per dependent, adjusted for age and tobacco use.",
              },
            ]}
          >
            <RangeField
              label="Your age"
              value={age}
              min={18}
              max={65}
              onChange={setAge}
              format={(value) => `${value} yrs`}
            />
            <RangeField
              label="Annual income"
              value={income}
              min={300000}
              max={5000000}
              step={100000}
              onChange={setIncome}
              format={(value) => formatINR(value)}
            />
            <RangeField
              label="Dependents"
              value={dependents}
              min={0}
              max={6}
              onChange={setDependents}
              format={(value) => String(value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <RangeField
                label="Outstanding liabilities"
                value={liabilities}
                min={0}
                max={10000000}
                step={100000}
                onChange={setLiabilities}
                format={(value) => formatINR(value)}
              />
              <label className="flex items-center gap-2 text-xs text-foreground-soft cursor-pointer pb-1">
                <input
                  type="checkbox"
                  checked={smoker}
                  onChange={(event) => setSmoker(event.target.checked)}
                  className="w-4 h-4 accent-brand"
                />
                I smoke / use tobacco
              </label>
            </div>
          </CalculatorPanel>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border pt-4">
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
