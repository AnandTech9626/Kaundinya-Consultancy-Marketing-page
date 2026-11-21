import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Info,
  LayoutGrid,
  MessageSquare,
  Shield,
  Snowflake,
} from "lucide-react";
import {
  Card,
  FileDropzone,
  FormField,
  Input,
  PincodeInput,
  PillSelect,
  Select,
  Textarea,
  Wizard,
} from "@kaundinya/ui";
import type { PropertyListing } from "@kaundinya/config";
import {
  PROPERTY_CONFIGURATIONS,
  REAL_ESTATE_AMENITIES,
} from "@kaundinya/config";
import { compressImages } from "../lib/images";
import { submitListing } from "../lib/mockApi";
import { formatINR, formatPropertyPrice } from "../lib/formats";

const PROPERTY_TYPES: PropertyListing["propertyType"][] = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
];

const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];

export function PropertyListing() {
  const [params] = useSearchParams();
  const [intent, setIntent] = useState<"rent" | "sale">(
    params.get("intent") === "rent" ? "rent" : "sale",
  );
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] =
    useState<PropertyListing["propertyType"]>("Apartment");
  const [bhk, setBhk] = useState("2 BHK");
  const [area, setArea] = useState("");
  const [locality, setLocality] = useState("");
  const [pincode, setPincode] = useState("");
  const [price, setPrice] = useState("");
  const [furnishing, setFurnishing] = useState(FURNISHING[0]);
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<PropertyListing | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const numericArea = Number(area) || 0;
  const numericPrice = Number(price) || 0;
  const suggestedTitle = [
    bhk,
    propertyType,
    locality.trim() ? `in ${locality.trim()}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const reset = () => {
    setIntent("sale");
    setTitle("");
    setPropertyType("Apartment");
    setBhk("2 BHK");
    setArea("");
    setLocality("");
    setPincode("");
    setPrice("");
    setFurnishing(FURNISHING[0]);
    setDescription("");
    setAmenities([]);
    setFiles([]);
    setCreated(null);
    setSubmitError(null);
  };

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const listing = await submitListing({
        title,
        description,
        listingType: intent,
        propertyType,
        bhk,
        location: locality,
        pincode,
        price: numericPrice,
        areaSqft: numericArea,
        furnishing,
        amenities,
        images: [],
        files: await compressImages(files),
      });
      setCreated(listing);
    } catch {
      setSubmitError("We couldn't submit your listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = (
    <Link
      to="/real-estate"
      className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to properties
    </Link>
  );

  if (created) {
    const nextSteps = [
      {
        icon: Clock,
        title: "Team review within 24 hours",
        description: "We verify the details and photos before anything goes live.",
      },
      {
        icon: Eye,
        title: "Published to the Buy tab",
        description: "Once approved, buyers can find it and book a site visit.",
      },
      {
        icon: MessageSquare,
        title: "Screened enquiries",
        description: "We filter enquiries so only serious buyers reach you.",
      },
    ];

    const moveInServices = [
      {
        id: "hs-nets",
        icon: Shield,
        title: "Safety nets",
        description: "Pigeon & balcony nets",
      },
      {
        id: "hs-grills",
        icon: LayoutGrid,
        title: "Invisible grills",
        description: "Child-safe balcony grills",
      },
      {
        id: "hs-ac",
        icon: Snowflake,
        title: "AC & fridge",
        description: "Service, repair, gas refill",
      },
    ];

    return (
      <div className="space-y-6">
        {backLink}

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr]">
            <div className="space-y-5 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-success-soft text-success-fg">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    Listing submitted
                  </h1>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Our team will review your listing and publish it within 24 hours.
                    Enquiries are screened before they reach you.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-muted p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {created.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {created.bhk} · {created.location}, {created.pincode}
                  </p>
                </div>
                <p className="whitespace-nowrap text-lg font-extrabold tracking-tight text-foreground">
                  {formatPropertyPrice(created.price, created.priceUnit)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/real-estate/${created.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
                >
                  Preview listing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-brand/60 cursor-pointer"
                >
                  Create another listing
                </button>
              </div>
            </div>

            <aside className="border-t border-border bg-surface-raised p-6 sm:p-8 lg:border-l lg:border-t-0">
              <h2 className="text-sm font-extrabold text-foreground">
                What happens next
              </h2>
              <ol className="mt-4 space-y-4">
                {nextSteps.map((step) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                      <step.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </Card>

        <section className="overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand-soft via-white to-[#fdf6e3] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
                Before you move in
              </span>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Make the new place move-in ready
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Pigeon nets, invisible grills or AC servicing — book trusted help from
                the same app, with verified technicians.
              </p>
            </div>
            <Link
              to="/home-services"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-charcoal-light"
            >
              Explore home services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {moveInServices.map((service) => (
              <Link
                key={service.id}
                to={`/home-services/${service.id}`}
                className="group rounded-xl border border-border bg-white/85 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                    <service.icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </div>
                <p className="mt-3 text-sm font-extrabold text-foreground">
                  {service.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {service.description}
                </p>
                <p className="mt-2 text-[11px] font-bold text-brand">Book now</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }
  return (
    <div className="space-y-6 max-w-3xl">
      {backLink}

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
          Real Estate
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          List your property
        </h1>
        <p className="text-muted-foreground mt-1">
          Tell us about the property. Our team verifies every listing before it goes live.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <Wizard
          steps={[
            {
              id: "details",
              title: "Property details",
              description: "The essentials first. Photos and publishing are next.",
              validate: () =>
                title.trim().length >= 6 &&
                locality.trim().length >= 2 &&
                /^\d{6}$/.test(pincode) &&
                numericArea > 0 &&
                numericPrice > 0,
              content: (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: "sale", label: "Sell" },
                      { value: "rent", label: "Rent out" },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setIntent(option.value)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                          intent === option.value
                            ? "bg-inverse text-white"
                            : "bg-surface-muted text-foreground border border-border hover:border-subtle-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <FormField
                    label="Listing title"
                    htmlFor="listing-title"
                    required
                    error={
                      title.length > 0 && title.trim().length < 6
                        ? "Use at least 6 characters."
                        : undefined
                    }
                  >
                    <Input
                      id="listing-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Spacious 3 BHK with park view"
                      invalid={title.length > 0 && title.trim().length < 6}
                    />
                    {suggestedTitle.length >= 6 && suggestedTitle !== title && (
                      <button
                        type="button"
                        onClick={() => setTitle(suggestedTitle)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover"
                      >
                        Use "{suggestedTitle}"
                      </button>
                    )}
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Property type" htmlFor="listing-type" required>
                      <Select
                        id="listing-type"
                        value={propertyType}
                        onChange={(event) =>
                          setPropertyType(
                            event.target.value as PropertyListing["propertyType"]
                          )
                        }
                      >
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField label="Configuration" htmlFor="listing-bhk" required>
                      <Select
                        id="listing-bhk"
                        value={bhk}
                        onChange={(event) => setBhk(event.target.value)}
                      >
                        {PROPERTY_CONFIGURATIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  <FormField
                    label="Built-up area (sq.ft)"
                    htmlFor="listing-area"
                    required
                    error={
                      area.length > 0 && numericArea === 0
                        ? "Enter a valid built-up area."
                        : undefined
                    }
                  >
                    <Input
                      id="listing-area"
                      inputMode="numeric"
                      value={area}
                      onChange={(event) =>
                        setArea(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="1200"
                      invalid={area.length > 0 && numericArea === 0}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      label={intent === "rent" ? "Expected monthly rent (₹)" : "Expected price (₹)"}
                      htmlFor="listing-price"
                      required
                      error={
                        price.length > 0 && numericPrice === 0
                          ? "Enter a valid amount."
                          : undefined
                      }
                    >
                      <Input
                        id="listing-price"
                        inputMode="numeric"
                        value={price}
                        onChange={(event) =>
                          setPrice(event.target.value.replace(/\D/g, "").slice(0, 9))
                        }
                        placeholder={intent === "rent" ? "28000" : "9500000"}
                        invalid={price.length > 0 && numericPrice === 0}
                      />
                    </FormField>

                    <FormField label="Furnishing" htmlFor="listing-furnishing">
                      <Select
                        id="listing-furnishing"
                        value={furnishing}
                        onChange={(event) => setFurnishing(event.target.value)}
                      >
                        {FURNISHING.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  {numericPrice > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Shown as{" "}
                      <span className="font-bold text-foreground">
                        {formatINR(numericPrice)}
                        {intent === "rent" ? "/mo" : ""}
                      </span>
                    </p>
                  )}

                  <PincodeInput
                    value={pincode}
                    onChange={setPincode}
                    locality={locality}
                    onLocalityChange={setLocality}
                    localityError={
                      locality.length > 0 && locality.trim().length < 2
                        ? "Enter the area or locality."
                        : undefined
                    }
                  />

                  <FormField label="Description (optional)" htmlFor="listing-description">
                    <Textarea
                      id="listing-description"
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Layout, natural light, nearby schools, commute, recent repairs..."
                    />
                  </FormField>

                  <details className="rounded-xl border border-border bg-surface-raised p-4">
                    <summary className="cursor-pointer text-sm font-bold text-foreground">
                      Amenities (optional)
                    </summary>
                    <div className="pt-3">
                      <PillSelect
                        label="Amenities"
                        options={REAL_ESTATE_AMENITIES}
                        value={amenities}
                        onChange={setAmenities}
                      />
                    </div>
                  </details>
                </div>
              ),
            },
            {
              id: "photos",
              title: "Photos & publish",
              description: "Add photos if you have them, then send the listing for review.",
              content: (
                <div className="space-y-5">
                  <FileDropzone
                    files={files}
                    onChange={setFiles}
                    accept="image/*,.pdf"
                    label="Property photos"
                    hint="JPG, PNG or PDF up to 10 MB. Large images are compressed before upload."
                  />

                  <div className="rounded-xl border border-border bg-surface-muted p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Review
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {title || "Untitled listing"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {intent === "rent" ? "For Rent" : "For Sale"} · {propertyType} ·{" "}
                      {bhk} · {numericArea.toLocaleString("en-IN")} sq.ft
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {locality}, {pincode} · {furnishing}
                    </p>
                    <p className="text-sm font-extrabold text-foreground">
                      {formatINR(numericPrice)}
                      {intent === "rent" ? "/mo" : ""}
                    </p>
                    {description && (
                      <p className="text-xs text-foreground-soft leading-relaxed">
                        {description}
                      </p>
                    )}
                    {amenities.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        Amenities: {amenities.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-brand/30 bg-brand-soft/60 p-3">
                    <Info className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#6b5413] leading-relaxed">
                      Only list properties you own or are authorised to market. Our
                      team reviews every listing before it goes live.
                    </p>
                  </div>

                  {submitError && (
                    <p className="text-[11px] text-danger-fg">{submitError}</p>
                  )}
                </div>
              ),
            },
          ]}          onComplete={handleComplete}
          submitting={submitting}
          completeLabel="Submit listing"
        />
      </Card>
    </div>
  );
}
