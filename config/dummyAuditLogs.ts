import type { AuditLogEntry } from "@/types/audit-log";

export const DUMMY_AUDIT_LOGS: AuditLogEntry[] = [
  { id: "log-001", timestamp: "2026-02-14T03:20:11.000Z", user: "Hendra Wijaya", module: "Arsip", action: "CREATE", description: "Mengunggah SK Mutasi Kerja ARS/2026/002", ipAddress: "192.168.1.45" },
  { id: "log-002", timestamp: "2026-02-14T02:15:32.000Z", user: "Siti Aminah", module: "Pegawai", action: "UPDATE", description: "Mengubah nomor telepon PNS Budi Santoso", ipAddress: "192.168.1.12" },
  { id: "log-003", timestamp: "2026-02-14T01:02:15.000Z", user: "Siti Aminah", module: "User", action: "LOGIN", description: "Sesi login berhasil ke sistem utama", ipAddress: "192.168.1.12" },
  { id: "log-004", timestamp: "2026-02-13T09:45:00.000Z", user: "Agus Setiawan", module: "Arsip", action: "DOWNLOAD", description: "Mengunduh file PDF Ijazah Pendidikan dr. Linda", ipAddress: "10.0.2.14" },
  { id: "log-005", timestamp: "2026-02-13T07:10:02.000Z", user: "Hendra Wijaya", module: "Master Data", action: "DELETE", description: "Menghapus Kategori tidak terpakai KAT-TEMP", ipAddress: "192.168.1.45" },
  { id: "log-006", timestamp: "2026-02-13T04:32:44.000Z", user: "Agus Setiawan", module: "Arsip", action: "UPDATE", description: "Melakukan perbaikan metadata SK Resmi Kehormatan", ipAddress: "10.0.2.14" },
  { id: "log-007", timestamp: "2026-02-13T03:15:10.000Z", user: "Siti Aminah", module: "Pegawai", action: "CREATE", description: "Menambah data kontrak PPPK baru dr. Linda", ipAddress: "192.168.1.12" },
  { id: "log-008", timestamp: "2026-02-12T10:01:05.000Z", user: "Hendra Wijaya", module: "User", action: "UPDATE", description: "Mengubah status user Dra. Endang ke Nonaktif", ipAddress: "192.168.1.45" },
];