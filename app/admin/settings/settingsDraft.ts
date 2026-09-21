import type { SiteSettings } from "@/lib/siteSettings";

// Preserve unsaved contact edits when optional social fields are introduced.
export function upgradeLegacySettingsDraft(raw: string, baseline: SiteSettings): string {
  try {
    const stored = JSON.parse(raw);
    if (stored?.version !== 1 || typeof stored.baseline !== "string" ||
        !stored.value || typeof stored.value !== "object" || Array.isArray(stored.value)) return raw;
    const storedBaseline = JSON.parse(stored.baseline);
    if (!storedBaseline || typeof storedBaseline !== "object" || Array.isArray(storedBaseline)) return raw;
    const addedFields = ["tiktokUrl", "threadsUrl"] as const;
    const missingFields = addedFields.filter((field) => !Object.hasOwn(storedBaseline, field));
    if (!missingFields.length || missingFields.some((field) => Object.hasOwn(stored.value, field))) return raw;
    const previousBaseline: Partial<SiteSettings> = { ...baseline };
    for (const field of missingFields) delete previousBaseline[field];
    if (stored.baseline !== JSON.stringify(previousBaseline)) return raw;
    const value = { ...stored.value };
    for (const field of missingFields) value[field] = baseline[field];
    return JSON.stringify({ ...stored, baseline: JSON.stringify(baseline), value });
  } catch {
    return raw;
  }
}
