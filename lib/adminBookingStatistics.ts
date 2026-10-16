import { parseBookingDetails } from "./bookingDetails";
import { formatBookingDateTime } from "../app/admin/bookings/bookingDateTime";
import type { Booking, BookingStatus } from "../app/api/bookings/bookingStore";

export const bookingCategoryLabels = {
  doctor: "Консультації лікарів",
  mri: "МРТ",
  ct: "КТ",
  ultrasound: "УЗД",
  laboratory: "Аналізи",
  holter: "Холтер",
  declaration: "Декларації",
  callback: "Зворотний дзвінок",
  other: "Інше",
} as const;

export const bookingStatusLabels: Record<BookingStatus, string> = {
  new: "Нова",
  contacted: "Зв’язалися",
  confirmed: "Підтверджено",
  closed: "Закрито",
  cancelled: "Скасовано",
};

export type BookingCategory = keyof typeof bookingCategoryLabels;
export type BookingSummary = Pick<Booking, "id" | "service" | "doctor" | "comment" | "source" | "status"> &
  { createdAt: string | Date } &
  Partial<Pick<Booking, "patientName" | "phone" | "reference">>;
export type BookingCategoryPrice = { name: string; category: string; aliases?: string[] };
export type BookingStatistics = {
  total: number;
  statuses: Record<BookingStatus, number>;
  categories: Array<{ id: BookingCategory; label: string; count: number }>;
};
export type AdminBookingQuery = {
  from?: string;
  to?: string;
  category?: BookingCategory;
  status?: BookingStatus;
  q: string;
  page: number;
  pageSize: number;
};
export type AdminBooking = Booking & { category: BookingCategory };
export type AdminBookingsResponse = {
  bookings: AdminBooking[];
  stats: BookingStatistics;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const laboratoryCategories = new Set([
  "general", "biochemistry", "diabetes", "hemostasis", "hormones", "growth", "prenatal",
  "oncology", "rheumatology", "anemia", "immunology", "osteoporosis", "cytology",
  "infections", "hiv", "torch", "urogenital", "allergy", "genetics", "culture",
  "bacteriology", "complexes", "covid", "sampling", "other-infections",
]);
const kyivDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit",
});

function normalize(value: string) {
  return value.replace(/\s+/gu, " ").trim().toLocaleLowerCase("uk-UA");
}

function studyName(value: string) {
  return normalize(value.replace(/\s+[—–-]\s*(?:CITO|СІТО|ЦІТО)$/iu, ""));
}

