import { randomUUID } from "node:crypto";
import { DUMMY_AUDIT_LOGS } from "@/config/dummyAuditLogs";
import type { AuditAction, AuditLogEntry } from "@/types/audit-log";

interface AuditLogStore {
  entries: AuditLogEntry[];
}

const globalAuditStore = globalThis as typeof globalThis & { siarsipAuditLogStore?: AuditLogStore };
const VALID_ACTIONS: AuditAction[] = ["CREATE", "UPDATE", "DELETE", "LOGIN", "DOWNLOAD"];

export const AUDIT_MODULES = ["Arsip", "Pegawai", "Master Data", "User", "Laporan", "Audit Log"];
export const AUDIT_ACTIONS = VALID_ACTIONS;

export function getAuditLogStore() {
  globalAuditStore.siarsipAuditLogStore ??= { entries: structuredClone(DUMMY_AUDIT_LOGS) };
  return globalAuditStore.siarsipAuditLogStore;
}

export function recordAuditLog(input: {
  user: string;
  module: string;
  action: AuditAction;
  description: string;
  ipAddress: string;
}) {
  const entry: AuditLogEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    user: input.user,
    module: input.module,
    action: input.action,
    description: input.description,
    ipAddress: input.ipAddress,
  };
  getAuditLogStore().entries.unshift(entry);
  return entry;
}

export function getRequestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";
}

export function isAuditAction(value: unknown): value is AuditAction {
  return typeof value === "string" && VALID_ACTIONS.includes(value as AuditAction);
}