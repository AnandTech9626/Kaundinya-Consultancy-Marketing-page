import { createApiClient } from "@kaundinya/api-client";
import { clearSession, readToken } from "./session";

const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export const api = createApiClient({
  baseUrl,
  getToken: readToken,
  onUnauthorized: () => {
    clearSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  },
});

export { ApiError } from "@kaundinya/api-client";
export type { ApiClient } from "@kaundinya/api-client";
