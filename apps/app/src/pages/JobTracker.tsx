import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList, Ruler, Wrench } from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import { MODULE_STAGES } from "@kaundinya/config";
import { fetchJobs, fetchMeasurements } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const STAGES = MODULE_STAGES["property-home-services"];

const JOB_BADGE: Record<string, BadgeVariant> = {
  requested: "gold",
  assigned: "info",
  en_route: "warning",
  in_progress: "info",
  completed: "success",
};

function stageLabel(status: string) {
  return STAGES.find((stage) => stage.id === status)?.label ?? status;
}

export function JobTracker() {
  const { data: jobs, loading, error, refetch } = useAsync(fetchJobs);
  const { data: measurements } = useAsync(fetchMeasurements);

  const allJobs = jobs ?? [];
  const active = allJobs.filter((job) => job.status !== "completed");
  const completed = allJobs.filter((job) => job.status === "completed");

  const renderJob = (job: (typeof allJobs)[number]) => {
    const index = STAGES.findIndex((stage) => stage.id === job.status);
    const progress = index < 0 ? 0 : ((index + 1) / STAGES.length) * 100;
    return (
      <Link key={job.id} to={`/jobs/${job.id}`} className="block">
        <Card hoverable className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal truncate">{job.serviceName}</p>
                <p className="text-xs text-muted">
                  {job.technician ?? "Technician being assigned"}
                  {job.scheduledAt ? ` · ${job.scheduledAt}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={JOB_BADGE[job.status] ?? "neutral"}>
                {stageLabel(job.status)}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-light" />
            </div>
          </div>

          <div className="h-1.5 rounded-full bg-ivory-dark overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-light">
            <span>{job.issueTypes?.join(", ") || "General service"}</span>
            <span>{job.amount ? formatINR(job.amount) : "Quote after visit"}</span>
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Home Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          My jobs
        </h1>
        <p className="text-muted mt-1">
          Follow every visit from assignment to completion, and rate the work.
        </p>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load your jobs.</p>
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
            <Card key={index} className="p-5 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      ) : allJobs.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">No jobs yet</p>
          <p className="text-sm text-muted">
            Book a service and it will appear here with live status.
          </p>
          <Link
            to="/home-services"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
          >
            Explore home services
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
              Active jobs
            </h2>
            {active.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted">
                No active jobs right now.
              </Card>
            ) : (
              active.map(renderJob)
            )}
          </div>

          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
                Completed
              </h2>
              {completed.map(renderJob)}
            </div>
          )}
        </>
      )}

      {(measurements ?? []).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-gold" />
            <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
              Measurement visits
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(measurements ?? []).map((measurement) => (
              <Card key={measurement.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-charcoal">
                      {measurement.serviceName}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {formatDate(measurement.date)} · {measurement.slot}
                    </p>
                    <p className="text-[11px] text-muted-light mt-0.5">
                      {measurement.address} · {measurement.pincode}
                    </p>
                  </div>
                  <Badge variant={measurement.status === "completed" ? "success" : "gold"}>
                    {measurement.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
