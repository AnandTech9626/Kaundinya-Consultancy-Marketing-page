import { useState } from "react";
import { ArrowRight, Star, Wrench } from "lucide-react";
import { Badge, Card, Select, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import {
  assignJobTechnician,
  fetchAdminJobs,
  updateJobStatus,
} from "../lib/mockApi";
import { STAFF } from "../lib/mockData";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR, formatMobile } from "../lib/formats";

const NEXT_STATUS: Record<string, string> = {
  requested: "assigned",
  assigned: "en_route",
  en_route: "in_progress",
  in_progress: "completed",
};

const STATUS_BADGE: Record<string, BadgeVariant> = {
  requested: "gold",
  assigned: "info",
  en_route: "warning",
  in_progress: "info",
  completed: "success",
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  assigned: "Assigned",
  en_route: "En route",
  in_progress: "In progress",
  completed: "Completed",
};

export function Dispatch() {
  const { data, loading, error, refetch } = useAsync(fetchAdminJobs);
  const [busy, setBusy] = useState<string | null>(null);

  const jobs = data ?? [];
  const active = jobs.filter((job) => job.status !== "completed").length;
  const rated = jobs.filter((job) => job.rating !== null);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, job) => sum + (job.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";

  const assign = async (id: string, technicianId: string) => {
    setBusy(`${id}-assign`);
    try {
      await assignJobTechnician(id, technicianId || null);
      refetch();
    } finally {
      setBusy(null);
    }
  };

  const advance = async (id: string, status: string) => {
    const next = NEXT_STATUS[status];
    if (!next) return;
    setBusy(`${id}-${next}`);
    try {
      await updateJobStatus(id, next);
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
            Dispatch
          </h1>
          <p className="text-muted mt-1">
            Assign technicians and move home-service jobs through the pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info">{active} active</Badge>
          <Badge variant="gold">
            <Star className="w-3 h-3" />
            {avgRating} avg
          </Badge>
        </div>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load jobs.</p>
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
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-10 text-center space-y-2">
          <Wrench className="w-8 h-8 text-gold mx-auto" />
          <p className="text-sm font-bold text-charcoal">No jobs in the queue</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ivory text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-border-subtle">
                    <td className="px-4 py-3 min-w-[12rem]">
                      <p className="font-semibold text-charcoal">{job.serviceName}</p>
                      <p className="text-[11px] text-muted">{job.address}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-charcoal">{job.clientName}</p>
                      <p className="text-[11px] text-muted">{formatMobile(job.mobile)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        className="w-40"
                        value={job.technicianId ?? ""}
                        onChange={(event) => void assign(job.id, event.target.value)}
                        disabled={busy === `${job.id}-assign`}
                      >
                        <option value="">Unassigned</option>
                        {STAFF.filter((member) => member.active).map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {job.scheduledAt ? formatDate(job.scheduledAt) : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatINR(job.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[job.status] ?? "neutral"}>
                        {STATUS_LABEL[job.status] ?? job.status}
                      </Badge>
                      {job.rating !== null && (
                        <p className="text-[10px] text-muted mt-1 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-gold text-gold" />
                          {job.rating}/5
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {NEXT_STATUS[job.status] ? (
                        <button
                          type="button"
                          disabled={busy === `${job.id}-${NEXT_STATUS[job.status]}`}
                          onClick={() => void advance(job.id, job.status)}
                          className="inline-flex items-center gap-1 rounded-md bg-gold px-2.5 py-1 text-[10px] font-bold text-charcoal hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {STATUS_LABEL[NEXT_STATUS[job.status]]}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Closed
                        </span>
                      )}
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
