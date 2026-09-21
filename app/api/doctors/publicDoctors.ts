import "server-only";

import { defaultDoctors, getPublicDoctors } from "../../doctors/doctorData";
import { getDoctorById, listDoctors } from "./doctorStore";

function shouldUseLocalDefaults() {
  return process.env.NODE_ENV === "development" && !process.env.DATABASE_URL?.trim();
}

export async function listPublicDoctors() {
  if (shouldUseLocalDefaults()) return getPublicDoctors(defaultDoctors);
  try {
    return await listDoctors();
  } catch {
    // A database outage must never republish a hidden profile from bundled data.
    return [];
  }
}

export async function getPublicDoctorById(id: string) {
  if (shouldUseLocalDefaults()) {
    return defaultDoctors.find((doctor) => doctor.id === id && doctor.isActive !== false) ?? null;
  }
  try {
    return await getDoctorById(id);
  } catch {
    return null;
  }
}
