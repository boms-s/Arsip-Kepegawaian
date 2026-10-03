import type { ManagedUser, PermissionEntry, UserActivity } from "@/types/user-management";

const permissions = (rows: [string, boolean, boolean, boolean, boolean][]): PermissionEntry[] =>
  rows.map(([module, view, create, edit, remove]) => ({ module, view, create, edit, delete: remove }));

export const HR_OFFICER_PERMISSIONS = permissions([
  ["Arsip Kepegawaian", true, true, true, true],
  ["Data Pegawai", true, true, true, true],
  ["Master Data", true, true, false, false],
  ["Laporan", true, true, true, true],
  ["Kelola User", false, false, false, false],
  ["Audit Log", true, false, false, false],
]);

export const ADMIN_SYSTEM_PERMISSIONS = permissions([
  ["Arsip Kepegawaian", true, true, true, true],
  ["Data Pegawai", true, true, true, true],
  ["Master Data", true, true, true, true],
  ["Laporan", true, true, true, true],
  ["Kelola User", true, true, true, true],
  ["Audit Log", true, false, false, false],
]);

export const EMPLOYEE_PERMISSIONS = permissions([
  ["Arsip Kepegawaian", true, false, false, false],
  ["Data Pegawai", true, false, false, false],
  ["Master Data", false, false, false, false],
  ["Laporan", false, false, false, false],
  ["Kelola User", false, false, false, false],
  ["Audit Log", false, false, false, false],
]);

export const DUMMY_USERS: ManagedUser[] = [
  { id: "user-budi", name: "Budi Santoso", email: "budi.s@pemerintah.go.id", role: "ADMIN_KEPEGAWAIAN", status: "ACTIVE", lastLogin: "5 mnt lalu", organization: "Badan Kepegawaian Daerah", department: "Seksi Manajemen Kinerja & Arsip Kepegawaian", createdAt: "2024-01-15T00:00:00.000Z", permissions: HR_OFFICER_PERMISSIONS },
  { id: "user-siti", name: "Siti Aminah", email: "siti.aminah@pemerintah.go.id", role: "ADMIN_KEPEGAWAIAN", status: "ACTIVE", lastLogin: "2 jam lalu", organization: "Badan Kepegawaian Daerah", department: "Bidang Mutasi dan Promosi", createdAt: "2024-02-02T00:00:00.000Z", permissions: HR_OFFICER_PERMISSIONS },
  { id: "user-agus", name: "Agus Setiawan", email: "agus.s@pemerintah.go.id", role: "PEGAWAI", status: "ACTIVE", lastLogin: "Kemarin", organization: "Badan Kepegawaian Daerah", department: "Bidang Pengembangan Kompetensi", createdAt: "2024-03-10T00:00:00.000Z", permissions: EMPLOYEE_PERMISSIONS },
  { id: "user-rian", name: "Rian Pratama", email: "rian.pratama@pemerintah.go.id", role: "PEGAWAI", status: "ACTIVE", lastLogin: "3 hari lalu", organization: "Badan Kepegawaian Daerah", department: "Seksi Pengadaan dan Pemberhentian", createdAt: "2024-05-21T00:00:00.000Z", permissions: EMPLOYEE_PERMISSIONS },
  { id: "user-endang", name: "Dra. Endang", email: "endang.l@pemerintah.go.id", role: "ADMIN_SISTEM", status: "INACTIVE", lastLogin: "1 minggu lalu", organization: "Badan Kepegawaian Daerah", department: "Seksi Manajemen Kinerja & Arsip Kepegawaian", createdAt: "2024-01-15T00:00:00.000Z", permissions: ADMIN_SYSTEM_PERMISSIONS },
  { id: "user-yusuf", name: "Yusuf S.H.", email: "yusuf.m@pemerintah.go.id", role: "PEGAWAI", status: "ACTIVE", lastLogin: "2 minggu lalu", organization: "Badan Kepegawaian Daerah", department: "Bidang Data dan Informasi", createdAt: "2024-08-01T00:00:00.000Z", permissions: EMPLOYEE_PERMISSIONS },
  { id: "dev-admin-system", name: "Hendra Wijaya, S.Kom", email: "hendra.w@pemerintah.go.id", role: "ADMIN_SISTEM", status: "ACTIVE", lastLogin: "Sekarang", organization: "Badan Kepegawaian Daerah", department: "Seksi Manajemen Kinerja & Arsip Kepegawaian", createdAt: "2024-01-15T00:00:00.000Z", permissions: ADMIN_SYSTEM_PERMISSIONS },
];

export const DUMMY_USER_ACTIVITIES: UserActivity[] = [
  { id: "activity-1", userId: "user-budi", timestamp: "2025-10-14T03:24:00.000Z", activity: "Unggah Dokumen", module: "Arsip Kepegawaian", description: "Mengunggah SK_Pangkat_Hendra.pdf" },
  { id: "activity-2", userId: "user-budi", timestamp: "2025-10-14T02:15:00.000Z", activity: "Verifikasi Berkas", module: "Arsip Kepegawaian", description: "Memverifikasi berkas mutasi Budi Santoso" },
  { id: "activity-3", userId: "user-budi", timestamp: "2025-10-13T09:40:00.000Z", activity: "Edit Data Pegawai", module: "Data Pegawai", description: "Mengubah alamat email Siti Aminah" },
  { id: "activity-4", userId: "user-budi", timestamp: "2025-10-12T04:02:00.000Z", activity: "Unduh Laporan", module: "Laporan", description: "Mengunduh rekapitulasi data mutasi Triwulan II" },
  { id: "activity-5", userId: "user-budi", timestamp: "2025-10-11T01:30:00.000Z", activity: "Login Sistem", module: "Sistem", description: "Berhasil melakukan login dari IP 192.168.1.45" },
];