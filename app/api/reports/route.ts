import { getSystemAdminSession } from "@/config/requireSystemAdmin";
import { getAuditLogStore } from "@/config/auditLogStore";
import { DUMMY_EMPLOYEES } from "@/config/dummyEmployees";
import type { ReportArchive, ReportCategory, ReportFilters, ReportPeriod } from "@/types/report";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function getPeriodRange(filters: ReportFilters): { from: string; to: string; label: string } {
  const year = filters.year;
  if (filters.period === "CUSTOM") {
    const from = filters.from || `${year}-01-01`;
    const to = filters.to || `${year}-12-31`;
    return { from, to, label: `${from} - ${to}` };
  }
  if (filters.period === "MONTH") {
    const month = new Date().getMonth();
    return { from: `${year}-${pad(month + 1)}-01`, to: dateKey(new Date(Date.UTC(year, month + 1, 0))), label: `Bulan ${pad(month + 1)} (${year})` };
  }
  if (filters.period === "QUARTER") {
    const quarter = Math.floor(new Date().getMonth() / 3);
    return { from: `${year}-${pad(quarter * 3 + 1)}-01`, to: dateKey(new Date(Date.UTC(year, quarter * 3 + 3, 0))), label: `Triwulan ${quarter + 1} (${year})` };
  }
  if (filters.period === "SEMESTER_2") return { from: `${year}-07-01`, to: `${year}-12-31`, label: `Semester 2 (${year})` };
  if (filters.period === "YEAR") return { from: `${year}-01-01`, to: `${year}-12-31`, label: `Tahun ${year}` };
  return { from: `${year}-01-01`, to: `${year}-06-30`, label: `Semester 1 (${year})` };
}

function parseFilters(value: unknown): ReportFilters | null {
  if (typeof value !== "object" || value === null) return null;
  const filters = value as Partial<ReportFilters>;
  const periods: ReportPeriod[] = ["MONTH", "QUARTER", "SEMESTER_1", "SEMESTER_2", "YEAR", "CUSTOM"];
  if (!filters.period || !periods.includes(filters.period) || !Number.isInteger(filters.year)) return null;
  return {
    period: filters.period,
    year: filters.year as number,
    categoryId: typeof filters.categoryId === "string" ? filters.categoryId : "",
    unit: typeof filters.unit === "string" ? filters.unit : "",
    from: typeof filters.from === "string" ? filters.from : "",
    to: typeof filters.to === "string" ? filters.to : "",
  };
}

export async function POST(request: Request) {
  if (!await getSystemAdminSession()) return Response.json({ message: "Anda tidak memiliki akses." }, { status: 403 });
  const body = await request.json().catch(() => null) as { filters?: unknown; archives?: unknown; categories?: unknown } | null;
  const filters = parseFilters(body?.filters);
  if (!filters || !Array.isArray(body?.archives) || !Array.isArray(body?.categories)) {
    return Response.json({ message: "Parameter laporan tidak valid." }, { status: 400 });
  }

  const archives = body.archives as ReportArchive[];
  const categories = body.categories as ReportCategory[];
  const range = getPeriodRange(filters);
  const employeeUnit = new Map(DUMMY_EMPLOYEES.map((employee) => [employee.id, employee.department]));
  const selectedArchives = archives.filter((archive) => {
    const date = archive.archivedAt.slice(0, 10);
    return date >= range.from && date <= range.to
      && (!filters.categoryId || archive.categoryId === filters.categoryId)
      && (!filters.unit || employeeUnit.get(archive.employeeId) === filters.unit);
  });
  const categoryRows = categories.map((category) => {
    const categoryArchives = selectedArchives.filter((archive) => archive.categoryId === category.id);
    const active = categoryArchives.filter((archive) => archive.status === "ACTIVE").length;
    const inactive = categoryArchives.length - active;
    return { id: category.id, name: `Kategori ${category.name}`, total: categoryArchives.length, active, inactive, percent: selectedArchives.length ? categoryArchives.length / selectedArchives.length * 100 : 0 };
  }).filter((category) => !filters.categoryId || category.id === filters.categoryId);

  const auditEntries = getAuditLogStore().entries.filter((entry) => {
    const date = entry.timestamp.slice(0, 10);
    const matchesSelectedArchives = !filters.categoryId && !filters.unit
      ? true
      : selectedArchives.some((archive) => entry.description.includes(archive.number));
    return date >= range.from && date <= range.to
      && (entry.module === "Arsip" || entry.module === "Laporan")
      && matchesSelectedArchives;
  });
  const countAction = (action: string) => auditEntries.filter((entry) => entry.action === action && entry.module === "Arsip").length;
  const active = selectedArchives.filter((archive) => archive.status === "ACTIVE").length;

  return Response.json({
    range,
    summary: {
      total: selectedArchives.length,
      newIssued: countAction("CREATE"),
      downloaded: countAction("DOWNLOAD"),
      deleted: countAction("DELETE"),
      active,
      inactive: selectedArchives.length - active,
    },
    categories: categoryRows,
  });
}