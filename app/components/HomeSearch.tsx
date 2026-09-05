"use client";
import { CloseIcon as SearchCloseIcon } from "./CloseIcon";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  addPriceCalculatorSelection,
  PRICE_CALCULATOR_CHANGED_EVENT,
  PRICE_CALCULATOR_OPEN_EVENT,
  readPriceCalculatorSelection,
  removePriceCalculatorSelection,
} from "../prices/calculatorSelection";
import {
  normalizeMedicalSearch,
  medicalHighlightParts,
  scoreMedicalSearch,
} from "../search/medicalSearch";
import { useModalDialog } from "./useModalDialog";

const HOME_SEARCH_OPEN_EVENT = "zdorova-rodyna-home-search-open";
const SITE_MENU_OPEN_EVENT = "zdorova-rodyna-site-menu-open";

export type HomeSearchItem = {
  id: string;
  kind: "service" | "doctor" | "price" | "location";
  title: string;
  meta: string;
  href: string;
  actionHref: string;
  keywords?: string;
  amount?: number;
  turnaround?: string;
  imageUrl?: string;
};

const groupLabels: Record<HomeSearchItem["kind"], string> = {
  service: "Послуги",
  doctor: "Лікарі",
  price: "Дослідження",
  location: "Відділення",
};

const groupOrder: HomeSearchItem["kind"][] = [
  "service",
  "doctor",
  "price",
  "location",
];

const groupAllLinks: Record<HomeSearchItem["kind"], string> = {
  service: "/services",
  doctor: "/doctors",
  price: "/prices",
  location: "/contacts",
};

const groupAllLabels: Record<HomeSearchItem["kind"], string> = {
  service: "Переглянути всі",
  doctor: "Переглянути всіх",
  price: "Переглянути всі",
  location: "Переглянути всі",
};

const suggestions = ["КТ", "МРТ", "УЗД", "Аналізи", "Аналізи вдома"];


function SearchHighlight({ text, query }: { text: string; query: string }) {
  return <>{medicalHighlightParts(text, query).map((part, index) => part.matched ? <mark key={index}>{part.text}</mark> : part.text)}</>;
}

