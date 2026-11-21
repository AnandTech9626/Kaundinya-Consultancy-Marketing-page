import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, Skeleton, StatCard } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import type { PolicyRecord, ServiceRequest } from "@kaundinya/config";
import { fetchPolicies, fetchRequests } from "../lib/mockApi";
import { downloadPolicyPdf } from "../lib/policyPdf";
import { useAuth } from "../lib/auth";
import { useLiveRefetch } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";
import { statusBadge, statusLabel } from "../lib/status";
import { isPolicyRenewalSolved } from "../lib/renewals";
import { InsuranceRequestDialog } from "../components/InsuranceRequestDialog";
import { MotorPolicyDialog } from "../components/MotorPolicyDialog";
import { InsurerLogo } from "../components/InsurerLogo";

const TYPE_BADGE: Record<PolicyRecord["type"], BadgeVariant> = {
  "Life & Term": "info",
  Health: "success",
  Motor: "warning",
  Property: "neutral",
};

const TYPE_FILTERS: Array<{ id: "all" | PolicyRecord["type"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "Life & Term", label: "Life & Term" },
  { id: "Health", label: "Health" },
  { id: "Motor", label: "Motor" },
  { id: "Property", label: "Property" },
];

function daysUntil(iso: string) {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

function renewalLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  }
  if (days === 0) return "Renews today";
  return `Renews in ${days} day${days === 1 ? "" : "s"}`;
}

