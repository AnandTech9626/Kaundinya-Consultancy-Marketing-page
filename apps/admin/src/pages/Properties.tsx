import { useMemo, useState } from "react";
import { Building2, CheckCircle2, Home, XCircle } from "lucide-react";
import { Badge, Card, Select, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import {
  fetchAdminProperties,
  updatePropertyStatus,
} from "../lib/mockApi";
import type { AdminPropertyStatus } from "../lib/moduleAdminData";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const STATUS_BADGE: Record<AdminPropertyStatus, BadgeVariant> = {
  draft: "gold",
  active: "success",
  sold: "info",
  rented: "info",
  rejected: "danger",
};

const FILTERS: (AdminPropertyStatus | "all")[] = [
  "all",
  "draft",
  "active",
  "sold",
  "rented",
  "rejected",
];

export function Properties() {
  const { data, loading, error, refetch } = useAsync(fetchAdminProperties);
  const [status, setStatus] = useState<AdminPropertyStatus | "all">("all");
  const [busy, setBusy] = useState<string | null>(null);

  const properties = data ?? [];
  const filtered = useMemo(
    () =>
      status === "all"
        ? properties
        : properties.filter((property) => property.status === status),
    [properties, status]
  );

  const stats = {
    pending: properties.filter((property) => property.status === "draft").length,
    live: properties.filter((property) => property.status === "active").length,
    closed: properties.filter(
      (property) => property.status === "sold" || property.status === "rented"
    ).length,
  };

  const act = async (id: string, next: AdminPropertyStatus) => {
    setBusy(`${id}-${next}`);
    try {
      await updatePropertyStatus(id, next);
      refetch();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Properties
          </h1>
          <p className="text-muted mt-1">
            Moderate owner listings and keep the public catalog clean.
          </p>
        </div>
        <Select
          className="sm:w-44"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as AdminPropertyStatus | "all")
          }
        >
          {FILTERS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All statuses" : option}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending review", value: stats.pending, icon: Building2 },
          { label: "Live listings", value: stats.live, icon: Home },
          { label: "Closed", value: stats.closed, icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  {stat.label}
                </p>
                <p className="text-xl font-extrabold text-charcoal">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load listings.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-5 space-y-2">
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          No listings match this status.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((property) => (
            <Card key={property.id} className="p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-charcoal truncate">
                      {property.title}
                    </p>
                    <Badge variant={STATUS_BADGE[property.status]}>
                      {property.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {property.ownerName} · {property.location} · {property.pincode}
                  </p>
                  <p className="text-[11px] text-muted-light mt-0.5">
                    {property.listingType} · {formatINR(property.price)} · submitted{" "}
                    {formatDate(property.submittedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {property.status === "draft" && (
                    <>
                      <button
                        type="button"
                        disabled={busy === `${property.id}-active`}
                        onClick={() => void act(property.id, "active")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gold hover:bg-gold-hover px-3 py-1.5 text-[11px] font-bold text-charcoal transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Publish
                      </button>
                      <button
                        type="button"
                        disabled={busy === `${property.id}-rejected`}
                        onClick={() => void act(property.id, "rejected")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {property.status === "active" && (
                    <>
                      <button
                        type="button"
                        disabled={busy === `${property.id}-sold`}
                        onClick={() => void act(property.id, "sold")}
                        className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Mark sold
                      </button>
                      <button
                        type="button"
                        disabled={busy === `${property.id}-rented`}
                        onClick={() => void act(property.id, "rented")}
                        className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Mark rented
                      </button>
                      <button
                        type="button"
                        disabled={busy === `${property.id}-draft`}
                        onClick={() => void act(property.id, "draft")}
                        className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-muted hover:border-gold/60 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Unpublish
                      </button>
                    </>
                  )}
                  {(property.status === "sold" ||
                    property.status === "rented" ||
                    property.status === "rejected") && (
                    <button
                      type="button"
                      disabled={busy === `${property.id}-active`}
                      onClick={() => void act(property.id, "active")}
                      className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
