import { useEffect, useRef, useState, type FormEvent } from "react";
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
  readRememberedEmail,
  writeRememberedEmail,
} from "../lib/session";

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return error.message || "Too many attempts. Please try again in a few minutes.";
    }
    if (error.fieldErrors?.email) return error.fieldErrors.email;
    if (error.fieldErrors?.pin) return error.fieldErrors.pin;
    if (error.status === 0) return error.message;
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

type Step = "email" | "pin" | "otp" | "reset";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

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

  const initialEmail = (params.get("email") ?? "").trim().toLowerCase();
  const startAtOtp =
    params.get("step") === "otp" && isEmail(initialEmail);
  const remembered = readRememberedEmail();
  const sentOnMount = useRef(false);

  const [step, setStep] = useState<Step>(startAtOtp ? "otp" : "email");
  const [email, setEmail] = useState(initialEmail || remembered || "");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const afterLogin = (user: User) => {
    navigate(user.profileComplete ? "/dashboard" : "/onboarding", {
      replace: true,
    });
  };

  const sendCode = async (target: string) => {
    await otpSend(target);
    setStep("otp");
  };

  // Arriving from the marketing site: send the email OTP and show the code form.
  useEffect(() => {
    if (!startAtOtp || sentOnMount.current) return;
    sentOnMount.current = true;
    let cancelled = false;
    setSending(true);
    otpSend(initialEmail)
      .then(() => {
        if (!cancelled) writeRememberedEmail(initialEmail);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(describeError(err));
        setStep("email");
      })
      .finally(() => {
        if (!cancelled) setSending(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAtOtp, initialEmail]);

  // Returning on this browser: jump straight to the PIN step if one is set.
  useEffect(() => {
    if (startAtOtp || initialEmail || !remembered) return;
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
    const clean = email.trim().toLowerCase();
    if (!isEmail(clean)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const method = await checkLoginMethod(clean);
      writeRememberedEmail(clean);
      setEmail(clean);

      if (method.exists && method.hasPin) {
        setPin("");
        setResetMode(false);
        setNotice(
          "This account is already registered. Please enter your PIN to continue to your dashboard.",
        );
        setStep("pin");
        return;
      }

      setNotice(null);
      await sendCode(clean);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePinSignIn = async (event: FormEvent) => {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter your 6-digit PIN.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const session = await pinLogin(clean, pin);
      login(session);
      writeRememberedEmail(clean);
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
    setVerifying(true);
    try {
      const clean = email.trim().toLowerCase();
      const session = await otpVerify(clean, otp);
      login(session);
      writeRememberedEmail(clean);

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
      setVerifying(false);
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
      const clean = email.trim().toLowerCase();
      writeRememberedEmail(clean);
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
    setSending(true);
    try {
      await otpSend(email.trim().toLowerCase());
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSending(false);
    }
  };

  const switchToOtp = async (forgotPin = false) => {
    const clean = email.trim().toLowerCase();
    if (!isEmail(clean)) {
      setStep("email");
      return;
    }
    setResetMode(forgotPin);
    setError(null);
    setNotice(null);
    setSending(true);
    try {
      await sendCode(clean);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <header className="bg-surface/95 border-b border-border flex items-center justify-center px-6 py-3">
        <BrandLockup size="lg" />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          {step === "email" ? (
            <form onSubmit={handleContinue} className="space-y-5">
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Sign in to your account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your registered email address to continue.
                </p>
              </div>

              <FormField label="Email address" htmlFor="email" required>
                <Input
                  id="email"
                  name="username"
                  autoComplete="username"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  invalid={!!error}
                />
              </FormField>
              {error && (
                <p className="text-[11px] text-danger-fg -mt-2">{error}</p>
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
              <p className="text-[11px] text-subtle-foreground text-center leading-relaxed">
                New clients submit the enquiry form, then verify with a
                one-time code sent to their email and set a 6-digit PIN.
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
                value={email}
                readOnly
              />

              <div className="text-center space-y-1.5">
                <div className="mx-auto h-11 w-11 flex items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your 6-digit PIN to continue.
                </p>
              </div>

              {notice && (
                <div className="rounded-lg border border-brand/30 bg-brand-soft px-3 py-2 text-[11px] font-semibold text-brand-strong">
                  {notice}
                </div>
              )}

              <div className="rounded-xl bg-surface-muted px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email address
                </p>
                <p className="mt-0.5 truncate text-sm font-extrabold text-foreground">
                  {email}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setNotice(null);
                    setPin("");
                    setResetMode(false);
                    setStep("email");
                  }}
                  className="mt-1 text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                >
                  Change email
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
                <p className="text-[11px] text-danger-fg -mt-2">{error}</p>
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
                  className="text-brand hover:text-brand-hover cursor-pointer"
                >
                  Use email code instead
                </button>
                <span className="text-subtle-foreground">·</span>
                <button
                  type="button"
                  onClick={() => void switchToOtp(true)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Forgot PIN?
                </button>
              </div>
            </form>
          ) : step === "reset" ? (
            <form onSubmit={handleResetPin} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="mx-auto h-11 w-11 flex items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Set a new PIN
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a new 6-digit PIN for {email}.
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
                <p className="text-[11px] text-danger-fg -mt-2">{error}</p>
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
                  setStep("email");
                }}
                className="w-full text-center text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel and sign out
              </button>
            </form>
          ) : (
            <OtpVerification
              identifier={email}
              channel="email"
              isVerifying={verifying}
              isSending={sending}
              errorMessage={error}
              onVerify={(otp) => void handleVerify(otp)}
              onResend={() => void handleResend()}
              onEdit={() => {
                setError(null);
                setNotice(null);
                setStep("email");
              }}
            />
          )}
        </Card>
      </main>
    </div>
  );
}
