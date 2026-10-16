import { env } from "@/lib/runtimeEnv";
import { parseBookingDetails } from "@/lib/bookingDetails";
import {
  selectAdminBookings,
  type AdminBookingQuery,
  type AdminBookingsResponse,
  type BookingCategoryPrice,
  type BookingSummary,
} from "@/lib/adminBookingStatistics";

export type BookingStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "closed"
  | "cancelled";

export type Booking = {
  id: string;
  reference: string;
  patientName: string;
  phone: string;
  service: string;
  doctor: string;
  comment: string;
  source: string;
  consentVersion: string;
  consentAt: string;
  retentionUntil: string;
  status: BookingStatus;
  createdAt: string;
};

type BookingRow = {
  id: string;
  reference: string;
  patient_name: string;
  phone: string;
  service: string;
  doctor: string;
  comment: string;
  source: string;
  consent_version: string;
  consent_at: string;
  retention_until: string;
  status: BookingStatus;
  created_at: string;
};

const createBookingsTable = `
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    doctor TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'legacy',
    consent_version TEXT NOT NULL DEFAULT '',
    consent_at TEXT NOT NULL DEFAULT '',
    retention_until TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export async function ensureBookingsTable() {
  await env.DB.prepare(createBookingsTable).run();
  const columns = await env.DB.prepare("PRAGMA table_info(bookings)")
    .all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  if (!names.has("source")) {
    await env.DB.prepare(
      "ALTER TABLE bookings ADD COLUMN source TEXT NOT NULL DEFAULT 'legacy'",
    ).run();
  }
  if (!names.has("consent_version")) {
    await env.DB.prepare(
      "ALTER TABLE bookings ADD COLUMN consent_version TEXT NOT NULL DEFAULT ''",
    ).run();
  }
  if (!names.has("consent_at")) {
    await env.DB.prepare(
      "ALTER TABLE bookings ADD COLUMN consent_at TEXT NOT NULL DEFAULT ''",
    ).run();
  }
  if (!names.has("retention_until")) {
    await env.DB.prepare(
      "ALTER TABLE bookings ADD COLUMN retention_until TEXT NOT NULL DEFAULT ''",
    ).run();
  }
  await env.DB.prepare(
    "CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC)",
  ).run();
  await env.DB.prepare(
    "CREATE INDEX IF NOT EXISTS bookings_retention_idx ON bookings (retention_until)",
  ).run();
  await env.DB.prepare(`
    DELETE FROM bookings
    WHERE (
      retention_until <> ''
      AND datetime(retention_until) <= datetime('now')
      AND status IN ('closed', 'cancelled')
    ) OR datetime(created_at) <= datetime('now', '-365 days')
  `).run();
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    reference: row.reference,
    patientName: row.patient_name,
    phone: row.phone,
    service: row.service,
    doctor: row.doctor,
    comment: row.comment,
    source: row.source,
    consentVersion: row.consent_version,
    consentAt: row.consent_at,
    retentionUntil: row.retention_until,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createBooking(values: {
  patientName: string;
  phone: string;
  service: string;
  doctor: string;
  comment: string;
  source: string;
  consentVersion: string;
}) {
  await ensureBookingsTable();
  const id = crypto.randomUUID();
  const reference = `ZR-${Date.now().toString(36).slice(-6).toUpperCase()}-${id
    .slice(0, 3)
    .toUpperCase()}`;
  const consentAt = new Date().toISOString();
  const retentionUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    .toISOString();

  await env.DB.prepare(
    `INSERT INTO bookings
      (id, reference, patient_name, phone, service, doctor, comment,
       source, consent_version, consent_at, retention_until)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      reference,
      values.patientName,
      values.phone,
      values.service,
      values.doctor,
      values.comment,
      values.source,
      values.consentVersion,
      consentAt,
      retentionUntil,
    )
    .run();

  return reference;
}

export async function listBookings() {
  await ensureBookingsTable();
  const result = await env.DB.prepare(
    `SELECT id, reference, patient_name, phone, service, doctor, comment,
            source, consent_version, consent_at, retention_until, status, created_at
     FROM bookings
     ORDER BY created_at DESC
     LIMIT 250`,
  ).all<BookingRow>();

  return result.results.map(toBooking);
}

