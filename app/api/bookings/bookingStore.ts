import { env } from "@/lib/runtimeEnv";

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

export async function listPopularBookingServices() {
  await ensureBookingsTable();
  const result = await env.DB.prepare(
    `SELECT service
     FROM bookings
     WHERE status IN ('confirmed', 'closed')
       AND datetime(created_at) >= datetime('now', '-30 days')
     ORDER BY created_at DESC
     LIMIT 500`,
  ).all<{ service: string }>();

  const counts = new Map<string, number>();

  result.results.forEach((booking) => {
    booking.service
      .split("|")
      .map((service) => service.trim())
      .filter(Boolean)
      .forEach((service) => {
        counts.set(service, (counts.get(service) ?? 0) + 1);
      });
  });

  return [...counts.entries()]
    .map(([service, count]) => ({ service, count }))
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
