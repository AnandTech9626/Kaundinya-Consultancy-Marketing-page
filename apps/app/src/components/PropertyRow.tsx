import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Building2,
  MapPin,
  Ruler,
  Star,
} from "lucide-react";
import { Badge, Card } from "@kaundinya/ui";
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
      <Card hoverable className="p-3 h-full">
        <div className="flex items-center gap-3">
          <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-inverse via-inverse-hover to-[#3b3420] shrink-0">
            {image ? (
              <img
                src={image}
                alt={property.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#f5b900_0,transparent_45%),radial-gradient(circle_at_80%_70%,#f5b900_0,transparent_40%)]" />
                <Building2
                  className="relative w-7 h-7 text-brand/40"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <Badge variant={isRent ? "info" : "gold"}>
                  {isRent ? "For Rent" : "For Sale"}
                </Badge>
                {property.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand-strong border border-brand/30">
                    <Star className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                    Featured
                  </span>
                )}
              </div>
              <p className="text-sm font-extrabold text-foreground tracking-tight whitespace-nowrap">
                {formatPropertyPrice(property.price, property.priceUnit)}
              </p>
            </div>

            <h3 className="text-sm font-bold text-foreground leading-snug truncate mt-1">
              {property.title}
            </h3>

            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 min-w-0">
              <MapPin
                className="w-3 h-3 shrink-0 text-brand-strong"
                aria-hidden="true"
              />
              <span className="truncate">
                {property.location}, {property.city} · {property.pincode}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-foreground-soft mt-1.5">
              {specs.map((spec, index) => {
                const Icon = spec.icon;
                return (
                  <span key={index} className="inline-flex items-center gap-1">
                    {index > 0 && (
                      <span className="w-1 h-1 rounded-full bg-border mr-1" aria-hidden="true" />
                    )}
                    <Icon className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                    {spec.label}
                  </span>
                );
              })}
            </div>
          </div>

          <ArrowRight
            className="w-4 h-4 text-brand-strong shrink-0 self-center hidden sm:block transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </Card>
    </Link>
  );
}
