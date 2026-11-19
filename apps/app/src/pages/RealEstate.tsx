import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Badge, Card, Input, Select, Skeleton } from "@kaundinya/ui";
import type { PropertyListing } from "@kaundinya/config";
import { BHK_OPTIONS } from "@kaundinya/config";
import { PropertyRow } from "../components/PropertyRow";
import { InfoTip } from "../components/InfoTip";
import {
  fetchBuyProperties,
  fetchMyProperties,
  fetchRentProperties,
  fetchSaleProperties,
  fetchSiteVisits,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatArea, formatDate, formatPropertyPrice } from "../lib/formats";
import { statusBadge, statusLabel, statusMeta } from "../lib/status";

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

const BHK_FILTER_OPTIONS = ["all", ...BHK_OPTIONS];

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
      <div className="w-14 h-14 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center mx-auto">
        <Building2 className="w-7 h-7" />
      </div>
      <h3
        id="my-properties-empty"
        className="text-lg font-extrabold text-foreground tracking-tight"
      >
        No properties yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        You don't have any pending properties for sale or rent. List your property
        and our team will review it before it goes live.
      </p>
      <Link
        to="/real-estate/list"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold transition-colors"
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
          <h3 className="text-sm font-extrabold text-foreground tracking-tight">
            My properties {title.toLowerCase()}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Badge variant="neutral">{items.length}</Badge>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((listing) => {
            const status = statusMeta(listing.status);
            return (
              <Link
                key={listing.id}
                to={`/real-estate/${listing.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border p-3 hover:border-brand/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground line-clamp-1">
                    {listing.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {listing.bhk} · {listing.location}, {listing.pincode}
                  </p>
                  <p className="text-xs font-extrabold text-foreground mt-1">
                    {formatPropertyPrice(listing.price, listing.priceUnit)}
                  </p>
                </div>
                <Badge variant={status.badge}>{status.label}</Badge>
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
  const marketPreview = properties.slice(0, 3);

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
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
          {copy.eyebrow}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {copy.title}
          </h1>
          <InfoTip
            label="About Real Estate"
            text="Search verified sale and rental properties, list your own property, book a valuation or a site visit, and track enquiries from this page."
          />
        </div>
        <p className="text-muted-foreground mt-1 max-w-2xl">{copy.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.mode}
            to={tab.to}
            className={`text-center py-2.5 rounded-lg text-sm font-bold transition-colors ${
              mode === tab.mode
                ? "bg-inverse text-white"
                : "text-foreground hover:bg-surface-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!isSell && (
      <div className="flex flex-col xl:flex-row xl:items-end gap-3">
        <div className="min-w-0 xl:flex-[3]">
          <label
            htmlFor="filter-location"
            className="block text-[11px] font-bold text-foreground mb-1"
          >
            Location
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle-foreground" />
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
            className="block text-[11px] font-bold text-foreground mb-1"
          >
            BHK
          </label>
          <Select
            id="filter-bhk"
            value={bhk}
            onChange={(event) => setBhk(event.target.value)}
          >
            {BHK_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Any" : option}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 xl:flex-[2]">
          <label
            htmlFor="filter-min-price"
            className="block text-[11px] font-bold text-foreground mb-1"
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
            className="block text-[11px] font-bold text-foreground mb-1"
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
          className="w-full xl:w-auto inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface text-sm font-bold text-foreground hover:border-brand/60 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="xl:hidden">Reset</span>
        </button>

        <Link
          to={PLUS_ACTION[mode].to}
          className="w-full xl:w-auto xl:ml-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="truncate">{PLUS_ACTION[mode].label}</span>
        </Link>
        </div>
      )}

      {!isSell && (error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">We couldn't load properties.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-24 h-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-foreground">
            No {mode === "rent" ? "rental" : "sale"} properties match those filters
          </p>
          <p className="text-sm text-muted-foreground">
            Try a wider budget, another BHK, or a nearby locality.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold cursor-pointer"
          >
            Clear filters
          </button>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{properties.length}</span>{" "}
              {properties.length === 1 ? "property" : "properties"} found
            </p>
            <p className="text-[11px] text-subtle-foreground">
              Prices are set by owners and verified before listing.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
            {properties.map((property) => (
              <PropertyRow key={property.id} property={property} />
            ))}
          </div>
        </>
      ))}

      {!isSell && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-foreground tracking-tight">
                  Your site visits
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Upcoming visits you booked with property owners.
                </p>
              </div>
            </div>
            {upcomingVisits.length > 0 && (
              <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                {upcomingVisits.length} scheduled
              </span>
            )}
          </div>

          {upcomingVisits.length === 0 ? (
            <div className="p-8 text-center space-y-1.5">
              <CalendarDays className="w-8 h-8 text-brand mx-auto" aria-hidden="true" />
              <p className="text-sm font-bold text-foreground">No site visits yet</p>
              <p className="text-xs text-muted-foreground">
                Book a visit from any property and it will appear here.
              </p>
              <Link
                to="/real-estate/buy"
                className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-brand hover:text-brand-hover"
              >
                Browse properties
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcomingVisits.map((visit) => (
                <Link
                  key={visit.id}
                  to={`/real-estate/${visit.propertyId}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface-muted/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {visit.propertyTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDate(visit.date)} · {visit.slot}
                    </p>
                  </div>
                  <Badge
                    variant={statusBadge(visit.status)}
                    className="shrink-0 capitalize"
                  >
                    {statusLabel(visit.status)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      {isSell && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">
              My properties
            </h2>
            <Link
              to="/real-estate/list"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              List a property
            </Link>
          </div>

          {myError ? (
            <Card className="p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">We couldn't load your listings.</p>
              <button
                type="button"
                onClick={refetchMine}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold cursor-pointer"
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

      {isSell && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-5 border-b border-border">
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                Live in the market
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                A quick look at the latest sale properties.
              </p>
            </div>
            <Link
              to="/real-estate/buy"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover whitespace-nowrap"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {error ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                We couldn't load the market right now.
              </p>
              <button
                type="button"
                onClick={refetch}
                className="text-xs font-bold text-brand hover:text-brand-hover cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No sale properties in the market yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {marketPreview.map((property) => (
                <Link
                  key={property.id}
                  to={`/real-estate/${property.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-muted/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {property.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {property.location}, {property.city} · {property.bhk} ·{" "}
                      {formatArea(property.areaSqft)}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-foreground tracking-tight whitespace-nowrap">
                    {formatPropertyPrice(property.price, property.priceUnit)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
