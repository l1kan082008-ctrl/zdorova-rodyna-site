import { env } from "cloudflare:workers";
import {
  defaultPromoSlides,
  promoThemes,
  type PromoSlide,
  type PromoTheme,
} from "../../components/promoData";

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

type BannerRow = {
  id: string;
  eyebrow: string;
  title: string;
  body_text: string;
  note: string;
  accent: string | null;
  action_label: string;
  href: string;
  theme: string;
  is_active: number;
  sort_order: number;
};

const db = () => (env as unknown as { DB: D1DatabaseLike }).DB;
const validThemes = new Set<string>(promoThemes);

async function ensureBannersTable() {
  await db().prepare(`
    CREATE TABLE IF NOT EXISTS home_banners (
      id TEXT PRIMARY KEY,
      eyebrow TEXT NOT NULL,
      title TEXT NOT NULL,
      body_text TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      accent TEXT,
      action_label TEXT NOT NULL,
      href TEXT NOT NULL,
      theme TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const count = await db().prepare("SELECT COUNT(*) AS count FROM home_banners").first<{ count: number }>();
  if (Number(count?.count ?? 0) === 0) {
    for (const slide of defaultPromoSlides) await insertBanner(slide);
  }
}

function rowToBanner(row: BannerRow): PromoSlide {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    text: row.body_text,
    note: row.note,
    accent: row.accent ?? undefined,
    action: row.action_label,
    href: row.href,
    theme: (validThemes.has(row.theme) ? row.theme : "laboratory") as PromoTheme,
    active: Boolean(row.is_active),
    sortOrder: Number(row.sort_order),
  };
}

function required(value: unknown, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`Заповніть поле «${label}».`);
  return text;
}

function normalizeBanner(payload: Partial<PromoSlide>, existing?: PromoSlide): PromoSlide {
  const theme = String(payload.theme ?? existing?.theme ?? "laboratory");
  if (!validThemes.has(theme)) throw new Error("Оберіть доступний візуальний стиль.");
  return {
    id: existing?.id ?? String(payload.id || crypto.randomUUID()),
    eyebrow: required(payload.eyebrow ?? existing?.eyebrow, "Рубрика"),
    title: required(payload.title ?? existing?.title, "Заголовок"),
    text: required(payload.text ?? existing?.text, "Опис"),
    note: String(payload.note ?? existing?.note ?? "").trim(),
    accent: String(payload.accent ?? existing?.accent ?? "").trim() || undefined,
    action: required(payload.action ?? existing?.action, "Текст кнопки"),
    href: required(payload.href ?? existing?.href, "Посилання"),
    theme: theme as PromoTheme,
    active: payload.active ?? existing?.active ?? true,
    sortOrder: Number.isFinite(Number(payload.sortOrder))
      ? Number(payload.sortOrder)
      : existing?.sortOrder ?? 0,
  };
}

async function insertBanner(slide: PromoSlide) {
  await db().prepare(`
    INSERT INTO home_banners (
      id, eyebrow, title, body_text, note, accent, action_label, href,
      theme, is_active, sort_order, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    slide.id, slide.eyebrow, slide.title, slide.text, slide.note,
    slide.accent ?? null, slide.action, slide.href, slide.theme,
    slide.active ? 1 : 0, slide.sortOrder,
  ).run();
}

export async function listBanners(activeOnly = false) {
  await ensureBannersTable();
  const where = activeOnly ? "WHERE is_active = 1" : "";
  const result = await db().prepare(
    `SELECT * FROM home_banners ${where} ORDER BY sort_order, updated_at`,
  ).all<BannerRow>();
  return (result.results ?? []).map(rowToBanner);
}

export async function createBanner(payload: Partial<PromoSlide>) {
  await ensureBannersTable();
  const banner = normalizeBanner(payload);
  await insertBanner(banner);
  return banner;
}

export async function updateBanner(id: string, payload: Partial<PromoSlide>) {
  await ensureBannersTable();
  const existing = (await listBanners()).find((banner) => banner.id === id);
  if (!existing) throw new Error("Банер не знайдено.");
  const banner = normalizeBanner(payload, existing);
  await db().prepare(`
    UPDATE home_banners SET eyebrow = ?, title = ?, body_text = ?, note = ?,
      accent = ?, action_label = ?, href = ?, theme = ?, is_active = ?,
      sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(
    banner.eyebrow, banner.title, banner.text, banner.note,
    banner.accent ?? null, banner.action, banner.href, banner.theme,
    banner.active ? 1 : 0, banner.sortOrder, id,
  ).run();
  return banner;
}

export async function deleteBanner(id: string) {
  await ensureBannersTable();
  await db().prepare("DELETE FROM home_banners WHERE id = ?").bind(id).run();
}
