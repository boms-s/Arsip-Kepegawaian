import type { Metadata } from "next";
import PageContainer from "@/components/layout/PageContainer";
import PlaceholderPage from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Riwayat Arsip",
};

/**
 * Halaman Riwayat Arsip.
 *
 * TODO (Modul berikutnya): Timeline/log perubahan arsip.
 */
export default function RiwayatPage() {
  return (
    <PageContainer
      title="Riwayat Arsip"
      description="Lihat riwayat perubahan dan aktivitas arsip"
      breadcrumb={[{ label: "Riwayat Arsip" }]}
    >
      <PlaceholderPage
        title="Riwayat Arsip"
        description="Timeline riwayat perubahan arsip akan ditampilkan di sini."
        icon="clock"
      />
    </PageContainer>
  );
}
