"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useModalDialog } from "../components/useModalDialog";
import "./admin-ui.css";
import styles from "./AdminShell.module.css";

const sections = [
  { href: "/admin", label: "Огляд", icon: "overview", exact: true },
  { href: "/admin/doctors", label: "Лікарі", icon: "doctors" },
  { href: "/admin/services", label: "Послуги", icon: "services" },
  { href: "/admin/bookings", label: "Заявки", icon: "bookings" },
  { href: "/admin/prices", label: "Прайс", icon: "prices" },
  { href: "/admin/locations", label: "Відділення", icon: "locations" },
  { href: "/admin/banners", label: "Банери", icon: "banners" },
  { href: "/admin/settings", label: "Налаштування", icon: "settings" },
] as const;

function NavigationIcon({ name }: { name: typeof sections[number]["icon"] | "external" | "logout" }) {
  const paths: Record<typeof name, ReactNode> = {
    overview: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h5v-6h4v6h5V9" /></>,
    doctors: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M19 7v6m-3-3h6" /></>,
    services: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8m-4-4h8" /></>,
    bookings: <><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4m8-4v4M4 11h16m-12 5h3m3 0h2" /></>,
    prices: <><path d="M4 4h7l9 9-7 7-9-9V4Z" /><circle cx="8" cy="8" r="1" /></>,
    locations: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    banners: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8" cy="9" r="1.5" /><path d="m3 17 5-4 4 3 4-6 5 7" /></>,
    settings: <><path d="M4 7h2m6 0h8M4 17h8m6 0h2" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></>,
    external: <><path d="M14 4h6v6m0-6L10 14M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></>,
    logout: <><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4m6-12 4 4-4 4m-6-4h12" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const mobileQuery = "(max-width: 900px)";
function subscribeToViewport(onChange: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const isMobileViewport = () => window.matchMedia(mobileQuery).matches;
const serverViewport = () => false;

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useSyncExternalStore(subscribeToViewport, isMobileViewport, serverViewport);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = isMobile && menuPath === pathname;
  const navigationRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModalDialog({
    open: menuOpen,
    dialogRef: navigationRef,
    onClose: () => setMenuPath(null),
    initialFocusRef: closeButtonRef,
    restoreFocusRef: menuButtonRef,
  });

  useEffect(() => {
    const media = window.matchMedia(mobileQuery);
    const closeDesktopMenu = () => { if (!media.matches) setMenuPath(null); };
    media.addEventListener("change", closeDesktopMenu);
    return () => media.removeEventListener("change", closeDesktopMenu);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [menuOpen]);

  if (pathname === "/admin/login") return <div className="admin-ui" data-admin-ui>{children}</div>;

  const logout = async () => {
    await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "same-origin",
      cache: "no-store",
    });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className={"admin-ui " + styles.shell} data-admin-ui>
      <header className={styles.mobileHeader}>
        <Link className={styles.mobileBrand} href="/admin" onClick={() => setMenuPath(null)}>
          <span className={styles.brandMark}>ЗР</span>
          <span className={styles.brandText}>Здорова Родина<small>Панель керування</small></span>
        </Link>
        <button ref={menuButtonRef} aria-controls="admin-navigation" aria-expanded={menuOpen} aria-label="Відкрити навігацію" className={"admin-ui-icon-button " + styles.menuButton} data-variant="secondary" onClick={() => setMenuPath(pathname)} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      <div ref={navigationRef} className={styles.navigationLayer + (menuOpen ? " " + styles.navigationOpen : "")} inert={isMobile && !menuOpen} role={menuOpen ? "dialog" : undefined} aria-modal={menuOpen ? true : undefined} aria-label={menuOpen ? "Навігація адмінпанелі" : undefined} tabIndex={menuOpen ? -1 : undefined}>
        <button className={styles.backdrop} onClick={() => setMenuPath(null)} tabIndex={-1} aria-hidden="true" type="button" />
        <aside className={styles.sidebar} id="admin-navigation">
          <div className={styles.sidebarHeading}>
            <Link className={styles.brand} href="/admin" onClick={() => setMenuPath(null)}>
              <span className={styles.brandMark}>ЗР</span>
              <span className={styles.brandText}>Здорова Родина<small>Панель керування</small></span>
            </Link>
            <button ref={closeButtonRef} className={"admin-ui-icon-button " + styles.closeButton} data-variant="ghost" type="button" aria-label="Закрити навігацію" onClick={() => setMenuPath(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <p className={styles.navLabel}>Навігація</p>
          <nav className={styles.nav} aria-label="Розділи адмінпанелі">
            {sections.map((section) => {
              const active = "exact" in section ? pathname === section.href : pathname.startsWith(section.href);
              return <Link key={section.href} className={styles.navLink + (active ? " " + styles.navLinkActive : "")} href={section.href} aria-current={active ? "page" : undefined} onClick={() => setMenuPath(null)}><NavigationIcon name={section.icon} /><span>{section.label}</span></Link>;
            })}
          </nav>
          <div className={styles.sidebarFooter}>
            <Link className="admin-ui-button" data-variant="secondary" href="/" onClick={() => setMenuPath(null)}><NavigationIcon name="external" />На сайт</Link>
            <button className="admin-ui-button" data-variant="ghost" onClick={logout} type="button"><NavigationIcon name="logout" />Вийти</button>
          </div>
        </aside>
      </div>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
