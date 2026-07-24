import { env } from "cloudflare:workers";

export type BookingStatus = "new" | "contacted" | "confirmed" | "closed";

export type Booking = {
  id: string;
  reference: string;
  patientName: string;
  phone: string;
  service: string;
  doctor: string;
  comment: string;
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
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export async function ensureBookingsTable() {
  await env.DB.prepare(createBookingsTable).run();
  await env.DB.prepare(
    "CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC)",
  ).run();
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
}) {
  await ensureBookingsTable();
  const id = crypto.randomUUID();
  const reference = `ZR-${Date.now().toString(36).slice(-6).toUpperCase()}-${id
    .slice(0, 3)
    .toUpperCase()}`;

  await env.DB.prepare(
    `INSERT INTO bookings
      (id, reference, patient_name, phone, service, doctor, comment)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      reference,
      values.patientName,
      values.phone,
      values.service,
      values.doctor,
      values.comment,
    )
    .run();

  return reference;
}

export async function listBookings() {
  await ensureBookingsTable();
  const result = await env.DB.prepare(
    `SELECT id, reference, patient_name, phone, service, doctor, comment, status, created_at
     FROM bookings
     ORDER BY created_at DESC
     LIMIT 250`,
  ).all<BookingRow>();

  return result.results.map(toBooking);
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
