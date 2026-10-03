/**
 * Komponen Alert reusable untuk menampilkan pesan informasi, sukses, peringatan, dan error.
 *
 * Penggunaan:
 * ```tsx
 * <Alert variant="success" message="Data berhasil disimpan." onClose={() => setAlert(null)} />
 * <Alert variant="error" message="Terjadi kesalahan." />
 * ```
 */

import Icon from "@/components/ui/Icon";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { icon: string; containerClass: string; iconClass: string; titleClass: string; msgClass: string }
> = {
  info: {
    icon: "info",
    containerClass: "alert-info",
    iconClass: "alert-icon-info",
    titleClass: "alert-title-info",
    msgClass: "alert-msg-info",
  },
  success: {
    icon: "check-circle",
    containerClass: "alert-success",
    iconClass: "alert-icon-success",
    titleClass: "alert-title-success",
    msgClass: "alert-msg-success",
  },
  warning: {
    icon: "alert-triangle",
    containerClass: "alert-warning",
    iconClass: "alert-icon-warning",
    titleClass: "alert-title-warning",
    msgClass: "alert-msg-warning",
  },
  error: {
    icon: "x-circle",
    containerClass: "alert-error",
    iconClass: "alert-icon-error",
    titleClass: "alert-title-error",
    msgClass: "alert-msg-error",
  },
};

export default function Alert({
  variant = "info",
  title,
  message,
  onClose,
  className = "",
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={`alert ${config.containerClass} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <Icon name={config.icon} size={18} className={`alert-icon ${config.iconClass}`} />
      <div className="alert-body">
        {title && <p className={`alert-title ${config.titleClass}`}>{title}</p>}
        <p className={`alert-message ${config.msgClass}`}>{message}</p>
      </div>
      {onClose && (
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Tutup notifikasi"
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
