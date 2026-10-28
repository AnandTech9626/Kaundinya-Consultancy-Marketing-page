import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Badge, Card, Skeleton, StatCard } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import type { PolicyRecord } from "@kaundinya/config";
import { downloadPolicy, fetchPolicies } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const TYPE_BADGE: Record<PolicyRecord["type"], BadgeVariant> = {
  "Life & Term": "info",
  Health: "success",
  Motor: "warning",
  Property: "neutral",
};

const STATUS_BADGE: Record<PolicyRecord["status"], BadgeVariant> = {
  active: "success",
  expiring: "danger",
  lapsed: "neutral",
};

function daysUntil(iso: string) {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function PolicyVault() {
  const { data, loading, error, refetch } = useAsync(fetchPolicies);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const policies = data ?? [];
  const active = policies.filter((policy) => policy.status === "active").length;
  const expiring = policies.filter((policy) => policy.status === "expiring");
  const totalCover = policies
    .filter((policy) => policy.status !== "lapsed")
    .reduce((sum, policy) => sum + policy.coverAmount, 0);

  const handleDownload = async (policy: PolicyRecord) => {
    setDownloading(policy.id);
    setDownloaded(null);
    try {
      const file = await downloadPolicy(policy.id);
      setDownloaded(file.fileName);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/insurance"
        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to insurance
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Insurance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Policy Vault
        </h1>
        <p className="text-muted mt-1">
          Every policy we've helped you place, with renewal reminders and downloads.
        </p>
      </div>

      {expiring.length > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <span className="font-bold">{expiring.length} policy is due for renewal:</span>{" "}
            {expiring
              .map(
                (policy) =>
                  `${policy.provider} (${daysUntil(policy.renewalDate)} days)`
              )
              .join(", ")}
            . We'll call you 30 days before every renewal.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active policies" value={active} icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="Total cover" value={formatINR(totalCover)} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Renewals due" value={expiring.length} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load your policies.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-5 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>
      ) : policies.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm font-bold text-charcoal">No policies yet</p>
          <p className="text-sm text-muted">
            Once a policy is placed, the document and renewal date appear here.
          </p>
          <Link
            to="/insurance"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
          >
            Explore insurance
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {policies.map((policy) => (
            <Card key={policy.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant={TYPE_BADGE[policy.type]}>{policy.type}</Badge>
                  <p className="text-sm font-extrabold text-charcoal mt-1.5">
                    {policy.provider}
                  </p>
                  <p className="text-[11px] text-muted">{policy.policyNumber}</p>
                </div>
                <Badge variant={STATUS_BADGE[policy.status]}>{policy.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg bg-ivory px-3 py-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                    Cover
                  </p>
                  <p className="text-sm font-bold text-charcoal">
                    {formatINR(policy.coverAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                    Premium
                  </p>
                  <p className="text-sm font-bold text-charcoal">
                    {formatINR(policy.premium)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                    Valid from
                  </p>
                  <p className="text-xs text-charcoal-light">
                    {policy.validFrom ? formatDate(policy.validFrom) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                    Renewal
                  </p>
                  <p className="text-xs font-bold text-charcoal">
                    {formatDate(policy.renewalDate)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(policy)}
                disabled={downloading === policy.id}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-bold text-charcoal hover:border-gold/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {downloading === policy.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </>
                )}
              </button>
              {downloaded && downloaded.includes(policy.policyNumber) && (
                <p className="text-[10px] text-emerald-700 text-center">
                  {downloaded} is ready (mock download).
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
