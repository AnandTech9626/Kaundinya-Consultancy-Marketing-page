import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Badge, Card, Select, Skeleton } from "@kaundinya/ui";
import type { RequestStatus } from "@kaundinya/config";
import { fetchRequests } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { REQUEST_STATUS } from "../lib/status";
import { formatDate, formatMobile } from "../lib/formats";
import { STAFF } from "../lib/mockData";

const FILTERS: (RequestStatus | "all")[] = [
  "all",
  "new",
  "in_progress",
  "completed",
  "cancelled",
];

export function Requests() {
  const { data, loading, error, refetch } = useAsync(fetchRequests);
  const [status, setStatus] = useState<RequestStatus | "all">("all");

  const staffName = (id: string | null) =>
    id ? STAFF.find((s) => s.id === id)?.name ?? "—" : "Unassigned";

  const filtered = useMemo(() => {
    const list = data ?? [];
    return status === "all" ? list : list.filter((r) => r.status === status);
  }, [data, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Service Requests
          </h1>
          <p className="text-muted mt-1">Requests raised by clients in the app.</p>
        </div>
        <Select
          className="sm:w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value as RequestStatus | "all")}
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All statuses" : REQUEST_STATUS[f].label}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load requests.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">No requests found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ivory text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border-subtle hover:bg-ivory/60">
                    <td className="px-4 py-3 font-bold text-charcoal whitespace-nowrap">
                      #{r.id.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-charcoal font-semibold">{r.clientName}</p>
                      <p className="text-xs text-muted">{formatMobile(r.mobile)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-charcoal-light">{r.serviceCategory}</p>
                      <p className="text-xs text-muted truncate max-w-[16rem]">{r.specificService}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={REQUEST_STATUS[r.status].badge}>
                        {REQUEST_STATUS[r.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{staffName(r.assignedTo)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(r.createdAt)}</td>
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
