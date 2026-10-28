import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import {
  Button,
  Card,
  FormField,
  Input,
  PincodeInput,
  Select,
  Textarea,
} from "@kaundinya/ui";
import type { ValuationRequest } from "@kaundinya/config";
import { COMPLIANCE } from "@kaundinya/config";
import { bookValuation } from "../lib/mockApi";
import { formatDate } from "../lib/formats";

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
];

const BENEFITS = [
  "Physical assessment by a local property expert",
  "Written estimate for both rent and sale",
  "Comparable sales and rental data",
  "No obligation to list with us",
];

export function PropertyValuation() {
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [locality, setLocality] = useState("");
  const [pincode, setPincode] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<ValuationRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    ownerName.trim().length >= 2 &&
    /^\d{10}$/.test(mobile) &&
    locality.trim().length >= 2 &&
    /^\d{6}$/.test(pincode) &&
    consent;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const request = await bookValuation({
        ownerName,
        mobile,
        propertyType,
        location: locality,
        pincode,
        expectedPrice: Number(expectedPrice) || undefined,
        notes,
      });
      setCreated(request);
    } catch {
      setError("We couldn't book your valuation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = (
    <Link
      to="/real-estate"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to properties
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
              Valuation requested
            </h1>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">
              Our expert will call you on {created.mobile} to schedule a visit to{" "}
              {created.location}. Reference #{created.id.toUpperCase()}.
            </p>
          </div>
          <div className="rounded-xl bg-ivory p-4 text-left space-y-1">
            <p className="text-sm font-bold text-charcoal">{created.propertyType}</p>
            <p className="text-xs text-muted">
              {created.location}, {created.pincode}
            </p>
            <p className="text-[11px] text-muted-light">
              Requested on {formatDate(created.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
            >
              View my requests
            </Link>
            <Link
              to="/real-estate"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-white text-charcoal text-sm font-bold hover:border-gold/60 transition-colors"
            >
              Browse properties
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {backLink}

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Real Estate
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Book a free valuation
        </h1>
        <p className="text-muted mt-1">
          Know what your property is worth before you rent or sell.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Your name" htmlFor="val-name" required>
                <Input
                  id="val-name"
                  value={ownerName}
                  onChange={(event) => setOwnerName(event.target.value)}
                  placeholder="Full name"
                />
              </FormField>
              <FormField label="Mobile number" htmlFor="val-mobile" required>
                <Input
                  id="val-mobile"
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

            <FormField label="Property type" htmlFor="val-type" required>
              <Select
                id="val-type"
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>

            <PincodeInput
              value={pincode}
              onChange={setPincode}
              locality={locality}
              onLocalityChange={setLocality}
            />

            <FormField
              label="Expected price (optional)"
              htmlFor="val-price"
            >
              <Input
                id="val-price"
                inputMode="numeric"
                value={expectedPrice}
                onChange={(event) =>
                  setExpectedPrice(event.target.value.replace(/\D/g, "").slice(0, 9))
                }
                placeholder="e.g. 8500000"
              />
            </FormField>

            <FormField label="Anything else? (optional)" htmlFor="val-notes">
              <Textarea
                id="val-notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Floor, age of the building, recent repairs, tenant status..."
              />
            </FormField>

            <label className="flex items-start gap-2 text-xs text-muted leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 w-4 h-4 accent-gold"
              />
              I agree to be contacted about this valuation and accept the privacy notice.
            </label>

            {error && <p className="text-[11px] text-rose-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={!canSubmit || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Request free valuation"
              )}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-charcoal">What you get</h2>
            <ul className="space-y-2">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-xs text-charcoal-light leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-charcoal">How it works</h2>
            <ol className="space-y-2 text-xs text-muted">
              <li>1. Share your details and preferred time.</li>
              <li>2. We call to confirm within one working day.</li>
              <li>3. An expert visits and measures the property.</li>
              <li>4. You receive a written estimate.</li>
            </ol>
          </Card>

          <Card className="p-4 bg-ivory/60">
            <p className="text-[11px] font-bold text-charcoal">{COMPLIANCE.dpdp.label}</p>
            <p className="text-[11px] text-muted leading-relaxed mt-1">
              {COMPLIANCE.dpdp.note}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
