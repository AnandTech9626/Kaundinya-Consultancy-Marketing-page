import { createApiClient } from "@kaundinya/api-client";
import { clearAdminSession, readAdminToken } from "./session";

const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export const api = createApiClient({
  baseUrl,
  getToken: readAdminToken,
  onUnauthorized: () => {
    clearAdminSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  },
});

export { ApiError } from "@kaundinya/api-client";
