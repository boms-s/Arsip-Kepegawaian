"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { ContentCard } from "@/components/ui/States";
import MasterDataModal, {
  type MasterDataAction,
  type MasterDataFormValue,
  type MasterDataKind,
  type MasterDataRecord,
} from "@/components/master-data/MasterDataModal";
import {
  type DocumentCategory,
  type DocumentType,
} from "@/config/dummyMasterData";
import { saveMasterData, useMasterData } from "@/config/masterDataStore";
import { logActivity } from "@/config/auditLogger";

interface ModalState {
  kind: MasterDataKind;
  action: MasterDataAction;
  record?: MasterDataRecord;
}

export default function MasterDataPage() {
  const { categories, types } = useMasterData();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [message, setMessage] = useState("");

  const activeCategories = categories.filter((category) => category.status === "AKTIF");
  const selectedRecord = modal?.record;

  function openModal(kind: MasterDataKind, action: MasterDataAction, record?: MasterDataRecord) {
    setMessage("");
    setModal({ kind, action, record });
  }

  function codeExists(code: string) {
    const normalizedCode = code.trim().toLocaleUpperCase("id-ID");
    if (!modal) return false;
    const records = modal.kind === "category" ? categories : types;
    return records.some((item) => item.code.toLocaleUpperCase("id-ID") === normalizedCode && item.id !== modal.record?.id);
  }

  function saveRecord(value: MasterDataFormValue) {
    if (!modal) return;
    if (modal.kind === "category") {
      const category: DocumentCategory = {
        id: modal.record?.id ?? crypto.randomUUID(),
        code: value.code,
        name: value.name,
        description: value.description,
        status: value.status,
      };
      const updatedCategories = modal.action === "edit"
        ? categories.map((item) => item.id === category.id ? category : item)
        : [...categories, category];
      saveMasterData({ categories: updatedCategories, types });
    } else {
      const documentType: DocumentType = {
        id: modal.record?.id ?? crypto.randomUUID(),
        code: value.code,
        name: value.name,
        categoryId: value.categoryId,
        format: value.format,
        status: value.status,
      };
      const updatedTypes = modal.action === "edit"
        ? types.map((item) => item.id === documentType.id ? documentType : item)
        : [...types, documentType];
      saveMasterData({ categories, types: updatedTypes });
    }
    void logActivity({
      module: "Master Data",
      action: modal.action === "create" ? "CREATE" : "UPDATE",
      description: `${modal.action === "create" ? "Menambahkan" : "Memperbarui"} ${modal.kind === "category" ? "kategori" : "jenis dokumen"} ${value.name}`,
    });
    setMessage(`${modal.kind === "category" ? "Kategori" : "Jenis dokumen"} berhasil disimpan.`);
    setModal(null);
  }

  function deleteRecord() {
    if (!modal?.record) return;
    if (modal.kind === "category") {
      const category = modal.record as DocumentCategory;
      saveMasterData({
        categories: categories.filter((item) => item.id !== category.id),
        types: types.filter((item) => item.categoryId !== category.id),
      });
    } else {
      saveMasterData({ categories, types: types.filter((item) => item.id !== modal.record?.id) });
    }
    void logActivity({
      module: "Master Data",
      action: "DELETE",
      description: `Menghapus ${modal.kind === "category" ? "kategori" : "jenis dokumen"} ${modal.record.name}`,
    });
    setMessage(`${modal.kind === "category" ? "Kategori" : "Jenis dokumen"} dan data terkait berhasil dihapus.`);
    setModal(null);
  }

  return (
    <PageContainer
      title="Master Data Kepegawaian"
      breadcrumb={[{ label: "ARSIP KKP", href: "/dashboard" }, { label: "Master Data" }]}
    >
      <div className="master-data-page">
        {message && <div className="master-data-notice" role="status">{message}</div>}
        <ContentCard padded={false} className="master-data-card">
          <div className="master-data-card-heading">
            <div>
              <h2>Kategori Dokumen</h2>
              <p>Master pengelompokan berkas kepegawaian resmi.</p>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => openModal("category", "create")}>
              <Icon name="plus" size={14} />Tambah Kategori
            </button>
          </div>
          <div className="table-wrapper">
            <table className="table master-data-table">
              <thead><tr><th>No</th><th>Kode</th><th>Nama Kategori</th><th>Deskripsi</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>
                    <td className="master-data-code">{category.code}</td>
                    <td className="master-data-name">{category.name}</td>
                    <td className="master-data-description">{category.description}</td>
                    <td><Badge variant={category.status === "AKTIF" ? "success" : "default"}>{category.status === "AKTIF" ? "Aktif" : "Nonaktif"}</Badge></td>
                    <td>
                      <div className="master-data-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" type="button" title="Edit kategori" aria-label={`Edit kategori ${category.name}`} onClick={() => openModal("category", "edit", category)}><Icon name="edit" size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm master-data-delete" type="button" title="Hapus kategori" aria-label={`Hapus kategori ${category.name}`} onClick={() => openModal("category", "delete", category)}><Icon name="trash-2" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>

        <ContentCard padded={false} className="master-data-card">
          <div className="master-data-card-heading">
            <div>
              <h2>Jenis Dokumen</h2>
              <p>Spesifikasi detail format jenis berkas resmi pendukung kategori.</p>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => openModal("type", "create")}>
              <Icon name="plus" size={14} />Tambah Jenis
            </button>
          </div>
          <div className="table-wrapper">
            <table className="table master-data-table master-data-type-table">
              <thead><tr><th>No</th><th>Kode</th><th>Nama Jenis</th><th>Kategori Induk</th><th>Keterangan Format</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {types.map((documentType, index) => (
                  <tr key={documentType.id}>
                    <td>{index + 1}</td>
                    <td className="master-data-code">{documentType.code}</td>
                    <td className="master-data-name">{documentType.name}</td>
                    <td>{categories.find((category) => category.id === documentType.categoryId)?.name ?? "-"}</td>
                    <td className="master-data-format">{documentType.format}</td>
                    <td><Badge variant={documentType.status === "AKTIF" ? "success" : "default"}>{documentType.status === "AKTIF" ? "Aktif" : "Nonaktif"}</Badge></td>
                    <td>
                      <div className="master-data-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" type="button" title="Edit jenis dokumen" aria-label={`Edit jenis ${documentType.name}`} onClick={() => openModal("type", "edit", documentType)}><Icon name="edit" size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm master-data-delete" type="button" title="Hapus jenis dokumen" aria-label={`Hapus jenis ${documentType.name}`} onClick={() => openModal("type", "delete", documentType)}><Icon name="trash-2" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      </div>

      {modal && (
        <MasterDataModal
          kind={modal.kind}
          action={modal.action}
          record={selectedRecord}
          activeCategories={activeCategories}
          codeExists={codeExists}
          onClose={() => setModal(null)}
          onSave={saveRecord}
          onDelete={deleteRecord}
        />
      )}
    </PageContainer>
  );
}