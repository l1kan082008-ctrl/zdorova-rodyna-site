import type { PriceItem } from "./priceData";

// Only formatting differences are ignored. Medical wording, price and all
// execution conditions must agree; fuzzy search matching is not identity.
export function priceSearchIdentity(item: PriceItem) {
  const normalize = (text: string) => text.normalize("NFC").toLowerCase().trim().replace(/\s+/g, " ");
  return JSON.stringify([
    normalize(item.name),
    item.amount,
    normalize(item.turnaround ?? ""),
    Boolean(item.citoAvailable),
    item.citoSurcharge ?? null,
  ]);
}

export function deduplicatePriceSearch(items: PriceItem[], selectedIds: readonly string[] = []) {
  const unique = new Map<string, PriceItem>();
  for (const item of items) {
    const key = priceSearchIdentity(item);
    const existing = unique.get(key);
    // Keep an already selected equivalent visible so search cannot offer it
    // as a second, apparently unselected study from another category.
    if (!existing || (!selectedIds.includes(existing.id) && selectedIds.includes(item.id))) {
      unique.set(key, item);
    }
  }
  return [...unique.values()];
}
