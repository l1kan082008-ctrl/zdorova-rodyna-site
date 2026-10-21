import { initializeOnce } from "../../../lib/initializeOnce";
import { env } from "@/lib/runtimeEnv";
import { primaryServiceDetails } from "../../services/serviceData";
import { normalizeInternalHref, normalizeMediaUrl } from "@/lib/publicUrl";
import { deleteMediaReference, normalizeMediaReference } from "@/lib/mediaStorage";

export type ManagedService = {
  id: string;
  slug: string;
  shortTitle: string;
  cardDescription: string;
  href: string;
  imageKey: string | null;
  imagePath: string | null;
  sortOrder: number;
  showOnServicesPage: boolean;
  showOnHome: boolean;
  active: boolean;
};

type ServiceRow = {
  id: string;
  slug: string;
  short_title: string;
  card_description: string;
  href: string;
  image_key: string | null;
  image_path: string | null;
  sort_order: number;
  show_on_services_page: number;
  show_on_home: number;
  active: number;
};

const db = () => env.DB;
const homeSlugs = new Set(["lab", "ct", "mri", "consultation", "holter"]);

const cardImageBySlug: Record<string, string> = {
  ct: "/service-cards/ct-glass-v3.jpg",
  mri: "/service-cards/mri-glass-v3.jpg",
  ultrasound: "/service-cards/ultrasound-glass-v3.jpg",
  lab: "/service-cards/lab-glass-v3.jpg",
  consultation: "/service-cards/consultation-glass-v3.jpg",
  cardiology: "/service-cards/cardiology-glass-v3.jpg",
  holter: "/service-cards/holter-glass-v3.webp",
  "home-nurse": "/service-cards/home-nurse-glass-v3.jpg",
  family: "/service-cards/family-glass-v3.jpg",
  "screening-40": "/service-cards/screening-40-glass-v1.webp",
  "wart-removal": "/service-cards/wart-removal-glass-v3.jpg",
  "ear-piercing": "/service-cards/ear-piercing-glass-v3.jpg",
  dermoscopy: "/service-cards/dermoscopy-glass-v3.jpg",
  audiometry: "/service-cards/audiometry-glass-v3.jpg",
};

export function getDefaultManagedServices(): ManagedService[] {
  return primaryServiceDetails.map((service, index) => ({
    id: service.slug,
    slug: service.slug,
    shortTitle: service.slug === "lab" ? "Аналізи" : service.shortTitle,
    cardDescription:
      service.slug === "lab" ? "Лабораторні дослідження" : service.cardDescription,
    href: `/services/${service.slug}`,
    imageKey: null,
    imagePath: cardImageBySlug[service.slug] ?? null,
    sortOrder: index,
    showOnServicesPage: true,
    showOnHome: homeSlugs.has(service.slug),
    active: true,
  }));
}

async function ensureServicesTable() {
  return initializeSchema(initializeSchemaTables);
}

const initializeSchema = initializeOnce();

async function initializeSchemaTables() {
  await db().prepare(`
    CREATE TABLE IF NOT EXISTS managed_services (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      short_title TEXT NOT NULL,
      card_description TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL,
      image_key TEXT,
      image_path TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      show_on_services_page INTEGER NOT NULL DEFAULT 1,
      show_on_home INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const count = await db().prepare("SELECT COUNT(*) AS count FROM managed_services").first<{ count: number }>();
  if (Number(count?.count ?? 0) === 0) {
    if (process.env.BOOTSTRAP_DEFAULT_CONTENT !== "true") return;
    for (const service of getDefaultManagedServices()) {
      await insertService(service);
    }
  }
  await migrateServiceCard("holter", "holter-service-card-v1");
  await migrateServiceCard("screening-40", "screening-40-service-card-v1");
}

// Add the requested card once; subsequent admin edits, hiding and deletion remain authoritative.
async function migrateServiceCard(slug: string, migration: string) {
  await db().prepare("CREATE TABLE IF NOT EXISTS service_migrations (id TEXT PRIMARY KEY)").run();
  if (await db().prepare("SELECT id FROM service_migrations WHERE id = ?").bind(migration).first()) return;

  const service = getDefaultManagedServices().find((item) => item.slug === slug);
  if (!service) throw new Error(`Missing service default: ${slug}.`);

  await db().batch([
    db().prepare(`
      INSERT INTO managed_services (
        id, slug, short_title, card_description, href, image_key, image_path,
        sort_order, show_on_services_page, show_on_home, active, updated_at
      )
      SELECT ?, ?, ?, ?, ?, ?, ?,
        (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM managed_services),
        ?, ?, ?, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM service_migrations WHERE id = ?)
        AND NOT EXISTS (
          SELECT 1 FROM managed_services
          WHERE slug = ? OR href = ?
            OR href = ? OR href LIKE ?
            OR href LIKE ? OR href LIKE ? OR href LIKE ?
        )
      ON CONFLICT DO NOTHING
    `).bind(
      service.id, service.slug, service.shortTitle, service.cardDescription,
      service.href, service.imageKey, service.imagePath,
      service.showOnServicesPage ? 1 : 0, service.showOnHome ? 1 : 0,
      service.active ? 1 : 0, migration,
      service.slug, service.href, `${service.href}/`,
      `${service.href}?%`, `${service.href}#%`, `${service.href}/?%`, `${service.href}/#%`,
    ),
    db().prepare("INSERT INTO service_migrations (id) VALUES (?) ON CONFLICT(id) DO NOTHING")
      .bind(migration),
  ]);
}

