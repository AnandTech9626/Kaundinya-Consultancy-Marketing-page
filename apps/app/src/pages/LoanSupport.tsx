import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquare,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card } from "@kaundinya/ui";
import {
  COMPLIANCE,
  LOAN_GUIDE,
  LOAN_SUPPORT_DOCUMENTS,
  LOAN_SUPPORT_STEPS,
  LOAN_SUPPORT_TOPICS,
} from "@kaundinya/config";
import { useLoanRequests } from "../lib/mockRequests";
import { STATUS_META } from "../lib/status";
import { LoanRequestDialog } from "../components/LoanRequestDialog";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  eligibility: ShieldCheck,
  documents: FileText,
  lender: Wallet,
  sanction: CheckCircle2,
};

export function LoanSupport() {
  const requests = useLoanRequests();
  const [dialog, setDialog] = useState<{ service: string; kind: string } | null>(
    null
  );

  const openRequest = (kind: string, service = "") =>
    setDialog({ service, kind });

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
            Loans · Support
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Loan documentation and lender support
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Eligibility checks, document preparation, lender coordination and
            sanction follow-up. No application is submitted here.
          </p>
        </div>
        <Button onClick={() => openRequest("Loan consultation")}>
          <ShieldCheck className="w-4 h-4" />
          Raise a support request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {LOAN_SUPPORT_TOPICS.map((topic) => {
          const Icon = TOPIC_ICONS[topic.id] ?? MessageSquare;
          return (
            <Card key={topic.id} className="p-5 space-y-2 flex flex-col">
              <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-foreground">
                {topic.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {topic.description}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-auto w-full"
                onClick={() => openRequest(topic.title)}
              >
                Start request
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              How support works
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Four steps, one reference number.
            </p>
          </div>
          <ol className="space-y-3">
            {LOAN_SUPPORT_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-soft text-brand-strong text-[11px] font-extrabold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">{step.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Documents to keep ready
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              You can start the request before you have everything.
            </p>
          </div>
          <ul className="space-y-2">
            {LOAN_SUPPORT_DOCUMENTS.map((document) => (
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
            We never ask for payment to raise a loan support request. Lender fees
            are paid directly to the lender.
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-extrabold text-foreground tracking-tight">
          Before you borrow
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LOAN_GUIDE.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-xs text-foreground-soft"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-extrabold text-foreground tracking-tight">
            My loan requests
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Consultations, documents and lender coordination from this account.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-brand mx-auto" />
            <p className="text-sm font-bold text-foreground">No requests yet</p>
            <p className="text-xs text-muted-foreground">
              Raise a support request and it will appear here with its status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {requests.map((request) => (
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
