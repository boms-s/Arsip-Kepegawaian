"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import { ContentCard, EmptyState } from "@/components/ui/States";
import Pagination from "@/components/ui/Pagination";
import { useApp } from "@/contexts/AppContext";
import { useMasterData } from "@/config/masterDataStore";
import { deleteArchiveFile, saveArchiveDatabase, useArchiveDatabase, type ArchiveHistoryEntry, type ArchiveRecord } from "@/config/archiveStore";
import { logActivity } from "@/config/auditLogger";

const PAGE_SIZE = 8;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function ArchiveStatus({ active }: { active: boolean }) {
  return <Badge variant={active ? "success" : "default"}>{active ? "Aktif" : "Tidak Aktif"}</Badge>;
}

export default function ArsipPage() {
  const database = useArchiveDatabase();
  const masterData = useMasterData();
  const { currentUser } = useApp();
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ArchiveRecord | null>(null);

  const availableTypes = masterData.types.filter((type) => !categoryId || type.categoryId === categoryId);
  const filteredRecords = useMemo(() => database.records.filter((record) => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    const date = record.archivedAt.slice(0, 10);
    return (!categoryId || record.categoryId === categoryId)
      && (!typeId || record.typeId === typeId)
      && (!status || record.status === status)
      && (!dateFrom || date >= dateFrom)
      && (!dateTo || date <= dateTo)
      && (!normalizedQuery || `${record.number} ${record.title}`.toLocaleLowerCase("id-ID").includes(normalizedQuery));
  }), [database.records, categoryId, typeId, status, dateFrom, dateTo, query]);
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setCategoryId("");
    setTypeId("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setQuery("");
    setPage(1);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const event: ArchiveHistoryEntry = {
      id: crypto.randomUUID(),
      action: "delete",
      actor: currentUser.name,
      description: `Menghapus arsip ${pendingDelete.number}`,
      timestamp: new Date().toISOString(),
    };
    saveArchiveDatabase({
      records: database.records.filter((record) => record.id !== pendingDelete.id),
      audit: [...database.audit, { ...event, archiveId: pendingDelete.id }],
    });
    void logActivity({ module: "Arsip", action: "DELETE", description: `Menghapus arsip ${pendingDelete.number}` });
    await deleteArchiveFile(pendingDelete.id).catch(() => undefined);
    setPendingDelete(null);
  }

  return (
    <PageContainer
      title="Arsip Dokumen Kepegawaian"
      description="Kelola dan cari seluruh dokumen kepegawaian resmi yang tersimpan."
      breadcrumb={[{ label: "Arsip" }]}
      actions={<Link className="btn btn-primary" href="/arsip/tambah"><Icon name="plus" size={15} />Tambah Arsip Baru</Link>}
    >
      <div className="archive-page-content">
        <ContentCard padded={false}>
          <div className="archive-filter-heading">Filter Pencarian</div>
          <form className="archive-filter-form" onSubmit={(event) => { event.preventDefault(); setPage(1); }}>
            <label className="sr-only" htmlFor="archive-filter-category">Pilih Kategori</label>
            <select className="form-select" id="archive-filter-category" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setTypeId(""); setPage(1); }}>
              <option value="">Pilih Kategori</option>
              {masterData.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="archive-filter-type">Jenis Dokumen</label>
            <select className="form-select" id="archive-filter-type" value={typeId} onChange={(event) => { setTypeId(event.target.value); setPage(1); }}>
              <option value="">Jenis Dokumen</option>
              {availableTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="archive-filter-status">Status</label>
            <select className="form-select" id="archive-filter-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="">Status</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak Aktif</option>
            </select>
            <div className="archive-date-filter" aria-label="Pilih rentang tanggal">
              <input aria-label="Tanggal mulai" className="form-input" type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} />
              <span aria-hidden="true">-</span>
              <input aria-label="Tanggal akhir" className="form-input" type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} />
            </div>
            <label className="sr-only" htmlFor="archive-search">Cari Judul / Nomor Arsip</label>
            <input className="form-input archive-search-input" id="archive-search" placeholder="Cari Judul / Nomor Arsip" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            <button className="btn btn-primary archive-search-button" type="submit">Cari</button>
            <button className="archive-reset-button" type="button" onClick={resetFilters}>Reset</button>
          </form>
        </ContentCard>

        <ContentCard padded={false}>
          {filteredRecords.length === 0 ? (
            <EmptyState icon="search" title="Arsip tidak ditemukan." message="Ubah kata pencarian atau filter untuk melihat arsip lainnya." />
          ) : (
            <div className="table-wrapper">
              <table className="table archive-table">
                <thead><tr><th>No</th><th>Nomor Arsip</th><th>Judul Berkas</th><th>Kategori</th><th>Jenis Dokumen</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {visibleRecords.map((record, index) => (
                    <tr key={record.id}>
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="archive-number"><Link href={`/arsip/${record.id}`}>{record.number}</Link></td>
                      <td className="archive-title-cell">{record.title}</td>
                      <td>{masterData.categories.find((category) => category.id === record.categoryId)?.name ?? "-"}</td>
                      <td>{masterData.types.find((type) => type.id === record.typeId)?.name ?? "-"}</td>
                      <td className="archive-date-cell">{formatDate(record.archivedAt)}</td>
                      <td><ArchiveStatus active={record.status === "ACTIVE"} /></td>
                      <td>
                        <div className="archive-row-actions">
                          <Link className="btn btn-ghost btn-icon btn-sm" href={`/arsip/${record.id}`} title="Lihat detail" aria-label={`Lihat ${record.number}`}><Icon name="eye" size={14} /></Link>
                          <Link className="btn btn-ghost btn-icon btn-sm archive-edit-action" href={`/arsip/${record.id}/edit`} title="Edit arsip" aria-label={`Edit ${record.number}`}><Icon name="edit" size={14} /></Link>
                          <button className="btn btn-ghost btn-icon btn-sm archive-delete-action" type="button" title="Hapus arsip" aria-label={`Hapus ${record.number}`} onClick={() => setPendingDelete(record)}><Icon name="trash-2" size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="archive-table-footer">
            <span>Menampilkan {filteredRecords.length ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, filteredRecords.length)} dari {filteredRecords.length} Arsip</span>
            <Pagination currentPage={page} pageCount={pageCount} onPageChange={setPage} />
          </div>
        </ContentCard>
      </div>

      {pendingDelete && (
        <Modal isOpen onClose={() => setPendingDelete(null)} title="Hapus Arsip?" size="md">
          <p className="archive-delete-copy">Apakah Anda yakin ingin menghapus arsip <strong>{pendingDelete.number}</strong> - {pendingDelete.title}? Tindakan ini tidak dapat dibatalkan.</p>
          <ModalFooter>
            <button className="btn btn-secondary" type="button" onClick={() => setPendingDelete(null)}>Batal</button>
            <button className="btn btn-danger" type="button" onClick={confirmDelete}><Icon name="trash-2" size={14} />Hapus</button>
          </ModalFooter>
        </Modal>
      )}
    </PageContainer>
  );
}
