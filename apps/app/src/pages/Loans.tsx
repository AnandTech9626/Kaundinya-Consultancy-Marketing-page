import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Home,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, StatCard } from "@kaundinya/ui";
import {
  COMPLIANCE,
  LOAN_FACTORS,
  LOAN_HELP,
  LOAN_PROCESS_STEPS,
  LOAN_PRODUCTS,
} from "@kaundinya/config";
import { useLoanRequests } from "../lib/mockRequests";
import { STATUS_META } from "../lib/status";
import { LoanRequestDialog } from "../components/LoanRequestDialog";
import { LoanToolsDialog } from "../components/LoanToolsDialog";

const PRODUCT_ICONS: Record<string, LucideIcon> = {
  home: Home,
  personal: Wallet,
  business: Briefcase,
  property: Building2,
};

export function Loans() {
  const requests = useLoanRequests();
  const [dialog, setDialog] = useState<{
    service: string;
    kind: string;
    notes?: string;
  } | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  const openRequests = requests.filter(
    (request) => request.status === "new" || request.status === "in_progress"
  ).length;
  const resolvedRequests = requests.filter(
    (request) => request.status === "completed"
  ).length;
  const recentRequests = requests.slice(0, 3);

  const openConsultation = (
    service = "",
    kind = "Loan consultation",
    notes = ""
  ) => setDialog({ service, kind, notes });

  const handleToolsReview = (summary: string) => {
    setToolsOpen(false);
    setDialog({
      service: "Loan planning review",
      kind: "Loan consultation",
      notes: summary,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Loans
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openConsultation()}>
            <ShieldCheck className="w-4 h-4" />
            Talk to a loan advisor
          </Button>
          <Link
            to="/loans/support"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border hover:border-brand/60 text-foreground text-sm font-bold transition-colors"
          >
            Loan support
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Open requests"
          value={openRequests}
          hint="With our team"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <StatCard
          label="Resolved"
          value={resolvedRequests}
          hint="Queries closed"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label="Loan products"
          value={LOAN_PRODUCTS.length}
          hint="Guidance available"
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatCard
          label="Max tenure"
          value="30 yrs"
          hint="Home loans"
          icon={<Home className="w-5 h-5" />}
        />
      </div>

      <Card className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground">
              Plan before you apply
            </p>
            <p className="text-[11px] text-muted-foreground">
              Estimate EMI and eligibility without submitting an application.
            </p>
          </div>
        </div>
        <Button onClick={() => setToolsOpen(true)}>
          <Calculator className="w-4 h-4" />
          Open loan tools
        </Button>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            Loan types we help with
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose a product to see eligibility factors, documents and process.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {LOAN_PRODUCTS.map((product) => {
            const Icon = PRODUCT_ICONS[product.id] ?? Wallet;
            return (
              <Card key={product.id} className="p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-brand mt-0.5">
                    {product.tagline}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-muted px-3 py-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                      Rate
                    </p>
                    <p className="text-[11px] font-bold text-foreground">
                      {product.rateHint}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                      Tenure
                    </p>
                    <p className="text-[11px] font-bold text-foreground">
                      {product.tenureHint}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/loans/${product.id}`}
                  className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-brand/60 transition-colors"
                >
                  View guidance
                  <ArrowRight className="w-3.5 h-3.5 text-brand" />
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            How we help
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Advisory and coordination, not a loan marketplace.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {LOAN_HELP.map((item, index) => (
            <Card key={item.title} className="p-5 space-y-2 flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">
                0{index + 1}
              </span>
              <h3 className="text-sm font-extrabold text-foreground">
                {item.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              {item.title === "Eligibility review" && (
                <button
                  type="button"
                  onClick={() => setToolsOpen(true)}
                  className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                >
                  Open loan tools
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            What lenders look at
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The five factors that decide eligibility and pricing.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {LOAN_FACTORS.map((factor) => (
            <Card key={factor.title} className="p-4 space-y-2">
              <ShieldCheck className="w-4 h-4 text-brand-strong" />
              <h3 className="text-xs font-extrabold text-foreground">
                {factor.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {factor.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-foreground tracking-tight">
            How a loan request moves
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Six clear stages from first call to disbursal.
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

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-5 border-b border-border">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Recent loan requests
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Consultations, document help and lender coordination.
            </p>
          </div>
          <Link
            to="/loans/support"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover whitespace-nowrap"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-brand mx-auto" />
            <p className="text-sm font-bold text-foreground">
              No loan requests yet
            </p>
            <p className="text-xs text-muted-foreground">
              Raise a consultation and it will appear here with its status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/requests/${request.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface-muted/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {request.specificService}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {request.id.toUpperCase()} · {request.createdAt}
                  </p>
                </div>
                <Badge variant={STATUS_META[request.status].badge}>
                  {STATUS_META[request.status].label}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 bg-surface-muted/60">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">
              {COMPLIANCE.rbi.label}.
            </span>{" "}
            {COMPLIANCE.rbi.note} {COMPLIANCE.dpdp.note}
          </p>
        </div>
      </Card>

      <LoanRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Loan consultation"}
        defaultNotes={dialog?.notes ?? ""}
      />

      <LoanToolsDialog
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        onRequestReview={handleToolsReview}
      />
    </div>
  );
}
