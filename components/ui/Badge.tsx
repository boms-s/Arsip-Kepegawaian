/**
 * Komponen Badge untuk menampilkan status atau label kecil.
 *
 * Penggunaan:
 * ```tsx
 * <Badge variant="success">Aktif</Badge>
 * <Badge variant="danger">Nonaktif</Badge>
 * ```
 */

import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  default: "badge-default",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
  purple: "badge-purple",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
}
