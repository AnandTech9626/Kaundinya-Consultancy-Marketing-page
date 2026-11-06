import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  Car,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
} from "@kaundinya/ui";
import type { VehicleInfo } from "@kaundinya/config";
import { MOTOR_CLAIM_STEPS, MOTOR_RENEWAL_CHECKS } from "@kaundinya/config";
import { VEHICLES } from "../lib/moduleData";
import { InsuranceRequestDialog } from "../components/InsuranceRequestDialog";

export function MotorInsurance() {
  const [registration, setRegistration] = useState("TS09EA1234");
  const [busy, setBusy] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ service: string; kind: string } | null>(
    null
  );

  const handleLookup = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setVehicle(null);

    const normalized = registration.replace(/\s+/g, "").toUpperCase();
    const found = VEHICLES.find(
      (entry) => entry.registrationNumber === normalized
    );

    window.setTimeout(() => {
      if (!found) {
        setError(
          "We couldn't find that registration in the demo registry. Try TS09EA1234, TS08FJ5678 or TS10GH9012."
        );
      } else {
        setVehicle(found);
      }
      setBusy(false);
    }, 400);
  };

  const openRequest = (service: string, kind: string) =>
    setDialog({ service, kind });

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        to="/insurance"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to insurance
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
          Insurance · Motor
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Motor renewal and claim guidance
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Check the vehicle, understand the renewal levers and get help with a
          claim. No quote or payment happens here.
        </p>
      </div>

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
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Demo registrations:{" "}
            <span className="font-bold text-foreground">TS09EA1234</span>,{" "}
            <span className="font-bold text-foreground">TS08FJ5678</span> or{" "}
            <span className="font-bold text-foreground">TS10GH9012</span>.
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

        {error && (
          <p className="mt-4 rounded-lg border border-danger-fg/20 bg-danger-soft px-3 py-2 text-xs text-danger-fg">
            {error}
          </p>
        )}
      </Card>

      {vehicle && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
              {vehicle.engineCC > 500 ? (
                <Car className="w-6 h-6" />
              ) : (
                <Bike className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-foreground">
                {vehicle.make} {vehicle.model}
              </p>
              <p className="text-xs text-muted-foreground">
                {vehicle.registrationNumber} · {vehicle.fuelType} ·{" "}
                {vehicle.year} · {vehicle.engineCC} cc
              </p>
            </div>
            <Badge variant="success">Found</Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 border-t border-border pt-4">
            <Button
              onClick={() =>
                openRequest(
                  `Motor renewal · ${vehicle.registrationNumber}`,
                  "Renewal help"
                )
              }
            >
              <RefreshCw className="w-4 h-4" />
              Start renewal request
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                openRequest(
                  `Motor claim · ${vehicle.registrationNumber}`,
                  "Claim assistance"
                )
              }
            >
              Get claim help
            </Button>
          </div>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            What we check before renewal
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Five levers that change the premium and the claim experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOTOR_RENEWAL_CHECKS.map((item) => (
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

      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-foreground tracking-tight">
            If you need to claim
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep the sequence right; repairs before survey approval can reduce
            the settlement.
          </p>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MOTOR_CLAIM_STEPS.map((step, index) => (
            <li
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
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-4 bg-surface-muted/60 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Vehicle data shown here is demo data. Renewals and claims are
          coordinated with the insurer; final terms depend on underwriting and
          survey.
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
