"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./AdminShell.module.css";

const sections = [
  { href: "/admin/doctors", label: "Лікарі" },
  { href: "/admin/bookings", label: "Заявки" },
  { href: "/admin/prices", label: "Прайс" },
  { href: "/admin/locations", label: "Відділення" },
  { href: "/admin/banners", label: "Банери" },
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
      <header className={styles.header}>
        <Link className={styles.brand} href="/admin/doctors">
          <span className={styles.brandMark}>ЗР</span>
          <span className={styles.brandText}>
            Адмінпанель
            <small>Медичний центр «Здорова Родина»</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Розділи адмінпанелі">
          {sections.map((section) => {
            const active = pathname.startsWith(section.href);
            return (
              <Link
                key={section.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                href={section.href}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <Link className={styles.siteLink} href="/">На сайт</Link>
          <button className={styles.logout} onClick={logout} type="button">Вийти</button>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
