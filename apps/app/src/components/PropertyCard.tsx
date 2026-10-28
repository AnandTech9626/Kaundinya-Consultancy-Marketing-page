import { Link } from "react-router-dom";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { Badge, Card } from "@kaundinya/ui";
import type { PropertyListing } from "@kaundinya/config";
import { formatArea, formatPropertyPrice } from "../lib/formats";

interface PropertyCardProps {
  property: PropertyListing;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const image = property.images?.[0];
  return (
    <Link to={`/real-estate/${property.id}`} className="block">
      <Card hoverable className="overflow-hidden p-0 h-full flex flex-col">
        <div className="relative h-40 bg-gradient-to-br from-charcoal via-charcoal-light to-[#3b3420] flex items-center justify-center overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={property.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#f5b900_0,transparent_45%),radial-gradient(circle_at_80%_70%,#f5b900_0,transparent_40%)]" />
              <Building2 className="w-14 h-14 text-gold/40" />
            </>
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant={property.listingType === "rent" ? "info" : "gold"}>
              {property.listingType === "rent" ? "For Rent" : "For Sale"}
            </Badge>
            {property.featured && <Badge variant="warning">Featured</Badge>}
          </div>
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 backdrop-blur px-2.5 py-1 text-sm font-extrabold text-charcoal shadow-sm">
            {formatPropertyPrice(property.price, property.priceUnit)}
          </div>
        </div>

        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-charcoal leading-snug line-clamp-2">
              {property.title}
            </h3>
            <p className="flex items-center gap-1 text-xs text-muted">
              <MapPin className="w-3 h-3 shrink-0" />
              {property.location}, {property.city} · {property.pincode}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-charcoal-light">
            <span>{property.bhk}</span>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span>{formatArea(property.areaSqft)}</span>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span>{property.propertyType}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-medium text-muted"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-medium text-muted">
                +{property.amenities.length - 3}
              </span>
            )}
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between text-xs font-bold text-gold">
            View details
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