export async function listAdminBookings(
  query: AdminBookingQuery,
  catalog: BookingCategoryPrice[],
): Promise<AdminBookingsResponse> {
  await ensureBookingsTable();
  // Counts must cover every retained request, not the old 250-card limit.
  // Keep contact and consent fields out of the statistics dataset.
  const summary = await env.DB.prepare(
    `SELECT id, service, doctor, comment, source, status, created_at
     FROM bookings`,
  ).all<Pick<BookingRow, "id" | "service" | "doctor" | "comment" | "source" | "status" | "created_at">>();
  const records: BookingSummary[] = summary.results.map(({ created_at, ...row }) => ({
    ...row, createdAt: created_at,
  }));

  let searchMatches: Set<string> | undefined;
  if (query.q) {
    // LIKE metacharacters are literal search text, never extra wildcards.
    const needle = `%${query.q.toLocaleLowerCase("uk-UA").replace(/[!%_]/gu, "!$&")}%`;
    const matches = await env.DB.prepare(
      `SELECT id FROM bookings
       WHERE LOWER(reference || ' ' || patient_name || ' ' || phone) LIKE ? ESCAPE '!'`,
    ).bind(needle).all<{ id: string }>();
    searchMatches = new Set(matches.results.map(({ id }) => id));
  }
  const selection = selectAdminBookings(records, query, catalog, searchMatches);
  if (!selection.bookings.length) return { ...selection, bookings: [] };

  // Fetch personal data only for the requested page (at most 100 records).
  const ids = selection.bookings.map(({ id }) => id);
  const page = await env.DB.prepare(
    `SELECT id, reference, patient_name, phone, service, doctor, comment,
            source, consent_version, consent_at, retention_until, status, created_at
     FROM bookings WHERE id IN (${ids.map(() => "?").join(", ")})`,
  ).bind(...ids).all<BookingRow>();
  const rows = new Map(page.results.map((row) => [row.id, row]));
  return {
    ...selection,
    bookings: selection.bookings.flatMap(({ id, category }) => {
      const row = rows.get(id);
      return row ? [{ ...toBooking(row), category }] : [];
    }),
  };
}

export async function listPopularBookingServices() {
  await ensureBookingsTable();
  const result = await env.DB.prepare(
    `SELECT service, comment
     FROM bookings
     WHERE status IN ('new', 'contacted', 'confirmed', 'closed')
       AND datetime(created_at) >= datetime('now', '-30 days')
       AND source NOT IN ('callback', 'family-declaration')
       AND TRIM(service) NOT IN ('Зворотний дзвінок', 'Заявка на декларацію із сімейним лікарем')
     ORDER BY created_at DESC`,
  ).all<{ service: string; comment: string }>();

  const counts = new Map<string, { service: string; count: number }>();

  result.results.forEach((booking) => {
    // The selected studies replace a package/summary label. Never score free text.
    const studies = parseBookingDetails(booking.comment).studies;
    const services = studies.length ? studies : booking.service.split("|");
    const seen = new Set<string>();
    services.forEach((value) => {
      const service = value.replace(/\s+/gu, " ").trim()
        .replace(/\s+[—–-]\s*(?:CITO|СІТО|ЦІТО)$/iu, "").trim();
      if (!service || /^Доплата\s+(?:CITO|СІТО|ЦІТО)(?=\s|\(|$)/iu.test(service)) return;
      const key = service.toLocaleLowerCase("uk-UA");
      if (seen.has(key)) return;
      seen.add(key);
      const item = counts.get(key) ?? { service, count: 0 };
      item.count += 1;
      counts.set(key, item);
    });
  });

  return [...counts.values()]
    .sort((left, right) => right.count - left.count);
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await ensureBookingsTable();
  const result = await env.DB.prepare(
    `UPDATE bookings
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(status, id)
    .run();

  return result.meta.changes > 0;
}

export async function deleteBooking(id: string) {
  await ensureBookingsTable();
  const result = await env.DB.prepare("DELETE FROM bookings WHERE id = ?")
    .bind(id)
    .run();

  return result.meta.changes > 0;
}
