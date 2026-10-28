import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
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
import type {
  InsuranceEstimate,
  InsurancePlan,
  InsuranceType,
} from "@kaundinya/config";
import { COMPLIANCE } from "@kaundinya/config";
import {
  createRequest,
  estimateInsuranceNeeds,
  fetchInsurancePlans,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatINR } from "../lib/formats";

const TYPES: { id: InsuranceType | "all"; label: string }[] = [
  { id: "all", label: "All plans" },
  { id: "life", label: "Life & Term" },
  { id: "health", label: "Health" },
  { id: "motor", label: "Motor" },
  { id: "property", label: "Property" },
];

const TYPE_BADGE: Record<InsuranceType, BadgeVariant> = {
  life: "info",
  health: "success",
  motor: "warning",
  property: "neutral",
};

const TYPE_LABEL: Record<InsuranceType, string> = {
  life: "Life & Term",
  health: "Health",
  motor: "Motor",
  property: "Property",
};

export function Insurance() {
  const [type, setType] = useState<InsuranceType | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [age, setAge] = useState(32);
  const [income, setIncome] = useState(1200000);
  const [dependents, setDependents] = useState(2);
  const [liabilities, setLiabilities] = useState(1500000);
  const [smoker, setSmoker] = useState(false);
  const [estimate, setEstimate] = useState<InsuranceEstimate | null>(null);
  const [estimateBusy, setEstimateBusy] = useState(false);
  const [requested, setRequested] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAsync(fetchInsurancePlans);
  const plans = data ?? [];

  const filtered = useMemo(
    () => (type === "all" ? plans : plans.filter((plan) => plan.type === type)),
    [plans, type]
  );

  const selectedPlans = plans.filter((plan) => selected.includes(plan.id));

  const toggleCompare = (plan: InsurancePlan) => {
    if (selected.includes(plan.id)) {
      setSelected(selected.filter((id) => id !== plan.id));
      return;
    }
    if (selected.length >= 3) return;
    setSelected([...selected, plan.id]);
  };

  const runEstimate = async () => {
    setEstimateBusy(true);
    try {
      const result = await estimateInsuranceNeeds({
        type: "life",
        age,
        annualIncome: income,
        dependents,
        smoker,
        liabilities,
      });
      setEstimate(result);
    } finally {
      setEstimateBusy(false);
    }
  };

  const scheduleConsultation = async (plan: InsurancePlan) => {
    setRequesting(plan.id);
    try {
      await createRequest({
        serviceCategory: "Insurance",
        specificService: `${plan.insurer} · ${plan.name}`,
        comments: "Consultation requested from the insurance hub.",
      });
      setRequested(`${plan.insurer} ${plan.name}`);
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
            Insurance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Protect what matters
          </h1>
          <p className="text-muted mt-1 max-w-2xl">
            Independent guidance for life, health, motor and property cover. We compare
            and explain — we never push a "buy now".
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/insurance/health"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold transition-colors"
          >
            <HeartPulse className="w-4 h-4" />
            Health plans
          </Link>
          <Link
            to="/insurance/motor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-border-subtle hover:border-gold/60 text-charcoal text-sm font-bold transition-colors"
          >
            Motor insurance
          </Link>
          <Link
            to="/insurance/policies"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-border-subtle hover:border-gold/60 text-charcoal text-sm font-bold transition-colors"
          >
            Policy vault
          </Link>
        </div>
      </div>

      {requested && (
        <Card className="p-4 border-emerald-200 bg-emerald-50 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700">
            Consultation requested for <span className="font-bold">{requested}</span>. An
            advisor will call you to walk through the options.
          </p>
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        <CalculatorPanel
          title="Needs analysis calculator"
          description="Estimate how much life cover makes sense before you compare premiums."
          results={
            estimate
              ? [
                  {
                    label: "Recommended cover",
                    value: formatINR(estimate.recommendedCoverage),
                    emphasis: true,
                  },
                  {
                    label: "Indicative annual premium",
                    value: formatINR(estimate.estimatedPremium),
                    hint: estimate.basis,
                  },
                ]
              : [
                  { label: "Recommended cover", value: "—", emphasis: true },
                  {
                    label: "Indicative annual premium",
                    value: "—",
                    hint: "Fill the inputs and calculate.",
                  },
                ]
          }
          footer={
            <Button
              variant="primary"
              onClick={runEstimate}
              disabled={estimateBusy}
              className="w-full"
            >
              {estimateBusy ? "Calculating..." : "Calculate cover"}
            </Button>
          }
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
            <label className="flex items-center gap-2 text-xs text-charcoal-light cursor-pointer pb-1">
              <input
                type="checkbox"
                checked={smoker}
                onChange={(event) => setSmoker(event.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              I smoke / use tobacco
            </label>
          </div>
        </CalculatorPanel>
      </Card>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setType(option.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              type === option.id
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal border border-border-subtle hover:border-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load insurance plans.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-5 space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((plan) => {
            const isSelected = selected.includes(plan.id);
            const disabled = !isSelected && selected.length >= 3;
            return (
              <Card key={plan.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      {plan.insurer}
                    </p>
                    <h3 className="text-sm font-extrabold text-charcoal mt-0.5">
                      {plan.name}
                    </h3>
                  </div>
                  <Badge variant={TYPE_BADGE[plan.type]}>
                    {TYPE_LABEL[plan.type]}
                  </Badge>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                      Cover
                    </p>
                    <p className="text-lg font-extrabold text-charcoal">
                      {formatINR(plan.sumInsured)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                      Premium
                    </p>
                    <p className="text-sm font-extrabold text-charcoal">
                      {formatINR(plan.premium)}
                      <span className="text-[10px] font-medium text-muted">
                        /{plan.tenureYears === 1 ? "yr" : `${plan.tenureYears}y`}
                      </span>
                    </p>
                  </div>
                </div>

                <ul className="space-y-1">
                  {plan.features.slice(0, 3).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-1.5 text-[11px] text-charcoal-light"
                    >
                      <CheckCircle2 className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-2 space-y-2">
                  <label
                    className={`flex items-center gap-2 text-[11px] font-semibold cursor-pointer ${
                      disabled ? "text-muted-light" : "text-charcoal-light"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => toggleCompare(plan)}
                      className="w-3.5 h-3.5 accent-gold"
                    />
                    Add to compare
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => scheduleConsultation(plan)}
                    disabled={requesting === plan.id}
                  >
                    {requesting === plan.id ? "Requesting..." : "Schedule consultation"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedPlans.length >= 2 && (
        <Card className="p-5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-extrabold text-charcoal tracking-tight">
              Compare plans
            </h2>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-[11px] font-bold text-muted hover:text-charcoal cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ivory text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-3 py-2">Feature</th>
                  {selectedPlans.map((plan) => (
                    <th key={plan.id} className="px-3 py-2 min-w-[10rem]">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Insurer",
                    value: (plan: InsurancePlan) => plan.insurer,
                  },
                  {
                    label: "Cover",
                    value: (plan: InsurancePlan) => formatINR(plan.sumInsured),
                  },
                  {
                    label: "Premium",
                    value: (plan: InsurancePlan) => formatINR(plan.premium),
                  },
                  {
                    label: "Tenure",
                    value: (plan: InsurancePlan) =>
                      plan.tenureYears === 1 ? "1 year" : `${plan.tenureYears} years`,
                  },
                  {
                    label: "Cashless network",
                    value: (plan: InsurancePlan) =>
                      plan.cashlessNetwork
                        ? `${plan.cashlessNetwork.toLocaleString("en-IN")} hospitals`
                        : "—",
                  },
                  {
                    label: "Key features",
                    value: (plan: InsurancePlan) => plan.features.join(", "),
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-border-subtle">
                    <td className="px-3 py-2.5 text-[11px] font-bold text-muted whitespace-nowrap">
                      {row.label}
                    </td>
                    {selectedPlans.map((plan) => (
                      <td
                        key={plan.id}
                        className="px-3 py-2.5 text-xs text-charcoal-light align-top"
                      >
                        {row.value(plan)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-charcoal">Policy Vault</p>
              <p className="text-[11px] text-muted">Renewals and downloads in one place.</p>
            </div>
          </div>
          <Link
            to="/insurance/policies"
            className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
          >
            Open
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
        <Card className="p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-charcoal">Motor fast lane</p>
              <p className="text-[11px] text-muted">Registration → quote → policy PDF.</p>
            </div>
          </div>
          <Link
            to="/insurance/motor"
            className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
          >
            Start
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      <Card className="p-4 bg-ivory/60">
        <p className="text-[11px] font-bold text-charcoal">
          {COMPLIANCE.irdai.label}: {COMPLIANCE.irdai.value}
        </p>
        <p className="text-[11px] text-muted leading-relaxed mt-1">
          {COMPLIANCE.irdai.note} {COMPLIANCE.dpdp.note}
        </p>
      </Card>
    </div>
  );
}
