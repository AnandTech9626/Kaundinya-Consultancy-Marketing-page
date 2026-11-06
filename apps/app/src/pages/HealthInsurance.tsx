import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, Input } from "@kaundinya/ui";
import {
  HEALTH_CLAIM_STEPS,
  HEALTH_DOCUMENTS,
  HEALTH_FINE_PRINT,
} from "@kaundinya/config";
import { HOSPITALS, INSURANCE_PLANS } from "../lib/moduleData";
import { formatINR } from "../lib/formats";
import { InsuranceRequestDialog } from "../components/InsuranceRequestDialog";

const FAMILY_OPTIONS = [
  { id: "self", label: "Self", hint: "Individual cover" },
  { id: "couple", label: "Self + Spouse", hint: "Couple floater" },
  { id: "parents", label: "Parents", hint: "Senior citizen cover" },
] as const;

export function HealthInsurance() {
  const [family, setFamily] = useState("self");
  const [pincode, setPincode] = useState("500032");
  const [query, setQuery] = useState("500032");
  const [dialog, setDialog] = useState<{ service: string; kind: string } | null>(
    null
  );

  const plans = useMemo(
    () =>
      INSURANCE_PLANS.filter(
        (plan) => plan.type === "health" && plan.familyOption === family
      ),
    [family]
  );

  const network = useMemo(
    () =>
      query.length === 6
        ? HOSPITALS.filter((hospital) => hospital.pincode === query)
        : HOSPITALS,
    [query]
  );

  const cashlessCount = network.filter((hospital) => hospital.cashless).length;

  const openConsultation = (
    service = "",
    kind = "Insurance consultation"
  ) => setDialog({ service, kind });

  return (
    <div className="space-y-8">
      <Link
        to="/insurance"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to insurance
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
            Insurance · Health
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Health & family floater guidance
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Understand room-rent limits, waiting periods and cashless networks
            before you choose a family cover.
          </p>
        </div>
        <Button onClick={() => openConsultation("Health insurance review")}>
          <HeartPulse className="w-4 h-4" />
          Talk to a health consultant
        </Button>
      </div>

      <div>
        <p className="text-xs font-bold text-foreground mb-2">Who are you covering?</p>
        <div className="grid grid-cols-3 gap-2 max-w-2xl">
          {FAMILY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFamily(option.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                family === option.id
                  ? "border-brand bg-brand-soft/60"
                  : "border-border bg-surface hover:border-brand/60"
              }`}
            >
              <p className="text-xs font-extrabold text-foreground">
                {option.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                {option.hint}
              </p>
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            Options we can arrange
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indicative plans for discussion. A consultant confirms eligibility
            and final terms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.length === 0 ? (
            <Card className="p-8 text-center sm:col-span-2 space-y-2">
              <HeartPulse className="w-8 h-8 text-brand mx-auto" />
              <p className="text-sm font-bold text-foreground">
                No indicative plans for this option yet
              </p>
              <p className="text-xs text-muted-foreground">
                Raise a request and we will shortlist suitable plans for your
                family.
              </p>
            </Card>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} className="p-5 space-y-3 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {plan.insurer}
                    </p>
                    <h3 className="text-sm font-extrabold text-foreground">
                      {plan.name}
                    </h3>
                  </div>
                  <Badge variant="success">{formatINR(plan.sumInsured)} cover</Badge>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
                      Indicative annual premium
                    </p>
                    <p className="text-lg font-extrabold text-foreground">
                      {formatINR(plan.premium)}
                    </p>
                  </div>
                  {plan.cashlessNetwork && (
                    <p className="text-[11px] text-muted-foreground text-right">
                      {plan.cashlessNetwork.toLocaleString("en-IN")}
                      <br />
                      cashless hospitals
                    </p>
                  )}
                </div>

                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-1.5 text-[11px] text-foreground-soft"
                    >
                      <CheckCircle2 className="w-3 h-3 text-brand shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-auto w-full"
                  onClick={() =>
                    openConsultation(`${plan.insurer} ${plan.name}`, "Insurance consultation")
                  }
                >
                  Schedule consultation
                </Button>
              </Card>
            ))
          )}
        </div>
      </section>

      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand" />
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Cashless network near you
            </h2>
          </div>
          <div className="flex gap-2">
            <Input
              className="w-32"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(event) =>
                setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Pincode"
              aria-label="Network hospital pincode"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuery(pincode)}
              disabled={pincode.length !== 6}
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{cashlessCount}</span>{" "}
          cashless hospitals match pincode {query}. Network lists are
          indicative — confirm at admission.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {network.map((hospital) => (
            <div
              key={hospital.id}
              className="rounded-xl border border-border bg-surface px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {hospital.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{hospital.address}</p>
                </div>
                <Badge variant={hospital.cashless ? "success" : "neutral"}>
                  {hospital.cashless ? "Cashless" : "Reimbursement"}
                </Badge>
              </div>
              <p className="text-[10px] text-subtle-foreground mt-1">
                {hospital.pincode}
                {hospital.distanceKm ? ` · ${hospital.distanceKm} km` : ""}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            Decode the fine print
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            These four clauses decide how much a claim actually pays.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {HEALTH_FINE_PRINT.map((item) => (
            <Card key={item.title} className="p-5 space-y-2">
              <ShieldCheck className="w-5 h-5 text-brand-strong" />
              <h3 className="text-sm font-extrabold text-foreground">
                {item.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Claim support process
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cashless and reimbursement claims both follow the same support
              path.
            </p>
          </div>
          <ol className="space-y-3">
            {HEALTH_CLAIM_STEPS.map((step, index) => (
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
          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
              openConsultation("Health claim assistance", "Claim assistance")
            }
          >
            Get claim help
          </Button>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Keep these ready
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              A complete file avoids most claim queries.
            </p>
          </div>
          <ul className="space-y-2">
            {HEALTH_DOCUMENTS.map((document) => (
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
            Medical data is used only to service your request. We do not share
            it without your consent.
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-surface-muted/60 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Health insurance is issued by IRDAI-registered insurers. We help you
          review and coordinate; underwriting and claim decisions rest with the
          insurer.
        </p>
      </Card>

      <InsuranceRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Insurance consultation"}
      />
    </div>
  );
}
