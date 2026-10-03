import type { Metadata } from "next";
import PageContainer from "@/components/layout/PageContainer";
import PlaceholderPage from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Jenis Dokumen",
};

/**
 * Halaman Jenis Dokumen (Master Data).
 *
 * TODO (Modul berikutnya): CRUD jenis dokumen.
 */
export default function JenisDokumenPage() {
  return (
    <PageContainer
      title="Jenis Dokumen"
      description="Kelola jenis dokumen arsip"
      breadcrumb={[
        { label: "Master Data" },
        { label: "Jenis Dokumen" },
      ]}
    >
      <PlaceholderPage
        title="Jenis Dokumen"
        description="Daftar jenis dokumen akan ditampilkan di sini."
        icon="file-text"
      />
    </PageContainer>
  );
}
