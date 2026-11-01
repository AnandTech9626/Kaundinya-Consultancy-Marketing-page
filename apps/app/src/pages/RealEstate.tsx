import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge, Card, Input, Select, Skeleton } from "@kaundinya/ui";
import type { PropertyListing, SiteVisit } from "@kaundinya/config";
import { COMPLIANCE } from "@kaundinya/config";
import { PropertyCard } from "../components/PropertyCard";
import {
  fetchBuyProperties,
  fetchMyProperties,
  fetchRentProperties,
  fetchSaleProperties,
  fetchSiteVisits,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatPropertyPrice } from "../lib/formats";

export type RealEstateMode = "buy" | "rent" | "sell";

interface RealEstateProps {
  mode: RealEstateMode;
}

const TABS = [
  { mode: "buy", label: "Buy", to: "/real-estate/buy" },
  { mode: "rent", label: "Rent", to: "/real-estate/rent" },
  { mode: "sell", label: "Sale", to: "/real-estate/sell" },
] as const;

const MODE_COPY: Record<
  RealEstateMode,
  { eyebrow: string; title: string; description: string }
> = {
  buy: {
    eyebrow: "Buy",
    title: "Find your next home",
    description:
      "Verified properties for sale across Hyderabad, with guided site visits and paperwork support.",
  },
  rent: {
    eyebrow: "Rent",
    title: "Find a rental",
    description:
      "Ready-to-move rentals across Hyderabad, with guided site visits and agreement support.",
  },
  sell: {
    eyebrow: "Sale",
    title: "Sell or rent out your property",
    description:
      "See what is live in the market, list your property, and track it until it is approved.",
  },
};

const PLUS_ACTION: Record<RealEstateMode, { label: string; to: string }> = {
  buy: { label: "Buy valuation", to: "/real-estate/valuation" },
  rent: { label: "Rental", to: "/real-estate/list?intent=rent" },
  sell: { label: "Sale", to: "/real-estate/list?intent=sale" },
};

const BHK_OPTIONS = ["all", "1 BHK", "2 BHK", "3 BHK", "4 BHK"];

const VISIT_BADGE: Record<
  SiteVisit["status"],
  "gold" | "info" | "success" | "neutral"
> = {
  requested: "gold",
  confirmed: "info",
  completed: "success",
  cancelled: "neutral",
};

const STATUS_META: Record<
  PropertyListing["status"],
  { label: string; variant: "neutral" | "gold" | "success" | "info" | "warning" | "danger" }
> = {
  draft: { label: "Pending review", variant: "neutral" },
  active: { label: "Live", variant: "success" },
  sold: { label: "Sold", variant: "info" },
  rented: { label: "Rented", variant: "info" },
};

