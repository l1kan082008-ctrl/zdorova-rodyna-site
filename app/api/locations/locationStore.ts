import { env } from "@/lib/runtimeEnv";
import {
  branchServiceCatalog,
  centerLocations,
  type BranchServiceId,
  type CenterLocation,
} from "../../contacts/locationData";
import { normalizeMediaUrl } from "@/lib/publicUrl";

type D1DatabaseLike = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      all<T>(): Promise<{ results?: T[] }>;
      first<T>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
    all<T>(): Promise<{ results?: T[] }>;
    first<T>(): Promise<T | null>;
    run(): Promise<unknown>;
  };
};

type LocationRow = {
  id: string;
  city: string;
  name: string;
  type: string;
  address: string;
  full_address: string;
  landmark: string | null;
  description: string;
  hours_json: string;
  phone: string;
  services_json: string;
  latitude: number;
  longitude: number;
  gallery_json: string;
  video_url: string | null;
  sort_order: number;
};

const db = () => (env as unknown as { DB: D1DatabaseLike }).DB;
const validServiceIds = new Set(branchServiceCatalog.map((service) => service.id));

async function ensureLocationsTable() {
  await db().prepare(`
    CREATE TABLE IF NOT EXISTS center_locations (
      id TEXT PRIMARY KEY,
      city TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL,
      full_address TEXT NOT NULL,
      landmark TEXT,
      description TEXT NOT NULL DEFAULT '',
      hours_json TEXT NOT NULL DEFAULT '[]',
      phone TEXT NOT NULL DEFAULT '',
      services_json TEXT NOT NULL DEFAULT '[]',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      gallery_json TEXT NOT NULL DEFAULT '[]',
      video_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const count = await db()
    .prepare("SELECT COUNT(*) AS count FROM center_locations")
    .first<{ count: number }>();

  if (Number(count?.count ?? 0) === 0 && process.env.BOOTSTRAP_DEFAULT_CONTENT === "true") {
    for (const [index, location] of centerLocations.entries()) {
      await insertLocation(location, index);
    }
  }
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToLocation(row: LocationRow): CenterLocation {
  return {
    id: row.id,
    city: row.city,
    name: row.name,
    type: row.type,
    address: row.address,
    fullAddress: row.full_address,
    landmark: row.landmark ?? undefined,
    description: row.description,
    hours: parseJson<string[]>(row.hours_json, []),
    phone: row.phone,
    services: parseJson<BranchServiceId[]>(row.services_json, []),
    coordinates: { lat: Number(row.latitude), lng: Number(row.longitude) },
    gallery: parseJson<CenterLocation["gallery"]>(row.gallery_json, []),
    videoUrl: row.video_url ?? undefined,
  };
}

function normalizeText(value: unknown, field: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`Заповніть поле «${field}».`);
  return text;
}

function normalizeLocation(payload: Partial<CenterLocation>, existing?: CenterLocation): CenterLocation {
  const services = Array.isArray(payload.services)
    ? payload.services.filter((id): id is BranchServiceId => validServiceIds.has(id as BranchServiceId))
    : existing?.services ?? [];
  if (services.length === 0) throw new Error("Оберіть принаймні одну доступну послугу.");

  const hours = (Array.isArray(payload.hours) ? payload.hours : existing?.hours ?? [])
    .map((line) => String(line).trim())
    .filter(Boolean);
  if (hours.length === 0) throw new Error("Додайте графік роботи відділення.");

  const lat = Number(payload.coordinates?.lat ?? existing?.coordinates.lat);
  const lng = Number(payload.coordinates?.lng ?? existing?.coordinates.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Вкажіть коректні координати відділення.");
  }

  const gallery = (Array.isArray(payload.gallery) ? payload.gallery : existing?.gallery ?? [])
    .filter((item) => item && typeof item.src === "string" && item.src.trim())
    .map((item) => ({
      src: normalizeMediaUrl(item.src, "Фото відділення"),
      alt: String(item.alt ?? "").trim(),
      caption: String(item.caption ?? "").trim(),
    }));

  const rawVideoUrl = String(payload.videoUrl ?? existing?.videoUrl ?? "").trim();

  return {
    id: existing?.id ?? String(payload.id || crypto.randomUUID()),
    city: normalizeText(payload.city ?? existing?.city, "Місто"),
    name: normalizeText(payload.name ?? existing?.name, "Назва"),
    type: normalizeText(payload.type ?? existing?.type, "Тип відділення"),
    address: normalizeText(payload.address ?? existing?.address, "Коротка адреса"),
    fullAddress: normalizeText(payload.fullAddress ?? existing?.fullAddress, "Повна адреса"),
    landmark: String(payload.landmark ?? existing?.landmark ?? "").trim() || undefined,
    description: String(payload.description ?? existing?.description ?? "").trim(),
    hours,
    phone: String(payload.phone ?? existing?.phone ?? "").trim(),
    services,
    coordinates: { lat, lng },
    gallery,
    videoUrl: rawVideoUrl ? normalizeMediaUrl(rawVideoUrl, "Відео") : undefined,
  };
}

async function insertLocation(location: CenterLocation, sortOrder: number) {
  await db().prepare(`
    INSERT INTO center_locations (
      id, city, name, type, address, full_address, landmark, description,
      hours_json, phone, services_json, latitude, longitude, gallery_json,
      video_url, sort_order, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    location.id,
    location.city,
    location.name,
    location.type,
    location.address,
    location.fullAddress,
    location.landmark ?? null,
    location.description,
    JSON.stringify(location.hours),
    location.phone,
    JSON.stringify(location.services),
    location.coordinates.lat,
    location.coordinates.lng,
    JSON.stringify(location.gallery),
    location.videoUrl ?? null,
    sortOrder,
  ).run();
}

export async function listLocations() {
  await ensureLocationsTable();
  const result = await db().prepare(
    "SELECT * FROM center_locations ORDER BY sort_order, city, address",
  ).all<LocationRow>();
  return (result.results ?? []).map(rowToLocation);
}

export async function createLocation(payload: Partial<CenterLocation>) {
  await ensureLocationsTable();
  const location = normalizeLocation(payload);
  const max = await db().prepare(
    "SELECT COALESCE(MAX(sort_order), -1) AS value FROM center_locations",
  ).first<{ value: number }>();
  await insertLocation(location, Number(max?.value ?? -1) + 1);
  return location;
}

export async function updateLocation(id: string, payload: Partial<CenterLocation>) {
  await ensureLocationsTable();
  const existing = (await listLocations()).find((location) => location.id === id);
  if (!existing) throw new Error("Відділення не знайдено.");
  const location = normalizeLocation(payload, existing);
  await db().prepare(`
    UPDATE center_locations SET
      city = ?, name = ?, type = ?, address = ?, full_address = ?, landmark = ?,
      description = ?, hours_json = ?, phone = ?, services_json = ?, latitude = ?,
      longitude = ?, gallery_json = ?, video_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    location.city,
    location.name,
    location.type,
    location.address,
    location.fullAddress,
    location.landmark ?? null,
    location.description,
    JSON.stringify(location.hours),
    location.phone,
    JSON.stringify(location.services),
    location.coordinates.lat,
    location.coordinates.lng,
    JSON.stringify(location.gallery),
    location.videoUrl ?? null,
    id,
  ).run();
  return location;
}

export async function deleteLocation(id: string) {
  await ensureLocationsTable();
  await db().prepare("DELETE FROM center_locations WHERE id = ?").bind(id).run();
}
