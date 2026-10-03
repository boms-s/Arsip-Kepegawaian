"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import { ContentCard, EmptyState } from "@/components/ui/States";
import PermissionsMatrix from "@/components/users/PermissionsMatrix";
import UserModal, { type UserFormValue } from "@/components/users/UserModal";
import { HR_OFFICER_PERMISSIONS } from "@/config/dummyUsers";
import { useApp } from "@/contexts/AppContext";
import type { ManagedUser } from "@/types/user-management";

export default function UsersPage() {
  const { currentUser } = useApp();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [modalUser, setModalUser] = useState<{ mode: "create" | "edit"; user?: ManagedUser } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ManagedUser | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadUsers() {
    const response = await fetch("/api/users", { cache: "no-store" });
    const result = await response.json() as { users?: ManagedUser[]; message?: string };
    if (!response.ok) throw new Error(result.message ?? "Data pengguna tidak dapat dimuat.");
    setUsers(result.users ?? []);
  }

  useEffect(() => {
    let isMounted = true;
    fetch("/api/users", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { users?: ManagedUser[]; message?: string };
        if (!response.ok) throw new Error(result.message ?? "Data pengguna tidak dapat dimuat.");
        return result.users ?? [];
      })
      .then((result) => { if (isMounted) setUsers(result); })
      .catch((loadError: unknown) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : "Data pengguna tidak dapat dimuat.");
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  function roleLabel(role: ManagedUser["role"]) {
    if (role === "ADMIN_SISTEM") return "Admin Sistem";
    if (role === "ADMIN_KEPEGAWAIAN") return "Admin";
    return "Pegawai";
  }

  async function saveUser(value: UserFormValue) {
    const isCreate = modalUser?.mode === "create";
    const url = isCreate ? "/api/users" : `/api/users/${modalUser?.user?.id}`;
    const response = await fetch(url, {
      method: isCreate ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    const result = await response.json() as { message?: string };
    if (!response.ok) throw new Error(result.message ?? "Data pengguna tidak dapat disimpan.");
    setModalUser(null);
    setMessage(isCreate ? "User baru berhasil ditambahkan." : "Perubahan user berhasil disimpan.");
    await loadUsers();
  }

  async function deleteUser() {
    if (!pendingDelete) return;
    const response = await fetch(`/api/users/${pendingDelete.id}`, { method: "DELETE" });
    const result = await response.json() as { message?: string };
    if (!response.ok) {
      setError(result.message ?? "User tidak dapat dihapus.");
      setPendingDelete(null);
      return;
    }
    setPendingDelete(null);
    setMessage("User berhasil dihapus.");
    await loadUsers();
  }

  function renderTable(withActions: boolean) {
    return (
      <div className="table-wrapper">
        <table className="table users-table">
          <thead><tr><th>No</th><th>Nama Pengguna</th><th>Email</th><th>Role</th><th>Status</th><th>Terakhir Login</th>{withActions && <th>Aksi</th>}</tr></thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td className="users-name"><Link href={`/users/${user.id}`}>{user.name}</Link></td>
                <td className="users-email">{user.email}</td>
                <td><Badge variant={user.role === "PEGAWAI" ? "purple" : "info"}>{roleLabel(user.role)}</Badge></td>
                <td><Badge variant={user.status === "ACTIVE" ? "success" : "default"}>{user.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</Badge></td>
                <td className="users-last-login">{user.lastLogin}</td>
                {withActions && (
                  <td><div className="users-row-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" type="button" title="Edit user" aria-label={`Edit ${user.name}`} onClick={() => setModalUser({ mode: "edit", user })}><Icon name="edit" size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm users-delete-action" type="button" title="Hapus user" aria-label={`Hapus ${user.name}`} disabled={user.id === currentUser.id} onClick={() => setPendingDelete(user)}><Icon name="trash-2" size={14} /></button>
                  </div></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <PageContainer
      title="Manajemen Pengguna"
      description="Atur hak akses staf kepegawaian BKD dan administrator."
      breadcrumb={[{ label: "ARSIP KKP", href: "/dashboard" }, { label: "Kelola User" }]}
      actions={<button className="btn btn-primary" type="button" onClick={() => { setError(""); setModalUser({ mode: "create" }); }}><Icon name="plus" size={14} />Tambah User Baru</button>}
    >
      <div className="users-page">
        {message && <p className="users-notice" role="status">{message}</p>}
        {error && <p className="users-error" role="alert">{error}<button type="button" onClick={() => setError("")} aria-label="Tutup pesan">×</button></p>}
        <div className="users-tabs" role="tablist" aria-label="Manajemen pengguna">
          <button type="button" role="tab" aria-selected={activeTab === "users"} className={activeTab === "users" ? "users-tab-active" : ""} onClick={() => setActiveTab("users")}>Daftar User</button>
          <button type="button" role="tab" aria-selected={activeTab === "roles"} className={activeTab === "roles" ? "users-tab-active" : ""} onClick={() => setActiveTab("roles")}>Role &amp; Hak Akses</button>
        </div>
        {isLoading ? <div className="users-loading">Memuat data pengguna...</div> : users.length === 0 ? <EmptyState icon="users" title="Belum ada user." message="Tambahkan akun pengguna untuk mulai mengelola akses." /> : (
          <>
            <ContentCard padded={false}>{renderTable(activeTab === "roles")}</ContentCard>
            {activeTab === "users" && (
              <section className="default-permissions-section">
                <h2>Matriks Hak Akses Default</h2>
                <ContentCard padded={false} className="default-permissions-card">
                  <PermissionsMatrix
                    data={HR_OFFICER_PERMISSIONS}
                    mode="read-only"
                    title="Kepegawaian (HR Officer)"
                    description="Akses penuh terhadap data arsip dan dokumen fisik pegawai, terbatas untuk modifikasi kelola user."
                  />
                </ContentCard>
              </section>
            )}
          </>
        )}
      </div>
      {modalUser && <UserModal mode={modalUser.mode} user={modalUser.user} onClose={() => setModalUser(null)} onSave={saveUser} />}
      {pendingDelete && (
        <Modal isOpen onClose={() => setPendingDelete(null)} title="Hapus User?" size="md">
          <p className="user-delete-copy">Apakah Anda yakin ingin menghapus akun <strong>{pendingDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <ModalFooter><button className="btn btn-secondary" type="button" onClick={() => setPendingDelete(null)}>Batal</button><button className="btn btn-danger" type="button" onClick={deleteUser}><Icon name="trash-2" size={14} />Hapus</button></ModalFooter>
        </Modal>
      )}
    </PageContainer>
  );
}
