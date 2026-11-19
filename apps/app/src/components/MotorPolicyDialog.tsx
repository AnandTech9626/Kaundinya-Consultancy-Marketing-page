import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button, FormField, Input, Select } from "@kaundinya/ui";
import type { PolicyRecord } from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { createMotorPolicy } from "../lib/mockApi";

interface MotorPolicyDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (policy: PolicyRecord) => void;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function MotorPolicyDialog({
  open,
  onClose,
  onCreated,
}: MotorPolicyDialogProps) {
  const { user } = useAuth();
  const [policyNumber, setPolicyNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [provider, setProvider] = useState("");
  const [vehicleType, setVehicleType] = useState<"2W" | "4W">("4W");
  const [validFrom, setValidFrom] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [premium, setPremium] = useState("");
  const [created, setCreated] = useState<PolicyRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    setPolicyNumber("");
    setHolder(user?.name ?? "");
    setProvider("");
    setVehicleType("4W");
    setValidFrom(isoDate(today));
    setRenewalDate(isoDate(nextYear));
    setPremium("");
    setCreated(null);
    setSubmitting(false);
    setError(null);
  }, [open, user?.name]);

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

  const close = () => {
    setCreated(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (renewalDate < validFrom) {
      setError("End date must be on or after the start date.");
      return;
    }

    const amount = Number(premium);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    setSubmitting(true);
    try {
      const policy = await createMotorPolicy({
        policyNumber: policyNumber.trim(),
        provider: provider.trim(),
        vehicleType,
        holder: holder.trim() || undefined,
        premium: Math.round(amount),
        validFrom,
        renewalDate,
      });
      setCreated(policy);
      onCreated(policy);
      window.setTimeout(() => {
        setCreated(null);
        onClose();
      }, 1400);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the policy. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-inverse/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a motor policy"
        className="relative w-full overflow-y-auto rounded-t-3xl bg-surface shadow-2xl sm:max-w-xl sm:rounded-2xl max-h-[92vh]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Policy Vault
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-foreground">
              Add a motor policy
            </h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Our team verifies the details and activates the policy. Serial
              numbers are generated automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="shrink-0 cursor-pointer rounded-lg border border-border p-2 text-foreground hover:border-brand/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {created ? (
          <div className="space-y-2 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success-fg" />
            <p className="text-sm font-extrabold text-foreground">
              Policy submitted for verification
            </p>
            <p className="text-xs text-muted-foreground">
              {created.serialNo ? `Serial #${created.serialNo} · ` : ""}
              {created.policyNumber} is now pending review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                label="Client mobile (login account)"
                htmlFor="motor-policy-mobile"
              >
                <Input
                  id="motor-policy-mobile"
                  value={
                    user?.mobile
                      ? user.mobile.startsWith("+")
                        ? user.mobile
                        : `+91 ${user.mobile}`
                      : ""
                  }
                  readOnly
                  disabled
                />
              </FormField>

              <FormField label="Client name" htmlFor="motor-policy-holder">
                <Input
                  id="motor-policy-holder"
                  value={holder}
                  onChange={(event) => setHolder(event.target.value)}
                  placeholder="Policy holder name"
                />
              </FormField>

              <FormField
                label="Policy number"
                htmlFor="motor-policy-number"
                required
              >
                <Input
                  id="motor-policy-number"
                  value={policyNumber}
                  onChange={(event) => setPolicyNumber(event.target.value)}
                  placeholder="From your previous policy"
                  required
                />
              </FormField>

              <FormField label="Company" htmlFor="motor-policy-company" required>
                <Input
                  id="motor-policy-company"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                  placeholder="e.g. Star Health, ICICI Lombard"
                  required
                />
              </FormField>

              <FormField
                label="Vehicle type"
                htmlFor="motor-policy-vehicle"
                required
              >
                <Select
                  id="motor-policy-vehicle"
                  value={vehicleType}
                  onChange={(event) =>
                    setVehicleType(event.target.value as "2W" | "4W")
                  }
                >
                  <option value="2W">Two-wheeler (2W)</option>
                  <option value="4W">Four-wheeler (4W)</option>
                </Select>
              </FormField>

              <FormField
                label="Payment amount (₹)"
                htmlFor="motor-policy-amount"
                required
              >
                <Input
                  id="motor-policy-amount"
                  inputMode="numeric"
                  value={premium}
                  onChange={(event) =>
                    setPremium(event.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="e.g. 8420"
                  required
                />
              </FormField>

              <FormField
                label="Start date"
                htmlFor="motor-policy-start"
                required
              >
                <Input
                  id="motor-policy-start"
                  type="date"
                  value={validFrom}
                  onChange={(event) => setValidFrom(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="End date" htmlFor="motor-policy-end" required>
                <Input
                  id="motor-policy-end"
                  type="date"
                  value={renewalDate}
                  onChange={(event) => setRenewalDate(event.target.value)}
                  required
                />
              </FormField>
            </div>

            {error && (
              <p className="rounded-lg border border-danger-fg/20 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-fg">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Submit for verification"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
