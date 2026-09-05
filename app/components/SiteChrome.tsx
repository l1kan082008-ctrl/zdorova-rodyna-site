"use client";
import { CloseIcon } from "./CloseIcon";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PRICE_CALCULATOR_CHANGED_EVENT,
  PRICE_CALCULATOR_OPEN_EVENT,
  PRICE_CALCULATOR_STORAGE_KEY,
  readPriceCalculatorSelection,
} from "../prices/calculatorSelection";
import { useModalDialog } from "./useModalDialog";
import { TurnstileField } from "./TurnstileField";

const footerNavigation = [
  { href: "/services", label: "Послуги", key: "services" },
  { href: "/doctors", label: "Лікарі", key: "doctors" },
  { href: "/about", label: "Про центр", key: "about" },
  { href: "/prices", label: "Ціни", key: "prices" },
  { href: "/contacts", label: "Контакти", key: "contacts" },
];

const footerServiceLinks = [
  { href: "/services/lab", label: "Лабораторні дослідження" },
  { href: "/services/ct", label: "Комп’ютерна томографія" },
  { href: "/services/mri", label: "Магнітно-резонансна томографія" },
  { href: "/services/ultrasound", label: "Ультразвукова діагностика" },
  { href: "/services/consultation", label: "Лікарські консультації" },
];

const footerPatientLinks = [
  { href: "/patients/preparation", label: "Підготовка до обстежень" },
  { href: "/patients#results", label: "Як отримати результати" },
  { href: "/patients/faq", label: "Часті запитання" },
  { href: "/patients#benefits", label: "Пільги та знижки" },
];

const footerDoctorLinks = [
  { href: "/doctors?specialty=Сімейна медицина", label: "Сімейна медицина" },
  { href: "/doctors?specialty=Педіатрія", label: "Педіатрія" },
  { href: "/doctors?specialty=Кардіологія", label: "Кардіологія" },
  { href: "/doctors?specialty=Гінекологія", label: "Гінекологія" },
  { href: "/doctors?specialty=Хірургія та урологія", label: "Хірургія та урологія" },
];

type NavigationItem = {
  href: string;
  label: string;
  key: string;
  children?: Array<{ href: string; label: string }>;
};

