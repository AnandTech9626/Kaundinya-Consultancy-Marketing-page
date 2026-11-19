import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Building2,
  MapPin,
  Ruler,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card } from "@kaundinya/ui";
import type { PropertyListing } from "@kaundinya/config";
import { formatArea, formatPropertyPrice } from "../lib/formats";

interface PropertyCardProps {
  property: PropertyListing;
}

const MAX_AMENITIES = 2;

function Spec({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-1 text-[11px] font-semibold text-foreground-soft">
      <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function PropertyCard({ property }: PropertyCardProps) {
  const image = property.images?.[0];
  const isRent = property.listingType === "rent";
  const extraAmenities = property.amenities.length - MAX_AMENITIES;

  return (
    <Link
      to={`/real-estate/${property.id}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card hoverable className="overflow-hidden p-0 h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-inverse via-inverse-hover to-[#3b3420] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={property.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#f5b900_0,transparent_45%),radial-gradient(circle_at_80%_70%,#f5b900_0,transparent_40%)]" />
              <Building2
                className="relative w-12 h-12 text-brand/40"
                aria-hidden="true"
              />
            </>
          )}

          <div className="absolute top-3 left-3">
            <Badge
              variant={isRent ? "info" : "gold"}
              className="shadow-sm backdrop-blur"
            >
              {isRent ? "For Rent" : "For Sale"}
            </Badge>
          </div>

          {property.featured && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-on-brand shadow-sm">
              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
              Featured
            </span>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-foreground leading-snug line-clamp-2">
              {property.title}
            </h3>
            <p className="text-lg font-extrabold text-foreground tracking-tight">
              {formatPropertyPrice(property.price, property.priceUnit)}
            </p>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <MapPin
              className="w-3.5 h-3.5 shrink-0 text-brand-strong"
              aria-hidden="true"
            />
            <span className="truncate">
              {property.location}, {property.city} · {property.pincode}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {property.bhk && <Spec icon={BedDouble} label={property.bhk} />}
            <Spec icon={Ruler} label={formatArea(property.areaSqft)} />
            <Spec icon={Building2} label={property.propertyType} />
          </div>

          {property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.slice(0, MAX_AMENITIES).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {amenity}
                </span>
              ))}
              {extraAmenities > 0 && (
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  +{extraAmenities}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-1 flex items-center justify-end gap-1.5 text-xs font-bold text-brand-strong">
            View details
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
