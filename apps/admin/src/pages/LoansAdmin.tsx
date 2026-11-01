import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Search, Trash2, Wallet } from "lucide-react";
import {
  deleteAdminLoan,
  fetchAdminLoans,
  fetchLoansStats,
  updateAdminLoan,
  type AdminLoan,
  type AdminLoanStatus,
  type LoansStats,
} from "../lib/api";
import { formatINR } from "../lib/format";
import { showToast } from "../lib/toast";
import {
  ConfirmDialog,
  SheetShell,
  StatusBadge,
  inputClass,
  labelClass,
} from "../components/AdminUi";

const STATUSES: AdminLoanStatus[] = [
  "application",
  "verified",
  "submitted",
  "approved",
  "disbursed",
];

const STATUS_LABEL: Record<AdminLoanStatus, string> = {
  application: "Application",
  verified: "Verified",
  submitted: "Submitted to lender",
  approved: "Approved",
  disbursed: "Disbursed",
};

function LoanSheet({
  loan,
  onClose,
  onSaved,
}: {
  loan: AdminLoan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<AdminLoanStatus>(loan.status);
  const [bank, setBank] = useState(loan.bank ?? "");
  const [advisor, setAdvisor] = useState(loan.advisor ?? "");
  const [internalNotes, setInternalNotes] = useState(loan.internalNotes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminLoan(loan.id, {
        status,
        bank: bank.trim() || null,
        advisor: advisor.trim() || null,
        internalNotes: internalNotes.trim() || null,
      });
      showToast("Application updated.");
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update application.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Loan application"
      title={`${loan.loanType} loan`}
      subtitle={`${loan.clientName} · ${loan.mobile}`}
      onClose={onClose}
    >
      <div className="rounded-xl bg-ivory p-3 text-xs text-muted">
        <p>
          <span className="font-bold text-charcoal">
            {formatINR(loan.amount)}
          </span>{" "}
          ·{" "}
          {loan.tenureMonths
            ? `${Math.round(loan.tenureMonths / 12)} years`
            : "—"}{" "}
          · {loan.employmentType?.replace("-", " ") ?? "—"}
        </p>
        {loan.purpose && <p className="mt-1">{loan.purpose}</p>}
        <p className="mt-1 text-[10px] text-muted-light">
          Ref {loan.id.toUpperCase()}
        </p>
      </div>

      <form onSubmit={save} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="loan-status">
            Status
          </label>
          <select
            id="loan-status"
            className={inputClass}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as AdminLoanStatus)
            }
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABEL[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="loan-bank">
            Lender / bank
          </label>
          <input
            id="loan-bank"
            className={inputClass}
            value={bank}
            onChange={(event) => setBank(event.target.value)}
            placeholder="e.g. HDFC Bank"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="loan-advisor">
            Advisor
          </label>
          <input
            id="loan-advisor"
            className={inputClass}
            value={advisor}
            onChange={(event) => setAdvisor(event.target.value)}
            placeholder="Assigned advisor"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="loan-notes">
            Internal notes
          </label>
          <textarea
            id="loan-notes"
            rows={3}
            className={inputClass}
            value={internalNotes}
            onChange={(event) => setInternalNotes(event.target.value)}
            placeholder="Only visible to the admin team"
          />
        </div>

        {loan.documents.length > 0 && (
          <div>
            <p className={labelClass}>Documents</p>
            <div className="flex flex-wrap gap-1.5">
              {loan.documents.map((document) => (
                <span
                  key={document}
                  className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-medium text-muted"
                >
                  {document}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>
    </SheetShell>
  );
}

export function LoansAdmin() {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [stats, setStats] = useState<LoansStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<AdminLoan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLoan | null>(null);
  const [busy, setBusy] = useState(false);

  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("request");
  const focusHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!focusId || focusHandled.current === focusId) return;
    const match = loans.find((loan) => loan.id === focusId);
    if (match) {
      focusHandled.current = focusId;
      setEditing(match);
    }
  }, [focusId, loans]);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await fetchLoansStats());
    } catch {
      // Non-critical.
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLoans(
        await fetchAdminLoans({
          q: appliedSearch,
          status: statusFilter,
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load applications.",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  const reloadAll = async () => {
    await load();
    await refreshStats();
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteAdminLoan(deleteTarget.id);
      showToast("Application deleted.");
      setDeleteTarget(null);
      await reloadAll();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete application.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const kpis = [
    { label: "Applications", value: stats?.applicationsTotal ?? 0 },
    { label: "In progress", value: stats?.inProgress ?? 0 },
    { label: "Approved", value: stats?.approved ?? 0 },
    { label: "Disbursed", value: stats?.disbursed ?? 0 },
    { label: "Requested value", value: formatINR(stats?.totalAmount ?? 0) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
          Loans
        </p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-charcoal">
          Applications & disbursements
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
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

      <div className="flex flex-wrap gap-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(search);
          }}
          className="flex flex-1 gap-2"
        >
          <input
            className={`${inputClass} max-w-xs`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search client, bank or purpose"
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
          className={`${inputClass} max-w-[13rem]`}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABEL[option]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : loans.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center">
          <Wallet className="mx-auto h-8 w-8 text-gold" />
          <p className="mt-2 text-sm font-bold text-charcoal">
            No applications yet
          </p>
          <p className="mt-1 text-xs text-muted">
            Applications submitted from the client app appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={loan.status} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {loan.loanType}
                  </span>
                </div>
                <p className="mt-1 text-sm font-extrabold text-charcoal">
                  {loan.clientName} · {formatINR(loan.amount)}
                </p>
                <p className="text-[11px] text-muted">
                  {loan.mobile} ·{" "}
                  {loan.tenureMonths
                    ? `${Math.round(loan.tenureMonths / 12)} yrs`
                    : "—"}{" "}
                  · {loan.employmentType?.replace("-", " ") ?? "—"} ·{" "}
                  {loan.bank ?? "Lender matching"}
                </p>
                {loan.purpose && (
                  <p className="text-[10px] text-muted-light">{loan.purpose}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(loan)}
                  aria-label="Edit application"
                  className="rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(loan)}
                  aria-label="Delete application"
                  className="rounded-lg border border-border-subtle p-2 text-rose-600 hover:border-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <LoanSheet
          loan={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void reloadAll();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this application?"
          message={`${deleteTarget.clientName}'s ${deleteTarget.loanType} loan application will be removed.`}
          busy={busy}
          onConfirm={onDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
