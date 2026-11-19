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
import { downloadPolicy, fetchPolicies, fetchRequests } from "../lib/mockApi";
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
  const [downloaded, setDownloaded] = useState<string | null>(null);
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
      policy.status === "expiring" && !isPolicyRenewalSolved(policy, requests)
  );
  const motorPolicies = policies.filter((policy) => policy.type === "Motor");
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
            Policies recorded for you, with renewal dates and documents in one
            place. Add a motor policy and our team will verify it before it
            becomes active.
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
              openRequest(
                "Policy review · Policy Vault",
                "Insurance consultation"
              )
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

      {!loading && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-5 border-b border-border">
            <div>
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                Motor vehicle register
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Serial, client mobile, client name, company, vehicle, start and
                end dates, and the amount paid for every motor policy.
              </p>
            </div>
            <Badge variant="warning">
              {motorPolicies.length}{" "}
              {motorPolicies.length === 1 ? "policy" : "policies"}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="bg-surface-muted text-[10px] uppercase tracking-wider text-subtle-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Serial No</th>
                  <th className="px-4 py-2.5 font-bold">Client Mobile (ID)</th>
                  <th className="px-4 py-2.5 font-bold">Client Name</th>
                  <th className="px-4 py-2.5 font-bold">Company</th>
                  <th className="px-4 py-2.5 font-bold">Vehicle</th>
                  <th className="px-4 py-2.5 font-bold">Start Date</th>
                  <th className="px-4 py-2.5 font-bold">End Date</th>
                  <th className="px-4 py-2.5 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {motorPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <p className="text-sm font-bold text-foreground">
                        No motor policies yet
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Add your motor policy and our team will verify it before
                        it becomes active.
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddingPolicy(true)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-on-brand hover:bg-brand-hover cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add motor policy
                      </button>
                    </td>
                  </tr>
                ) : (
                  motorPolicies.map((policy) => (
                    <tr
                      key={policy.id}
                      className="hover:bg-surface-muted/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {policy.serialNo ? `#${policy.serialNo}` : "—"}
                        {policy.status === "pending" && (
                          <span className="block text-[9px] font-extrabold uppercase tracking-wide text-warning-fg">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground-soft">
                        {user?.mobile || "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground-soft">
                        {policy.holder || user?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground-soft">
                        {policy.provider}
                      </td>
                      <td className="px-4 py-3 text-foreground-soft">
                        {policy.vehicleType ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground-soft">
                        {policy.validFrom ? formatDate(policy.validFrom) : "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground-soft">
                        {formatDate(policy.renewalDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-foreground">
                        {formatINR(policy.premium)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {error && (
        <p className="rounded-lg border border-danger-fg/20 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-fg">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">
              All policies
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
              <Button onClick={() => setAddingPolicy(true)}>
                <Plus className="w-4 h-4" />
                Add motor policy
              </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredPolicies.map((policy) => (
              <Card
                key={policy.id}
                hoverable
                className="p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <InsurerLogo insurer={policy.provider} size={36} />
                  <div className="min-w-0 flex-1">
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
                    <p className="text-[11px] text-muted-foreground">
                      {policy.serialNo ? `#${policy.serialNo} · ` : ""}
                      {policy.policyNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-surface-muted px-3 py-2.5">
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
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-subtle-foreground">
                      Amount paid
                    </p>
                    <p className="text-base font-extrabold tracking-tight text-foreground">
                      {formatINR(policy.premium)}
                    </p>
                  </div>
                  {policy.coverAmount > 0 && (
                    <p className="text-right text-[10px] font-bold text-muted-foreground">
                      Cover
                      <span className="block text-xs text-foreground">
                        {formatINR(policy.coverAmount)}
                      </span>
                    </p>
                  )}
                </div>

                <p className="truncate text-[10px] text-muted-foreground">
                  {policy.holder || user?.name || "Client"} ·{" "}
                  {user?.mobile || "—"}
                </p>

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
      </div>

      <Card className="p-4 bg-surface-muted/60 flex items-start gap-3">
        <FileText className="w-4 h-4 text-brand-strong shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Motor policies can be added from this page and are verified by our
          team. Other policies are recorded by your consultant after a policy is
          placed. If something is missing, raise a request and we will update
          it.
        </p>
      </Card>

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
