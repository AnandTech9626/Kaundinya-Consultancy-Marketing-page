export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  apiPath?: string;
  getToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
  fetchImpl?: typeof fetch;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

function buildUrl(
  baseUrl: string,
  apiPath: string,
  path: string,
  query?: Record<string, QueryValue>
): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const prefix = apiPath ? `/${apiPath.replace(/^\/+|\/+$/g, "")}` : "";
  const suffix = cleanPath === "/" ? "" : cleanPath;
  const url = `${baseUrl}${prefix}${suffix}`;

  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const apiPath = options.apiPath ?? "/api";
  const fetchImpl = options.fetchImpl ?? fetch;

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    requestOptions: RequestOptions = {}
  ): Promise<T> {
    const url = buildUrl(baseUrl, apiPath, path, requestOptions.query);

    const headers: Record<string, string> = { Accept: "application/json" };
    const token = options.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: requestOptions.signal,
      });
    } catch {
      throw new ApiError(
        0,
        "Unable to reach the server. Check your connection and try again."
      );
    }

    if (response.status === 401) options.onUnauthorized?.();

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    let payload: Envelope<T> | null = null;
    if (text) {
      try {
        payload = JSON.parse(text) as Envelope<T>;
      } catch {
        payload = null;
      }
    }

    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        response.status,
        payload?.message || `Request failed (${response.status})`,
        payload?.errors
      );
    }

    return (payload ? payload.data : undefined) as T;
  }

  return {
    get: <T>(path: string, requestOptions?: RequestOptions) =>
      request<T>("GET", path, undefined, requestOptions),
    post: <T>(path: string, body?: unknown, requestOptions?: RequestOptions) =>
      request<T>("POST", path, body, requestOptions),
    patch: <T>(path: string, body?: unknown, requestOptions?: RequestOptions) =>
      request<T>("PATCH", path, body, requestOptions),
    delete: <T>(path: string, requestOptions?: RequestOptions) =>
      request<T>("DELETE", path, undefined, requestOptions),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
