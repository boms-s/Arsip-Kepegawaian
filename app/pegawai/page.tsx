"use client";

import { useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import Alert from "@/components/ui/Alert";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import { ContentCard, EmptyState, ErrorState } from "@/components/ui/States";
import EmployeeForm from "@/components/pegawai/EmployeeForm";
import EmployeeStatusBadge from "@/components/pegawai/EmployeeStatusBadge";
import Pagination from "@/components/ui/Pagination";
import { DUMMY_EMPLOYEES } from "@/config/dummyEmployees";
import { logActivity } from "@/config/auditLogger";
import type { Employee, EmployeeInput } from "@/types/employee";

const PAGE_SIZE = 8;

export default function PegawaiPage() {
  const [employees, setEmployees] = useState(DUMMY_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("SEMUA");
  const [departmentFilter, setDepartmentFilter] = useState("SEMUA");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [dataError, setDataError] = useState(false);

  const filteredEmployees = employees.filter((employee) => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    const matchesSearch = [employee.nip, employee.name, employee.position].some((value) =>
      value.toLocaleLowerCase("id-ID").includes(query),
    );
    const matchesStatus = statusFilter === "SEMUA" || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === "SEMUA" || employee.department === departmentFilter || employee.bidang === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const visibleEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const departments = Array.from(new Set(employees.flatMap((employee) => [employee.department, employee.bidang].filter((value): value is string => Boolean(value))))).sort();

  async function handleCreate(employee: EmployeeInput) {
    setIsSubmitting(true);
    setDataError(false);
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
      const newEmployee: Employee = { ...employee, id: crypto.randomUUID() };
      setEmployees((current) => [newEmployee, ...current]);
      void logActivity({ module: "Pegawai", action: "CREATE", description: `Menambah data pegawai ${newEmployee.name}` });
      setModal(null);
      setAlertMessage("Data pegawai berhasil ditambahkan ke data sementara.");
    } catch {
      setDataError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete() {
    if (!selectedEmployee) return;
    setEmployees((current) => current.filter((employee) => employee.id !== selectedEmployee.id));
    void logActivity({ module: "Pegawai", action: "DELETE", description: `Menghapus data pegawai ${selectedEmployee.name}` });
    setModal(null);
    setSelectedEmployee(null);
    setAlertMessage("Data pegawai berhasil dihapus dari data sementara.");
  }

  function openModal(mode: "edit" | "delete", employee: Employee) {
    setSelectedEmployee(employee);
    setModal(mode);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("SEMUA");
    setDepartmentFilter("SEMUA");
    setCurrentPage(1);
  }

  return (
    <PageContainer
      title="Manajemen Data Pegawai"
      description="Daftar seluruh Pegawai Negeri Sipil (PNS) dan PPPK yang terdaftar dalam sistem arsip."
      actions={(
        <button className="btn btn-primary" type="button" onClick={() => setModal("create")}>
          <Icon name="plus" size={16} />
          Tambah Pegawai Baru
        </button>
      )}
    >
      {alertMessage && (
        <Alert
          variant="success"
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          className="employee-success-alert"
        />
      )}
      {dataError && <ErrorState message="Data contoh tidak dapat diperbarui. Silakan coba lagi." />}

      <form className="employee-filter-card" onSubmit={(event) => { event.preventDefault(); setCurrentPage(1); }}>
        <label className="employee-filter-search" htmlFor="employee-search">
          <span className="sr-only">Cari nama atau NIP pegawai</span>
          <input
            className="form-input"
            id="employee-search"
            type="search"
            placeholder="Cari Nama / NIP Pegawai..."
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
          />
        </label>
        <label className="employee-filter-unit" htmlFor="employee-unit-filter">
          <span className="sr-only">Unit Kerja / Bidang</span>
          <select
            className="form-select"
            id="employee-unit-filter"
            value={departmentFilter}
            onChange={(event) => { setDepartmentFilter(event.target.value); setCurrentPage(1); }}
          >
            <option value="SEMUA">Unit Kerja / Bidang</option>
            {departments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
        </label>
        <label className="employee-filter-status" htmlFor="employee-status-filter">
          <span className="sr-only">Status Pegawai</span>
          <select
            className="form-select"
            id="employee-status-filter"
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }}
          >
            <option value="SEMUA">Status Pegawai</option>
            <option value="PNS_AKTIF">PNS Aktif</option>
            <option value="PPPK_KONTRAK">PPPK Kontrak</option>
            <option value="PENSIUN">Pensiun</option>
          </select>
        </label>
        <button className="btn btn-primary employee-filter-submit" type="submit">
          <Icon name="filter" size={14} />
          Saring Data
        </button>
        {(search || statusFilter !== "SEMUA" || departmentFilter !== "SEMUA") && (
          <button className="btn btn-ghost btn-sm employee-filter-reset" type="button" onClick={resetFilters}>Reset</button>
        )}
      </form>

      <ContentCard padded={false}>
        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon="search"
            title="Data pegawai tidak ditemukan."
            message="Ubah kata pencarian atau filter status untuk melihat data lainnya."
            action={(
              <button className="btn btn-secondary" type="button" onClick={resetFilters}>
                <Icon name="refresh-cw" size={15} />
                Reset pencarian dan filter
              </button>
            )}
          />
        ) : (
          <div className="table-wrapper employee-table-wrapper">
            <table className="table employee-table">
              <thead>
                <tr>
                  <th scope="col">No</th>
                  <th scope="col">NIP</th>
                  <th scope="col">Nama Lengkap</th>
                  <th scope="col">Jabatan</th>
                  <th scope="col">Unit Kerja</th>
                  <th scope="col">Status</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map((employee, index) => (
                  <tr key={employee.id}>
                    <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="employee-nip">{employee.nip}</td>
                    <td className="employee-name"><Link href={`/pegawai/${employee.id}`}>{employee.name}</Link></td>
                    <td>{employee.position}</td>
                    <td>{employee.department}</td>
                    <td>
                      <EmployeeStatusBadge status={employee.status} />
                    </td>
                    <td>
                      <div className="employee-row-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" type="button" title="Edit" aria-label={`Edit ${employee.name}`} onClick={() => openModal("edit", employee)}>
                          <Icon name="edit" size={16} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm employee-delete-action" type="button" title="Hapus" aria-label={`Hapus ${employee.name}`} onClick={() => openModal("delete", employee)}>
                          <Icon name="trash-2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="employee-table-footer">
          <span>
            Menampilkan {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} dari {filteredEmployees.length} Pegawai
          </span>
          <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={setCurrentPage} />
        </div>
      </ContentCard>

      <Alert
        variant="info"
        message="Data pegawai masih menggunakan fixture sementara. Hubungkan API/database untuk data produksi."
        className="employee-data-note"
      />

      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Tambah Pegawai" : modal === "edit" ? "Edit Pegawai" : "Konfirmasi Hapus"}
        size={modal === "create" ? "lg" : "md"}
      >
        {modal === "create" && (
          <EmployeeForm
            isSubmitting={isSubmitting}
            onCancel={() => setModal(null)}
            onSubmit={handleCreate}
          />
        )}
        {modal === "edit" && selectedEmployee && (
          <>
            <p className="employee-placeholder-text">Form edit belum termasuk dalam cakupan Modul 5. Data {selectedEmployee.name} tidak diubah.</p>
            <ModalFooter>
              <button className="btn btn-secondary" type="button" onClick={() => setModal(null)}>Tutup</button>
            </ModalFooter>
          </>
        )}
        {modal === "delete" && selectedEmployee && (
          <>
            <p className="employee-placeholder-text">Hapus data contoh pegawai <strong>{selectedEmployee.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
            <ModalFooter>
              <button className="btn btn-secondary" type="button" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-danger" type="button" onClick={handleDelete}>
                <Icon name="trash-2" size={15} />
                Hapus Pegawai
              </button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </PageContainer>
  );
}
