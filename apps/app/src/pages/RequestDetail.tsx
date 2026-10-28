import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge, Card, Skeleton, StatusTimeline } from "@kaundinya/ui";
import { fetchRequest } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { STATUS_META, STATUS_ORDER } from "../lib/status";
import { getServiceIcon } from "../lib/icons";

function iconNameFor(category: string) {
  if (category === "Real Estate") return "Building2";
  if (category === "Insurance") return "ShieldCheck";
  if (category === "Loans") return "Coins";
  return "Wrench";
}

export function RequestDetail() {
  const { id } = useParams();
  const { data: request, loading, error, refetch } = useAsync(
    () => fetchRequest(id ?? ""),
    [id]
  );

  const backLink = (
    <Link
      to="/requests"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to requests
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        {backLink}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
        </Card>
        <Card className="p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load this request.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center text-sm text-muted">Request not found.</Card>
      </div>
    );
  }

  const Icon = getServiceIcon(iconNameFor(request.serviceCategory));

  return (
    <div className="space-y-6 max-w-3xl">
      {backLink}

      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                {request.serviceCategory}
              </p>
              <h1 className="text-xl font-extrabold text-charcoal tracking-tight">
                {request.specificService}
              </h1>
            </div>
          </div>
          <Badge variant={STATUS_META[request.status].badge}>
            {STATUS_META[request.status].label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Reference</p>
            <p className="text-sm font-semibold text-charcoal">#{request.id.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Submitted on</p>
            <p className="text-sm font-semibold text-charcoal">{request.createdAt}</p>
          </div>
        </div>

        {request.comments && (
          <div className="border-t border-border-subtle pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
              Your note
            </p>
            <p className="text-sm text-charcoal-light leading-relaxed">{request.comments}</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-5">Status</h2>
        <StatusTimeline
          stages={STATUS_ORDER.map((status) => ({
            id: status,
            label: STATUS_META[status].label,
          }))}
          currentId={request.status}
          cancelled={request.status === "cancelled"}
        />
      </Card>
    </div>
  );
}
