import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Ruler,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  Badge,
  Button,
  CalendarSlotPicker,
  Card,
  FileDropzone,
  FormField,
  Input,
  PillSelect,
  PincodeInput,
  Select,
} from "@kaundinya/ui";
import type { SlotValue } from "@kaundinya/ui";
import { SERVICE_CATALOG } from "@kaundinya/config";
import type {
  JobRecord,
  MeasurementBooking,
  ServiceCatalogItem,
} from "@kaundinya/config";
import { bookMeasurement, createJob } from "../lib/mockApi";
import { useAuth } from "../lib/auth";
import { formatINR } from "../lib/formats";

function pricingLabel(service: ServiceCatalogItem) {
  if (!service.pricing) return "Custom quote";
  const { model, amount, unit } = service.pricing;
  if (model === "per-sqft" && amount) return `₹${amount}/${unit}`;
  if (model === "fixed") return amount === 0 ? "Free" : `₹${amount}${unit ? `/${unit}` : ""}`;
  if (model === "from") return `From ₹${amount}`;
  return "Custom quote";
}

export function HomeServiceDetail() {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const service = SERVICE_CATALOG.find(
    (item) =>
      item.id === serviceId && item.categoryId === "property-home-services"
  );

  const [issues, setIssues] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [pincode, setPincode] = useState("");
  const [slot, setSlot] = useState<SlotValue | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [tierId, setTierId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdJob, setCreatedJob] = useState<JobRecord | null>(null);
  const [createdMeasurement, setCreatedMeasurement] =
    useState<MeasurementBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backLink = (
    <Link
      to="/home-services"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to home services
    </Link>
  );

  if (!service) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center text-sm text-muted">
          This service is not available.
        </Card>
      </div>
    );
  }

  const isMeasurement = service.pricing?.model === "per-sqft";
  const Icon = Wrench;
  const chosenTier = service.tiers?.find((tier) => tier.id === tierId);

  const canSubmit =
    address.trim().length >= 5 &&
    /^\d{6}$/.test(pincode) &&
    Boolean(slot?.slot) &&
    name.trim().length >= 2 &&
    /^\d{10}$/.test(mobile) &&
    !submitting;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !slot?.slot) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isMeasurement) {
        const measurement = await bookMeasurement({
          serviceId: service.id,
          serviceName: service.name,
          address: `${address}, ${locality}`.replace(/, $/, ""),
          pincode,
          date: slot.date,
          slot: slot.slot,
        });
        setCreatedMeasurement(measurement);
      } else {
        const job = await createJob({
          serviceId: service.id,
          serviceName: chosenTier
            ? `${service.name} · ${chosenTier.label}`
            : service.name,
          issueTypes: issues,
          address: `${address}, ${locality}`.replace(/, $/, ""),
          pincode,
          date: slot.date,
          slot: slot.slot,
          amount: service.pricing?.amount,
        });
        setCreatedJob(job);
      }
    } catch {
      setError("We couldn't submit this booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdJob || createdMeasurement) {
    return (
      <div className="space-y-6 max-w-2xl">
        {backLink}
        <Card className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
              {createdMeasurement ? "Measurement booked" : "Booking requested"}
            </h1>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">
              {createdMeasurement
                ? "Our surveyor will call you to confirm the visit. Measurement is free, and the quote follows within 24 hours."
                : "We'll assign a vetted technician and confirm the slot by phone."}
            </p>
          </div>
          <div className="rounded-xl bg-ivory p-4 text-left space-y-1">
            <p className="text-sm font-bold text-charcoal">{service.name}</p>
            <p className="text-xs text-muted">
              {slot?.date} · {slot?.slot}
            </p>
            <p className="text-xs text-muted">
              {address}, {pincode}
            </p>
            <p className="text-[11px] text-muted-light">
              Reference #{(createdJob?.id ?? createdMeasurement?.id ?? "").toUpperCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {createdJob && (
              <Link
                to={`/jobs/${createdJob.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
              >
                Track this job
              </Link>
            )}
            <Link
              to="/home-services"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-white text-charcoal text-sm font-bold hover:border-gold/60 transition-colors"
            >
              Book another service
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backLink}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal tracking-tight">
                    {service.name}
                  </h1>
                  <Badge variant="gold">{pricingLabel(service)}</Badge>
                </div>
                <p className="text-sm text-muted leading-relaxed mt-1">
                  {service.summary}
                </p>
              </div>
            </div>

            {isMeasurement && (
              <div className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold-light/60 p-3">
                <Ruler className="w-4 h-4 text-[#8a6b1a] shrink-0 mt-0.5" />
                <p className="text-xs text-[#6b5413] leading-relaxed">
                  Priced per sq.ft. Book a free laser measurement — we confirm the final
                  quote before any work starts.
                </p>
              </div>
            )}

            {service.tiers && service.tiers.length > 0 && (
              <div className="border-t border-border-subtle pt-4">
                <h2 className="text-sm font-extrabold text-charcoal mb-3">
                  Choose a service tier
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {service.tiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setTierId(tier.id)}
                      className={`text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                        tierId === tier.id
                          ? "border-gold bg-gold-light/60"
                          : "border-border-subtle bg-white hover:border-gold/60"
                      }`}
                    >
                      <p className="text-xs font-extrabold text-charcoal">{tier.label}</p>
                      {tier.description && (
                        <p className="text-[11px] text-muted mt-0.5">{tier.description}</p>
                      )}
                      {tier.priceHint && (
                        <p className="text-sm font-extrabold text-charcoal mt-2">
                          {tier.priceHint}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {service.issueTypes && service.issueTypes.length > 0 && (
              <div className="border-t border-border-subtle pt-4">
                <h2 className="text-sm font-extrabold text-charcoal mb-2">
                  Common issues we fix
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {service.issueTypes.map((issue) => (
                    <span
                      key={issue}
                      className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-medium text-muted"
                    >
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {service.highlights && (
              <div className="border-t border-border-subtle pt-4">
                <h2 className="text-sm font-extrabold text-charcoal mb-2">
                  What's included
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.highlights.map((highlight) => (
                    <p
                      key={highlight}
                      className="flex items-start gap-2 text-xs text-charcoal-light"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      {highlight}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {service.documents && (
              <div className="border-t border-border-subtle pt-4">
                <h2 className="text-sm font-extrabold text-charcoal mb-2">
                  Documents to keep ready
                </h2>
                <div className="flex flex-wrap gap-2">
                  {service.documents.map((document) => (
                    <span
                      key={document}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] text-charcoal-light"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted" />
                      {document}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {service.id === "hs-documents" && (
            <Card className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-charcoal">
                  Prefer the secure portal?
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Upload documents with an automatic watermark.
                </p>
              </div>
              <Link
                to="/home-services/documents"
                className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
              >
                Open document portal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          )}

          {service.id === "hs-printouts" && (
            <Card className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-charcoal">Upload a PDF instead</h2>
                <p className="text-xs text-muted mt-0.5">
                  Live pricing, home delivery, files auto-delete after printing.
                </p>
              </div>
              <Link
                to="/home-services/printouts"
                className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
              >
                Go to printouts
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          )}

          {service.id === "hs-interiors" && (
            <Card className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-charcoal">See our work first</h2>
                <p className="text-xs text-muted mt-0.5">
                  Browse portfolio spaces and book a free design consultation.
                </p>
              </div>
              <Link
                to="/home-services/interiors"
                className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
              >
                View interiors
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          )}

          <Card className="p-4 bg-ivory/60">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted leading-relaxed">
                All technicians are background-verified. High-risk work requires a digital
                liability waiver before the team starts.
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-5 lg:sticky lg:top-20 h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-charcoal tracking-tight">
                {isMeasurement ? "Book free measurement" : "Request this service"}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {isMeasurement
                  ? "A surveyor visits, measures and quotes. You only pay after approval."
                  : "Pick a slot and tell us the issue. No payment now."}
              </p>
            </div>

            {service.tiers && service.tiers.length > 0 && (
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
                      {tier.priceHint ? ` · ${tier.priceHint}` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}

            {service.issueTypes && service.issueTypes.length > 0 && (
              <PillSelect
                label="What's the issue?"
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

            <FileDropzone
              files={files}
              onChange={setFiles}
              accept="image/*,.pdf"
              label="Photos or reference (optional)"
              hint="Helps the technician arrive prepared. Up to 10 MB."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Name" htmlFor="hs-name" required>
                <Input
                  id="hs-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
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
                />
              </FormField>
            </div>

            {!isMeasurement && service.pricing?.amount !== undefined && (
              <p className="text-xs text-muted">
                Indicative amount:{" "}
                <span className="font-bold text-charcoal">
                  {formatINR(service.pricing.amount)}
                </span>
                {service.pricing.note ? ` · ${service.pricing.note}` : ""}
              </p>
            )}

            {error && <p className="text-[11px] text-rose-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : isMeasurement ? (
                "Book free measurement"
              ) : (
                "Request booking"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
