import { initializeOnce } from "../../../lib/initializeOnce";
import { env } from "@/lib/runtimeEnv";
import { parseDoctorPrice, parseDoctorShowConsultationPriceOnRequest } from "@/lib/doctorPricing";
import { parseDoctorIsActive, parseDoctorSortOrder } from "@/lib/doctorPublication";
import {
  defaultDoctors,
  defaultFeaturedDoctorIds,
  DEFAULT_DOCTOR_SORT_ORDER,
  compareDoctors,
  getDoctorSortOrder,
  doctorPhotoUrls,
  type Doctor,
  type DoctorPatientGroup,
  type DoctorSchedule,
} from "../../doctors/doctorData";

type DoctorRow = {
  id: string;
  name: string;
  specialty: string;
  experience_years: number | null;
  consultation_price: number | null;
  repeat_consultation_price: number | null;
  show_consultation_price_on_request: number;
  is_active: number;
  sort_order: number | null;
  branch: string;
  description: string;
  biography: string;
  patient_groups: string;
  schedule: string;
  photo_key: string;
};

const createDoctorsTable = `
  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience_years INTEGER,
    consultation_price INTEGER,
    repeat_consultation_price INTEGER,
    show_consultation_price_on_request INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER,
    branch TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    biography TEXT NOT NULL DEFAULT '',
    patient_groups TEXT NOT NULL DEFAULT '[]',
    schedule TEXT NOT NULL DEFAULT '{}',
    photo_key TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

function prepareDefaultDoctorInsert(doctor: Doctor) {
  return env.DB.prepare(
    `INSERT OR IGNORE INTO doctors
      (id, name, specialty, experience_years, consultation_price, repeat_consultation_price, show_consultation_price_on_request, is_active, sort_order, branch, description, biography, patient_groups, schedule, photo_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
  ).bind(
    doctor.id,
    doctor.name,
    doctor.specialty,
    doctor.experienceYears,
    doctor.consultationPrice,
    doctor.repeatConsultationPrice ?? null,
    doctor.showConsultationPriceOnRequest === true ? 1 : 0,
    doctor.isActive === false ? 0 : 1,
    getDoctorSortOrder(doctor),
    doctor.branch,
    doctor.description,
    doctor.biography,
    JSON.stringify(doctor.patientGroups),
    JSON.stringify(doctor.schedule),
  );
}

export async function ensureDoctorsTable() {
  return initializeSchema(initializeSchemaTables);
}

const initializeSchema = initializeOnce();

async function initializeSchemaTables() {
  await env.DB.prepare(createDoctorsTable).run();
  const columns = await env.DB.prepare("PRAGMA table_info(doctors)").all<{
    name: string;
  }>();
  if (columns.results.some((column) => column.name === "availability_status")) {
    try {
      await env.DB.prepare(
        "ALTER TABLE doctors DROP COLUMN availability_status",
      ).run();
    } catch (error) {
      const currentColumns = await env.DB.prepare(
        "PRAGMA table_info(doctors)",
      ).all<{ name: string }>();
      if (
        currentColumns.results.some(
          (column) => column.name === "availability_status",
        )
      ) {
        throw error;
      }
    }
  }
  if (!columns.results.some((column) => column.name === "biography")) {
    await env.DB.prepare(
      "ALTER TABLE doctors ADD COLUMN biography TEXT NOT NULL DEFAULT ''",
    ).run();
  }
  const doctorColumnMigrations = [
    ["consultation_price", "ALTER TABLE doctors ADD COLUMN consultation_price INTEGER"],
    ["repeat_consultation_price", "ALTER TABLE doctors ADD COLUMN repeat_consultation_price INTEGER"],
    ["show_consultation_price_on_request", "ALTER TABLE doctors ADD COLUMN show_consultation_price_on_request INTEGER NOT NULL DEFAULT 0"],
    ["is_active", "ALTER TABLE doctors ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1"],
    ["sort_order", "ALTER TABLE doctors ADD COLUMN sort_order INTEGER"],
  ] as const;
  for (const [columnName, migration] of doctorColumnMigrations) {
    if (columns.results.some((column) => column.name === columnName)) continue;
    try {
      await env.DB.prepare(migration).run();
    } catch (error) {
      // Another server instance may have added the column after our first read.
      const currentColumns = await env.DB.prepare("PRAGMA table_info(doctors)")
        .all<{ name: string }>();
      if (!currentColumns.results.some((column) => column.name === columnName)) throw error;
    }
  }
  if (!columns.results.some((column) => column.name === "patient_groups")) {
    await env.DB.prepare(
      "ALTER TABLE doctors ADD COLUMN patient_groups TEXT NOT NULL DEFAULT '[]'",
    ).run();
  }
  // NULL marks legacy rows only. Each update is retry-safe and never overwrites an edited rank.
  const legacyOrder = await env.DB.prepare("SELECT id FROM doctors WHERE sort_order IS NULL LIMIT 1")
    .first<{ id: string }>();
  if (legacyOrder) {
    for (const [rank, id] of defaultFeaturedDoctorIds.entries()) {
      await env.DB.prepare("UPDATE doctors SET sort_order = ? WHERE id = ? AND sort_order IS NULL")
        .bind(rank, id).run();
    }
    await env.DB.prepare("UPDATE doctors SET sort_order = ? WHERE sort_order IS NULL")
      .bind(DEFAULT_DOCTOR_SORT_ORDER).run();
  }
  const count = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM doctors",
  ).first<{ total: number }>();

  if (Number(count?.total ?? 0) === 0 && process.env.BOOTSTRAP_DEFAULT_CONTENT === "true") {
    await env.DB.batch(defaultDoctors.map(prepareDefaultDoctorInsert));
  }
}