export function PolicyVault() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ service: string; kind: string } | null>(
    null
  );
  const [addingPolicy, setAddingPolicy] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | PolicyRecord["type"]>(
    "all"
  );

  const load = useCallback(() => {
    Promise.all([fetchPolicies(), fetchRequests()])
      .then(([rows, nextRequests]) => {
        setPolicies(rows);
        setRequests(nextRequests);
      })
      .catch(() => {
        setPolicies([]);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useLiveRefetch(load);

  const active = policies.filter((policy) => policy.status === "active").length;
  const pending = policies.filter((policy) => policy.status === "pending");
  const expiring = policies.filter(
    (policy) =>
      policy.status !== "pending" &&
      !isPolicyRenewalSolved(policy, requests) &&
      (policy.status === "expiring" ||
        policy.status === "lapsed" ||
        daysUntil(policy.renewalDate) <= 45)
  );
  const totalCover = policies
    .filter(
      (policy) => policy.status !== "lapsed" && policy.status !== "pending"
    )
    .reduce((sum, policy) => sum + policy.coverAmount, 0);
  const filteredPolicies =
    typeFilter === "all"
      ? policies
      : policies.filter((policy) => policy.type === typeFilter);

  const handleDownload = async (policy: PolicyRecord) => {
    setDownloading(policy.id);
    setError(null);
    try {
      await downloadPolicyPdf(policy, {
        name: user?.name,
        mobile: user?.mobile,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not prepare the policy document."
      );
    } finally {
      setDownloading(null);
    }
  };

  const openRequest = (service: string, kind = "Insurance consultation") =>
    setDialog({ service, kind });

  return (
    <div className="space-y-5">
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
            Active policies
          </h1>
          <p className="text-muted-foreground mt-1">
            Every policy recorded for you, with cover, renewal dates and
            documents in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setAddingPolicy(true)}>
            <Plus className="w-4 h-4" />
            Add motor policy
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              openRequest("Policy review", "Insurance consultation")
            }
          >
            Request a policy review
          </Button>
        </div>
      </div>

      {expiring.length > 0 && (
        <Card className="p-4 border-warning-fg/20 bg-warning-soft flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning-fg shrink-0 mt-0.5" />
          <div className="text-xs text-warning-fg">
            <p className="font-bold">
              {expiring.length}{" "}
              {expiring.length === 1
                ? "policy is due for renewal"
                : "policies are due for renewal"}
            </p>
            <ul className="mt-1 space-y-0.5">
              {expiring.map((policy) => (
                <li key={policy.id}>
                  {policy.provider} · {policy.policyNumber} —{" "}
                  {renewalLabel(policy.renewalDate)}
                </li>
              ))}
            </ul>
            <p className="mt-1">
              We call and email you 30 days before every renewal.
            </p>
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <Card className="p-4 border-info-fg/20 bg-info-soft flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-info-fg shrink-0 mt-0.5" />
          <p className="text-xs text-info-fg">
            <span className="font-bold">
              {pending.length}{" "}
              {pending.length === 1
                ? "policy is pending verification."
                : "policies are pending verification."}
            </span>{" "}
            Our team reviews the details and activates it in your vault.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Policies"
          value={policies.length}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Active"
          value={active}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Renewals due"
          value={expiring.length}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          label="Total cover"
          value={formatINR(totalCover)}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-danger-fg/20 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-fg">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">
              Your policies
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Requested and active cover with official start and end dates.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((filter) => {
              const count =
                filter.id === "all"
                  ? policies.length
                  : policies.filter((policy) => policy.type === filter.id)
                      .length;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setTypeFilter(filter.id)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    typeFilter === filter.id
                      ? "bg-inverse text-white"
                      : "border border-border bg-surface text-foreground hover:border-brand/60"
                  }`}
                >
                  {filter.label}
                  <span className="ml-1 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        ) : policies.length === 0 ? (
          <Card className="p-10 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-brand mx-auto" />
            <p className="text-sm font-bold text-foreground">No policies yet</p>
            <p className="text-sm text-muted-foreground">
              Add a motor policy or ask our team to record a policy for you.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => openRequest("Insurance consultation")}
              >
                Talk to a consultant
              </Button>
            </div>
          </Card>
        ) : filteredPolicies.length === 0 ? (
          <Card className="p-6 text-center text-xs text-muted-foreground">
            No {typeFilter} policies yet.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {filteredPolicies.map((policy) => (
                <li
                  key={policy.id}
                  className="p-4 transition-colors hover:bg-surface-muted/40 sm:p-5"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <InsurerLogo insurer={policy.provider} size={36} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant={TYPE_BADGE[policy.type]}>
                            {policy.type}
                          </Badge>
                          <Badge variant={statusBadge(policy.status)}>
                            {statusLabel(policy.status)}
                          </Badge>
                          {policy.vehicleType && (
                            <Badge variant="neutral">{policy.vehicleType}</Badge>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm font-extrabold text-foreground">
                          {policy.provider}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {policy.serialNo ? `#${policy.serialNo} · ` : ""}
                          {policy.policyNumber} ·{" "}
                          {policy.holder || user?.name || "Client"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 lg:w-[440px] lg:border-l lg:border-border lg:pl-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                          Start date
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {policy.validFrom ? formatDate(policy.validFrom) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                          End date
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {formatDate(policy.renewalDate)}
                        </p>
                        <p
                          className={`text-[10px] font-bold ${
                            policy.status === "pending"
                              ? "text-info-fg"
                              : daysUntil(policy.renewalDate) < 0
                                ? "text-danger-fg"
                                : daysUntil(policy.renewalDate) <= 30
                                  ? "text-warning-fg"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {policy.status === "pending"
                            ? "Awaiting verification"
                            : renewalLabel(policy.renewalDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                          Cover
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {policy.coverAmount > 0
                            ? formatINR(policy.coverAmount)
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                          Amount paid
                        </p>
                        <p className="text-xs font-extrabold text-foreground">
                          {formatINR(policy.premium)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 lg:w-[200px] lg:justify-end">
                      <button
                        type="button"
                        onClick={() => handleDownload(policy)}
                        disabled={downloading === policy.id}
                        aria-label="Download policy PDF"
                        title="Download policy PDF"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-brand/60 disabled:opacity-50 cursor-pointer"
                      >
                        {downloading === policy.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 lg:flex-none"
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
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Motor policies can be added here and are verified by our team. Other
        policies are recorded by your consultant after a policy is placed.
      </p>

      <MotorPolicyDialog
        open={addingPolicy}
        onClose={() => setAddingPolicy(false)}
        onCreated={(policy) => setPolicies((prev) => [policy, ...prev])}
      />

      <InsuranceRequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        defaultService={dialog?.service ?? ""}
        defaultKind={dialog?.kind ?? "Insurance consultation"}
      />
    </div>
  );
}
