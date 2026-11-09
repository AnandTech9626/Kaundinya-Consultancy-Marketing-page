import { useEffect } from "react";
import { Download, FileText, X } from "lucide-react";
import { Button } from "@kaundinya/ui";
import type { InsurancePlan } from "@kaundinya/config";
import { InsurerLogo } from "./InsurerLogo";
import { INSURANCE_TYPE_LABELS } from "../lib/insuranceUi";
import { formatINR } from "../lib/formats";

export function BrochureDialog({
  plan,
  onClose,
}: {
  plan: InsurancePlan | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!plan) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [plan, onClose]);

  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-inverse/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${plan.insurer} ${plan.name} brochure`}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-surface shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <InsurerLogo insurer={plan.insurer} size={42} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {plan.insurer} ·{" "}
                {INSURANCE_TYPE_LABELS[plan.type] ?? plan.type}
              </p>
              <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-foreground">
                {plan.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 cursor-pointer rounded-lg border border-border p-2 text-foreground hover:border-brand/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-muted px-3 py-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                Cover
              </p>
              <p className="text-xs font-bold text-foreground">
                {formatINR(plan.sumInsured)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                Premium
              </p>
              <p className="text-xs font-bold text-foreground">
                {formatINR(plan.premium)}
                {plan.tenureYears > 1 ? ` / ${plan.tenureYears}y` : " / yr"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                Term
              </p>
              <p className="text-xs font-bold text-foreground">
                {plan.tenureYears} {plan.tenureYears === 1 ? "year" : "years"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              What this plan covers
            </p>
            <ul className="mt-2 space-y-1.5">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-xs text-foreground-soft"
                >
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
            {plan.brochureUrl
              ? "Official insurer brochure provided by our team."
              : "This is a sample brochure for preview. The official insurer PDF will be uploaded by our team and shown here."}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <a
              href={plan.brochureUrl ?? "/brochures/sample-policy-brochure.pdf"}
              download={`${plan.insurer}-${plan.name}-brochure.pdf`}
              target={plan.brochureUrl ? "_blank" : undefined}
              rel={plan.brochureUrl ? "noreferrer" : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand hover:bg-brand-hover"
            >
              <Download className="h-4 w-4" />
              {plan.brochureUrl ? "Open brochure" : "Download sample"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
