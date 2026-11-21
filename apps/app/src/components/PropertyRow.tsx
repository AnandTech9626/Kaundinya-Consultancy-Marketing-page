import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BedDouble,
  Building2,
  MapPin,
  Ruler,
  Star,
} from "lucide-react";
import { Card } from "@kaundinya/ui";
import type { PropertyListing } from "@kaundinya/config";
import { formatArea, formatPropertyPrice } from "../lib/formats";

interface PropertyRowProps {
  property: PropertyListing;
}

export function PropertyRow({ property }: PropertyRowProps) {
  const image = property.images?.[0];
  const isRent = property.listingType === "rent";
  const specs = [
    { icon: BedDouble, label: property.bhk },
    { icon: Ruler, label: formatArea(property.areaSqft) },
    { icon: Building2, label: property.propertyType },
  ].filter((spec) => Boolean(spec.label));

  return (
    <Link
      to={`/real-estate/${property.id}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        hoverable
        className="flex h-full flex-col overflow-hidden border-border/80 p-0 transition-colors group-hover:border-brand/40"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-inverse via-inverse-hover to-[#3b3420]">
          {image ? (
            <img
              src={image}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f5b900_0,transparent_45%),radial-gradient(circle_at_80%_70%,#f5b900_0,transparent_40%)] opacity-20" />
              <Building2 className="relative h-9 w-9 text-brand/40" aria-hidden="true" />
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-charcoal shadow-sm">
              {isRent ? "For Rent" : "For Sale"}
            </span>
            {property.featured && (
              <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-on-brand shadow-sm">
                <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-extrabold leading-none tracking-tight text-foreground tabular-nums">
              {formatPropertyPrice(property.price, property.priceUnit)}
            </p>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong transition-colors group-hover:bg-brand group-hover:text-on-brand">
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>

          <h3 className="line-clamp-2 min-h-[2.5em] text-sm font-bold leading-snug text-foreground">
            {property.title}
          </h3>

          <p className="flex min-w-0 items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 text-brand-strong" aria-hidden="true" />
            <span className="truncate">
              {property.location}, {property.city} · {property.pincode}
            </span>
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/70 pt-2 text-[11px] font-semibold text-foreground-soft">
            {specs.map((spec, index) => {
              const Icon = spec.icon;
              return (
                <span key={index} className="inline-flex items-center gap-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {spec.label}
                </span>
              );
            })}
          </div>
        </div>
      </Card>
    </Link>
  );
}
