import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import {
  Button,
  Card,
  FormField,
  Input,
  OtpVerification,
} from "@kaundinya/ui";
import type { User } from "@kaundinya/config";
import { BrandLockup } from "../components/BrandLockup";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { savePasswordCredential } from "../lib/credentials";
import {
  checkLoginMethod,
  otpSend,
  otpVerify,
  pinLogin,
  setPin as setPinApi,
} from "../lib/mockApi";
import {
  readRememberedMobile,
  writeRememberedMobile,
} from "../lib/session";

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return error.message || "Too many attempts. Please try again in a few minutes.";
    }
    if (error.fieldErrors?.mobile) return error.fieldErrors.mobile;
    if (error.fieldErrors?.pin) return error.fieldErrors.pin;
    if (error.status === 0) return error.message;
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

type Step = "mobile" | "pin" | "otp" | "reset";

function isStrongPin(pin: string): boolean {
  return (
    /^\d{6}$/.test(pin) &&
    new Set(pin).size > 1 &&
    !["123456", "654321", "012345", "543210"].includes(pin)
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login, updateUser, logout } = useAuth();
  const [params] = useSearchParams();

  const initialMobile = (params.get("mobile") ?? "").replace(/\D/g, "");
  const startAtOtp =
    params.get("step") === "otp" && initialMobile.length >= 10;
  const remembered = readRememberedMobile();

  const [step, setStep] = useState<Step>(startAtOtp ? "otp" : "mobile");
  const [mobile, setMobile] = useState(initialMobile || remembered || "");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const afterLogin = (user: User) => {
    navigate(user.profileComplete ? "/dashboard" : "/onboarding", {
      replace: true,
    });
  };

  const sendOtp = async (target: string) => {
    await otpSend(target.replace(/\D/g, ""));
    setStep("otp");
  };

  // Returning on this browser: go straight to the PIN step.
  useEffect(() => {
    if (startAtOtp || initialMobile || !remembered) return;
    let cancelled = false;
    checkLoginMethod(remembered)
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

  const handleContinue = async (event: FormEvent) => {
    event.preventDefault();
    const clean = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const method = await checkLoginMethod(clean);
      writeRememberedMobile(clean);

      if (method.exists && method.hasPin) {
        setPin("");
        setStep("pin");
        return;
      }

      await sendOtp(clean);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePinSignIn = async (event: FormEvent) => {
    event.preventDefault();
    const clean = mobile.replace(/\D/g, "");
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter your 6-digit PIN.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const session = await pinLogin(clean, pin);
      login(session);
      writeRememberedMobile(clean);
      void savePasswordCredential(clean, pin, session.user.name);
      afterLogin(session.user);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (otp: string) => {
    setError(null);
    setBusy(true);
    try {
      const clean = mobile.replace(/\D/g, "");
      const session = await otpVerify(clean, otp);
      login(session);
      writeRememberedMobile(clean);

      if (resetMode) {
        setNewPin("");
        setConfirmPin("");
        setError(null);
        setStep("reset");
        return;
      }

      afterLogin(session.user);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResetPin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isStrongPin(newPin)) {
      setError("Choose a 6-digit PIN that isn't easy to guess.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("The two PINs do not match.");
      return;
    }

    setBusy(true);
    try {
      const updated = await setPinApi(newPin);
      updateUser(updated);
      const clean = mobile.replace(/\D/g, "");
      void savePasswordCredential(clean, newPin, updated.name);
      afterLogin(updated);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setBusy(true);
    try {
      await sendOtp(mobile);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const switchToOtp = async (forgotPin = false) => {
    const clean = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setStep("mobile");
      return;
    }
    setResetMode(forgotPin);
    setError(null);
    setBusy(true);
    try {
      await sendOtp(clean);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="bg-white/95 border-b border-border-subtle flex items-center justify-center px-6 py-3">
        <BrandLockup size="lg" />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          {step === "mobile" ? (
            <form onSubmit={handleContinue} className="space-y-5">
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
                  Sign in to your account
                </h1>
                <p className="text-sm text-muted">
                  Enter your registered mobile number to continue.
                </p>
              </div>

              <FormField label="Mobile number" htmlFor="mobile" required>
                <Input
                  id="mobile"
                  name="username"
                  autoComplete="username"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(
                      event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  invalid={!!error}
                />
              </FormField>
              {error && (
                <p className="text-[11px] text-rose-600 -mt-2">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  "Checking..."
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <p className="text-[11px] text-muted-light text-center leading-relaxed">
                New clients verify with a one-time password and set a 6-digit
                PIN on the next step.
              </p>
            </form>
          ) : step === "pin" ? (
            <form
              onSubmit={handlePinSignIn}
              className="space-y-5"
              autoComplete="on"
            >
              <input
                type="hidden"
                name="username"
                autoComplete="username"
                value={mobile}
                readOnly
              />

              <div className="text-center space-y-1.5">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-[#B8860B]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-muted">
                  Enter your 6-digit PIN to continue.
                </p>
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
                    setResetMode(false);
                    setStep("mobile");
                  }}
                  className="mt-1 text-[11px] font-bold text-gold hover:text-gold-hover cursor-pointer"
                >
                  Change number
                </button>
              </div>

              <FormField label="6-digit PIN" htmlFor="pin" required>
                <Input
                  id="pin"
                  name="password"
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={6}
                  placeholder="••••••"
                  value={pin}
                  onChange={(event) =>
                    setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  invalid={!!error}
                />
              </FormField>
              {error && (
                <p className="text-[11px] text-rose-600 -mt-2">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={busy || pin.length !== 6}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => void switchToOtp()}
                  className="text-gold hover:text-gold-hover cursor-pointer"
                >
                  Use OTP instead
                </button>
                <span className="text-muted-light">·</span>
                <button
                  type="button"
                  onClick={() => void switchToOtp(true)}
                  className="text-muted hover:text-charcoal cursor-pointer"
                >
                  Forgot PIN?
                </button>
              </div>
            </form>
          ) : step === "reset" ? (
            <form onSubmit={handleResetPin} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-[#B8860B]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
                  Set a new PIN
                </h1>
                <p className="text-sm text-muted">
                  Choose a new 6-digit PIN for +91 {mobile}.
                </p>
              </div>

              <FormField label="New PIN" htmlFor="reset-pin" required>
                <Input
                  id="reset-pin"
                  name="new-password"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  placeholder="••••••"
                  value={newPin}
                  onChange={(event) =>
                    setNewPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </FormField>
              <FormField
                label="Confirm new PIN"
                htmlFor="reset-confirm-pin"
                required
              >
                <Input
                  id="reset-confirm-pin"
                  name="confirm-password"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  placeholder="••••••"
                  value={confirmPin}
                  onChange={(event) =>
                    setConfirmPin(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                />
              </FormField>
              {error && (
                <p className="text-[11px] text-rose-600 -mt-2">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save PIN & continue"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setResetMode(false);
                  setStep("mobile");
                }}
                className="w-full text-center text-[11px] font-bold text-muted hover:text-charcoal cursor-pointer"
              >
                Cancel and sign out
              </button>
            </form>
          ) : (
            <OtpVerification
              mobile={mobile}
              isVerifying={busy}
              errorMessage={error}
              onVerify={(otp) => void handleVerify(otp)}
              onResend={() => void handleResend()}
              onEdit={() => {
                setError(null);
                setStep("mobile");
              }}
            />
          )}
        </Card>
      </main>
    </div>
  );
}
