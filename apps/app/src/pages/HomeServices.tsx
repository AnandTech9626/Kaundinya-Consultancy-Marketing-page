import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LayoutGrid,
  Loader2,
  Ruler,
  Shield,
  Snowflake,
  Sofa,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Badge,
  CalendarSlotPicker,
  Card,
  FormField,
  Input,
  PillSelect,
  PincodeInput,
  Select,
  Textarea,
} from "@kaundinya/ui";
import type { SlotValue } from "@kaundinya/ui";
import { MODULE_STAGES, SERVICE_CATALOG } from "@kaundinya/config";
import {
  bookMeasurement,
  createInteriorConsultation,
  createJob,
  fetchInteriorConsultations,
  fetchJobs,
  fetchMeasurements,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../lib/auth";
import { InfoTip } from "../components/InfoTip";

const HOME_SERVICES = SERVICE_CATALOG.filter(
  (item) => item.categoryId === "property-home-services"
);

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "hs-nets": Shield,
  "hs-grills": LayoutGrid,
  "hs-ac": Snowflake,
  "hs-electrical": Zap,
  "hs-interiors": Sofa,
};

const SHORT_NAMES: Record<string, string> = {
  "hs-nets": "Safety nets",
  "hs-grills": "Invisible grills",
  "hs-ac": "AC & fridge",
  "hs-electrical": "Electrical & plumbing",
  "hs-interiors": "Interiors",
};

const STYLES = ["Warm minimal", "Contemporary", "Traditional", "Industrial", "Scandi"];
const BUDGETS = ["Essential", "Mid-range", "Premium", "Luxury", "Not sure yet"];

const TRACKER_STAGES = MODULE_STAGES["property-home-services"];

type RequestResult = {
  kind: "job" | "measurement" | "interior";
  id: string;
};

const MEASUREMENT_STAGES = [
  { id: "requested", label: "Requested" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
];

const INTERIOR_STAGES = [
  { id: "requested", label: "Requested" },
  { id: "contacted", label: "Contacted" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
];

type TrackedRequest = {
  id: string;
  kind: "job" | "measurement" | "interior";
  label: string;
  detail: string;
  status: string;
  href: string;
};

function statusBadgeVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "requested") return "warning" as const;
  if (status === "in_progress") return "warning" as const;
  return "info" as const;
}

