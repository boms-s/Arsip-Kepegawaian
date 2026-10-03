"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import { ContentCard, EmptyState } from "@/components/ui/States";
import EmployeeStatusBadge from "@/components/pegawai/EmployeeStatusBadge";
import { DUMMY_EMPLOYEES } from "@/config/dummyEmployees";
import { DUMMY_EMPLOYEE_ARCHIVES, type EmployeeArchive } from "@/config/dummyEmployeeArchives";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const employee = DUMMY_EMPLOYEES.find((item) => item.id === id);
  const [archiveState, setArchiveState] = useState(() => ({
    employeeId: id,
    items: DUMMY_EMPLOYEE_ARCHIVES.filter((item) => item.employeeId === id),
  }));
  const archives = archiveState.employeeId === id
    ? archiveState.items
    : DUMMY_EMPLOYEE_ARCHIVES.filter((item) => item.employeeId === id);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewArchive, setPreviewArchive] = useState<EmployeeArchive | null>(null);
  const [notice, setNotice] = useState("");

  function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("document") as File | null;
    if (!file || !employee) return;

    const dateValue = String(formData.get("date") ?? "");
    const formattedDate = dateValue
      ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${dateValue}T00:00:00`))
      : "-";
    const archive: EmployeeArchive = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      date: formattedDate,
      category: String(formData.get("category") ?? "Dokumen Lainnya"),
      fileName: file.name,
      uploadedBy: "Hendra Wijaya",
    };

    setArchiveState((current) => ({
      employeeId: employee.id,
      items: [archive, ...(current.employeeId === employee.id ? current.items : DUMMY_EMPLOYEE_ARCHIVES.filter((item) => item.employeeId === employee.id))],
    }));
    setIsUploadOpen(false);
    setNotice("Dokumen ditambahkan ke sesi ini saja. Penyimpanan server belum tersedia.");
  }

  if (!employee) {
    return (
      <PageContainer title="Detail Pegawai" breadcrumb={[{ label: "SIARSIP", href: "/dashboard" }, { label: "Data Pegawai", href: "/pegawai" }, { label: "Detail Pegawai" }]}>
        <EmptyState icon="users" title="Data pegawai tidak ditemukan." message="Pegawai mungkin sudah dihapus atau tautan tidak valid." action={<Link className="btn btn-secondary" href="/pegawai">Kembali ke Data Pegawai</Link>} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Detail Pegawai"
      breadcrumb={[{ label: "SIARSIP", href: "/dashboard" }, { label: "Data Pegawai", href: "/pegawai" }, { label: "Detail Pegawai" }]}
    >
      <div className="employee-detail-page">
        <ContentCard padded={false}>
          <section className="employee-profile-card" aria-label="Profil pegawai">
            <div className="employee-profile-main">
              <div className="employee-profile-photo" role="img" aria-label={`Foto ${employee.name}`} />
              <div className="employee-profile-name">
                <div className="employee-profile-heading">
                  <h2>{employee.name}</h2>
                  <EmployeeStatusBadge status={employee.status} />
                </div>
                <p>NIP. {employee.nip}</p>
                <span>{employee.position}{employee.golongan ? ` (${employee.golongan})` : ""}</span>
              </div>
            </div>
            <div className="employee-profile-facts">
              <div><dt>Unit Kerja</dt><dd>{employee.department}</dd></div>
              <div><dt>Bidang</dt><dd>{employee.bidang ?? "-"}</dd></div>
              <div><dt>Email Resmi</dt><dd>{employee.email || "-"}</dd></div>
              <div><dt>No. Telepon</dt><dd>{employee.phone || "-"}</dd></div>
            </div>
          </section>
        </ContentCard>

        <ContentCard padded={false}>
          <div className="employee-archive-heading">
            <div>
              <h2>Riwayat Data Arsip Pegawai</h2>
              <p>Daftar dokumen fisik dan digital resmi yang tersimpan dalam sistem.</p>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => setIsUploadOpen(true)}>
              <Icon name="upload" size={15} />
              Upload Dokumen Baru
            </button>
          </div>
          {notice && <div className="employee-upload-notice" role="status">{notice}</div>}
          {archives.length === 0 ? (
            <EmptyState icon="file-text" title="Belum ada riwayat arsip." message="Dokumen yang ditambahkan akan tampil di daftar ini." />
          ) : (
            <div className="table-wrapper">
              <table className="table employee-archive-table">
                <thead><tr><th>No</th><th>Tanggal</th><th>Kategori Dokumen</th><th>Nama Dokumen</th><th>Diunggah Oleh</th><th>Aksi</th></tr></thead>
                <tbody>
                  {archives.map((archive, index) => (
                    <tr key={archive.id}>
                      <td>{index + 1}</td>
                      <td>{archive.date}</td>
                      <td><span className="employee-archive-category">{archive.category}</span></td>
                      <td className="employee-archive-filename">{archive.fileName}</td>
                      <td>{archive.uploadedBy}</td>
                      <td>
                        <button className="btn btn-ghost btn-icon btn-sm employee-preview-action" type="button" title="Lihat dokumen" aria-label={`Lihat ${archive.fileName}`} onClick={() => setPreviewArchive(archive)}>
                          <Icon name="eye" size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      </div>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Dokumen Baru" size="md">
        <form className="employee-upload-form" onSubmit={handleUpload}>
          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="archive-category">Kategori Dokumen</label>
            <select className="form-select" id="archive-category" name="category" defaultValue="Pengangkatan" required>
              <option>Pengangkatan</option><option>Mutasi</option><option>Pendidikan</option><option>Kesejahteraan</option><option>Penghargaan</option><option>Lainnya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="archive-date">Tanggal Dokumen</label>
            <input className="form-input" id="archive-date" name="date" type="date" required />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="archive-file">Pilih File</label>
            <input className="form-input employee-file-input" id="archive-file" name="document" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required />
          </div>
          <p className="employee-upload-hint">File hanya tersedia sementara di sesi ini; endpoint penyimpanan belum tersedia.</p>
          <ModalFooter>
            <button className="btn btn-secondary" type="button" onClick={() => setIsUploadOpen(false)}>Batal</button>
            <button className="btn btn-primary" type="submit"><Icon name="upload" size={15} />Tambah Dokumen</button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={previewArchive !== null} onClose={() => setPreviewArchive(null)} title="Pratinjau Dokumen" size="md">
        {previewArchive && (
          <div className="employee-preview-content">
            <div className="employee-preview-file"><Icon name="file-text" size={22} /><span>{previewArchive.fileName}</span></div>
            <dl><div><dt>Kategori</dt><dd>{previewArchive.category}</dd></div><div><dt>Tanggal</dt><dd>{previewArchive.date}</dd></div><div><dt>Diunggah Oleh</dt><dd>{previewArchive.uploadedBy}</dd></div></dl>
            <p>Pratinjau berkas belum tersedia karena dokumen arsip belum terhubung ke penyimpanan server.</p>
            <ModalFooter><button className="btn btn-secondary" type="button" onClick={() => setPreviewArchive(null)}>Tutup</button></ModalFooter>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}