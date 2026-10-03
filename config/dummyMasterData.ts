export type MasterDataStatus = "AKTIF" | "NONAKTIF";

export interface DocumentCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  status: MasterDataStatus;
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  format: string;
  status: MasterDataStatus;
}

export const DUMMY_DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: "cat-1", code: "KAT-PANGKAT", name: "Pengangkatan", description: "SK kenaikan pangkat, pengangkatan ASN, berkas golongan.", status: "AKTIF" },
  { id: "cat-2", code: "KAT-MUTASI", name: "Mutasi", description: "SK alih tugas jabatan, penugasan wilayah baru, pemindahan divisi.", status: "AKTIF" },
  { id: "cat-3", code: "KAT-AWARD", name: "Penghargaan", description: "Sertifikat penghargaan, tanda jasa kehormatan daerah.", status: "AKTIF" },
  { id: "cat-4", code: "KAT-LUCK", name: "Kesejahteraan", description: "Cuti besar, jaminan kesehatan, asuransi pegawai, bantuan.", status: "NONAKTIF" },
  { id: "cat-5", code: "KAT-EDU", name: "Pendidikan", description: "Ijazah penyetaraan, pelatihan kepemimpinan, sertifikat diklat.", status: "AKTIF" },
];

export const DUMMY_DOCUMENT_TYPES: DocumentType[] = [
  { id: "type-1", code: "DOC-KNP", name: "SK Kenaikan Pangkat", categoryId: "cat-1", format: "Wajib PDF / Max 5MB", status: "AKTIF" },
  { id: "type-2", code: "DOC-MUT", name: "SK Mutasi Wilayah", categoryId: "cat-2", format: "Format standar BKN", status: "AKTIF" },
  { id: "type-3", code: "DOC-TGS", name: "Surat Tugas Dinas", categoryId: "cat-2", format: "PDF Bertanda tangan elektronik", status: "AKTIF" },
  { id: "type-4", code: "DOC-SLKC", name: "Satyalancana Karya", categoryId: "cat-3", format: "Sertifikat resmi negara", status: "AKTIF" },
  { id: "type-5", code: "DOC-CUTI", name: "Surat Cuti Tahunan", categoryId: "cat-4", format: "SK PPK Instansi", status: "NONAKTIF" },
];