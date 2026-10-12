import { isSpecialtyQualifier } from "@/app/admin/doctors/doctorFormState";

export const MAX_DOCTOR_SPECIALTY_LENGTH = 80;

export class DoctorSpecialtyValidationError extends Error {}

export function normalizeDoctorSpecialtyName(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ")
    .replace(/[\u2010-\u2014\u2212]/gu, "-").replace(/\s*-\s*/gu, "-");
}

export function doctorSpecialtyKey(value: string): string {
  return normalizeDoctorSpecialtyName(value).toLocaleLowerCase("uk-UA");
}

export function parseDoctorSpecialtyName(value: unknown): string {
  if (typeof value !== "string") {
    throw new DoctorSpecialtyValidationError("Вкажіть назву спеціальності.");
  }
  // One entry is one specialty; commas are reserved for the doctor's selected list.
  if (/[,\p{Cc}\p{Cf}]/u.test(value)) {
    throw new DoctorSpecialtyValidationError("Введіть одну спеціальність без ком і переносів рядка.");
  }
  const name = normalizeDoctorSpecialtyName(value);
  if (!name || !/\p{L}/u.test(name)) {
    throw new DoctorSpecialtyValidationError("Вкажіть назву спеціальності.");
  }
  if (name.length > MAX_DOCTOR_SPECIALTY_LENGTH) {
    throw new DoctorSpecialtyValidationError(`Назва спеціальності має містити не більше ${MAX_DOCTOR_SPECIALTY_LENGTH} символів.`);
  }
  if (isSpecialtyQualifier(name)) {
    throw new DoctorSpecialtyValidationError("Наукові ступені та звання обираються окремо в картці лікаря.");
  }
  return name;
}
