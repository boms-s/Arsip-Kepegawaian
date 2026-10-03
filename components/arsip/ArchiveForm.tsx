"use client";

import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import { useApp } from "@/contexts/AppContext";
import { useMasterData } from "@/config/masterDataStore";
import { DUMMY_EMPLOYEES } from "@/config/dummyEmployees";
import { saveArchiveDatabase, saveArchiveFile, useArchiveDatabase, type ArchiveHistoryEntry, type ArchiveRecord, type ArchiveStatus } from "@/config/archiveStore";
import { logActivity } from "@/config/auditLogger";

interface ArchiveFormProps {
  record?: ArchiveRecord;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(size: number) {
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
}

function formatDateForInput(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function ArchiveForm({ record }: ArchiveFormProps) {
  const router = useRouter();
  const database = useArchiveDatabase();
  const masterData = useMasterData();
  const { currentUser } = useApp();
  const [title, setTitle] = useState(record?.title ?? "");
  const [categoryId, setCategoryId] = useState(record?.categoryId ?? "");
  const [typeId, setTypeId] = useState(record?.typeId ?? "");
  const [archivedDate, setArchivedDate] = useState(formatDateForInput(record?.archivedAt));
  const [description, setDescription] = useState(record?.description ?? "");
  const [employeeId, setEmployeeId] = useState(record?.employeeId ?? "");
  const [employeeSearch, setEmployeeSearch] = useState(() => {
    const employee = DUMMY_EMPLOYEES.find((item) => item.id === record?.employeeId);
    return employee ? `${employee.name} - ${employee.nip}` : "";
  });
  const [status, setStatus] = useState<ArchiveStatus>(record?.status ?? "ACTIVE");
  const [file, setFile] = useState<File | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const availableTypes = useMemo(
    () => masterData.types.filter((item) => item.categoryId === categoryId && (item.status === "AKTIF" || item.id === record?.typeId)),
    [masterData.types, categoryId, record?.typeId],
  );
  const activeCategories = masterData.categories.filter((item) => item.status === "AKTIF" || item.id === record?.categoryId);
  const number = record?.number ?? createNextArchiveNumber(database.records, archivedDate);

  function acceptFile(candidate?: File) {
    if (!candidate) return;
    if (candidate.type !== "application/pdf" && !candidate.name.toLocaleLowerCase("id-ID").endsWith(".pdf")) {
      setError("Format file harus PDF.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 10MB.");
      return;
    }
    setFile(candidate);
    setRemoveExistingFile(false);
    setError("");
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !categoryId || !typeId || !archivedDate || !employeeId || (!file && (!record?.fileName || removeExistingFile))) {
      setError("Lengkapi judul, kategori, jenis dokumen, tanggal, pegawai, dan file PDF.");
      return;
    }
    if (file && (file.type !== "application/pdf" && !file.name.toLocaleLowerCase("id-ID").endsWith(".pdf"))) {
      setError("Format file harus PDF.");
      return;
    }
    if (file && file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 10MB.");
      return;
    }

    setIsSaving(true);
    setError("");
    const id = record?.id ?? crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const auditEntry: ArchiveHistoryEntry = {
      id: crypto.randomUUID(),
      archiveId: id,
      archiveNumber: number,
      action: record ? "update" : "create",
      actor: currentUser.name,
      description: record ? `Memperbarui arsip ${number}` : `Membuat arsip ${number}`,
      timestamp,
    };
    const updatedRecord: ArchiveRecord = {
      id,
      number,
      title: title.trim(),
      categoryId,
      typeId,
      employeeId,
      archivedAt: new Date(`${archivedDate}T09:30:00`).toISOString(),
      status,
      description: description.trim(),
      fileName: file?.name ?? (removeExistingFile ? "" : record?.fileName ?? ""),
      fileSize: file?.size ?? (removeExistingFile ? 0 : record?.fileSize ?? 0),
      history: record?.history ?? [],
    };
    try {
      if (file) await saveArchiveFile(id, file);
      saveArchiveDatabase({
        records: record
          ? database.records.map((item) => item.id === record.id ? updatedRecord : item)
          : [updatedRecord, ...database.records],
        audit: [...database.audit, auditEntry],
      });
      void logActivity({
        module: "Arsip",
        action: record ? "UPDATE" : "CREATE",
        description: `${record ? "Memperbarui" : "Membuat"} arsip ${number}`,
      });
      router.push(`/arsip/${id}`);
    } catch {
      setError("Arsip tidak dapat disimpan di penyimpanan browser. Periksa ruang penyimpanan dan coba lagi.");
      setIsSaving(false);
    }
  }

  const employeeOptions = DUMMY_EMPLOYEES.map((employee) => ({
    ...employee,
    label: `${employee.name} - ${employee.nip}`,
  }));

  return (
    <PageContainer
      title={record ? "Edit Arsip Kepegawaian" : "Tambah Arsip Baru"}
      breadcrumb={record
        ? [{ label: "Arsip", href: "/arsip" }, { label: "Detail Arsip", href: `/arsip/${record.id}` }, { label: "Edit Arsip" }]
        : [{ label: "Arsip", href: "/arsip" }, { label: "Tambah Arsip Baru" }]}
    >
      <form className="archive-form" onSubmit={handleSubmit}>
        <div className="archive-form-grid">
          <section className="content-card archive-form-card">
            <h2>Informasi Dokumen Utama</h2>
            <div className="archive-form-fields">
              <div className="form-group">
                <label className="form-label" htmlFor="archive-number">Nomor Arsip (Otomatis)</label>
                <input className="form-input archive-readonly" id="archive-number" value={number} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="archive-title">Judul Arsip</label>
                <input className="form-input" id="archive-title" placeholder="Contoh: SK Kenaikan Pangkat Golongan IV/a" value={title} onChange={(event) => setTitle(event.target.value)} required />
              </div>
              <div className="archive-form-pair">
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="archive-category">Kategori</label>
                  <select className="form-select" id="archive-category" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setTypeId(""); }} required>
                    <option value="">Pilih Kategori</option>
                    {activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="archive-type">Jenis Dokumen</label>
                  <select className="form-select" id="archive-type" value={typeId} onChange={(event) => setTypeId(event.target.value)} required disabled={!categoryId}>
                    <option value="">Pilih Jenis Dokumen</option>
                    {availableTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="archive-date">Tanggal Pengarsipan</label>
                <input className="form-input" id="archive-date" type="date" value={archivedDate} onChange={(event) => setArchivedDate(event.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="archive-description">Deskripsi Dokumen</label>
                <textarea className="form-input archive-description-input" id="archive-description" placeholder="Tambahkan catatan khusus, rincian, atau keterangan mengenai isi berkas dokumen ini..." value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
            </div>
          </section>

          <section className="content-card archive-form-card">
            <h2>File Unggahan &amp; Keterkaitan</h2>
            <label
              className={`archive-dropzone ${isDragging ? "archive-dropzone-active" : ""}`}
              htmlFor="archive-file"
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Icon name="file-text" size={22} />
              <strong>Seret file PDF atau klik untuk unggah</strong>
              <span>Maksimal ukuran file: 10MB</span>
              <input id="archive-file" type="file" accept="application/pdf,.pdf" onChange={(event) => acceptFile(event.target.files?.[0])} />
            </label>
            {(file || (record?.fileName && !removeExistingFile)) && (
              <div className="archive-selected-file">
                <Icon name="file-text" size={17} />
                <div><strong>{file?.name ?? record?.fileName}</strong><span>{formatFileSize(file?.size ?? record?.fileSize ?? 0)}</span></div>
                <button type="button" className="archive-remove-file" aria-label="Hapus file terpilih" onClick={() => { setFile(null); setRemoveExistingFile(true); }}><Icon name="trash-2" size={14} /></button>
              </div>
            )}
            <div className="form-group archive-employee-field">
              <label className="form-label form-label-required" htmlFor="archive-employee-search">Pegawai Terkait</label>
              <input
                className="form-input"
                id="archive-employee-search"
                list="archive-employee-options"
                placeholder="Cari nama atau NIP pegawai"
                value={employeeSearch}
                onChange={(event) => {
                  const value = event.target.value;
                  setEmployeeSearch(value);
                  setEmployeeId(employeeOptions.find((employee) => employee.label === value)?.id ?? "");
                }}
                required
              />
              <datalist id="archive-employee-options">{employeeOptions.map((employee) => <option key={employee.id} value={employee.label} />)}</datalist>
            </div>
            <fieldset className="archive-status-fieldset">
              <legend>Status Berkas</legend>
              <label><input type="radio" name="archive-status" value="ACTIVE" checked={status === "ACTIVE"} onChange={() => setStatus("ACTIVE")} />Aktif</label>
              <label><input type="radio" name="archive-status" value="INACTIVE" checked={status === "INACTIVE"} onChange={() => setStatus("INACTIVE")} />Tidak Aktif</label>
            </fieldset>
          </section>
        </div>
        {error && <p className="archive-form-error" role="alert">{error}</p>}
        <div className="archive-form-actions">
          <Link className="btn btn-secondary" href={record ? `/arsip/${record.id}` : "/arsip"}>Batalkan</Link>
          <button className="btn btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : record ? "Simpan Perubahan" : "Simpan Arsip"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}

function createNextArchiveNumber(records: ArchiveRecord[], dateValue: string) {
  const year = dateValue ? new Date(`${dateValue}T00:00:00`).getFullYear() : new Date().getFullYear();
  const nextNumber = records
    .map((record) => record.number)
    .filter((number) => number.startsWith(`ARS/${year}/`))
    .map((number) => Number(number.split("/").at(-1)))
    .reduce((maximum, value) => Math.max(maximum, value), 0) + 1;
  return `ARS/${year}/${String(nextNumber).padStart(3, "0")}`;
}