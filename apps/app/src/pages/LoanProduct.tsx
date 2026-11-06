import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button, Card } from "@kaundinya/ui";
import {
  COMPLIANCE,
  LOAN_FACTORS,
  LOAN_PROCESS_STEPS,
  LOAN_PRODUCTS,
} from "@kaundinya/config";
import { LoanRequestDialog } from "../components/LoanRequestDialog";

export function LoanProduct() {
  const { product: productId } = useParams();
  const product = LOAN_PRODUCTS.find((item) => item.id === productId);
  const [dialog, setDialog] = useState<{ service: string; kind: string } | null>(
    null
  );

  if (!product) {
    return <Navigate to="/loans" replace />;
  }

  const related = LOAN_PRODUCTS.filter((item) => item.id !== product.id);

  return (
    <div className="space-y-8">
      <Link
        to="/loans"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to loans
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
            Loans · {product.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {product.tagline}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">{product.description}</p>
        </div>
        <Button
          onClick={() =>
            setDialog({ service: product.name, kind: "Loan consultation" })
          }
        >
          <ShieldCheck className="w-4 h-4" />
          Talk to a loan advisor
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Indicative rate
          </p>
          <p className="text-sm font-extrabold text-foreground mt-1">
            {product.rateHint}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tenure
          </p>
          <p className="text-sm font-extrabold text-foreground mt-1">
            {product.tenureHint}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Typical amount
          </p>
          <p className="text-sm font-extrabold text-foreground mt-1">
            {product.amountHint}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Who it is for
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Common situations where this product fits.
            </p>
          </div>
          <ul className="space-y-2">
            {product.whoFor.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-foreground-soft"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
              What we review with you
            </h3>
            <ul className="space-y-2 mt-2">
              {product.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs text-foreground-soft"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Documents to keep ready
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Requirements vary by lender. This is the usual set.
            </p>
          </div>
          <ul className="space-y-2">
            {product.documents.map((document) => (
              <li
                key={document}
                className="flex items-start gap-2 text-xs text-foreground-soft"
              >
                <FileText className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                {document}
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-surface-muted p-3 text-[11px] text-muted-foreground leading-relaxed">
            Start the request even if your documents are incomplete. A consultant
            will send the exact checklist for your profile.
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-foreground tracking-tight">
            How the process works
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Advised, compared and coordinated by our team.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LOAN_PROCESS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex gap-3 rounded-xl border border-border bg-surface p-3"
            >
              <span className="w-6 h-6 rounded-full bg-brand-soft text-brand-strong text-[11px] font-extrabold flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">{step.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-extrabold text-foreground tracking-tight">
          What lenders look at
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LOAN_FACTORS.map((factor) => (
            <div key={factor.title} className="flex gap-3 rounded-xl bg-surface-muted p-3">
              <ShieldCheck className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">{factor.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {factor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-extrabold text-foreground tracking-tight mb-3">
          Explore other loan types
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {related.map((item) => (
            <Link key={item.id} to={`/loans/${item.id}`} className="block">
              <Card hoverable className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {item.tagline}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="p-4 bg-surface-muted/60">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">
            {COMPLIANCE.rbi.label}.
          </span>{" "}
          {COMPLIANCE.rbi.note} {COMPLIANCE.dpdp.note}
        </p>
      </Card>

      <LoanRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Loan consultation"}
      />
    </div>
  );
}
