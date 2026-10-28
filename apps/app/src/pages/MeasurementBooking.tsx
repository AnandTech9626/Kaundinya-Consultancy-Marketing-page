import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Ruler, ShieldCheck } from "lucide-react";
import {
  Button,
  CalendarSlotPicker,
  Card,
  FormField,
  Input,
  PincodeInput,
  Select,
} from "@kaundinya/ui";
import type { SlotValue } from "@kaundinya/ui";
import { SERVICE_CATALOG } from "@kaundinya/config";
import type { MeasurementBooking as MeasurementRecord } from "@kaundinya/config";
import { bookMeasurement } from "../lib/mockApi";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/formats";

const MEASURE_SERVICES = SERVICE_CATALOG.filter(
  (item) =>
    item.categoryId === "property-home-services" &&
    item.pricing?.model === "per-sqft"
);

export function MeasurementBooking() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialService = MEASURE_SERVICES.some(
    (item) => item.id === params.get("service")
  )
    ? params.get("service")!
    : MEASURE_SERVICES[0]?.id ?? "";

  const [serviceId, setServiceId] = useState(initialService);
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [pincode, setPincode] = useState("");
  const [slot, setSlot] = useState<SlotValue | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<MeasurementRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const service = MEASURE_SERVICES.find((item) => item.id === serviceId);
  const canSubmit =
    Boolean(service) &&
    address.trim().length >= 5 &&
    /^\d{6}$/.test(pincode) &&
    Boolean(slot?.slot) &&
    name.trim().length >= 2 &&
    /^\d{10}$/.test(mobile);

  const backLink = (
    <Link
      to="/home-services"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to home services
    </Link>
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !slot?.slot || !service || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const record = await bookMeasurement({
        serviceId: service.id,
        serviceName: service.name,
        address: `${address}, ${locality}`.replace(/, $/, ""),
        pincode,
        date: slot.date,
        slot: slot.slot,
      });
      setCreated(record);
    } catch {
      setError("We couldn't book the measurement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
              Measurement booked
            </h1>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">
              Our surveyor will call on {mobile} to confirm. The visit is
              free and the quote follows within 24 hours.
            </p>
          </div>
          <div className="rounded-xl bg-ivory p-4 text-left space-y-1">
            <p className="text-sm font-bold text-charcoal">{created.serviceName}</p>
            <p className="text-xs text-muted">
              {formatDate(created.date)} · {created.slot}
            </p>
            <p className="text-xs text-muted">
              {created.address}, {created.pincode}
            </p>
            <p className="text-[11px] text-muted-light">
              Reference #{created.id.toUpperCase()}
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
          >
            View measurement visits
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {backLink}

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Home Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Book a free measurement
        </h1>
        <p className="text-muted mt-1">
          For nets and grills we measure on site instead of asking you for square footage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Service" htmlFor="measure-service" required>
              <Select
                id="measure-service"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                {MEASURE_SERVICES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.pricing?.amount ? ` · ₹${item.pricing.amount}/sq.ft` : ""}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Address" htmlFor="measure-address" required>
              <Input
                id="measure-address"
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

            <CalendarSlotPicker value={slot} onChange={setSlot} days={7} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Name" htmlFor="measure-name" required>
                <Input
                  id="measure-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </FormField>
              <FormField label="Mobile" htmlFor="measure-mobile" required>
                <Input
                  id="measure-mobile"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
              </FormField>
            </div>

            {error && <p className="text-[11px] text-rose-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={!canSubmit || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book free measurement"
              )}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-extrabold text-charcoal">What happens next</h2>
            </div>
            <ol className="space-y-2 text-xs text-muted">
              <li>1. We confirm the slot by phone.</li>
              <li>2. A surveyor measures the exact area.</li>
              <li>3. You receive a written quote.</li>
              <li>4. Installation is scheduled after approval.</li>
            </ol>
          </Card>

          <Card className="p-4 bg-ivory/60">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted leading-relaxed">
                Measurement is free and no-obligation. Final pricing is confirmed in
                writing before work begins.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
