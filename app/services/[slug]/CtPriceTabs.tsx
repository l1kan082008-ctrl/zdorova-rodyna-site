"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import type { PriceItem } from "../../prices/priceData";
import { CT_PRICE_GROUPS, type CtPriceGroupId } from "./ctPriceGroups";
import styles from "./CtServicePage.module.css";

type PricePair = {
  id: string;
  name: string;
  withoutContrast?: PriceItem;
  withContrast?: PriceItem;
};

function normalizeName(value: string) {
  return value
    .toLocaleLowerCase("uk-UA")
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const OFFICIAL_CT_GROUP_RANGES: ReadonlyArray<{
  from: number;
  to: number;
  groupId: CtPriceGroupId;
}> = [
  { from: 1, to: 9, groupId: "head" },
  { from: 10, to: 27, groupId: "bones" },
  { from: 28, to: 29, groupId: "neck" },
  { from: 30, to: 31, groupId: "chest" },
  { from: 32, to: 35, groupId: "abdomen" },
  { from: 36, to: 45, groupId: "combined" },
  { from: 46, to: 52, groupId: "angiography" },
  { from: 53, to: 59, groupId: "heart" },
  { from: 60, to: 68, groupId: "additional" },
];

function getOfficialCtPosition(item: PriceItem) {
  const idMatch = /^official-230-(\d{3})$/.exec(item.id);
  if (idMatch) return Number(idMatch[1]);

  if (
    typeof item.sortOrder === "number" &&
    item.sortOrder >= 3000 &&
    item.sortOrder <= 3067
  ) {
    return item.sortOrder - 2999;
  }

  return null;
}

function getGroupId(item: PriceItem): CtPriceGroupId {
  const position = getOfficialCtPosition(item);
  if (position === null) return "additional";

  return (
    OFFICIAL_CT_GROUP_RANGES.find(
      (range) => position >= range.from && position <= range.to,
    )?.groupId ?? "additional"
  );
}

function getBaseName(name: string) {
  return name.replace(/\s*\(з контрастуванням\)\s*$/i, "").trim();
}

function isExplicitContrast(name: string) {
  return /\(з контрастуванням\)\s*$/i.test(name);
}

const NON_BOOKABLE_CT_POSITIONS = new Set([60, 61, 62, 63, 64, 65, 68]);

function requiresSeparateBooking(item: PriceItem) {
  const position = getOfficialCtPosition(item);
  return position === null || !NON_BOOKABLE_CT_POSITIONS.has(position);
}

function pairItems(items: PriceItem[], groupId: CtPriceGroupId): PricePair[] {
  const pairs = new Map<string, PricePair>();
  const explicitContrastNames = new Set(
    items.filter((item) => isExplicitContrast(item.name)).map((item) => normalizeName(getBaseName(item.name))),
  );

  items.forEach((item) => {
    const name = getBaseName(item.name);
    const key = normalizeName(name);
    const pair = pairs.get(key) ?? { id: item.id, name };
    const isImplicitContrast =
      groupId === "angiography" ||
      (groupId === "heart" && !/підрахунку кальцію/.test(key)) ||
      (groupId === "combined" && !explicitContrastNames.has(key)) ||
      (groupId === "abdomen" && /ентерограф|колонограф|черевної порожнини\s*\+/.test(key));

    if (isExplicitContrast(item.name) || isImplicitContrast) {
      pair.withContrast = item;
    } else {
      pair.withoutContrast = item;
    }
    pairs.set(key, pair);
  });

  return Array.from(pairs.values());
}

function PriceOption({
  item,
  label,
  contrast = false,
}: {
  item?: PriceItem;
  label: string;
  contrast?: boolean;
}) {
  return (
    <div className={styles.priceVariant} role="cell">
      <span className={styles.priceVariantLabel}>{label}</span>
      {item && requiresSeparateBooking(item) ? (
        <Link
          className={`${styles.priceBooking}${contrast ? ` ${styles.priceBookingContrast}` : ""}`}
          href={`/contacts?service=${encodeURIComponent(item.name)}#booking`}
          aria-label={`Записатися на ${item.name}`}
        >
          <strong>{item.amount.toLocaleString("uk-UA")} грн</strong>
          <span className={styles.priceBookingAction}>Записатися <span aria-hidden="true">→</span></span>
        </Link>
      ) : item ? (
        <span className={styles.priceStatic}>
          <strong>{item.amount.toLocaleString("uk-UA")} грн</strong>
        </span>
      ) : (
        <span className={styles.priceUnavailable}>Не передбачено</span>
      )}
    </div>
  );
}

type Props = { items: PriceItem[] };

export function CtPriceTabs({ items }: Props) {
  const [active, setActive] = useState<CtPriceGroupId>("head");
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const groupedPairs = useMemo(() => {
    const map = new Map<CtPriceGroupId, PricePair[]>();
    CT_PRICE_GROUPS.forEach((group) => {
      const groupItems = items.filter((item) => getGroupId(item) === group.id);
      if (groupItems.length) map.set(group.id, pairItems(groupItems, group.id));
    });
    return map;
  }, [items]);
  const availableGroups = useMemo(
    () => CT_PRICE_GROUPS.filter((group) => groupedPairs.has(group.id)),
    [groupedPairs],
  );
  const selectedGroup = availableGroups.some((group) => group.id === active)
    ? active
    : (availableGroups[0]?.id ?? "head");
  const selectedGroupMeta = availableGroups.find((group) => group.id === selectedGroup);
  const visibleItems = groupedPairs.get(selectedGroup) ?? [];

  useEffect(() => {
    const syncCategoryFromHash = () => {
      const prefix = "#ct-prices-";
      if (!window.location.hash.startsWith(prefix)) return;

      const groupId = window.location.hash.slice(prefix.length) as CtPriceGroupId;
      if (!availableGroups.some((group) => group.id === groupId)) return;

      setActive(groupId);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.requestAnimationFrame(() => {
        document.getElementById("ct-prices")?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    };

    syncCategoryFromHash();
    window.addEventListener("hashchange", syncCategoryFromHash);
    return () => window.removeEventListener("hashchange", syncCategoryFromHash);
  }, [availableGroups]);

  const selectGroup = (groupId: CtPriceGroupId) => {
    setActive(groupId);
    setMobileMenuOpen(false);
    window.history.replaceState(null, "", `#ct-prices-${groupId}`);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (!mobileNavRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      mobileTriggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const columnCount = window.matchMedia("(max-width: 1100px)").matches ? 2 : 3;
    let nextIndex = index;

    if (event.key === "ArrowRight") nextIndex = Math.min(availableGroups.length - 1, index + 1);
    if (event.key === "ArrowLeft") nextIndex = Math.max(0, index - 1);
    if (event.key === "ArrowDown") nextIndex = Math.min(availableGroups.length - 1, index + columnCount);
    if (event.key === "ArrowUp") nextIndex = Math.max(0, index - columnCount);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = availableGroups.length - 1;
    if (nextIndex === index) return;

    event.preventDefault();
    const nextGroup = availableGroups[nextIndex];
    selectGroup(nextGroup.id);
    tabsRef.current
      ?.querySelector<HTMLButtonElement>(`[data-price-group="${nextGroup.id}"]`)
      ?.focus();
  };

  return (
    <div className={styles.pricePanel}>
      <div className={styles.priceTabsViewport}>
        <span className={styles.priceTabsLabel}>Категорії досліджень</span>
        <div className={styles.priceMobileNav} ref={mobileNavRef}>
          <span className={styles.priceMobileLabel} id="ct-price-category-label">Категорія досліджень</span>
          <span className={styles.priceSelectWrap}>
            <button
              className={styles.priceMobileTrigger}
              ref={mobileTriggerRef}
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-haspopup="listbox"
              aria-labelledby="ct-price-category-label ct-price-category-value"
              aria-controls="ct-price-category-menu"
              onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            >
              <span id="ct-price-category-value">{selectedGroupMeta?.label}</span>
              <small>{groupedPairs.get(selectedGroup)?.length ?? 0}</small>
              <svg className={isMobileMenuOpen ? styles.priceMobileChevronOpen : undefined} viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9.5 5 5 5-5" /></svg>
            </button>
            {isMobileMenuOpen ? (
              <div className={styles.priceMobileMenu} id="ct-price-category-menu" role="listbox" aria-label="Категорії КТ">
                {availableGroups.map((group) => (
                  <button
                    className={selectedGroup === group.id ? styles.priceMobileOptionActive : styles.priceMobileOption}
                    type="button"
                    role="option"
                    aria-selected={selectedGroup === group.id}
                    value={group.id}
                    key={group.id}
                    onClick={() => selectGroup(group.id)}
                  >
                    <span>{group.label}</span>
                    <small>{groupedPairs.get(group.id)?.length ?? 0}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </span>
        </div>

        <div
          className={styles.priceTabs}
          ref={tabsRef}
          role="tablist"
          aria-label="Категорії КТ"
        >
          {availableGroups.map((group, index) => (
            <button
              className={selectedGroup === group.id ? styles.priceTabActive : styles.priceTab}
              data-price-group={group.id}
              key={group.id}
              onClick={() => {
                selectGroup(group.id);
              }}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              role="tab"
              aria-selected={selectedGroup === group.id}
              tabIndex={selectedGroup === group.id ? 0 : -1}
              type="button"
            >
              <span>{group.label}</span>
              <small>{groupedPairs.get(group.id)?.length ?? 0}</small>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.priceTable} role="table" aria-label={`Ціни КТ: ${CT_PRICE_GROUPS.find((group) => group.id === selectedGroup)?.label ?? "Категорія"}`}>
        <div className={styles.priceTableHead} role="row">
          <span role="columnheader">Дослідження</span>
          <span role="columnheader">Без контрасту</span>
          <span role="columnheader">З контрастом</span>
        </div>
        {visibleItems.map((item) => (
          <div className={styles.priceRow} key={item.id} role="row">
            <strong className={styles.priceTitle} role="rowheader">{item.name}</strong>
            <PriceOption item={item.withoutContrast} label="Без контрасту" />
            <PriceOption item={item.withContrast} label="З контрастом" contrast />
          </div>
        ))}
      </div>
    </div>
  );
}
