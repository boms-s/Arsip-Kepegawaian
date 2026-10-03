"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { APP_NAME } from "@/config/navigation";
import { logout } from "@/config/dummyAuth";
import Icon from "@/components/ui/Icon";

/**
 * Label tampilan untuk setiap role.
 * TODO: Nanti bisa diambil dari API jika ada data role yang lebih detail.
 */
const ROLE_LABELS: Record<string, string> = {
  ADMIN_SISTEM: "Administrator Utama",
  ADMIN_KEPEGAWAIAN: "Administrator Kepegawaian",
  PEGAWAI: "Pegawai",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentUser, isMobileSidebarOpen, toggleMobileSidebar } = useApp();
  const roleLabel = ROLE_LABELS[currentUser.role] ?? currentUser.role;
  const pageTitle = pathname === "/arsip"
    ? "Daftar Arsip Kepegawaian"
    : pathname === "/arsip/tambah"
      ? "Tambah Arsip Baru"
      : pathname.startsWith("/arsip/") && pathname.endsWith("/edit")
        ? "Edit Arsip Kepegawaian"
        : pathname.startsWith("/arsip/")
          ? "Detail Arsip Kepegawaian"
          : pathname.startsWith("/pegawai")
    ? "Data Pegawai"
    : pathname.startsWith("/dashboard")
      ? "Dashboard"
      : pathname.startsWith("/arsip")
        ? "Arsip Kepegawaian"
        : pathname.startsWith("/master-data")
          ? "Master Data Kepegawaian"
            : pathname.startsWith("/laporan")
            ? "Laporan Statistik Dokumen & Arsip"
            : pathname.startsWith("/audit-log")
              ? "Audit Log Aktivitas Sistem"
              : pathname.startsWith("/users/")
                ? "Detail Informasi Pengguna"
                : pathname.startsWith("/users")
                  ? "Manajemen Pengguna & Hak Akses"
                : APP_NAME;

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="navbar" role="banner">
      {/* Kiri: tombol hamburger (mobile) + judul halaman */}
      <div className="navbar-left">
        <button
          id="mobile-sidebar-toggle"
          className="navbar-hamburger"
          onClick={toggleMobileSidebar}
          aria-label="Buka navigasi"
          aria-controls="sidebar"
          aria-expanded={isMobileSidebarOpen}
        >
          <Icon name="menu" size={22} />
        </button>

        <span className="navbar-app-name">{pageTitle}</span>
      </div>

      {/* Kanan: pencarian, notifikasi, dan akun */}
      <div className="navbar-right">
        <label className="navbar-search" htmlFor="navbar-search-input">
          <Icon name="search" size={15} aria-hidden="true" />
          <input id="navbar-search-input" type="search" placeholder="Cari arsip, dokumen, NIP..." />
        </label>
        <button className="navbar-notification" type="button" aria-label="Notifikasi">
          <Icon name="bell" size={18} />
          <span aria-hidden="true" />
        </button>
        <div className="navbar-account">
          <button
            className="navbar-user"
            type="button"
            aria-label="Buka menu akun"
            aria-expanded={isUserMenuOpen}
            onClick={() => setIsUserMenuOpen((open) => !open)}
          >
            <div className="navbar-user-avatar" aria-hidden="true">
              <Icon name="user" size={16} className="text-primary-600" />
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{currentUser.name}</span>
              <span className="navbar-user-role">{roleLabel}</span>
            </div>
            <Icon name="chevron-down" size={14} />
          </button>
          {isUserMenuOpen && (
            <div className="navbar-user-menu">
              <button
                id="logout-button"
                className="navbar-user-menu-item"
                type="button"
                onClick={handleLogout}
              >
                <Icon name="log-out" size={16} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
