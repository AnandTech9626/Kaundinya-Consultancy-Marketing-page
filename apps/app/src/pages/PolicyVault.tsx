import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, Skeleton, StatCard } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import type { PolicyRecord } from "@kaundinya/config";
import { downloadPolicy, fetchPolicies } from "../lib/mockApi";
import { formatDate, formatINR } from "../lib/formats";
import { InsuranceRequestDialog } from "../components/InsuranceRequestDialog";

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
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ service: string; kind: string } | null>(
    null
  );

  useEffect(() => {
    let active = true;
    fetchPolicies()
      .then((rows) => {
        if (active) setPolicies(rows);
      })
      .catch(() => {
        if (active) setPolicies([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const active = policies.filter((policy) => policy.status === "active").length;
  const expiring = policies.filter((policy) => policy.status === "expiring");
  const totalCover = policies
    .filter((policy) => policy.status !== "lapsed")
    .reduce((sum, policy) => sum + policy.coverAmount, 0);

  const handleDownload = async (policy: PolicyRecord) => {
    setDownloading(policy.id);
    setDownloaded(null);
    setError(null);
    try {
      const result = await downloadPolicy(policy.id);
      if (result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
      setDownloaded(policy.policyNumber);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not request the policy document."
      );
    } finally {
      setDownloading(null);
    }
  };

  const openRequest = (service: string, kind = "Insurance consultation") =>
    setDialog({ service, kind });

  return (
    <div className="space-y-6">
      <Link
        to="/insurance"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to insurance
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
            Insurance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Policy Vault
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Policies your consultant has recorded for you, with renewal dates
            and documents in one place.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            openRequest("Policy review · Policy Vault", "Insurance consultation")
          }
        >
          Request a policy review
        </Button>
      </div>

      {expiring.length > 0 && (
        <Card className="p-4 border-warning-fg/20 bg-warning-soft flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning-fg shrink-0 mt-0.5" />
          <p className="text-xs text-warning-fg">
            <span className="font-bold">
              {expiring.length} policy is due for renewal:
            </span>{" "}
            {expiring
              .map(
                (policy) =>
                  `${policy.provider} (${daysUntil(policy.renewalDate)} days)`
              )
              .join(", ")}
            . We will call you 30 days before every renewal.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active policies"
          value={active}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Total cover"
          value={formatINR(totalCover)}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          label="Renewals due"
          value={expiring.length}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-danger-fg/20 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-fg">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : policies.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-brand mx-auto" />
          <p className="text-sm font-bold text-foreground">No policies yet</p>
          <p className="text-sm text-muted-foreground">
            Once a policy is placed, the document and renewal date appear here.
          </p>
          <Button onClick={() => openRequest("Insurance consultation")}>
            Talk to a consultant
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {policies.map((policy) => (
            <Card key={policy.id} className="p-5 space-y-3 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant={TYPE_BADGE[policy.type]}>{policy.type}</Badge>
                  <p className="text-sm font-extrabold text-foreground mt-1.5">
                    {policy.provider}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{policy.policyNumber}</p>
                </div>
                <Badge variant={STATUS_BADGE[policy.status]}>
                  {policy.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface-muted px-3 py-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
                    Cover
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {formatINR(policy.coverAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
                    Premium
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {formatINR(policy.premium)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
                    Valid from
                  </p>
                  <p className="text-xs text-foreground-soft">
                    {policy.validFrom ? formatDate(policy.validFrom) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
                    Renewal
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {formatDate(policy.renewalDate)}
                  </p>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(policy)}
                  disabled={downloading === policy.id}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-brand/60 transition-colors disabled:opacity-50 cursor-pointer"
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    openRequest(
                      `Renewal help · ${policy.provider} ${policy.policyNumber}`,
                      "Renewal help"
                    )
                  }
                >
                  Renewal help
                </Button>
              </div>

              {downloaded === policy.policyNumber && (
                <p className="text-[10px] text-success-fg text-center">
                    {policy.policyNumber}.pdf requested.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-surface-muted/60 flex items-start gap-3">
        <FileText className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Policy records are added by your consultant after a policy is placed.
          If something is missing, raise a request and we will update it.
        </p>
      </Card>

      <InsuranceRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Insurance consultation"}
      />
    </div>
  );
}
