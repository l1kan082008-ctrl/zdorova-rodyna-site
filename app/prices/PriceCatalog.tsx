"use client";

import { useEffect, useMemo, useState } from "react";
import {
  additionalCategories,
  catalogItems,
  type CategoryId,
  type PriceItem,
} from "./priceData";

const categories = [
  { id: "all", label: "Усі послуги" },
  { id: "ultrasound", label: "УЗД" },
  { id: "heart", label: "Серце" },
  { id: "doppler", label: "Доплер судин" },
  ...additionalCategories,
] as const;

const INITIAL_VISIBLE_COUNT = 24;

const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat("uk-UA").format(amount)} ₴`;

export function PriceCatalog() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_VISIBLE_COUNT);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("uk");

    return catalogItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesQuery =
        !normalized ||
        `${item.name} ${item.categoryLabel}`
          .toLocaleLowerCase("uk")
          .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const selectedItems = useMemo(
    () => catalogItems.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );
  const displayedItems = visibleItems.slice(0, visibleLimit);

  const total = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const checkoutHref = `/contacts?services=${encodeURIComponent(
    selectedItems.map((item) => item.name).join(" | "),
  )}&total=${total}#booking`;

  useEffect(() => {
    if (!calculatorOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCalculatorOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [calculatorOpen]);

  const toggleItem = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  return (
    <>
      <section className="price-catalog-shell" aria-label="Каталог цін">
        <aside className="price-category-panel">
          <div>
            <span className="section-kicker">Напрями</span>
            <h2>Оберіть категорію</h2>
          </div>
          <div
            className="price-category-tabs"
            role="tablist"
            aria-label="Категорії послуг"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                className={
                  activeCategory === category.id ? "is-active" : undefined
                }
                onClick={() => {
                  setActiveCategory(category.id);
                  setQuery("");
                  setVisibleLimit(INITIAL_VISIBLE_COUNT);
                }}
              >
                <span>{category.label}</span>
              </button>
            ))}
          </div>
          <a className="price-phone-card" href="tel:+380676714444">
            <span>Потрібна допомога?</span>
            <strong>+38 (067) 671-44-44</strong>
          </a>
        </aside>

        <div className="price-table-panel">
          <div className="price-search-row">
            <label htmlFor="price-search">
              <span>Пошук послуги</span>
              <input
                id="price-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveCategory("all");
                  setVisibleLimit(INITIAL_VISIBLE_COUNT);
                }}
                placeholder="Наприклад, ЕКГ або нирки"
                autoComplete="off"
              />
            </label>
          </div>

          {visibleItems.length ? (
            <div className="medical-price-table" role="tabpanel">
              <div className="medical-price-head" aria-hidden="true">
                <span>Послуга</span>
                <span>Напрям</span>
                <span>Вартість</span>
                <span />
              </div>
              {displayedItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <article className="medical-price-row" key={item.id}>
                    <div className="medical-price-service">
                      <span className="mobile-price-label">Послуга</span>
                      <strong>{item.name}</strong>
                    </div>
                    <div className="medical-price-category">
                      <span className="mobile-price-label">Напрям</span>
                      <span>{item.categoryLabel}</span>
                    </div>
                    <div className="medical-price-value">
                      <span className="mobile-price-label">Вартість</span>
                      <strong>{formatPrice(item.amount)}</strong>
                    </div>
                    <button
                      className={`price-row-action${isSelected ? " is-selected" : ""}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleItem(item.id)}
                    >
                      {isSelected ? "Додано" : "Додати"}
                      <span aria-hidden="true">{isSelected ? "✓" : "+"}</span>
                    </button>
                  </article>
                );
              })}
              {displayedItems.length < visibleItems.length ? (
                <button
                  className="price-load-more"
                  type="button"
                  onClick={() =>
                    setVisibleLimit((current) => current + INITIAL_VISIBLE_COUNT)
                  }
                >
                  Показати ще
                </button>
              ) : null}
            </div>
          ) : (
            <div className="price-search-empty">
              <h2>Послугу не знайдено</h2>
              <p>
                Спробуйте іншу назву або зателефонуйте адміністратору.
              </p>
              <button
                className="outline-button"
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                  setVisibleLimit(INITIAL_VISIBLE_COUNT);
                }}
              >
                Очистити пошук
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedItems.length ? (
        <div className="price-calculator-bar has-items" aria-live="polite">
          <div className="calculator-bar-icon" aria-hidden="true">
            {selectedItems.length}
          </div>
          <div className="calculator-bar-copy">
            <span>Калькулятор досліджень</span>
            <strong>
              {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "послуга" : "послуги"} ·{" "}
              {formatPrice(total)}
            </strong>
          </div>
          <button type="button" onClick={() => setCalculatorOpen(true)}>
            Переглянути
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}

      {calculatorOpen ? (
        <div
          className="calculator-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setCalculatorOpen(false);
          }}
        >
          <section
            className="calculator-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calculator-title"
          >
            <div className="calculator-dialog-head">
              <div>
                <span className="section-kicker">Ваш вибір</span>
                <h2 id="calculator-title">Калькулятор вартості</h2>
              </div>
              <button
                className="calculator-close"
                type="button"
                aria-label="Закрити калькулятор"
                onClick={() => setCalculatorOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="calculator-items">
              {selectedItems.map((item) => (
                <article key={item.id}>
                  <div>
                    <span>{item.categoryLabel}</span>
                    <strong>{item.name}</strong>
                  </div>
                  <strong>{formatPrice(item.amount)}</strong>
                  <button
                    type="button"
                    aria-label={`Видалити ${item.name}`}
                    onClick={() => {
                      toggleItem(item.id);
                      if (selectedItems.length === 1) setCalculatorOpen(false);
                    }}
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>

            <div className="calculator-total">
              <div>
                <span>Орієнтовна сума</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p>
                Остаточну вартість і можливість виконати дослідження в один день
                підтвердить адміністратор.
              </p>
              <a className="book-button" href={checkoutHref}>
                Перейти до запису <span>→</span>
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
