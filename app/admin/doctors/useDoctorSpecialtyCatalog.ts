"use client";

import { useCallback, useEffect, useState } from "react";
import { getSpecialtyOptions } from "./doctorFormState";

export type SaveDoctorSpecialty = (name: string) => Promise<string>;

type CatalogPayload = { specialties?: string[]; specialty?: string; error?: string };
const validOptions = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function useDoctorSpecialtyCatalog() {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/admin/doctor-specialties", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as CatalogPayload;
        if (!response.ok || !validOptions(payload.specialties)) {
          throw new Error(payload.error || "Не вдалося завантажити спеціальності.");
        }
        const options = payload.specialties;
        if (!controller.signal.aborted) setSpecialties((current) => getSpecialtyOptions([...current, ...options]));
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Не вдалося завантажити спеціальності.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  const save = useCallback<SaveDoctorSpecialty>(async (name) => {
    const response = await fetch("/api/admin/doctor-specialties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const payload = await response.json() as CatalogPayload;
    if (!response.ok || !payload.specialty || !validOptions(payload.specialties)) {
      throw new Error(payload.error || "Не вдалося зберегти спеціальність. Спробуйте ще раз.");
    }
    const options = payload.specialties;
    setSpecialties((current) => getSpecialtyOptions([...current, ...options]));
    return payload.specialty;
  }, []);

  return { specialties, loading, error, save, reload: () => setAttempt((value) => value + 1) };
}
