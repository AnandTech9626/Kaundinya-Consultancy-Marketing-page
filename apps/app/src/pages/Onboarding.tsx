import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Loader2, LogOut, ShieldCheck } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
} from "@kaundinya/ui";
import { useAuth } from "../lib/auth";
import { BrandLockup } from "../components/BrandLockup";
import { ApiError } from "../lib/api";
import { savePasswordCredential } from "../lib/credentials";
import { setPin, updateProfile } from "../lib/mockApi";

function isStrongPin(pin: string): boolean {
  return (
    /^\d{6}$/.test(pin) &&
    new Set(pin).size > 1 &&
    !["123456", "654321", "012345", "543210"].includes(pin)
  );
}

export function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const needsPin = !user?.hasPin;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pinCode, setPinCode] = useState(user?.pinCode ?? "");
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!/^[1-9]\d{5}$/.test(pinCode.trim())) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }
    if (needsPin) {
      if (!isStrongPin(pin)) {
        setError("Choose a 6-digit PIN that isn't easy to guess.");
        return;
      }
      if (pin !== confirmPin) {
        setError("The two PINs do not match.");
        return;
      }
    }

    setBusy(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        pinCode: pinCode.trim(),
      });

      let finalUser = updated;

      if (needsPin) {
        finalUser = await setPin(pin);
        if (user?.mobile) {
          void savePasswordCredential(user.mobile, pin, finalUser.name);
        }
      }

      updateUser(finalUser);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not save your profile. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="bg-white/95 border-b border-border-subtle flex items-center justify-between px-4 py-2 sm:px-8">
        <BrandLockup size="md" />
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-charcoal cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
              One last step
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal">
              Complete your profile
            </h1>
            <p className="mt-1 text-sm text-muted">
              We've prefilled what you shared with us. Confirm it and set a
              6-digit PIN for faster sign-in.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="p-5 lg:col-span-4 h-fit">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-lg font-extrabold text-gold">
                  {(name.trim() || "K").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-charcoal">
                    {name.trim() || "Your name"}
                  </p>
                  <p className="text-[11px] text-muted">+91 {user?.mobile}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-border-subtle pt-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Client ID
                  </p>
                  <p className="mt-0.5 font-extrabold text-charcoal">
                    {user?.clientCode ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Mobile
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-semibold text-charcoal">
                      +91 {user?.mobile}
                    </span>
                    <Badge variant="success">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="mt-4 rounded-lg bg-ivory p-2.5 text-[10px] leading-relaxed text-muted">
                Your mobile number stays verified and can't be changed here.
                Contact our team if it needs updating.
              </p>
            </Card>

            <Card className="p-5 sm:p-6 lg:col-span-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full name" htmlFor="onboarding-name" required>
                    <Input
                      id="onboarding-name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                    />
                  </FormField>
                  <FormField
                    label="Email address"
                    htmlFor="onboarding-email"
                    required
                  >
                    <Input
                      id="onboarding-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="PIN code"
                    htmlFor="onboarding-pincode"
                    required
                  >
                    <Input
                      id="onboarding-pincode"
                      name="postal-code"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={6}
                      value={pinCode}
                      onChange={(event) =>
                        setPinCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="6-digit PIN code"
                    />
                  </FormField>
                  <FormField label="Mobile (verified)" htmlFor="onboarding-mobile">
                    <Input
                      id="onboarding-mobile"
                      name="tel"
                      autoComplete="tel"
                      value={`+91 ${user?.mobile ?? ""}`}
                      readOnly
                      className="bg-ivory cursor-not-allowed"
                    />
                  </FormField>
                </div>

                {needsPin ? (
                  <div className="space-y-3 rounded-xl border border-border-subtle bg-ivory/60 p-4">
                    <div>
                      <p className="text-xs font-extrabold text-charcoal">
                        Set your 6-digit PIN
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        You'll use this PIN every time you open the app. Your
                        browser can save it for faster sign-in.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="New PIN" htmlFor="onboarding-pin" required>
                        <Input
                          id="onboarding-pin"
                          name="new-password"
                          type="password"
                          inputMode="numeric"
                          autoComplete="new-password"
                          maxLength={6}
                          value={pin}
                          onChange={(event) =>
                            setPinValue(
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          placeholder="••••••"
                        />
                      </FormField>
                      <FormField
                        label="Confirm PIN"
                        htmlFor="onboarding-confirm-pin"
                        required
                      >
                        <Input
                          id="onboarding-confirm-pin"
                          name="confirm-password"
                          type="password"
                          inputMode="numeric"
                          autoComplete="new-password"
                          maxLength={6}
                          value={confirmPin}
                          onChange={(event) =>
                            setConfirmPin(
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          placeholder="••••••"
                        />
                      </FormField>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-[11px] text-emerald-800">
                      Your PIN is already set. Confirm the details above to
                      continue.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-700">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save profile & continue"
                  )}
                </Button>

                <p className="text-center text-[10px] leading-relaxed text-muted-light">
                  By continuing you agree that Kaundinya may contact you about
                  your requests. Your PIN is stored securely and is never
                  shared.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
