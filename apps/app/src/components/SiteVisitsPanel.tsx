import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge, Card } from "@kaundinya/ui";
import type { SiteVisit } from "@kaundinya/config";
import { formatDate } from "../lib/formats";
import { statusBadge, statusLabel } from "../lib/status";

interface SiteVisitsPanelProps {
  visits: SiteVisit[];
  limit?: number;
  className?: string;
}

export function SiteVisitsPanel({
  visits,
  limit = 5,
  className = "",
}: SiteVisitsPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? visits : visits.slice(0, limit);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold tracking-tight text-foreground">
              Your site visits
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Upcoming visits you booked.
            </p>
          </div>
        </div>
        <Badge variant="neutral">{visits.length}</Badge>
      </div>

      {visits.length === 0 ? (
        <div className="p-6 text-center space-y-1.5">
          <CalendarDays className="mx-auto h-7 w-7 text-brand" aria-hidden="true" />
          <p className="text-sm font-bold text-foreground">No site visits yet</p>
          <p className="text-xs text-muted-foreground">
            Book a visit from any property and it will appear here.
          </p>
          <Link
            to="/real-estate/buy"
            className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-brand hover:text-brand-hover"
          >
            Browse properties
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {visible.map((visit) => (
              <Link
                key={visit.id}
                to={`/real-estate/${visit.propertyId}`}
                className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {visit.propertyTitle}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDate(visit.date)} · {visit.slot}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge variant={statusBadge(visit.status)} className="capitalize">
                    {statusLabel(visit.status)}
                  </Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </div>
              </Link>
            ))}
          </div>

          {visits.length > limit && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="w-full border-t border-border px-4 py-2.5 text-center text-[11px] font-bold text-brand transition-colors hover:bg-brand-soft/40 cursor-pointer"
            >
              {showAll ? "Show less" : `View all ${visits.length} visits`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
