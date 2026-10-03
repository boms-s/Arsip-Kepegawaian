"use client";

import { useState, type FormEvent } from "react";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import type { ManagedUser, ManagedUserRole, ManagedUserStatus } from "@/types/user-management";

export interface UserFormValue {
  name: string;
  email: string;
  role: ManagedUserRole;
  status: ManagedUserStatus;
  password?: string;
}

interface UserModalProps {
  mode: "create" | "edit";
  user?: ManagedUser;
  onClose: () => void;
  onSave: (value: UserFormValue) => Promise<void>;
}

export default function UserModal({ mode, user, onClose, onSave }: UserModalProps) {
  const isCreate = mode === "create";
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    const role = String(values.get("role") ?? "") as ManagedUserRole;
    const status = String(values.get("status") ?? "") as ManagedUserStatus;
    const password = String(values.get("password") ?? "");
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role || !status || (isCreate && password.length < 8)) {
      setError(isCreate ? "Lengkapi nama, email valid, role, status, dan password minimal 8 karakter." : "Lengkapi nama, email valid, role, dan status.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ name, email, role, status, ...(isCreate ? { password } : {}) });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Data pengguna tidak dapat disimpan.");
      setSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={isCreate ? "Tambah User Baru" : "Edit User"} size="md">
      <form className="user-form" onSubmit={handleSubmit}>
        <p className="user-modal-subtitle">{isCreate ? "Lengkapi informasi akun dan hak akses pengguna." : "Perbarui informasi detail akun dan hak akses pengguna."}</p>
        <div className="form-group"><label className="form-label form-label-required" htmlFor="user-name">Nama Lengkap</label><input className="form-input" id="user-name" name="name" defaultValue={user?.name ?? ""} required /></div>
        <div className="form-group"><label className="form-label form-label-required" htmlFor="user-email">Email</label><input className="form-input" id="user-email" name="email" type="email" defaultValue={user?.email ?? ""} required /></div>
        {isCreate && <div className="form-group"><label className="form-label form-label-required" htmlFor="user-password">Password Awal</label><input className="form-input" id="user-password" name="password" type="password" minLength={8} autoComplete="new-password" required /></div>}
        <div className="form-group"><label className="form-label form-label-required" htmlFor="user-role">Role</label><select className="form-select" id="user-role" name="role" defaultValue={user?.role ?? "ADMIN_KEPEGAWAIAN"} required><option value="ADMIN_SISTEM">Admin Sistem</option><option value="ADMIN_KEPEGAWAIAN">Admin</option><option value="PEGAWAI">Pegawai</option></select></div>
        <div className="form-group"><label className="form-label form-label-required" htmlFor="user-status">Status</label><select className="form-select" id="user-status" name="status" defaultValue={user?.status ?? "ACTIVE"} required><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select></div>
        {error && <p className="user-form-error" role="alert">{error}</p>}
        <ModalFooter><button className="btn btn-secondary" type="button" onClick={onClose} disabled={saving}>Batal</button><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Menyimpan..." : isCreate ? "Simpan" : "Simpan Perubahan"}</button></ModalFooter>
      </form>
    </Modal>
  );
}