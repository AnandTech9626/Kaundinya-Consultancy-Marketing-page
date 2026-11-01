import type { Context } from "hono";

export function successResponse<T>(
  c: Context,
  data: T,
  message?: string,
  status: 200 | 201 = 200
) {
  return c.json(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    status
  );
}

export function errorResponse(
  c: Context,
  message: string,
  statusCode: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 = 400,
  errors?: Record<string, string>
) {
  return c.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    statusCode
  );
}
