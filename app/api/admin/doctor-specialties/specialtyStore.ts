import { env } from "@/lib/runtimeEnv";
import { initializeOnce } from "@/lib/initializeOnce";
import { doctorSpecialtyKey, parseDoctorSpecialtyName } from "@/lib/doctorSpecialties";
import { defaultDoctors } from "@/app/doctors/doctorData";
import { additionalDoctorSpecialtyOptions } from "@/app/doctors/doctorCategories";
import { getSpecialtyOptions } from "@/app/admin/doctors/doctorFormState";
import { listDoctors } from "../../doctors/doctorStore";

type SpecialtyRow = { name: string };

export class DoctorSpecialtyStorageUnavailableError extends Error {}

const initializeSchema = initializeOnce();

async function ensureSpecialtyTable() {
  return initializeSchema(async () => {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS doctor_specialties (
      specialty_key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
  });
}

function mergeSpecialties(values: readonly string[]): string[] {
  const unique = new Map<string, string>();
  for (const name of getSpecialtyOptions(values)) {
    const key = doctorSpecialtyKey(name);
    if (!unique.has(key)) unique.set(key, name);
  }
  return [...unique.values()].sort((first, second) => first.localeCompare(second, "uk-UA"));
}

const defaultSpecialties = [
  ...additionalDoctorSpecialtyOptions,
  ...defaultDoctors.map((doctor) => doctor.specialty),
];

export async function listDoctorSpecialties(): Promise<string[]> {
  if (!env.DB) return mergeSpecialties(defaultSpecialties);
  await ensureSpecialtyTable();
  const [doctors, stored] = await Promise.all([
    listDoctors({ includeInactive: true }),
    env.DB.prepare("SELECT name FROM doctor_specialties ORDER BY name").all<SpecialtyRow>(),
  ]);
  return mergeSpecialties([
    ...defaultSpecialties,
    ...doctors.map((doctor) => doctor.specialty),
    ...stored.results.map((specialty) => specialty.name),
  ]);
}

export async function saveDoctorSpecialty(value: unknown): Promise<string> {
  const name = parseDoctorSpecialtyName(value);
  if (!env.DB) {
    throw new DoctorSpecialtyStorageUnavailableError("Збереження спеціальностей тимчасово недоступне. Спробуйте пізніше.");
  }
  const key = doctorSpecialtyKey(name);
  const existing = (await listDoctorSpecialties()).find((label) => doctorSpecialtyKey(label) === key);
  // Persist even a specialty imported from a profile, so deleting that profile cannot remove it.
  await env.DB.prepare("INSERT OR IGNORE INTO doctor_specialties (specialty_key, name) VALUES (?, ?)")
    .bind(key, existing ?? name).run();
  const stored = await env.DB.prepare("SELECT name FROM doctor_specialties WHERE specialty_key = ?")
    .bind(key).first<SpecialtyRow>();
  if (!stored) throw new Error("Specialty could not be read after saving.");
  return stored.name;
}
