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

export function doctorBookingHref(doctor: { id: string; name: string }, service?: string): string {
  return `/contacts?doctor=${encodeURIComponent(doctor.name)}&doctorId=${encodeURIComponent(doctor.id)}${service ? `&service=${encodeURIComponent(service)}` : ""}#booking`;
}
