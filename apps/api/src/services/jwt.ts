import { SignJWT, jwtVerify } from "jose";
import { config } from "../config.js";

const secretKey = new TextEncoder().encode(config.jwtSecret);

export interface TokenPayload {
  mobile: string;
  name: string;
  role: "client" | "admin" | "agent";
  email?: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // 30 days session
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
