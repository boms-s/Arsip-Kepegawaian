"use client";

import type { AuditLogInput } from "@/types/audit-log";

export async function logActivity(input: AuditLogInput): Promise<void> {
  await fetch("/api/audit-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => undefined);
}