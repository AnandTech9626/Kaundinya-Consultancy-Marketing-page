import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, Card, FormField, Input, OtpVerification } from "@kaundinya/ui";
import { SITE_INFO } from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { otpSend, otpVerify } from "../lib/mockApi";

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

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    const clean = mobile.replace(/\D/g, "");
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    // POST /api/otp/send (mocked)
    await otpSend(clean);
    setIsSubmitting(false);
    setStep("otp");
  };

  const handleVerify = async (otp: string) => {
    setError(null);
    setIsVerifying(true);
    try {
      // POST /api/otp/verify (mocked) → returns token + user
      const res = await otpVerify(mobile.replace(/\D/g, ""), otp);
      login(res.user);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid OTP. Please try again.");
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
                  onChange={(e) => setMobile(e.target.value)}
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
              onResend={() => {}}
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
