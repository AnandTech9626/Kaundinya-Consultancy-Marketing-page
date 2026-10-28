import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ListPlus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge, Card, Input, Select, Skeleton } from "@kaundinya/ui";
import type { SiteVisit } from "@kaundinya/config";
import { COMPLIANCE } from "@kaundinya/config";
import { PropertyCard } from "../components/PropertyCard";
import { fetchProperties, fetchSiteVisits } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate } from "../lib/formats";

type Intent = "all" | "rent" | "sale";

const BHK_OPTIONS = ["all", "1 BHK", "2 BHK", "3 BHK", "4 BHK"];

const RENT_BUDGETS = [
  { value: 0, label: "Any budget" },
  { value: 20000, label: "Up to ₹20,000/mo" },
  { value: 30000, label: "Up to ₹30,000/mo" },
  { value: 45000, label: "Up to ₹45,000/mo" },
  { value: 70000, label: "Up to ₹70,000/mo" },
];

const SALE_BUDGETS = [
  { value: 0, label: "Any budget" },
  { value: 6000000, label: "Up to ₹60 L" },
  { value: 10000000, label: "Up to ₹1 Cr" },
  { value: 15000000, label: "Up to ₹1.5 Cr" },
  { value: 25000000, label: "Up to ₹2.5 Cr" },
];

const VISIT_BADGE: Record<SiteVisit["status"], "gold" | "info" | "success" | "neutral"> = {
  requested: "gold",
  confirmed: "info",
  completed: "success",
  cancelled: "neutral",
};

export function RealEstate() {
  const [intent, setIntent] = useState<Intent>("all");
  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState("all");
  const [budget, setBudget] = useState(0);

  const { data, loading, error, refetch } = useAsync(fetchProperties);
  const { data: visits } = useAsync(fetchSiteVisits);
  const properties = data ?? [];

  const budgets = intent === "rent" ? RENT_BUDGETS : SALE_BUDGETS;

  const filtered = useMemo(() => {
    const needle = locality.trim().toLowerCase();
    return properties.filter((property) => {
      if (property.status !== "active") return false;
      if (intent !== "all" && property.listingType !== intent) return false;
      if (bhk !== "all" && property.bhk !== bhk) return false;
      if (budget > 0 && property.price > budget) return false;
      if (needle) {
        const haystack =
          `${property.location} ${property.pincode} ${property.title}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [properties, intent, bhk, budget, locality]);

  const reset = () => {
    setIntent("all");
    setLocality("");
    setBhk("all");
    setBudget(0);
  };

  const upcomingVisits = (visits ?? []).filter(
    (visit) => visit.status === "requested" || visit.status === "confirmed"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
            Real Estate
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Find your next home
          </h1>
          <p className="text-muted mt-1 max-w-2xl">
            Verified rentals and sale listings across Hyderabad, with guided site visits
            and paperwork support.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/real-estate/list"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold transition-colors"
          >
            <ListPlus className="w-4 h-4" />
            List your property
          </Link>
          <Link
            to="/real-estate/valuation"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-border-subtle hover:border-gold/60 text-charcoal text-sm font-bold transition-colors"
          >
            Free valuation
          </Link>
        </div>
      </div>

      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {([
            { value: "all", label: "All properties" },
            { value: "rent", label: "Rent" },
            { value: "sale", label: "Buy" },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setIntent(option.value);
                setBudget(0);
              }}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <Input
              className="pl-9"
              placeholder="Search locality or pincode"
              value={locality}
              onChange={(event) => setLocality(event.target.value)}
              aria-label="Search locality or pincode"
            />
          </div>

          <Select
            value={bhk}
            onChange={(event) => setBhk(event.target.value)}
            aria-label="Filter by BHK"
          >
            {BHK_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Any configuration" : option}
              </option>
            ))}
          </Select>

          <Select
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            disabled={intent === "all"}
            aria-label="Filter by budget"
          >
            {(intent === "all" ? [{ value: 0, label: "Any budget" }] : budgets).map(
              (option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )
            )}
          </Select>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-subtle bg-white text-sm font-bold text-charcoal hover:border-gold/60 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Reset filters
          </button>
        </div>
      </Card>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load properties.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden p-0">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">No properties match those filters</p>
          <p className="text-sm text-muted">
            Try a wider budget or a nearby locality.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Clear filters
          </button>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <span className="font-bold text-charcoal">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "property" : "properties"} found
            </p>
            <p className="text-[11px] text-muted-light">
              Prices are set by owners and verified before listing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}

      {upcomingVisits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gold" />
            <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
              Your site visits
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingVisits.map((visit) => (
              <Card key={visit.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/real-estate/${visit.propertyId}`}
                      className="text-sm font-bold text-charcoal hover:text-gold transition-colors line-clamp-1"
                    >
                      {visit.propertyTitle}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">
                      {formatDate(visit.date)} · {visit.slot}
                    </p>
                  </div>
                  <Badge variant={VISIT_BADGE[visit.status]}>{visit.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="p-4 sm:p-5 bg-ivory/60">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs text-muted leading-relaxed">
            <p className="font-bold text-charcoal">
              {COMPLIANCE.tsRera.label}: {COMPLIANCE.tsRera.value}
            </p>
            <p>{COMPLIANCE.tsRera.note}</p>
            <p className="mt-1.5 font-bold text-charcoal">{COMPLIANCE.dpdp.label}</p>
            <p>{COMPLIANCE.dpdp.note}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
