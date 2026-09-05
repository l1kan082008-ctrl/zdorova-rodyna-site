import type { BranchServiceId, CenterLocation } from "../app/contacts/locationData";

export function serviceCategory(service: string): BranchServiceId | null {
  if (/^КТ(?:\s|$)/u.test(service)) return "ct";
  if (/^МРТ(?:\s|$)/u.test(service)) return "mri";
  if (/^(?:УЗД|ЕХО\s*\(УЗД\))(?:\s|$)/u.test(service)) return "ultrasound";
  if (service === "Лабораторні дослідження") return "laboratory";
  if (/^Консультаці/u.test(service)) return "doctors";
  return null;
}

export function compatibleLocations(locations: CenterLocation[], service: string) {
  const category = serviceCategory(service);
  return locations.filter((location) => service === "Допоможіть обрати послугу" || (category !== null && location.services.includes(category)));
}

export function formatBookingPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00380")) digits = digits.slice(4);
  else if (digits.startsWith("380")) digits = digits.slice(2);
  digits = digits.slice(0, 10);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(" ");
}
