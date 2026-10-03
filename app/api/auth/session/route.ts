import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE, createSessionToken, verifySessionToken } from "@/config/authSession";
import { DEVELOPMENT_ACCOUNTS } from "@/config/developmentAccounts";
import { addUserActivity, getUserDatabase, verifyManagedUserPassword } from "@/config/userDatabase";
import { getRequestIp, recordAuditLog } from "@/config/auditLogStore";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null;
  const username = body?.username?.trim().toLocaleLowerCase("id-ID");
  const developmentAccount = DEVELOPMENT_ACCOUNTS.find((candidate) => candidate.username === username && candidate.password === body?.password);
  const managedUser = developmentAccount ? null : getUserDatabase().users.find((user) => user.email.toLocaleLowerCase("id-ID") === username);
  const managedUserIsValid = Boolean(managedUser && managedUser.status === "ACTIVE" && body?.password && verifyManagedUserPassword(body.password, managedUser.passwordHash));
  const user = developmentAccount?.user ?? (managedUserIsValid && managedUser
    ? { id: managedUser.id, name: managedUser.name, role: managedUser.role }
    : null);
  if (!user) return Response.json({ message: "Username atau password tidak sesuai, atau akun tidak aktif." }, { status: 401 });

  const token = createSessionToken(user);
  if (!token) return Response.json({ message: "Sesi server belum dikonfigurasi." }, { status: 503 });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  if (managedUser) {
    managedUser.lastLogin = "Sekarang";
    addUserActivity(managedUser.id, "Login Sistem", "Berhasil masuk ke SIARSIP");
  }
  recordAuditLog({ user: user.name, module: "User", action: "LOGIN", description: "Sesi login berhasil ke sistem utama", ipAddress: getRequestIp(request) });
  return Response.json({ user });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE);
  return Response.json({ ok: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const user = verifySessionToken(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user });
}