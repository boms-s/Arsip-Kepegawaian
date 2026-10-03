"use client";

import { useParams } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/States";
import ArchiveForm from "@/components/arsip/ArchiveForm";
import { useArchiveDatabase } from "@/config/archiveStore";
import Link from "next/link";

export default function EditArsipPage() {
  const { id } = useParams<{ id: string }>();
  const database = useArchiveDatabase();
  const record = database.records.find((item) => item.id === id);

  if (record) return <ArchiveForm key={record.id} record={record} />;
  return (
    <PageContainer title="Edit Arsip Kepegawaian" breadcrumb={[{ label: "Arsip", href: "/arsip" }, { label: "Edit Arsip" }]}>
      <EmptyState icon="archive" title="Arsip tidak ditemukan." message="Arsip mungkin telah dihapus atau tautan tidak valid." action={<Link className="btn btn-secondary" href="/arsip">Kembali ke Daftar Arsip</Link>} />
    </PageContainer>
  );
}
