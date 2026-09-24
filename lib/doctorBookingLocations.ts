import type { CenterLocation } from "../app/contacts/locationData";
import { splitDoctorBranches } from "./doctorBranches";
import { isInformationOnlyLocation } from "./locationPolicy";

export type BookingDoctor = { id: string; name: string; branch: string; isActive?: boolean };
export type DoctorBookingLocation = {
  id: string;
  fullAddress: string;
  label: string;
  requiresConfirmation: boolean;
};

export function isBookingDoctor(value: unknown): value is BookingDoctor {
  if (!value || typeof value !== "object") return false;
  const doctor = value as Partial<BookingDoctor>;
  return typeof doctor.id === "string" && Boolean(doctor.id.trim()) &&
    typeof doctor.name === "string" && Boolean(doctor.name.trim()) &&
    typeof doctor.branch === "string" && doctor.isActive !== false;
}

export function doctorNameKey(value: string) {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("uk-UA");
}

function addressKey(value: string) {
  return doctorNameKey(value).replace(/\s*,\s*/gu, ",");
}

export function toDoctorBookingLocation(location: CenterLocation): DoctorBookingLocation {
  return {
    id: location.id,
    fullAddress: location.fullAddress,
    label: `${location.city} · ${location.name}`,
    requiresConfirmation: false,
  };
}

/** Match only catalogued address forms; a saved legacy address remains intact. */
export function assignedDoctorBookingLocations(branch: string, locations: CenterLocation[]): DoctorBookingLocation[] {
  const results: DoctorBookingLocation[] = [];
  for (const address of splitDoctorBranches(branch)) {
    // This information-only town is intentionally absent from the public location API.
    if (/^(?:м\.\s*)?Броди(?:\s*,|$)/iu.test(address.trim())) continue;
    const key = addressKey(address);
    const matches = locations.filter(location => {
      const aliases = [location.fullAddress, location.address, `м. ${location.city}, ${location.address}`];
      if (location.id === "stelmakha-18m" && location.city === "Рівне") {
        aliases.push("вул. Стельмаха, 18-М", "м. Рівне, вул. Стельмаха, 18-М");
      }
      return aliases.some(alias => typeof alias === "string" && addressKey(alias) === key);
    });
    if (matches.length === 1) {
      const location = matches[0];
      if (isInformationOnlyLocation(location)) continue;
      if (!results.some(item => item.id === location.id)) results.push(toDoctorBookingLocation(location));
    } else {
      // No address guessing or unrelated substitute branch. A human confirms legacy addresses.
      results.push({ id: `doctor-address:${address}`, fullAddress: address, label: `${address} · уточнити адресу`, requiresConfirmation: true });
    }
  }
  return results;
}
