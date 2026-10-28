import { Inbox, Sparkles, CheckCircle2, ClipboardList } from "lucide-react";
import { Card, Skeleton, StatCard } from "@kaundinya/ui";
import { fetchStats } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { ENQUIRY_STATUS } from "../lib/status";

function BreakdownBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-charcoal-light font-medium">{label}</span>
        <span className="text-muted tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-ivory-dark overflow-hidden">
        <div className="h-2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Overview() {
  const { data, loading, error, refetch } = useAsync(fetchStats);

  const maxService = data ? Math.max(1, ...data.byService.map((s) => s.count)) : 1;
  const maxStatus = data ? Math.max(1, ...data.byStatus.map((s) => s.count)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Overview
        </h1>
        <p className="text-muted mt-1">A snapshot of enquiries, clients and requests.</p>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load the dashboard.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Enquiries" value={data.totalEnquiries} icon={<Inbox className="w-5 h-5" />} />
            <StatCard label="New" value={data.newEnquiries} icon={<Sparkles className="w-5 h-5" />} />
            <StatCard label="Converted" value={data.converted} icon={<CheckCircle2 className="w-5 h-5" />} />
            <StatCard label="Open Requests" value={data.openRequests} icon={<ClipboardList className="w-5 h-5" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-4">
                Enquiries by service
              </h2>
              <div className="space-y-3">
                {data.byService.map((s) => (
                  <BreakdownBar key={s.name} label={s.name} value={s.count} max={maxService} />
                ))}
                {data.byService.length === 0 && (
                  <p className="text-sm text-muted">No data yet.</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-4">
                Enquiries by status
              </h2>
              <div className="space-y-3">
                {data.byStatus.map((s) => (
                  <BreakdownBar
                    key={s.status}
                    label={ENQUIRY_STATUS[s.status].label}
                    value={s.count}
                    max={maxStatus}
                  />
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
