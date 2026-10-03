"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Layout utama aplikasi.
 * Menyusun Sidebar + Navbar + area konten.
 *
 * Struktur:
 * ┌─────────────────────────────────┐
 * │  Sidebar  │  Navbar             │
 * │           ├─────────────────────│
 * │           │  Content (children) │
 * └─────────────────────────────────┘
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="main-layout">
      {/* Sidebar kiri */}
      <Sidebar />

      {/* Area kanan: navbar + konten */}
      <div className="main-content-wrapper">
        <Navbar />

        {/* Area konten utama */}
        <main className="main-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
