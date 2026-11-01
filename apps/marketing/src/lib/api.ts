export interface EnquiryPayload {
  fullName: string;
  email: string;
  mobile: string;
  serviceCategory: string;
  specificService?: string;
  pinCode?: string;
  comments?: string;
  consent: boolean;
}

export interface OtpSendData {
  expiresInSeconds: number;
  devOtp?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  isBackendConfigured: boolean;
  status?: number;
  errors?: Record<string, string>;
}

function getApiBaseUrl(): string {
  const raw =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.PUBLIC_API_BASE_URL
      : "";
  return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
}

async function postJson<T>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return {
      success: false,
      isBackendConfigured: false,
      message:
        "The online submission server is currently being connected. Please try again shortly or reach out through the enquiry form.",
    };
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          success?: boolean;
          message?: string;
          data?: T;
          errors?: Record<string, string>;
        }
      | null;

    if (!response.ok || !payload?.success) {
      return {
        success: false,
        isBackendConfigured: true,
        status: response.status,
        message:
          payload?.message ||
          `Server responded with status ${response.status}. Please call our team directly.`,
        errors: payload?.errors,
      };
    }

    return {
      success: true,
      isBackendConfigured: true,
      status: response.status,
      message: payload.message || "OK",
      data: payload.data,
    };
  } catch {
    return {
      success: false,
      isBackendConfigured: true,
      message: "Unable to reach the server. Please try again shortly.",
    };
  }
}

export function submitEnquiry(
  payload: EnquiryPayload,
): Promise<ApiResponse<{ id: string }>> {
  return postJson<{ id: string }>("/api/enquiries", payload);
}

export function sendOtp(mobile: string): Promise<ApiResponse<OtpSendData>> {
  return postJson<OtpSendData>("/api/otp/send", { mobile });
}
