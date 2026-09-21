export class DoctorPriceValidationError extends Error {}

/** Undefined means unchanged; null deliberately clears a price. */
export function parseDoctorPrice(
  value: unknown,
  fallback: number | null = null,
): number | null {
  if (value === undefined) return fallback;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100_000) {
    throw new DoctorPriceValidationError("Ціна має бути цілим числом від 0 до 100 000 грн або порожньою.");
  }
  return value;
}

export function parseDoctorShowConsultationPriceOnRequest(value: unknown, fallback = false): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw new DoctorPriceValidationError("Показ ціни за запитом має бути увімкнений або вимкнений.");
  }
  return value;
}
