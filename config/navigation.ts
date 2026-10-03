import type { UserRole } from "@/types/auth";

/**
 * Tipe untuk satu item navigasi.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // nama icon (digunakan oleh komponen Icon)
  /** Jika ada children, item ini menjadi collapsible group */
  children?: NavItem[];
  /** Hanya tampil untuk role tertentu. Kosong = tampil untuk semua role */
  allowedRoles?: UserRole[];
}

/**
 * Konfigurasi navigasi sidebar.
 *
 * Setiap item yang memiliki allowedRoles hanya akan ditampilkan
 * jika role user cocok. Item tanpa allowedRoles tampil untuk semua role.
 */
export const navigationConfig: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "Data Pegawai",
    href: "/pegawai",
    icon: "users",
  },
  {
    label: "Master Data",
    href: "/master-data",
    icon: "database",
  },
  {
    label: "Arsip Kepegawaian",
    href: "/arsip",
    icon: "archive",
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: "chart-bar",
  },
];

/**
 * Navigasi khusus Admin Sistem.
 *
 * Bagian ini hanya ditampilkan jika role user adalah ADMIN_SISTEM.
 */
export const adminNavigationConfig: NavItem[] = [
  {
    label: "Kelola User",
    href: "/users",
    icon: "user-cog",
    allowedRoles: ["ADMIN_SISTEM"],
  },
  {
    label: "Audit Log",
    href: "/audit-log",
    icon: "shield-check",
    allowedRoles: ["ADMIN_SISTEM"],
  },
];

/**
 * Nama aplikasi yang tampil di Navbar/Sidebar.
 *
 * TODO: Bisa dipindahkan ke environment variable atau config API nanti.
 */
export const APP_NAME = "ARSIP KKP";

/**
 * Subtitle aplikasi.
 */
export const APP_SUBTITLE = "Arsip Kepegawaian";
