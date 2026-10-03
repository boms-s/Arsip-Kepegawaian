import { createHmac, timingSafeEqual } from "node:crypto";
import type { CurrentUser, UserRole } from "@/types/auth";

export const AUTH_SESSION_COOKIE = "siarsip_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

interface SessionPayload {
  sub: string;
  name: string;
  role: UserRole;
  exp: number;
}

function getSecret() {
  return process.env.AUTH_SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "siarsip-development-session-secret-change-before-production" : "");
}

export function createSessionToken(user: CurrentUser) {
  const secret = getSecret();
  if (!secret) return null;
  const payload: SessionPayload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string): CurrentUser | null {
  const secret = getSecret();
  if (!token || !secret) return null;
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return null;

  const expectedSignature = createHmac("sha256", secret).update(encodedPayload).digest();
  const providedSignature = Buffer.from(encodedSignature, "base64url");
  if (providedSignature.length !== expectedSignature.length || !timingSafeEqual(providedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "ADMIN_SISTEM" && payload.role !== "ADMIN_KEPEGAWAIAN" && payload.role !== "PEGAWAI") return null;
    return { id: payload.sub, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}