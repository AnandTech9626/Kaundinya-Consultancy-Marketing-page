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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  isBackendConfigured: boolean;
}

/**
 * Submit an enquiry to the configured backend API endpoint.
 * If PUBLIC_API_BASE_URL is not set or network fails, returns a truthful status
 * with alternative phone contact options.
 */
export async function submitEnquiry(payload: EnquiryPayload): Promise<ApiResponse> {
  const apiBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_API_BASE_URL : '';

  if (!apiBaseUrl) {
    return {
      success: false,
      isBackendConfigured: false,
      message: "The online submission server is currently being connected. Please try again shortly or reach out through the enquiry form."
    };
  }

  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        isBackendConfigured: true,
        message: errorData.message || `Server responded with status ${response.status}. Please call our team directly.`
      };
    }

    const data = await response.json();
    return {
      success: true,
      isBackendConfigured: true,
      message: "Your inquiry has been received. Our team will contact you shortly.",
      data
    };
  } catch (err: any) {
    return {
      success: false,
      isBackendConfigured: true,
      message: "Unable to reach the server. Please try again shortly."
    };
  }
}
