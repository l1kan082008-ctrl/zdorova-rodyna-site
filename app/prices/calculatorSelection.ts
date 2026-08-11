export const PRICE_CALCULATOR_STORAGE_KEY =
  "zdorova-rodyna-price-calculator-v1";
export const PRICE_CALCULATOR_CITO_STORAGE_KEY =
  "zdorova-rodyna-price-calculator-cito-v1";
export const PRICE_CALCULATOR_CHANGED_EVENT =
  "zdorova-rodyna-price-calculator-changed";
export const PRICE_CALCULATOR_OPEN_EVENT =
  "zdorova-rodyna-price-calculator-open";

export function readPriceCalculatorSelection() {
  try {
    const value = window.localStorage.getItem(PRICE_CALCULATOR_STORAGE_KEY);
    const parsed = value ? (JSON.parse(value) as unknown) : [];

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function readPriceCalculatorCitoSelection() {
  try {
    const value = window.localStorage.getItem(
      PRICE_CALCULATOR_CITO_STORAGE_KEY,
    );
    const parsed = value ? (JSON.parse(value) as unknown) : [];

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function writePriceCalculatorCitoSelection(selectedIds: string[]) {
  try {
    if (selectedIds.length) {
      window.localStorage.setItem(
        PRICE_CALCULATOR_CITO_STORAGE_KEY,
        JSON.stringify(selectedIds),
      );
    } else {
      window.localStorage.removeItem(PRICE_CALCULATOR_CITO_STORAGE_KEY);
    }
  } catch {
    // The calculator remains usable when storage is unavailable.
  }
}

export function announcePriceCalculatorSelection(selectedIds: string[]) {
  window.dispatchEvent(
    new CustomEvent<string[]>(PRICE_CALCULATOR_CHANGED_EVENT, {
      detail: selectedIds,
    }),
  );
}

export function addPriceCalculatorSelection(itemId: string) {
  const currentIds = readPriceCalculatorSelection();
  const selectedIds = currentIds.includes(itemId)
    ? currentIds
    : [...currentIds, itemId];

  try {
    window.localStorage.setItem(
      PRICE_CALCULATOR_STORAGE_KEY,
      JSON.stringify(selectedIds),
    );
  } catch {
    // The in-page event still updates the interface when storage is unavailable.
  }

  announcePriceCalculatorSelection(selectedIds);
  return selectedIds;
}

export function removePriceCalculatorSelection(itemId: string) {
  const selectedIds = readPriceCalculatorSelection().filter(
    (selectedId) => selectedId !== itemId,
  );

  try {
    if (selectedIds.length) {
      window.localStorage.setItem(
        PRICE_CALCULATOR_STORAGE_KEY,
        JSON.stringify(selectedIds),
      );
    } else {
      window.localStorage.removeItem(PRICE_CALCULATOR_STORAGE_KEY);
    }
  } catch {
    // The in-page event still updates the interface when storage is unavailable.
  }

  writePriceCalculatorCitoSelection(
    readPriceCalculatorCitoSelection().filter(
      (selectedId) => selectedId !== itemId,
    ),
  );

  announcePriceCalculatorSelection(selectedIds);
  return selectedIds;
}

export function clearPriceCalculatorSelection() {
  try {
    window.localStorage.removeItem(PRICE_CALCULATOR_STORAGE_KEY);
    window.localStorage.removeItem(PRICE_CALCULATOR_CITO_STORAGE_KEY);
  } catch {
    // The in-page event still clears the header when storage is unavailable.
  }

  announcePriceCalculatorSelection([]);
}
