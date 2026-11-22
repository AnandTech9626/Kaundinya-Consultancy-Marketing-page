import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export const inputClass =
  "w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";

export const labelClass =
  "mb-1 block text-[11px] font-bold text-charcoal";

function statusStyle(status: string) {
  const value = status.toLowerCase();
  if (/(cancel|reject|fail|laps|expir|overdue|declin|error|blocked)/.test(value)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (/(pending|new|request|draft|await|review|hold|queued|application)/.test(value)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (/(complete|active|approve|disburse|paid|sold|rented|success|closed|done|resolved)/.test(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (/(progress|process|contact|confirm|schedule|route|submit|verif|issue|ready|printing|documents)/.test(value)) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-border-subtle bg-ivory text-muted";
}

export function StatusBadge({ status }: { status: string }) {
  const label = status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyle(status)}`}
    >
      {label}
    </span>
  );
}

export function SheetShell({
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

export function ConfirmDialog({
  title,
  message,
  busy,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  busyLabel = "Deleting...",
  tone = "danger",
}: {
  title: string;
  message: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  busyLabel?: string;
  tone?: "danger" | "primary";
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
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h3
          id="confirm-title"
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
            className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50 ${
              tone === "primary"
                ? "bg-gold text-charcoal hover:bg-gold-hover"
                : "bg-rose-600 text-white hover:bg-rose-700"
            }`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
