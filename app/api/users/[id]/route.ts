import { getSystemAdminSession } from "@/config/requireSystemAdmin";
import { addUserActivity, getUserDatabase, isValidEmail, parseRole, parseStatus, permissionsForRole, publicUser } from "@/config/userDatabase";
import { getRequestIp, recordAuditLog } from "@/config/auditLogStore";

export async function GET(_request: Request, { params }: RouteContext<"/api/users/[id]">) {
  if (!await getSystemAdminSession()) return Response.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  const { id } = await params;
  const database = getUserDatabase();
  const user = database.users.find((item) => item.id === id);
  if (!user) return Response.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  const activities = database.activities.filter((item) => item.userId === id).slice(0, 20);
  return Response.json({ user: publicUser(user), activities });
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/users/[id]">) {
  const session = await getSystemAdminSession();
  if (!session) return Response.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  const { id } = await params;
  const database = getUserDatabase();
  const user = database.users.find((item) => item.id === id);
  if (!user) return Response.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLocaleLowerCase("id-ID") : "";
  const role = parseRole(body?.role);
  const status = parseStatus(body?.status);
  if (!name || !email || !isValidEmail(email) || !role || !status) {
    return Response.json({ message: "Nama, email valid, role, dan status wajib diisi." }, { status: 400 });
  }
  if (database.users.some((item) => item.id !== id && item.email.toLocaleLowerCase("id-ID") === email)) {
    return Response.json({ message: "Email sudah digunakan." }, { status: 409 });
  }
  if (id === session.id && (role !== "ADMIN_SISTEM" || status !== "ACTIVE")) {
    return Response.json({ message: "Anda tidak dapat menurunkan role atau menonaktifkan akun sendiri." }, { status: 403 });
  }
  const removesActiveAdmin = user.role === "ADMIN_SISTEM" && user.status === "ACTIVE" && (role !== "ADMIN_SISTEM" || status !== "ACTIVE");
  const activeAdminCount = database.users.filter((item) => item.role === "ADMIN_SISTEM" && item.status === "ACTIVE").length;
  if (removesActiveAdmin && activeAdminCount <= 1) {
    return Response.json({ message: "Sistem harus memiliki minimal satu Admin Sistem aktif." }, { status: 409 });
  }

  user.name = name;
  user.email = email;
  user.role = role;
  user.status = status;
  user.permissions = permissionsForRole(role);
  addUserActivity(user.id, "Edit Data Pengguna", `Informasi akun diperbarui oleh ${session.name}`);
  recordAuditLog({ user: session.name, module: "User", action: "UPDATE", description: `Memperbarui data pengguna ${user.name}`, ipAddress: getRequestIp(request) });
  return Response.json({ user: publicUser(user) });
}

export async function DELETE(request: Request, { params }: RouteContext<"/api/users/[id]">) {
  const session = await getSystemAdminSession();
  if (!session) return Response.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  const { id } = await params;
  const database = getUserDatabase();
  const user = database.users.find((item) => item.id === id);
  if (!user) return Response.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  if (id === session.id) return Response.json({ message: "Anda tidak dapat menghapus akun sendiri." }, { status: 403 });
  const activeAdminCount = database.users.filter((item) => item.role === "ADMIN_SISTEM" && item.status === "ACTIVE").length;
  if (user.role === "ADMIN_SISTEM" && user.status === "ACTIVE" && activeAdminCount <= 1) {
    return Response.json({ message: "Sistem harus memiliki minimal satu Admin Sistem aktif." }, { status: 409 });
  }
  database.users = database.users.filter((item) => item.id !== id);
  addUserActivity(id, "Hapus User", `Akun dihapus oleh ${session.name}`);
  recordAuditLog({ user: session.name, module: "User", action: "DELETE", description: `Menghapus akun pengguna ${user.name}`, ipAddress: getRequestIp(request) });
  return Response.json({ ok: true });
}