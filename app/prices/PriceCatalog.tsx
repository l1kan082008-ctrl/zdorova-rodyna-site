"use client";

import { useEffect, useMemo, useState } from "react";
import {
  catalogItems,
  categoryOptions,
  type PriceItem,
} from "./priceData";
import { PriceCategoryIcon } from "./PriceCategoryIcon";
import {
  announcePriceCalculatorSelection,
  PRICE_CALCULATOR_OPEN_EVENT,
  PRICE_CALCULATOR_STORAGE_KEY,
  readPriceCalculatorSelection,
} from "./calculatorSelection";

const categories = [
  { id: "all", label: "Усі послуги" },
  ...categoryOptions,
];

const INITIAL_VISIBLE_COUNT = 24;
const CATEGORY_PREVIEW_COUNT = 3;
const INITIAL_VISIBLE_GROUP_COUNT = 5;
const GROUPS_PER_LOAD = 5;

const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat("uk-UA").format(amount)} ₴`;

const formatServiceCount = (count: number) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} послуг`;
  }

  if (lastDigit === 1) return `${count} послуга`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} послуги`;
  return `${count} послуг`;
};

const getTurnaround = (item: PriceItem) =>
  item.turnaround?.trim() || "Уточнюйте";

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
  const [visibleGroupLimit, setVisibleGroupLimit] = useState(
    INITIAL_VISIBLE_GROUP_COUNT,
  );
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [selectionHydrated, setSelectionHydrated] = useState(false);
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
          `${item.name} ${item.categoryLabel} ${getTurnaround(item)} ${(item.aliases ?? []).join(" ")}`,
        ).includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, initialItems, query]);

  const selectedItems = useMemo(
    () => initialItems.filter((item) => selectedIds.includes(item.id)),
    [initialItems, selectedIds],
  );
  const allVisibleGroups = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    visibleItems.forEach((item) => {
      categoryTotals.set(
        item.category,
        (categoryTotals.get(item.category) ?? 0) + 1,
      );
    });

    const groupedItems = new Map<
      PriceItem["category"],
      {
        category: PriceItem["category"];
        categoryLabel: string;
        totalCount: number;
        items: PriceItem[];
        isPreview: boolean;
      }
    >();

    visibleItems.forEach((item) => {
      const currentGroup = groupedItems.get(item.category);

      if (currentGroup) {
        currentGroup.items.push(item);
        return;
      }

      groupedItems.set(item.category, {
        category: item.category,
        categoryLabel: item.categoryLabel,
        totalCount: categoryTotals.get(item.category) ?? 0,
        items: [item],
        isPreview: false,
      });
    });

    return Array.from(groupedItems.values());
  }, [visibleItems]);

  const isAllOverview = activeCategory === "all" && !normalizeSearch(query);

  const displayedGroups = useMemo(() => {
    if (isAllOverview) {
      return allVisibleGroups.slice(0, visibleGroupLimit).map((group) => ({
        ...group,
        items: group.items.slice(0, CATEGORY_PREVIEW_COUNT),
        isPreview: group.items.length > CATEGORY_PREVIEW_COUNT,
      }));
    }

    const limitedItems = visibleItems.slice(0, visibleLimit);
    const limitedIds = new Set(limitedItems.map((item) => item.id));

    return allVisibleGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => limitedIds.has(item.id)),
      }))
      .filter((group) => group.items.length);
  }, [
    allVisibleGroups,
    isAllOverview,
    visibleGroupLimit,
    visibleItems,
    visibleLimit,
  ]);

  const activeCategoryInfo =
    categories.find((category) => category.id === activeCategory) ??
    categories[0];

  const total = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const checkoutHref = `/contacts?services=${encodeURIComponent(
    selectedItems.map((item) => item.name).join(" | "),
  )}&total=${total}#booking`;

  useEffect(() => {
    const availableIds = new Set(initialItems.map((item) => item.id));
    const timer = window.setTimeout(() => {
      try {
        const storedIds = readPriceCalculatorSelection();

        if (Array.isArray(storedIds)) {
          setSelectedIds(
            storedIds.filter(
              (id): id is string =>
                typeof id === "string" && availableIds.has(id),
            ),
          );
        }
      } catch {
        window.localStorage.removeItem(PRICE_CALCULATOR_STORAGE_KEY);
      } finally {
        setSelectionHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialItems]);

  useEffect(() => {
    if (!selectionHydrated) return;
    window.localStorage.setItem(
      PRICE_CALCULATOR_STORAGE_KEY,
      JSON.stringify(selectedIds),
    );
    announcePriceCalculatorSelection(selectedIds);
  }, [selectedIds, selectionHydrated]);

  useEffect(() => {
    const syncSelection = (event: StorageEvent) => {
      if (
        event.key !== PRICE_CALCULATOR_STORAGE_KEY ||
        typeof event.newValue !== "string"
      ) {
        return;
      }

      try {
        const nextIds = JSON.parse(event.newValue) as unknown;
        if (Array.isArray(nextIds)) {
          const availableIds = new Set(initialItems.map((item) => item.id));
          setSelectedIds(
            nextIds.filter(
              (id): id is string =>
                typeof id === "string" && availableIds.has(id),
            ),
          );
        }
      } catch {
        // Ignore malformed values from another tab.
      }
    };

    window.addEventListener("storage", syncSelection);
    return () => window.removeEventListener("storage", syncSelection);
  }, [initialItems]);

  useEffect(() => {
    const openCalculator = () => {
      if (selectedIds.length) setCalculatorOpen(true);
    };

    window.addEventListener(PRICE_CALCULATOR_OPEN_EVENT, openCalculator);

    if (
      selectionHydrated &&
      selectedIds.length &&
      window.location.hash === "#calculator"
    ) {
      const frame = window.requestAnimationFrame(() => {
        setCalculatorOpen(true);
      });

      return () => {
        window.removeEventListener(PRICE_CALCULATOR_OPEN_EVENT, openCalculator);
        window.cancelAnimationFrame(frame);
      };
    }

    return () =>
      window.removeEventListener(PRICE_CALCULATOR_OPEN_EVENT, openCalculator);
  }, [selectedIds.length, selectionHydrated]);

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
      <section
        className="price-catalog-shell"
        id="price-calculator"
        aria-label="Каталог цін"
      >
        <aside className="price-category-panel">
          <button
            className="price-category-mobile-toggle"
            type="button"
            aria-expanded={mobileCategoriesOpen}
            aria-controls="price-category-list"
            onClick={() => setMobileCategoriesOpen((current) => !current)}
          >
            <span className="price-category-symbol" aria-hidden="true">
              <PriceCategoryIcon category={activeCategoryInfo.id} />
            </span>
            <span>
              <small>Категорія</small>
              <strong>{activeCategoryInfo.label}</strong>
            </span>
            <span
              className={`price-category-mobile-chevron${mobileCategoriesOpen ? " is-open" : ""}`}
              aria-hidden="true"
            />
          </button>
          <div
            className={`price-category-tabs${mobileCategoriesOpen ? " is-open" : ""}`}
            id="price-category-list"
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
                  setVisibleGroupLimit(INITIAL_VISIBLE_GROUP_COUNT);
                  setMobileCategoriesOpen(false);
                }}
              >
                <span className="price-category-symbol" aria-hidden="true">
                  <PriceCategoryIcon category={category.id} />
                </span>
                <span className="price-category-label">{category.label}</span>
              </button>
            ))}
          </div>
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
                  setVisibleGroupLimit(INITIAL_VISIBLE_GROUP_COUNT);
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
                              <div className="medical-price-duration">
                                <span>Термін</span>
                                <strong>{getTurnaround(item)}</strong>
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
                        {group.isPreview ? (
                          <button
                            className="price-group-view-all"
                            type="button"
                            onClick={() => {
                              setActiveCategory(group.category);
                              setVisibleLimit(INITIAL_VISIBLE_COUNT);
                              setMobileCategoriesOpen(false);
                            }}
                          >
                            Усі дослідження категорії
                            <span>{group.totalCount} →</span>
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                );
              })}
              {isAllOverview &&
              displayedGroups.length < allVisibleGroups.length ? (
                <button
                  className="price-load-more"
                  type="button"
                  onClick={() =>
                    setVisibleGroupLimit((current) => current + GROUPS_PER_LOAD)
                  }
                >
                  Показати більше категорій
                </button>
              ) : !isAllOverview &&
                displayedGroups.reduce(
                  (count, group) => count + group.items.length,
                  0,
                ) < visibleItems.length ? (
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
                  setVisibleGroupLimit(INITIAL_VISIBLE_GROUP_COUNT);
                }}
              >
                Очистити пошук
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedItems.length ? (
        <div className="price-calculator-spacer" aria-hidden="true" />
      ) : null}

      {selectedItems.length ? (
        <div className="price-calculator-bar has-items" aria-live="polite">
          <div className="calculator-bar-icon" aria-hidden="true">
            {selectedItems.length}
          </div>
          <div className="calculator-bar-copy">
            <span>Калькулятор досліджень</span>
            <strong>
              {formatServiceCount(selectedItems.length)} ·{" "}
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
                    <span>
                      {item.categoryLabel} · {getTurnaround(item)}
                    </span>
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
              <div className="calculator-total-actions">
                <button
                  className="outline-button"
                  type="button"
                  onClick={() => {
                    setSelectedIds([]);
                    setCalculatorOpen(false);
                  }}
                >
                  Очистити
                </button>
                <a className="book-button" href={checkoutHref}>
                  Перейти до запису <span>→</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
