import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  HandCoins,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  Button,
  Card,
  FormField,
  Input,
  OtpVerification,
  Select,
  Textarea,
} from "@kaundinya/ui";
import type { User } from "@kaundinya/config";
import { BrandLockup } from "../components/BrandLockup";
import { BRAND_MARK_URL } from "../lib/brand";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { savePasswordCredential } from "../lib/credentials";
import {
  checkLoginMethod,
  otpSend,
  otpVerify,
  pinLogin,
  setPin as setPinApi,
  submitEnquiry,
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

type Step = "email" | "pin" | "otp" | "reset" | "register";

const CATEGORY_OPTIONS: Record<string, string[]> = {
  "Real Estate": [
    "Property Rentals (Residential)",
    "Property Rentals (Commercial)",
    "Property Buying Assistance",
    "Property Selling Assistance",
    "Rental Agreement & Tenant Verification",
  ],
  Insurance: [
    "Life & Term Insurance Advisory",
    "Comprehensive Health Insurance",
    "Two-Wheeler Motor Insurance",
    "Four-Wheeler Motor Insurance",
    "Property & Fire Insurance",
  ],
  "Property Management & Home Services": [
    "Pigeon Safety Nets Installation",
    "Invisible Safety Grills Installation",
    "Air Conditioner (AC) Servicing",
    "Refrigerator Servicing",
    "Aadhaar & Voter ID Update Assistance Coordination",
    "Interior Design Consultation",
  ],
  Loans: [
    "Home Loan (Purchase / Construction)",
    "Personal Loan",
    "Business Loan",
    "Loan Against Property (Mortgage)",
  ],
};

const BRAND_SERVICES = [
  { label: "Real Estate", icon: Building2 },
  { label: "Insurance", icon: ShieldCheck },
  { label: "Loans", icon: HandCoins },
  { label: "Property Management", icon: KeyRound },
] as const;

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

  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regCategory, setRegCategory] = useState("");
  const [regService, setRegService] = useState("");
  const [regPinCode, setRegPinCode] = useState("");
  const [regComments, setRegComments] = useState("");
  const [regConsent, setRegConsent] = useState(false);
  const [registering, setRegistering] = useState(false);

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

      if (!method.exists) {
        setNotice(null);
        setStep("register");
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

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const clean = email.trim().toLowerCase();
    if (!isEmail(clean)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (regName.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    const mobile = regMobile.replace(/[^0-9]/g, "");
    if (mobile.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!regCategory) {
      setError("Select a service category.");
      return;
    }
    const pinCode = regPinCode.replace(/[^0-9]/g, "");
    if (pinCode && !/^[1-9][0-9]{5}$/.test(pinCode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }
    if (!regConsent) {
      setError("Please agree to be contacted about your enquiry.");
      return;
    }

    setRegistering(true);
    try {
      await submitEnquiry({
        fullName: regName.trim(),
        email: clean,
        mobile,
        serviceCategory: regCategory,
        specificService: regService,
        pinCode,
        comments: regComments.trim(),
        consent: true,
      });
      writeRememberedEmail(clean);
      await sendCode(clean);
      setNotice(`Verification code sent to ${clean}.`);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setRegistering(false);
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
    <div className="min-h-screen bg-[#FAF7F2] lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#1C140D] text-[#D8C49A] lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(197,155,39,0.3),transparent_55%)]"
        />
        <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-10 pt-16">
          <img
            src={BRAND_MARK_URL}
            alt="Kaundinya"
            className="w-44 object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.5)] xl:w-52"
          />
          <div className="text-center">
            <p className="text-3xl font-extrabold tracking-[0.12em] text-[#C59B27]">
              KAUNDINYA
            </p>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.22em] text-[#B99A5B]">
              Integrated Services
            </p>
          </div>
          <div className="mt-2 h-px w-44 bg-[#C59B27]/30" />
          <p className="max-w-[19rem] text-center text-[12px] leading-relaxed text-[#C9B58E]">
            Unified Advisory for Real Estate, Wealth Protection &amp; Lending
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-3 px-8 pb-10">
          {BRAND_SERVICES.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="group flex items-center gap-3 border border-[#C59B27]/30 bg-gradient-to-br from-[#C59B27]/10 to-transparent px-3.5 py-3 transition-colors hover:border-[#C59B27]/60 hover:from-[#C59B27]/15"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C59B27]/30 bg-[#C59B27]/10 text-[#C59B27]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D8C49A]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <main className="auth-paper relative flex min-h-screen flex-col items-center justify-center border-l border-[#C59B27]/25 p-6 sm:p-10">
        <div className="mb-6 flex justify-center lg:hidden">
          <BrandLockup size="md" />
        </div>
        <Card
          className={`w-full ${
            step === "register" ? "max-w-2xl" : "max-w-md"
          } p-6 sm:p-8`}
        >
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

              <Button
                type="submit"
                className="w-full"
                disabled={busy}
              >
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
                Returning clients can verify with an email code or their PIN.
              </p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setStep("register");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-brand/60 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                New here? Create an account
              </button>
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
          ) : step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="mx-auto h-11 w-11 flex items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Create your account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tell us how we can help. We will email a verification code,
                  then you can set your 6-digit PIN.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Full name" htmlFor="reg-name" required>
                  <Input
                    id="reg-name"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={regName}
                    onChange={(event) => setRegName(event.target.value)}
                  />
                </FormField>
                <FormField label="Email address" htmlFor="reg-email" required>
                  <Input
                    id="reg-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </FormField>
                <FormField label="Mobile number" htmlFor="reg-mobile" required>
                  <Input
                    id="reg-mobile"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={regMobile}
                    onChange={(event) =>
                      setRegMobile(
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                      )
                    }
                  />
                </FormField>
                <FormField label="PIN code" htmlFor="reg-pincode">
                  <Input
                    id="reg-pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    placeholder="6-digit PIN code"
                    value={regPinCode}
                    onChange={(event) =>
                      setRegPinCode(
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                      )
                    }
                  />
                </FormField>
                <FormField
                  label="Service category"
                  htmlFor="reg-category"
                  required
                >
                  <Select
                    id="reg-category"
                    value={regCategory}
                    onChange={(event) => {
                      setRegCategory(event.target.value);
                      setRegService("");
                    }}
                  >
                    <option value="">Select a category</option>
                    {Object.keys(CATEGORY_OPTIONS).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Specific service" htmlFor="reg-service">
                  <Select
                    id="reg-service"
                    value={regService}
                    disabled={!regCategory}
                    onChange={(event) => setRegService(event.target.value)}
                  >
                    <option value="">Select a service</option>
                    {(CATEGORY_OPTIONS[regCategory] ?? []).map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField label="Comments" htmlFor="reg-comments">
                <Textarea
                  id="reg-comments"
                  rows={3}
                  placeholder="Anything we should know?"
                  value={regComments}
                  onChange={(event) => setRegComments(event.target.value)}
                />
              </FormField>

              <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={regConsent}
                  onChange={(event) => setRegConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-brand"
                />
                <span>
                  I agree that Kaundinya Consultancy may contact me about this
                  enquiry.
                </span>
              </label>

              {error && <p className="text-[11px] text-danger-fg">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={registering}
              >
                {registering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Continue with email code
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("email");
                }}
                className="w-full text-center text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Already have an account? Sign in
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
