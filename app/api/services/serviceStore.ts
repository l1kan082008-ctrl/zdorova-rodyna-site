import { env } from "cloudflare:workers";
import { primaryServiceDetails } from "../../services/serviceData";

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

const db = () => (env as unknown as { DB: D1DatabaseLike }).DB;
const homeSlugs = new Set(["lab", "ct", "mri", "consultation"]);

const cardImageBySlug: Record<string, string> = {
  ct: "/service-cards/ct-glass-v3.jpg",
  mri: "/service-cards/mri-glass-v3.jpg",
  ultrasound: "/service-cards/ultrasound-glass-v3.jpg",
  lab: "/service-cards/lab-glass-v3.jpg",
  consultation: "/service-cards/consultation-glass-v3.jpg",
  cardiology: "/service-cards/cardiology-glass-v3.jpg",
  "home-nurse": "/service-cards/home-nurse-glass-v3.jpg",
  family: "/service-cards/family-glass-v3.jpg",
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
  if (Number(count?.count ?? 0) > 0) return;

  for (const service of getDefaultManagedServices()) {
    await insertService(service);
  }
}

function rowToService(row: ServiceRow): ManagedService {
  return {
    id: row.id,
    slug: row.slug,
    shortTitle: row.short_title,
    cardDescription: row.card_description,
    href: row.href,
    imageKey: row.image_key,
    imagePath: row.image_path,
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
  const href = requiredText(payload.href ?? existing?.href ?? `/services/${slug}`, "Посилання");
  if (!href.startsWith("/") && !href.startsWith("http://") && !href.startsWith("https://")) {
    throw new Error("Посилання має починатися з / або https://.");
  }

  return {
    id: existing?.id ?? String(payload.id || crypto.randomUUID()),
    slug,
    shortTitle: requiredText(payload.shortTitle ?? existing?.shortTitle, "Назва"),
    cardDescription: String(payload.cardDescription ?? existing?.cardDescription ?? "").trim(),
    href,
    imageKey: String(payload.imageKey ?? existing?.imageKey ?? "").trim() || null,
    imagePath: String(payload.imagePath ?? existing?.imagePath ?? "").trim() || null,
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
  const where = options?.includeInactive ? "" : "WHERE active = 1";
  const result = await db().prepare(`SELECT * FROM managed_services ${where} ORDER BY sort_order, short_title`).all<ServiceRow>();
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
  return service;
}

export async function deleteManagedService(id: string) {
  await ensureServicesTable();
  await db().prepare("DELETE FROM managed_services WHERE id = ?").bind(id).run();
}
