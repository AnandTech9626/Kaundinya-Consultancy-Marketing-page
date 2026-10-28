import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Badge, Card, Select, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import {
  assignSiteVisitAdviser,
  fetchAdminSiteVisits,
  updateSiteVisitStatus,
} from "../lib/mockApi";
import { STAFF } from "../lib/mockData";
import type { AdminVisitStatus } from "../lib/moduleAdminData";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatMobile } from "../lib/formats";

const STATUS_BADGE: Record<AdminVisitStatus, BadgeVariant> = {
  requested: "gold",
  confirmed: "info",
  completed: "success",
  cancelled: "neutral",
};

export function SiteVisits() {
  const { data, loading, error, refetch } = useAsync(fetchAdminSiteVisits);
  const [busy, setBusy] = useState<string | null>(null);

  const visits = data ?? [];
  const upcoming = visits.filter(
    (visit) => visit.status === "requested" || visit.status === "confirmed"
  ).length;

  const act = async (id: string, status: AdminVisitStatus) => {
    setBusy(`${id}-${status}`);
    try {
      await updateSiteVisitStatus(id, status);
      refetch();
    } finally {
      setBusy(null);
    }
  };

  const assign = async (id: string, adviserId: string) => {
    setBusy(`${id}-assign`);
    try {
      await assignSiteVisitAdviser(id, adviserId || null);
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
            Site visits
          </h1>
          <p className="text-muted mt-1">
            Coordinate property visits and assign an adviser.
          </p>
        </div>
        <Badge variant="info">{upcoming} upcoming</Badge>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load site visits.</p>
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
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <Card className="p-10 text-center space-y-2">
          <CalendarDays className="w-8 h-8 text-gold mx-auto" />
          <p className="text-sm font-bold text-charcoal">No site visits scheduled</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ivory text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date & slot</th>
                  <th className="px-4 py-3">Adviser</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id} className="border-t border-border-subtle">
                    <td className="px-4 py-3 min-w-[14rem]">
                      <p className="font-semibold text-charcoal">{visit.propertyTitle}</p>
                      <p className="text-[11px] text-muted">{visit.id.toUpperCase()}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-charcoal">{visit.clientName}</p>
                      <p className="text-[11px] text-muted">
                        {formatMobile(visit.mobile)}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatDate(visit.date)}
                      <br />
                      {visit.slot}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        className="w-40"
                        value={visit.adviserId ?? ""}
                        onChange={(event) => void assign(visit.id, event.target.value)}
                        disabled={busy === `${visit.id}-assign`}
                      >
                        <option value="">Unassigned</option>
                        {STAFF.filter((member) => member.active).map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[visit.status]}>
                        {visit.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {visit.status === "requested" && (
                          <button
                            type="button"
                            disabled={busy === `${visit.id}-confirmed`}
                            onClick={() => void act(visit.id, "confirmed")}
                            className="rounded-md bg-gold px-2.5 py-1 text-[10px] font-bold text-charcoal hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        )}
                        {visit.status === "confirmed" && (
                          <button
                            type="button"
                            disabled={busy === `${visit.id}-completed`}
                            onClick={() => void act(visit.id, "completed")}
                            className="rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Complete
                          </button>
                        )}
                        {(visit.status === "requested" ||
                          visit.status === "confirmed") && (
                          <button
                            type="button"
                            disabled={busy === `${visit.id}-cancelled`}
                            onClick={() => void act(visit.id, "cancelled")}
                            className="rounded-md border border-border-subtle bg-white px-2.5 py-1 text-[10px] font-bold text-muted hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
