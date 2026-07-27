export const PRICE_CALCULATOR_STORAGE_KEY =
  "zdorova-rodyna-price-calculator-v1";
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

export function announcePriceCalculatorSelection(selectedIds: string[]) {
  window.dispatchEvent(
    new CustomEvent<string[]>(PRICE_CALCULATOR_CHANGED_EVENT, {
      detail: selectedIds,
    }),
  );
}
