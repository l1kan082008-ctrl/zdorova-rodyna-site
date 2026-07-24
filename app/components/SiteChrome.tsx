"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navigation = [
  { href: "/services", label: "Послуги", key: "services" },
  { href: "/doctors", label: "Лікарі", key: "doctors" },
  { href: "/about", label: "Про центр", key: "about" },
  { href: "/prices", label: "Вартість", key: "prices" },
  { href: "/contacts", label: "Контакти", key: "contacts" },
];

export function SiteHeader({ active }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="site-header inner-header">
      <Link className="logo" href="/" aria-label="Здорова Родина — на головну">
        <img
          src="/zdorova-rodyna-logo.png"
          alt="Здорова Родина — медичний центр"
        />
      </Link>

      <nav
        className={menuOpen ? "main-nav is-open" : "main-nav"}
        aria-label="Основна навігація"
      >
        {navigation.map((item) => (
          <a
            className={active === item.key ? "is-active" : undefined}
            href={item.href}
            key={item.key}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a className="book-button header-book" href="/contacts#booking">
        Записатися на прийом
      </a>
      <button
        className="menu-button"
        type="button"
        aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-brand">
        <Link className="footer-mark" href="/" aria-label="Здорова Родина — на головну">
          <img src="/zdorova-rodyna-mark.jpg" alt="" />
        </Link>
        <div>
          <strong>Здорова Родина</strong>
          <p>Лікувально-діагностичний центр у Рівному.</p>
        </div>
      </div>
      <nav className="footer-nav" aria-label="Навігація у підвалі">
        {navigation.map((item) => (
          <a href={item.href} key={item.key}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="footer-socials">
        <strong>Наші соцмережі</strong>
        <div>
          <a
            className="footer-social-link"
            href="https://www.facebook.com/zdorovarodina.rivne"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Здорова Родина у Facebook"
          >
            <span className="social-icon-facebook" aria-hidden="true">f</span>
          </a>
          <a
            className="footer-social-link"
            href="https://www.instagram.com/zdorova_rodyna_rivne/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Здорова Родина в Instagram"
          >
            <span className="social-icon-instagram" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="footer-contacts">
        <a href="tel:+380676714444">+38 (067) 671-44-44</a>
        <a href="mailto:zdorovarodynarivne@ukr.net">
          zdorovarodynarivne@ukr.net
        </a>
        <p>© 2026 Здорова Родина</p>
      </div>
    </footer>
  );
}
