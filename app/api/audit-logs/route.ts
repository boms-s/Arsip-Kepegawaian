import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE, verifySessionToken } from "@/config/authSession";
import { AUDIT_ACTIONS, AUDIT_MODULES, getAuditLogStore, isAuditAction, recordAuditLog } from "@/config/auditLogStore";
import { getSystemAdminSession } from "@/config/requireSystemAdmin";

const PAGE_SIZE = 8;

export async function GET(request: Request) {
  if (!await getSystemAdminSession()) return Response.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const user = params.get("user") ?? "";
  const moduleName = params.get("module") ?? "";
  const action = params.get("action") ?? "";
  const filtered = getAuditLogStore().entries
    .filter((entry) => (!from || entry.timestamp.slice(0, 10) >= from)
      && (!to || entry.timestamp.slice(0, 10) <= to)
      && (!user || entry.user === user)
      && (!moduleName || entry.module === moduleName)
      && (!action || entry.action === action))
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp));
  const start = (page - 1) * PAGE_SIZE;
  return Response.json({
    logs: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    users: [...new Set(getAuditLogStore().entries.map((entry) => entry.user))].sort(),
    modules: AUDIT_MODULES,
    actions: AUDIT_ACTIONS,
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
  if (!session) return Response.json({ message: "Sesi tidak valid." }, { status: 401 });
  const body = await request.json().catch(() => null) as { module?: unknown; action?: unknown; description?: unknown } | null;
  if (typeof body?.module !== "string" || !AUDIT_MODULES.includes(body.module) || !isAuditAction(body.action) || typeof body.description !== "string" || !body.description.trim()) {
    return Response.json({ message: "Data aktivitas tidak valid." }, { status: 400 });
  }
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipAddress = forwardedFor || request.headers.get("x-real-ip") || "127.0.0.1";
  const entry = recordAuditLog({ user: session.name, module: body.module, action: body.action, description: body.description.trim(), ipAddress });
  return Response.json({ id: entry.id }, { status: 201 });
}