import { Fragment, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Landmark,
  MessageSquare,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  convertAdminLoanRequirement,
  createAdminLoanPlan,
  deleteAdminLoanPlan,
  downloadLoanRequirementsCsv,
  fetchAdminLoanConsultations,
  fetchAdminLoanPlans,
  fetchAdminLoanRequirements,
  fetchLoanRequirementBanks,
  updateAdminLoanPlan,
  updateAdminServiceRequest,
  type AdminLoanPlan,
  type AdminLoanPlanInput,
  type AdminLoanRequirement,
  type AdminServiceRequest,
  type AdminServiceRequestStatus,
  type IncomeSource,
  type LoanRequirementFilters,
  type LoanType,
} from "../lib/api";
import { formatDateTime, formatINR } from "../lib/format";
import { showToast } from "../lib/toast";
import {
  ConfirmDialog,
  SheetShell,
  inputClass,
  labelClass,
} from "../components/AdminUi";
import { BankLogo } from "../components/BankLogo";
import {
  SkeletonKpis,
  SkeletonList,
  SkeletonTable,
} from "../components/Skeleton";
import {
  INCOME_SOURCE_LABELS,
  LOAN_TYPES,
  LOAN_TYPE_CONSULTATION_LABELS,
  LOAN_TYPE_LABELS,
  SERVICE_REQUEST_STATUSES,
} from "../lib/constants";

type Tab = "plans" | "checks" | "consultations";

const TABS: Array<{ id: Tab; label: string; icon: typeof Wallet }> = [
  { id: "plans", label: "Bank Plans", icon: Landmark },
  { id: "checks", label: "Eligibility Checks", icon: ClipboardList },
  { id: "consultations", label: "Consultation Requests", icon: MessageSquare },
];

const CONSULT_PAGE_SIZE = 10;

