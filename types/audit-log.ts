export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "DOWNLOAD";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  module: string;
  action: AuditAction;
  description: string;
  ipAddress: string;
}

export interface AuditLogInput {
  module: string;
  action: AuditAction;
  description: string;
}