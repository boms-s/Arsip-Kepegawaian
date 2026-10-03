"use client";

import { useState, type FormEvent } from "react";
import type { DocumentCategory, DocumentType, MasterDataStatus } from "@/config/dummyMasterData";
import Icon from "@/components/ui/Icon";
import Modal, { ModalFooter } from "@/components/ui/Modal";

export type MasterDataKind = "category" | "type";
export type MasterDataAction = "create" | "edit" | "delete";
export type MasterDataRecord = DocumentCategory | DocumentType;

export interface MasterDataFormValue {
  code: string;
  name: string;
  description: string;
  categoryId: string;
  format: string;
  status: MasterDataStatus;
}

interface MasterDataModalProps {
  kind: MasterDataKind;
  action: MasterDataAction;
  record?: MasterDataRecord;
  activeCategories: DocumentCategory[];
  codeExists: (code: string) => boolean;
  onClose: () => void;
  onSave: (value: MasterDataFormValue) => void;
  onDelete: () => void;
}

export default function MasterDataModal({
  kind,
  action,
  record,
  activeCategories,
  codeExists,
  onClose,
  onSave,
  onDelete,
}: MasterDataModalProps) {
  const isCategory = kind === "category";
  const isDelete = action === "delete";
  const isEdit = action === "edit";
  const [error, setError] = useState("");
  const title = isDelete
    ? isCategory ? "Hapus Kategori?" : "Hapus Jenis Dokumen?"
    : isEdit
      ? isCategory ? "Edit Kategori" : "Edit Jenis Dokumen"
      : isCategory ? "Tambah Kategori Baru" : "Tambah Jenis Dokumen Baru";
  const subtitle = isDelete
    ? "Tindakan ini tidak bisa dibatalkan secara sepihak."
    : isEdit
      ? "Perbarui rincian pengelompokan arsip dokumen kepegawaian."
      : isCategory
        ? "Lengkapi formulir di bawah ini untuk membuat pengelompokan arsip baru."
        : "Tambahkan spesifikasi format berkas resmi pendukung kepegawaian.";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const code = String(data.get("code") ?? "").trim();
    if (!code) {
      setError("Kode wajib diisi.");
      return;
    }
    if (codeExists(code)) {
      setError("Kode sudah digunakan. Masukkan kode yang unik.");
      return;
    }
    setError("");
    onSave({
      code,
      name: String(data.get("name") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      categoryId: String(data.get("categoryId") ?? ""),
      format: String(data.get("format") ?? "").trim(),
      status: String(data.get("status") ?? "AKTIF") as MasterDataStatus,
    });
  }

  if (isDelete) {
    return (
      <Modal isOpen onClose={onClose} title={title} size="md" hideHeader>
        <div className="master-modal-delete">
          <div className="master-modal-delete-icon"><Icon name="shield-check" size={21} /></div>
          <div className="master-modal-delete-content">
            <h3 id="modal-title">{title}</h3>
            <p className="master-modal-subtitle">{subtitle}</p>
            <p>{isCategory
              ? "Apakah Anda yakin ingin menghapus kategori ini? Data jenis dokumen dan berkas arsip pegawai yang terkait akan sangat terpengaruh."
              : "Apakah Anda yakin ingin menghapus jenis dokumen ini? Tindakan ini tidak dapat dibatalkan."
            }</p>
          </div>
        </div>
        <ModalFooter>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Batal</button>
          <button className="btn btn-danger" type="button" onClick={onDelete}><Icon name="trash-2" size={14} />Hapus</button>
        </ModalFooter>
      </Modal>
    );
  }

  const typeRecord = record as DocumentType | undefined;
  const categoryRecord = record as DocumentCategory | undefined;

  return (
    <Modal isOpen onClose={onClose} title={title} size="md">
      <form className="master-data-form" onSubmit={handleSubmit}>
        <p className="master-modal-subtitle">{subtitle}</p>
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="master-code">{isCategory ? "Kode Kategori" : "Kode Jenis"}</label>
          <input
            className={`form-input ${isEdit ? "master-readonly" : ""}`}
            id="master-code"
            name="code"
            placeholder={isCategory ? "Contoh: KAT-XXX" : "Contoh: DOC-XXX"}
            defaultValue={record?.code ?? ""}
            readOnly={isEdit}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="master-name">{isCategory ? "Nama Kategori" : "Nama Jenis"}</label>
          <input
            className="form-input"
            id="master-name"
            name="name"
            placeholder={isCategory ? "Masukkan nama kategori dokumen" : "Masukkan nama jenis dokumen"}
            defaultValue={record?.name ?? ""}
            required
          />
        </div>
        {isCategory ? (
          <div className="form-group">
            <label className="form-label" htmlFor="master-description">Deskripsi</label>
            <textarea className="form-input master-textarea" id="master-description" name="description" placeholder="Masukkan deskripsi mengenai kategori dokumen..." defaultValue={categoryRecord?.description ?? ""} />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="master-category">Kategori Induk</label>
              <select className="form-select" id="master-category" name="categoryId" defaultValue={typeRecord && activeCategories.some((category) => category.id === typeRecord.categoryId) ? typeRecord.categoryId : activeCategories[0]?.id ?? ""} required>
                {activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="master-format">Keterangan Format</label>
              <input className="form-input" id="master-format" name="format" placeholder="Contoh: PDF Bertanda tangan elektronik." defaultValue={typeRecord?.format ?? ""} />
            </div>
          </>
        )}
        <div className="form-group">
          <label className="form-label" htmlFor="master-status">Status</label>
          <select className="form-select" id="master-status" name="status" defaultValue={record?.status ?? "AKTIF"}>
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Nonaktif</option>
          </select>
        </div>
        {error && <p className="master-form-error" role="alert">{error}</p>}
        <ModalFooter>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" type="submit">{isEdit ? "Simpan Perubahan" : "Simpan"}</button>
        </ModalFooter>
      </form>
    </Modal>
  );
}