function rateLabel(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

function activeBadge(active: boolean) {
  return active
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

function PlanSheet({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminLoanPlan | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const current = plan === "new" ? null : plan;
  const [bank, setBank] = useState(current?.bank ?? "");
  const [product, setProduct] = useState(current?.product ?? "");
  const [loanType, setLoanType] = useState<LoanType>(
    current?.loanType ?? "Home",
  );
  const [salaried, setSalaried] = useState(
    current ? current.employmentTypes.includes("salaried") : true,
  );
  const [business, setBusiness] = useState(
    current ? current.employmentTypes.includes("business") : true,
  );
  const [minMonthlyIncome, setMinMonthlyIncome] = useState(
    current ? String(current.minMonthlyIncome) : "0",
  );
  const [annualRate, setAnnualRate] = useState(
    current ? String(current.annualRate) : "8.5",
  );
  const [maxTenureMonths, setMaxTenureMonths] = useState(
    current ? String(current.maxTenureMonths) : "240",
  );
  const [minAmount, setMinAmount] = useState(
    current ? String(current.minAmount) : "100000",
  );
  const [maxAmount, setMaxAmount] = useState(
    current ? String(current.maxAmount) : "5000000",
  );
  const [active, setActive] = useState(current?.active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const employmentTypes: IncomeSource[] = [];
    if (salaried) employmentTypes.push("salaried");
    if (business) employmentTypes.push("business");

    if (!bank.trim() || !product.trim()) {
      setError("Bank and product name are required.");
      return;
    }
    if (employmentTypes.length === 0) {
      setError("Select at least one income source.");
      return;
    }

    const numeric = {
      minMonthlyIncome: Number(minMonthlyIncome || 0),
      annualRate: Number(annualRate),
      maxTenureMonths: Number(maxTenureMonths),
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
    };
    if (
      !Number.isFinite(numeric.annualRate) ||
      numeric.annualRate <= 0 ||
      !Number.isFinite(numeric.minMonthlyIncome) ||
      !Number.isFinite(numeric.maxTenureMonths) ||
      !Number.isFinite(numeric.minAmount) ||
      !Number.isFinite(numeric.maxAmount)
    ) {
      setError("Enter valid numbers for income, rate, tenure and amounts.");
      return;
    }
    if (numeric.maxAmount < numeric.minAmount) {
      setError("Maximum amount cannot be less than the minimum amount.");
      return;
    }

    const payload: AdminLoanPlanInput = {
      bank: bank.trim(),
      product: product.trim(),
      loanType,
      employmentTypes,
      minMonthlyIncome: numeric.minMonthlyIncome,
      annualRate: numeric.annualRate,
      maxTenureMonths: numeric.maxTenureMonths,
      minAmount: numeric.minAmount,
      maxAmount: numeric.maxAmount,
      active,
    };

    setBusy(true);
    try {
      if (current) {
        await updateAdminLoanPlan(current.id, payload);
        showToast("Plan updated.");
      } else {
        await createAdminLoanPlan(payload);
        showToast("Plan added.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save plan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Loan plan"
      title={current ? "Edit bank plan" : "Add bank plan"}
      subtitle="These plans are the only source for client recommendations."
      onClose={onClose}
    >
      <div>
        <label className={labelClass}>Bank</label>
        <input
          className={inputClass}
          value={bank}
          onChange={(event) => setBank(event.target.value)}
          placeholder="e.g. SBI"
        />
        <p className="mt-1 text-[11px] text-muted">
          The logo is attached automatically for recognised banks (SBI, HDFC,
          ICICI, Axis, Canara, PNB, BoB, IDFC First, YES, Bajaj).
        </p>
      </div>
      <div>
        <label className={labelClass}>Product name</label>
        <input
          className={inputClass}
          value={product}
          onChange={(event) => setProduct(event.target.value)}
          placeholder="e.g. SBI Home Loan"
        />
      </div>
      <div>
        <label className={labelClass}>Loan type</label>
        <select
          className={inputClass}
          value={loanType}
          onChange={(event) => setLoanType(event.target.value as LoanType)}
        >
          {LOAN_TYPES.map((type) => (
            <option key={type} value={type}>
              {LOAN_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Income sources accepted</label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={salaried}
              onChange={(event) => setSalaried(event.target.checked)}
            />
            Salaried
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={business}
              onChange={(event) => setBusiness(event.target.checked)}
            />
            Business
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Min monthly income (â‚¹)</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={minMonthlyIncome}
            onChange={(event) => setMinMonthlyIncome(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Interest rate (% p.a.)</label>
          <input
            className={inputClass}
            inputMode="decimal"
            value={annualRate}
            onChange={(event) => setAnnualRate(event.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Max tenure (months)</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={maxTenureMonths}
            onChange={(event) => setMaxTenureMonths(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Min amount (â‚¹)</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Max amount (â‚¹)</label>
        <input
          className={inputClass}
          inputMode="numeric"
          value={maxAmount}
          onChange={(event) => setMaxAmount(event.target.value)}
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        Show this plan to clients
      </label>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : current ? "Save changes" : "Add plan"}
        </button>
      </div>
    </SheetShell>
  );
}

function RateSheet({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminLoanPlan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [annualRate, setAnnualRate] = useState(String(plan.annualRate));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const rate = Number(annualRate);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 50) {
      setError("Enter a rate between 0 and 50 percent.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateAdminLoanPlan(plan.id, { annualRate: rate });
      showToast(`Rate updated to ${rate.toFixed(2)}%.`);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update rate.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Daily rate update"
      title={`${plan.bank} Â· ${plan.product}`}
      subtitle="Clients see the new rate on their next eligibility check."
      onClose={onClose}
    >
      <div>
        <label className={labelClass}>Interest rate (% p.a.)</label>
        <input
          className={inputClass}
          inputMode="decimal"
          value={annualRate}
          onChange={(event) => setAnnualRate(event.target.value)}
          autoFocus
        />
        <p className="mt-1 text-[11px] text-muted">
          Current: {rateLabel(plan.annualRate)}
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Update rate"}
        </button>
      </div>
    </SheetShell>
  );
}

export function LoansAdmin() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const requestedQuery = searchParams.get("q");
  const focusRequestId = searchParams.get("focus");

  const [tab, setTab] = useState<Tab>("plans");
  const [plans, setPlans] = useState<AdminLoanPlan[]>([]);
  const [checks, setChecks] = useState<AdminLoanRequirement[]>([]);
  const [consultations, setConsultations] = useState<AdminServiceRequest[]>([]);
  const [consultationTotal, setConsultationTotal] = useState(0);
  const [consultationPage, setConsultationPage] = useState(1);
  const [banks, setBanks] = useState<string[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingChecks, setLoadingChecks] = useState(true);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [planSearch, setPlanSearch] = useState("");
  const [appliedPlanSearch, setAppliedPlanSearch] = useState("");
  const [planStatus, setPlanStatus] = useState("");

  const [checkSearch, setCheckSearch] = useState("");
  const [checkBank, setCheckBank] = useState("");
  const [checkFilters, setCheckFilters] = useState<LoanRequirementFilters>({});

  const [requestSearch, setRequestSearch] = useState("");
  const [appliedRequestSearch, setAppliedRequestSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  const [editingPlan, setEditingPlan] = useState<AdminLoanPlan | "new" | null>(
    null,
  );
  const [rateTarget, setRateTarget] = useState<AdminLoanPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLoanPlan | null>(null);
  const [convertTarget, setConvertTarget] =
    useState<AdminLoanRequirement | null>(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingRequest, setUpdatingRequest] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{
    request: AdminServiceRequest;
    status: AdminServiceRequestStatus;
  } | null>(null);

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    setError(null);
    try {
      setPlans(
        await fetchAdminLoanPlans({
          q: appliedPlanSearch,
          active:
            planStatus === "active"
              ? true
              : planStatus === "hidden"
                ? false
                : undefined,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load plans.");
    } finally {
      setLoadingPlans(false);
    }
  }, [appliedPlanSearch, planStatus]);

  const loadChecks = useCallback(async () => {
    setLoadingChecks(true);
    setError(null);
    try {
      setChecks(await fetchAdminLoanRequirements(checkFilters));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load eligibility checks.",
      );
    } finally {
      setLoadingChecks(false);
    }
  }, [checkFilters]);

  const loadConsultations = useCallback(async () => {
    setLoadingConsultations(true);
    setError(null);
    try {
      const page = await fetchAdminLoanConsultations({
        page: consultationPage,
        pageSize: CONSULT_PAGE_SIZE,
        q: appliedRequestSearch,
        status: requestStatus,
      });
      setConsultations(page.items);
      setConsultationTotal(page.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load consultation requests.",
      );
    } finally {
      setLoadingConsultations(false);
    }
  }, [appliedRequestSearch, requestStatus, consultationPage]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    void loadChecks();
  }, [loadChecks]);

  useEffect(() => {
    void loadConsultations();
  }, [loadConsultations]);

  useEffect(() => {
    if (requestedTab === "checks") setTab("checks");
    else if (requestedTab === "consultations") setTab("consultations");
    if (requestedQuery) {
      setRequestSearch(requestedQuery);
      setAppliedRequestSearch(requestedQuery);
      setConsultationPage(1);
    }
    if (focusRequestId) setExpandedId(focusRequestId);
  }, [requestedTab, requestedQuery, focusRequestId]);

  useEffect(() => {
    if (!focusRequestId) return;
    const element = document.getElementById(`consult-${focusRequestId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusRequestId, consultations]);

  useEffect(() => {
    fetchLoanRequirementBanks()
      .then(setBanks)
      .catch(() => setBanks([]));
  }, []);

  const reloadAll = async () => {
    await Promise.all([loadPlans(), loadChecks(), loadConsultations()]);
  };

  const togglePlan = async (plan: AdminLoanPlan) => {
    try {
      await updateAdminLoanPlan(plan.id, { active: !plan.active });
      showToast(plan.active ? "Plan hidden from clients." : "Plan is live.");
      await reloadAll();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update plan.",
        "error",
      );
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteAdminLoanPlan(deleteTarget.id);
      showToast("Plan deleted.");
      setDeleteTarget(null);
      await reloadAll();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete plan.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const onConvert = async () => {
    if (!convertTarget) return;
    setBusy(true);
    try {
      await convertAdminLoanRequirement(convertTarget.id);
      showToast("Moved to consultation requests as In progress.");
      setConvertTarget(null);
      await Promise.all([loadChecks(), loadConsultations()]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not move this check.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      await downloadLoanRequirementsCsv(checkFilters);
      showToast("Export downloaded.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not export checks.",
        "error",
      );
    } finally {
      setExporting(false);
    }
  };

  const applyRequestStatus = async (
    request: AdminServiceRequest,
    status: AdminServiceRequestStatus,
  ) => {
    setStatusConfirm(null);
    setUpdatingRequest(request.id);
    try {
      await updateAdminServiceRequest(request.id, { status });
      showToast(
        `Request marked ${SERVICE_REQUEST_STATUSES.find((s) => s.value === status)?.label ?? status}. Client notified.`,
      );
      await loadConsultations();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update request.",
        "error",
      );
    } finally {
      setUpdatingRequest(null);
    }
  };

  const requestStatusChange = (
    request: AdminServiceRequest,
    status: AdminServiceRequestStatus,
  ) => {
    if (status === request.status) return;
    if (status === "completed" || status === "cancelled") {
      setStatusConfirm({ request, status });
      return;
    }
    void applyRequestStatus(request, status);
  };

  const activePlans = plans.filter((plan) => plan.active);

  const totalPages = Math.max(
    1,
    Math.ceil(consultationTotal / CONSULT_PAGE_SIZE),
  );
  const pageStart =
    consultationTotal === 0
      ? 0
      : (consultationPage - 1) * CONSULT_PAGE_SIZE + 1;
  const pageEnd = Math.min(
    consultationPage * CONSULT_PAGE_SIZE,
    consultationTotal,
  );
  const pageNumbers = (() => {
    const start = Math.max(
      1,
      Math.min(consultationPage - 2, totalPages - 4),
    );
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  })();

  const kpis = [
    { label: "Total plans", value: String(plans.length) },
    { label: "Live for clients", value: String(activePlans.length) },
    { label: "Checks (24h)", value: String(checks.length) },
    { label: "Consultation requests", value: String(consultationTotal) },
  ];

  const kpisLoading =
    loadingPlans || loadingChecks || loadingConsultations;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Loans
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-charcoal">
            Plans, eligibility checks & consultations
          </h1>
        </div>
        {tab === "plans" && (
          <button
            type="button"
            onClick={() => setEditingPlan("new")}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover"
          >
            <Plus className="h-4 w-4" />
            Add plan
          </button>
        )}
        {tab === "checks" && (
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export Excel (CSV)"}
          </button>
        )}
      </div>

      {kpisLoading ? (
        <SkeletonKpis count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-border-subtle bg-white p-4"
            >
              <p className="text-xl font-extrabold tracking-tight text-charcoal">
                {kpi.value}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-muted">
                {kpi.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1 rounded-2xl border border-border-subtle bg-white p-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              tab === id
                ? "bg-gold text-charcoal"
                : "text-charcoal hover:bg-ivory"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {tab === "plans" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setAppliedPlanSearch(planSearch);
              }}
              className="flex flex-1 gap-2"
            >
              <input
                className={`${inputClass} max-w-xs`}
                value={planSearch}
                onChange={(event) => setPlanSearch(event.target.value)}
                placeholder="Search bank or product"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
            <select
              className={`${inputClass} max-w-[12rem]`}
              value={planStatus}
              onChange={(event) => setPlanStatus(event.target.value)}
            >
              <option value="">All plans</option>
              <option value="active">Live only</option>
              <option value="hidden">Hidden only</option>
            </select>
            <button
              type="button"
              onClick={() => void loadPlans()}
              aria-label="Refresh plans"
              className="rounded-lg border border-border-subtle bg-white p-2 text-charcoal hover:border-gold/60"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loadingPlans ? (
            <SkeletonList rows={4} />
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-subtle bg-white p-8 text-center">
              <p className="text-sm font-bold text-charcoal">
                No bank plans yet
              </p>
              <p className="mt-1 text-xs text-muted">
                Add the first plan. Clients will only see plans you add and keep
                live.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-white p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <BankLogo bank={plan.bank} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                          {LOAN_TYPE_LABELS[plan.loanType]}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${activeBadge(plan.active)}`}
                        >
                          {plan.active ? "Live" : "Hidden"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                          {plan.employmentTypes
                            .map((type) => INCOME_SOURCE_LABELS[type])
                            .join(" Â· ")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-charcoal">
                        {plan.bank} Â· {plan.product}
                      </p>
                      <p className="text-[11px] text-muted">
                        {rateLabel(plan.annualRate)} p.a. Â· up to{" "}
                        {plan.maxTenureMonths / 12} yrs Â·{" "}
                        {formatINR(plan.minAmount)} â€“ {formatINR(plan.maxAmount)}
                      </p>
                      <p className="text-[10px] text-muted-light">
                        Min income {formatINR(plan.minMonthlyIncome)}/mo Â·
                        Updated {formatDateTime(plan.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRateTarget(plan)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60"
                    >
                      <Percent className="h-3.5 w-3.5" />
                      Rate
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePlan(plan)}
                      className="rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60"
                    >
                      {plan.active ? "Hide" : "Make live"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPlan(plan)}
                      aria-label="Edit plan"
                      className="rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(plan)}
                      aria-label="Delete plan"
                      className="rounded-lg border border-border-subtle p-2 text-rose-600 hover:border-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : tab === "checks" ? (
        <>
          <p className="text-[11px] text-muted">
            Eligibility checks expire after 24 hours. When a client is
            convinced, move the check to Consultation Requests.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setCheckFilters({
                  q: checkSearch.trim() || undefined,
                  bank: checkBank || undefined,
                });
              }}
              className="flex flex-1 flex-wrap items-end gap-2"
            >
              <div className="flex-1">
                <label className={labelClass}>Search client or mobile</label>
                <input
                  className={inputClass}
                  value={checkSearch}
                  onChange={(event) => setCheckSearch(event.target.value)}
                  placeholder="Name or 10-digit mobile"
                />
              </div>
              <div>
                <label className={labelClass}>Top bank</label>
                <select
                  className={inputClass}
                  value={checkBank}
                  onChange={(event) => setCheckBank(event.target.value)}
                >
                  <option value="">All banks</option>
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
              >
                <Search className="h-4 w-4" />
                Apply
              </button>
            </form>
            <button
              type="button"
              onClick={() => void loadChecks()}
              aria-label="Refresh checks"
              className="rounded-lg border border-border-subtle bg-white p-2 text-charcoal hover:border-gold/60"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loadingChecks ? (
            <SkeletonTable rows={8} columns={11} />
          ) : checks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-subtle bg-white p-8 text-center">
              <p className="text-sm font-bold text-charcoal">
                No eligibility checks in the last 24 hours
              </p>
              <p className="mt-1 text-xs text-muted">
                New checks appear here as soon as clients use the eligibility
                form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-white">
              <table className="w-full min-w-[1000px] text-left text-xs">
                <thead className="bg-ivory text-[10px] font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-3 py-2">Checked</th>
                    <th className="px-3 py-2">Client</th>
                    <th className="px-3 py-2">Mobile</th>
                    <th className="px-3 py-2">Requirement</th>
                    <th className="px-3 py-2 text-right">Eligible</th>
                    <th className="px-3 py-2 text-right">Indicative EMI</th>
                    <th className="px-3 py-2">Top bank</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((item) => (
                      <tr
                        key={item.id}
                        id={`consult-${item.id}`}
                        className={`border-t border-border-subtle align-top text-charcoal ${
                          focusRequestId === item.id ? "bg-gold/5" : ""
                        }`}
                      >
                      <td className="px-3 py-2 text-[11px] text-muted">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="px-3 py-2 font-bold">
                        {item.clientName || "â€”"}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted">
                        {item.mobile}
                      </td>
                      <td className="px-3 py-2">
                        {INCOME_SOURCE_LABELS[item.sourceOfIncome]}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatINR(item.monthlyIncome)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatINR(item.monthlyEmis)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold">
                        {formatINR(item.eligibleAmount)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatINR(item.indicativeEmi)}
                      </td>
                      <td className="px-3 py-2">{item.topBank ?? "â€”"}</td>
                      <td className="px-3 py-2 text-right">
                        {item.topRateBps === null
                          ? "â€”"
                          : rateLabel(item.topRateBps / 100)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setConvertTarget(item)}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-border-subtle px-2.5 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          Move to consultation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setAppliedRequestSearch(requestSearch);
                setConsultationPage(1);
                setExpandedId(null);
              }}
              className="flex flex-1 gap-2"
            >
              <input
                className={`${inputClass} max-w-xs`}
                value={requestSearch}
                onChange={(event) => setRequestSearch(event.target.value)}
                placeholder="Search client, mobile or note"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
            <select
              className={`${inputClass} max-w-[12rem]`}
              value={requestStatus}
              onChange={(event) => {
                setRequestStatus(event.target.value);
                setConsultationPage(1);
                setExpandedId(null);
              }}
            >
              <option value="">All statuses</option>
              {SERVICE_REQUEST_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void loadConsultations()}
              aria-label="Refresh consultations"
              className="rounded-lg border border-border-subtle bg-white p-2 text-charcoal hover:border-gold/60"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loadingConsultations ? (
            <SkeletonTable rows={8} columns={9} />
          ) : consultations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-subtle bg-white p-8 text-center">
              <p className="text-sm font-bold text-charcoal">
                No consultation requests yet
              </p>
              <p className="mt-1 text-xs text-muted">
                Requests appear here when a client asks for an advisor or you
                move an eligibility check.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-white">
              <table className="w-full min-w-[960px] text-left text-xs">
                <thead className="bg-ivory text-[10px] font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Client</th>
                    <th className="px-3 py-2">Mobile</th>
                    <th className="px-3 py-2">Bank</th>
                    <th className="px-3 py-2">Plan</th>
                    <th className="px-3 py-2">Loan type</th>
                    <th className="px-3 py-2">Requirement</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((item) => (
                    <Fragment key={item.id}>
                      <tr className="border-t border-border-subtle align-top text-charcoal">
                        <td className="px-3 py-2 text-[11px] text-muted">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-bold">
                            {item.clientName || "â€”"}
                          </p>
                          <p className="text-[10px] text-muted-light">
                            {item.clientCode ?? "â€”"}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted">
                          {item.mobile}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <BankLogo bank={item.loanBank ?? ""} size={26} />
                            <span className="font-semibold">
                              {item.loanBank ?? "â€”"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {item.specificService}
                        </td>
                        <td className="px-3 py-2">
                          {item.loanType
                            ? LOAN_TYPE_CONSULTATION_LABELS[item.loanType]
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-semibold">
                            {item.requirementSource
                              ? INCOME_SOURCE_LABELS[item.requirementSource]
                              : "Source —"}
                          </p>
                          <p className="text-[10px] text-muted">
                            Income{" "}
                            {item.requirementMonthlyIncome === null ||
                            item.requirementMonthlyIncome === undefined
                              ? "—"
                              : formatINR(item.requirementMonthlyIncome)}
                          </p>
                          <p className="text-[10px] text-muted">
                            EMIs{" "}
                            {item.requirementMonthlyEmis === null ||
                            item.requirementMonthlyEmis === undefined
                              ? "—"
                              : formatINR(item.requirementMonthlyEmis)}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            className="rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] font-bold text-charcoal outline-none focus:border-gold disabled:opacity-50"
                            value={item.status}
                            disabled={updatingRequest === item.id}
                            onChange={(event) =>
                              requestStatusChange(
                                item,
                                event.target.value as AdminServiceRequestStatus,
                              )
                            }
                          >
                            {SERVICE_REQUEST_STATUSES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.comments ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(
                                  expandedId === item.id ? null : item.id,
                                )
                              }
                              aria-label="Toggle client note"
                              className="rounded-lg border border-border-subtle p-1.5 text-charcoal hover:border-gold/60"
                            >
                              {expandedId === item.id ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted-light">
                              â€”
                            </span>
                          )}
                        </td>
                      </tr>
                      {expandedId === item.id && item.comments && (
                        <tr className="border-t border-border-subtle bg-ivory/60">
                          <td
                            colSpan={9}
                            className="px-3 py-2 text-[11px] leading-relaxed text-muted"
                          >
                            {item.comments}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-3 py-2">
                <p className="text-[11px] text-muted">
                  Showing {pageStart}â€“{pageEnd} of {consultationTotal}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConsultationPage((current) => Math.max(1, current - 1));
                      setExpandedId(null);
                    }}
                    disabled={consultationPage <= 1}
                    className="rounded-lg border border-border-subtle px-2.5 py-1 text-[11px] font-bold text-charcoal disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => {
                        setConsultationPage(pageNumber);
                        setExpandedId(null);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        pageNumber === consultationPage
                          ? "bg-charcoal text-white"
                          : "border border-border-subtle text-charcoal hover:border-gold/60"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setConsultationPage((current) =>
                        Math.min(totalPages, current + 1),
                      );
                      setExpandedId(null);
                    }}
                    disabled={consultationPage >= totalPages}
                    className="rounded-lg border border-border-subtle px-2.5 py-1 text-[11px] font-bold text-charcoal disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {editingPlan && (
        <PlanSheet
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={() => {
            setEditingPlan(null);
            void reloadAll();
          }}
        />
      )}

      {rateTarget && (
        <RateSheet
          plan={rateTarget}
          onClose={() => setRateTarget(null)}
          onSaved={() => {
            setRateTarget(null);
            void reloadAll();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this plan?"
          message={`${deleteTarget.bank} Â· ${deleteTarget.product} will be removed. Past client checks are not affected.`}
          busy={busy}
          onConfirm={onDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {convertTarget && (
        <ConfirmDialog
          title="Move to consultation requests?"
          message={`${convertTarget.clientName || convertTarget.mobile} will get an in-progress loan consultation request and a notification. The check leaves this tab.`}
          busy={busy}
          confirmLabel="Move request"
          busyLabel="Moving..."
          tone="primary"
          onConfirm={onConvert}
          onCancel={() => setConvertTarget(null)}
        />
      )}

      {statusConfirm && (
        <ConfirmDialog
          title={`Mark request ${
            SERVICE_REQUEST_STATUSES.find(
              (option) => option.value === statusConfirm.status,
            )?.label ?? statusConfirm.status
          }?`}
          message={`${statusConfirm.request.clientName || statusConfirm.request.mobile} will be notified of this status change.`}
          busy={updatingRequest === statusConfirm.request.id}
          confirmLabel="Update status"
          busyLabel="Updating..."
          tone={statusConfirm.status === "cancelled" ? "danger" : "primary"}
          onConfirm={() =>
            void applyRequestStatus(
              statusConfirm.request,
              statusConfirm.status,
            )
          }
          onCancel={() => setStatusConfirm(null)}
        />
      )}
    </div>
  );
}


