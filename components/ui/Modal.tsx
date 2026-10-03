"use client";

/**
 * Komponen Modal reusable.
 *
 * Penggunaan:
 * ```tsx
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Konfirmasi">
 *   <p>Yakin ingin menghapus?</p>
 * </Modal>
 * ```
 */

import { useEffect, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Lebar modal — sm | md | lg | xl */
  size?: "sm" | "md" | "lg" | "xl";
  /** Sembunyikan tombol close di header */
  hideCloseButton?: boolean;
  /** Sembunyikan header bawaan untuk konten modal dengan heading khusus */
  hideHeader?: boolean;
}

const sizeClass: Record<string, string> = {
  sm: "modal-sm",
  md: "modal-md",
  lg: "modal-lg",
  xl: "modal-xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  hideCloseButton = false,
  hideHeader = false,
}: ModalProps) {
  // Tutup dengan Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={hideHeader ? "modal-title" : undefined}
      aria-label={hideHeader ? undefined : title}
    >
      {/* Panel modal — stop propagation agar klik dalam modal tidak tutup */}
      <div
        className={`modal-panel ${sizeClass[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">{title}</h2>
            {!hideCloseButton && (
              <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
                <Icon name="x" size={18} />
              </button>
            )}
          </div>
        )}

        {/* Konten */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL FOOTER — helper opsional
   ============================================================ */
interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return <div className="modal-footer">{children}</div>;
}
