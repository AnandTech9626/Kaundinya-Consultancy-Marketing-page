import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BellRing,
  CalendarClock,
  Download,
  FileSpreadsheet,
  Inbox,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createAdminInsurancePlan,
  createAdminPolicy,
  deleteAdminInsurancePlan,
  deleteAdminPolicy,
  downloadPolicyImportTemplate,
  fetchAdminInsurancePlans,
  fetchAdminPolicies,
  fetchAdminRenewals,
  fetchInsuranceStats,
  importAdminPoliciesCsv,
  runAdminRenewalEngine,
  sendAdminRenewalReminder,
  updateAdminInsurancePlan,
  updateAdminPolicy,
  uploadInsuranceMedia,
  type AdminFamilyOption,
  type AdminInsurancePlan,
  type AdminInsuranceType,
  type AdminPolicy,
  type AdminRenewal,
  type InsuranceStats,
  type PolicyImportResult,
} from "../lib/api";
import { formatINR } from "../lib/format";
import { showToast } from "../lib/toast";
import {
  ConfirmDialog,
  SheetShell,
  StatusBadge,
  inputClass,
  labelClass,
} from "../components/AdminUi";
import { SkeletonKpis, SkeletonList } from "../components/Skeleton";

type Tab = "plans" | "policies" | "renewals" | "import";

const TAB_META: Array<{ id: Tab; label: string; icon: typeof ShieldCheck }> = [
  { id: "plans", label: "Plans", icon: ShieldCheck },
  { id: "policies", label: "Policies", icon: ShieldCheck },
  { id: "renewals", label: "Renewals", icon: CalendarClock },
  { id: "import", label: "Import", icon: FileSpreadsheet },
];

const TYPES: AdminInsuranceType[] = ["life", "health", "motor", "property"];

const TYPE_LABEL: Record<AdminInsuranceType, string> = {
  life: "Life & Term",
  health: "Health",
  motor: "Motor",
  property: "Property",
};

const FAMILY_OPTIONS: Array<{ value: AdminFamilyOption | ""; label: string }> = [
  { value: "", label: "Not applicable" },
  { value: "self", label: "Self" },
  { value: "couple", label: "Couple" },
  { value: "parents", label: "Parents" },
  { value: "family", label: "Family" },
];

