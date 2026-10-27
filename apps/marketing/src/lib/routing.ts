export function getAppUrl(): string {
  const raw =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.PUBLIC_APP_URL as string | undefined)
      : undefined;
  return (raw || "http://localhost:5173").replace(/\/$/, "");
}

/**
 * Hand the user off to the main app's OTP screen. Only the mobile number is
 * carried across; the rest of the enquiry is posted to the backend later.
 */
export function redirectToAppOtp(mobile: string) {
  const clean = mobile.replace(/\D/g, "");
  window.location.href = `${getAppUrl()}/login?mobile=${encodeURIComponent(clean)}&step=otp`;
}
