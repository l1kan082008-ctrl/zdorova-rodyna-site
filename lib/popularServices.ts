import type { PriceItem } from "../app/prices/priceData";
import { priceReferences, resolvePriceItem } from "../app/prices/priceReferences";
import { priceSearchIdentity } from "../app/prices/deduplicateSearch";

export type BookingServiceCount = { service: string; count: number };

const normalizeName = (value: string) =>
  value.trim().toLocaleLowerCase("uk-UA").replace(/\s+/gu, " ");

function unambiguousItem(items: PriceItem[]) {
  if (!items.length || new Set(items.map(priceSearchIdentity)).size !== 1) return undefined;
  return [...items].sort((left, right) => left.id.localeCompare(right.id))[0];
}

function findCatalogItem(service: string, items: PriceItem[]) {
  const name = normalizeName(service);
  if (!name) return undefined;

  const exact = items.filter((item) => normalizeName(item.name) === name);
  if (exact.length) return unambiguousItem(exact);

  const aliases = items.filter((item) =>
    item.aliases?.some((alias) => normalizeName(alias) === name),
  );
  if (aliases.length) return unambiguousItem(aliases);

  const reference = Object.values(priceReferences).find((candidate) =>
    candidate.aliases.some((alias) => normalizeName(alias) === name),
  );
  if (reference) return resolvePriceItem(items, reference);

  // A broad request or removed study must not count as a different exam/package.
  return undefined;
}

/** Only catalogue data leaves this boundary; raw booking text is never rendered. */
export function rankPopularPriceItems(statistics: BookingServiceCount[], priceItems: PriceItem[]) {
  const activeItems = priceItems.filter((item) => item.isActive !== false);
  const ranked = new Map<string, { item: PriceItem; count: number }>();
  for (const { service, count } of statistics) {
    if (!Number.isFinite(count) || count <= 0) continue;
    const item = findCatalogItem(service, activeItems);
    if (!item) continue;
    const existing = ranked.get(item.id);
    ranked.set(item.id, { item, count: (existing?.count ?? 0) + count });
  }
  return [...ranked.values()].sort((left, right) =>
    right.count - left.count || left.item.name.localeCompare(right.item.name, "uk-UA")
    || left.item.id.localeCompare(right.item.id),
  );
}
