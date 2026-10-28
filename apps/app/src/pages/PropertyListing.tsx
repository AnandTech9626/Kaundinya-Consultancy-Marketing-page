import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
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
import { REAL_ESTATE_AMENITIES } from "@kaundinya/config";
import { submitListing } from "../lib/mockApi";
import { formatINR, formatPropertyPrice } from "../lib/formats";

const PROPERTY_TYPES: PropertyListing["propertyType"][] = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
];

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Plot", "Office"];
const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];

export function PropertyListing() {
  const [intent, setIntent] = useState<"rent" | "sale">("sale");
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
        images: files[0] ? [URL.createObjectURL(files[0])] : undefined,
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
              Listing submitted
            </h1>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">
              Our team will review your listing and publish it within 24 hours. Enquiries
              are screened before they reach you.
            </p>
          </div>

          <div className="rounded-xl bg-ivory p-4 text-left space-y-1">
            <p className="text-sm font-bold text-charcoal">{created.title}</p>
            <p className="text-xs text-muted">
              {created.bhk} · {created.location}, {created.pincode}
            </p>
            <p className="text-sm font-extrabold text-charcoal">
              {formatPropertyPrice(created.price, created.priceUnit)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/real-estate/${created.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
            >
              Preview listing
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-white text-charcoal text-sm font-bold hover:border-gold/60 transition-colors cursor-pointer"
            >
              Create another listing
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {backLink}

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Real Estate
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          List your property
        </h1>
        <p className="text-muted mt-1">
          Tell us about the property. Our team verifies every listing before it goes live.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <Wizard
          steps={[
            {
              id: "basics",
              title: "Property basics",
              description: "Where is it, how big is it and what are you listing?",
              validate: () =>
                title.trim().length >= 6 &&
                locality.trim().length >= 2 &&
                /^\d{6}$/.test(pincode) &&
                numericArea > 0,
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
                            ? "bg-charcoal text-white"
                            : "bg-ivory text-charcoal border border-border-subtle hover:border-muted"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <FormField label="Listing title" htmlFor="listing-title" required>
                    <Input
                      id="listing-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Spacious 3 BHK with park view"
                    />
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
                        {BHK_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Built-up area (sq.ft)" htmlFor="listing-area" required>
                    <Input
                      id="listing-area"
                      inputMode="numeric"
                      value={area}
                      onChange={(event) =>
                        setArea(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="1200"
                    />
                  </FormField>

                  <PincodeInput
                    value={pincode}
                    onChange={setPincode}
                    locality={locality}
                    onLocalityChange={setLocality}
                  />
                </div>
              ),
            },
            {
              id: "pricing",
              title: "Pricing & description",
              description: "Set expectations and help buyers picture the home.",
              validate: () => numericPrice > 0 && description.trim().length >= 20,
              content: (
                <div className="space-y-4">
                  <FormField
                    label={intent === "rent" ? "Expected monthly rent (₹)" : "Expected price (₹)"}
                    htmlFor="listing-price"
                    required
                  >
                    <Input
                      id="listing-price"
                      inputMode="numeric"
                      value={price}
                      onChange={(event) =>
                        setPrice(event.target.value.replace(/\D/g, "").slice(0, 9))
                      }
                      placeholder={intent === "rent" ? "28000" : "9500000"}
                    />
                  </FormField>
                  {numericPrice > 0 && (
                    <p className="text-xs text-muted">
                      Displayed as{" "}
                      <span className="font-bold text-charcoal">
                        {formatINR(numericPrice)}
                        {intent === "rent" ? "/mo" : ""}
                      </span>
                    </p>
                  )}

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

                  <FormField
                    label="Description"
                    htmlFor="listing-description"
                    required
                    error={
                      description.length > 0 && description.trim().length < 20
                        ? "Add at least 20 characters"
                        : undefined
                    }
                  >
                    <Textarea
                      id="listing-description"
                      rows={4}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Layout, natural light, nearby schools, commute, recent repairs..."
                    />
                  </FormField>
                </div>
              ),
            },
            {
              id: "features",
              title: "Features & amenities",
              description: "Select everything the property offers.",
              content: (
                <div className="space-y-4">
                  <PillSelect
                    label="Amenities"
                    options={REAL_ESTATE_AMENITIES}
                    value={amenities}
                    onChange={setAmenities}
                  />
                  <p className="text-xs text-muted">
                    {amenities.length === 0
                      ? "Optional, but listings with amenities get more enquiries."
                      : `${amenities.length} selected`}
                  </p>
                </div>
              ),
            },
            {
              id: "photos",
              title: "Photos & review",
              description: "Add photos and check the details before submitting.",
              content: (
                <div className="space-y-5">
                  <FileDropzone
                    files={files}
                    onChange={setFiles}
                    accept="image/*,.pdf"
                    label="Property photos"
                    hint="JPG, PNG or PDF up to 10 MB. Images are compressed automatically."
                  />

                  <div className="rounded-xl border border-border-subtle bg-ivory p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Review
                    </p>
                    <p className="text-sm font-bold text-charcoal">{title}</p>
                    <p className="text-xs text-muted">
                      {intent === "rent" ? "For Rent" : "For Sale"} · {propertyType} ·{" "}
                      {bhk} · {numericArea.toLocaleString("en-IN")} sq.ft
                    </p>
                    <p className="text-xs text-muted">
                      {locality}, {pincode} · {furnishing}
                    </p>
                    <p className="text-sm font-extrabold text-charcoal">
                      {formatINR(numericPrice)}
                      {intent === "rent" ? "/mo" : ""}
                    </p>
                    <p className="text-xs text-charcoal-light leading-relaxed">
                      {description}
                    </p>
                    {amenities.length > 0 && (
                      <p className="text-[11px] text-muted">
                        Amenities: {amenities.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold-light/60 p-3">
                    <Info className="w-4 h-4 text-[#8a6b1a] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#6b5413] leading-relaxed">
                      Only list properties you own or are authorised to market. Listings
                      are reviewed and may be edited for accuracy.
                    </p>
                  </div>

                  {submitError && (
                    <p className="text-[11px] text-rose-600">{submitError}</p>
                  )}
                </div>
              ),
            },
          ]}
          onComplete={handleComplete}
          submitting={submitting}
          completeLabel="Submit listing"
        />
      </Card>
    </div>
  );
}
