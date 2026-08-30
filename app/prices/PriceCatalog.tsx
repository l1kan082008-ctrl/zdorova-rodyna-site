"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  catalogItems,
  type PriceItem,
} from "./priceData";
import { PriceCategoryIcon } from "./PriceCategoryIcon";
import {
  announcePriceCalculatorSelection,
  PRICE_CALCULATOR_CITO_STORAGE_KEY,
  PRICE_CALCULATOR_OPEN_EVENT,
  PRICE_CALCULATOR_STORAGE_KEY,
  readPriceCalculatorCitoSelection,
  readPriceCalculatorSelection,
  writePriceCalculatorCitoSelection,
} from "./calculatorSelection";
import {
  normalizeMedicalSearch,
  scoreMedicalSearch,
} from "../search/medicalSearch";
import {
  downloadCalculatorPdf,
  isCalculatorPdfPrepared,
  prepareCalculatorPdf,
  shareCalculatorSelection,
} from "./calculatorExport";
import { useModalDialog } from "../components/useModalDialog";
import { calculateCitoSurcharge } from "./citoPolicy";

const ANALYSIS_CATEGORIES = new Set<PriceItem["category"]>([
  "general",
  "biochemistry",
  "diabetes",
  "hemostasis",
  "hormones",
  "growth",
  "prenatal",
  "oncology",
  "rheumatology",
  "anemia",
  "immunology",
  "osteoporosis",
  "cytology",
  "infections",
  "hiv",
  "torch",
  "urogenital",
  "allergy",
  "genetics",
  "culture",
  "bacteriology",
  "complexes",
  "covid",
  "other-infections",
]);

const ULTRASOUND_CATEGORIES = new Set<PriceItem["category"]>([
  "ultrasound",
  "doppler",
]);

type PriceCategoryFilter =
  | "all"
  | "analyses"
  | "ultrasound-group"
  | PriceItem["category"];

const categories: ReadonlyArray<{
  id: PriceCategoryFilter;
  label: string;
  caption?: string;
}> = [
  { id: "all", label: "Усі послуги" },
  {
    id: "analyses",
    label: "Аналізи",
    caption: "Усі лабораторні напрямки",
  },
  { id: "ct", label: "КТ" },
  { id: "mri", label: "МРТ" },
  {
    id: "ultrasound-group",
    label: "УЗД",
    caption: "УЗД · Доплер судин",
  },
  { id: "heart", label: "Кардіологія" },
  { id: "medical", label: "Лікарські послуги" },
  { id: "sampling", label: "Забір матеріалу" },
];

const getCategoryFilter = (
  category: PriceItem["category"] | "all",
): PriceCategoryFilter => {
  if (category === "all") return "all";
  if (ANALYSIS_CATEGORIES.has(category)) return "analyses";
  if (ULTRASOUND_CATEGORIES.has(category)) return "ultrasound-group";
  return category;
};

const matchesCategoryFilter = (
  category: PriceItem["category"],
  filter: PriceCategoryFilter,
) =>
  filter === "all" ||
  (filter === "analyses" && ANALYSIS_CATEGORIES.has(category)) ||
  (filter === "ultrasound-group" && ULTRASOUND_CATEGORIES.has(category)) ||
  category === filter;

const getCategoryIconId = (
  category: PriceCategoryFilter,
): PriceItem["category"] | "all" => {
  if (category === "analyses") return "general";
  if (category === "ultrasound-group") return "ultrasound";
  return category;
};

const INITIAL_VISIBLE_COUNT = 24;
const CATEGORY_PREVIEW_COUNT = 3;
const CITO_CATEGORY_PREVIEW_COUNT = 4;
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

const formatRemainingStudies = (count: number) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const noun =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? "досліджень"
      : lastDigit >= 1 && lastDigit <= 4
        ? "дослідження"
        : "досліджень";

  return `Ще ${count} ${noun}`;
};

