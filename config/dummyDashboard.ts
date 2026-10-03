export interface DashboardSummary {
  totalPegawai: number;
  totalArsip: number;
  totalKategori: number;
  totalJenisDokumen: number;
}

export interface DashboardActivity {
  id: string;
  documentName: string;
  category: string;
  date: string;
  status: "Tersimpan" | "Dalam proses";
}

export interface DashboardData {
  summary: DashboardSummary;
  activities: DashboardActivity[];
}

// TEMPORARY FRONTEND DATA. Replace with GET /api/dashboard when the backend is ready.
export const DUMMY_DASHBOARD: DashboardData = {
  summary: {
    totalPegawai: 128,
    totalArsip: 864,
    totalKategori: 8,
    totalJenisDokumen: 14,
  },
  activities: [
    {
      id: "activity-01",
      documentName: "Surat Keputusan Pengangkatan",
      category: "Kepegawaian",
      date: "2026-09-28",
      status: "Tersimpan",
    },
    {
      id: "activity-02",
      documentName: "Dokumen Riwayat Pendidikan",
      category: "Data Pegawai",
      date: "2026-09-26",
      status: "Dalam proses",
    },
    {
      id: "activity-03",
      documentName: "Surat Keterangan Jabatan",
      category: "Kepegawaian",
      date: "2026-09-24",
      status: "Tersimpan",
    },
  ],
};