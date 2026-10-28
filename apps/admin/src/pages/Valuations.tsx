import { useState } from "react";
import { CalendarCheck2, CheckCircle2, ClipboardList } from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import { fetchAdminValuations, updateValuationStatus } from "../lib/mockApi";
import type { AdminValuationStatus } from "../lib/moduleAdminData";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR, formatMobile } from "../lib/formats";

const STATUS_BADGE: Record<AdminValuationStatus, BadgeVariant> = {
  requested: "gold",
  scheduled: "info",
  completed: "success",
};

export function Valuations() {
  const { data, loading, error, refetch } = useAsync(fetchAdminValuations);
  const [busy, setBusy] = useState<string | null>(null);

  const valuations = data ?? [];
  const pending = valuations.filter(
    (valuation) => valuation.status === "requested"
  ).length;

  const act = async (id: string, status: AdminValuationStatus) => {
    setBusy(`${id}-${status}`);
    try {
      await updateValuationStatus(id, status);
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
            Valuations
          </h1>
          <p className="text-muted mt-1">
            Free property valuation requests from owners.
          </p>
        </div>
        <Badge variant="gold">{pending} awaiting scheduling</Badge>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load valuations.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-5 space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
      ) : valuations.length === 0 ? (
        <Card className="p-10 text-center space-y-2">
          <ClipboardList className="w-8 h-8 text-gold mx-auto" />
          <p className="text-sm font-bold text-charcoal">No valuation requests</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {valuations.map((valuation) => (
            <Card key={valuation.id} className="p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-charcoal">
                      {valuation.ownerName}
                    </p>
                    <Badge variant={STATUS_BADGE[valuation.status]}>
                      {valuation.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {valuation.propertyType} · {valuation.location} ·{" "}
                    {formatMobile(valuation.mobile)}
                  </p>
                  <p className="text-[11px] text-muted-light mt-0.5">
                    Expected {formatINR(valuation.expectedPrice)} · requested{" "}
                    {formatDate(valuation.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {valuation.status === "requested" && (
                    <button
                      type="button"
                      disabled={busy === `${valuation.id}-scheduled`}
                      onClick={() => void act(valuation.id, "scheduled")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gold hover:bg-gold-hover px-3 py-1.5 text-[11px] font-bold text-charcoal transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CalendarCheck2 className="w-3.5 h-3.5" />
                      Schedule visit
                    </button>
                  )}
                  {valuation.status === "scheduled" && (
                    <button
                      type="button"
                      disabled={busy === `${valuation.id}-completed`}
                      onClick={() => void act(valuation.id, "completed")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gold hover:bg-gold-hover px-3 py-1.5 text-[11px] font-bold text-charcoal transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark completed
                    </button>
                  )}
                  {valuation.status === "completed" && (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Report delivered
                    </span>
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
