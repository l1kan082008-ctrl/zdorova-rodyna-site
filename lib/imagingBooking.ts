import type { PriceItem } from "../app/prices/priceData";

export type ImagingBookingCategory = "ultrasound" | "ct" | "mri";

export const imagingBookingLabels: Record<ImagingBookingCategory, string> = {
  ultrasound: "УЗД",
  ct: "КТ",
  mri: "МРТ",
};

function isImagingCategory(value: string | null): value is ImagingBookingCategory {
  return value === "ultrasound" || value === "ct" || value === "mri";
}

export function resolveImagingBookingCategory(
  params: URLSearchParams,
  sourcePathname?: string,
): ImagingBookingCategory | null {
  if (params.get("doctor")?.trim() || params.get("services")?.trim()) return null;

  const explicitCategory = params.get("bookingCategory");
  if (isImagingCategory(explicitCategory)) return explicitCategory;

  const service = params.get("service")?.trim() ?? "";
  if (service) {
    if (/^КТ(?:\s|$)/iu.test(service)) return "ct";
    if (/^МРТ(?:\s|$)/iu.test(service)) return "mri";
    if (/^(?:УЗД|ЕХО\s*\(УЗД\))(?:\s|$)/iu.test(service) || /^доплер/iu.test(service)) return "ultrasound";
    return null;
  }

  const routeCategory = /^\/services\/(ultrasound|ct|mri)\/?$/.exec(sourcePathname ?? "")?.[1] ?? null;
  return isImagingCategory(routeCategory) ? routeCategory : null;
}

export function getOfficialCtPosition(item: Pick<PriceItem, "id" | "sortOrder">): number | null {
  const idMatch = /^official-230-(\d{3})$/.exec(item.id);
  if (idMatch) return Number(idMatch[1]);

  if (typeof item.sortOrder === "number" && item.sortOrder >= 3000 && item.sortOrder <= 3067) {
    return item.sortOrder - 2999;
  }
  return null;
}

const NON_BOOKABLE_CT_POSITIONS = new Set([60, 61, 62, 63, 64, 65, 68]);

// Keep the booking selector and the price-table links on the same accessory rules.
export function isBookableImagingItem(item: Pick<PriceItem, "id" | "sortOrder" | "category">): boolean {
  if (item.category === "ct") {
    const position = getOfficialCtPosition(item);
    return position === null || !NON_BOOKABLE_CT_POSITIONS.has(position);
  }
  if (item.category === "mri") return !/^official-258-(11[6-9]|120|123)$/.test(item.id);
  return item.category === "ultrasound" || item.category === "doppler";
}

export function getImagingBookingOptions(items: PriceItem[], category: ImagingBookingCategory): string[] {
  const names = new Map<string, string>();
  for (const item of items) {
    const sameCategory = item.category === category || (category === "ultrasound" && item.category === "doppler");
    if (item.isActive === false || !sameCategory || !isBookableImagingItem(item)) continue;
    const name = item.name.trim();
    if (!name) continue;
    const key = name.toLocaleLowerCase("uk-UA").replace(/\s+/g, " ");
    if (!names.has(key)) names.set(key, name);
  }
  return [...names.values()];
}
