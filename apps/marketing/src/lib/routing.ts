export function getAppUrl(): string {
  const raw =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.PUBLIC_APP_URL as string | undefined)
      : undefined;
  return (raw || "http://localhost:5173").replace(/\/$/, "");
}

/**
 * Hand the user off to the main app's OTP screen with the email they submitted.
 * The app sends the email OTP itself and takes over from there.
 */
export function redirectToAppOtp(email: string) {
  const clean = email.trim().toLowerCase();
  window.location.href = `${getAppUrl()}/login?email=${encodeURIComponent(
    clean,
  )}&step=otp`;
}
