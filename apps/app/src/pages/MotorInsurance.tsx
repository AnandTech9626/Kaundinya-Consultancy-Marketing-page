import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  Car,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge, Button, Card, FormField, Input, Stepper } from "@kaundinya/ui";
import type { PolicyRecord, VehicleInfo, VehicleQuote } from "@kaundinya/config";
import {
  getMotorQuote,
  lookupVehicle,
  purchaseMotorPolicy,
} from "../lib/mockApi";
import { formatINR } from "../lib/formats";

const STEPS = [
  { id: "vehicle", label: "Vehicle" },
  { id: "quote", label: "Quote" },
  { id: "policy", label: "Policy" },
];

export function MotorInsurance() {
  const [registration, setRegistration] = useState("TS09EA1234");
  const [busy, setBusy] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [quote, setQuote] = useState<VehicleQuote | null>(null);
  const [policy, setPolicy] = useState<PolicyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = policy ? 2 : quote ? 1 : 0;

  const handleLookup = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setVehicle(null);
    setQuote(null);
    setPolicy(null);
    try {
      const found = await lookupVehicle(registration);
      if (!found) {
        setError("We couldn't find that registration. Check the number and try again.");
        return;
      }
      setVehicle(found);
      const quotation = await getMotorQuote(found);
      setQuote(quotation);
    } catch {
      setError("Vehicle lookup failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async () => {
    if (!quote || busy) return;
    setBusy(true);
    setError(null);
    try {
      const created = await purchaseMotorPolicy(
        quote.plan.id,
        quote.vehicle,
        quote.addOns
      );
      setPolicy(created);
    } catch {
      setError("Payment could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setVehicle(null);
    setQuote(null);
    setPolicy(null);
    setError(null);
    setRegistration("");
  };

  return (
    <div className="space-y-6 max-w-3xl">
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
          Motor insurance fast lane
        </h1>
        <p className="text-muted mt-1">
          Enter your registration, confirm the vehicle, pay and get the policy PDF.
        </p>
      </div>

      <Card className="p-5">
        <Stepper steps={STEPS} current={stepIndex} />
      </Card>

      {error && (
        <Card className="p-4 border-rose-200 bg-rose-50">
          <p className="text-xs text-rose-700">{error}</p>
        </Card>
      )}

      {policy ? (
        <Card className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-charcoal tracking-tight">
              Policy issued
            </h2>
            <p className="text-sm text-muted">
              {policy.provider} · {policy.policyNumber}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-ivory p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                Vehicle
              </p>
              <p className="text-sm font-bold text-charcoal">
                {vehicle?.make} {vehicle?.model}
              </p>
              <p className="text-[11px] text-muted">{vehicle?.registrationNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                Cover
              </p>
              <p className="text-sm font-bold text-charcoal">
                {formatINR(policy.coverAmount)}
              </p>
              <p className="text-[11px] text-muted">
                Premium {formatINR(policy.premium)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                Valid from
              </p>
              <p className="text-sm font-bold text-charcoal">{policy.validFrom}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                Renewal
              </p>
              <p className="text-sm font-bold text-charcoal">{policy.renewalDate}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/insurance/policies"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
            >
              Open Policy Vault
            </Link>
            <Button variant="secondary" onClick={reset}>
              Insure another vehicle
            </Button>
          </div>
          <p className="text-[10px] text-muted-light text-center">
            Mock payment — the policy PDF would be emailed instantly in production.
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-5 sm:p-6">
            <form onSubmit={handleLookup} className="space-y-4">
              <FormField
                label="Vehicle registration number"
                htmlFor="motor-reg"
                required
              >
                <Input
                  id="motor-reg"
                  value={registration}
                  onChange={(event) =>
                    setRegistration(event.target.value.toUpperCase().slice(0, 13))
                  }
                  placeholder="TS09EA1234"
                />
              </FormField>
              <p className="text-[11px] text-muted leading-relaxed">
                We look up make, model and fuel type from the Vahan registry. Try{" "}
                <span className="font-bold text-charcoal">TS09EA1234</span>,{" "}
                <span className="font-bold text-charcoal">TS08FJ5678</span> or{" "}
                <span className="font-bold text-charcoal">TS10GH9012</span>.
              </p>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  "Find my vehicle"
                )}
              </Button>
            </form>
          </Card>

          {vehicle && quote && (
            <>
              <Card className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                  {vehicle.engineCC > 500 ? (
                    <Car className="w-6 h-6" />
                  ) : (
                    <Bike className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-charcoal">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-xs text-muted">
                    {vehicle.registrationNumber} · {vehicle.fuelType} · {vehicle.year} ·{" "}
                    {vehicle.engineCC} cc
                  </p>
                </div>
                <Badge variant="success">Found</Badge>
              </Card>

              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      {quote.plan.insurer}
                    </p>
                    <h2 className="text-lg font-extrabold text-charcoal">
                      {quote.plan.name}
                    </h2>
                  </div>
                  <Badge variant="gold">
                    {formatINR(quote.plan.sumInsured)} cover
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Base premium</span>
                    <span className="font-bold text-charcoal">
                      {formatINR(quote.plan.premium)}
                    </span>
                  </div>
                  {quote.addOns.map((addOn) => (
                    <div
                      key={addOn}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted">{addOn}</span>
                      <span className="font-bold text-charcoal">
                        {formatINR(1200)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                    <span className="text-sm font-bold text-charcoal">Total</span>
                    <span className="text-lg font-extrabold text-charcoal">
                      {formatINR(quote.totalPremium)}
                    </span>
                  </div>
                </div>

                <Button className="w-full" onClick={handlePay} disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Pay {formatINR(quote.totalPremium)} via UPI
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-muted-light text-center">
                  Payment is mocked. Policy PDF is issued immediately after payment.
                </p>
              </Card>
            </>
          )}
        </>
      )}

      <Card className="p-4 bg-ivory/60 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted leading-relaxed">
          Motor policies are distributed through an IRDAI-licensed POSP. Add-ons depend on
          vehicle age and insurer underwriting. Vahan lookup is mocked in this UI.
        </p>
      </Card>
    </div>
  );
}
