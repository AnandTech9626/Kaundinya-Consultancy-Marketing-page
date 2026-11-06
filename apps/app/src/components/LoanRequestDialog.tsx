import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "@kaundinya/ui";
import type { ServiceRequest } from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { useMockRequests } from "../lib/mockRequests";

const REQUEST_KINDS = [
  "Loan consultation",
  "Eligibility review",
  "Document help",
  "Lender coordination",
  "Sanction / disbursal help",
];

interface LoanRequestDialogProps {
  open: boolean;
  onClose: () => void;
  defaultService?: string;
  defaultKind?: string;
  defaultNotes?: string;
  title?: string;
  description?: string;
}

export function LoanRequestDialog({
  open,
  onClose,
  defaultService = "",
  defaultKind = "Loan consultation",
  defaultNotes = "",
  title = "Talk to a loan advisor",
  description = "Share a few details and our team will call you back. No loan application or payment happens here.",
}: LoanRequestDialogProps) {
  const { user } = useAuth();
  const { raiseRequest } = useMockRequests();

  const [kind, setKind] = useState(defaultKind);
  const [service, setService] = useState(defaultService);
  const [notes, setNotes] = useState(defaultNotes);
  const [created, setCreated] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (!open) return;
    setKind(defaultKind);
    setService(defaultService);
    setNotes(defaultNotes);
    setCreated(null);
  }, [open, defaultKind, defaultService, defaultNotes]);

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

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const callback = user?.mobile ? ` Preferred callback: +91 ${user.mobile}.` : "";
    const request = raiseRequest({
      serviceCategory: "Loans",
      specificService:
        service.trim() || defaultService || `${kind} · Loans`,
      comments: `${kind} requested from the loans module.${notes.trim() ? ` ${notes.trim()}` : ""}${callback}`,
    });
    setCreated(request);
  };

  const close = () => {
    setCreated(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-inverse/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-border p-2 text-foreground hover:border-brand/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {created ? (
          <div className="p-5 space-y-4">
            <div className="text-center space-y-2 py-2">
              <div className="w-14 h-14 rounded-full bg-success-soft text-success-fg flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                Request raised
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Reference{" "}
                <span className="font-bold text-foreground">
                  {created.id.toUpperCase()}
                </span>
                . A loan advisor will review it and call you on{" "}
                {user?.mobile ? `+91 ${user.mobile}` : "your registered number"}.
              </p>
            </div>

            <div className="rounded-xl bg-surface-muted p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
                Request
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {created.specificService}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {created.serviceCategory} · {created.createdAt}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                to={`/requests/${created.id}`}
                onClick={close}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand hover:bg-brand-hover px-4 py-2.5 text-sm font-semibold text-on-brand border border-brand"
              >
                View request status
              </Link>
              <Button variant="secondary" className="flex-1" onClick={close}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <FormField label="What do you need?" htmlFor="loan-request-kind" required>
              <Select
                id="loan-request-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value)}
              >
                {REQUEST_KINDS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Loan type or lender (optional)"
              htmlFor="loan-request-service"
            >
              <Input
                id="loan-request-service"
                value={service}
                onChange={(event) => setService(event.target.value)}
                placeholder="e.g. Home loan, business loan or lender name"
              />
            </FormField>

            <FormField label="Tell us more" htmlFor="loan-request-notes">
              <Textarea
                id="loan-request-notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Amount, tenure, income, existing EMIs or the help you need."
              />
            </FormField>

            {user?.mobile && (
              <div className="rounded-lg bg-surface-muted px-3 py-2 text-[11px] text-muted-foreground">
                We will call you on{" "}
                <span className="font-bold text-foreground">+91 {user.mobile}</span>.
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Raise request</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
