import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, Card, FormField, Input, OtpVerification } from "@kaundinya/ui";
import { SITE_INFO } from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { otpSend, otpVerify } from "../lib/mockApi";

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "Too many attempts. Please try again in a few minutes.";
    }
    if (error.fieldErrors?.mobile) return error.fieldErrors.mobile;
    if (error.status === 0) return error.message;
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [params] = useSearchParams();

  // Hand-off from the marketing site: /login?mobile=XXXXXXXXXX&step=otp
  const initialMobile = (params.get("mobile") ?? "").replace(/\D/g, "");
  const startAtOtp = params.get("step") === "otp" && initialMobile.length >= 10;

  const [step, setStep] = useState<"mobile" | "otp">(startAtOtp ? "otp" : "mobile");
  const [mobile, setMobile] = useState(initialMobile);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const autoSent = useRef(false);

  const handleSendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    const clean = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await otpSend(clean);
      setStep("otp");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!startAtOtp || autoSent.current) return;
    autoSent.current = true;
    void handleSendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAtOtp]);

  const handleVerify = async (otp: string) => {
    setError(null);
    setIsVerifying(true);
    try {
      const session = await otpVerify(mobile.replace(/\D/g, ""), otp);
      login(session);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="h-16 bg-white/95 border-b border-border-subtle flex items-center justify-center px-6">
        <img
          src="/images/logo.webp"
          alt={SITE_INFO.name}
          className="h-10 w-auto object-contain"
        />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          {step === "mobile" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
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
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  invalid={!!error}
                />
              </FormField>
              {error && <p className="text-[11px] text-rose-600 -mt-2">{error}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <OtpVerification
              mobile={mobile}
              isVerifying={isVerifying}
              errorMessage={error}
              onVerify={handleVerify}
              onResend={() => {
                void handleSendOtp();
              }}
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
