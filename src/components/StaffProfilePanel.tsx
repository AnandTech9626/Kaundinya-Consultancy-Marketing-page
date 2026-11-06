import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2, LogOut, UserPlus, Users, X } from "lucide-react";
import {
  createAdminPartner,
  fetchAdminStaff,
  staffChangePin,
  updateAdminStaff,
} from "../lib/api";
import { useStaffAuth } from "../lib/staff-auth";
import type { StaffUser } from "../lib/staff-session";
import { formatDateTime } from "../lib/format";
import { showToast } from "../lib/toast";
import { StatusBadge, inputClass, labelClass } from "./AdminUi";

interface StaffProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

export function StaffProfilePanel({ open, onClose }: StaffProfilePanelProps) {
  const { staff, updateStaff, logout } = useStaffAuth();
  const isAdmin = staff?.role === "admin";

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [editingPin, setEditingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [team, setTeam] = useState<StaffUser[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerMobile, setPartnerMobile] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerPin, setPartnerPin] = useState("");
  const [partnerBusy, setPartnerBusy] = useState(false);
  const [resetPins, setResetPins] = useState<Record<string, string>>({});

  const loadTeam = useCallback(async () => {
    if (!isAdmin) return;
    setTeamLoading(true);
    setTeamError(null);
    try {
      setTeam(await fetchAdminStaff());
    } catch (err) {
      setTeamError(
        err instanceof Error ? err.message : "Could not load partners.",
      );
    } finally {
      setTeamLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (open && isAdmin) void loadTeam();
  }, [open, isAdmin, loadTeam]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const changePin = async (event: FormEvent) => {
    event.preventDefault();
    setPinError(null);
    if (!/^\d{6}$/.test(currentPin)) {
      setPinError("Enter your current 6-digit PIN.");
      return;
    }
    if (!/^\d{6}$/.test(newPin) || new Set(newPin).size < 2) {
      setPinError("Choose a new 6-digit PIN.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("The two new PINs do not match.");
      return;
    }
    setPinBusy(true);
    try {
      const updated = await staffChangePin(currentPin, newPin);
      updateStaff(updated);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setEditingPin(false);
      setShowPin(false);
      showToast("PIN updated.");
    } catch (err) {
      setPinError(
        err instanceof Error ? err.message : "Could not update your PIN.",
      );
    } finally {
      setPinBusy(false);
    }
  };

  const createPartner = async (event: FormEvent) => {
    event.preventDefault();
    setTeamError(null);
    if (partnerName.trim().length < 2) {
      setTeamError("Enter the partner's name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(partnerMobile)) {
      setTeamError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^\d{6}$/.test(partnerPin) || new Set(partnerPin).size < 2) {
      setTeamError("Set a 6-digit PIN for the partner.");
      return;
    }
    setPartnerBusy(true);
    try {
      const created = await createAdminPartner({
        name: partnerName.trim(),
        mobile: partnerMobile,
        email: partnerEmail.trim(),
        pin: partnerPin,
      });
      showToast(
        `Partner ${created.staffCode} created. Share the mobile + PIN with them.`,
      );
      setPartnerName("");
      setPartnerMobile("");
      setPartnerEmail("");
      setPartnerPin("");
      await loadTeam();
    } catch (err) {
      setTeamError(
        err instanceof Error ? err.message : "Could not create partner.",
      );
    } finally {
      setPartnerBusy(false);
    }
  };

  const toggleActive = async (member: StaffUser) => {
    try {
      await updateAdminStaff(member.id, { active: !member.active });
      showToast(
        `${member.staffCode} ${member.active ? "deactivated" : "activated"}.`,
      );
      await loadTeam();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update partner.",
        "error",
      );
    }
  };

  const resetPartnerPin = async (member: StaffUser) => {
    const pin = (resetPins[member.id] ?? "").trim();
    if (!/^\d{6}$/.test(pin) || new Set(pin).size < 2) {
      showToast("Enter a valid 6-digit PIN first.", "error");
      return;
    }
    try {
      await updateAdminStaff(member.id, { pin });
      setResetPins((current) => ({ ...current, [member.id]: "" }));
      showToast(`PIN reset for ${member.staffCode}.`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not reset PIN.",
        "error",
      );
    }
  };

  const partners = team.filter((member) => member.role === "partner");

  return (
    <div
      className={`fixed inset-0 z-[105] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-charcoal/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Staff profile"
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-out sm:w-1/2 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-white p-4 sm:p-5">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-charcoal">
              Staff profile
            </h2>
            <p className="text-[11px] text-muted">
              Account, security PIN and partner access.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="shrink-0 rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <section className="rounded-2xl border border-border-subtle bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-lg font-extrabold text-gold">
                {(staff?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-charcoal">
                  {staff?.name}
                </p>
                <p className="text-[11px] capitalize text-muted">
                  {staff?.role} · {staff?.staffCode}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Mobile
                </p>
                <p className="mt-0.5 font-semibold text-charcoal">
                  +91 {staff?.mobile}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Email
                </p>
                <p className="mt-0.5 truncate font-semibold text-charcoal">
                  {staff?.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Last login
                </p>
                <p className="mt-0.5 font-semibold text-charcoal">
                  {staff?.lastLoginAt
                    ? formatDateTime(staff.lastLoginAt)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={staff?.active ? "active" : "lapsed"} />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </section>

          <section className="rounded-2xl border border-border-subtle bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-gold" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
                Change PIN
              </h3>
            </div>
            {!editingPin ? (
              <div className="space-y-3">
                <p className="text-[11px] leading-relaxed text-muted">
                  Click Show to reveal your PIN, or Update PIN to set a new one.
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[12rem] flex-1">
                    <label className={labelClass} htmlFor="staff-pin-display">
                      PIN
                    </label>
                    <div className="relative">
                      <input
                        id="staff-pin-display"
                        type="text"
                        readOnly
                        disabled
                        className={`${inputClass} cursor-not-allowed bg-ivory pr-10`}
                        value={showPin ? "PIN is set" : "••••••"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin((value) => !value)}
                        aria-label={showPin ? "Hide PIN" : "Show PIN"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-charcoal cursor-pointer"
                      >
                        {showPin ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPin(true);
                      setShowPin(false);
                      setPinError(null);
                    }}
                    className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-bold text-charcoal hover:border-gold/60 cursor-pointer"
                  >
                    Update PIN
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={changePin} className="space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPin((value) => !value)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-gold-hover cursor-pointer"
                  >
                    {showPin ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {showPin ? "Hide PINs" : "Show PINs"}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="staff-current-pin">
                      Current PIN
                    </label>
                    <input
                      id="staff-current-pin"
                      name="current-password"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="current-password"
                      maxLength={6}
                      className={inputClass}
                      value={currentPin}
                      onChange={(event) =>
                        setCurrentPin(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="staff-new-pin">
                      New PIN
                    </label>
                    <input
                      id="staff-new-pin"
                      name="new-password"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="new-password"
                      maxLength={6}
                      className={inputClass}
                      value={newPin}
                      onChange={(event) =>
                        setNewPin(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="staff-confirm-pin">
                      Confirm PIN
                    </label>
                    <input
                      id="staff-confirm-pin"
                      name="confirm-password"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      autoComplete="new-password"
                      maxLength={6}
                      className={inputClass}
                      value={confirmPin}
                      onChange={(event) =>
                        setConfirmPin(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="••••••"
                    />
                  </div>
                </div>
                {pinError && (
                  <p className="text-[11px] text-rose-600">{pinError}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={pinBusy}
                    className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
                  >
                    {pinBusy ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update PIN"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPin(false);
                      setShowPin(false);
                      setCurrentPin("");
                      setNewPin("");
                      setConfirmPin("");
                      setPinError(null);
                    }}
                    className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-bold text-charcoal hover:border-gold/60 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {isAdmin && (
            <section className="rounded-2xl border border-border-subtle bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
                  Partner access
                </h3>
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-muted">
                Partners get the same access as you. Create their account with a
                PIN and share that mobile + PIN with them.
              </p>

              <form onSubmit={createPartner} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="partner-name">
                      Name
                    </label>
                    <input
                      id="partner-name"
                      className={inputClass}
                      value={partnerName}
                      onChange={(event) => setPartnerName(event.target.value)}
                      placeholder="Partner name"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="partner-mobile">
                      Mobile
                    </label>
                    <input
                      id="partner-mobile"
                      inputMode="numeric"
                      maxLength={10}
                      className={inputClass}
                      value={partnerMobile}
                      onChange={(event) =>
                        setPartnerMobile(
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="10-digit mobile"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="partner-email">
                      Email
                    </label>
                    <input
                      id="partner-email"
                      type="email"
                      className={inputClass}
                      value={partnerEmail}
                      onChange={(event) => setPartnerEmail(event.target.value)}
                      placeholder="partner@example.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="partner-pin">
                      PIN for partner
                    </label>
                    <input
                      id="partner-pin"
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      className={inputClass}
                      value={partnerPin}
                      onChange={(event) =>
                        setPartnerPin(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="6-digit PIN"
                    />
                  </div>
                </div>
                {teamError && (
                  <p className="text-[11px] text-rose-600">{teamError}</p>
                )}
                <button
                  type="submit"
                  disabled={partnerBusy}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
                >
                  {partnerBusy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      Create partner
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 space-y-2 border-t border-border-subtle pt-4">
                {teamLoading ? (
                  <p className="text-[11px] text-muted">Loading partners...</p>
                ) : partners.length === 0 ? (
                  <p className="text-[11px] text-muted">No partners yet.</p>
                ) : (
                  partners.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-xl border border-border-subtle p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-extrabold text-charcoal">
                            {member.name}{" "}
                            <span className="font-semibold text-muted">
                              {member.staffCode}
                            </span>
                          </p>
                          <p className="text-[10px] text-muted">
                            +91 {member.mobile}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={member.active ? "active" : "lapsed"}
                          />
                          <button
                            type="button"
                            onClick={() => void toggleActive(member)}
                            className="rounded-lg border border-border-subtle px-2 py-1 text-[10px] font-bold text-charcoal hover:border-gold/60"
                          >
                            {member.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          className={`${inputClass} py-1.5 text-xs`}
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={resetPins[member.id] ?? ""}
                          onChange={(event) =>
                            setResetPins((current) => ({
                              ...current,
                              [member.id]: event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            }))
                          }
                          placeholder="New 6-digit PIN"
                        />
                        <button
                          type="button"
                          onClick={() => void resetPartnerPin(member)}
                          className="shrink-0 rounded-lg border border-border-subtle px-2.5 py-1 text-[10px] font-bold text-charcoal hover:border-gold/60"
                        >
                          Reset PIN
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