function rowToService(row: ServiceRow): ManagedService {
  // Replace only the original borrowed artwork; keep admin images and stored data intact.
  const usesLegacyScreeningArtwork = row.slug === "screening-40"
    && !row.image_key
    && row.image_path === "/service-cards/family-glass-v3.jpg";

  return {
    id: row.id,
    slug: row.slug,
    shortTitle: row.short_title,
    cardDescription: row.card_description,
    href: row.href,
    imageKey: row.image_key,
    imagePath: usesLegacyScreeningArtwork ? cardImageBySlug["screening-40"] : row.image_path,
    sortOrder: Number(row.sort_order),
    showOnServicesPage: Boolean(row.show_on_services_page),
    showOnHome: Boolean(row.show_on_home),
    active: Boolean(row.active),
  };
}

function requiredText(value: unknown, field: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`Заповніть поле «${field}».`);
  return text;
}

function normalizeSlug(value: unknown) {
  const slug = String(value ?? "").trim().toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("Вкажіть системну назву послуги.");
  return slug;
}

function normalizeService(payload: Partial<ManagedService>, existing?: ManagedService): ManagedService {
  const slug = normalizeSlug(payload.slug ?? existing?.slug);
  const href = normalizeInternalHref(
    payload.href ?? existing?.href ?? `/services/${slug}`,
    "Посилання",
  );
  const rawImagePath = String(payload.imagePath ?? existing?.imagePath ?? "").trim();

  return {
    id: existing?.id ?? String(payload.id || crypto.randomUUID()),
    slug,
    shortTitle: requiredText(payload.shortTitle ?? existing?.shortTitle, "Назва"),
    cardDescription: String(payload.cardDescription ?? existing?.cardDescription ?? "").trim(),
    href,
    imageKey: normalizeMediaReference(
      payload.imageKey ?? existing?.imageKey,
      "services",
      "Зображення",
    ) || null,
    imagePath: rawImagePath ? normalizeMediaUrl(rawImagePath, "Шлях зображення") : null,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : existing?.sortOrder ?? 0,
    showOnServicesPage: payload.showOnServicesPage ?? existing?.showOnServicesPage ?? true,
    showOnHome: payload.showOnHome ?? existing?.showOnHome ?? false,
    active: payload.active ?? existing?.active ?? true,
  };
}

async function insertService(service: ManagedService) {
  await db().prepare(`
    INSERT INTO managed_services (
      id, slug, short_title, card_description, href, image_key, image_path,
      sort_order, show_on_services_page, show_on_home, active, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    service.id,
    service.slug,
    service.shortTitle,
    service.cardDescription,
    service.href,
    service.imageKey,
    service.imagePath,
    service.sortOrder,
    service.showOnServicesPage ? 1 : 0,
    service.showOnHome ? 1 : 0,
    service.active ? 1 : 0,
  ).run();
}

export async function listManagedServices(options?: { includeInactive?: boolean }) {
  await ensureServicesTable();
  const result = options?.includeInactive
    ? await db()
        .prepare(
          "SELECT * FROM managed_services ORDER BY sort_order, short_title",
        )
        .all<ServiceRow>()
    : await db()
        .prepare(
          "SELECT * FROM managed_services WHERE active = 1 ORDER BY sort_order, short_title",
        )
        .all<ServiceRow>();
  return (result.results ?? []).map(rowToService);
}

export async function createManagedService(payload: Partial<ManagedService>) {
  await ensureServicesTable();
  const max = await db().prepare("SELECT COALESCE(MAX(sort_order), -1) AS value FROM managed_services").first<{ value: number }>();
  const service = normalizeService({ ...payload, sortOrder: payload.sortOrder ?? Number(max?.value ?? -1) + 1 });
  await insertService(service);
  return service;
}

export async function updateManagedService(id: string, payload: Partial<ManagedService>) {
  await ensureServicesTable();
  const existing = (await listManagedServices({ includeInactive: true })).find((item) => item.id === id);
  if (!existing) throw new Error("Послугу не знайдено.");
  const service = normalizeService(payload, existing);
  await db().prepare(`
    UPDATE managed_services SET
      slug = ?, short_title = ?, card_description = ?, href = ?, image_key = ?,
      image_path = ?, sort_order = ?, show_on_services_page = ?, show_on_home = ?,
      active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    service.slug,
    service.shortTitle,
    service.cardDescription,
    service.href,
    service.imageKey,
    service.imagePath,
    service.sortOrder,
    service.showOnServicesPage ? 1 : 0,
    service.showOnHome ? 1 : 0,
    service.active ? 1 : 0,
    id,
  ).run();
  if (existing.imageKey && existing.imageKey !== service.imageKey) {
    await deleteMediaObject(existing.imageKey, "services/");
  }
  return service;
}

export async function deleteManagedService(id: string) {
  await ensureServicesTable();
  const existing = (await listManagedServices({ includeInactive: true }))
    .find((service) => service.id === id);
  await db().prepare("DELETE FROM managed_services WHERE id = ?").bind(id).run();
  if (existing?.imageKey) await deleteMediaObject(existing.imageKey, "services/");
}

async function deleteMediaObject(key: string, prefix: string) {
  try {
    await deleteMediaReference(key, prefix.replace(/\/$/u, ""));
  } catch (error) {
    console.error(JSON.stringify({
      event: "orphaned_service_media_cleanup_failed",
      error: error instanceof Error ? error.message : "unknown",
    }));
  }
}
