import type { ArchiveStatus } from "@/config/archiveStore";

export type ReportPeriod = "MONTH" | "QUARTER" | "SEMESTER_1" | "SEMESTER_2" | "YEAR" | "CUSTOM";

export interface ReportFilters {
  period: ReportPeriod;
  year: number;
  categoryId: string;
  unit: string;
  from: string;
  to: string;
}

export interface ReportArchive {
  id: string;
  number: string;
  categoryId: string;
  employeeId: string;
  archivedAt: string;
  status: ArchiveStatus;
}

export interface ReportCategory {
  id: string;
  name: string;
}

export interface ReportResponse {
  range: { from: string; to: string; label: string };
  summary: { total: number; newIssued: number; downloaded: number; deleted: number; active: number; inactive: number };
  categories: { id: string; name: string; total: number; active: number; inactive: number; percent: number }[];
}