const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat("uk-UA").format(amount)} ₴`;

export function HomeSearch({ items }: { items: HomeSearchItem[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>([]);
  const [mobileViewport, setMobileViewport] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const suppressRestoredFocusRef = useRef(false);

  const closeSearch = useCallback(() => {
    if (isOpen && mobileViewport) suppressRestoredFocusRef.current = true;
    setIsOpen(false);
  }, [isOpen, mobileViewport]);

  useModalDialog({
    open: isOpen && mobileViewport,
    dialogRef: panelRef,
    onClose: closeSearch,
    initialFocusRef: mobileInputRef,
    restoreFocusRef: desktopInputRef,
  });

  useEffect(() => {
    if (!isOpen || mobileViewport) {
      document.body.classList.remove("home-search-open");
      return;
    }

    document.body.classList.add("home-search-open");
    return () => document.body.classList.remove("home-search-open");
  }, [isOpen, mobileViewport]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const updateViewport = () => setMobileViewport(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  const groups = useMemo(() => {
    const normalizedQuery = normalizeMedicalSearch(query);

    return groupOrder
      .map((kind) => {
        const matches = items
          .filter((item) => item.kind === kind)
          .map((item, index) => ({
            item,
            index,
            score: normalizedQuery
              ? scoreMedicalSearch(
                  normalizedQuery,
                  item.title,
                  `${item.meta} ${item.keywords ?? ""}`,
                )
              : 1,
          }))
          .filter((match) => match.score > 0)
          .sort((first, second) => second.score - first.score || first.index - second.index)
          .map((match) => match.item);

        const best = matches[0];
        const topScore = best && normalizedQuery ? scoreMedicalSearch(normalizedQuery, best.title, `${best.meta} ${best.keywords ?? ""}`) : 0;
        return { kind, topScore, total: matches.length, items: matches.slice(0, normalizedQuery ? 5 : kind === "service" ? 3 : 0) };
      })
      .filter((group) => group.items.length > 0)
      .sort((a, b) => b.topScore - a.topScore);
  }, [items, query]);

  const resultCount = groups.reduce(
    (count, group) => count + group.items.length,
    0,
  );
  const totalCount = groups.reduce((count, group) => count + group.total, 0);
  const selectedAmount = items.filter((item) => item.kind === "price" && selectedPriceIds.includes(item.id))
    .reduce((sum, item) => sum + (item.amount ?? 0), 0);

  const openSearch = () => {
    if (suppressRestoredFocusRef.current) {
      suppressRestoredFocusRef.current = false;
      return;
    }

    setIsOpen(true);
    window.dispatchEvent(new Event(HOME_SEARCH_OPEN_EVENT));
  };

  useEffect(() => {
    const closeForMenu = () => closeSearch();
    const updateSelectedPrices = (event: Event) => {
      const selectedIds = (event as CustomEvent<unknown>).detail;
      setSelectedPriceIds(
        Array.isArray(selectedIds)
          ? selectedIds.filter((id): id is string => typeof id === "string")
          : readPriceCalculatorSelection(),
      );
    };

    setSelectedPriceIds(readPriceCalculatorSelection());
    window.addEventListener(SITE_MENU_OPEN_EVENT, closeForMenu);
    window.addEventListener(
      PRICE_CALCULATOR_CHANGED_EVENT,
      updateSelectedPrices,
    );
    return () => {
      window.removeEventListener(SITE_MENU_OPEN_EVENT, closeForMenu);
      window.removeEventListener(
        PRICE_CALCULATOR_CHANGED_EVENT,
        updateSelectedPrices,
      );
    };
  }, [closeSearch]);

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => {
      if (window.matchMedia("(max-width: 720px)").matches) {
        mobileInputRef.current?.focus();
      }
    }, 80);

    const handlePointerDown = (event: PointerEvent) => {
      if (
        !window.matchMedia("(max-width: 720px)").matches &&
        shellRef.current &&
        !shellRef.current.contains(event.target as Node)
      ) {
        closeSearch();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, isOpen]);

  useEffect(() => {
    if (!isOpen || !window.matchMedia("(max-width: 720px)").matches) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = normalizeMedicalSearch(query);
    if (!normalizedQuery) {
      openSearch();
      return;
    }

    const allResults = groups.flatMap((group) => group.items);
    const destination = allResults[0];

    if (destination) {
      window.location.assign(destination.href);
      return;
    }

    panelRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    openSearch();
  };

  const chooseSuggestion = (suggestion: string) => {
    panelRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setQuery(suggestion);
    openSearch();
  };

  const updateQuery = (value: string) => {
    panelRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setQuery(value);
  };

  const clearQuery = (input: "desktop" | "mobile") => {
    updateQuery("");
    openSearch();
    window.requestAnimationFrame(() => {
      (input === "mobile" ? mobileInputRef : desktopInputRef).current?.focus();
    });
  };

  const togglePrice = (itemId: string) => {
    setSelectedPriceIds(
      selectedPriceIds.includes(itemId)
        ? removePriceCalculatorSelection(itemId)
        : addPriceCalculatorSelection(itemId),
    );
  };

  const openCalculator = () => {
    if (selectedPriceIds.length === 0) return;

    closeSearch();
    if (window.location.pathname === "/prices") {
      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event(PRICE_CALCULATOR_OPEN_EVENT));
      });
      return;
    }

    window.location.assign("/prices#calculator");
  };

  return (
    <section
      className={`home-search-shell${isOpen ? " is-open" : ""}`}
      ref={shellRef}
      aria-label="Пошук по сайту"
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        const links = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>(".home-search-result-main") ?? []);
        if (!links.length) return;
        event.preventDefault();
        const current = links.indexOf(document.activeElement as HTMLAnchorElement);
        const next = current < 0 ? (event.key === "ArrowDown" ? 0 : links.length - 1)
          : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        links[next].focus();
        links[next].scrollIntoView({ block: "nearest" });
      }}
    >
      {isOpen ? (
        <div
          className="home-search-backdrop"
          aria-hidden="true"
          onPointerDown={closeSearch}
        />
      ) : null}
      <form className="home-search-bar" role="search" onSubmit={submit}>
        <span className="home-search-icon" aria-hidden="true" />
        <label className="home-search-label" htmlFor="home-search-input">
          <strong>Знайти потрібне</strong>
        </label>
        <input
          id="home-search-input"
          ref={desktopInputRef}
          value={query}
          onChange={(event) => {
            updateQuery(event.target.value);
            openSearch();
          }}
          onClick={openSearch}
          onFocus={openSearch}
          placeholder={mobileViewport ? "Послуга, лікар або аналіз" : "Послуга, лікар, аналіз або відділення"}
          autoComplete="off"
          aria-controls="home-search-results"
        />
        {query ? (
          <button
            type="button"
            className="home-search-clear home-search-clear--desktop"
            onClick={() => clearQuery("desktop")}
            aria-label="Очистити пошук"
          >
            <SearchCloseIcon />
          </button>
        ) : null}
      </form>


      {isOpen ? (
        <div
          className="home-search-panel"
          id="home-search-results"
          ref={panelRef}
          role={mobileViewport ? "dialog" : "region"}
          aria-modal={mobileViewport ? "true" : undefined}
          aria-label={mobileViewport ? "Пошук по сайту" : "Результати пошуку"}
          tabIndex={-1}
        >
          <div className="home-search-mobile-head">
            <form role="search" onSubmit={submit}>
              <span className="home-search-icon" aria-hidden="true" />
              <input
                ref={mobileInputRef}
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="Що потрібно знайти?"
                aria-label="Пошук по сайту"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  className="home-search-clear home-search-clear--mobile"
                  onClick={() => clearQuery("mobile")}
                  aria-label="Очистити пошук"
                >
                  <SearchCloseIcon />
                </button>
              ) : null}
            </form>
            <button
              type="button"
              className="home-search-close"
              onClick={closeSearch}
              aria-label="Закрити пошук"
            >
              <SearchCloseIcon />
            </button>
          </div>

          {!mobileViewport && query && groups[0]?.items[0] ? <p className="home-search-keyboard-hint">Enter у полі пошуку — відкрити «{groups[0].items[0].title}». ↑ ↓ — обрати інший результат.</p> : null}
          <div className="home-search-suggestions" aria-label="Швидкий пошук">
            <span>Часто шукають</span>
            <div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => chooseSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {query ? `Показано ${resultCount} із ${totalCount} результатів` : "Основні напрями"}
          </p>

          {groups.length ? (
            <div className="home-search-groups">
              {groups.map((group) => (
                <section className="home-search-group" key={group.kind}>
                  <h2>{groupLabels[group.kind]} {query ? <small>Показано {group.items.length} із {group.total}</small> : null}</h2>
                  <div className="home-search-results-list">
                    {group.items.map((item) => (
                      <article className="home-search-result" key={`${item.kind}-${item.id}`}>
                        <Link
                          className={`home-search-result-main${
                            item.kind === "doctor" ? " has-photo" : ""
                          }`}
                          href={item.href}
                          onClick={closeSearch}
                        >
                          {item.kind === "doctor" ? (
                            <span className="home-search-result-mark is-doctor">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt=""
                                  width={42}
                                  height={42}
                                  unoptimized
                                />
                              ) : (
                                item.title
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")
                              )}
                            </span>
                          ) : null}
                          <span className="home-search-result-copy">
                            <strong><SearchHighlight text={item.title} query={query} /></strong>
                            {/з контрастуванням/i.test(item.title) ? <small className="home-search-contrast">З контрастуванням</small> : null}
                            <small><SearchHighlight text={item.meta} query={query} /></small>
                            {item.turnaround ? (
                              <small className="home-search-turnaround">
                                Термін: {item.turnaround}
                              </small>
                            ) : null}
                          </span>
                          {typeof item.amount === "number" ? (
                            <b className="home-search-price">{formatPrice(item.amount)}</b>
                          ) : null}
                        </Link>
                        {item.kind === "price" ? (
                          <button
                            type="button"
                            className={`home-search-result-action is-add${
                              selectedPriceIds.includes(item.id) ? " is-added" : ""
                            }`}
                            aria-pressed={selectedPriceIds.includes(item.id)}
                            onClick={() => togglePrice(item.id)}
                            aria-label={
                              selectedPriceIds.includes(item.id)
                                ? `Видалити ${item.title} з калькулятора`
                                : `Додати ${item.title} до калькулятора`
                            }
                          >
                            <span className="home-search-result-action-label">
                              {selectedPriceIds.includes(item.id) ? "Додано" : "Додати"}
                            </span>
                            <span
                              className="home-search-result-action-icon"
                              aria-hidden="true"
                            >
                              {selectedPriceIds.includes(item.id) ? "✓" : "+"}
                            </span>
                          </button>
                        ) : (
                          <Link
                            className="home-search-result-action"
                            href={item.actionHref}
                            onClick={closeSearch}
                          >
                            <span className="home-search-result-action-label">
                              {item.kind === "doctor"
                                ? "Записатися"
                                : item.kind === "service"
                                  ? "Переглянути"
                                  : "Детальніше"}
                            </span>
                            <span
                              className="home-search-result-action-icon"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </Link>
                        )}
                      </article>
                    ))}
                  </div>
                  <Link
                    className="home-search-group-all"
                    href={
                      group.kind === "price" && normalizeMedicalSearch(query)
                        ? `/prices?search=${encodeURIComponent(query)}`
                        : group.kind === "doctor" && normalizeMedicalSearch(query)
                          ? `/doctors?search=${encodeURIComponent(query)}`
                          : groupAllLinks[group.kind]
                    }
                    onClick={closeSearch}
                  >
                    {groupAllLabels[group.kind]} <span aria-hidden="true">→</span>
                  </Link>
                </section>
              ))}
            </div>
          ) : (
            <div className="home-search-empty">
              <strong>Нічого не знайшли за цим запитом</strong>
              <p>Спробуйте коротшу назву або зверніться до адміністратора.</p>
              <Link href="/contacts#booking" onClick={closeSearch}>
                Допомога адміністратора <span>→</span>
              </Link>
            </div>
          )}

          <div className={`home-search-footer${selectedPriceIds.length ? " has-calculator" : ""}`}>
            <span>{selectedPriceIds.length ? `Обрано: ${selectedPriceIds.length} · ${formatPrice(selectedAmount)} (без доплат CITO)` : query ? `Показано ${resultCount} із ${totalCount}` : "Оберіть напрям або введіть запит"}</span>
            {selectedPriceIds.length ? (
              <button className="home-search-calculator-cta" type="button" onClick={openCalculator}>
                <span>Переглянути обране</span>
                <strong aria-label={`Обрано досліджень: ${selectedPriceIds.length}`}>
                  {selectedPriceIds.length}
                </strong>
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <Link href={`/prices${query ? `?search=${encodeURIComponent(query)}` : ""}`}>
                Переглянути весь прайс <span>→</span>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
