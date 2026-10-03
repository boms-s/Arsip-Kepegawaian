import type { Metadata } from "next";
import PageContainer from "@/components/layout/PageContainer";
import PlaceholderPage from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Kategori Dokumen",
};

/**
 * Halaman Kategori Dokumen (Master Data).
 *
 * TODO (Modul berikutnya): CRUD kategori dokumen.
 */
export default function KategoriDokumenPage() {
  return (
    <PageContainer
      title="Kategori Dokumen"
      description="Kelola kategori dokumen arsip"
      breadcrumb={[
        { label: "Master Data" },
        { label: "Kategori Dokumen" },
      ]}
    >
      <PlaceholderPage
        title="Kategori Dokumen"
        description="Daftar kategori dokumen akan ditampilkan di sini."
        icon="folder"
      />
    </PageContainer>
  );
}
