/** Shared programme identity for the public picker and server-side validation. */
export const screeningServiceName = "Скринінг здоров’я 40+";
export const screeningStreetAddress = "вул. Володимира Стельмаха, 18-М";
export const screeningAddress = `м. Рівне, ${screeningStreetAddress}`;

export const screeningDoctorIds = [
  "ishchuk-nadiia",
  "pochtar-kateryna",
  "doctor-4cd65e03-d5d5-4cdc-b2ab-98668b2b7098",
  "iziumska-olena",
] as const;

export function isScreeningFullName(value: string) {
  const name = value.trim();
  if (name.length > 100) return false;
  const parts = name.split(/\s+/u);
  // A patronymic is optional; accept names with Ukrainian/other letters,
  // combining accents, apostrophes and hyphens, but not a lone given name.
  return parts.length >= 2 && parts.every((part) =>
    /^\p{L}[\p{L}\p{M}]*(?:['’ʼ`-][\p{L}\p{M}]+)*$/u.test(part),
  );
}
