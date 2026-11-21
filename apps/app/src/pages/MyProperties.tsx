import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Card, Skeleton } from "@kaundinya/ui";
import { EmptyMyProperties, MyPropertiesSection } from "./RealEstate";
import { fetchMyProperties } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";

export function MyProperties() {
  const { data, loading, error, refetch } = useAsync(fetchMyProperties, []);
  const listings = data ?? [];

  const mySale = useMemo(
    () => listings.filter((item) => item.listingType === "sale"),
    [listings],
  );
  const myRent = useMemo(
    () => listings.filter((item) => item.listingType === "rent"),
    [listings],
  );

  return (
    <div className="space-y-3">
      <Link
        to="/real-estate/buy"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to properties
      </Link>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            Real Estate
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            My properties
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Track the properties you listed for sale or rent, see their review
            status, and manage them until they go live.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto">
          <Link
            to="/real-estate/valuation"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-brand/60 xl:flex-none"
          >
            Free consultation
          </Link>
          <Link
            to="/real-estate/list"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover xl:flex-none"
          >
            <Plus className="w-4 h-4 shrink-0" />
            List a property
          </Link>
        </div>
      </div>

      {error ? (
        <Card className="p-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            We couldn't load your listings.
          </p>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-on-brand hover:bg-brand-hover cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
  );
}
