import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileText,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Badge, Card, Skeleton, StatusTimeline } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import { MODULE_STAGES } from "@kaundinya/config";
import { fetchLoanApplication } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const STAGES = MODULE_STAGES.loans;

const STAGE_BADGE: Record<string, BadgeVariant> = {
  application: "gold",
  verified: "info",
  submitted: "warning",
  approved: "success",
  disbursed: "success",
};

export function LoanDetail() {
  const { id } = useParams();
  const { data: loan, loading, error, refetch } = useAsync(
    () => fetchLoanApplication(id ?? ""),
    [id]
  );

  const backLink = (
    <Link
      to="/loans"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to loans
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        {backLink}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">
            {error ? "We couldn't load this application." : "Application not found."}
          </p>
          {error && (
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
            >
              Try again
            </button>
          )}
        </Card>
      </div>
    );
  }

  const stage = STAGES.find((item) => item.id === loan.status);

  return (
    <div className="space-y-6 max-w-3xl">
      {backLink}

      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                {loan.id.toUpperCase()}
              </p>
              <h1 className="text-xl font-extrabold text-charcoal tracking-tight">
                {loan.loanType} loan
              </h1>
              <p className="text-sm font-bold text-charcoal-light mt-0.5">
                {formatINR(loan.amount)} · {Math.round((loan.tenureMonths ?? 0) / 12)} years
              </p>
            </div>
          </div>
          <Badge variant={STAGE_BADGE[loan.status] ?? "neutral"}>
            {stage?.label ?? loan.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border-subtle pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
              Lender
            </p>
            <p className="text-sm font-bold text-charcoal mt-0.5">
              {loan.bank ?? "Matching"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
              Monthly income
            </p>
            <p className="text-sm font-bold text-charcoal mt-0.5">
              {loan.monthlyIncome ? formatINR(loan.monthlyIncome) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
              Employment
            </p>
            <p className="text-sm font-bold text-charcoal mt-0.5 capitalize">
              {loan.employmentType?.replace("-", " ") ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
              Started
            </p>
            <p className="text-sm font-bold text-charcoal mt-0.5">
              {formatDate(loan.createdAt)}
            </p>
          </div>
        </div>

        {loan.purpose && (
          <div className="border-t border-border-subtle pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
              Purpose
            </p>
            <p className="text-sm text-charcoal-light mt-0.5">{loan.purpose}</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-5">
          Application progress
        </h2>
        <StatusTimeline
          stages={STAGES.map((item) => ({
            id: item.id,
            label: item.label,
            description: item.description,
          }))}
          currentId={loan.status}
        />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-extrabold text-charcoal">Documents</h2>
          </div>
          {loan.documents && loan.documents.length > 0 ? (
            <ul className="space-y-1.5">
              {loan.documents.map((document) => (
                <li
                  key={document}
                  className="flex items-center gap-2 text-xs text-charcoal-light"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {document}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">No documents listed yet.</p>
          )}
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-extrabold text-charcoal">Your advisor</h2>
          </div>
          {loan.advisor ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-charcoal">{loan.advisor}</p>
              <p className="text-xs text-muted flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Available 10 AM – 7 PM
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted">
              An advisor will be assigned once verification starts. We'll notify you.
            </p>
          )}
          <Link
            to="/loans"
            className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
          >
            Consult a financial advisor
          </Link>
        </Card>
      </div>

      {(loan.status === "application" || loan.status === "verified") && (
        <Card className="p-5 border-amber-200 bg-amber-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-charcoal">
                Is this application moving slowly?
              </p>
              <p className="text-xs text-muted mt-0.5">
                If verification is taking longer than expected, a Kaundinya financial
                advisor can review the file and suggest the next step.
              </p>
            </div>
          </div>
          <Link
            to="/services/loans"
            className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-xs font-bold"
          >
            Consult an advisor
          </Link>
        </Card>
      )}
    </div>
  );
}
