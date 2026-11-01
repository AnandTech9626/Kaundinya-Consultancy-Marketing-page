import type { Context, Next } from "hono";
import { verifyToken, type TokenPayload } from "../services/jwt.js";
import { errorResponse } from "../utils/response.js";

declare module "hono" {
  interface ContextVariableMap {
    user: TokenPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(c, "Authentication required.", 401);
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifyToken(token);

  if (!payload) {
    return errorResponse(c, "Invalid or expired token.", 401);
  }

  c.set("user", payload);
  await next();
}

export async function adminAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(c, "Authentication required.", 401);
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifyToken(token);

  if (!payload) {
    return errorResponse(c, "Invalid or expired token.", 401);
  }

  if (payload.role !== "admin" && payload.role !== "agent") {
    return errorResponse(c, "You do not have access.", 403);
  }

  c.set("user", payload);
  await next();
}
