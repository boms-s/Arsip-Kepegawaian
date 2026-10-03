import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE, verifySessionToken } from "@/config/authSession";

export async function getSystemAdminSession() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
  return session?.role === "ADMIN_SISTEM" ? session : null;
}