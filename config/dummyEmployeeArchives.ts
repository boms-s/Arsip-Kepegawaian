export interface EmployeeArchive {
  id: string;
  employeeId: string;
  date: string;
  category: string;
  fileName: string;
  uploadedBy: string;
}

// Temporary frontend fixtures; replace with the employee archive API when available.
export const DUMMY_EMPLOYEE_ARCHIVES: EmployeeArchive[] = [
  { id: "archive-001", employeeId: "employee-001", date: "12 Mar 2025", category: "Pengangkatan", fileName: "SK_Pengangkatan_PNS_RinaKurniawati.pdf", uploadedBy: "Hendra Wijaya" },
  { id: "archive-002", employeeId: "employee-001", date: "05 Jan 2025", category: "Mutasi", fileName: "SK_Alih_Tugas_RinaKurniawati.pdf", uploadedBy: "Hendra Wijaya" },
  { id: "archive-003", employeeId: "employee-001", date: "18 Nov 2024", category: "Pendidikan", fileName: "Ijazah_Pendidikan_RinaKurniawati.pdf", uploadedBy: "Siti Aminah" },
  { id: "archive-004", employeeId: "employee-001", date: "30 Aug 2024", category: "Kesejahteraan", fileName: "Surat_Keterangan_Cuti_RinaKurniawati.pdf", uploadedBy: "Siti Aminah" },
  { id: "archive-005", employeeId: "employee-001", date: "15 Mei 2024", category: "Penghargaan", fileName: "Sertifikat_Penghargaan_RinaKurniawati.pdf", uploadedBy: "Hendra Wijaya" },
];