function parseSchedule(value: string): DoctorSchedule {
  try {
    return JSON.parse(value) as DoctorSchedule;
  } catch {
    return {};
  }
}

function parsePatientGroups(value: string): DoctorPatientGroup[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (group): group is DoctorPatientGroup =>
        group === "adults" || group === "children",
    );
  } catch {
    return [];
  }
}

function toDoctor(row: DoctorRow): Doctor {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    experienceYears: row.experience_years,
    consultationPrice: row.consultation_price,
    repeatConsultationPrice: row.repeat_consultation_price,
    showConsultationPriceOnRequest: row.show_consultation_price_on_request === 1,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order ?? getDoctorSortOrder({ id: row.id }),
    branch: row.branch,
    description: row.description,
    biography: row.biography,
    patientGroups: parsePatientGroups(row.patient_groups),
    schedule: parseSchedule(row.schedule),
    photoUrl: row.photo_key
      ? `/api/doctors/photo?key=${encodeURIComponent(row.photo_key)}`
      : doctorPhotoUrls[row.id] ?? "",
  };
}

export async function listDoctors(options: { includeInactive?: boolean } = {}) {
  await ensureDoctorsTable();
  const result = await env.DB.prepare(
    `SELECT id, name, specialty, experience_years, consultation_price, repeat_consultation_price, branch, description, biography,
            patient_groups, schedule, photo_key, is_active, sort_order, show_consultation_price_on_request
     FROM doctors
     WHERE (? = 1 OR is_active = 1)
     ORDER BY sort_order, name COLLATE NOCASE`,
  ).bind(options.includeInactive ? 1 : 0).all<DoctorRow>();

  return result.results.map(toDoctor).sort(compareDoctors);
}

export async function getDoctorById(id: string, options: { includeInactive?: boolean } = {}) {
  await ensureDoctorsTable();
  const row = await env.DB.prepare(
    `SELECT id, name, specialty, experience_years, consultation_price, repeat_consultation_price, branch, description, biography,
            patient_groups, schedule, photo_key, is_active, sort_order, show_consultation_price_on_request
     FROM doctors
     WHERE id = ? AND (? = 1 OR is_active = 1)`,
  )
    .bind(id, options.includeInactive ? 1 : 0)
    .first<DoctorRow>();

  return row ? toDoctor(row) : null;
}

export async function getDoctorPhotoKey(id: string) {
  await ensureDoctorsTable();
  const row = await env.DB.prepare(
    "SELECT photo_key FROM doctors WHERE id = ?",
  )
    .bind(id)
    .first<{ photo_key: string }>();
  return row?.photo_key ?? "";
}

