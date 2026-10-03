"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import { ContentCard, EmptyState } from "@/components/ui/States";
import { useApp } from "@/contexts/AppContext";
import { useMasterData } from "@/config/masterDataStore";
import { DUMMY_EMPLOYEES } from "@/config/dummyEmployees";
import { deleteArchiveFile, getArchiveFile, saveArchiveDatabase, useArchiveDatabase, type ArchiveHistoryEntry, type ArchiveRecord } from "@/config/archiveStore";
import { logActivity } from "@/config/auditLogger";

function formatTimestamp(value: string, longMonth = false) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: longMonth ? "long" : "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")} ${part("month")} ${part("year")} - ${part("hour")}:${part("minute")} WIB`;
}

function createArchivePdf(record: ArchiveRecord) {
  const safeTitle = record.title.replace(/[()\\]/g, "\\$&").replace(/[^\x20-\x7E]/g, " ");
  const stream = `BT /F1 18 Tf 50 750 Td (${safeTitle}) Tj /F1 11 Tf 0 -28 Td (Nomor Arsip: ${record.number}) Tj 0 -18 Td (Dokumen SIARSIP) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export default function ArsipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const database = useArchiveDatabase();
  const masterData = useMasterData();
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<"info" | "history">("history");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const record = database.records.find((item) => item.id === id);
  const category = record && masterData.categories.find((item) => item.id === record.categoryId);
  const documentType = record && masterData.types.find((item) => item.id === record.typeId);
  const employee = record && DUMMY_EMPLOYEES.find((item) => item.id === record.employeeId);
  const history = record
    ? [...record.history, ...database.audit.filter((entry) => entry.archiveId === record.id)]
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
    : [];

  function eventFor(action: ArchiveHistoryEntry["action"], description: string): ArchiveHistoryEntry {
    return {
      id: crypto.randomUUID(),
      archiveId: record?.id,
      archiveNumber: record?.number,
      action,
      actor: currentUser.name,
      description,
      timestamp: new Date().toISOString(),
    };
  }

  async function downloadArchive() {
    if (!record) return;
    try {
      const file = await getArchiveFile(record.id);
      const url = URL.createObjectURL(file ?? createArchivePdf(record));
      const link = document.createElement("a");
      link.href = url;
      link.download = record.fileName || `${record.number.replaceAll("/", "_")}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      const event = eventFor("download", `Mengunduh berkas ${record.number}`);
      saveArchiveDatabase({ ...database, audit: [...database.audit, event] });
      void logActivity({ module: "Arsip", action: "DOWNLOAD", description: `Mengunduh file PDF ${record.number}` });
      setError("");
    } catch {
      setError("Dokumen tidak dapat diunduh saat ini.");
    }
  }

  function confirmDelete() {
    if (!record) return;
    const event = eventFor("delete", `Menghapus arsip ${record.number}`);
    saveArchiveDatabase({
      records: database.records.filter((item) => item.id !== record.id),
      audit: [...database.audit, event],
    });
    void logActivity({ module: "Arsip", action: "DELETE", description: `Menghapus arsip ${record.number}` });
    void deleteArchiveFile(record.id).catch(() => undefined);
    router.replace("/arsip");
  }

  if (!record) {
    return <PageContainer title="Detail Arsip Kepegawaian" breadcrumb={[{ label: "Arsip", href: "/arsip" }, { label: "Detail Arsip" }]}><EmptyState icon="archive" title="Arsip tidak ditemukan." message="Arsip mungkin telah dihapus atau tautan tidak valid." action={<Link className="btn btn-secondary" href="/arsip">Kembali ke Daftar Arsip</Link>} /></PageContainer>;
  }

  return (
    <PageContainer title="Detail Arsip Kepegawaian" breadcrumb={[{ label: "Arsip", href: "/arsip" }, { label: "Detail Arsip", href: `/arsip/${record.id}` }, { label: record.number }]}>
      <div className="archive-detail-page">
        <ContentCard padded={false}>
          <section className="archive-detail-card">
            <div className="archive-detail-heading">
              <div className="archive-document-icon"><Icon name="file-text" size={21} /></div>
              <div className="archive-detail-title">
                <h2>{record.title}</h2>
                <p>Nomor Berkas: {record.number}</p>
              </div>
              <div className="archive-detail-actions">
                <Link className="btn btn-secondary" href={`/arsip/${record.id}/edit`}><Icon name="edit" size={14} />Edit</Link>
                <button className="btn btn-primary" type="button" onClick={downloadArchive}><Icon name="download" size={14} />Unduh PDF</button>
                <button className="btn btn-danger" type="button" onClick={() => setIsDeleteOpen(true)}><Icon name="trash-2" size={14} />Hapus</button>
              </div>
            </div>
            <div className="archive-detail-facts">
              <div>
                <section><dt>Kategori</dt><dd>{category?.name ?? "-"}</dd></section>
                <section><dt>Jenis Dokumen</dt><dd>{documentType?.name ?? "-"}</dd></section>
                <section><dt>Pegawai Terkait</dt><dd>{employee ? <Link href={`/pegawai/${employee.id}`}>{employee.name} (NIP: {employee.nip})</Link> : "-"}</dd></section>
              </div>
              <div>
                <section><dt>Tanggal Pengarsipan</dt><dd>{formatTimestamp(record.archivedAt, true)}</dd></section>
                <section><dt>Status Berkas</dt><dd><Badge variant={record.status === "ACTIVE" ? "success" : "default"}>{record.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}</Badge></dd></section>
                <section><dt>Deskripsi</dt><dd className="archive-detail-description">{record.description || "Tidak ada deskripsi."}</dd></section>
              </div>
            </div>
          </section>
        </ContentCard>

        <ContentCard padded={false}>
          <div className="archive-tabs" role="tablist" aria-label="Informasi arsip">
            <button type="button" role="tab" aria-selected={activeTab === "info"} className={activeTab === "info" ? "archive-tab-active" : ""} onClick={() => setActiveTab("info")}>Informasi Tambahan</button>
            <button type="button" role="tab" aria-selected={activeTab === "history"} className={activeTab === "history" ? "archive-tab-active" : ""} onClick={() => setActiveTab("history")}>Riwayat Berkas (Active)</button>
          </div>
          {activeTab === "history" ? (
            <ol className="archive-timeline">
              {history.length ? history.map((entry) => (
                <li key={entry.id}>
                  <span className="archive-timeline-dot" />
                  <div><h3>{entry.actor}</h3><p>{entry.description}</p><time dateTime={entry.timestamp}>{formatTimestamp(entry.timestamp)}</time></div>
                </li>
              )) : <li className="archive-timeline-empty">Belum ada riwayat perubahan untuk arsip ini.</li>}
            </ol>
          ) : (
            <dl className="archive-additional-info"><div><dt>Nama Berkas</dt><dd>{record.fileName}</dd></div><div><dt>Ukuran</dt><dd>{(record.fileSize / 1024 / 1024).toFixed(2)} MB</dd></div><div><dt>Nomor Arsip</dt><dd>{record.number}</dd></div></dl>
          )}
        </ContentCard>
        {error && <p className="archive-download-error" role="alert">{error}</p>}
      </div>
      {isDeleteOpen && (
        <Modal isOpen onClose={() => setIsDeleteOpen(false)} title="Hapus Arsip?">
          <p className="archive-delete-copy">Apakah Anda yakin ingin menghapus arsip <strong>{record.number}</strong> - {record.title}? Tindakan ini tidak dapat dibatalkan.</p>
          <ModalFooter><button className="btn btn-secondary" type="button" onClick={() => setIsDeleteOpen(false)}>Batal</button><button className="btn btn-danger" type="button" onClick={confirmDelete}><Icon name="trash-2" size={14} />Hapus</button></ModalFooter>
        </Modal>
      )}
    </PageContainer>
  );
}
