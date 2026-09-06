"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import type { PriceItem } from "../../prices/priceData";
import { MRI_PRICE_GROUPS, MRI_PRICE_ROWS, type MriPriceGroupId } from "./mriPriceGroups";
import styles from "./CtServicePage.module.css";
import mri from "./MriServicePage.module.css";

type PricePair = {
  id: string;
  name: string;
  withoutContrast?: PriceItem;
  withContrast?: PriceItem;
};

function requiresSeparateBooking(item: PriceItem) {
  return !/^official-258-(11[6-9]|120|123)$/.test(item.id);
}
function pairItems(items: PriceItem[], groupId: MriPriceGroupId): PricePair[] {
  const byId = new Map(items.filter(item => item.isActive !== false).map(item => [item.id, item]));
  const get = (position?: number) => position ? byId.get('official-258-' + String(position).padStart(3, '0')) : undefined;
  return MRI_PRICE_ROWS[groupId].flatMap(([without, withContrast]) => {
    const originalPlain = get(without);
    const plain = without === 64 && originalPlain ? { ...originalPlain, name: "МРТ одного колінного суглоба (після 65 років)" } : originalPlain;
    const contrast = get(withContrast);
    const item = plain ?? contrast;
    if (!item) return [];
    return [{ id: item.id, name: item.name.replace(/ без контрасту$/i, ""), withoutContrast: plain, withContrast: contrast }];
  });
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
      <div className={mri.priceOptionContent}>
      {item?.id === "official-258-014" && <small className={mri.priceOptionNote}>Динамічне контрастування</small>}
      {item?.id === "official-258-052" && <small className={mri.priceOptionNote}>Пілонідальна кіста</small>}
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
    </div>
  );
}

type Props = { items: PriceItem[] };

export function MriPriceTabs({ items }: Props) {
  const [active, setActive] = useState<MriPriceGroupId>("head");
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const groupedPairs = useMemo(() => {
    const map = new Map<MriPriceGroupId, PricePair[]>();
    MRI_PRICE_GROUPS.forEach((group) => {
      const pairs = pairItems(items, group.id);
      if (pairs.length) map.set(group.id, pairs);
    });
    return map;
  }, [items]);
  const availableGroups = useMemo(
    () => MRI_PRICE_GROUPS.filter((group) => groupedPairs.has(group.id)),
    [groupedPairs],
  );
  const selectedGroup = availableGroups.some((group) => group.id === active)
    ? active
    : (availableGroups[0]?.id ?? "head");
  const selectedGroupMeta = availableGroups.find((group) => group.id === selectedGroup);
  const visibleItems = groupedPairs.get(selectedGroup) ?? [];

  useEffect(() => {
    const syncCategoryFromHash = () => {
      const prefix = "#mri-prices-";
      if (!window.location.hash.startsWith(prefix)) return;

      const groupId = window.location.hash.slice(prefix.length) as MriPriceGroupId;
      if (!availableGroups.some((group) => group.id === groupId)) return;

      setActive(groupId);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.requestAnimationFrame(() => {
        document.getElementById("mri-prices")?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    };

    syncCategoryFromHash();
    window.addEventListener("hashchange", syncCategoryFromHash);
    return () => window.removeEventListener("hashchange", syncCategoryFromHash);
  }, [availableGroups]);

  const selectGroup = (groupId: MriPriceGroupId) => {
    setActive(groupId);
    setMobileMenuOpen(false);
    window.history.replaceState(null, "", `#mri-prices-${groupId}`);
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
          <span className={styles.priceMobileLabel} id="mri-price-category-label">Категорія досліджень</span>
          <span className={styles.priceSelectWrap}>
            <button
              className={styles.priceMobileTrigger}
              ref={mobileTriggerRef}
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-haspopup="listbox"
              aria-labelledby="mri-price-category-label mri-price-category-value"
              aria-controls="mri-price-category-menu"
              onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            >
              <span id="mri-price-category-value">{selectedGroupMeta?.label}</span>
              <small>{groupedPairs.get(selectedGroup)?.length ?? 0}</small>
              <svg className={isMobileMenuOpen ? styles.priceMobileChevronOpen : undefined} viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9.5 5 5 5-5" /></svg>
            </button>
            {isMobileMenuOpen ? (
              <div className={styles.priceMobileMenu} id="mri-price-category-menu" role="listbox" aria-label="Категорії МРТ">
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
          aria-label="Категорії МРТ"
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

      <div className={`${styles.priceTable} ${selectedGroup === "additional" ? mri.additionalPrices : ""}`} role="table" aria-label={`Ціни МРТ: ${MRI_PRICE_GROUPS.find((group) => group.id === selectedGroup)?.label ?? "Категорія"}`}>
        <div className={styles.priceTableHead} role="row">
          <span role="columnheader">Дослідження</span>
          <span role="columnheader">{selectedGroup === "additional" ? "Вартість" : "Без контрасту"}</span>
          {selectedGroup !== "additional" && <span role="columnheader">З контрастом</span>}
        </div>
        {visibleItems.map((item) => (
          <div className={styles.priceRow} key={item.id} role="row">
            <strong className={styles.priceTitle} role="rowheader">{item.name}</strong>
            <PriceOption item={item.withoutContrast} label={selectedGroup === "additional" ? "Вартість" : "Без контрасту"} />
            {selectedGroup !== "additional" && <PriceOption item={item.withContrast} label="З контрастом" contrast />}
          </div>
        ))}
      </div>
    </div>
  );
}
