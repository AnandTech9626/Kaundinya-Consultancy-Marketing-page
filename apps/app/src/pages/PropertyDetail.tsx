import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
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
  Skeleton,
  Textarea,
} from "@kaundinya/ui";
import type { SlotValue } from "@kaundinya/ui";
import { COMPLIANCE } from "@kaundinya/config";
import type { SiteVisit } from "@kaundinya/config";
import { bookSiteVisit, fetchProperty } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../lib/auth";
import {
  formatArea,
  formatDate,
  formatPropertyPrice,
} from "../lib/formats";

function estimateEmi(price: number) {
  const principal = price * 0.8;
  const monthlyRate = 8.5 / 12 / 100;
  const months = 240;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

export function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: property, loading, error, refetch } = useAsync(
    () => fetchProperty(id ?? ""),
    [id]
  );

  const [slot, setSlot] = useState<SlotValue | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<SiteVisit | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [kycFiles, setKycFiles] = useState<File[]>([]);

  const backLink = (
    <Link
      to="/real-estate"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to properties
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="overflow-hidden p-0">
          <Skeleton className="h-56 sm:h-72 w-full rounded-none" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </Card>
          </div>
          <Card className="p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load this property.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center text-sm text-muted">
          This property is no longer available.
        </Card>
      </div>
    );
  }

  const image = property.images?.[0];

  const handleBook = async (event: FormEvent) => {
    event.preventDefault();
    if (!slot?.slot || submitting) return;
    setSubmitting(true);
    setBookingError(null);
    try {
      const created = await bookSiteVisit({
        propertyId: property.id,
        date: slot.date,
        slot: slot.slot,
        notes,
        clientName: name,
        mobile,
      });
      setBooked(created);
    } catch {
      setBookingError("We couldn't book that slot. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const emi = property.listingType === "sale" ? estimateEmi(property.price) : null;

  return (
    <div className="space-y-6">
      {backLink}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="relative h-56 sm:h-72 bg-gradient-to-br from-charcoal via-charcoal-light to-[#3b3420] flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#f5b900_0,transparent_45%),radial-gradient(circle_at_80%_70%,#f5b900_0,transparent_40%)]" />
                  <Building2 className="w-20 h-20 text-gold/40" />
                </>
              )}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge variant={property.listingType === "rent" ? "info" : "gold"}>
                  {property.listingType === "rent" ? "For Rent" : "For Sale"}
                </Badge>
                <Badge variant="neutral">{property.propertyType}</Badge>
                {property.featured && <Badge variant="warning">Featured</Badge>}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/90 to-transparent p-4 sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gold">
                      <MapPin className="w-3 h-3" />
                      {property.location}, {property.city}
                    </p>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                      {property.title}
                    </h1>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-base sm:text-lg font-extrabold text-charcoal whitespace-nowrap">
                    {formatPropertyPrice(property.price, property.priceUnit)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Configuration", value: property.bhk },
                { label: "Area", value: formatArea(property.areaSqft) },
                { label: "Furnishing", value: property.furnishing ?? "Not specified" },
                { label: "Posted on", value: formatDate(property.createdAt) },
              ].map((fact) => (
                <div key={fact.label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                    {fact.label}
                  </p>
                  <p className="text-sm font-bold text-charcoal mt-0.5">{fact.value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle pt-4">
              <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-2">
                About this property
              </h2>
              <p className="text-sm text-charcoal-light leading-relaxed">
                {property.description}
              </p>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-3">
                Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-charcoal-light"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-ivory/60">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs text-muted leading-relaxed space-y-1">
                <p className="font-bold text-charcoal">
                  Project RERA: {property.reraAgentNumber ?? "Registration pending"}
                </p>
                <p>
                  {COMPLIANCE.tsRera.label}: {COMPLIANCE.tsRera.value}.{" "}
                  {COMPLIANCE.tsRera.note}
                </p>
                <p className="font-bold text-charcoal pt-1">{COMPLIANCE.dpdp.label}</p>
                <p>{COMPLIANCE.dpdp.note}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-2">
            <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-1">
              Buying & renting guides
            </h2>
            {[
              {
                title: "Stamp duty & registration",
                body: "Telangana stamp duty is about 6% including transfer duty, plus 1% registration. We prepare the full computation before you commit, so there are no surprises at registration.",
              },
              {
                title: "TS-RERA checks",
                body: "Verify the project registration and agent licence on rera.telangana.gov.in. We share the registration number, approval status and any pending litigation before you pay a token.",
              },
              {
                title: "Rental agreement checklist",
                body: "Keep ID proof, ownership proof, an 11-month term, deposit terms, maintenance split and the notice period in writing. We coordinate drafting and registration where needed.",
              },
            ].map((guide) => (
              <details
                key={guide.title}
                className="group rounded-lg border border-border-subtle bg-white [&::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-bold text-charcoal">
                  {guide.title}
                  <span className="text-gold group-open:hidden">+</span>
                  <span className="hidden text-gold group-open:inline">−</span>
                </summary>
                <p className="px-3 pb-3 text-[11px] text-muted leading-relaxed">
                  {guide.body}
                </p>
              </details>
            ))}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 lg:sticky lg:top-20">
            {booked ? (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
                    Site visit requested
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    {booked.propertyTitle}
                  </p>
                </div>
                <p className="text-sm font-bold text-charcoal">
                  {formatDate(booked.date)} · {booked.slot}
                </p>
                <p className="text-[11px] text-muted-light">
                  Our team will confirm with the owner and call you on{" "}
                  {booked.mobile}. Reference #{booked.id.toUpperCase()}.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <Button variant="secondary" onClick={() => setBooked(null)}>
                    Book another slot
                  </Button>
                  <Link
                    to="/real-estate"
                    className="text-xs font-bold text-gold hover:text-gold-hover"
                  >
                    Back to properties
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-charcoal tracking-tight">
                    Book a site visit
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Free · No obligation · Confirmed within 2 working hours.
                  </p>
                </div>

                <CalendarSlotPicker value={slot} onChange={setSlot} />

                <FormField label="Your name" htmlFor="visit-name" required>
                  <Input
                    id="visit-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full name"
                  />
                </FormField>

                <FormField label="Mobile number" htmlFor="visit-mobile" required>
                  <Input
                    id="visit-mobile"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(event) =>
                      setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile"
                  />
                </FormField>

                <FormField label="Notes (optional)" htmlFor="visit-notes">
                  <Textarea
                    id="visit-notes"
                    rows={2}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Anything we should know before the visit?"
                  />
                </FormField>

                {bookingError && (
                  <p className="text-[11px] text-rose-600">{bookingError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !slot?.slot ||
                    name.trim().length < 2 ||
                    !/^\d{10}$/.test(mobile) ||
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Request this slot"
                  )}
                </Button>
                <p className="text-[10px] text-muted-light text-center leading-relaxed">
                  By requesting a visit you agree to be contacted about this property.
                </p>
              </form>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-charcoal">Documents & KYC</h3>
            <p className="text-xs text-muted leading-relaxed">
              Optional: upload ID, address proof or a pre-approval letter to speed up
              verification for this property.
            </p>
            <FileDropzone
              files={kycFiles}
              onChange={setKycFiles}
              accept="image/*,.pdf"
              label="Upload KYC (optional)"
              hint="PAN, Aadhaar or address proof · up to 10 MB."
            />
            {kycFiles.length > 0 && (
              <p className="text-[10px] text-emerald-700">
                Stored locally for this demo session only. Real uploads are encrypted and
                watermarked.
              </p>
            )}
          </Card>

          {emi && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-charcoal">
                  Home loan estimate
                </h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                At 80% funding, 8.5% interest and a 20-year tenure, this home works out
                to about{" "}
                <span className="font-bold text-charcoal">
                  ₹{emi.toLocaleString("en-IN")}/month
                </span>
                .
              </p>
              <Link
                to={`/loans/apply?type=home&propertyId=${property.id}&propertyTitle=${encodeURIComponent(property.title)}&amount=${Math.round(property.price * 0.8)}&purpose=${encodeURIComponent(`Home purchase — ${property.title}`)}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
              >
                Check loan eligibility
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          )}

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-charcoal">Moving in soon?</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Book AC service, deep cleaning, safety nets or invisible grills before you
              move in.
            </p>
            <Link
              to="/services/property-home-services"
              className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
            >
              Explore home services
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
