export type BookingDateRange = { from: string; to: string };

export type BookingPeriod =
  | "today" | "yesterday" | "this-week" | "last-week"
  | "7" | "14" | "this-month" | "last-month" | "30" | "all" | "custom";

export const bookingDatePresets = [
  { id: "today", label: "Сьогодні" },
  { id: "yesterday", label: "Учора" },
  { id: "this-week", label: "Цей тиждень" },
  { id: "last-week", label: "Минулий тиждень" },
  { id: "7", label: "Останні 7 днів" },
  { id: "14", label: "Останні 14 днів" },
  { id: "this-month", label: "Цей місяць" },
  { id: "last-month", label: "Минулий місяць" },
  { id: "30", label: "Останні 30 днів" },
  { id: "all", label: "За весь час" },
] as const satisfies ReadonlyArray<{ id: Exclude<BookingPeriod, "custom">; label: string }>;

const kyivDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit",
});

export function isBookingDate(value: string): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function calendarDate(iso: string): Date {
  if (!isBookingDate(iso)) throw new RangeError("Expected a valid date in YYYY-MM-DD format.");
  // Calendar arithmetic uses UTC noon, never the browser's zone or DST offset.
  return new Date(`${iso}T12:00:00Z`);
}

function calendarMonth(iso: string): Date {
  const date = calendarDate(iso);
  if (date.getUTCDate() !== 1) throw new RangeError("Expected the first day of a month.");
  return date;
}

function dateString(date: Date): string {
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) {
    throw new RangeError("Date is outside the supported calendar range.");
  }
  return date.toISOString().slice(0, 10);
}

export function getKyivToday(now: Date = new Date()): string {
  const parts = kyivDate.formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  const iso = `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
  if (!isBookingDate(iso)) throw new RangeError("Date is outside the supported calendar range.");
  return iso;
}

export function shiftBookingDate(iso: string, days: number): string {
  if (!Number.isSafeInteger(days)) throw new RangeError("Day offset must be an integer.");
  const date = calendarDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return dateString(date);
}

export function shiftBookingMonth(monthISO: string, offset: number): string {
  if (!Number.isSafeInteger(offset)) throw new RangeError("Month offset must be an integer.");
  const date = calendarMonth(monthISO);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return dateString(date);
}

export function getBookingPresetRange(
  id: Exclude<BookingPeriod, "custom">,
  today: string = getKyivToday(),
): BookingDateRange {
  const date = calendarDate(today);
  if (id === "all") return { from: "", to: "" };
  if (id === "today") return { from: today, to: today };
  if (id === "yesterday") {
    const yesterday = shiftBookingDate(today, -1);
    return { from: yesterday, to: yesterday };
  }
  if (id === "7" || id === "14" || id === "30") {
    return { from: shiftBookingDate(today, 1 - Number(id)), to: today };
  }
  if (id === "this-week" || id === "last-week") {
    const monday = shiftBookingDate(today, -((date.getUTCDay() + 6) % 7));
    return id === "this-week"
      ? { from: monday, to: today }
      : { from: shiftBookingDate(monday, -7), to: shiftBookingDate(monday, -1) };
  }
  const month = `${today.slice(0, 7)}-01`;
  if (id === "this-month") return { from: month, to: today };
  if (id === "last-month") {
    return { from: shiftBookingMonth(month, -1), to: shiftBookingDate(month, -1) };
  }
  throw new RangeError("Unknown booking date preset.");
}

export function getBookingMonthDays(monthISO: string): Array<string | null> {
  const date = calendarMonth(monthISO);
  const firstIndex = (date.getUTCDay() + 6) % 7;
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  const daysInMonth = date.getUTCDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - firstIndex + 1;
    return day < 1 || day > daysInMonth ? null : `${monthISO.slice(0, 7)}-${String(day).padStart(2, "0")}`;
  });
}

export function formatBookingRange(range: BookingDateRange): string {
  if (!range.from && !range.to) return "За весь час";
  if (!isBookingDate(range.from) || !isBookingDate(range.to) || range.from > range.to) {
    throw new RangeError("Expected a complete, ordered booking date range.");
  }
  const label = (iso: string) => iso.split("-").reverse().join(".");
  return range.from === range.to ? label(range.from) : `${label(range.from)} — ${label(range.to)}`;
}
