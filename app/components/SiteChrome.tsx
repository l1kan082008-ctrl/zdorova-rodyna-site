"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PRICE_CALCULATOR_CHANGED_EVENT,
  PRICE_CALCULATOR_OPEN_EVENT,
  PRICE_CALCULATOR_STORAGE_KEY,
  readPriceCalculatorSelection,
} from "../prices/calculatorSelection";

const footerNavigation = [
  { href: "/services", label: "Послуги", key: "services" },
  { href: "/doctors", label: "Лікарі", key: "doctors" },
  { href: "/about", label: "Про центр", key: "about" },
  { href: "/prices", label: "Вартість", key: "prices" },
  { href: "/contacts", label: "Контакти", key: "contacts" },
];

const navigation = [
  ...footerNavigation.slice(0, 3),
  {
    href: "/patients",
    label: "Пацієнтам",
    key: "patients",
    children: [
      { href: "/patients/preparation", label: "Підготовка до обстежень" },
      { href: "/patients#results", label: "Як отримати результати" },
      { href: "/patients#faq", label: "Часті запитання" },
      { href: "/patients#benefits", label: "Пільги та знижки" },
    ],
  },
  ...footerNavigation.slice(3),
];

const HOME_SEARCH_OPEN_EVENT = "zdorova-rodyna-home-search-open";
const SITE_MENU_OPEN_EVENT = "zdorova-rodyna-site-menu-open";

function formatSupportPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  return [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ]
    .filter(Boolean)
    .join(" ");
}

