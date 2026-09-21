export class DoctorPublicationValidationError extends Error {}

export function parseDoctorIsActive(value: unknown, fallback = true): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw new DoctorPublicationValidationError("Публікація профілю має бути увімкнена або вимкнена.");
  }
  return value;
}

export function parseDoctorSortOrder(value: unknown, fallback = 1000): number {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2_147_483_647) {
    throw new DoctorPublicationValidationError("Порядок має бути цілим числом від 0 до 2 147 483 647.");
  }
  return value;
}
