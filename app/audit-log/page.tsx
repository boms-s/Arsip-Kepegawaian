"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Badge from "@/components/ui/Badge";
import { ContentCard, EmptyState } from "@/components/ui/States";
import Pagination from "@/components/ui/Pagination";
import type { AuditAction, AuditLogEntry } from "@/types/audit-log";

const PAGE_SIZE = 8;
type Filters = { from: string; to: string; user: string; module: string; action: string };
const EMPTY_FILTERS: Filters = { from: "", to: "", user: "", module: "", action: "" };

function formatTimestamp(value: string) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function actionVariant(action: AuditAction) {
  if (action === "CREATE") return "success" as const;
  if (action === "DOWNLOAD") return "purple" as const;
  if (action === "DELETE") return "danger" as const;
  return "default" as const;
}

export default function AuditLogPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const queryString = useMemo(() => {
    const query = new URLSearchParams({ page: String(page) });
    Object.entries(appliedFilters).forEach(([key, value]) => { if (value) query.set(key, value); });
    return query.toString();
  }, [page, appliedFilters]);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/audit-logs?${queryString}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { logs?: AuditLogEntry[]; total?: number; users?: string[]; modules?: string[]; actions?: AuditAction[]; message?: string };
        if (!response.ok) throw new Error(result.message ?? "Log aktivitas tidak dapat dimuat.");
        return result;
      })
      .then((result) => {
        if (!isMounted) return;
        setLogs(result.logs ?? []);
        setTotal(result.total ?? 0);
        setUsers(result.users ?? []);
        setModules(result.modules ?? []);
        setActions(result.actions ?? []);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : "Log aktivitas tidak dapat dimuat.");
      })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [queryString]);

  function changeFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (JSON.stringify(filters) !== JSON.stringify(appliedFilters)) setLoading(true);
    setPage(1);
    setAppliedFilters(filters);
  }

  function resetFilters() {
    if (JSON.stringify(appliedFilters) !== JSON.stringify(EMPTY_FILTERS)) setLoading(true);
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function changePage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  return (
    <PageContainer
      title="Audit Log Aktivitas Sistem"
      breadcrumb={[{ label: "ARSIP KKP", href: "/dashboard" }, { label: "Audit Log" }]}
    >
      <div className="audit-log-page">
        <ContentCard padded={false}>
          <div className="audit-filter-heading">Filter Log Aktivitas</div>
          <form className="audit-filter-form" onSubmit={applyFilters}>
            <div className="audit-date-range" aria-label="Pilih Rentang Tanggal">
              <input aria-label="Tanggal mulai" className="form-input" type="date" value={filters.from} onChange={(event) => changeFilter("from", event.target.value)} />
              <span aria-hidden="true">-</span>
              <input aria-label="Tanggal akhir" className="form-input" type="date" value={filters.to} onChange={(event) => changeFilter("to", event.target.value)} />
            </div>
            <label className="sr-only" htmlFor="audit-user-filter">Semua User</label>
            <select className="form-select" id="audit-user-filter" value={filters.user} onChange={(event) => changeFilter("user", event.target.value)}>
              <option value="">Semua User</option>{users.map((user) => <option key={user} value={user}>{user}</option>)}
            </select>
            <label className="sr-only" htmlFor="audit-module-filter">Pilih Modul</label>
            <select className="form-select" id="audit-module-filter" value={filters.module} onChange={(event) => changeFilter("module", event.target.value)}>
              <option value="">Pilih Modul</option>{modules.map((module) => <option key={module} value={module}>{module}</option>)}
            </select>
            <label className="sr-only" htmlFor="audit-action-filter">Jenis Aksi</label>
            <select className="form-select" id="audit-action-filter" value={filters.action} onChange={(event) => changeFilter("action", event.target.value)}>
              <option value="">Jenis Aksi</option>{actions.map((action) => <option key={action} value={action}>{action}</option>)}
            </select>
            <button className="btn btn-primary audit-search-button" type="submit">Saring</button>
            <button className="archive-reset-button" type="button" onClick={resetFilters}>Reset</button>
          </form>
        </ContentCard>

        <ContentCard padded={false}>
          {error ? <div className="audit-log-error" role="alert">{error}</div> : loading ? <div className="users-loading">Memuat log aktivitas...</div> : logs.length === 0 ? <EmptyState icon="shield-check" title="Log tidak ditemukan." message="Ubah filter untuk melihat aktivitas lainnya." /> : (
            <div className="table-wrapper">
              <table className="table audit-log-table">
                <thead><tr><th>No</th><th>Waktu</th><th>Pengguna</th><th>Modul</th><th>Aksi</th><th>Keterangan</th><th>IP Address</th></tr></thead>
                <tbody>
                  {logs.map((entry, index) => (
                    <tr key={entry.id}>
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="audit-log-time">{formatTimestamp(entry.timestamp)}</td>
                      <td className="audit-log-user">{entry.user}</td>
                      <td>{entry.module}</td>
                      <td><Badge variant={actionVariant(entry.action)} className="audit-action-badge">{entry.action}</Badge></td>
                      <td className="audit-log-description">{entry.description}</td>
                      <td className="audit-log-ip">{entry.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="audit-log-footer">
            <span>Menampilkan {total ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, total)} dari {total.toLocaleString("id-ID")} Log</span>
            <Pagination currentPage={page} pageCount={pageCount} onPageChange={changePage} />
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}