function PlanSheet({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminInsurancePlan | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = plan === "new";
  const current = isNew ? null : plan;
  const [type, setType] = useState<AdminInsuranceType>(current?.type ?? "health");
  const [insurer, setInsurer] = useState(current?.insurer ?? "");
  const [name, setName] = useState(current?.name ?? "");
  const [sumInsured, setSumInsured] = useState(
    current ? String(current.sumInsured) : "1000000",
  );
  const [premium, setPremium] = useState(
    current ? String(current.premium) : "10000",
  );
  const [tenureYears, setTenureYears] = useState(
    current ? String(current.tenureYears) : "1",
  );
  const [features, setFeatures] = useState(
    current ? current.features.join(", ") : "",
  );
  const [cashlessNetwork, setCashlessNetwork] = useState(
    current?.cashlessNetwork ? String(current.cashlessNetwork) : "",
  );
  const [pospLicense, setPospLicense] = useState(current?.pospLicense ?? "");
  const [insurerLogoUrl, setInsurerLogoUrl] = useState(
    current?.insurerLogoUrl ?? "",
  );
  const [brochureUrl, setBrochureUrl] = useState(
    current?.brochureUrl ?? "",
  );
  const [uploading, setUploading] = useState<"logo" | "brochure" | null>(null);
  const [familyOption, setFamilyOption] = useState<AdminFamilyOption | "">(
    current?.familyOption ?? "",
  );
  const [active, setActive] = useState(current?.active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMedia = async (file: File, kind: "logo" | "brochure") => {
    setUploading(kind);
    setError(null);
    try {
      const saved = await uploadInsuranceMedia(file);
      if (kind === "logo") setInsurerLogoUrl(saved.url);
      else setBrochureUrl(saved.url);
      showToast(kind === "logo" ? "Logo uploaded." : "Brochure uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload file.");
    } finally {
      setUploading(null);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        type,
        insurer: insurer.trim(),
        name: name.trim(),
        sumInsured: Number(sumInsured),
        premium: Number(premium),
        tenureYears: Number(tenureYears),
        features: features
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        cashlessNetwork: cashlessNetwork.trim()
          ? Number(cashlessNetwork)
          : null,
        pospLicense: pospLicense.trim() || null,
        insurerLogoUrl: insurerLogoUrl.trim() || null,
        brochureUrl: brochureUrl.trim() || null,
        familyOption: familyOption || null,
        active,
      };
      if (isNew) {
        await createAdminInsurancePlan(payload);
        showToast("Plan added.");
      } else {
        await updateAdminInsurancePlan(plan.id, payload);
        showToast("Plan updated.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save plan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Insurance plan"
      title={isNew ? "Add a plan" : "Edit plan"}
      subtitle={isNew ? undefined : `${current?.insurer} · ${current?.name}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="plan-type">
            Insurance type
          </label>
          <select
            id="plan-type"
            className={inputClass}
            value={type}
            onChange={(event) =>
              setType(event.target.value as AdminInsuranceType)
            }
          >
            {TYPES.map((option) => (
              <option key={option} value={option}>
                {TYPE_LABEL[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-insurer">
            Insurer
          </label>
          <input
            id="plan-insurer"
            className={inputClass}
            value={insurer}
            onChange={(event) => setInsurer(event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-name">
            Plan name
          </label>
          <input
            id="plan-name"
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="plan-cover">
              Cover (₹)
            </label>
            <input
              id="plan-cover"
              type="number"
              min={1}
              className={inputClass}
              value={sumInsured}
              onChange={(event) => setSumInsured(event.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-premium">
              Premium (₹)
            </label>
            <input
              id="plan-premium"
              type="number"
              min={0}
              className={inputClass}
              value={premium}
              onChange={(event) => setPremium(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="plan-tenure">
              Tenure (years)
            </label>
            <input
              id="plan-tenure"
              type="number"
              min={1}
              max={40}
              className={inputClass}
              value={tenureYears}
              onChange={(event) => setTenureYears(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-family">
              Family option
            </label>
            <select
              id="plan-family"
              className={inputClass}
              value={familyOption}
              onChange={(event) =>
                setFamilyOption(event.target.value as AdminFamilyOption | "")
              }
            >
              {FAMILY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="plan-network">
              Cashless network
            </label>
            <input
              id="plan-network"
              type="number"
              min={0}
              className={inputClass}
              value={cashlessNetwork}
              onChange={(event) => setCashlessNetwork(event.target.value)}
              placeholder="e.g. 14000"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-posp">
              POSP licence
            </label>
            <input
              id="plan-posp"
              className={inputClass}
              value={pospLicense}
              onChange={(event) => setPospLicense(event.target.value)}
              placeholder="IRDAI-POSP-…"
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-logo">
            Insurer logo URL
          </label>
          <div className="flex gap-2">
            <input
              id="plan-logo"
              className={inputClass}
              value={insurerLogoUrl}
              onChange={(event) => setInsurerLogoUrl(event.target.value)}
              placeholder="https://… or upload"
            />
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs font-bold text-charcoal hover:border-gold/60">
              <Upload className="h-3.5 w-3.5" />
              {uploading === "logo" ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadMedia(file, "logo");
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-brochure">
            Brochure URL
          </label>
          <div className="flex gap-2">
            <input
              id="plan-brochure"
              className={inputClass}
              value={brochureUrl}
              onChange={(event) => setBrochureUrl(event.target.value)}
              placeholder="https://… or upload PDF"
            />
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs font-bold text-charcoal hover:border-gold/60">
              <Upload className="h-3.5 w-3.5" />
              {uploading === "brochure" ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadMedia(file, "brochure");
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-features">
            Features (comma separated)
          </label>
          <textarea
            id="plan-features"
            rows={3}
            className={inputClass}
            value={features}
            onChange={(event) => setFeatures(event.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-charcoal">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Visible to clients
        </label>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : isNew ? "Add plan" : "Save changes"}
        </button>
      </form>
    </SheetShell>
  );
}

function PolicySheet({
  policy,
  onClose,
  onSaved,
}: {
  policy: AdminPolicy;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(policy.status);
  const [provider, setProvider] = useState(policy.provider);
  const [policyNumber, setPolicyNumber] = useState(policy.policyNumber);
  const [coverAmount, setCoverAmount] = useState(String(policy.coverAmount));
  const [premium, setPremium] = useState(String(policy.premium));
  const [renewalDate, setRenewalDate] = useState(policy.renewalDate);
  const [holder, setHolder] = useState(policy.holder ?? "");
  const [type, setType] = useState(policy.type);
  const [vehicleType, setVehicleType] = useState<"2W" | "4W" | "">(
    policy.vehicleType ?? "",
  );
  const [validFrom, setValidFrom] = useState(policy.validFrom ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminPolicy(policy.id, {
        status,
        provider: provider.trim(),
        policyNumber: policyNumber.trim(),
        type,
        vehicleType: type === "Motor" ? vehicleType || null : null,
        coverAmount: Number(coverAmount),
        premium: Number(premium),
        renewalDate,
        holder: holder.trim() || null,
        validFrom: validFrom || null,
      });
      showToast("Policy updated.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update policy.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Policy"
      title={policy.policyNumber}
      subtitle={`${policy.clientName} · ${policy.mobile}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="policy-status">
              Status
            </label>
            <select
              id="policy-status"
              className={inputClass}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminPolicy["status"])
              }
            >
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="lapsed">Lapsed</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="policy-renewal">
              Renewal date
            </label>
            <input
              id="policy-renewal"
              type="date"
              className={inputClass}
              value={renewalDate}
              onChange={(event) => setRenewalDate(event.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="policy-provider">
            Provider
          </label>
          <input
            id="policy-provider"
            className={inputClass}
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="policy-type">
              Policy type
            </label>
            <select
              id="policy-type"
              className={inputClass}
              value={type}
              onChange={(event) =>
                setType(event.target.value as AdminPolicy["type"])
              }
            >
              <option value="Life & Term">Life &amp; Term</option>
              <option value="Health">Health</option>
              <option value="Motor">Motor</option>
              <option value="Property">Property</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="policy-start">
              Start date
            </label>
            <input
              id="policy-start"
              type="date"
              className={inputClass}
              value={validFrom}
              onChange={(event) => setValidFrom(event.target.value)}
            />
          </div>
        </div>
        {type === "Motor" && (
          <div>
            <label className={labelClass} htmlFor="policy-vehicle">
              Vehicle type
            </label>
            <select
              id="policy-vehicle"
              className={inputClass}
              value={vehicleType}
              onChange={(event) =>
                setVehicleType(event.target.value as "2W" | "4W" | "")
              }
            >
              <option value="">Not set</option>
              <option value="2W">Two-wheeler</option>
              <option value="4W">Four-wheeler</option>
            </select>
          </div>
        )}
        <div>
          <label className={labelClass} htmlFor="policy-number">
            Policy number
          </label>
          <input
            id="policy-number"
            className={inputClass}
            value={policyNumber}
            onChange={(event) => setPolicyNumber(event.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="policy-cover">
              Cover (₹)
            </label>
            <input
              id="policy-cover"
              type="number"
              min={1}
              className={inputClass}
              value={coverAmount}
              onChange={(event) => setCoverAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="policy-premium">
              Premium (₹)
            </label>
            <input
              id="policy-premium"
              type="number"
              min={0}
              className={inputClass}
              value={premium}
              onChange={(event) => setPremium(event.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="policy-holder">
            Policy holder
          </label>
          <input
            id="policy-holder"
            className={inputClass}
            value={holder}
            onChange={(event) => setHolder(event.target.value)}
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>
    </SheetShell>
  );
}

function PolicyCreateSheet({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const [clientMobile, setClientMobile] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [type, setType] = useState<AdminPolicy["type"]>("Health");
  const [vehicleType, setVehicleType] = useState<"2W" | "4W" | "">("");
  const [holder, setHolder] = useState("");
  const [coverAmount, setCoverAmount] = useState("1000000");
  const [premium, setPremium] = useState("10000");
  const [validFrom, setValidFrom] = useState(today);
  const [renewalDate, setRenewalDate] = useState(
    nextYear.toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState<AdminPolicy["status"]>("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createAdminPolicy({
        clientMobile: clientMobile.trim(),
        policyNumber: policyNumber.trim(),
        provider: provider.trim(),
        type,
        vehicleType: type === "Motor" ? vehicleType || null : null,
        holder: holder.trim() || null,
        coverAmount: Number(coverAmount),
        premium: Number(premium),
        validFrom: validFrom || null,
        renewalDate,
        status,
      });
      showToast("Policy added.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add policy.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Client policy"
      title="Add a policy"
      subtitle="The client is matched by their registered mobile number."
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="new-client-mobile">
              Client mobile
            </label>
            <input
              id="new-client-mobile"
              className={inputClass}
              value={clientMobile}
              onChange={(event) => setClientMobile(event.target.value)}
              placeholder="10-digit mobile"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="new-holder">
              Client name
            </label>
            <input
              id="new-holder"
              className={inputClass}
              value={holder}
              onChange={(event) => setHolder(event.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="new-provider">
              Company
            </label>
            <input
              id="new-provider"
              className={inputClass}
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              placeholder="e.g. Star Health"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="new-policy-number">
              Serial / policy number
            </label>
            <input
              id="new-policy-number"
              className={inputClass}
              value={policyNumber}
              onChange={(event) => setPolicyNumber(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="new-type">
              Insurance type
            </label>
            <select
              id="new-type"
              className={inputClass}
              value={type}
              onChange={(event) =>
                setType(event.target.value as AdminPolicy["type"])
              }
            >
              <option value="Life & Term">Life &amp; Term</option>
              <option value="Health">Health</option>
              <option value="Motor">Motor</option>
              <option value="Property">Property</option>
            </select>
          </div>
          {type === "Motor" ? (
            <div>
              <label className={labelClass} htmlFor="new-vehicle">
                Vehicle type
              </label>
              <select
                id="new-vehicle"
                className={inputClass}
                value={vehicleType}
                onChange={(event) =>
                  setVehicleType(event.target.value as "2W" | "4W" | "")
                }
              >
                <option value="">Not set</option>
                <option value="2W">Two-wheeler</option>
                <option value="4W">Four-wheeler</option>
              </select>
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="new-status">
                Status
              </label>
              <select
                id="new-status"
                className={inputClass}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as AdminPolicy["status"])
                }
              >
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="new-cover">
              Cover amount (₹)
            </label>
            <input
              id="new-cover"
              type="number"
              min={0}
              className={inputClass}
              value={coverAmount}
              onChange={(event) => setCoverAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="new-premium">
              Payment amount (₹)
            </label>
            <input
              id="new-premium"
              type="number"
              min={0}
              className={inputClass}
              value={premium}
              onChange={(event) => setPremium(event.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="new-start">
              Start date
            </label>
            <input
              id="new-start"
              type="date"
              className={inputClass}
              value={validFrom}
              onChange={(event) => setValidFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="new-end">
              End / renewal date
            </label>
            <input
              id="new-end"
              type="date"
              className={inputClass}
              value={renewalDate}
              onChange={(event) => setRenewalDate(event.target.value)}
              required
            />
          </div>
        </div>
        {type === "Motor" && (
          <div>
            <label className={labelClass} htmlFor="new-status-motor">
              Status
            </label>
            <select
              id="new-status-motor"
              className={inputClass}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminPolicy["status"])
              }
            >
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="lapsed">Lapsed</option>
            </select>
          </div>
        )}

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Add policy"}
        </button>
      </form>
    </SheetShell>
  );
}

export function InsuranceAdmin() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("plans");
  const focusId = searchParams.get("focus");
  const focusHandled = useRef<string | null>(null);
  const [stats, setStats] = useState<InsuranceStats | null>(null);
  const [plans, setPlans] = useState<AdminInsurancePlan[]>([]);
  const [policies, setPolicies] = useState<AdminPolicy[]>([]);
  const [renewals, setRenewals] = useState<AdminRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editingPlan, setEditingPlan] = useState<
    AdminInsurancePlan | "new" | null
  >(null);
  const [editingPolicy, setEditingPolicy] = useState<AdminPolicy | null>(null);
  const [deletePlan, setDeletePlan] = useState<AdminInsurancePlan | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<AdminPolicy | null>(null);
  const [busy, setBusy] = useState(false);
  const [reminding, setReminding] = useState<string | null>(null);
  const [addingPolicy, setAddingPolicy] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<PolicyImportResult | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [runningRenewals, setRunningRenewals] = useState(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await fetchInsuranceStats());
    } catch {
      // Stats are non-critical; the list views surface errors.
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "plans") {
        setPlans(
          await fetchAdminInsurancePlans({
            q: appliedSearch,
            type: typeFilter,
          }),
        );
      } else if (tab === "policies") {
        setPolicies(await fetchAdminPolicies(appliedSearch));
      } else if (tab === "renewals") {
        setRenewals(await fetchAdminRenewals());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load insurance data.",
      );
    } finally {
      setLoading(false);
    }
  }, [tab, appliedSearch, typeFilter]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (
      requestedTab === "plans" ||
      requestedTab === "policies" ||
      requestedTab === "renewals" ||
      requestedTab === "import"
    ) {
      setTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    if (!focusId || focusHandled.current === focusId) return;
    const match = policies.find((policy) => policy.id === focusId);
    if (match) {
      focusHandled.current = focusId;
      setTab("policies");
      setEditingPolicy(match);
    }
  }, [focusId, policies]);

  const reloadAll = async () => {
    await load();
    await refreshStats();
  };

  const togglePlan = async (plan: AdminInsurancePlan) => {
    try {
      await updateAdminInsurancePlan(plan.id, { active: !plan.active });
      showToast(plan.active ? "Plan hidden." : "Plan published.");
      await reloadAll();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update plan.",
        "error",
      );
    }
  };

  const onDeletePlan = async () => {
    if (!deletePlan) return;
    setBusy(true);
    try {
      await deleteAdminInsurancePlan(deletePlan.id);
      showToast("Plan deleted.");
      setDeletePlan(null);
      await reloadAll();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete plan.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const onDeletePolicy = async () => {
    if (!deletePolicy) return;
    setBusy(true);
    try {
      await deleteAdminPolicy(deletePolicy.id);
      showToast("Policy deleted.");
      setDeletePolicy(null);
      await reloadAll();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete policy.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const sendReminder = async (renewal: AdminRenewal) => {
    setReminding(renewal.id);
    try {
      await sendAdminRenewalReminder(renewal.id);
      showToast("Renewal reminder sent.");
      await load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not send reminder.",
        "error",
      );
    } finally {
      setReminding(null);
    }
  };

  const onDownloadTemplate = async () => {
    try {
      await downloadPolicyImportTemplate();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not download template.",
        "error",
      );
    }
  };

  const onImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const result = await importAdminPoliciesCsv(importFile);
      setImportResult(result);
      showToast(
        `Import done: ${result.created} created, ${result.updated} updated, ${result.failed} failed.`,
      );
      setImportFile(null);
      await reloadAll();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const onRunRenewals = async () => {
    setRunningRenewals(true);
    try {
      const result = await runAdminRenewalEngine();
      showToast(
        `Renewal engine: ${result.reminded} of ${result.checked} policies reminded.`,
      );
      await reloadAll();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not run the renewal engine.",
        "error",
      );
    } finally {
      setRunningRenewals(false);
    }
  };

  const kpis =
    tab === "plans"
      ? [
          { label: "Plans", value: stats?.plansTotal ?? 0 },
          { label: "Published", value: stats?.plansActive ?? 0 },
        ]
      : tab === "policies"
        ? [
            { label: "Policies", value: stats?.policiesTotal ?? 0 },
            { label: "Active", value: stats?.activePolicies ?? 0 },
            { label: "Renewals due", value: stats?.renewalsDue ?? 0 },
            { label: "Annual premium", value: formatINR(stats?.premiumTotal ?? 0) },
          ]
        : [
            { label: "Renewals due", value: stats?.renewalsDue ?? 0 },
            { label: "Active policies", value: stats?.activePolicies ?? 0 },
          ];

  const importKpis = [
    { label: "Policies", value: stats?.policiesTotal ?? 0 },
    { label: "Active", value: stats?.activePolicies ?? 0 },
    { label: "Renewals due", value: stats?.renewalsDue ?? 0 },
  ];

  const activeKpis = tab === "import" ? importKpis : kpis;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Insurance
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-charcoal">
            Plans, policies & renewals
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/insurance/requests"
            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
          >
            <Inbox className="h-4 w-4" />
            Client requests
          </Link>
          {tab === "plans" && (
            <button
              type="button"
              onClick={() => setEditingPlan("new")}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover"
            >
              <Plus className="h-4 w-4" />
              Add plan
            </button>
          )}
          {tab === "policies" && (
            <button
              type="button"
              onClick={() => setAddingPolicy(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover"
            >
              <Plus className="h-4 w-4" />
              Add policy
            </button>
          )}
          {tab === "renewals" && (
            <button
              type="button"
              onClick={() => void onRunRenewals()}
              disabled={runningRenewals}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${runningRenewals ? "animate-spin" : ""}`}
              />
              {runningRenewals ? "Running..." : "Run renewal engine"}
            </button>
          )}
        </div>
      </div>

      {stats === null ? (
        <SkeletonKpis count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {activeKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-border-subtle bg-white p-4"
            >
              <p className="text-xl font-extrabold tracking-tight text-charcoal">
                {kpi.value}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-muted">
                {kpi.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TAB_META.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === id
                ? "bg-charcoal text-white"
                : "border border-border-subtle bg-white text-charcoal hover:border-gold/60"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab !== "renewals" && tab !== "import" && (
        <div className="flex flex-wrap gap-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSearch(search);
            }}
            className="flex flex-1 gap-2"
          >
            <input
              className={`${inputClass} max-w-xs`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                tab === "plans" ? "Search plan or insurer" : "Search policy or client"
              }
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
          {tab === "plans" && (
            <select
              className={`${inputClass} max-w-[12rem]`}
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">All types</option>
              {TYPES.map((option) => (
                <option key={option} value={option}>
                  {TYPE_LABEL[option]}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonList rows={5} />
      ) : tab === "plans" ? (
        plans.length === 0 ? (
          <p className="text-sm text-muted">No plans match this filter.</p>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {TYPE_LABEL[plan.type]}
                    </span>
                    <StatusBadge status={plan.active ? "active" : "lapsed"} />
                    {plan.familyOption && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                        {plan.familyOption}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-extrabold text-charcoal">
                    {plan.insurer} · {plan.name}
                  </p>
                  <p className="text-[11px] text-muted">
                    Cover {formatINR(plan.sumInsured)} · Premium{" "}
                    {formatINR(plan.premium)} /{" "}
                    {plan.tenureYears === 1 ? "yr" : `${plan.tenureYears}y`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePlan(plan)}
                    className="rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60"
                  >
                    {plan.active ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPlan(plan)}
                    aria-label="Edit plan"
                    className="rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletePlan(plan)}
                    aria-label="Delete plan"
                    className="rounded-lg border border-border-subtle p-2 text-rose-600 hover:border-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === "policies" ? (
        policies.length === 0 ? (
          <p className="text-sm text-muted">No policies yet.</p>
        ) : (
          <div className="space-y-2">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={policy.status} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      {policy.type}
                      {policy.type === "Motor" && policy.vehicleType
                        ? ` · ${
                            policy.vehicleType === "2W"
                              ? "Two-wheeler"
                              : "Four-wheeler"
                          }`
                        : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-extrabold text-charcoal">
                    {policy.provider} · {policy.policyNumber}
                  </p>
                  <p className="text-[11px] text-muted">
                    {policy.clientName || policy.holder || "—"} ·{" "}
                    {policy.mobile} · Cover {formatINR(policy.coverAmount)} ·
                    Premium {formatINR(policy.premium)}
                  </p>
                  <p className="text-[10px] text-muted-light">
                    Renewal {policy.renewalDate}
                    {policy.reminderSent ? " · reminder sent" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPolicy(policy)}
                    aria-label="Edit policy"
                    className="rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletePolicy(policy)}
                    aria-label="Delete policy"
                    className="rounded-lg border border-border-subtle p-2 text-rose-600 hover:border-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === "import" ? (
        <div className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-border-subtle bg-white p-5">
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-charcoal">
                Bulk import policies
              </h2>
              <p className="mt-1 text-xs text-muted">
                Upload a CSV exported from Excel. Existing policy numbers are
                updated; new ones are created.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void onDownloadTemplate()}
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
              >
                <Download className="h-4 w-4" />
                Download CSV template
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60">
                <Upload className="h-4 w-4" />
                Choose CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setImportFile(file);
                    setImportResult(null);
                    setImportError(null);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => void onImport()}
                disabled={!importFile || importing}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
              >
                {importing ? "Importing..." : "Import file"}
              </button>
            </div>
            {importFile && (
              <p className="text-[11px] text-muted">
                Selected:{" "}
                <span className="font-bold text-charcoal">
                  {importFile.name}
                </span>
              </p>
            )}
            {importError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {importError}
              </p>
            )}
            {importResult && (
              <div className="space-y-2 rounded-xl border border-border-subtle bg-ivory/50 p-3">
                <p className="text-xs font-bold text-charcoal">Import result</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-extrabold text-emerald-700">
                      {importResult.created}
                    </p>
                    <p className="text-[10px] text-muted">Created</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-blue-700">
                      {importResult.updated}
                    </p>
                    <p className="text-[10px] text-muted">Updated</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-rose-700">
                      {importResult.failed}
                    </p>
                    <p className="text-[10px] text-muted">Failed</p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <ul className="space-y-1">
                    {importResult.errors.slice(0, 20).map((error, index) => (
                      <li
                        key={`${error.row}-${index}`}
                        className="text-[11px] text-rose-700"
                      >
                        Row {error.row}: {error.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white p-4 text-[11px] text-muted">
            <p className="font-bold text-charcoal">Expected columns</p>
            <p className="mt-1">
              policy_number, client_name, client_mobile, company_name,
              insurance_type, vehicle_type, start_date, end_date,
              payment_amount, cover_amount
            </p>
            <p className="mt-2">
              Dates accept YYYY-MM-DD or DD-MM-YYYY. Vehicle type is 2W / 4W
              for motor policies.
            </p>
          </div>
        </div>
      ) : renewals.length === 0 ? (
        <p className="text-sm text-muted">
          No renewals due in the next 120 days.
        </p>
      ) : (
        <div className="space-y-2">
          {renewals.map((renewal) => (
            <div
              key={renewal.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={renewal.daysLeft <= 30 ? "expiring" : "active"}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {renewal.policyType}
                  </span>
                </div>
                <p className="mt-1 text-sm font-extrabold text-charcoal">
                  {renewal.provider} · {renewal.policyNumber}
                </p>
                <p className="text-[11px] text-muted">
                  {renewal.clientName} · {renewal.mobile} · Premium{" "}
                  {formatINR(renewal.premium)}
                </p>
                <p className="text-[10px] text-muted-light">
                  Renewal {renewal.renewalDate} ·{" "}
                  {renewal.daysLeft < 0
                    ? `${Math.abs(renewal.daysLeft)} days overdue`
                    : `${renewal.daysLeft} days left`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => sendReminder(renewal)}
                disabled={renewal.reminderSent || reminding === renewal.id}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-2 text-xs font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
              >
                <BellRing className="h-3.5 w-3.5" />
                {renewal.reminderSent
                  ? "Reminder sent"
                  : reminding === renewal.id
                    ? "Sending..."
                    : "Send reminder"}
              </button>
            </div>
          ))}
        </div>
      )}

      {editingPlan && (
        <PlanSheet
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={() => {
            setEditingPlan(null);
            void reloadAll();
          }}
        />
      )}

      {addingPolicy && (
        <PolicyCreateSheet
          onClose={() => setAddingPolicy(false)}
          onSaved={() => {
            setAddingPolicy(false);
            void reloadAll();
          }}
        />
      )}

      {editingPolicy && (
        <PolicySheet
          policy={editingPolicy}
          onClose={() => setEditingPolicy(null)}
          onSaved={() => {
            setEditingPolicy(null);
            void reloadAll();
          }}
        />
      )}

      {deletePlan && (
        <ConfirmDialog
          title="Delete this plan?"
          message={`${deletePlan.insurer} · ${deletePlan.name} will be removed. Existing policies are not affected.`}
          busy={busy}
          onConfirm={onDeletePlan}
          onCancel={() => setDeletePlan(null)}
        />
      )}

      {deletePolicy && (
        <ConfirmDialog
          title="Delete this policy?"
          message={`${deletePolicy.provider} · ${deletePolicy.policyNumber} will be removed from the client's vault.`}
          busy={busy}
          onConfirm={onDeletePolicy}
          onCancel={() => setDeletePolicy(null)}
        />
      )}
    </div>
  );
}
