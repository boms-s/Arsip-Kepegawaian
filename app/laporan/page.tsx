"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import { ContentCard, EmptyState } from "@/components/ui/States";
import { useArchiveDatabase } from "@/config/archiveStore";
import { useMasterData } from "@/config/masterDataStore";
import { DUMMY_EMPLOYEES } from "@/config/dummyEmployees";
import { logActivity } from "@/config/auditLogger";
import type { ReportFilters, ReportPeriod, ReportResponse } from "@/types/report";

const CURRENT_YEAR = new Date().getFullYear();
const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "MONTH", label: "Bulan ini" },
  { value: "QUARTER", label: "Triwulan" },
  { value: "SEMESTER_1", label: `Semester 1 (${CURRENT_YEAR})` },
  { value: "SEMESTER_2", label: `Semester 2 (${CURRENT_YEAR})` },
  { value: "YEAR", label: "Tahun ini" },
  { value: "CUSTOM", label: "Kustom rentang tanggal" },
];
const DONUT_COLORS = ["#1d4ed8", "#10b981"];

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

export default function LaporanPage() {
  const database = useArchiveDatabase();
  const masterData = useMasterData();
  const [filters, setFilters] = useState<ReportFilters>({ period: "SEMESTER_1", year: CURRENT_YEAR, categoryId: "", unit: "", from: "", to: "" });
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({ period: "SEMESTER_1", year: CURRENT_YEAR, categoryId: "", unit: "", from: "", to: "" });
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const archiveSnapshot = JSON.stringify(database.records.map(({ id, number, categoryId, employeeId, archivedAt, status }) => ({ id, number, categoryId, employeeId, archivedAt, status })));
  const categorySnapshot = JSON.stringify(masterData.categories.map(({ id, name }) => ({ id, name })));
  const unitOptions = useMemo(() => [...new Set(DUMMY_EMPLOYEES.map((employee) => employee.department))].sort(), []);
  const activePercent = report?.summary.total ? report.summary.active / report.summary.total * 100 : 0;
  const statusData = report ? [
    { name: `Aktif (${Math.round(activePercent)}%)`, value: report.summary.active },
    { name: `Pensiun / Nonaktif (${Math.round(100 - activePercent)}%)`, value: report.summary.inactive },
  ] : [];

  useEffect(() => {
    let isMounted = true;
    fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters: appliedFilters, archives: JSON.parse(archiveSnapshot), categories: JSON.parse(categorySnapshot) }),
    })
      .then(async (response) => {
        const result = await response.json() as ReportResponse & { message?: string };
        if (!response.ok) throw new Error(result.message ?? "Laporan tidak dapat dibuat.");
        return result;
      })
      .then((result) => { if (isMounted) { setReport(result); setError(""); } })
      .catch((requestError: unknown) => { if (isMounted) setError(requestError instanceof Error ? requestError.message : "Laporan tidak dapat dibuat."); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [appliedFilters, archiveSnapshot, categorySnapshot]);

  function generateReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filters.period === "CUSTOM" && (!filters.from || !filters.to)) {
      setError("Pilih tanggal awal dan tanggal akhir untuk rentang kustom.");
      return;
    }
    setError("");
    setLoading(true);
    setAppliedFilters({ ...filters });
  }

  async function exportReport(format: "pdf" | "excel") {
    if (!report) return;
    setExporting(format);
    try {
      const summaryRows = [
        ["Total Arsip Periode", report.summary.total],
        ["Arsip Baru Terbit", report.summary.newIssued],
        ["Arsip Diunduh", report.summary.downloaded],
        ["Arsip Dihapus (Log)", report.summary.deleted],
      ];
      const tableRows = report.categories.map((row) => [row.name, row.total, row.active, row.inactive, `${row.percent.toFixed(1)}%`]);
      if (format === "pdf") {
        const document = new jsPDF();
        document.setFontSize(16);
        document.text("Laporan Statistik Dokumen & Arsip", 14, 18);
        document.setFontSize(10);
        document.text(`Periode: ${report.range.label}`, 14, 26);
        autoTable(document, { startY: 33, head: [["Ringkasan", "Jumlah"]], body: summaryRows.map((row) => [row[0], formatNumber(Number(row[1]))]) });
        const nextY = (document as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80;
        autoTable(document, { startY: nextY + 8, head: [["Kategori Laporan", "Jumlah Arsip", "Arsip Aktif", "Arsip Nonaktif", "Persentase"]], body: tableRows });
        document.save("laporan-statistik-arsip.pdf");
      } else {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Laporan Arsip");
        worksheet.addRow(["Laporan Statistik Dokumen & Arsip", report.range.label]);
        worksheet.addRow([]);
        worksheet.addRow(["Ringkasan", "Jumlah"]);
        summaryRows.forEach(([label, value]) => worksheet.addRow([label, Number(value)]));
        worksheet.addRow([]);
        worksheet.addRow(["Kategori Laporan", "Jumlah Arsip", "Arsip Aktif", "Arsip Nonaktif", "Persentase"]);
        tableRows.forEach((row) => worksheet.addRow(row));
        worksheet.columns = [{ width: 42 }, { width: 16 }, { width: 16 }, { width: 18 }, { width: 15 }];
        const buffer = await workbook.xlsx.writeBuffer();
        const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "laporan-statistik-arsip.xlsx";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      await logActivity({ module: "Laporan", action: "DOWNLOAD", description: `Mengekspor laporan statistik ${report.range.label} ke ${format.toUpperCase()}` });
    } catch {
      setError("File laporan gagal dibuat. Silakan coba lagi.");
    } finally {
      setExporting(null);
    }
  }

  const tableTotal = report?.categories.reduce((sum, row) => sum + row.total, 0) ?? 0;
  const tableActive = report?.categories.reduce((sum, row) => sum + row.active, 0) ?? 0;
  const tableInactive = report?.categories.reduce((sum, row) => sum + row.inactive, 0) ?? 0;

  return (
    <PageContainer
      title="Laporan Statistik Dokumen & Arsip"
      breadcrumb={[{ label: "ARSIP KKP", href: "/dashboard" }, { label: "Laporan" }]}
    >
      <div className="report-page">
        <ContentCard padded={false}>
          <div className="report-filter-heading">Rentang Pencatatan Laporan</div>
          <form className="report-filter-form" onSubmit={generateReport}>
            <label className="sr-only" htmlFor="report-period">Periode pencatatan</label>
            <select className="form-select" id="report-period" value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value as ReportPeriod }))}>
              {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.value === filters.period ? `Periode: ${option.label}` : option.label}</option>)}
            </select>
            <label className="sr-only" htmlFor="report-category">Semua Kategori</label>
            <select className="form-select" id="report-category" value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}>
              <option value="">Semua Kategori</option>{masterData.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="report-unit">Semua Unit Kerja</label>
            <select className="form-select" id="report-unit" value={filters.unit} onChange={(event) => setFilters((current) => ({ ...current, unit: event.target.value }))}>
              <option value="">Semua Unit Kerja</option>{unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
            {filters.period === "CUSTOM" && <div className="report-custom-range"><input className="form-input" aria-label="Tanggal mulai laporan" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} /><span>-</span><input className="form-input" aria-label="Tanggal akhir laporan" type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} /></div>}
            <button className="btn btn-primary report-generate-button" type="submit" disabled={loading}><Icon name="chart-bar" size={14} />{loading ? "Memuat..." : "Generate Laporan"}</button>
          </form>
        </ContentCard>

        {error && <div className="report-error" role="alert">{error}</div>}
        {loading && !report ? <div className="report-summary-grid">{Array.from({ length: 4 }, (_, index) => <div className="report-skeleton" key={index} />)}</div> : report && (
          <>
            <section className="report-summary-grid" aria-label="Ringkasan laporan">
              {[
                { label: "TOTAL ARSIP PERIODE", value: report.summary.total, sub: "Dokumen terbit", icon: "archive", color: "report-icon-blue" },
                { label: "ARSIP BARU TERBIT", value: report.summary.newIssued, sub: "Terverifikasi otomatis", icon: "file-plus", color: "report-icon-green" },
                { label: "ARSIP DIUNDUH", value: report.summary.downloaded, sub: "Sesi verifikasi", icon: "download", color: "report-icon-blue" },
                { label: "ARSIP DIHAPUS (LOG)", value: report.summary.deleted, sub: "Aksi penghapusan resmi", icon: "trash-2", color: "report-icon-red" },
              ].map((item) => (
                <article className="report-summary-card" key={item.label}>
                  <div className={`report-summary-icon ${item.color}`}><Icon name={item.icon} size={18} /></div>
                  <div><p>{item.label}</p><strong>{formatNumber(item.value)}</strong><span>{item.sub}</span></div>
                </article>
              ))}
            </section>

            <section className="report-charts-grid">
              <ContentCard padded={false} className="report-chart-card">
                <h2>Arsip per Kategori</h2>
                {report.categories.length && report.summary.total ? (
                  <ResponsiveContainer width="100%" height={188}>
                    <BarChart data={report.categories} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9 }} />
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), "Jumlah Arsip"]} />
                      <Bar dataKey="total" fill="#1d4ed8" radius={[3, 3, 0, 0]} maxBarSize={54} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="report-chart-empty">Tidak ada data kategori untuk periode ini.</div>}
              </ContentCard>
              <ContentCard padded={false} className="report-chart-card">
                <h2>Distribusi Status Arsip</h2>
                {report.summary.total ? (
                  <ResponsiveContainer width="100%" height={188}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="38%" cy="50%" innerRadius={40} outerRadius={63} paddingAngle={2}>
                        {statusData.map((entry, index) => <Cell key={entry.name} fill={DONUT_COLORS[index]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), "Arsip"]} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 9, right: 0 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="report-chart-empty">Tidak ada data status untuk periode ini.</div>}
              </ContentCard>
            </section>

            {report.summary.total === 0 && <EmptyState icon="file-text" title="Tidak ada arsip pada periode ini." message="Ubah rentang pencatatan, kategori, atau unit kerja lalu generate kembali." />}
            <ContentCard padded={false}>
              <div className="report-table-heading">Detail Jumlah Arsip Rekapitulasi <span>{report.range.label}</span></div>
              <div className="table-wrapper">
                <table className="table report-table">
                  <thead><tr><th>No</th><th>Kategori Laporan</th><th>Jumlah Arsip</th><th>Arsip Aktif</th><th>Arsip Nonaktif</th><th>Persentase</th></tr></thead>
                  <tbody>
                    {report.categories.map((row, index) => (
                      <tr key={row.id}><td>{index + 1}</td><td className="report-category-name">{row.name}</td><td>{formatNumber(row.total)}</td><td className="report-active-count">{formatNumber(row.active)}</td><td>{formatNumber(row.inactive)}</td><td className="report-percent">{row.percent.toFixed(1)}%</td></tr>
                    ))}
                  </tbody>
                  <tfoot><tr><th colSpan={2}>Total</th><th>{formatNumber(tableTotal)}</th><th>{formatNumber(tableActive)}</th><th>{formatNumber(tableInactive)}</th><th>{report.summary.total ? "100.0%" : "0.0%"}</th></tr></tfoot>
                </table>
              </div>
            </ContentCard>

            <div className="report-export-actions">
              <button className="btn btn-secondary" type="button" onClick={() => void exportReport("pdf")} disabled={exporting !== null}><Icon name="download" size={13} />{exporting === "pdf" ? "Menyiapkan PDF..." : "Export PDF"}</button>
              <button className="btn btn-secondary" type="button" onClick={() => void exportReport("excel")} disabled={exporting !== null}><Icon name="download" size={13} />{exporting === "excel" ? "Menyiapkan Excel..." : "Export Excel"}</button>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
