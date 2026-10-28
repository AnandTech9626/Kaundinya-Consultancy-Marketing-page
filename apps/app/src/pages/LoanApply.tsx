import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Search,
} from "lucide-react";
import {
  Button,
  Card,
  FileDropzone,
  FormField,
  Input,
  RangeField,
  Select,
  Wizard,
} from "@kaundinya/ui";
import type { GstinInfo, LoanApplication } from "@kaundinya/config";
import { submitLoanApplication, lookupGstin } from "../lib/mockApi";
import { useAuth } from "../lib/auth";
import { formatINR } from "../lib/formats";

type LoanType = LoanApplication["loanType"];

const TYPE_MAP: Record<string, LoanType> = {
  home: "Home",
  personal: "Personal",
  business: "Business",
  mortgage: "Mortgage",
};

const TYPE_LABEL: Record<LoanType, string> = {
  Home: "Home loan",
  Personal: "Personal loan",
  Business: "Business loan",
  Mortgage: "Loan against property",
};

const TYPE_MAX: Record<LoanType, number> = {
  Home: 10000000,
  Personal: 2000000,
  Business: 5000000,
  Mortgage: 20000000,
};

const REQUIRED_DOCS: Record<LoanType, string[]> = {
  Home: ["PAN", "Aadhaar", "3 months payslips", "6 months bank statement", "ITR"],
  Personal: ["PAN", "Aadhaar", "Income proof", "Bank statement"],
  Business: ["GSTIN", "P&L statement", "ITR", "Bank statement"],
  Mortgage: ["Title deed", "Valuation report", "PAN", "Aadhaar", "Income proof"],
};

const TENURES = [12, 24, 36, 60, 120, 180, 240, 300, 360];

