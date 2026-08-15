"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./AdminShell.module.css";

const sections = [
  { href: "/admin", label: "Огляд", icon: "⌂", exact: true },
  { href: "/admin/doctors", label: "Лікарі", icon: "✚" },
  { href: "/admin/bookings", label: "Заявки", icon: "▤" },
  { href: "/admin/prices", label: "Прайс", icon: "₴" },
  { href: "/admin/locations", label: "Відділення", icon: "⌖" },
  { href: "/admin/banners", label: "Банери", icon: "▧" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return children;

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/admin">
          <span className={styles.brandMark}>ЗР</span>
          <span className={styles.brandText}>
            Здорова Родина
            <small>Панель керування</small>
          </span>
        </Link>

        <p className={styles.navLabel}>Навігація</p>
        <nav className={styles.nav} aria-label="Розділи адмінпанелі">
          {sections.map((section) => {
            const active = section.exact
              ? pathname === section.href
              : pathname.startsWith(section.href);
            return (
              <Link
                key={section.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                href={section.href}
              >
                <span className={styles.navIcon} aria-hidden="true">{section.icon}</span>
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link className={styles.secondaryAction} href="/">↗ На сайт</Link>
          <button className={styles.logout} onClick={logout} type="button">Вийти</button>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
