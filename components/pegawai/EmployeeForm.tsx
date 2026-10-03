"use client";

import type { FormEvent } from "react";
import type { EmployeeInput } from "@/types/employee";
import Icon from "@/components/ui/Icon";
import { ModalFooter } from "@/components/ui/Modal";

interface EmployeeFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (employee: EmployeeInput) => void;
}

export default function EmployeeForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: EmployeeFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onSubmit({
      nip: String(values.get("nip") ?? "").trim(),
      name: String(values.get("name") ?? "").trim(),
      position: String(values.get("position") ?? "").trim(),
      department: String(values.get("department") ?? "").trim(),
      email: String(values.get("email") ?? "").trim(),
      phone: String(values.get("phone") ?? "").trim(),
      status: String(values.get("status")) as EmployeeInput["status"],
    });
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="employee-nip">NIP</label>
          <input className="form-input" id="employee-nip" name="nip" required maxLength={30} />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="employee-name">Nama Lengkap</label>
          <input className="form-input" id="employee-name" name="name" required maxLength={120} />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="employee-position">Jabatan</label>
          <input className="form-input" id="employee-position" name="position" required maxLength={120} />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="employee-department">Departemen/Bagian</label>
          <input className="form-input" id="employee-department" name="department" required maxLength={120} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="employee-email">Email</label>
          <input className="form-input" id="employee-email" name="email" type="email" maxLength={254} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="employee-phone">Nomor Telepon</label>
          <input className="form-input" id="employee-phone" name="phone" type="tel" maxLength={30} />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="employee-status">Status</label>
          <select className="form-select" id="employee-status" name="status" defaultValue="PNS_AKTIF" required>
            <option value="PNS_AKTIF">PNS Aktif</option>
            <option value="PPPK_KONTRAK">PPPK Kontrak</option>
            <option value="PENSIUN">Pensiun</option>
          </select>
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </button>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Icon name="refresh-cw" size={15} /> : <Icon name="check-circle" size={15} />}
          {isSubmitting ? "Menyimpan..." : "Simpan Pegawai"}
        </button>
      </ModalFooter>
    </form>
  );
}