const navigation: NavigationItem[] = [
  {
    href: "/services",
    label: "Послуги",
    key: "services",
    children: [
      { href: "/services/lab", label: "Аналізи" },
      { href: "/services/ct", label: "КТ" },
      { href: "/services/mri", label: "МРТ" },
      { href: "/services/consultation", label: "Консультації лікарів" },
    ],
  },
  {
    href: "/doctors",
    label: "Лікарі",
    key: "doctors",
    children: [
      { href: "/doctors", label: "Усі лікарі" },
      ...[
        "Сімейна медицина",
        "Педіатрія",
        "Кардіологія",
        "Неврологія",
        "Гастроентерологія",
        "Дерматологія",
        "Гінекологія",
        "Хірургія та урологія",
      ].map((label) => ({ href: `/doctors?specialty=${encodeURIComponent(label)}`, label })),
    ],
  },
  footerNavigation[2],
  {
    href: "/patients",
    label: "Пацієнтам",
    key: "patients",
    children: [
      { href: "/patients/preparation", label: "Підготовка до обстежень" },
      { href: "/patients#results", label: "Як отримати результати" },
      { href: "/patients/faq", label: "Часті запитання" },
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

export function SiteHeader({ active, home = false }: { active?: string; home?: boolean }) {
  const [heroPassed, setHeroPassed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNavigationMenu, setOpenNavigationMenu] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportClosing, setSupportClosing] = useState(false);
  const [supportPhone, setSupportPhone] = useState("");
  const [supportError, setSupportError] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportTurnstileToken, setSupportTurnstileToken] = useState("");
  const [selectedServiceCount, setSelectedServiceCount] = useState(0);
  const supportButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const supportDialogRef = useRef<HTMLElement>(null);
  const supportPhoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!home) return;
    const hero = document.getElementById("home-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      setHeroPassed(entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0));
    }, { rootMargin: `-${headerRef.current?.offsetHeight ?? 96}px 0px 0px 0px` });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [home]);

  const closeSupport = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSupportOpen(false);
    } else {
      setSupportClosing(true);
    }
  };

  useEffect(() => {
    if (!supportClosing) return;
    const timer = window.setTimeout(() => {
      setSupportOpen(false);
      setSupportClosing(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [supportClosing]);

  useModalDialog({
    open: menuOpen,
    dialogRef: headerRef,
    onClose: () => setMenuOpen(false),
    initialFocusRef: menuButtonRef,
    restoreFocusRef: menuButtonRef,
  });

  useModalDialog({
    open: supportOpen,
    dialogRef: supportDialogRef,
    onClose: closeSupport,
    initialFocusRef: supportPhoneRef,
    restoreFocusRef: supportButtonRef,
  });

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
          source: "callback",
          consent: true,
          consentVersion: "callback-v1",
          turnstileToken: supportTurnstileToken,
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) setOpenNavigationMenu(null);
  }, [menuOpen]);

  useEffect(() => {
    if (!supportOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
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
      <div
        className={menuOpen ? "site-menu-backdrop is-visible" : "site-menu-backdrop"}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <header
        ref={headerRef}
        className={menuOpen ? "site-header inner-header is-menu-open" : "site-header inner-header"}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen ? "true" : undefined}
        aria-label={menuOpen ? "Меню сайту" : undefined}
        tabIndex={menuOpen ? -1 : undefined}
      >
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
              className={openNavigationMenu === item.key ? "main-nav-group is-expanded" : "main-nav-group"}
              key={item.key}
            >
              <button
                className={active === item.key ? "main-nav-group-toggle is-active" : "main-nav-group-toggle"}
                type="button"
                aria-expanded={openNavigationMenu === item.key}
                aria-controls={`main-nav-submenu-${item.key}`}
                onClick={() =>
                  setOpenNavigationMenu((currentMenu) =>
                    currentMenu === item.key ? null : item.key,
                  )
                }
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
                      setOpenNavigationMenu(null);
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
        {home ? (
          <div className="header-home-action">
            <a className={`header-home-phone${heroPassed ? " is-hidden" : ""}`} href="tel:+380676714444" aria-hidden={heroPassed} tabIndex={heroPassed ? -1 : 0}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.79a2 2 0 0 1-.45 2.11L8.09 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.33 1.83.56 2.79.69A2 2 0 0 1 22 16.92Z" />
              </svg>
              <span>+38 (067) 671-44-44</span>
            </a>
            <a className={`book-button header-book${heroPassed ? "" : " is-hidden"}`} href="/contacts#booking" aria-hidden={!heroPassed} tabIndex={heroPassed ? 0 : -1}>
              Записатися на прийом
            </a>
          </div>
        ) : (
          <a className="book-button header-book" href="/contacts#booking">
            Записатися на прийом
          </a>
        )}
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
            setSupportClosing(false);
            setMenuOpen(false);
            setOpenNavigationMenu(null);
            setSupportError("");
            setSupportSubmitted(false);
            setSupportOpen(true);
          }}
        >
          <svg
            className="header-support-figure"
            viewBox="0 0 60 54"
            aria-hidden="true"
          >
            <path
              className="header-support-headband"
              d="M5.9 30.5v-6C5.9 11.5 16.4 1.8 30 1.8c6 0 11.5 1.9 15.7 5.4l-3 3.8A18.7 18.7 0 0 0 30 6.8c-10.5 0-18.8 7.6-18.8 17.7v6H5.9Z"
            />
            <rect className="header-support-earpiece" x="4.2" y="26.8" width="8.6" height="14.4" rx="4.3" />
            <path
              className="header-support-earpiece"
              d="M47.2 26.8h4a4.3 4.3 0 0 1 4.3 4.3v5.8a4.3 4.3 0 0 1-4.3 4.3h-4V26.8Z"
            />
            <path
              className="header-support-hair"
              d="M15.5 26.1c0-10.1 6-16.4 14.4-16.4 8.5 0 14.5 6.3 14.5 16.4-6-.8-10.9-3.4-14.6-7.7-3.5 4.3-8.3 6.9-14.3 7.7Z"
            />
            <g className="header-support-eyes">
              <circle cx="24" cy="31.5" r="2.15" />
              <circle cx="36" cy="31.5" r="2.15" />
            </g>
            <path className="header-support-boom" d="M51 38.5c-1.7 6.8-7.6 10.6-14.8 10.6" />
            <rect className="header-support-mic" x="28.4" y="46.9" width="7.6" height="4.3" rx="2.15" />
            <g transform="translate(10 6.5) scale(.82)">
              <path
                className="header-support-heart"
                d="M48.7 5.5c-4.4 0-6.5 5-3.4 8.1l7 7 7-7c3.1-3.1.9-8.1-3.4-8.1-1.7 0-3 .8-3.6 1.9-.7-1.1-2-1.9-3.6-1.9Z"
              />
            </g>
          </svg>
        </button>
        <button
          ref={menuButtonRef}
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
          className={`support-dialog-backdrop${supportClosing ? " is-closing" : ""}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSupport();
          }}
        >
          <section
            ref={supportDialogRef}
            className="support-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Зворотний зв’язок"
            tabIndex={-1}
          >
            <button
              className="support-dialog-close"
              type="button"
              aria-label="Закрити вікно"
              onClick={closeSupport}
            >
              <CloseIcon />
            </button>

            {supportSubmitted ? (
              <div className="support-dialog-success" role="status">
                <span aria-hidden="true">✓</span>
                <strong>Заявку прийнято</strong>
                <p>Адміністратор зателефонує вам найближчим часом.</p>
                <button type="button" onClick={closeSupport}>
                  Готово
                </button>
              </div>
            ) : (
              <>
                <form className="support-callback-form" onSubmit={submitSupportCallback}>
                  <div className="support-dialog-intro">
                    <h2>Ми на зв’язку</h2>
                    <p>Залиште номер, і ми зателефонуємо найближчим часом.</p>
                  </div>
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
                        ref={supportPhoneRef}
                        id="support-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        aria-label="Ваш номер телефону"
                        placeholder="(067) 671-44-44"
                        value={supportPhone}
                        aria-invalid={Boolean(supportError)}
                        aria-describedby={supportError ? "support-phone-error" : undefined}
                        onChange={(event) => {
                          setSupportPhone(formatSupportPhone(event.target.value));
                          if (supportError) setSupportError("");
                        }}
                      />
                    </div>
                  </div>
                  {supportError ? (
                    <p className="support-phone-error" id="support-phone-error" role="alert">
                      {supportError}
                    </p>
                  ) : null}
                  <TurnstileField onToken={setSupportTurnstileToken} />
                  <button
                    className="support-callback-submit"
                    type="submit"
                    disabled={supportSubmitting}
                  >
                    {supportSubmitting ? "Надсилаємо…" : "Подзвоніть мені"}
                  </button>
                  <small className="support-consent-note">
                    Натискаючи кнопку, ви погоджуєтеся на обробку номера телефону
                    лише для зворотного дзвінка.
                  </small>
                </form>

                <div className="support-dialog-separator">
                  <span>Або зв’яжіться з нами</span>
                </div>

                <div className="support-contact-actions">
                  <a className="support-contact-link support-call-link" href="tel:+380676714444">
                    <img
                      className="support-contact-icon support-call-icon"
                      src="/icons/phone.svg"
                      alt=""
                      aria-hidden="true"
                    />
                    <strong>Подзвонити</strong>
                  </a>
                  <a
                    className="support-contact-link support-viber-link"
                    href="viber://chat?number=%2B380676714444"
                  >
                    <img
                      className="support-contact-icon support-viber-icon"
                      src="/icons/viber.svg"
                      alt=""
                      aria-hidden="true"
                    />
                    <strong>Написати у Viber</strong>
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

export function SiteFooter() {
  const [openFooterSection, setOpenFooterSection] = useState<string | null>(null);

  const toggleFooterSection = (section: string) => {
    setOpenFooterSection((current) => current === section ? null : section);
  };

  return (
    <footer className="site-footer-minimal">
      <div className="footer-directory-grid">
        <section className="footer-brand-column">
          <div className="footer-brand">
            <Link className="footer-mark" href="/" aria-label="Здорова Родина — на головну">
              <Image
                src="/zdorova-rodyna-mark.jpg"
                alt=""
                width={2500}
                height={2500}
                sizes="72px"
                unoptimized
              />
            </Link>
            <div>
              <strong>Здорова Родина</strong>
              <p>Медичний центр у Рівному</p>
            </div>
          </div>
          <p className="footer-brand-note">
            Діагностика, лабораторія та консультації для всієї родини.
          </p>
          <div className="footer-socials" aria-label="Соціальні мережі">
            <div>
              <a
                className="footer-social-link"
                href="https://www.facebook.com/zdorovarodina.rivne"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Здорова Родина у Facebook"
              >
                <svg
                  className="footer-social-icon footer-social-icon-facebook"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.8-.1-1.5-.2-2.3-.2-2.3 0-3.9 1.4-3.9 4.1V10H8.2v3h2.6v8h2.9Z" />
                </svg>
              </a>
              <a
                className="footer-social-link"
                href="https://www.instagram.com/zdorova_rodyna_rivne/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Здорова Родина в Instagram"
              >
                <svg
                  className="footer-social-icon footer-social-icon-instagram"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="5" />
                  <circle cx="12" cy="12" r="3.65" />
                  <circle className="footer-social-icon-dot" cx="17.35" cy="6.8" r="1" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className={`footer-directory-column${openFooterSection === "services" ? " is-open" : ""}`}>
          <h2><Link href="/services">Послуги</Link></h2>
          <button
            className="footer-mobile-section-toggle"
            type="button"
            aria-expanded={openFooterSection === "services"}
            aria-controls="footer-services-links"
            onClick={() => toggleFooterSection("services")}
          >
            <span>Послуги</span><span className="footer-toggle-icon" aria-hidden="true" />
          </button>
          <nav id="footer-services-links" aria-label="Послуги">
            {footerServiceLinks.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
            <Link className="footer-inline-more" href="/services">Усі послуги</Link>
          </nav>
        </section>

        <section className={`footer-directory-column${openFooterSection === "doctors" ? " is-open" : ""}`}>
          <h2><Link href="/doctors">Лікарі</Link></h2>
          <button
            className="footer-mobile-section-toggle"
            type="button"
            aria-expanded={openFooterSection === "doctors"}
            aria-controls="footer-doctor-links"
            onClick={() => toggleFooterSection("doctors")}
          >
            <span>Лікарі</span><span className="footer-toggle-icon" aria-hidden="true" />
          </button>
          <nav id="footer-doctor-links" aria-label="Лікарі за напрямами">
            {footerDoctorLinks.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
            <Link className="footer-inline-more" href="/doctors">Усі лікарі</Link>
          </nav>
        </section>

        <section className={`footer-directory-column${openFooterSection === "patients" ? " is-open" : ""}`}>
          <h2><Link href="/patients">Пацієнтам</Link></h2>
          <button
            className="footer-mobile-section-toggle"
            type="button"
            aria-expanded={openFooterSection === "patients"}
            aria-controls="footer-patient-links"
            onClick={() => toggleFooterSection("patients")}
          >
            <span>Пацієнтам</span><span className="footer-toggle-icon" aria-hidden="true" />
          </button>
          <nav id="footer-patient-links" aria-label="Інформація пацієнтам">
            {footerPatientLinks.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </nav>
        </section>

        <section className={`footer-directory-column${openFooterSection === "about" ? " is-open" : ""}`}>
          <h2><Link href="/about">Про центр</Link></h2>
          <button
            className="footer-mobile-section-toggle"
            type="button"
            aria-expanded={openFooterSection === "about"}
            aria-controls="footer-about-links"
            onClick={() => toggleFooterSection("about")}
          >
            <span>Про центр</span><span className="footer-toggle-icon" aria-hidden="true" />
          </button>
          <nav id="footer-about-links" aria-label="Про медичний центр">
            <Link href="/about">Про Здорову Родину</Link>
            <Link href="/contacts">Наші відділення</Link>
            <Link href="/prices">Вартість послуг</Link>
          </nav>
        </section>

        <section className="footer-directory-column footer-contact-column">
          <h2><Link href="/contacts">Контакти</Link></h2>
          <div className="footer-contact-list">
            <a href="tel:+380676714444">+38 (067) 671-44-44</a>
            <a href="mailto:zdorovarodynarivne@ukr.net">zdorovarodynarivne@ukr.net</a>
            <Link href="/contacts">
              м. Рівне, вул. Володимира Стельмаха (Курчатова), 18-М
            </Link>
            <p>Пн–Пт 08:00–19:00<br />Сб 08:00–15:00</p>
          </div>
        </section>
      </div>

      <p className="footer-copyright">© 2026 Медичний центр «Здорова Родина»</p>
    </footer>
  );
}