function explicitServiceCategory(value: string): BookingCategory | undefined {
  if (/^холтер|^добове моніторування екг(?:\s|\(|$)/iu.test(value)) return "holter";
  if (/^мрт(?:\s|$)|^магнітно[ -]резонанс/iu.test(value)) return "mri";
  if (/^кт(?:[\s-]|$)|^комп[’'`]?ютерн.*томограф/iu.test(value)) return "ct";
  if (/^узд(?:\s|$)|^ультразвук|^ехо(?:\s|кг|кардіо|\()/iu.test(value)) return "ultrasound";
  if (/^лаборатор|^аналіз|^загальн.*аналіз|^забір (?:крові|біоматеріалу)/iu.test(value)) return "laboratory";
  if (/^консультац|^прийом|^запис до лікаря|^сімейна медицина$/iu.test(value)) return "doctor";
  return undefined;
}

function catalogCategory(item: BookingCategoryPrice): BookingCategory {
  const explicit = explicitServiceCategory(studyName(item.name));
  if (explicit) return explicit;
  if (laboratoryCategories.has(item.category)) return "laboratory";
  if (item.category === "ultrasound" || item.category === "doppler") return "ultrasound";
  if (item.category === "ct" || item.category === "mri") return item.category;
  return "other";
}

function createCategoryIndex(catalog: BookingCategoryPrice[]) {
  const index = new Map<string, Set<BookingCategory>>();
  for (const item of catalog) {
    const category = catalogCategory(item);
    for (const alias of [item.name, ...(item.aliases ?? [])]) {
      const name = studyName(alias);
      const matches = index.get(name) ?? new Set<BookingCategory>();
      matches.add(category);
      index.set(name, matches);
    }
  }
  return index;
}

function classifyBooking(booking: BookingSummary, catalog: Map<string, Set<BookingCategory>>): BookingCategory {
  const service = normalize(booking.service);
  if (booking.source === "callback" || service === "зворотний дзвінок") return "callback";
  if (booking.source === "family-declaration" || service === "заявка на декларацію із сімейним лікарем") return "declaration";

  // Only generated study blocks are read. The patient's free-form comment must
  // not turn a consultation into a callback or a different examination.
  const studies = parseBookingDetails(booking.comment).studies;
  const selections = (studies.length ? studies : booking.service.split("|"))
    .map(studyName).filter((name) => name && !/^доплата (?:cito|сіто|ціто)(?=\s|\(|$)/iu.test(name));
  const categories = new Set(selections.map((name) => {
    const explicit = explicitServiceCategory(name);
    if (explicit) return explicit;
    const matches = catalog.get(name);
    return matches?.size === 1 ? [...matches][0] : "other";
  }));
  if (categories.size === 1) {
    const category = [...categories][0];
    if (category !== "other") return category;
  }
  // Multi-direction packages count once in Other, never once per study.
  if (studies.length || selections.length > 1) return "other";
  return booking.doctor.trim() ? "doctor" : "other";
}

export function getBookingCategory(booking: BookingSummary, catalog: BookingCategoryPrice[] = []): BookingCategory {
  return classifyBooking(booking, createCategoryIndex(catalog));
}

/** All dates are Kyiv calendar dates, including old UTC SQLite timestamps. */
export function getBookingKyivDate(value: string | Date): string | undefined {
  const normalized = formatBookingDateTime(value).dateTime;
  if (!normalized) return undefined;
  const parts = kyivDay.formatToParts(new Date(normalized));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export class AdminBookingQueryError extends Error {}

function parseDay(value: string | null): string | undefined {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) throw new AdminBookingQueryError("Вкажіть дату у форматі РРРР-ММ-ДД.");
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AdminBookingQueryError("Некоректна дата періоду.");
  }
  return value;
}

export function parseAdminBookingQuery(params: URLSearchParams): AdminBookingQuery {
  const from = parseDay(params.get("from"));
  const to = parseDay(params.get("to"));
  if (from && to && from > to) throw new AdminBookingQueryError("Дата початку не може бути пізнішою за дату завершення.");
  const category = params.get("category") || undefined;
  const status = params.get("status") || undefined;
  if (category && category !== "all" && !Object.hasOwn(bookingCategoryLabels, category)) {
    throw new AdminBookingQueryError("Невідома категорія заявки.");
  }
  if (status && status !== "all" && !Object.hasOwn(bookingStatusLabels, status)) {
    throw new AdminBookingQueryError("Невідомий статус заявки.");
  }
  const integer = (name: string, fallback: number, maximum: number) => {
    const value = params.get(name);
    if (!value) return fallback;
    if (!/^\d+$/u.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > maximum) {
      throw new AdminBookingQueryError("Некоректні параметри сторінки.");
    }
    return Number(value);
  };
  const q = params.get("q")?.trim() || "";
  if (q.length > 200) throw new AdminBookingQueryError("Скоротіть пошуковий запит до 200 символів.");
  return {
    from, to,
    category: category && category !== "all" ? category as BookingCategory : undefined,
    status: status && status !== "all" ? status as BookingStatus : undefined,
    q, page: integer("page", 1, Number.MAX_SAFE_INTEGER), pageSize: integer("pageSize", 25, 100),
  };
}

/** Search/category/status narrow the list; only the date range narrows statistics. */
export function selectAdminBookings<T extends BookingSummary>(
  bookings: T[], query: AdminBookingQuery, catalog: BookingCategoryPrice[] = [], searchMatches?: ReadonlySet<string>,
) {
  const categoryIndex = createCategoryIndex(catalog);
  const timestamps = new Map<string, string>();
  const timestamp = (booking: BookingSummary) => {
    let value = timestamps.get(booking.id);
    if (value === undefined) {
      value = formatBookingDateTime(booking.createdAt).dateTime ?? "";
      timestamps.set(booking.id, value);
    }
    return value;
  };
  const dated = bookings.filter((booking) => {
    if (!query.from && !query.to) return true;
    const day = getBookingKyivDate(booking.createdAt);
    return Boolean(day && (!query.from || day >= query.from) && (!query.to || day <= query.to));
  }).map((booking) => ({ ...booking, category: classifyBooking(booking, categoryIndex) }));
  const stats: BookingStatistics = {
    total: dated.length,
    statuses: { new: 0, contacted: 0, confirmed: 0, closed: 0, cancelled: 0 },
    categories: (Object.entries(bookingCategoryLabels) as Array<[BookingCategory, string]>)
      .map(([id, label]) => ({ id, label, count: 0 })),
  };
  for (const booking of dated) {
    if (Object.hasOwn(stats.statuses, booking.status)) stats.statuses[booking.status] += 1;
    stats.categories.find(({ id }) => id === booking.category)!.count += 1;
  }
  const normalizedQuery = normalize(query.q);
  const filtered = dated.filter((booking) => {
    if (query.category && booking.category !== query.category) return false;
    if (query.status && booking.status !== query.status) return false;
    if (!normalizedQuery || searchMatches?.has(booking.id)) return true;
    return normalize([
      booking.reference, booking.patientName, booking.phone, booking.service, booking.doctor,
      ...parseBookingDetails(booking.comment).studies,
    ].filter(Boolean).join(" ")).includes(normalizedQuery);
  }).sort((left, right) => {
    return timestamp(right).localeCompare(timestamp(left)) || right.id.localeCompare(left.id);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / query.pageSize));
  const page = Math.min(query.page, totalPages);
  return {
    bookings: filtered.slice((page - 1) * query.pageSize, page * query.pageSize),
    stats, total: filtered.length, page, pageSize: query.pageSize, totalPages,
  };
}