export async function updateDoctor(
  id: string,
  values: {
    name: string;
    specialty: string;
    experienceYears: number | null;
    consultationPrice?: number | null;
    repeatConsultationPrice?: number | null;
    showConsultationPriceOnRequest?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    branch: string;
    description: string;
    biography: string;
    patientGroups: DoctorPatientGroup[];
    schedule: DoctorSchedule;
  },
) {
  const consultationPrice = parseDoctorPrice(values.consultationPrice);
  const repeatConsultationPrice = parseDoctorPrice(values.repeatConsultationPrice);
  const showConsultationPriceOnRequest = parseDoctorShowConsultationPriceOnRequest(values.showConsultationPriceOnRequest);
  const isActive = parseDoctorIsActive(values.isActive);
  const sortOrder = parseDoctorSortOrder(values.sortOrder, DEFAULT_DOCTOR_SORT_ORDER);
  // Bound presence flags preserve omitted fields; explicit null still clears prices.
  await ensureDoctorsTable();
  const result = await env.DB.prepare(
    `UPDATE doctors
     SET consultation_price = CASE WHEN ? = 1 THEN ? ELSE consultation_price END,
         repeat_consultation_price = CASE WHEN ? = 1 THEN ? ELSE repeat_consultation_price END,
         show_consultation_price_on_request = CASE WHEN ? = 1 THEN ? ELSE show_consultation_price_on_request END,
         is_active = CASE WHEN ? = 1 THEN ? ELSE is_active END,
         sort_order = CASE WHEN ? = 1 THEN ? ELSE sort_order END,
         name = ?, specialty = ?, experience_years = ?, branch = ?, description = ?,
         biography = ?, patient_groups = ?, schedule = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      values.consultationPrice === undefined ? 0 : 1,
      consultationPrice,
      values.repeatConsultationPrice === undefined ? 0 : 1,
      repeatConsultationPrice,
      values.showConsultationPriceOnRequest === undefined ? 0 : 1,
      showConsultationPriceOnRequest ? 1 : 0,
      values.isActive === undefined ? 0 : 1,
      isActive ? 1 : 0,
      values.sortOrder === undefined ? 0 : 1,
      sortOrder,
      values.name,
      values.specialty,
      values.experienceYears,
      values.branch,
      values.description,
      values.biography,
      JSON.stringify(values.patientGroups),
      JSON.stringify(values.schedule),
      id,
    )
    .run();

  return result.meta.changes > 0;
}

export async function createDoctor(values: {
  name: string;
  specialty: string;
  id?: string;
  branch?: string;
  consultationPrice?: number | null;
  repeatConsultationPrice?: number | null;
  showConsultationPriceOnRequest?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const consultationPrice = parseDoctorPrice(values.consultationPrice);
  const repeatConsultationPrice = parseDoctorPrice(values.repeatConsultationPrice);
  const showConsultationPriceOnRequest = parseDoctorShowConsultationPriceOnRequest(values.showConsultationPriceOnRequest);
  const isActive = parseDoctorIsActive(values.isActive);
  const sortOrder = parseDoctorSortOrder(values.sortOrder, DEFAULT_DOCTOR_SORT_ORDER);
  await ensureDoctorsTable();
  const id = values.id?.trim() || `doctor-${crypto.randomUUID()}`;
  await env.DB.prepare(
    `INSERT INTO doctors
      (id, name, specialty, experience_years, consultation_price, repeat_consultation_price, show_consultation_price_on_request, is_active, sort_order, branch, description, biography, patient_groups, schedule, photo_key)
     VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, '', '', '[]', '{}', '')`,
  )
    .bind(id, values.name, values.specialty, consultationPrice, repeatConsultationPrice, showConsultationPriceOnRequest ? 1 : 0, isActive ? 1 : 0, sortOrder, values.branch?.trim() ?? "")
    .run();
  return getDoctorById(id, { includeInactive: true });
}

export async function deleteDoctor(id: string) {
  await ensureDoctorsTable();
  const result = await env.DB.prepare("DELETE FROM doctors WHERE id = ?")
    .bind(id)
    .run();
  return result.meta.changes > 0;
}

export async function updateDoctorPhotoKey(id: string, photoKey: string) {
  await ensureDoctorsTable();
  const result = await env.DB.prepare(
    `UPDATE doctors
     SET photo_key = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(photoKey, id)
    .run();

  return result.meta.changes > 0;
}