const getTurnaround = (item: PriceItem) =>
  item.turnaround?.trim() || "Уточнюйте";

export function PriceCatalog({
  initialItems = catalogItems,
  initialCategory = "all",
  initialQuery = "",
}: {
  initialItems?: PriceItem[];
  initialCategory?: PriceItem["category"] | "all";
  initialQuery?: string;
}) {
  const requestedDefaultCategory = getCategoryFilter(initialCategory);
  const defaultCategory = categories.some(
    (category) => category.id === requestedDefaultCategory,
  )
    ? requestedDefaultCategory
    : "all";
  const [activeCategory, setActiveCategory] =
    useState<PriceCategoryFilter>(defaultCategory);
  const [query, setQuery] = useState(initialQuery);
  const [citoOnly, setCitoOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [citoSelectedIds, setCitoSelectedIds] = useState<string[]>([]);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorExporting, setCalculatorExporting] = useState<
    "pdf" | "share" | null
  >(null);
  const [calculatorActionMessage, setCalculatorActionMessage] = useState("");
  const [calculatorPdfReady, setCalculatorPdfReady] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_VISIBLE_COUNT);
  const [visibleGroupLimit, setVisibleGroupLimit] = useState(
    INITIAL_VISIBLE_GROUP_COUNT,
  );
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [selectionHydrated, setSelectionHydrated] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const calculatorDialogRef = useRef<HTMLElement>(null);
  const calculatorCloseRef = useRef<HTMLButtonElement>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<
    Set<PriceItem["category"]>
  >(() => new Set());
  const [expandedPreviewCategories, setExpandedPreviewCategories] = useState<
    Set<PriceItem["category"]>
  >(() => new Set());

  useModalDialog({
    open: calculatorOpen,
    dialogRef: calculatorDialogRef,
    onClose: () => setCalculatorOpen(false),
    initialFocusRef: calculatorCloseRef,
  });

  const visibleItems = useMemo(() => {
    const normalized = normalizeMedicalSearch(query);

    return initialItems
      .map((item, index) => ({
        item,
        index,
        score: normalized
          ? scoreMedicalSearch(
              normalized,
              item.name,
              `${item.categoryLabel} ${getTurnaround(item)} ${(item.aliases ?? []).join(" ")}`,
            )
          : 1,
      }))
      .filter(
        ({ item, score }) =>
          matchesCategoryFilter(item.category, activeCategory) &&
          (!citoOnly ||
            item.citoAvailable) &&
          score > 0,
      )
      .sort((first, second) => second.score - first.score || first.index - second.index)
      .map(({ item }) => item);
  }, [activeCategory, citoOnly, initialItems, query]);

  const citoAvailableCount = useMemo(
    () =>
      initialItems.filter(
        (item) => item.citoAvailable,
      ).length,
    [initialItems],
  );

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

  const isAllOverview =
    activeCategory === "all" && !normalizeMedicalSearch(query) && !citoOnly;
  const isCitoOverview =
    activeCategory === "all" && !normalizeMedicalSearch(query) && citoOnly;
  const isGroupedCategoryOverview =
    (activeCategory === "analyses" ||
      activeCategory === "ultrasound-group") &&
    !normalizeMedicalSearch(query) &&
    !citoOnly;
  const isInlineOverview =
    isAllOverview || isCitoOverview || isGroupedCategoryOverview;

  const displayedGroups = useMemo(() => {
    if (isCitoOverview) {
      return allVisibleGroups.map((group) => {
        const isExpanded = expandedPreviewCategories.has(group.category);

        return {
          ...group,
          items: isExpanded
            ? group.items
            : group.items.slice(0, CITO_CATEGORY_PREVIEW_COUNT),
          isPreview: group.items.length > CITO_CATEGORY_PREVIEW_COUNT,
        };
      });
    }

    if (isGroupedCategoryOverview) {
      return allVisibleGroups.map((group) => {
        const isExpanded = expandedPreviewCategories.has(group.category);

        return {
          ...group,
          items: isExpanded
            ? group.items
            : group.items.slice(0, CATEGORY_PREVIEW_COUNT),
          isPreview: group.items.length > CATEGORY_PREVIEW_COUNT,
        };
      });
    }

    if (isAllOverview) {
      return allVisibleGroups.slice(0, visibleGroupLimit).map((group) => {
        const isExpanded = expandedPreviewCategories.has(group.category);

        return {
          ...group,
          items: isExpanded
            ? group.items
            : group.items.slice(0, CATEGORY_PREVIEW_COUNT),
          isPreview: group.items.length > CATEGORY_PREVIEW_COUNT,
        };
      });
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
    expandedPreviewCategories,
    isCitoOverview,
    isGroupedCategoryOverview,
    isAllOverview,
    visibleGroupLimit,
    visibleItems,
    visibleLimit,
  ]);

  const activeCategoryInfo =
    categories.find((category) => category.id === activeCategory) ??
    {
      id: activeCategory,
      label:
        initialItems.find((item) => item.category === activeCategory)
          ?.categoryLabel ?? categories[0].label,
    };

  const displayedItemCount = displayedGroups.reduce(
    (count, group) => count + group.items.length,
    0,
  );
  const hasExpandedDisplayedGroup = displayedGroups.some(
    (group) => !collapsedCategories.has(group.category),
  );
  const hasMoreVisibleItems =
    !isCitoOverview &&
    !isAllOverview &&
    !isGroupedCategoryOverview &&
    hasExpandedDisplayedGroup &&
    displayedItemCount < visibleItems.length;

  const citoSelectedCount = selectedItems.filter(
    (item) => citoSelectedIds.includes(item.id) && item.citoAvailable,
  ).length;
  const citoSurchargeTotal = calculateCitoSurcharge(citoSelectedCount);
  const total =
    selectedItems.reduce((sum, item) => sum + item.amount, 0) +
    citoSurchargeTotal;
  const calculatorExportItems = useMemo(
    () =>
      selectedItems.map((item) => {
        const cito = citoSelectedIds.includes(item.id) && item.citoAvailable;
        return {
          name: item.name,
          categoryLabel: item.categoryLabel,
          turnaround: getTurnaround(item),
          amount: item.amount,
          cito,
        };
      }),
    [citoSelectedIds, selectedItems],
  );
  const checkoutHref = `/contacts?services=${encodeURIComponent(
    [
      ...selectedItems.map((item) =>
        citoSelectedIds.includes(item.id) && item.citoAvailable
          ? `${item.name} — CITO`
          : item.name,
      ),
      ...(citoSelectedCount > 0
        ? [
            `Доплата CITO (${citoSelectedCount} досл., до 2 годин) — ${formatPrice(citoSurchargeTotal)}`,
          ]
        : []),
    ].join(" | "),
  )}&total=${total}#booking`;

  useEffect(() => {
    let cancelled = false;

    if (!calculatorExportItems.length) {
      setCalculatorPdfReady(false);
      return;
    }

    if (isCalculatorPdfPrepared(calculatorExportItems, total)) {
      setCalculatorPdfReady(true);
      return;
    }

    setCalculatorPdfReady(false);
    void prepareCalculatorPdf(calculatorExportItems, total)
      .then(() => {
        if (!cancelled) setCalculatorPdfReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setCalculatorPdfReady(false);
          setCalculatorActionMessage(
            "Не вдалося підготувати PDF. Спробуйте змінити список і повторити.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [calculatorExportItems, total]);

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
        const eligibleCitoIds = new Set(
          initialItems
            .filter((item) => item.citoAvailable)
            .map((item) => item.id),
        );
        setCitoSelectedIds(
          readPriceCalculatorCitoSelection().filter(
            (id) => availableIds.has(id) && eligibleCitoIds.has(id),
          ),
        );
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
    if (!selectionHydrated) return;
    const selectedSet = new Set(selectedIds);
    const eligibleSet = new Set(
      initialItems
        .filter((item) => item.citoAvailable)
        .map((item) => item.id),
    );
    const nextIds = citoSelectedIds.filter(
      (id) => selectedSet.has(id) && eligibleSet.has(id),
    );
    writePriceCalculatorCitoSelection(nextIds);
    if (nextIds.length !== citoSelectedIds.length) {
      setCitoSelectedIds(nextIds);
    }
  }, [citoSelectedIds, initialItems, selectedIds, selectionHydrated]);

  useEffect(() => {
    const syncSelection = (event: StorageEvent) => {
      if (
        event.key !== PRICE_CALCULATOR_STORAGE_KEY &&
        event.key !== PRICE_CALCULATOR_CITO_STORAGE_KEY
      ) {
        return;
      }

      if (event.key === PRICE_CALCULATOR_CITO_STORAGE_KEY) {
        setCitoSelectedIds(readPriceCalculatorCitoSelection());
        return;
      }

      if (event.newValue === null) {
        setSelectedIds([]);
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

    if (selectionHydrated && window.location.hash === "#calculator") {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );

      if (!selectedIds.length) {
        return () =>
          window.removeEventListener(
            PRICE_CALCULATOR_OPEN_EVENT,
            openCalculator,
          );
      }

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

    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const previousRootOverflow = root.style.overflow;

    body.classList.add("calculator-is-open");
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";

    return () => {
      body.classList.remove("calculator-is-open");
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;
      root.style.overflow = previousRootOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [calculatorOpen]);

  const toggleItem = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        setCitoSelectedIds((citoIds) =>
          citoIds.filter((selectedId) => selectedId !== id),
        );
        return current.filter((selectedId) => selectedId !== id);
      }
      return [...current, id];
    });
  };

  const setCitoForItem = (id: string, enabled: boolean) => {
    if (enabled) {
      setSelectedIds((current) =>
        current.includes(id) ? current : [...current, id],
      );
    }

    setCitoSelectedIds((current) => {
      if (enabled) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((selectedId) => selectedId !== id);
    });
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

  const clearSearch = () => {
    setQuery("");
    setActiveCategory("all");
    setExpandedPreviewCategories(new Set());
    setVisibleLimit(INITIAL_VISIBLE_COUNT);
    setVisibleGroupLimit(INITIAL_VISIBLE_GROUP_COUNT);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const handlePdfDownload = async () => {
    if (!calculatorPdfReady) return;
    setCalculatorExporting("pdf");
    setCalculatorActionMessage("");
    try {
      await downloadCalculatorPdf(calculatorExportItems, total);
      setCalculatorActionMessage("PDF збережено на пристрій.");
    } catch {
      setCalculatorActionMessage("Не вдалося створити PDF. Спробуйте ще раз.");
    } finally {
      setCalculatorExporting(null);
    }
  };

  const handleShareSelection = async () => {
    if (!calculatorPdfReady) return;
    setCalculatorExporting("share");
    setCalculatorActionMessage("");
    try {
      const result = await shareCalculatorSelection(calculatorExportItems, total);
      if (result === "copied") {
        setCalculatorActionMessage("Список скопійовано — його можна надіслати.");
      } else if (result === "shared") {
        setCalculatorActionMessage("Список підготовлено до надсилання.");
      }
    } catch {
      setCalculatorActionMessage("Не вдалося поділитися списком. Спробуйте ще раз.");
    } finally {
      setCalculatorExporting(null);
    }
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
              <PriceCategoryIcon
                category={getCategoryIconId(activeCategoryInfo.id)}
              />
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
                  setCollapsedCategories(new Set());
                  setExpandedPreviewCategories(new Set());
                  setVisibleLimit(INITIAL_VISIBLE_COUNT);
                  setVisibleGroupLimit(INITIAL_VISIBLE_GROUP_COUNT);
                  setMobileCategoriesOpen(false);
                }}
              >
                <span className="price-category-symbol" aria-hidden="true">
                  <PriceCategoryIcon
                    category={getCategoryIconId(category.id)}
                  />
                </span>
                <span className="price-category-label-wrap">
                  <span className="price-category-label">{category.label}</span>
                  {category.caption ? (
                    <small>{category.caption}</small>
                  ) : null}
                </span>
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
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveCategory("all");
                  setExpandedPreviewCategories(new Set());
                  setVisibleLimit(INITIAL_VISIBLE_COUNT);
                  setVisibleGroupLimit(INITIAL_VISIBLE_GROUP_COUNT);
                }}
                placeholder="Пошук послуги"
                autoComplete="off"
              />
              {query ? (
                <button
                  className="price-search-clear"
                  type="button"
                  aria-label="Очистити пошук"
                  onClick={clearSearch}
                >
                  ×
                </button>
              ) : null}
            </label>
            <button
              className={`price-cito-filter${citoOnly ? " is-active" : ""}`}
              type="button"
              aria-pressed={citoOnly}
              onClick={() => {
                const nextCitoOnly = !citoOnly;
                setCitoOnly(nextCitoOnly);
                setExpandedPreviewCategories(new Set());
                if (nextCitoOnly) {
                  setActiveCategory("all");
                  setQuery("");
                  setCollapsedCategories(new Set());
                }
                setVisibleLimit(INITIAL_VISIBLE_COUNT);
                setVisibleGroupLimit(INITIAL_VISIBLE_GROUP_COUNT);
              }}
            >
              <span className="price-cito-filter-icon" aria-hidden="true">
                ⚡
              </span>
              <span className="price-cito-filter-copy">
                <strong>Доступні CITO</strong>
                <small>Термінове виконання</small>
              </span>
              <span className="price-cito-filter-count">
                {citoAvailableCount}
              </span>
            </button>
          </div>

          {visibleItems.length ? (
            <div className="medical-price-table" role="tabpanel">
              {displayedGroups.map((group) => {
                const isCollapsed = collapsedCategories.has(group.category);
                const isPreviewExpanded = expandedPreviewCategories.has(
                  group.category,
                );
                const hiddenStudyCount = Math.max(
                  group.totalCount - group.items.length,
                  0,
                );
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
                      <span
                        className={`medical-price-group-chevron${isCollapsed ? " is-collapsed" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {!isCollapsed ? (
                      <div className="medical-price-group-rows" id={rowsId}>
                        {group.items.map((item) => {
                          const isSelected = selectedIds.includes(item.id);
                          const citoSelected = citoSelectedIds.includes(item.id);

                          return (
                            <article className="medical-price-row" key={item.id}>
                              <div className="medical-price-service">
                                <span className="mobile-price-label">Послуга</span>
                                <strong>{item.name}</strong>
                                {item.citoAvailable ? (
                                  <div className={`cito-control price-cito-control${citoSelected ? " is-active" : ""}`}>
                                    <span className="cito-control-copy">
                                      <b>CITO</b>
                                      <small>до 2 годин</small>
                                    </span>
                                    <button
                                      className="cito-switch"
                                      type="button"
                                      role="switch"
                                      aria-checked={citoSelected}
                                      aria-label={`CITO для ${item.name}, термінове виконання до 2 годин`}
                                      onClick={() =>
                                        setCitoForItem(item.id, !citoSelected)
                                      }
                                    >
                                      <span aria-hidden="true" />
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              <div className="medical-price-duration">
                                <span>Термін</span>
                                <strong>{getTurnaround(item)}</strong>
                              </div>
                              <div className="medical-price-value">
                                <span className="mobile-price-label">Вартість</span>
                                <strong>
                                  {formatPrice(item.amount)}
                                </strong>
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
                            aria-expanded={
                              isInlineOverview ? isPreviewExpanded : undefined
                            }
                            onClick={() => {
                              if (isInlineOverview) {
                                setExpandedPreviewCategories((current) => {
                                  const next = new Set(current);

                                  if (next.has(group.category)) {
                                    next.delete(group.category);
                                  } else {
                                    next.add(group.category);
                                  }

                                  return next;
                                });
                                return;
                              }

                              setActiveCategory(group.category);
                              setCollapsedCategories(new Set());
                              setVisibleLimit(INITIAL_VISIBLE_COUNT);
                              setMobileCategoriesOpen(false);
                            }}
                          >
                            <span className="price-group-view-all-copy">
                              <strong>
                                {isInlineOverview
                                  ? isPreviewExpanded
                                    ? "Повний список відкрито"
                                    : formatRemainingStudies(hiddenStudyCount)
                                  : "Усі дослідження категорії"}
                              </strong>
                              <small>
                                {isInlineOverview
                                  ? isPreviewExpanded
                                    ? "Згорнути до короткого списку"
                                    : "Розгорнути повний список"
                                  : "Перейти до повного списку"}
                              </small>
                            </span>
                            <span
                              className="price-group-view-all-action"
                              aria-hidden="true"
                            >
                              {isInlineOverview
                                ? isPreviewExpanded
                                  ? "↑"
                                  : "↓"
                                : "→"}
                            </span>
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
              ) : hasMoreVisibleItems ? (
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
                onClick={clearSearch}
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
            ref={calculatorDialogRef}
            className="calculator-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calculator-title"
            tabIndex={-1}
          >
            <div className="calculator-dialog-head">
              <div>
                <span className="section-kicker">Ваш вибір</span>
                <h2 id="calculator-title">Калькулятор вартості</h2>
              </div>
              <button
                ref={calculatorCloseRef}
                className="calculator-close"
                type="button"
                aria-label="Закрити калькулятор"
                onClick={() => setCalculatorOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="calculator-items">
              {selectedItems.map((item) => {
                const citoSelected = citoSelectedIds.includes(item.id);
                return (
                <article key={item.id}>
                  <div className="calculator-item-copy">
                    <span>
                      {item.categoryLabel} · {getTurnaround(item)}
                    </span>
                    <strong>{item.name}</strong>
                    {item.citoAvailable ? (
                      <div className={`cito-control calculator-cito-option${citoSelected ? " is-active" : ""}`}>
                        <span className="cito-control-copy">
                          <b>CITO</b>
                          <small>до 2 годин · групова доплата</small>
                        </span>
                        <button
                          className="cito-switch"
                          type="button"
                          role="switch"
                          aria-checked={citoSelected}
                          aria-label={`CITO для ${item.name}, термінове виконання до 2 годин`}
                          onClick={() =>
                            setCitoForItem(item.id, !citoSelected)
                          }
                        >
                          <span aria-hidden="true" />
                        </button>
                      </div>
                    ) : null}
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
                );
              })}
            </div>

            {citoSelectedCount > 0 ? (
              <div className="calculator-cito-summary">
                <div>
                  <span>Термінове виконання CITO</span>
                  <strong>{citoSelectedCount} досл. · до 2 годин</strong>
                </div>
                <b>+{formatPrice(citoSurchargeTotal)}</b>
                <p>
                  1–2 дослідження — 200 грн; кожне наступне — +50 грн;
                  від 5 досліджень — 350 грн.
                </p>
              </div>
            ) : null}

            <div className="calculator-share-tools" aria-label="Дії зі списком досліджень">
              <div className="calculator-share-actions">
                <button
                  type="button"
                  aria-label="Зберегти список у PDF"
                  onClick={handlePdfDownload}
                  disabled={calculatorExporting !== null || !calculatorPdfReady}
                >
                  <span className="calculator-action-icon is-file-download" aria-hidden="true">
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false">
                      <path
                        className="pdf-file-shape"
                        d="M6.68.51h8.1c.47.03.64.33.92.61 1.56 1.55 3.11 3.14 4.61 4.74.11.18.17.36.18.57v13.84c-.16 1.69-1.49 3.06-3.19 3.23H6.67c-1.6-.18-2.81-1.37-3.1-2.93-.07-5.29-.09-10.62 0-15.9 0-.56-.05-1.05.1-1.59.38-1.4 1.57-2.42 3.02-2.56ZM14 1.86l-.21-.04h-7.09c-1.09.22-1.84 1.1-1.91 2.21v16.14c.17 1.13.98 1.93 2.13 2.02 3.51-.04 7.04.07 10.54-.06 1.03-.23 1.75-1.18 1.77-2.22.08-3.62-.15-7.24 0-10.86l-.04-1.72h-3.53c-.47 0-1.15-.48-1.38-.88-.06-.1-.3-.64-.3-.72V1.86ZM18.72 6.01c-.06-.08-.12-.17-.19-.25-.88-1-2-2.14-2.97-3.07-.08-.08-.21-.2-.32-.23v2.92c0 .19.28.62.47.62h3Z"
                      />
                      <path
                        className="download-arrow"
                        d="m12.68 18.03.11-.06c.59-.5 1.18-1.39 1.79-1.83s1.3.25.92.89c-1.03.97-1.96 2.16-3 3.11-.34.31-.71.29-1.04-.02-.46-.43-.88-.95-1.32-1.4-.37-.37-.76-.73-1.11-1.11-.15-.16-.49-.51-.57-.68-.26-.6.31-1.15.85-.85.29.16 1.11 1.07 1.39 1.36.16.17.3.39.49.53.04.03.05.07.11.06-.04-.27.04-.55.04-.81.01-1.57-.05-3.15-.04-4.71 0-.61-.06-1.38 0-1.96.05-.46.36-.74.83-.66.23.04.52.34.52.58v7.56Z"
                      />
                    </svg>
                  </span>
                  <strong>
                    {!calculatorPdfReady
                      ? "Готуємо…"
                      : calculatorExporting === "pdf"
                        ? "Створюємо…"
                        : "PDF"}
                  </strong>
                </button>
                <button
                  type="button"
                  onClick={handleShareSelection}
                  disabled={calculatorExporting !== null || !calculatorPdfReady}
                >
                  <span className="calculator-action-icon is-share" aria-hidden="true">
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false">
                      <path d="M7.47 13.1l9.42 5.16.1-.02c.48-.63 1.2-1.16 1.98-1.33 3.49-.76 5.45 3.74 2.75 5.86-2.48 1.94-5.86-.27-5.27-3.28l-.2-.16-9.37-5.14c-.43.39-.83.78-1.39 1-2.5.97-4.95-1.18-4.4-3.77.47-2.24 3.17-3.39 5.09-2.07.22.15.48.49.64.59.04.02.06.05.11.03l9.49-5.38c.07-.09-.03-.38-.04-.51-.23-3.98 5.39-4.96 6.44-1.23s-3.59 5.91-5.82 2.94l-.14-.02-9.33 5.27-.04.06.14.94-.15 1.08ZM19.37 1.73c-.76.09-1.47.8-1.67 1.53-.53 1.9 1.65 3.45 3.22 2.19s.6-3.98-1.55-3.71ZM4.11 10.01c-2.6.3-2.37 4.42.38 4.17s2.34-4.48-.38-4.17ZM19.33 18.09c-.61.08-1.22.61-1.48 1.16-.79 1.68.81 3.56 2.57 2.85 2.23-.91 1.47-4.35-1.09-4.01Z" />
                    </svg>
                  </span>
                  <strong>
                    {calculatorExporting === "share" ? "Готуємо…" : "Надіслати"}
                  </strong>
                </button>
              </div>
              <p className="calculator-action-message" aria-live="polite" role="status">
                {calculatorActionMessage ||
                  "Список готовий до збереження або надсилання."}
              </p>
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
                    setCitoSelectedIds([]);
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
