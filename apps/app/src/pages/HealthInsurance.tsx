import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, Input, Skeleton } from "@kaundinya/ui";
import { COMPLIANCE } from "@kaundinya/config";
import {
  createRequest,
  fetchHospitals,
  fetchInsurancePlans,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatINR } from "../lib/formats";

const FAMILY_OPTIONS = [
  { id: "self", label: "Self", hint: "Individual cover" },
  { id: "couple", label: "Self + Spouse", hint: "Couple floater" },
  { id: "parents", label: "Parents", hint: "Senior citizen cover" },
];

export function HealthInsurance() {
  const [family, setFamily] = useState("self");
  const [pincode, setPincode] = useState("500084");
  const [query, setQuery] = useState("500084");
  const [requested, setRequested] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null);

  const { data, loading } = useAsync(fetchInsurancePlans);
  const { data: hospitals, loading: hospitalsLoading } = useAsync(
    () => fetchHospitals(query),
    [query]
  );

  const plans = (data ?? []).filter(
    (plan) => plan.type === "health" && plan.familyOption === family
  );
  const network = hospitals ?? [];
  const cashlessCount = network.filter((hospital) => hospital.cashless).length;

  const request = async (name: string) => {
    setRequesting(name);
    try {
      await createRequest({
        serviceCategory: "Insurance",
        specificService: `Health insurance · ${name}`,
        comments: "Requested from the health insurance page.",
      });
      setRequested(name);
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="space-y-8">
      <Link
        to="/insurance"
        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to insurance
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Insurance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Health & family floater
        </h1>
        <p className="text-muted mt-1 max-w-2xl">
          Pick who you're covering, compare family floaters and check the cashless network
          near you.
        </p>
      </div>

      {requested && (
        <Card className="p-4 border-emerald-200 bg-emerald-50 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700">
            Consultation requested for <span className="font-bold">{requested}</span>. We'll
            call to confirm before sharing a proposal.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2 max-w-2xl">
        {FAMILY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFamily(option.id)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
              family === option.id
                ? "border-gold bg-gold-light/60"
                : "border-border-subtle bg-white hover:border-gold/60"
            }`}
          >
            <p className="text-xs font-extrabold text-charcoal">{option.label}</p>
            <p className="text-[10px] text-muted mt-0.5 hidden sm:block">{option.hint}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="p-5 space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    {plan.insurer}
                  </p>
                  <h2 className="text-sm font-extrabold text-charcoal">{plan.name}</h2>
                </div>
                <Badge variant="success">{formatINR(plan.sumInsured)}</Badge>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                    Annual premium
                  </p>
                  <p className="text-lg font-extrabold text-charcoal">
                    {formatINR(plan.premium)}
                  </p>
                </div>
                {plan.cashlessNetwork && (
                  <p className="text-[11px] text-muted text-right">
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
                    className="flex items-start gap-1.5 text-[11px] text-charcoal-light"
                  >
                    <CheckCircle2 className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => request(`${plan.insurer} ${plan.name}`)}
                disabled={requesting === `${plan.insurer} ${plan.name}`}
              >
                {requesting === `${plan.insurer} ${plan.name}`
                  ? "Requesting..."
                  : "Schedule consultation"}
              </Button>
            </Card>
          ))
        )}
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold" />
            <h2 className="text-base font-extrabold text-charcoal tracking-tight">
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

        <p className="text-xs text-muted">
          <span className="font-bold text-charcoal">{cashlessCount}</span> cashless
          hospitals match pincode {query}. Network lists are indicative — confirm at
          admission.
        </p>

        {hospitalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {network.map((hospital) => (
              <div
                key={hospital.id}
                className="rounded-xl border border-border-subtle bg-white px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-charcoal">{hospital.name}</p>
                    <p className="text-[11px] text-muted">{hospital.address}</p>
                  </div>
                  <Badge variant={hospital.cashless ? "success" : "neutral"}>
                    {hospital.cashless ? "Cashless" : "Reimbursement"}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-light mt-1">
                  {hospital.pincode}
                  {hospital.distanceKm ? ` · ${hospital.distanceKm} km` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-start gap-3">
          <HeartPulse className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-charcoal">Parents' cover</p>
            <p className="text-xs text-muted mt-0.5">
              Senior-citizen plans need extra scrutiny on pre-existing conditions and
              waiting periods — we walk through both.
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-charcoal">Medical data privacy</p>
            <p className="text-xs text-muted mt-0.5">{COMPLIANCE.dpdp.note}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