function numeric(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function EmptyMyProperties() {
  return (
    <Card
      role="dialog"
      aria-labelledby="my-properties-empty"
      className="p-8 text-center space-y-3"
    >
      <div className="w-14 h-14 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
        <Building2 className="w-7 h-7" />
      </div>
      <h3
        id="my-properties-empty"
        className="text-lg font-extrabold text-charcoal tracking-tight"
      >
        No properties yet
      </h3>
      <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
        You don't have any pending properties for sale or rent. List your property
        and our team will review it before it goes live.
      </p>
      <Link
        to="/real-estate/list"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold transition-colors"
      >
        <Plus className="w-4 h-4" />
        List your first property
      </Link>
    </Card>
  );
}

function MyPropertiesSection({
  title,
  description,
  items,
  emptyText,
}: {
  title: string;
  description: string;
  items: PropertyListing[];
  emptyText: string;
}) {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-charcoal tracking-tight">
            My properties {title.toLowerCase()}
          </h3>
          <p className="text-[11px] text-muted mt-0.5">{description}</p>
        </div>
        <Badge variant="neutral">{items.length}</Badge>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-subtle p-4 text-center text-xs text-muted">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((listing) => {
            const status = STATUS_META[listing.status] ?? STATUS_META.draft;
            return (
              <Link
                key={listing.id}
                to={`/real-estate/${listing.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border-subtle p-3 hover:border-gold/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-charcoal line-clamp-1">
                    {listing.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {listing.bhk} · {listing.location}, {listing.pincode}
                  </p>
                  <p className="text-xs font-extrabold text-charcoal mt-1">
                    {formatPropertyPrice(listing.price, listing.priceUnit)}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function RealEstate({ mode }: RealEstateProps) {
  const isSell = mode === "sell";
  const [location, setLocation] = useState("");
  const [bhk, setBhk] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [applied, setApplied] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setApplied({ location: location.trim(), minPrice, maxPrice });
    }, 300);
    return () => clearTimeout(timer);
  }, [location, minPrice, maxPrice]);

  useEffect(() => {
    setLocation("");
    setBhk("all");
    setMinPrice("");
    setMaxPrice("");
    setApplied({ location: "", minPrice: "", maxPrice: "" });
  }, [mode]);

  const { data, loading, error, refetch } = useAsync(
    () => {
      const query = {
        location: applied.location || undefined,
        bhk: bhk === "all" ? undefined : bhk,
        minPrice: applied.minPrice ? Number(applied.minPrice) : undefined,
        maxPrice: applied.maxPrice ? Number(applied.maxPrice) : undefined,
      };

      if (mode === "buy") return fetchBuyProperties(query);
      if (mode === "rent") return fetchRentProperties(query);
      return fetchSaleProperties(query);
    },
    [mode, applied.location, applied.minPrice, applied.maxPrice, bhk],
  );

  const { data: visits } = useAsync(fetchSiteVisits, []);
  const {
    data: myListings,
    loading: myLoading,
    error: myError,
    refetch: refetchMine,
  } = useAsync(fetchMyProperties, []);

  const properties = data ?? [];
  const mySale = useMemo(
    () => (myListings ?? []).filter((item) => item.listingType === "sale"),
    [myListings],
  );
  const myRent = useMemo(
    () => (myListings ?? []).filter((item) => item.listingType === "rent"),
    [myListings],
  );

  const copy = MODE_COPY[mode];
  const priceLabel = mode === "rent" ? "rent (₹/mo)" : "price (₹)";

  const reset = () => {
    setLocation("");
    setBhk("all");
    setMinPrice("");
    setMaxPrice("");
    setApplied({ location: "", minPrice: "", maxPrice: "" });
  };

  const upcomingVisits = (visits ?? []).filter(
    (visit) => visit.status === "requested" || visit.status === "confirmed",
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          {copy.eyebrow}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          {copy.title}
        </h1>
        <p className="text-muted mt-1 max-w-2xl">{copy.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border-subtle bg-white p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.mode}
            to={tab.to}
            className={`text-center py-2.5 rounded-lg text-sm font-bold transition-colors ${
              mode === tab.mode
                ? "bg-charcoal text-white"
                : "text-charcoal hover:bg-ivory"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row xl:items-end gap-3">
        <div className="min-w-0 xl:flex-[3]">
          <label
            htmlFor="filter-location"
            className="block text-[11px] font-bold text-charcoal mb-1"
          >
            Location
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <Input
              id="filter-location"
              className="pl-9"
              placeholder="Gachibowli, Kukatpally or pincode"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
        </div>

        <div className="min-w-0 xl:flex-[1]">
          <label
            htmlFor="filter-bhk"
            className="block text-[11px] font-bold text-charcoal mb-1"
          >
            BHK
          </label>
          <Select
            id="filter-bhk"
            value={bhk}
            onChange={(event) => setBhk(event.target.value)}
          >
            {BHK_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Any" : option}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 xl:flex-[2]">
          <label
            htmlFor="filter-min-price"
            className="block text-[11px] font-bold text-charcoal mb-1"
          >
            Min {priceLabel}
          </label>
          <Input
            id="filter-min-price"
            inputMode="numeric"
            placeholder={mode === "rent" ? "10000" : "3000000"}
            value={minPrice}
            onChange={(event) => setMinPrice(numeric(event.target.value))}
          />
        </div>

        <div className="min-w-0 xl:flex-[1]">
          <label
            htmlFor="filter-max-price"
            className="block text-[11px] font-bold text-charcoal mb-1"
          >
            Max {priceLabel}
          </label>
          <Input
            id="filter-max-price"
            inputMode="numeric"
            placeholder={mode === "rent" ? "70000" : "25000000"}
            value={maxPrice}
            onChange={(event) => setMaxPrice(numeric(event.target.value))}
          />
        </div>

        <button
          type="button"
          onClick={reset}
          aria-label="Reset filters"
          title="Reset filters"
          className="w-full xl:w-auto inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border-subtle bg-white text-sm font-bold text-charcoal hover:border-gold/60 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="xl:hidden">Reset</span>
        </button>

        <Link
          to={PLUS_ACTION[mode].to}
          className="w-full xl:w-auto xl:ml-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="truncate">{PLUS_ACTION[mode].label}</span>
        </Link>
      </div>

      {isSell && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
            Available properties for sale
          </h2>
          <Link
            to="/real-estate/list?intent=sale"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-hover"
          >
            <Plus className="w-3.5 h-3.5" />
            Sell a property
          </Link>
        </div>
      )}

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
      ) : properties.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">
            No {mode === "rent" ? "rental" : "sale"} properties match those filters
          </p>
          <p className="text-sm text-muted">
            Try a wider budget, another BHK, or a nearby locality.
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
              <span className="font-bold text-charcoal">{properties.length}</span>{" "}
              {properties.length === 1 ? "property" : "properties"} found
            </p>
            <p className="text-[11px] text-muted-light">
              Prices are set by owners and verified before listing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}

      {!isSell && upcomingVisits.length > 0 && (
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

      {isSell && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
              My properties
            </h2>
            <Link
              to="/real-estate/list"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              List a property
            </Link>
          </div>

          {myError ? (
            <Card className="p-6 text-center space-y-2">
              <p className="text-sm text-muted">We couldn't load your listings.</p>
              <button
                type="button"
                onClick={refetchMine}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
              >
                Try again
              </button>
            </Card>
          ) : myLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="p-5 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-14 w-full" />
                </Card>
              ))}
            </div>
          ) : mySale.length === 0 && myRent.length === 0 ? (
            <EmptyMyProperties />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MyPropertiesSection
                title="For sale"
                description="Properties you listed to sell."
                items={mySale}
                emptyText="No pending properties for sale yet."
              />
              <MyPropertiesSection
                title="For rent"
                description="Properties you listed for rent."
                items={myRent}
                emptyText="No pending rental properties yet."
              />
            </div>
          )}
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
