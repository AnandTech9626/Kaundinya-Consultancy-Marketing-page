import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  FileText,
  Ruler,
  Search,
  Sofa,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import {
  deleteAdminDocument,
  deleteAdminInterior,
  deleteAdminJob,
  deleteAdminMeasurement,
  fetchAdminDocuments,
  fetchAdminInteriors,
  fetchAdminJobs,
  fetchAdminMeasurements,
  updateAdminInterior,
  updateAdminJob,
  updateAdminMeasurement,
  type AdminDocument,
  type AdminInterior,
  type AdminJob,
  type AdminJobStatus,
  type AdminMeasurement,
} from "../lib/api";
import { formatDateTime, formatINR } from "../lib/format";
import { showToast } from "../lib/toast";

type Tab = "jobs" | "measurements" | "interiors" | "documents";

const TAB_META: Array<{
  id: Tab;
  label: string;
  icon: typeof Wrench;
}> = [
  { id: "jobs", label: "Requests", icon: Wrench },
  { id: "measurements", label: "Measurements", icon: Ruler },
  { id: "interiors", label: "Interiors", icon: Sofa },
  { id: "documents", label: "Documents", icon: FileText },
];

const STATUS_STYLES: Record<string, string> = {
  requested: "border-amber-200 bg-amber-50 text-amber-700",
  assigned: "border-blue-200 bg-blue-50 text-blue-700",
  en_route: "border-violet-200 bg-violet-50 text-violet-700",
  in_progress: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-blue-200 bg-blue-50 text-blue-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] ?? "border-border-subtle bg-ivory text-muted";
  const label = status
    .replace(/_/g, " ")
    .replace(/^\w/, (character) => character.toUpperCase());

  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${style}`}
    >
      {label}
    </span>
  );
}

function SheetShell({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-charcoal">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";
const labelClass = "mb-1 block text-[11px] font-bold text-charcoal";

function ConfirmDialog({
  title,
  message,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/60"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="hs-confirm-title"
        className="relative z-10 w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h3
          id="hs-confirm-title"
          className="text-base font-extrabold tracking-tight text-charcoal"
        >
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-muted">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function JobSheet({
  job,
  onClose,
  onSaved,
}: {
  job: AdminJob;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<AdminJobStatus>(job.status);
  const [technicianName, setTechnicianName] = useState(job.technician ?? "");
  const [technicianPhone, setTechnicianPhone] = useState(
    job.technicianPhone ?? "",
  );
  const [technicianId, setTechnicianId] = useState(job.technicianId ?? "");
  const [scheduledAt, setScheduledAt] = useState(job.scheduledAt ?? "");
  const [amount, setAmount] = useState(
    job.amount !== null ? String(job.amount) : "",
  );
  const [serviceName, setServiceName] = useState(job.serviceName);
  const [addressValue, setAddressValue] = useState(job.address ?? "");
  const [issueTypesText, setIssueTypesText] = useState(
    job.issueTypes.join(", "),
  );
  const [notes, setNotes] = useState(job.notes ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminJob(job.id, {
        status,
        serviceName: serviceName.trim(),
        address: addressValue.trim(),
        issueTypes: issueTypesText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: notes.trim() || null,
        technicianName: technicianName.trim() || null,
        technicianPhone: technicianPhone.trim() || null,
        technicianId: technicianId.trim() || null,
        scheduledAt: scheduledAt.trim() || null,
        amount: amount.trim() ? Number(amount) : null,
      });
      const notified =
        status !== job.status ||
        (technicianName.trim() || null) !== job.technician ||
        (amount.trim() ? Number(amount) : null) !== job.amount;
      showToast(
        notified
          ? `Updated. Notification sent to ${job.clientName || "client"}${job.clientCode ? ` · ${job.clientCode}` : ""} (${job.mobile}).`
          : "Request updated.",
      );
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update job.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteAdminJob(job.id);
      showToast("Request deleted.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete request.");
      setBusy(false);
    }
  };

    return (
    <SheetShell
      eyebrow="Service request"
      title={job.serviceName}
      subtitle={`${job.clientName} · ${job.mobile}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="job-status">
              Status
            </label>
            <select
              id="job-status"
              className={inputClass}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminJobStatus)
              }
            >
              {[
                "requested",
                "assigned",
                "en_route",
                "in_progress",
                "completed",
                "cancelled",
              ].map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="job-amount">
              Final amount (₹)
            </label>
            <input
              id="job-amount"
              inputMode="numeric"
              className={inputClass}
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value.replace(/\D/g, ""))
              }
              placeholder="Admin decides"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="job-service">
            Service
          </label>
          <input
            id="job-service"
            className={inputClass}
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="job-address">
            Address
          </label>
          <input
            id="job-address"
            className={inputClass}
            value={addressValue}
            onChange={(event) => setAddressValue(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="job-issues">
            Issue types (comma separated)
          </label>
          <input
            id="job-issues"
            className={inputClass}
            value={issueTypesText}
            onChange={(event) => setIssueTypesText(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="job-notes">
            Client notes
          </label>
          <textarea
            id="job-notes"
            rows={2}
            className={inputClass}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="job-tech-name">
              Technician name
            </label>
            <input
              id="job-tech-name"
              className={inputClass}
              value={technicianName}
              onChange={(event) => setTechnicianName(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="job-tech-phone">
              Technician phone
            </label>
            <input
              id="job-tech-phone"
              className={inputClass}
              value={technicianPhone}
              onChange={(event) => setTechnicianPhone(event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="job-tech-id">
              Technician ID
            </label>
            <input
              id="job-tech-id"
              className={inputClass}
              value={technicianId}
              onChange={(event) => setTechnicianId(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="job-scheduled">
              Scheduled
            </label>
            <input
              id="job-scheduled"
              className={inputClass}
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              placeholder="e.g. 20 Nov, 10:00 AM"
            />
          </div>
        </div>

        <div className="rounded-lg bg-ivory p-3 text-xs leading-relaxed text-muted">
          <p className="font-bold text-charcoal">Address</p>
          <p>{job.address || "Not provided"}</p>
          <p className="mt-2 font-bold text-charcoal">Issues</p>
          <p>{job.issueTypes.join(", ") || "General service"}</p>
          {job.notes && (
            <>
              <p className="mt-2 font-bold text-charcoal">Client notes</p>
              <p>{job.notes}</p>
            </>
          )}
          {job.rating !== null && (
            <p className="mt-2 font-bold text-charcoal">
              Rating: {job.rating} / 5
            </p>
          )}
        </div>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save request"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
      >
        Delete request
      </button>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this request?"
          message="This will permanently delete the request. The client will be notified."
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </SheetShell>
  );
}

function MeasurementSheet({
  measurement,
  onClose,
  onSaved,
}: {
  measurement: AdminMeasurement;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(measurement.status);
  const [date, setDate] = useState(measurement.date);
  const [slot, setSlot] = useState(measurement.slot);
  const [surveyor, setSurveyor] = useState(measurement.surveyor ?? "");
  const [notes, setNotes] = useState(measurement.notes ?? "");
  const [serviceName, setServiceName] = useState(measurement.serviceName);
  const [addressValue, setAddressValue] = useState(measurement.address);
  const [pincodeValue, setPincodeValue] = useState(measurement.pincode);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminMeasurement(measurement.id, {
        status,
        serviceName: serviceName.trim(),
        address: addressValue.trim(),
        pincode: pincodeValue,
        date,
        slot,
        surveyor: surveyor.trim() || null,
        notes: notes.trim() || null,
      });
      const notified =
        status !== measurement.status ||
        (surveyor.trim() || null) !== measurement.surveyor;
      showToast(
        notified
          ? `Measurement updated. Notification sent to ${measurement.clientName || "client"}${measurement.clientCode ? ` · ${measurement.clientCode}` : ""} (${measurement.mobile}).`
          : "Measurement updated.",
      );
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update measurement.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteAdminMeasurement(measurement.id);
      showToast("Measurement deleted.");
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete measurement.",
      );
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Free measurement"
      title={measurement.serviceName}
      subtitle={`${measurement.clientName} · ${measurement.mobile}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="measurement-status">
            Status
          </label>
          <select
            id="measurement-status"
            className={inputClass}
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as "requested" | "scheduled" | "completed",
              )
            }
          >
            {["requested", "scheduled", "completed"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="measurement-service">
            Service
          </label>
          <input
            id="measurement-service"
            className={inputClass}
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="measurement-address">
              Address
            </label>
            <input
              id="measurement-address"
              className={inputClass}
              value={addressValue}
              onChange={(event) => setAddressValue(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="measurement-pincode">
              Pincode
            </label>
            <input
              id="measurement-pincode"
              inputMode="numeric"
              className={inputClass}
              value={pincodeValue}
              onChange={(event) =>
                setPincodeValue(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="measurement-date">
              Date
            </label>
            <input
              id="measurement-date"
              type="date"
              className={inputClass}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="measurement-slot">
              Slot
            </label>
            <input
              id="measurement-slot"
              className={inputClass}
              value={slot}
              onChange={(event) => setSlot(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="measurement-surveyor">
            Surveyor
          </label>
          <input
            id="measurement-surveyor"
            className={inputClass}
            value={surveyor}
            onChange={(event) => setSurveyor(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="measurement-notes">
            Admin notes
          </label>
          <textarea
            id="measurement-notes"
            rows={3}
            className={inputClass}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="rounded-lg bg-ivory p-3 text-xs text-muted">
          <p className="font-bold text-charcoal">Address</p>
          <p>
            {measurement.address}, {measurement.pincode}
          </p>
        </div>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save measurement"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
      >
        Delete measurement
      </button>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this measurement?"
          message="This will permanently delete the measurement request. The client will be notified."
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </SheetShell>
  );
}

function InteriorSheet({
  consultation,
  onClose,
  onSaved,
}: {
  consultation: AdminInterior;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(consultation.status);
  const [advisor, setAdvisor] = useState(consultation.advisor ?? "");
  const [adminNotes, setAdminNotes] = useState(consultation.adminNotes ?? "");
  const [name, setName] = useState(consultation.clientName);
  const [mobile, setMobile] = useState(consultation.mobile);
  const [style, setStyle] = useState(consultation.style);
  const [budget, setBudget] = useState(consultation.budget);
  const [notes, setNotes] = useState(consultation.notes ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminInterior(consultation.id, {
        status,
        name: name.trim(),
        mobile,
        style: style.trim(),
        budget: budget.trim(),
        notes: notes.trim() || null,
        advisor: advisor.trim() || null,
        adminNotes: adminNotes.trim() || null,
      });
      const notified =
        status !== consultation.status ||
        (advisor.trim() || null) !== consultation.advisor;
      showToast(
        notified
          ? `Consultation updated. Notification sent to ${consultation.clientName || "client"}${consultation.clientCode ? ` · ${consultation.clientCode}` : ""} (${consultation.mobile}).`
          : "Consultation updated.",
      );
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update consultation.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteAdminInterior(consultation.id);
      showToast("Consultation deleted.");
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete consultation.",
      );
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Interior consultation"
      title={consultation.clientName}
      subtitle={`${consultation.style} · ${consultation.budget}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="interior-status">
            Status
          </label>
          <select
            id="interior-status"
            className={inputClass}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "requested" | "contacted")
            }
          >
            {["requested", "contacted", "scheduled", "completed"].map(
              (option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="interior-name">
              Client name
            </label>
            <input
              id="interior-name"
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="interior-mobile">
              Mobile
            </label>
            <input
              id="interior-mobile"
              inputMode="numeric"
              className={inputClass}
              value={mobile}
              onChange={(event) =>
                setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="interior-style">
              Style
            </label>
            <input
              id="interior-style"
              className={inputClass}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="interior-budget">
              Budget
            </label>
            <input
              id="interior-budget"
              className={inputClass}
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="interior-client-notes">
            Client notes
          </label>
          <textarea
            id="interior-client-notes"
            rows={2}
            className={inputClass}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="interior-advisor">
            Designer / advisor
          </label>
          <input
            id="interior-advisor"
            className={inputClass}
            value={advisor}
            onChange={(event) => setAdvisor(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="interior-notes">
            Admin notes
          </label>
          <textarea
            id="interior-notes"
            rows={3}
            className={inputClass}
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
          />
        </div>

        <div className="rounded-lg bg-ivory p-3 text-xs leading-relaxed text-muted">
          <p className="font-bold text-charcoal">Client notes</p>
          <p>{consultation.notes || "None"}</p>
        </div>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save consultation"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
      >
        Delete consultation
      </button>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this consultation?"
          message="This will permanently delete the consultation. The client will be notified."
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </SheetShell>
  );
}

export function HomeServicesAdmin() {
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [measurements, setMeasurements] = useState<AdminMeasurement[]>([]);
  const [interiors, setInteriors] = useState<AdminInterior[]>([]);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<{
    kind: "job" | "measurement" | "interior";
    id: string;
  } | null>(null);
  const [confirmDoc, setConfirmDoc] = useState<AdminDocument | null>(null);
  const [docBusy, setDocBusy] = useState(false);

  const [searchParams] = useSearchParams();
  const focusKind = searchParams.get("kind");
  const focusId = searchParams.get("request");
  const focusHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!focusId || focusHandled.current === focusId) return;

    if (focusKind === "job" && jobs.some((item) => item.id === focusId)) {
      focusHandled.current = focusId;
      setTab("jobs");
      setSelected({ kind: "job", id: focusId });
      return;
    }
    if (
      focusKind === "measurement" &&
      measurements.some((item) => item.id === focusId)
    ) {
      focusHandled.current = focusId;
      setTab("measurements");
      setSelected({ kind: "measurement", id: focusId });
      return;
    }
    if (
      focusKind === "interior" &&
      interiors.some((item) => item.id === focusId)
    ) {
      focusHandled.current = focusId;
      setTab("interiors");
      setSelected({ kind: "interior", id: focusId });
    }
  }, [focusKind, focusId, jobs, measurements, interiors]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchAdminJobs(),
      fetchAdminMeasurements(),
      fetchAdminInteriors(),
      fetchAdminDocuments(),
    ])
      .then(([nextJobs, nextMeasurements, nextInteriors, nextDocs]) => {
        if (!cancelled) {
          setJobs(nextJobs);
          setMeasurements(nextMeasurements);
          setInteriors(nextInteriors);
          setDocuments(nextDocs);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load Home Services.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = () => setReloadKey((key) => key + 1);
  const needle = q.trim().toLowerCase();

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (statusFilter && job.status !== statusFilter) return false;
        if (!needle) return true;
        return `${job.clientName} ${job.mobile} ${job.serviceName} ${
          job.address ?? ""
        }`
          .toLowerCase()
          .includes(needle);
      }),
    [jobs, needle, statusFilter],
  );

  const filteredMeasurements = useMemo(
    () =>
      measurements.filter((item) => {
        if (statusFilter && item.status !== statusFilter) return false;
        if (!needle) return true;
        return `${item.clientName} ${item.mobile} ${item.serviceName} ${item.address}`
          .toLowerCase()
          .includes(needle);
      }),
    [measurements, needle, statusFilter],
  );

  const filteredInteriors = useMemo(
    () =>
      interiors.filter((item) => {
        if (statusFilter && item.status !== statusFilter) return false;
        if (!needle) return true;
        return `${item.clientName} ${item.mobile} ${item.style} ${item.budget}`
          .toLowerCase()
          .includes(needle);
      }),
    [interiors, needle, statusFilter],
  );

  const filteredDocuments = useMemo(
    () =>
      documents.filter((item) => {
        if (!needle) return true;
        return `${item.clientName} ${item.mobile} ${item.docType} ${item.fileName}`
          .toLowerCase()
          .includes(needle);
      }),
    [documents, needle],
  );

  const statusOptions =
    tab === "jobs"
      ? ["requested", "assigned", "en_route", "in_progress", "completed"]
      : tab === "measurements"
        ? ["requested", "scheduled", "completed"]
        : tab === "interiors"
          ? ["requested", "contacted"]
          : [];

  const handleTab = (next: Tab) => {
    setTab(next);
    setStatusFilter("");
    setSelected(null);
  };

  const selectedJob =
    selected?.kind === "job"
      ? jobs.find((item) => item.id === selected.id) ?? null
      : null;
  const selectedMeasurement =
    selected?.kind === "measurement"
      ? measurements.find((item) => item.id === selected.id) ?? null
      : null;
  const selectedInterior =
    selected?.kind === "interior"
      ? interiors.find((item) => item.id === selected.id) ?? null
      : null;

  const handleDeleteDocument = async () => {
    if (!confirmDoc) return;
    setDocBusy(true);
    try {
      await deleteAdminDocument(confirmDoc.id);
      showToast("Document deleted.");
      setConfirmDoc(null);
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete document.",
        "error",
      );
    } finally {
      setDocBusy(false);
    }
  };

  const activeKpis = useMemo(() => {
    if (tab === "jobs") {
      return [
        { label: "Requests total", value: jobs.length },
        {
          label: "New",
          value: jobs.filter((job) => job.status === "requested").length,
        },
        {
          label: "Active",
          value: jobs.filter((job) =>
            ["assigned", "en_route", "in_progress"].includes(job.status),
          ).length,
        },
        {
          label: "Completed",
          value: jobs.filter((job) => job.status === "completed").length,
        },
      ];
    }

    if (tab === "measurements") {
      return [
        { label: "Measurements total", value: measurements.length },
        {
          label: "Requested",
          value: measurements.filter((item) => item.status === "requested")
            .length,
        },
        {
          label: "Scheduled",
          value: measurements.filter((item) => item.status === "scheduled")
            .length,
        },
        {
          label: "Completed",
          value: measurements.filter((item) => item.status === "completed")
            .length,
        },
      ];
    }

    if (tab === "interiors") {
      return [
        { label: "Consultations total", value: interiors.length },
        {
          label: "Requested",
          value: interiors.filter((item) => item.status === "requested")
            .length,
        },
        {
          label: "Contacted",
          value: interiors.filter((item) => item.status === "contacted")
            .length,
        },
      ];
    }

    return [{ label: "Documents", value: documents.length }];
  }, [tab, jobs, measurements, interiors, documents]);

  const counts: Record<Tab, number> = {
    jobs: jobs.length,
    measurements: measurements.length,
    interiors: interiors.length,
    documents: documents.length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 rounded-xl border border-border-subtle bg-ivory p-1">
        {TAB_META.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === item.id
                  ? "bg-charcoal text-white"
                  : "text-charcoal hover:bg-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  tab === item.id
                    ? "bg-white/15 text-white"
                    : "bg-white text-muted"
                }`}
              >
                {counts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {activeKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-border-subtle bg-white p-4"
          >
            <p className="text-2xl font-extrabold tracking-tight text-charcoal">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-muted">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search by client, mobile, service or address"
              aria-label="Search Home Services"
              className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>
          {statusOptions.length > 0 && (
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm font-semibold text-charcoal outline-none focus:border-gold"
            >
              <option value="">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-lg bg-ivory"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-dashed border-border-subtle p-6 text-center">
              <p className="text-sm text-muted">{error}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal"
              >
                Try again
              </button>
            </div>
          ) : tab === "jobs" ? (
            filteredJobs.length === 0 ? (
              <EmptyState text="No jobs match those filters." />
            ) : (
              filteredJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelected({ kind: "job", id: job.id })}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-border-subtle p-3 text-left transition-colors hover:border-gold/60"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-charcoal">
                        {job.serviceName}
                      </p>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {job.clientName} · {job.mobile}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-muted">
                      {job.address ?? "No address"}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-muted-light">
                      {job.scheduledAt ?? "Not scheduled"} ·{" "}
                      {job.amount ? formatINR(job.amount) : "Price pending"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-light">
                    {formatDateTime(job.createdAt)}
                  </span>
                </button>
              ))
            )
          ) : tab === "measurements" ? (
            filteredMeasurements.length === 0 ? (
              <EmptyState text="No measurements match those filters." />
            ) : (
              filteredMeasurements.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelected({ kind: "measurement", id: item.id })
                  }
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-border-subtle p-3 text-left transition-colors hover:border-gold/60"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-charcoal">
                        {item.serviceName}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.clientName} · {item.mobile}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-muted">
                      {item.address}, {item.pincode}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-muted-light">
                      {item.date} · {item.slot} ·{" "}
                      {item.surveyor ?? "Surveyor not assigned"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-light">
                    {formatDateTime(item.createdAt)}
                  </span>
                </button>
              ))
            )
          ) : tab === "interiors" ? (
            filteredInteriors.length === 0 ? (
              <EmptyState text="No consultations match those filters." />
            ) : (
              filteredInteriors.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelected({ kind: "interior", id: item.id })
                  }
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-border-subtle p-3 text-left transition-colors hover:border-gold/60"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-charcoal">
                        {item.clientName}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.mobile} · {item.style} · {item.budget}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-muted">
                      {item.notes ?? "No notes"}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-muted-light">
                      {item.advisor ?? "Advisor not assigned"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-light">
                    {formatDateTime(item.createdAt)}
                  </span>
                </button>
              ))
            )
          ) : filteredDocuments.length === 0 ? (
            <EmptyState text="No documents uploaded yet." />
          ) : (
            filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border-subtle p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-charcoal">
                      {document.docType}
                    </p>
                    <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold text-muted">
                      {document.watermark}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {document.clientName} · {document.mobile}
                  </p>
                  <p className="truncate text-[11px] text-muted">
                    {document.fileName} · {formatDateTime(document.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {document.url && (
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-border-subtle p-2 text-charcoal hover:border-gold/60"
                      aria-label="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmDoc(document)}
                    className="rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedJob && (
        <JobSheet
          job={selectedJob}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            refetch();
          }}
        />
      )}

      {selectedMeasurement && (
        <MeasurementSheet
          measurement={selectedMeasurement}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            refetch();
          }}
        />
      )}

      {selectedInterior && (
        <InteriorSheet
          consultation={selectedInterior}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            refetch();
          }}
        />
      )}

      {confirmDoc && (
        <ConfirmDialog
          title="Delete this document?"
          message={`Delete "${confirmDoc.fileName}" permanently? The client will be notified.`}
          busy={docBusy}
          onConfirm={handleDeleteDocument}
          onCancel={() => setConfirmDoc(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle p-6 text-center">
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
