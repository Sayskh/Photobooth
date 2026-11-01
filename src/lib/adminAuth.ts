import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_auth_token";
const DEFAULT_SECRET = "photobooth-kiosk-insecure-secret-key-change-me";

function getSecretKey(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PIN;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[SECURITY WARNING] ADMIN_SESSION_SECRET or ADMIN_PIN is not configured in production! Using fallback secret."
      );
    }
    return DEFAULT_SECRET;
  }
  return secret;
}

/**
 * Creates an HMAC SHA-256 signed token.
 * Format: base64(payload).signature
 */
export function createAdminToken(payload: { role: string; iat: number; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verifies the HMAC signature and expiration of an admin token.
 */
export function verifyAdminToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(data)
    .digest("base64url");

  // Constant-time comparison
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Helper to authenticate admin requests via cookie or Authorization header.
 * Returns null if valid, or a 401 NextResponse if unauthenticated.
 */
export async function requireAdminAuth(req?: Request): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  let token = cookieToken;
  if (!token && req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json(
      { success: false, message: "Akses ditolak. Sesi admin tidak valid atau kedaluwarsa." },
      { status: 401 }
    );
  }

  return null;
}
