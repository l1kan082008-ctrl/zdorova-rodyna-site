"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./AdminShell.module.css";

const sections = [
  { href: "/admin", label: "Огляд", icon: "⌂", exact: true },
  { href: "/admin/doctors", label: "Лікарі", icon: "✚" },
  { href: "/admin/services", label: "Послуги", icon: "◇" },
  { href: "/admin/bookings", label: "Заявки", icon: "▤" },
  { href: "/admin/prices", label: "Прайс", icon: "₴" },
  { href: "/admin/locations", label: "Відділення", icon: "⌖" },
  { href: "/admin/banners", label: "Банери", icon: "▧" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  if (pathname === "/admin/login") return children;

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className={styles.shell}>
      <header className={styles.mobileHeader}>
        <Link className={styles.mobileBrand} href="/admin" onClick={() => setMenuOpen(false)}>
          <span className={styles.brandMark}>ЗР</span>
          <span className={styles.brandText}>
            Здорова Родина
            <small>Панель керування</small>
          </span>
        </Link>
        <button
          aria-controls="admin-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Закрити навігацію" : "Відкрити навігацію"}
          className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <button
        aria-label="Закрити навігацію"
        className={`${styles.backdrop} ${menuOpen ? styles.backdropVisible : ""}`}
        onClick={() => setMenuOpen(false)}
        tabIndex={menuOpen ? 0 : -1}
        type="button"
      />

      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
        id="admin-navigation"
      >
        <Link className={styles.brand} href="/admin" onClick={() => setMenuOpen(false)}>
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
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.navIcon} aria-hidden="true">{section.icon}</span>
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link className={styles.secondaryAction} href="/" onClick={() => setMenuOpen(false)}>↗ На сайт</Link>
          <button className={styles.logout} onClick={logout} type="button">Вийти</button>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
