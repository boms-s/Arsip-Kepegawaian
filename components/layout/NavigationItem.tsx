"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import type { NavItem } from "@/config/navigation";

interface NavigationItemProps {
  item: NavItem;
  /** Level kedalaman (0 = root, 1 = child) */
  depth?: number;
  /** Callback untuk menutup sidebar setelah klik (digunakan di mobile) */
  onNavigate?: () => void;
}

export default function NavigationItem({
  item,
  depth = 0,
  onNavigate,
}: NavigationItemProps) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;

  // Cek apakah item ini atau salah satu anaknya aktif
  const isActive = pathname === item.href || (item.href === "/users" && pathname.startsWith("/users/"));
  const isChildActive =
    hasChildren &&
    item.children!.some(
      (child) => pathname === child.href || pathname.startsWith(child.href + "/")
    );

  const [isOpen, setIsOpen] = useState(isChildActive);

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className={[
            "nav-item group w-full",
            depth === 0 ? "nav-item-root" : "nav-item-child",
            isChildActive ? "nav-item-active-parent" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Icon
            name={item.icon}
            size={18}
            className={[
              "nav-item-icon shrink-0",
              isChildActive ? "text-primary-600" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <span className="nav-item-label flex-1 text-left">{item.label}</span>
          <Icon
            name={isOpen ? "chevron-down" : "chevron-right"}
            size={16}
            className="nav-item-chevron shrink-0 transition-transform duration-200"
          />
        </button>

        {isOpen && (
          <ul className="nav-submenu" role="list">
            {item.children!.map((child) => (
              <NavigationItem
                key={child.href}
                item={child}
                depth={1}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={[
          "nav-item group",
          depth === 0 ? "nav-item-root" : "nav-item-child",
          isActive ? "nav-item-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          name={item.icon}
          size={18}
          className={[
            "nav-item-icon shrink-0",
            isActive ? "text-primary-600" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <span className="nav-item-label">{item.label}</span>
        {isActive && <span className="nav-item-active-indicator" />}
      </Link>
    </li>
  );
}
