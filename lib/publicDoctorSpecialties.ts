import { doctorCategories } from "../app/doctors/doctorCategories.ts";

export type PublicDoctorCategory = {
  value: string;
  label: string;
  keywords: string[];
  urlAliases: string[];
  specialty?: string;
};

type DoctorSpecialties = { specialty: string; isActive?: boolean };

export const publicDoctorSpecialtyKey = (value: string) => value.normalize("NFC").trim().replace(/\s+/gu, " ").replace(/[\u2010-\u2014\u2212]/gu, "-").replace(/\s*-\s*/gu, "-").toLocaleLowerCase("uk-UA");

function isQualifier(value: string) {
  const key = publicDoctorSpecialtyKey(value).replace(/[.\s]+/gu, "");
  return /^(?:дмн|дмедн|доктормедичнихнаук|кмн|кмедн|кандидатмедичнихнаук|професор|доцент|дитячийідорослий|дитячийтадорослий)$/u.test(key);
}

function specialtyTokens(value: string) {
  return value.split(",").map((token) => token.trim().replace(/\s+/gu, " ")).filter((token) => token && !isQualifier(token));
}

function hasExistingCategory(value: string) {
  const key = publicDoctorSpecialtyKey(value);
  if (doctorCategories.some((category) => category.urlAliases.includes(key))) return true;
  // A known half of a compound specialty must not hide its new discipline.
  // Child/adult qualifiers alone are not a medical direction either.
  const parts = key.replace(/^(?:дитячий|дитяча|дорослий|доросла)\s+/u, "").split(/\s*[-–—/]\s*/u);
  return parts.every((part) => doctorCategories.some((category) => category.keywords.some((keyword) => keyword !== "дитяч" && part.includes(keyword))));
}

export function getPublicDoctorCategories(doctors: readonly DoctorSpecialties[]): PublicDoctorCategory[] {
  const additional = new Map<string, string>();
  for (const doctor of doctors) {
    if (doctor.isActive === false) continue;
    for (const specialty of specialtyTokens(doctor.specialty)) {
      const key = publicDoctorSpecialtyKey(specialty);
      if (!hasExistingCategory(specialty) && !additional.has(key)) {
        additional.set(key, specialty.charAt(0).toLocaleUpperCase("uk-UA") + specialty.slice(1));
      }
    }
  }
  return [
    ...doctorCategories,
    ...[...additional].sort(([, a], [, b]) => a.localeCompare(b, "uk-UA")).map(([key, label]) => ({
      value: `specialty:${key}`,
      label,
      keywords: [],
      urlAliases: [key],
      specialty: key,
    })),
  ];
}

export function matchesPublicDoctorCategory(specialties: string, category: PublicDoctorCategory): boolean {
  if (category.specialty) {
    return specialtyTokens(specialties).some((token) => publicDoctorSpecialtyKey(token) === category.specialty);
  }
  const normalized = publicDoctorSpecialtyKey(specialties);
  return category.keywords.some((keyword) => normalized.includes(keyword));
}

export function findPublicDoctorCategory(value: string, categories: readonly PublicDoctorCategory[]) {
  const key = publicDoctorSpecialtyKey(value);
  return categories.find((category) => category.value === key || category.urlAliases.some((alias) => publicDoctorSpecialtyKey(alias) === key));
}
