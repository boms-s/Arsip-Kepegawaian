import Icon from "@/components/ui/Icon";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: string;
}

/**
 * Halaman placeholder untuk route yang belum diimplementasikan.
 *
 * Digunakan sebagai konten sementara agar routing sudah berfungsi
 * tanpa perlu membuat seluruh UI fitur.
 */
export default function PlaceholderPage({
  title,
  description = "Halaman ini sedang dalam pengembangan.",
  icon = "file-text",
}: PlaceholderPageProps) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon-wrapper" aria-hidden="true">
        <Icon name={icon} size={40} className="text-slate-400" />
      </div>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-description">{description}</p>
      <div className="placeholder-badge">
        <span>🚧 Under Construction — Modul berikutnya</span>
      </div>
    </div>
  );
}
