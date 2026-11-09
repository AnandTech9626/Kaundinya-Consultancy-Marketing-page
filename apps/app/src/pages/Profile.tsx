import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Coins,
  Eye,
  EyeOff,
  KeyRound,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge, Button, Card, FormField, Input } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";
import {
  changePin,
  fetchMyRequests,
  updateProfile,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { useMockRequests } from "../lib/mockRequests";
import { POLICIES } from "../lib/moduleData";

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
  const { data } = useAsync(() => fetchMyRequests({ limit: 1 }));
  const requestCount = data?.total ?? 0;
  const { requests } = useMockRequests();

  const insuranceRequests = requests.filter(
    (request) => request.serviceCategory === "Insurance"
  );
  const activePolicies = POLICIES.filter(
    (policy) => policy.status === "active"
  ).length;
  const renewalsDue = POLICIES.filter(
    (policy) => policy.status === "expiring"
  ).length;
  const openInsuranceRequests = insuranceRequests.filter(
    (request) => request.status === "new" || request.status === "in_progress"
  ).length;

  const loanRequests = requests.filter(
    (request) => request.serviceCategory === "Loans"
  );
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
      setPinMessage("PIN updated.");
      setTimeout(() => setPinMessage(null), 2500);
    } catch (err) {
      setPinError(
        err instanceof Error ? err.message : "Could not update your PIN.",
      );
    } finally {
      setPinSaving(false);
    }
  };

  const displayName = name.trim() || user?.name || "Client";
  const mobile = formatMobile(user?.mobile ?? "");
  const clientCode = user?.clientCode ?? "—";
  const memberSince = user?.memberSince
    ? new Date(`${user.memberSince}T00:00:00`).getFullYear()
    : new Date().getFullYear();

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact && (
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">Manage your personal details.</p>
        </div>
      )}

      <div
        className={
          compact
            ? "space-y-4"
            : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        }
      >
        {/* Left rail — identity */}
        <div className={compact ? "" : "lg:col-span-4"}>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-inverse text-brand ring-4 ring-brand/20 flex items-center justify-center text-2xl font-extrabold">
                {initials(displayName)}
              </div>
              <h2 className="mt-3 text-lg font-extrabold text-foreground tracking-tight break-words">
                {displayName}
              </h2>
              <p className="text-xs text-muted-foreground">Client</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="success">
                <ShieldCheck className="w-3 h-3" />
                Mobile verified
              </Badge>
              <Badge variant="gold">Profile complete</Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Requests</p>
                <p className="text-lg font-extrabold text-foreground">{requestCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Member since</p>
                <p className="text-lg font-extrabold text-foreground">{memberSince}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client ID</p>
              <p className="text-xs font-semibold text-foreground-soft">{clientCode}</p>
            </div>
          </Card>
        </div>

        {/* Right — form */}
        <div className={compact ? "space-y-6" : "lg:col-span-8 space-y-6"}>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Insurance
                </h3>
              </div>
              <Link
                to="/insurance"
                className="text-[11px] font-bold text-brand hover:text-brand-hover"
              >
                Open
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Active
                </p>
                <p className="text-lg font-extrabold text-foreground">
                  {activePolicies}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Renewals
                </p>
                <p className="text-lg font-extrabold text-foreground">
                  {renewalsDue}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Open requests
                </p>
                <p className="text-lg font-extrabold text-foreground">
                  {openInsuranceRequests}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Loans
                </h3>
              </div>
              <Link
                to="/loans"
                className="text-[11px] font-bold text-brand hover:text-brand-hover"
              >
                Open
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Open requests
                </p>
                <p className="text-lg font-extrabold text-foreground">
                  {openLoanRequests}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Resolved
                </p>
                <p className="text-lg font-extrabold text-foreground">
                  {resolvedLoanRequests}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal details */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand" />
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Personal details
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </section>

              <div className="border-t border-border" />

              {/* Contact & location */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand" />
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Contact &amp; location
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit PIN code"
                    />
                  </FormField>
                </div>
                <p className="text-[11px] text-subtle-foreground">
                  Your mobile number is verified and can't be edited here.
                </p>
              </section>

              {/* Save bar */}
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-fg">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved
                  </span>
                )}
                {error && <span className="text-sm text-danger-fg">{error}</span>}
              </div>
            </form>
          </Card>

          <Card className="p-6 lg:p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Security PIN
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your 6-digit PIN is used every time you open the app. Click Show
                to reveal it, or Update PIN to set a new one.
              </p>

              {!editingPin ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[12rem] flex-1">
                      <label
                        className="mb-1 block text-[11px] font-bold text-foreground"
                        htmlFor="pin-display"
                      >
                        PIN
                      </label>
                      <div className="relative">
                        <Input
                          id="pin-display"
                          type="text"
                          readOnly
                          disabled
                          value={showPin ? "PIN is set" : "••••••"}
                          className="bg-surface-muted pr-10 cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin((value) => !value)}
                          aria-label={showPin ? "Hide PIN" : "Show PIN"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showPin ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingPin(true);
                        setShowPin(false);
                        setPinError(null);
                        setPinMessage(null);
                      }}
                    >
                      Update PIN
                    </Button>
                  </div>
                  {pinMessage && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-fg">
                      <CheckCircle2 className="w-4 h-4" />
                      {pinMessage}
                    </span>
                  )}
                </div>
              ) : (
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPin((value) => !value)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                    >
                      {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showPin ? "Hide PINs" : "Show PINs"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                          setCurrentPin(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
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
                          setNewPin(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="••••••"
                      />
                    </FormField>
                    <FormField label="Confirm new PIN" htmlFor="confirm-new-pin" required>
                      <Input
                        id="confirm-new-pin"
                        name="confirm-password"
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="new-password"
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) =>
                          setConfirmPin(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="••••••"
                      />
                    </FormField>
                  </div>

                  {pinError && (
                    <p className="text-[11px] text-danger-fg">{pinError}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                    <Button type="submit" variant="secondary" disabled={pinSaving}>
                      {pinSaving ? "Updating..." : "Update PIN"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingPin(false);
                        setShowPin(false);
                        setCurrentPin("");
                        setNewPin("");
                        setConfirmPin("");
                        setPinError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