export function LoanApply() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialType = TYPE_MAP[params.get("type") ?? "home"] ?? "Home";

  const [loanType, setLoanType] = useState<LoanType>(initialType);
  const [employment, setEmployment] =
    useState<"salaried" | "self-employed">("salaried");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState(3000000);
  const [tenure, setTenure] = useState(240);
  const [income, setIncome] = useState(100000);
  const [gstin, setGstin] = useState("");
  const [gstinInfo, setGstinInfo] = useState<GstinInfo | null>(null);
  const [gstinBusy, setGstinBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<LoanApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredDocs = REQUIRED_DOCS[loanType];

  const lookup = async () => {
    if (!gstin.trim()) return;
    setGstinBusy(true);
    try {
      const info = await lookupGstin(gstin);
      setGstinInfo(info);
    } finally {
      setGstinBusy(false);
    }
  };

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const loan = await submitLoanApplication({
        loanType,
        amount,
        tenureMonths: tenure,
        monthlyIncome: income,
        employmentType: employment,
        purpose: purpose.trim() || TYPE_LABEL[loanType],
        documents: files.length > 0 ? files.map((file) => file.name) : requiredDocs,
      });
      setCreated(loan);
    } catch {
      setError("We couldn't submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = (
    <Link
      to="/loans"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to loans
    </Link>
  );

  if (created) {
    return (
      <div className="space-y-6 max-w-2xl">
        {backLink}
        <Card className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
              Application started
            </h1>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">
              {user?.name?.split(" ")[0] ?? "Your"} {TYPE_LABEL[created.loanType].toLowerCase()}{" "}
              for {formatINR(created.amount)} is now in verification. An advisor will call
              you about documents.
            </p>
          </div>
          <div className="rounded-xl bg-ivory p-4 text-left space-y-1">
            <p className="text-sm font-bold text-charcoal">{TYPE_LABEL[created.loanType]}</p>
            <p className="text-xs text-muted">
              {formatINR(created.amount)} · {Math.round((created.tenureMonths ?? 0) / 12)}{" "}
              years · {created.employmentType}
            </p>
            <p className="text-[11px] text-muted-light">
              Reference #{created.id.toUpperCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/loans/applications/${created.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
            >
              Track application
            </Link>
            <Link
              to="/loans"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-white text-charcoal text-sm font-bold hover:border-gold/60 transition-colors"
            >
              Back to loans
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {backLink}

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Loans
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Apply for a loan
        </h1>
        <p className="text-muted mt-1">
          Four short steps. We verify documents and route your file to the right lender.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <Wizard
          steps={[
            {
              id: "type",
              title: "What do you need?",
              description: "Pick the product and how you earn.",
              validate: () => purpose.trim().length >= 5,
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(TYPE_LABEL) as LoanType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setLoanType(type);
                          setAmount(Math.min(amount, TYPE_MAX[type]));
                        }}
                        className={`rounded-xl border px-3 py-3 text-left transition-colors cursor-pointer ${
                          loanType === type
                            ? "border-gold bg-gold-light/60"
                            : "border-border-subtle bg-white hover:border-gold/60"
                        }`}
                      >
                        <p className="text-xs font-extrabold text-charcoal">
                          {TYPE_LABEL[type]}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-charcoal mb-1.5">Employment</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["salaried", "self-employed"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setEmployment(option)}
                          className={`rounded-lg border px-3 py-2.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                            employment === option
                              ? "border-gold bg-gold-light/60 text-charcoal"
                              : "border-border-subtle bg-white text-muted hover:border-gold/60"
                          }`}
                        >
                          {option.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <FormField
                    label="Purpose"
                    htmlFor="loan-purpose"
                    required
                    error={
                      purpose.length > 0 && purpose.trim().length < 5
                        ? "Add a little more detail"
                        : undefined
                    }
                  >
                    <Input
                      id="loan-purpose"
                      value={purpose}
                      onChange={(event) => setPurpose(event.target.value)}
                      placeholder="e.g. Apartment purchase in Kondapur"
                    />
                  </FormField>
                </div>
              ),
            },
            {
              id: "amount",
              title: "Amount, tenure & income",
              description: "This helps us match you with the right lender.",
              validate: () => amount > 0 && income > 0,
              content: (
                <div className="space-y-5">
                  <RangeField
                    label="Loan amount"
                    value={amount}
                    min={100000}
                    max={TYPE_MAX[loanType]}
                    step={100000}
                    onChange={setAmount}
                    format={(value) => formatINR(value)}
                  />
                  <FormField label="Tenure" htmlFor="loan-tenure">
                    <Select
                      id="loan-tenure"
                      value={tenure}
                      onChange={(event) => setTenure(Number(event.target.value))}
                    >
                      {TENURES.map((months) => (
                        <option key={months} value={months}>
                          {months >= 12
                            ? `${Math.round(months / 12)} year${months > 12 ? "s" : ""}`
                            : `${months} months`}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <RangeField
                    label="Monthly income"
                    value={income}
                    min={20000}
                    max={500000}
                    step={5000}
                    onChange={setIncome}
                    format={(value) => formatINR(value)}
                  />

                  {loanType === "Business" && (
                    <div className="rounded-xl border border-border-subtle bg-ivory/60 p-3 space-y-2">
                      <p className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gold" />
                        GSTIN autofill
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={gstin}
                          onChange={(event) =>
                            setGstin(event.target.value.toUpperCase().slice(0, 15))
                          }
                          placeholder="15-character GSTIN"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={lookup}
                          disabled={gstin.replace(/\s/g, "").length !== 15 || gstinBusy}
                        >
                          {gstinBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          Look up
                        </Button>
                      </div>
                      {gstinInfo && (
                        <div className="rounded-lg bg-white border border-border-subtle px-3 py-2">
                          <p className="text-xs font-bold text-charcoal">
                            {gstinInfo.legalName}
                          </p>
                          <p className="text-[11px] text-muted">{gstinInfo.address}</p>
                          <p className="text-[10px] text-muted-light">
                            Turnover: {gstinInfo.turnover}
                          </p>
                        </div>
                      )}
                      {gstin.length === 15 && !gstinInfo && !gstinBusy && (
                        <p className="text-[10px] text-muted-light">
                          Tap "Look up" to autofill business details.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ),
            },
            {
              id: "documents",
              title: "Documents",
              description: "Upload what you have. We can collect the rest later.",
              content: (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {requiredDocs.map((document) => (
                      <span
                        key={document}
                        className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-medium text-muted"
                      >
                        {document}
                      </span>
                    ))}
                  </div>
                  <FileDropzone
                    files={files}
                    onChange={setFiles}
                    accept="image/*,.pdf"
                    label="Upload payslips, ITR or bank statements"
                    hint="PDF or image up to 10 MB. Auto-compressed where possible."
                  />
                  <p className="text-[11px] text-muted leading-relaxed">
                    You can submit now and share the remaining documents with your advisor.
                    Files are encrypted and never shared without consent.
                  </p>
                </div>
              ),
            },
            {
              id: "review",
              title: "Review & submit",
              description: "Check the details before we start verification.",
              content: (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border-subtle bg-ivory p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Product</span>
                      <span className="font-bold text-charcoal">
                        {TYPE_LABEL[loanType]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Amount</span>
                      <span className="font-bold text-charcoal">
                        {formatINR(amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Tenure</span>
                      <span className="font-bold text-charcoal">
                        {Math.round(tenure / 12)} years
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Employment</span>
                      <span className="font-bold text-charcoal capitalize">
                        {employment.replace("-", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Purpose</span>
                      <span className="font-bold text-charcoal text-right max-w-[60%]">
                        {purpose}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Documents</span>
                      <span className="font-bold text-charcoal">
                        {files.length > 0 ? `${files.length} uploaded` : "To collect"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold-light/60 p-3">
                    <CheckCircle2 className="w-4 h-4 text-[#8a6b1a] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#6b5413] leading-relaxed">
                      Submitting starts a soft verification. No hard credit check is made
                      without your explicit consent.
                    </p>
                  </div>

                  {error && <p className="text-[11px] text-rose-600">{error}</p>}
                </div>
              ),
            },
          ]}
          onComplete={handleComplete}
          submitting={submitting}
          completeLabel="Submit application"
        />
      </Card>
    </div>
  );
}
