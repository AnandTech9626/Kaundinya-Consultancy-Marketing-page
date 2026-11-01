import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import {
  staffCheckLoginMethod,
  staffPinLogin,
  staffSendOtp,
  staffVerifyOtp,
} from "../lib/api";
import { useStaffAuth } from "../lib/staff-auth";
import {
  readRememberedStaffMobile,
  writeRememberedStaffMobile,
} from "../lib/staff-session";
import { BrandLockup } from "../components/BrandLockup";
import { inputClass, labelClass } from "../components/AdminUi";

type Step = "mobile" | "pin" | "otp";

export function StaffLogin() {
  const navigate = useNavigate();
  const { login } = useStaffAuth();
  const remembered = readRememberedStaffMobile();

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState(remembered ?? "");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!remembered) return;
    let cancelled = false;
    staffCheckLoginMethod(remembered)
      .then((method) => {
        if (!cancelled && method.exists && method.hasPin) {
          setStep("pin");
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const afterLogin = (profileComplete: boolean) => {
    navigate(profileComplete ? "/dashboard" : "/setup", { replace: true });
  };

  const sendOtp = async (target: string) => {
    const result = await staffSendOtp(target);
    setDevOtp(result.devOtp ?? null);
    setStep("otp");
    setOtp("");
  };

  const handleContinue = async (event: FormEvent) => {
    event.preventDefault();
    const clean = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const method = await staffCheckLoginMethod(clean);
      if (!method.exists) {
        setError("No active staff account for this number.");
        return;
      }
      writeRememberedStaffMobile(clean);
      if (method.hasPin) {
        setPin("");
        setStep("pin");
      } else {
        await sendOtp(clean);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    } finally {
      setBusy(false);
    }
  };

  const handlePin = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter your 6-digit PIN.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const clean = mobile.replace(/\D/g, "");
      const session = await staffPinLogin(clean, pin);
      login(session);
      writeRememberedStaffMobile(clean);
      afterLogin(session.staff.profileComplete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const handleOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const clean = mobile.replace(/\D/g, "");
      const session = await staffVerifyOtp(clean, otp);
      login(session);
      writeRememberedStaffMobile(clean);
      afterLogin(session.staff.profileComplete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify OTP.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="flex items-center justify-center border-b border-border-subtle bg-white px-6 py-3">
        <BrandLockup size="lg" />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6 shadow-sm sm:p-8">
          {step === "mobile" ? (
            <form onSubmit={handleContinue} className="space-y-5">
              <div className="space-y-1.5 text-center">
                <h1 className="text-2xl font-extrabold tracking-tight text-charcoal">
                  Staff sign in
                </h1>
                <p className="text-sm text-muted">
                  Admin and partner access for Kaundinya.
                </p>
              </div>
              <div>
                <label className={labelClass} htmlFor="staff-mobile">
                  Mobile number
                </label>
                <input
                  id="staff-mobile"
                  name="username"
                  autoComplete="username"
                  type="tel"
                  inputMode="numeric"
                  className={inputClass}
                  value={mobile}
                  onChange={(event) =>
                    setMobile(
                      event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  placeholder="10-digit mobile number"
                />
              </div>
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
              >
                {busy ? (
                  "Checking..."
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : step === "pin" ? (
            <form onSubmit={handlePin} className="space-y-5" autoComplete="on">
              <input
                type="hidden"
                name="username"
                autoComplete="username"
                value={mobile}
                readOnly
              />
              <div className="space-y-1.5 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-[#B8860B]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-charcoal">
                  Welcome back
                </h1>
                <p className="text-sm text-muted">Enter your 6-digit PIN.</p>
              </div>
              <div className="rounded-xl bg-ivory px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Mobile number
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-charcoal">
                  +91 {mobile}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setPin("");
                    setStep("mobile");
                  }}
                  className="mt-1 text-[11px] font-bold text-gold hover:text-gold-hover cursor-pointer"
                >
                  Change number
                </button>
              </div>
              <div>
                <label className={labelClass} htmlFor="staff-pin">
                  6-digit PIN
                </label>
                <input
                  id="staff-pin"
                  name="password"
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={6}
                  className={inputClass}
                  value={pin}
                  onChange={(event) =>
                    setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                />
              </div>
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={busy || pin.length !== 6}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
              <button
                type="button"
                onClick={() => void sendOtp(mobile)}
                className="w-full text-center text-[11px] font-bold text-gold hover:text-gold-hover cursor-pointer"
              >
                Use OTP instead
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="space-y-1.5 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-[#B8860B]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-charcoal">
                  Verify your number
                </h1>
                <p className="text-sm text-muted">
                  Enter the OTP sent to +91 {mobile}.
                </p>
                {devOtp && (
                  <p className="text-[11px] font-semibold text-amber-600">
                    Dev OTP: {devOtp}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass} htmlFor="staff-otp">
                  OTP
                </label>
                <input
                  id="staff-otp"
                  inputMode="numeric"
                  maxLength={6}
                  className={inputClass}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit code"
                />
              </div>
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={busy || otp.length !== 6}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & continue"
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => void sendOtp(mobile)}
                  className="text-gold hover:text-gold-hover cursor-pointer"
                >
                  Resend OTP
                </button>
                <span className="text-muted-light">·</span>
                <button
                  type="button"
                  onClick={() => setStep("mobile")}
                  className="text-muted hover:text-charcoal cursor-pointer"
                >
                  Change number
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
