"use client";

import { useEffect, useMemo, useState } from "react";
import {
  catalogItems,
  categoryOptions,
  type PriceItem,
} from "./priceData";
import { PriceCategoryIcon } from "./PriceCategoryIcon";

const categories = [
  { id: "all", label: "Усі послуги" },
  ...categoryOptions,
];

const INITIAL_VISIBLE_COUNT = 24;

const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat("uk-UA").format(amount)} ₴`;

const normalizeSearch = (value: string) =>
  value
    .toLocaleLowerCase("uk-UA")
    .normalize("NFKD")
    .replace(/[’'`ʼ]/g, "")
    .replace(/[–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function PriceCatalog({
  initialItems = catalogItems,
}: {
  initialItems?: PriceItem[];
}) {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_VISIBLE_COUNT);
  const [collapsedCategories, setCollapsedCategories] = useState<
    Set<PriceItem["category"]>
  >(() => new Set());

  const visibleItems = useMemo(() => {
    const normalized = normalizeSearch(query);

    return initialItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesQuery =
        !normalized ||
        normalizeSearch(
          `${item.name} ${item.categoryLabel} ${(item.aliases ?? []).join(" ")}`,
        ).includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, initialItems, query]);

  const selectedItems = useMemo(
    () => initialItems.filter((item) => selectedIds.includes(item.id)),
    [initialItems, selectedIds],
  );
  const displayedItems = useMemo(
    () => visibleItems.slice(0, visibleLimit),
    [visibleItems, visibleLimit],
  );
  const displayedGroups = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    visibleItems.forEach((item) => {
      categoryTotals.set(
        item.category,
        (categoryTotals.get(item.category) ?? 0) + 1,
      );
    });

    return displayedItems.reduce<
      Array<{
        category: PriceItem["category"];
        categoryLabel: string;
        totalCount: number;
        items: PriceItem[];
      }>
    >((groups, item) => {
      const currentGroup = groups.at(-1);

      if (currentGroup?.category === item.category) {
        currentGroup.items.push(item);
        return groups;
      }

      groups.push({
        category: item.category,
        categoryLabel: item.categoryLabel,
        totalCount: categoryTotals.get(item.category) ?? 0,
        items: [item],
      });

      return groups;
    }, []);
  }, [displayedItems, visibleItems]);

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

  const toggleCategory = (category: PriceItem["category"]) => {
    setCollapsedCategories((current) => {
      const next = new Set(current);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      return next;
    });
  };

  return (
    <>
      <section className="price-catalog-shell" aria-label="Каталог цін">
        <header className="price-catalog-heading">
          <h1>Вартість послуг</h1>
        </header>

        <aside className="price-category-panel">
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
                <span className="price-category-symbol" aria-hidden="true">
                  <PriceCategoryIcon category={category.id} />
                </span>
                <span className="price-category-label">{category.label}</span>
              </button>
            ))}
          </div>
          <p className="price-category-mobile-hint" aria-hidden="true">
            Гортайте категорії →
          </p>
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
                placeholder="Пошук послуги"
                autoComplete="off"
              />
            </label>
          </div>

          {visibleItems.length ? (
            <div className="medical-price-table" role="tabpanel">
              {displayedGroups.map((group) => {
                const isCollapsed = collapsedCategories.has(group.category);
                const rowsId = `price-group-rows-${group.category}`;

                return (
                  <section
                    className="medical-price-group"
                    key={group.category}
                    aria-labelledby={`price-group-${group.category}`}
                  >
                    <button
                      className="medical-price-group-head"
                      type="button"
                      aria-expanded={!isCollapsed}
                      aria-controls={rowsId}
                      onClick={() => toggleCategory(group.category)}
                    >
                      <span className="medical-price-group-icon" aria-hidden="true">
                        <PriceCategoryIcon category={group.category} />
                      </span>
                      <h3 id={`price-group-${group.category}`}>
                        {group.categoryLabel}
                      </h3>
                      <span className="medical-price-group-count">
                        {group.totalCount}
                      </span>
                      <span
                        className={`medical-price-group-chevron${isCollapsed ? " is-collapsed" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {!isCollapsed ? (
                      <div className="medical-price-group-rows" id={rowsId}>
                        {group.items.map((item) => {
                          const isSelected = selectedIds.includes(item.id);

                          return (
                            <article className="medical-price-row" key={item.id}>
                              <div className="medical-price-service">
                                <span className="mobile-price-label">Послуга</span>
                                <strong>{item.name}</strong>
                              </div>
                              <div className="medical-price-value">
                                <span className="mobile-price-label">Вартість</span>
                                <strong>{formatPrice(item.amount)}</strong>
                              </div>
                              <button
                                className={`price-row-action${isSelected ? " is-selected" : ""}`}
                                type="button"
                                aria-pressed={isSelected}
                                aria-label={
                                  isSelected
                                    ? `Видалити ${item.name} з калькулятора`
                                    : `Додати ${item.name} до калькулятора`
                                }
                                onClick={() => toggleItem(item.id)}
                              >
                                {isSelected ? "Додано" : "Додати"}
                                <span aria-hidden="true">
                                  {isSelected ? "✓" : "+"}
                                </span>
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
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
