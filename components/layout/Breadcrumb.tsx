"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Komponen Breadcrumb yang menerima data dinamis.
 *
 * Penggunaan:
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Arsip", href: "/arsip" },
 *     { label: "Detail Arsip" }, // tanpa href = item aktif (tidak bisa diklik)
 *   ]}
 * />
 * ```
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list" role="list">
        {items[0]?.label !== "SIARSIP" && items[0]?.label !== "Arsip" && (
          <li className="breadcrumb-item">
            <Link href="/dashboard" className="breadcrumb-link" aria-label="Dashboard">
              <Icon name="home" size={14} />
            </Link>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.href ?? item.label}-${index}`} className="breadcrumb-item">
              {/* Separator */}
              <Icon
                name="chevron-right"
                size={14}
                className="breadcrumb-separator"
                aria-hidden="true"
              />

              {/* Link atau teks biasa (item aktif) */}
              {item.href && !isLast ? (
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span
                  className="breadcrumb-current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
