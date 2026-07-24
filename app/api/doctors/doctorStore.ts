import { env } from "cloudflare:workers";
import {
  defaultDoctors,
  type Doctor,
  type DoctorSchedule,
} from "../../doctors/doctorData";

type DoctorRow = {
  id: string;
  name: string;
  specialty: string;
  experience_years: number | null;
  branch: string;
  description: string;
  schedule: string;
  photo_key: string;
};

const createDoctorsTable = `
  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience_years INTEGER,
    branch TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    schedule TEXT NOT NULL DEFAULT '{}',
    photo_key TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export async function ensureDoctorsTable() {
  await env.DB.prepare(createDoctorsTable).run();
  const count = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM doctors",
  ).first<{ total: number }>();

  if ((count?.total ?? 0) > 0) return;

  await env.DB.batch(
    defaultDoctors.map((doctor) =>
      env.DB.prepare(
        `INSERT OR IGNORE INTO doctors
          (id, name, specialty, experience_years, branch, description, schedule, photo_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, '')`,
      ).bind(
        doctor.id,
        doctor.name,
        doctor.specialty,
        doctor.experienceYears,
        doctor.branch,
        doctor.description,
        JSON.stringify(doctor.schedule),
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

function toDoctor(row: DoctorRow): Doctor {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    experienceYears: row.experience_years,
    branch: row.branch,
    description: row.description,
    schedule: parseSchedule(row.schedule),
    photoUrl: row.photo_key
      ? `/api/doctors/photo?key=${encodeURIComponent(row.photo_key)}`
      : "",
  };
}

export async function listDoctors() {
  await ensureDoctorsTable();
  const result = await env.DB.prepare(
    `SELECT id, name, specialty, experience_years, branch, description, schedule, photo_key
     FROM doctors
     ORDER BY name COLLATE NOCASE`,
  ).all<DoctorRow>();

  return result.results.map(toDoctor);
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
    schedule: DoctorSchedule;
  },
) {
  await ensureDoctorsTable();
  const result = await env.DB.prepare(
    `UPDATE doctors
     SET specialty = ?, experience_years = ?, branch = ?, description = ?,
         schedule = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      values.specialty,
      values.experienceYears,
      values.branch,
      values.description,
      JSON.stringify(values.schedule),
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
