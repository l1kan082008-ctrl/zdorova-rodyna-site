"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PRICE_CALCULATOR_CHANGED_EVENT,
  PRICE_CALCULATOR_OPEN_EVENT,
  PRICE_CALCULATOR_STORAGE_KEY,
  readPriceCalculatorSelection,
} from "../prices/calculatorSelection";

const navigation = [
  { href: "/services", label: "Послуги", key: "services" },
  { href: "/doctors", label: "Лікарі", key: "doctors" },
  { href: "/about", label: "Про центр", key: "about" },
  { href: "/prices", label: "Вартість", key: "prices" },
  { href: "/contacts", label: "Контакти", key: "contacts" },
];

export function SiteHeader({ active }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedServiceCount, setSelectedServiceCount] = useState(0);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const updateSelectedServiceCount = () => {
      setSelectedServiceCount(readPriceCalculatorSelection().length);
    };
    const updateFromStorage = (event: StorageEvent) => {
      if (event.key === PRICE_CALCULATOR_STORAGE_KEY) {
        updateSelectedServiceCount();
      }
    };
    const updateFromSelection = (event: Event) => {
      const selectedIds = (event as CustomEvent<unknown>).detail;
      setSelectedServiceCount(
        Array.isArray(selectedIds)
          ? selectedIds.filter((id) => typeof id === "string").length
          : readPriceCalculatorSelection().length,
      );
    };

    updateSelectedServiceCount();
    window.addEventListener("storage", updateFromStorage);
    window.addEventListener(
      PRICE_CALCULATOR_CHANGED_EVENT,
      updateFromSelection,
    );

    return () => {
      window.removeEventListener("storage", updateFromStorage);
      window.removeEventListener(
        PRICE_CALCULATOR_CHANGED_EVENT,
        updateFromSelection,
      );
    };
  }, []);

  return (
    <header className="site-header inner-header">
      <Link className="logo" href="/" aria-label="Здорова Родина — на головну">
        <Image
          src="/zdorova-rodyna-logo-cropped.png"
          alt="Здорова Родина — медичний центр"
          width={1800}
          height={361}
          sizes="(max-width: 720px) 210px, 270px"
          priority
          unoptimized
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

      <div className="header-actions">
        {selectedServiceCount ? (
          <a
            className="header-selection"
            href="/prices#calculator"
            aria-label={`Обрані послуги: ${selectedServiceCount}`}
            onClick={(event) => {
              setMenuOpen(false);

              if (window.location.pathname === "/prices") {
                event.preventDefault();
                window.dispatchEvent(
                  new CustomEvent(PRICE_CALCULATOR_OPEN_EVENT),
                );
              }
            }}
          >
            <span className="header-selection-icon" aria-hidden="true">
              ✓
            </span>
            <span className="header-selection-label">Обрані послуги</span>
            <strong>{selectedServiceCount}</strong>
          </a>
        ) : null}
        <a className="book-button header-book" href="/contacts#booking">
          Записатися на прийом
        </a>
      </div>
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
          <Image
            src="/zdorova-rodyna-mark.jpg"
            alt=""
            width={2500}
            height={2500}
            sizes="84px"
            unoptimized
          />
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