export function HomeServices() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const requestedService = params.get("service");
  const initialService = HOME_SERVICES.some(
    (item) => item.id === requestedService,
  )
    ? (requestedService as string)
    : (HOME_SERVICES[0]?.id ?? "");

  const { data: jobs, refetch: refetchJobs } = useAsync(fetchJobs);
  const { data: measurements, refetch: refetchMeasurements } =
    useAsync(fetchMeasurements);
  const { data: interiors, refetch: refetchInteriors } = useAsync(
    fetchInteriorConsultations,
  );

  const [serviceId, setServiceId] = useState(initialService);

  useEffect(() => {
    if (
      requestedService &&
      HOME_SERVICES.some((item) => item.id === requestedService)
    ) {
      setServiceId(requestedService);
    }
  }, [requestedService]);
  const [tierId, setTierId] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [pincode, setPincode] = useState("");
  const [slot, setSlot] = useState<SlotValue | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [budget, setBudget] = useState(BUDGETS[2]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RequestResult | null>(null);

  const service = HOME_SERVICES.find((item) => item.id === serviceId);
  const isInterior = service?.id === "hs-interiors";
  const isMeasurement = service?.pricing?.model === "per-sqft";
  const Icon = service ? SERVICE_ICONS[service.id] ?? Wrench : Wrench;
  const chosenTier = service?.tiers?.find((tier) => tier.id === tierId);
  const fullAddress = [address.trim(), locality.trim()]
    .filter(Boolean)
    .join(", ");

  const activeJob = (jobs ?? []).find((job) =>
    ["requested", "assigned", "en_route", "in_progress"].includes(job.status),
  );
  const activeStageIndex = activeJob
    ? TRACKER_STAGES.findIndex((stage) => stage.id === activeJob.status)
    : -1;
  const activeProgress =
    activeStageIndex < 0
      ? 0
      : ((activeStageIndex + 1) / TRACKER_STAGES.length) * 100;

  const flowStages = isInterior
    ? INTERIOR_STAGES
    : isMeasurement
      ? MEASUREMENT_STAGES
      : TRACKER_STAGES;

  const currentRequest: TrackedRequest | null = (() => {
    if (!service) return null;

    if (isInterior) {
      const latest = interiors?.[0];
      if (!latest) return null;
      return {
        id: latest.id,
        kind: "interior",
        label: `Interior consultation · ${latest.style}`,
        detail: `Budget: ${latest.budget}`,
        status: latest.status,
        href: "/home-services/interiors",
      };
    }

    if (isMeasurement) {
      const latest = (measurements ?? []).find(
        (item) => item.serviceId === service.id,
      );
      if (!latest) return null;
      return {
        id: latest.id,
        kind: "measurement",
        label: latest.serviceName,
        detail: `${latest.date} · ${latest.slot}`,
        status: latest.status,
        href: "/dashboard",
      };
    }

    const latest = (jobs ?? []).find(
      (item) => item.serviceId === service.id,
    );
    if (!latest) return null;
    return {
      id: latest.id,
      kind: "job",
      label: latest.serviceName,
      detail: [latest.technician ?? "Technician being assigned", latest.scheduledAt]
        .filter(Boolean)
        .join(" · "),
      status: latest.status,
      href: `/jobs/${latest.id}`,
    };
  })();

  const trackIndex = currentRequest
    ? flowStages.findIndex((stage) => stage.id === currentRequest.status)
    : -1;
  const trackProgress =
    trackIndex < 0 ? 0 : ((trackIndex + 1) / flowStages.length) * 100;

  const canSubmit =
    name.trim().length >= 2 &&
    /^\d{10}$/.test(mobile) &&
    !submitting &&
    (isInterior ||
      (address.trim().length >= 5 &&
        /^\d{6}$/.test(pincode) &&
        Boolean(slot?.slot)));

  const chooseService = (id: string) => {
    setServiceId(id);
    setTierId("");
    setIssues([]);
    setSlot(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !service) return;
    setSubmitting(true);
    setError(null);

    try {
      if (isInterior) {
        const created = await createInteriorConsultation({
          name: name.trim(),
          mobile,
          style,
          budget,
          notes: notes.trim() || undefined,
        });
        setResult({ kind: "interior", id: created.id });
        refetchInteriors();
      } else if (isMeasurement) {
        if (!slot?.slot) return;
        const created = await bookMeasurement({
          serviceId: service.id,
          serviceName: service.name,
          address: fullAddress,
          pincode,
          date: slot.date,
          slot: slot.slot,
          notes: notes.trim() || undefined,
        });
        setResult({ kind: "measurement", id: created.id });
        refetchMeasurements();
      } else {
        if (!slot?.slot) return;
        const created = await createJob({
          serviceId: service.id,
          serviceName: chosenTier
            ? `${service.name} · ${chosenTier.label}`
            : service.name,
          issueTypes: issues,
          address: fullAddress,
          pincode,
          date: slot.date,
          slot: slot.slot,
          notes: notes.trim() || undefined,
        });
        setResult({ kind: "job", id: created.id });
        refetchJobs();
      }
    } catch {
      setError("We couldn't submit this request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
          Home Services
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Vetted help for your home
          </h1>
          <InfoTip
            label="About Home Services"
            text="Book measurements and home-service jobs, track the assigned technician, and request an interior consultation. All coordination stays in one place."
          />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Measurements, installations and repairs coordinated by our team.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {HOME_SERVICES.map((item) => {
            const ServiceIcon = SERVICE_ICONS[item.id] ?? Wrench;
            const selected = serviceId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseService(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  selected
                    ? "border-brand bg-brand-soft/60 text-foreground"
                    : "border-border bg-surface text-foreground hover:border-brand/60"
                }`}
              >
                <ServiceIcon
                  className={`w-3.5 h-3.5 ${selected ? "text-brand-strong" : "text-muted-foreground"}`}
                />
                {SHORT_NAMES[item.id] ?? item.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/home-services/interiors"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border hover:border-brand/60 text-foreground text-sm font-bold transition-colors"
          >
            <Sofa className="w-4 h-4" />
            Interiors
          </Link>
        </div>
      </div>

      {activeJob && (
        <Link to={`/jobs/${activeJob.id}`} className="block">
          <Card hoverable className="p-4 sm:p-5 border-brand/40 bg-brand-soft/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-surface text-brand-strong flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-strong">
                    Active job
                  </p>
                  <p className="text-sm font-extrabold text-foreground">
                    {activeJob.serviceName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeJob.technician ?? "Technician being assigned"}
                    {activeJob.scheduledAt ? ` · ${activeJob.scheduledAt}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{activeJob.status.replace("_", " ")}</Badge>
                <ArrowRight className="w-4 h-4 text-brand" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-1">
                {TRACKER_STAGES.map((stage, index) => {
                  const done = index <= activeStageIndex;
                  return (
                    <div
                      key={stage.id}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold ${
                          done
                            ? "bg-brand text-on-brand"
                            : "border border-border bg-surface text-subtle-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`text-[9px] font-bold leading-tight ${
                          done ? "text-foreground" : "text-subtle-foreground"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${activeProgress}%` }}
                />
              </div>
            </div>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          id="request-form"
          className="lg:col-span-2 p-5 sm:p-6 space-y-5"
          style={{ borderRadius: 2 }}
        >
          <div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">
              Request a home service
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Pick a service, tell us the location and slot. Our team confirms and
              assigns a vetted technician.
            </p>
          </div>

          {result ? (
            <div className="rounded-2xl border border-success-fg/20 bg-success-soft/50 p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-surface text-success-fg flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                  {result.kind === "interior"
                    ? "Consultation requested"
                    : result.kind === "measurement"
                      ? "Measurement booked"
                      : "Booking requested"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {result.kind === "interior"
                    ? "Our designer will call you to understand the space and schedule a visit."
                    : result.kind === "measurement"
                      ? "Our surveyor will call you to confirm the visit. Measurement is free."
                      : "We'll assign a vetted technician and confirm the slot by phone."}
                </p>
                <p className="text-[10px] text-subtle-foreground mt-2">
                  Reference #{result.id.toUpperCase()}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {result.kind === "job" && (
                  <Link
                    to={`/jobs/${result.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold"
                  >
                    Track this job
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {result.kind === "measurement" && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold"
                  >
                    View on dashboard
                  </Link>
                )}
                {result.kind === "interior" && (
                  <Link
                    to="/home-services/interiors"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold"
                  >
                    See interiors
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-foreground text-sm font-bold hover:border-brand/60 transition-colors cursor-pointer"
                >
                  Request another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isInterior ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Preferred style" htmlFor="hs-style">
                      <Select
                        id="hs-style"
                        value={style}
                        onChange={(event) => setStyle(event.target.value)}
                      >
                        {STYLES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField label="Budget range" htmlFor="hs-budget">
                      <Select
                        id="hs-budget"
                        value={budget}
                        onChange={(event) => setBudget(event.target.value)}
                      >
                        {BUDGETS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                </>
              ) : (
                <>
                  {service?.tiers && service.tiers.length > 0 && (
                    <FormField label="Service tier" htmlFor="hs-tier">
                      <Select
                        id="hs-tier"
                        value={tierId}
                        onChange={(event) => setTierId(event.target.value)}
                      >
                        <option value="">Not sure yet</option>
                        {service.tiers.map((tier) => (
                          <option key={tier.id} value={tier.id}>
                            {tier.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  )}

                  {service?.issueTypes && service.issueTypes.length > 0 && (
                    <PillSelect
                      label="What do you need help with?"
                      options={service.issueTypes}
                      value={issues}
                      onChange={setIssues}
                    />
                  )}

                  <FormField label="Address" htmlFor="hs-address" required>
                    <Input
                      id="hs-address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Flat / house, street, landmark"
                    />
                  </FormField>

                  <PincodeInput
                    value={pincode}
                    onChange={setPincode}
                    locality={locality}
                    onLocalityChange={setLocality}
                  />

                  <CalendarSlotPicker value={slot} onChange={setSlot} days={5} />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Name" htmlFor="hs-name" required>
                  <Input
                    id="hs-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full name"
                  />
                </FormField>
                <FormField label="Mobile" htmlFor="hs-mobile" required>
                  <Input
                    id="hs-mobile"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(event) =>
                      setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile"
                  />
                </FormField>
              </div>

              <FormField label="Notes (optional)" htmlFor="hs-notes">
                <Textarea
                  id="hs-notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Anything we should know before the visit?"
                />
              </FormField>

              {error && <p className="text-[11px] text-danger-fg">{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 py-3 text-sm font-bold text-on-brand transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : isInterior ? (
                  "Request consultation"
                ) : isMeasurement ? (
                  "Book free measurement"
                ) : (
                  "Request booking"
                )}
              </button>

              <p className="text-[10px] text-subtle-foreground text-center leading-relaxed">
                No payment now. We confirm the slot and price before work starts.
              </p>
            </form>
          )}
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Card className="h-fit p-5 space-y-4" style={{ borderRadius: 2 }}>
          {service ? (
            <>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold tracking-tight text-foreground">
                    {service.name}
                  </h2>
                  {isMeasurement && (
                    <div className="mt-1">
                      <Badge variant="success">Free measurement</Badge>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {service.summary}
              </p>

              <p className="rounded-md bg-surface-muted p-2 text-[10px] leading-relaxed text-muted-foreground">
                Price is confirmed by our team after the{" "}
                {isMeasurement ? "measurement" : "consultation"}.
              </p>

              {isMeasurement && (
                <p className="flex items-start gap-1.5 rounded-md bg-surface-muted p-2 text-[11px] text-[#6b5413]">
                  <Ruler className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                  We measure on site first, then confirm the final quote.
                </p>
              )}

              {service.tiers && service.tiers.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Service tiers
                  </h3>
                  <div className="space-y-1.5">
                    {service.tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-start justify-between gap-2 rounded-md border border-border p-2"
                      >
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {tier.label}
                          </p>
                          {tier.description && (
                            <p className="text-[10px] text-muted-foreground">
                              {tier.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {service.issueTypes && service.issueTypes.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Common issues we fix
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {service.issueTypes.map((issue) => (
                      <span
                        key={issue}
                        className="rounded-md bg-surface-muted px-2 py-1 text-[10px] font-semibold text-foreground"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {service.highlights && service.highlights.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    What's included
                  </h3>
                  <ul className="space-y-1.5">
                    {service.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-1.5 text-[11px] text-foreground-soft"
                      >
                        <CheckCircle2 className="mt-0.5 w-3.5 h-3.5 shrink-0 text-brand" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {service.documents && service.documents.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Documents to keep ready
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {service.documents.map((document) => (
                      <span
                        key={document}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-foreground-soft"
                      >
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        {document}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {service.id === "hs-interiors" && (
                <div className="space-y-2 rounded-md bg-surface-muted p-3">
                  <p className="text-[11px] font-bold text-foreground">
                    Interiors & modular fitout
                  </p>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    Modular kitchen, wardrobes, storage, false ceiling, lighting and
                    material selection.
                  </p>
                  <Link
                    to="/home-services/interiors"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover"
                  >
                    View portfolio
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <Link
                to={
                  service.id === "hs-interiors"
                    ? "/home-services/interiors"
                    : `/home-services/${service.id}`
                }
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover"
              >
                View full details
                <ArrowRight className="w-3 h-3" />
              </Link>

            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Select a service to see details.
            </p>
          )}
          </Card>

          {service && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Request status
                </h3>
                {currentRequest ? (
                  <Badge variant={statusBadgeVariant(currentRequest.status)}>
                    {currentRequest.status.replace(/_/g, " ")}
                  </Badge>
                ) : (
                  <span className="text-[10px] font-semibold text-subtle-foreground">
                    No request yet
                  </span>
                )}
              </div>

              {currentRequest && (
                <>
                  <p className="text-[11px] font-bold text-foreground">
                    {currentRequest.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {currentRequest.detail}
                  </p>
                  {currentRequest.status === "cancelled" && (
                    <p className="text-[10px] font-semibold text-danger-fg">
                      This request was cancelled by our team.
                    </p>
                  )}
                </>
              )}

              <div className="flex items-center justify-between gap-1">
                {flowStages.map((stage, index) => {
                  const done = index <= trackIndex;
                  return (
                    <div
                      key={stage.id}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold ${
                          done
                            ? "bg-brand text-on-brand"
                            : "border border-border bg-surface text-subtle-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`text-[9px] font-bold leading-tight ${
                          done ? "text-foreground" : "text-subtle-foreground"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {currentRequest && (
                <div className="space-y-2 pt-1">
                  <div className="h-1 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${trackProgress}%` }}
                    />
                  </div>
                  <Link
                    to={currentRequest.href}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover"
                  >
                    View request
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
