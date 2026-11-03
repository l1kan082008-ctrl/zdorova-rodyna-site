import { parseBookingDetails, withBookingTotal } from "./bookingDetails";
import { findImagingBookingPrice, resolveImagingBookingCategory } from "./imagingBooking";
import { catalogItems, type PriceItem } from "../app/prices/priceData";

type BookingPricingInput = {
  source: string;
  service: string;
  doctor: string;
  comment: string;
  priceItemId?: unknown;
};

type BookingPriceCatalog = () => Promise<readonly PriceItem[]>;

export async function loadBookingPriceCatalog(): Promise<readonly PriceItem[]> {
  // Match the public price endpoint. A configured database must never silently
  // fall back to the bundled catalogue when its current prices are unavailable.
  if (!process.env.DATABASE_URL) return catalogItems;
  const { listPublicPriceItems } = await import("../app/api/prices/priceStore");
  return listPublicPriceItems();
}

export async function applyImagingBookingPrice(
  input: BookingPricingInput,
  loadCatalog: BookingPriceCatalog = loadBookingPriceCatalog,
): Promise<string> {
  const details = parseBookingDetails(input.comment);
  if (input.source !== "contacts" || input.doctor.trim() || details.studies.length
    || input.service === "Комплекс досліджень" || input.service.includes("|")) return input.comment;

  const category = resolveImagingBookingCategory(new URLSearchParams({ service: input.service }));
  const hasPriceId = input.priceItemId !== undefined;
  if (!category && !hasPriceId) return input.comment;

  // Never keep an estimate supplied by the browser for a single imaging study.
  // Unknown or unavailable prices remain unpriced, while the lead is preserved.
  const withoutPrice = withBookingTotal(input.comment, null);
  const itemId = typeof input.priceItemId === "string" ? input.priceItemId.trim() : undefined;
  if (hasPriceId && (!itemId || itemId.length > 200)) return withoutPrice;
  try {
    const item = findImagingBookingPrice(await loadCatalog(), input.service, category, itemId);
    return item ? withBookingTotal(input.comment, item.amount) : withoutPrice;
  } catch {
    console.warn(JSON.stringify({ event: "booking_price_snapshot_unavailable" }));
    return withoutPrice;
  }
}