export function SiteHeader({ active }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [patientsMenuOpen, setPatientsMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportOrigin, setSupportOrigin] = useState({ x: 0, y: 0 });
  const [supportPhone, setSupportPhone] = useState("");
  const [supportError, setSupportError] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [selectedServiceCount, setSelectedServiceCount] = useState(0);
  const supportButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const closeForSearch = () => setMenuOpen(false);
    window.addEventListener(HOME_SEARCH_OPEN_EVENT, closeForSearch);
    return () => window.removeEventListener(HOME_SEARCH_OPEN_EVENT, closeForSearch);
  }, []);

  const submitSupportCallback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSupportError("");

    const phoneDigits = supportPhone.replace(/\D/g, "");

    if (phoneDigits.length !== 10 || !phoneDigits.startsWith("0")) {
      setSupportError("Введіть 10 цифр номера, починаючи з 0.");
      return;
    }

    setSupportSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Зворотний дзвінок",
          phone: `+38${phoneDigits}`,
          service: "Зворотний дзвінок",
          doctor: "",
          comment: "Заявка з форми швидкого зв’язку у шапці сайту.",
          website: "",
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Не вдалося надіслати заявку.");
      }

      setSupportPhone("");
      setSupportSubmitted(true);
    } catch (error) {
      setSupportError(
        error instanceof Error
          ? error.message
          : "Не вдалося надіслати заявку. Спробуйте ще раз.",
      );
    } finally {
      setSupportSubmitting(false);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) setPatientsMenuOpen(false);
  }, [menuOpen]);

  useEffect(() => {
    if (!supportOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSupportOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [supportOpen]);

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
    <>
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
        {navigation.map((item) =>
          item.children ? (
            <div
              className={patientsMenuOpen ? "main-nav-group is-expanded" : "main-nav-group"}
              key={item.key}
            >
              <button
                className={active === item.key ? "main-nav-group-toggle is-active" : "main-nav-group-toggle"}
                type="button"
                aria-expanded={patientsMenuOpen}
                aria-controls={`main-nav-submenu-${item.key}`}
                onClick={() => setPatientsMenuOpen((isOpen) => !isOpen)}
              >
                {item.label}
                <span className="main-nav-chevron" aria-hidden="true" />
              </button>
              <div
                className="main-nav-submenu"
                id={`main-nav-submenu-${item.key}`}
                aria-label={`Підрозділи: ${item.label}`}
              >
                {item.children.map((child) => (
                  <a
                    href={child.href}
                    key={child.href}
                    onClick={() => {
                      setPatientsMenuOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <a
              className={active === item.key ? "is-active" : undefined}
              href={item.href}
              key={item.key}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ),
        )}
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
      <div className="header-mobile-controls">
        <button
          ref={supportButtonRef}
          type="button"
          className="header-support"
          aria-label="Зв’язатися з адміністратором"
          aria-haspopup="dialog"
          aria-expanded={supportOpen}
          onClick={() => {
            const triggerBounds = supportButtonRef.current?.getBoundingClientRect();

            if (triggerBounds) {
              setSupportOrigin({
                x: triggerBounds.left + triggerBounds.width / 2,
                y: triggerBounds.top + triggerBounds.height / 2,
              });
            }

            setMenuOpen(false);
            setPatientsMenuOpen(false);
            setSupportError("");
            setSupportSubmitted(false);
            setSupportOpen(true);
          }}
        >
          <svg
            className="header-support-figure"
            viewBox="0 0 48 44"
            aria-hidden="true"
          >
            <path
              className="header-support-line"
              d="M9 25v-5C9 10.6 15.7 4 24 4s15 6.6 15 16v5"
            />
            <rect className="header-support-line" x="6" y="20" width="7" height="13" rx="3.5" />
            <rect className="header-support-line" x="35" y="20" width="7" height="13" rx="3.5" />
            <path
              className="header-support-hair"
              d="M15 18.5c1.8-5.3 5.2-8 10.1-8 3.8 0 6.8 1.6 8.9 4.8-4.5.2-8.1-1.2-10.8-4.1-1.4 3.7-4.1 6.1-8.2 7.3Z"
            />
            <path
              className="header-support-line"
              d="M16 18.5v5.2c0 6 3.5 10.3 8 10.3s8-4.3 8-10.3v-7.4"
            />
            <g className="header-support-eyes">
              <circle cx="21" cy="23" r="1.55" />
              <circle cx="28.2" cy="23" r="1.55" />
            </g>
            <path className="header-support-line" d="M38.5 32c0 4.4-4 6.5-9.5 6.5h-2" />
            <rect className="header-support-mic" x="23" y="36" width="7" height="4.5" rx="2.25" />
            <path
              className="header-support-heart"
              d="M39.5 2.5c-2.9 0-4.4 3.2-2.4 5.3l4.6 4.6 4.6-4.6c2-2.1.5-5.3-2.4-5.3-1.1 0-1.9.5-2.2 1.2-.4-.7-1.2-1.2-2.2-1.2Z"
            />
          </svg>
        </button>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={menuOpen}
          onClick={() => {
            const nextMenuOpen = !menuOpen;
            setMenuOpen(nextMenuOpen);
            if (nextMenuOpen) {
              window.dispatchEvent(new Event(SITE_MENU_OPEN_EVENT));
            }
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      </header>

      {supportOpen ? (
        <div
          className="support-dialog-backdrop"
          style={
            {
              "--support-origin-x": `${supportOrigin.x}px`,
              "--support-origin-y": `${supportOrigin.y}px`,
            } as CSSProperties
          }
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSupportOpen(false);
          }}
        >
          <section
            className="support-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Зворотний зв’язок"
          >
            <button
              className="support-dialog-close"
              type="button"
              aria-label="Закрити вікно"
              onClick={() => setSupportOpen(false)}
            >
              <span />
              <span />
            </button>

            {supportSubmitted ? (
              <div className="support-dialog-success" role="status">
                <span aria-hidden="true">✓</span>
                <strong>Заявку прийнято</strong>
                <p>Адміністратор зателефонує вам найближчим часом.</p>
                <button type="button" onClick={() => setSupportOpen(false)}>
                  Готово
                </button>
              </div>
            ) : (
              <>
                <form className="support-callback-form" onSubmit={submitSupportCallback}>
                  <label htmlFor="support-phone">
                    <strong>Зворотний зв’язок</strong>
                    <small>Залиште номер — ми передзвонимо.</small>
                  </label>
                  <div className="support-phone-row">
                    <div
                      className={
                        supportError
                          ? "support-phone-field is-invalid"
                          : "support-phone-field"
                      }
                    >
                      <span className="support-phone-prefix">+38</span>
                      <input
                        id="support-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="067 671 44 44"
                        value={supportPhone}
                        aria-invalid={Boolean(supportError)}
                        aria-describedby={supportError ? "support-phone-error" : undefined}
                        onChange={(event) => {
                          setSupportPhone(formatSupportPhone(event.target.value));
                          if (supportError) setSupportError("");
                        }}
                      />
                    </div>
                    <button
                      className="support-callback-submit"
                      type="submit"
                      disabled={supportSubmitting}
                    >
                      {supportSubmitting ? "Надсилаємо…" : "Передзвоніть мені"}
                    </button>
                  </div>
                  {supportError ? (
                    <p className="support-phone-error" id="support-phone-error" role="alert">
                      {supportError}
                    </p>
                  ) : null}
                </form>

                <div className="support-dialog-separator"><span>або</span></div>

                <a className="support-call-link" href="tel:+380676714444">
                  <span className="support-call-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M7.2 3.5 9.8 8l-2.1 1.8a14.7 14.7 0 0 0 6.5 6.5l1.8-2.1 4.5 2.6-1.1 3.1c-.3.8-1.1 1.3-2 1.2C9.7 20.2 3.8 14.3 2.9 6.6c-.1-.9.4-1.7 1.2-2l3.1-1.1Z" />
                    </svg>
                  </span>
                  <span>
                    <strong>Подзвонити</strong>
                    <small>+38 (067) 671-44-44</small>
                  </span>
                  <span className="support-call-arrow" aria-hidden="true">→</span>
                </a>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
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
        {footerNavigation.map((item) => (
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
