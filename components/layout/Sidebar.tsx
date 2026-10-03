"use client";

import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/contexts/AppContext";
import { navigationConfig, adminNavigationConfig, APP_NAME } from "@/config/navigation";
import NavigationItem from "@/components/layout/NavigationItem";
import Icon from "@/components/ui/Icon";

export default function Sidebar() {
  const { currentUser, isMobileSidebarOpen, closeMobileSidebar } = useApp();
  const isAdminSistem = currentUser.role === "ADMIN_SISTEM";

  return (
    <>
      {/* Overlay mobile */}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Panel sidebar */}
      <aside
        id="sidebar"
        className={[
          "sidebar",
          isMobileSidebarOpen ? "sidebar-mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Navigasi utama"
      >
        {/* Header sidebar */}
        <div className="sidebar-header">
          <Link
            href="/dashboard"
            className="sidebar-logo"
            onClick={closeMobileSidebar}
          >
            <div className="sidebar-logo-icon">
              <Image
                src="/logo-kkp.png"
                width={36}
                height={36}
                alt="Logo Kementerian Kelautan dan Perikanan"
                priority
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">{APP_NAME}</span>
              <span className="sidebar-logo-subtitle">ARSIP KEPEGAWAIAN</span>
            </div>
          </Link>

          {/* Tombol tutup — hanya tampil di mobile */}
          <button
            className="sidebar-close-btn"
            onClick={closeMobileSidebar}
            aria-label="Tutup navigasi"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Scrollable nav area */}
        <nav className="sidebar-nav" aria-label="Menu navigasi">
          {/* Menu utama */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">Menu Utama</p>
            <ul role="list" className="sidebar-menu">
              {navigationConfig.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  onNavigate={closeMobileSidebar}
                />
              ))}
            </ul>
          </div>

          {/* Menu Admin Sistem — hanya muncul untuk ADMIN_SISTEM */}
          {isAdminSistem && (
            <div className="sidebar-section">
              <p className="sidebar-section-label">Sistem &amp; Pengaturan</p>
              <ul role="list" className="sidebar-menu">
                {adminNavigationConfig.map((item) => (
                  <NavigationItem
                    key={item.href}
                    item={item}
                    onNavigate={closeMobileSidebar}
                  />
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer sidebar — info versi */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">v1.2.0-Bootstrap5</p>
        </div>
      </aside>
    </>
  );
}
