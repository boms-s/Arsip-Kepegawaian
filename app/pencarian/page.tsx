import type { Metadata } from "next";
import PageContainer from "@/components/layout/PageContainer";
import PlaceholderPage from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Pencarian Arsip",
};

/**
 * Halaman Pencarian & Filter Arsip.
 *
 * TODO (Modul berikutnya): Form pencarian dengan filter multi-kriteria.
 */
export default function PencarianPage() {
  return (
    <PageContainer
      title="Pencarian Arsip"
      description="Cari dan filter arsip berdasarkan berbagai kriteria"
      breadcrumb={[{ label: "Pencarian Arsip" }]}
    >
      <PlaceholderPage
        title="Pencarian & Filter Arsip"
        description="Form pencarian dan filter arsip akan ditampilkan di sini."
        icon="search"
      />
    </PageContainer>
  );
}
