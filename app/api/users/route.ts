import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import { getSystemAdminSession } from "@/config/requireSystemAdmin";
import { addUserActivity, getUserDatabase, isValidEmail, parseRole, parseStatus, permissionsForRole, publicUser } from "@/config/userDatabase";
import { getRequestIp, recordAuditLog } from "@/config/auditLogStore";

export async function GET() {
  if (!await getSystemAdminSession()) return Response.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  return Response.json({ users: getUserDatabase().users.map(publicUser) });
}

export async function POST(request: Request) {
  const session = await getSystemAdminSession();
  if (!session) return Response.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLocaleLowerCase("id-ID") : "";
  const role = parseRole(body?.role);
  const status = parseStatus(body?.status);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!name || !email || !isValidEmail(email) || !role || !status || password.length < 8) {
    return Response.json({ message: "Nama, email valid, role, status, dan password minimal 8 karakter wajib diisi." }, { status: 400 });
  }

  const database = getUserDatabase();
  if (database.users.some((user) => user.email.toLocaleLowerCase("id-ID") === email)) {
    return Response.json({ message: "Email sudah digunakan." }, { status: 409 });
  }
  const salt = randomBytes(16).toString("hex");
  const user = {
    id: randomUUID(), name, email, role, status, lastLogin: "Belum pernah",
    organization: "Badan Kepegawaian Daerah", department: "Seksi Manajemen Kinerja & Arsip Kepegawaian",
    createdAt: new Date().toISOString(), permissions: permissionsForRole(role),
    passwordHash: `${salt}:${scryptSync(password, salt, 64).toString("hex")}`,
  };
  database.users.unshift(user);
  addUserActivity(user.id, "Buat User", `Akun dibuat oleh ${session.name}`);
  recordAuditLog({ user: session.name, module: "User", action: "CREATE", description: `Menambahkan pengguna ${user.name}`, ipAddress: getRequestIp(request) });
  return Response.json({ user: publicUser(user) }, { status: 201 });
}