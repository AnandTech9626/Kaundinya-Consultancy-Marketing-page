import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Coins,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Pencil,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge, Button, Card, FormField, Input } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";
import {
  changePin,
  fetchMyAvatar,
  fetchMyRequests,
  fetchPolicies,
  updateProfile,
  uploadMyAvatar,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { bumpLiveData } from "../lib/live";
import { isPolicyRenewalSolved } from "../lib/renewals";

const GOLD = "#C59B27";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "K";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

function formatMobile(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return digits ? `+91 ${digits}` : "";
}

export function ProfileContent({ compact = false }: { compact?: boolean }) {
  const { user, updateUser } = useAuth();
  const { data } = useAsync(() => fetchMyRequests({ limit: 50 }));
  const requests = data?.items ?? [];
  const { data: policies } = useAsync(fetchPolicies);

  const activePolicies = (policies ?? []).filter(
    (policy) => policy.status === "active"
  ).length;
  const renewalsDue = (policies ?? []).filter(
    (policy) =>
      policy.status === "expiring" && !isPolicyRenewalSolved(policy, requests)
  ).length;

  const loanRequests = requests.filter((request) => request.module === "Loans");
  const openLoanRequests = loanRequests.filter(
    (request) => request.status === "new" || request.status === "in_progress"
  ).length;
  const resolvedLoanRequests = loanRequests.filter(
    (request) => request.status === "completed"
  ).length;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pinCode, setPinCode] = useState(user?.pinCode ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { data: avatarData } = useAsync(fetchMyAvatar);

  useEffect(() => {
    if (avatarData) setAvatarUrl(avatarData.url);
  }, [avatarData]);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [editingPin, setEditingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address — it is used to sign in.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        pinCode: pinCode.trim(),
      });
      updateUser(updated);
      setSaved(true);
      setEditingProfile(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your changes. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinMessage(null);

    if (!/^\d{6}$/.test(currentPin)) {
      setPinError("Enter your current 6-digit PIN.");
      return;
    }
    if (!/^\d{6}$/.test(newPin) || new Set(newPin).size < 2) {
      setPinError("Choose a 6-digit PIN that isn't easy to guess.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("The two new PINs do not match.");
      return;
    }

    setPinSaving(true);
    try {
      const updated = await changePin(currentPin, newPin);
      updateUser(updated);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setEditingPin(false);
      setShowPin(false);
      setPinMessage("PIN changed.");
      setTimeout(() => setPinMessage(null), 2500);
    } catch (err) {
      setPinError(
        err instanceof Error ? err.message : "Could not update your PIN.",
      );
    } finally {
      setPinSaving(false);
    }
  };

  const closePinEditor = () => {
    setEditingPin(false);
    setShowPin(false);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setPinError(null);
  };

  const cancelProfileEdit = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPinCode(user?.pinCode ?? "");
    setError(null);
    setEditingProfile(false);
  };

  const handleAvatarChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be under 5 MB.");
      return;
    }
    setError(null);
    setAvatarUploading(true);
    try {
      const result = await uploadMyAvatar(file);
      setAvatarUrl(result.url);
      bumpLiveData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not upload the photo.",
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const displayName = name.trim() || user?.name || "Client";
  const mobile = formatMobile(user?.mobile ?? "");
  const clientCode = user?.clientCode ?? "—";
  const memberSince = user?.memberSince
    ? new Date(`${user.memberSince}T00:00:00`).getFullYear()
    : new Date().getFullYear();

  return (
    <div
      className={`mx-auto w-full ${
        compact ? "space-y-5" : "max-w-4xl space-y-6"
      }`}
    >
      {/* Centered profile hub */}
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#1C140D] text-2xl font-extrabold tracking-wide text-[#C59B27] shadow-[0_0_36px_rgba(197,155,39,0.25)] ring-2 ring-[#C59B27]/40 ring-offset-4 ring-offset-surface">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials(displayName)
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-full border border-[#C59B27]/50"
          />
        </div>
        {editingProfile && (
          <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#C59B27]/40 px-3 py-1.5 text-[11px] font-bold text-[#8a6b1a] transition-colors hover:bg-[#C59B27]/10">
            {avatarUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            {avatarUploading
              ? "Uploading..."
              : avatarUrl
                ? "Change photo"
                : "Add photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                void handleAvatarChange(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        )}
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground break-words">
          {displayName}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Client
          <span className="mx-1 text-subtle-foreground">·</span>
          Member since {memberSince}
          <span className="mx-1 text-subtle-foreground">·</span>
          Client ID {clientCode}
        </p>
        <div className="mt-4 h-px w-44 bg-[#C59B27]/30" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="success">
            <ShieldCheck className="w-3 h-3" />
            Mobile verified
          </Badge>
          <Badge variant="gold">Profile complete</Badge>
        </div>
      </div>

      {/* Personal & contact details */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#C59B27]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Personal &amp; contact details
            </h3>
          </div>
          {!editingProfile ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setError(null);
                setEditingProfile(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelProfileEdit}
            >
              Cancel
            </Button>
          )}
        </div>

        {!editingProfile ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-muted/50">
            {[
              { label: "Full name", value: displayName },
              { label: "Email address", value: user?.email || "—" },
              { label: "Mobile number (verified)", value: mobile || "—" },
              { label: "PIN code", value: pinCode || "—" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {row.label}
                </p>
                <p className="break-words text-right text-sm font-semibold text-foreground">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="name" required>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </FormField>
              <FormField label="Email address" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Mobile number (verified)" htmlFor="mobile">
                <div className="relative">
                  <Input
                    id="mobile"
                    value={mobile}
                    disabled
                    className="bg-surface-muted cursor-not-allowed pr-24"
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center">
                    <Badge variant="success">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  </span>
                </div>
              </FormField>
              <FormField label="PIN code" htmlFor="pinCode">
                <Input
                  id="pinCode"
                  name="postal-code"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  value={pinCode}
                  onChange={(e) =>
                    setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit PIN code"
                />
              </FormField>
            </div>

            <p className="text-[11px] italic text-subtle-foreground">
              Your mobile number is verified and can't be edited here.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="min-w-44 hover:brightness-95"
                style={{
                  backgroundColor: GOLD,
                  borderColor: GOLD,
                  color: "#1C140D",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={cancelProfileEdit}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {error && (
          <p className="mt-3 text-xs font-semibold text-danger-fg">{error}</p>
        )}
        {saved && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-success-fg">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </p>
        )}
        <div className="mt-5 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => {
              if (editingPin) {
                closePinEditor();
              } else {
                setEditingPin(true);
                setShowPin(false);
                setPinError(null);
                setPinMessage(null);
              }
            }}
            aria-expanded={editingPin}
            className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#C59B27]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Security PIN
              </h3>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8a6b1a]">
              {editingPin ? "Hide" : user?.hasPin ? "Change PIN" : "Set PIN"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  editingPin ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>

          {!editingPin ? (
            <div className="mt-3 space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  readOnly
                  disabled
                  value={showPin ? "PIN is set" : "••••••"}
                  className="bg-surface-muted pr-10 cursor-not-allowed"
                  aria-label="Security PIN"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((value) => !value)}
                  aria-label={showPin ? "Hide PIN status" : "Show PIN status"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] leading-relaxed text-subtle-foreground">
                For security the saved PIN can't be displayed. Show confirms a
                PIN is set; use Change PIN to replace it.
              </p>
              {pinMessage && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-fg">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {pinMessage}
                </span>
              )}
            </div>
          ) : (
            <form onSubmit={handlePinSubmit} className="mt-3 space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPin((value) => !value)}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold text-[#8a6b1a] hover:text-[#C59B27]"
                >
                  {showPin ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {showPin ? "Hide PINs" : "Show PINs"}
                </button>
              </div>

              <FormField label="Current PIN" htmlFor="current-pin" required>
                <Input
                  id="current-pin"
                  name="current-password"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) =>
                    setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                />
              </FormField>
              <FormField label="New PIN" htmlFor="new-pin" required>
                <Input
                  id="new-pin"
                  name="new-password"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) =>
                    setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                />
              </FormField>
              <FormField
                label="Confirm new PIN"
                htmlFor="confirm-new-pin"
                required
              >
                <Input
                  id="confirm-new-pin"
                  name="confirm-password"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) =>
                    setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                />
              </FormField>

              {pinError && (
                <p className="text-[11px] font-semibold text-danger-fg">
                  {pinError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={pinSaving}
                  className="min-w-32 hover:bg-[#C59B27]/10"
                  style={{ borderColor: "rgba(197,155,39,0.5)", color: "#8a6b1a" }}
                >
                  {pinSaving ? "Changing..." : "Change PIN"}
                </Button>
                <Button type="button" variant="secondary" onClick={closePinEditor}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {/* Active services */}
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-[#C59B27]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Active services
            </h3>
          </div>

          <div className="mt-3 space-y-2.5">
            <Link
              to="/insurance"
              className="block rounded-lg border border-[#C59B27]/25 bg-[#C59B27]/5 p-3 transition-colors hover:border-[#C59B27]/50"
            >
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                <ShieldCheck className="h-4 w-4 text-[#C59B27]" />
                Insurance
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Active
                  </p>
                  <p className="text-sm font-extrabold text-foreground">
                    {activePolicies}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Renewals
                  </p>
                  <p className="text-sm font-extrabold text-[#C59B27]">
                    {renewalsDue}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/loans"
              className="block rounded-lg border border-[#C59B27]/25 bg-[#C59B27]/5 p-3 transition-colors hover:border-[#C59B27]/50"
            >
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                <Coins className="h-4 w-4 text-[#C59B27]" />
                Loans
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Open requests
                  </p>
                  <p className="text-sm font-extrabold text-foreground">
                    {openLoanRequests}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Resolved
                  </p>
                  <p className="text-sm font-extrabold text-[#C59B27]">
                    {resolvedLoanRequests}
                  </p>
                </div>
              </div>
            </Link>
        </div>
      </Card>
    </div>
  );
}
