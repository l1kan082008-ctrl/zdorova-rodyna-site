import { env } from "cloudflare:workers";
import {
  defaultDoctors,
  doctorPhotoUrls,
  type Doctor,
  type DoctorAvailabilityStatus,
  type DoctorPatientGroup,
  type DoctorSchedule,
} from "../../doctors/doctorData";

type DoctorRow = {
  id: string;
  name: string;
  specialty: string;
  experience_years: number | null;
  branch: string;
  description: string;
  biography: string;
  patient_groups: string;
  schedule: string;
  photo_key: string;
  availability_status: DoctorAvailabilityStatus;
};

const createDoctorsTable = `
  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience_years INTEGER,
    branch TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    biography TEXT NOT NULL DEFAULT '',
    patient_groups TEXT NOT NULL DEFAULT '[]',
    schedule TEXT NOT NULL DEFAULT '{}',
    photo_key TEXT NOT NULL DEFAULT '',
    availability_status TEXT NOT NULL DEFAULT 'accepting',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export async function ensureDoctorsTable() {
  await env.DB.prepare(createDoctorsTable).run();
  const columns = await env.DB.prepare("PRAGMA table_info(doctors)").all<{
    name: string;
  }>();
  if (!columns.results.some((column) => column.name === "availability_status")) {
    await env.DB.prepare(
      "ALTER TABLE doctors ADD COLUMN availability_status TEXT NOT NULL DEFAULT 'accepting'",
    ).run();
  }
  if (!columns.results.some((column) => column.name === "biography")) {
    await env.DB.prepare(
      "ALTER TABLE doctors ADD COLUMN biography TEXT NOT NULL DEFAULT ''",
    ).run();
  }
  if (!columns.results.some((column) => column.name === "patient_groups")) {
    await env.DB.prepare(
      "ALTER TABLE doctors ADD COLUMN patient_groups TEXT NOT NULL DEFAULT '[]'",
    ).run();
  }
  const count = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM doctors",
  ).first<{ total: number }>();

  if ((count?.total ?? 0) > 0) return;

  await env.DB.batch(
    defaultDoctors.map((doctor) =>
      env.DB.prepare(
        `INSERT OR IGNORE INTO doctors
          (id, name, specialty, experience_years, branch, description, biography, patient_groups, schedule, photo_key, availability_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?)`,
      ).bind(
        doctor.id,
        doctor.name,
        doctor.specialty,
        doctor.experienceYears,
        doctor.branch,
        doctor.description,
        doctor.biography,
        JSON.stringify(doctor.patientGroups),
        JSON.stringify(doctor.schedule),
        doctor.availabilityStatus,
      ),
    ),
  );
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
    branch: row.branch,
    description: row.description,
    biography: row.biography,
    patientGroups: parsePatientGroups(row.patient_groups),
    schedule: parseSchedule(row.schedule),
    availabilityStatus: row.availability_status ?? "accepting",
    photoUrl: row.photo_key
      ? `/api/doctors/photo?key=${encodeURIComponent(row.photo_key)}`
      : doctorPhotoUrls[row.id] ?? "",
  };
}

export async function listDoctors() {
  await ensureDoctorsTable();
  const result = await env.DB.prepare(
    `SELECT id, name, specialty, experience_years, branch, description, biography,
            patient_groups, schedule, photo_key, availability_status
     FROM doctors
     ORDER BY name COLLATE NOCASE`,
  ).all<DoctorRow>();

  return result.results.map(toDoctor);
}

export async function getDoctorById(id: string) {
  await ensureDoctorsTable();
  const row = await env.DB.prepare(
    `SELECT id, name, specialty, experience_years, branch, description, biography,
            patient_groups, schedule, photo_key, availability_status
     FROM doctors
     WHERE id = ?`,
  )
    .bind(id)
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
    specialty: string;
    experienceYears: number | null;
    branch: string;
    description: string;
    biography: string;
    patientGroups: DoctorPatientGroup[];
    schedule: DoctorSchedule;
    availabilityStatus: DoctorAvailabilityStatus;
  },
) {
  await ensureDoctorsTable();
  const result = await env.DB.prepare(
    `UPDATE doctors
     SET specialty = ?, experience_years = ?, branch = ?, description = ?,
         biography = ?, patient_groups = ?, schedule = ?,
         availability_status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      values.specialty,
      values.experienceYears,
      values.branch,
      values.description,
      values.biography,
      JSON.stringify(values.patientGroups),
      JSON.stringify(values.schedule),
      values.availabilityStatus,
      id,
    )
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
