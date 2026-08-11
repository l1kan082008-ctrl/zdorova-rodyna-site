import type { CategoryId } from "./priceData";

export const DEFAULT_CITO_SURCHARGE = 100;

// The stored per-item surcharge is retained for backwards-compatible imports.
// The patient-facing surcharge is calculated once for the whole CITO group.
export const CITO_INITIAL_GROUP_SURCHARGE = 200;
export const CITO_ADDITIONAL_STUDY_SURCHARGE = 50;
export const CITO_MAX_GROUP_SURCHARGE = 350;

export function calculateCitoSurcharge(selectedCount: number) {
  const count = Math.max(0, Math.floor(selectedCount));

  if (count === 0) return 0;
  if (count <= 2) return CITO_INITIAL_GROUP_SURCHARGE;

  return Math.min(
    CITO_MAX_GROUP_SURCHARGE,
    CITO_INITIAL_GROUP_SURCHARGE +
      (count - 2) * CITO_ADDITIONAL_STUDY_SURCHARGE,
  );
}

export const DEFAULT_CITO_CATEGORIES: ReadonlyArray<CategoryId> = [
  "general",
  "biochemistry",
  "hormones",
];

export function usesDefaultCitoPolicy(category: CategoryId) {
  return DEFAULT_CITO_CATEGORIES.includes(category);
}
