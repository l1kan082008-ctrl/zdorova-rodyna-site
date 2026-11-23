import { sitePhoneHref } from "./siteSettings.ts";

/** Addresses contain commas, so each selected branch occupies its own line. */
export function splitDoctorBranches(value: string): string[] {
  const seen = new Set<string>();
  return value.split(/\r\n?|\n/u).map((address) => address.trim()).filter((address) => {
    const key = address.toLocaleLowerCase("uk-UA").replace(/\s+/gu, " ");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function joinDoctorBranches(values: readonly string[]): string {
  return splitDoctorBranches(values.join("\n")).join("\n");
}

/** Radiologists have no public reception address; an empty list means the address is unspecified. */
export function getPublicDoctorBranches(doctor: { specialty: string; branch: string }): string[] | null {
  if (/рентгенолог|радіолог|radiolog/iu.test(doctor.specialty)) return null;
  return splitDoctorBranches(doctor.branch);
}

export const rudenkoBooking = {
  id: "rudenko-iryna",
  phone: "050 426 89 95",
  notice: "Лікарка веде запис самостійно.",
};

export function getDoctorPhoneBooking(id: string) {
  return id === rudenkoBooking.id ? rudenkoBooking : null;
}

export function doctorBookingHref(doctor: { id: string; name: string }, service?: string): string {
  const phoneBooking = getDoctorPhoneBooking(doctor.id);
  if (phoneBooking) return sitePhoneHref(phoneBooking.phone);
  return `/contacts?doctor=${encodeURIComponent(doctor.name)}&doctorId=${encodeURIComponent(doctor.id)}${service ? `&service=${encodeURIComponent(service)}` : ""}#booking`;
}
