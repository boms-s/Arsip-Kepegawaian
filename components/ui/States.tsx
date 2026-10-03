/**
 * Komponen state reusable: LoadingState, EmptyState, ErrorState, ContentCard.
 *
 * Digunakan di seluruh halaman untuk menampilkan kondisi data yang berbeda.
 */

import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";

/* ============================================================
   LOADING STATE
   ============================================================ */
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Memuat data..." }: LoadingStateProps) {
  return (
    <div className="state-container" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <p className="state-message">{message}</p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = "inbox",
  title = "Belum ada data",
  message = "Tidak ada data yang tersedia saat ini.",
  action,
}: EmptyStateProps) {
  return (
    <div className="state-container">
      <div className="state-icon-wrapper" aria-hidden="true">
        <Icon name={icon} size={36} className="state-icon" />
      </div>
      <p className="state-title">{title}</p>
      <p className="state-message">{message}</p>
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

/* ============================================================
   ERROR STATE
   ============================================================ */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Data tidak dapat dimuat. Silakan coba lagi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-container">
      <div className="state-icon-wrapper state-icon-error" aria-hidden="true">
        <Icon name="alert-circle" size={36} className="text-red-500" />
      </div>
      <p className="state-title">{title}</p>
      <p className="state-message">{message}</p>
      {onRetry && (
        <div className="state-action">
          <button className="btn btn-secondary" onClick={onRetry}>
            <Icon name="refresh-cw" size={15} />
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CONTENT CARD
   ============================================================ */
interface ContentCardProps {
  children: ReactNode;
  className?: string;
  /** Padding dalam card — default: true */
  padded?: boolean;
}

export function ContentCard({ children, className = "", padded = true }: ContentCardProps) {
  return (
    <div className={`content-card ${padded ? "content-card-padded" : ""} ${className}`}>
      {children}
    </div>
  );
}
