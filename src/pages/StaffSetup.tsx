import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { staffSetPin } from "../lib/api";
import { useStaffAuth } from "../lib/staff-auth";
import { BrandLockup } from "../components/BrandLockup";
import { inputClass, labelClass } from "../components/AdminUi";

export function StaffSetup() {
  const navigate = useNavigate();
  const { staff, updateStaff, logout } = useStaffAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(pin) || new Set(pin).size < 2) {
      setError("Choose a 6-digit PIN that isn't easy to guess.");
      return;
    }
    if (pin !== confirmPin) {
      setError("The two PINs do not match.");
      return;
    }

    setBusy(true);
    try {
      const updated = await staffSetPin(pin);
      updateStaff(updated);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set your PIN.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="flex items-center justify-between border-b border-border-subtle bg-white px-4 py-2 sm:px-8">
        <BrandLockup size="md" />
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-charcoal cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 space-y-1.5 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-[#B8860B]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-charcoal">
              Set your staff PIN
            </h1>
            <p className="text-sm text-muted">
              {staff?.name || "Staff"} · {staff?.staffCode} · {staff?.role}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="setup-pin">
                New 6-digit PIN
              </label>
              <input
                id="setup-pin"
                name="new-password"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={6}
                className={inputClass}
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="••••••"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="setup-confirm">
                Confirm PIN
              </label>
              <input
                id="setup-confirm"
                name="confirm-password"
                type="password"
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

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save PIN & continue"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
