import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge, Card, StatusTimeline } from "@kaundinya/ui";
import type { ServiceRequest } from "@kaundinya/config";
import { fetchRequest } from "../lib/mockApi";
import { useMockRequests } from "../lib/mockRequests";
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
  const { requests: mockRequests } = useMockRequests();
  const [liveRequest, setLiveRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchRequest(id)
      .then((item) => {
        if (active) setLiveRequest(item);
      })
      .catch(() => {
        if (active) setLiveRequest(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const request =
    liveRequest ?? mockRequests.find((entry) => entry.id === id) ?? null;

  const backLink = (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to dashboard
    </Link>
  );

  if (loading && !request) {
    return (
      <div className="space-y-4 max-w-3xl">
        {backLink}
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Loading request...
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-4 max-w-3xl">
        {backLink}
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Request not found.
        </Card>
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
            <div className="w-11 h-11 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {request.serviceCategory}
              </p>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {request.specificService}
              </h1>
            </div>
          </div>
          <Badge variant={STATUS_META[request.status].badge}>
            {STATUS_META[request.status].label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Reference
            </p>
            <p className="text-sm font-semibold text-foreground">
              #{request.id.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Submitted on
            </p>
            <p className="text-sm font-semibold text-foreground">
              {request.createdAt}
            </p>
          </div>
        </div>

        {request.comments && (
          <div className="border-t border-border pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Your note
            </p>
            <p className="text-sm text-foreground-soft leading-relaxed">
              {request.comments}
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-extrabold text-foreground tracking-tight mb-5">
          Status
        </h2>
        <StatusTimeline
          stages={STATUS_ORDER.map((status) => ({
            id: status,
            label: STATUS_META[status].label,
          }))}
          currentId={request.status}
          cancelled={request.status === "cancelled"}
        />
      </Card>

      <Card className="p-4 bg-surface-muted/60">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          A consultant reviews this request and updates the status. For anything
          urgent, raise a fresh request from the Insurance support page.
        </p>
      </Card>
    </div>
  );
}
