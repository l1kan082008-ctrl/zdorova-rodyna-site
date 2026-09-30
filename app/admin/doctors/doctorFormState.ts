import { getDoctorSortOrder, type Doctor, type DoctorPatientGroup, type DoctorSchedule } from "../../doctors/doctorData.ts";

export type DoctorProfileDraft = {
  id: string;
  name: string;
  specialty: string;
  experienceYears: string;
  consultationPrice: string;
  repeatConsultationPrice: string;
  branch: string;
  description: string;
  biography: string;
  patientGroups: DoctorPatientGroup[];
  schedule: DoctorSchedule;
  isActive: boolean;
  sortOrder: string;
  showConsultationPriceOnRequest: boolean;
};

export function doctorProfileDraft(doctor: Doctor): DoctorProfileDraft {
  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    experienceYears: doctor.experienceYears?.toString() ?? "",
    consultationPrice: doctor.consultationPrice?.toString() ?? "",
    repeatConsultationPrice: doctor.repeatConsultationPrice?.toString() ?? "",
    branch: doctor.branch,
    description: doctor.description,
    biography: doctor.biography,
    patientGroups: doctor.patientGroups,
    schedule: doctor.schedule,
    isActive: doctor.isActive !== false,
    sortOrder: String(getDoctorSortOrder(doctor)),
    showConsultationPriceOnRequest: doctor.showConsultationPriceOnRequest === true,
  };
}

export const specialtyKey = (value: string) => value.trim().toLocaleLowerCase("uk-UA");

export function splitSpecialties(value: string): string[] {
  const unique = new Map<string, string>();
  for (const part of value.split(",")) {
    const label = part.trim();
    if (label && !unique.has(specialtyKey(label))) unique.set(specialtyKey(label), label);
  }
  return [...unique.values()];
}

export const doctorAcademicStatusOptions = [
  { value: "д.м.н.", label: "Доктор медичних наук" },
  { value: "к.мед.н.", label: "Кандидат медичних наук" },
  { value: "професор", label: "Професор" },
  { value: "доцент", label: "Доцент" },
] as const;

type DoctorAcademicStatus = (typeof doctorAcademicStatusOptions)[number]["value"];

export function getDoctorAcademicStatus(value: string): DoctorAcademicStatus | undefined {
  const key = specialtyKey(value).replace(/[.\s]+/g, "");
  if (/^(?:дмн|дмедн|доктормедичнихнаук)$/u.test(key)) return "д.м.н.";
  if (/^(?:кмн|кмедн|кандидатмедичнихнаук)$/u.test(key)) return "к.мед.н.";
  if (key === "професор" || key === "доцент") return key;
  return undefined;
}

export function getDoctorSpecialties(value: string): string[] {
  return splitSpecialties(value).filter((token) => !getDoctorAcademicStatus(token));
}

export function withDoctorSpecialties(currentValue: string, nextSpecialties: string[]): string {
  const academicTokens = splitSpecialties(currentValue).filter((token) => getDoctorAcademicStatus(token));
  return [...getDoctorSpecialties(nextSpecialties.join(", ")), ...academicTokens].join(", ");
}

export function withDoctorAcademicStatus(currentValue: string, statusValue: string, checked: boolean): string {
  const status = getDoctorAcademicStatus(statusValue);
  if (!status) return currentValue;
  let retained = false;
  const tokens = splitSpecialties(currentValue).filter((token) => {
    if (getDoctorAcademicStatus(token) !== status) return true;
    if (!checked || retained) return false;
    retained = true;
    return true;
  });
  if (checked && !retained) tokens.push(status);
  return tokens.join(", ");
}

export function isSpecialtyQualifier(value: string): boolean {
  const key = specialtyKey(value).replace(/[.\s]+/g, "");
  return Boolean(getDoctorAcademicStatus(value)) || /^(?:дитячийідорослий|дитячийтадорослий)$/u.test(key);
}

export function getSpecialtyOptions(values: readonly string[], preservedValue = ""): string[] {
  const preserved = new Set(splitSpecialties(preservedValue).map(specialtyKey));
  return splitSpecialties([...values, preservedValue].join(", "))
    .filter((value) => !getDoctorAcademicStatus(value) && (!isSpecialtyQualifier(value) || preserved.has(specialtyKey(value))))
    .sort((a, b) => a.localeCompare(b, "uk-UA"));
}

// Upgrade older profile and creation drafts only if their server baseline still matches.
export function upgradeLegacyDoctorDraft(raw: string, baseline: Partial<DoctorProfileDraft>): string {
  try {
    const stored = JSON.parse(raw);
    if (stored?.version !== 1 || typeof stored.baseline !== "string" ||
        !stored.value || typeof stored.value !== "object" || Array.isArray(stored.value)) return raw;
    const storedBaseline = JSON.parse(stored.baseline);
    if (!storedBaseline || typeof storedBaseline !== "object" || Array.isArray(storedBaseline)) return raw;
    const addedFields = ["repeatConsultationPrice", "isActive", "sortOrder", "showConsultationPriceOnRequest"] as const;
    const missingFields = addedFields.filter((field) => Object.hasOwn(baseline, field) && !Object.hasOwn(storedBaseline, field));
    if (!missingFields.length || missingFields.some((field) => Object.hasOwn(stored.value, field))) return raw;
    const previousBaseline = { ...baseline };
    for (const field of missingFields) delete previousBaseline[field];
    if (stored.baseline !== JSON.stringify(previousBaseline)) return raw;
    const value = { ...stored.value };
    for (const field of missingFields) value[field] = baseline[field];
    return JSON.stringify({ ...stored, baseline: JSON.stringify(baseline), value });
  } catch {
    return raw;
  }
}
