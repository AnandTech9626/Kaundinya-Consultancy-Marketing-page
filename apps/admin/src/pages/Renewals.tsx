import { useState } from "react";
import { BellRing, RefreshCw } from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import { fetchAdminRenewals, sendRenewalReminder } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

function daysUntil(iso: string) {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function Renewals() {
  const { data, loading, error, refetch } = useAsync(fetchAdminRenewals);
  const [busy, setBusy] = useState<string | null>(null);

  const renewals = data ?? [];
  const dueSoon = renewals.filter(
    (renewal) => daysUntil(renewal.renewalDate) <= 30 && !renewal.reminderSent
  ).length;

  const remind = async (id: string) => {
    setBusy(id);
    try {
      await sendRenewalReminder(id);
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
            Renewals
          </h1>
          <p className="text-muted mt-1">
            Policies due in the next 30 days. Send a reminder before the client lapses.
          </p>
        </div>
        <Badge variant={dueSoon > 0 ? "danger" : "success"}>
          {dueSoon} awaiting reminder
        </Badge>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load renewals.</p>
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
      ) : renewals.length === 0 ? (
        <Card className="p-10 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-gold mx-auto" />
          <p className="text-sm font-bold text-charcoal">No policies due soon</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {renewals.map((renewal) => {
            const days = daysUntil(renewal.renewalDate);
            const urgent = days <= 30;
            return (
              <Card key={renewal.id} className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-charcoal">
                        {renewal.clientName}
                      </p>
                      <Badge variant={urgent ? "danger" : "neutral"}>
                        {days} days
                      </Badge>
                      {renewal.reminderSent && (
                        <Badge variant="success">Reminder sent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {renewal.provider} · {renewal.policyType} ·{" "}
                      {renewal.policyNumber}
                    </p>
                    <p className="text-[11px] text-muted-light mt-0.5">
                      Renewal {formatDate(renewal.renewalDate)} · premium{" "}
                      {formatINR(renewal.premium)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={renewal.reminderSent || busy === renewal.id}
                    onClick={() => void remind(renewal.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gold hover:bg-gold-hover px-3 py-1.5 text-[11px] font-bold text-charcoal transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    {renewal.reminderSent ? "Reminder sent" : "Send reminder"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
