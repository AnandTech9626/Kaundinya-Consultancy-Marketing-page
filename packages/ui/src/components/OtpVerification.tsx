import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2, RotateCcw, AlertCircle, Pencil } from "lucide-react";

interface OtpVerificationProps {
  identifier: string;
  channel?: "mobile" | "email";
  isVerifying: boolean;
  isSending?: boolean;
  errorMessage?: string | null;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onEdit: () => void;
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function OtpVerification({
  identifier,
  channel = "mobile",
  isVerifying,
  isSending = false,
  errorMessage,
  onVerify,
  onResend,
  onEdit,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    digits.split("").forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    const last = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[last]?.focus();
    setActiveIndex(last);
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    setActiveIndex(0);
    onResend();
  };

  const complete = otp.every((d) => d !== "");
  const cleanIdentifier = identifier.trim().replace(/\s+/g, "");
  const displayIdentifier =
    channel === "email"
      ? identifier.trim()
      : /^\d{10}$/.test(cleanIdentifier)
        ? `+91 ${cleanIdentifier}`
        : identifier.trim();
  const isEmail = channel === "email";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
          {isEmail ? "Verify Your Email" : "Verify Your Mobile Number"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {isEmail
            ? "We've emailed a 6-digit code to your registered email address."
            : "We've sent a 6-digit OTP to your registered mobile number."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold text-foreground">{displayIdentifier}</span>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover transition-colors cursor-pointer"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>

      {isSending && (
        <p className="text-center text-[11px] font-semibold text-brand">
          Sending a fresh code…
        </p>
      )}

      <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={() => setActiveIndex(i)}
            className={`w-11 h-12 sm:w-12 text-center text-lg font-bold text-foreground rounded-lg border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand/60 ${
              i === activeIndex ? "border-brand" : "border-border hover:border-subtle-foreground"
            }`}
          />
        ))}
      </div>

      {errorMessage && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-danger-fg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={() => complete && onVerify(otp.join(""))}
        disabled={!complete || isVerifying}
        className="w-full py-3 px-6 rounded-lg text-xs sm:text-sm font-bold text-on-brand bg-brand hover:bg-brand-hover active:bg-brand-muted transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <span>Verify OTP</span>
        )}
      </button>

      <div className="text-center text-xs text-muted-foreground">
        Didn't receive the code?{" "}
        {secondsLeft > 0 ? (
          <span>Resend in 0:{String(secondsLeft).padStart(2, "0")}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="inline-flex items-center gap-1 font-bold text-brand hover:text-brand-hover cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Resend OTP
          </button>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
        By verifying, you agree to Kaundinya Consultancy's terms and privacy policy.
      </p>
    </div>
  );
}
