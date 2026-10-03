import type { ReactNode } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import type { BreadcrumbItem } from "@/components/layout/Breadcrumb";
import PageHeader from "@/components/layout/PageHeader";

interface PageContainerProps {
  /** Judul halaman */
  title: string;
  /** Deskripsi singkat halaman (opsional) */
  description?: string;
  /** Data breadcrumb */
  breadcrumb?: BreadcrumbItem[];
  /** Konten halaman */
  children: ReactNode;
  /** Elemen tambahan di sebelah kanan header (misal: tombol aksi) */
  actions?: ReactNode;
}

/**
 * Wrapper standar untuk semua halaman.
 * Menyediakan layout konsisten: breadcrumb, heading, actions, dan konten.
 *
 * Penggunaan:
 * ```tsx
 * <PageContainer
 *   title="Data Pegawai"
 *   description="Daftar seluruh pegawai aktif"
 *   breadcrumb={[{ label: "Data Pegawai" }]}
 *   actions={<button>Tambah Pegawai</button>}
 * >
 *   {content}
 * </PageContainer>
 * ```
 */
export default function PageContainer({
  title,
  description,
  breadcrumb,
  children,
  actions,
}: PageContainerProps) {
  return (
    <div className="page-container">
      {/* Header halaman */}
      <div className="page-header">
        {breadcrumb && breadcrumb.length > 0 && (
          <Breadcrumb items={breadcrumb} />
        )}
        <PageHeader title={title} description={description} actions={actions} />
      </div>

      {/* Konten halaman */}
      <div className="page-content">{children}</div>
    </div>
  );
}
