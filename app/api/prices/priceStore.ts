import { env } from "cloudflare:workers";
import {
  catalogItems,
  type CategoryId,
  type PriceItem,
} from "../../prices/priceData";
import { officialCatalogSource } from "../../prices/officialPriceData";

type PriceRow = {
  id: string;
  name: string;
  category: CategoryId;
  category_label: string;
  amount: number;
  turnaround: string;
  aliases: string;
  is_active: number;
  sort_order: number;
};

export type ManagedPriceItem = PriceItem & {
  isActive: boolean;
  sortOrder: number;
};

const createPriceItemsTable = `
  CREATE TABLE IF NOT EXISTS price_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    amount INTEGER NOT NULL,
    turnaround TEXT NOT NULL DEFAULT 'Уточнюйте',
    aliases TEXT NOT NULL DEFAULT '[]',
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const createPriceCatalogMetaTable = `
  CREATE TABLE IF NOT EXISTS price_catalog_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

function parseAliases(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((alias): alias is string => typeof alias === "string")
      : [];
  } catch {
    return [];
  }
}

function toPriceItem(row: PriceRow): ManagedPriceItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryLabel: row.category_label,
    amount: row.amount,
    turnaround: row.turnaround || "Уточнюйте",
    aliases: parseAliases(row.aliases),
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
  };
}

export async function ensurePriceItemsTable() {
  await env.DB.batch([
    env.DB.prepare(createPriceItemsTable),
    env.DB.prepare(createPriceCatalogMetaTable),
    env.DB.prepare(
      "CREATE INDEX IF NOT EXISTS price_items_category_idx ON price_items (category, sort_order, name)",
    ),
  ]);

  const tableInfo = await env.DB.prepare("PRAGMA table_info(price_items)").all<{
    name: string;
  }>();
  if (!tableInfo.results.some((column) => column.name === "turnaround")) {
    await env.DB.prepare(
      "ALTER TABLE price_items ADD COLUMN turnaround TEXT NOT NULL DEFAULT 'Уточнюйте'",
    ).run();
  }

  const seededVersion = await env.DB.prepare(
    "SELECT value FROM price_catalog_meta WHERE key = 'official_seed_version'",
  ).first<{ value: string }>();
  if (seededVersion?.value === officialCatalogSource.version) return;

  await env.DB.prepare("DELETE FROM price_items").run();

  const statements = catalogItems.map((item, index) =>
    env.DB.prepare(
      `INSERT OR IGNORE INTO price_items
       (id, name, category, category_label, amount, turnaround, aliases, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ).bind(
      item.id,
      item.name,
      item.category,
      item.categoryLabel,
      item.amount,
      item.turnaround?.trim() || "Уточнюйте",
      JSON.stringify(item.aliases ?? []),
      item.sortOrder ?? index,
    ),
  );

  for (let index = 0; index < statements.length; index += 50) {
    await env.DB.batch(statements.slice(index, index + 50));
  }

  await env.DB.prepare(
    `INSERT INTO price_catalog_meta (key, value, updated_at)
     VALUES ('official_seed_version', ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(officialCatalogSource.version)
    .run();
}

export async function listManagedPriceItems() {
  await ensurePriceItemsTable();
  const result = await env.DB.prepare(
    `SELECT id, name, category, category_label, amount, turnaround, aliases, is_active, sort_order
     FROM price_items
     ORDER BY sort_order, name COLLATE NOCASE`,
  ).all<PriceRow>();

  return result.results.map(toPriceItem);
}

export async function listPublicPriceItems() {
  const items = await listManagedPriceItems();
  return items.filter((item) => item.isActive);
}

export async function createManagedPriceItem(values: {
  name: string;
  category: CategoryId;
  categoryLabel: string;
  amount: number;
  turnaround: string;
  aliases: string[];
  isActive: boolean;
}) {
  await ensurePriceItemsTable();
  const id = `price-${crypto.randomUUID()}`;
  const maximum = await env.DB.prepare(
    "SELECT COALESCE(MAX(sort_order), 0) AS value FROM price_items",
  ).first<{ value: number }>();

  await env.DB.prepare(
    `INSERT INTO price_items
     (id, name, category, category_label, amount, turnaround, aliases, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      values.name,
      values.category,
      values.categoryLabel,
      values.amount,
      values.turnaround,
      JSON.stringify(values.aliases),
      values.isActive ? 1 : 0,
      (maximum?.value ?? 0) + 1,
    )
    .run();

  return id;
}

export async function updateManagedPriceItem(
  id: string,
  values: {
    name: string;
    category: CategoryId;
    categoryLabel: string;
    amount: number;
    turnaround: string;
    aliases: string[];
    isActive: boolean;
    sortOrder: number;
  },
) {
  await ensurePriceItemsTable();
  const result = await env.DB.prepare(
    `UPDATE price_items
     SET name = ?, category = ?, category_label = ?, amount = ?, turnaround = ?, aliases = ?,
         is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      values.name,
      values.category,
      values.categoryLabel,
      values.amount,
      values.turnaround,
      JSON.stringify(values.aliases),
      values.isActive ? 1 : 0,
      values.sortOrder,
      id,
    )
    .run();

  return result.meta.changes > 0;
}
