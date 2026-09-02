import { env } from "cloudflare:workers";
import {
  catalogItems,
  type CategoryId,
  type PriceItem,
} from "../../prices/priceData";
import { officialCatalogSource } from "../../prices/officialPriceData";
import {
  DEFAULT_CITO_CATEGORIES,
  DEFAULT_CITO_SURCHARGE,
} from "../../prices/citoPolicy";

type PriceRow = {
  id: string;
  name: string;
  category: CategoryId;
  category_label: string;
  amount: number;
  turnaround: string;
  cito_available: number;
  cito_surcharge: number;
  aliases: string;
  is_active: number;
  sort_order: number;
};

export type ManagedPriceItem = PriceItem & {
  isActive: boolean;
  sortOrder: number;
};

export type ImportedPriceItem = {
  id?: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  amount: number;
  turnaround: string;
  citoAvailable: boolean;
  citoSurcharge: number;
  aliases: string[];
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
    cito_available INTEGER NOT NULL DEFAULT 0,
    cito_surcharge INTEGER NOT NULL DEFAULT 0,
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

const DEFAULT_CITO_POLICY_VERSION = "general-biochemistry-hormones-100-v2";

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
    citoAvailable: row.cito_available === 1,
    citoSurcharge: Math.max(0, row.cito_surcharge || 0),
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
  if (!tableInfo.results.some((column) => column.name === "cito_available")) {
    await env.DB.prepare(
      "ALTER TABLE price_items ADD COLUMN cito_available INTEGER NOT NULL DEFAULT 0",
    ).run();
  }
  if (!tableInfo.results.some((column) => column.name === "cito_surcharge")) {
    await env.DB.prepare(
      "ALTER TABLE price_items ADD COLUMN cito_surcharge INTEGER NOT NULL DEFAULT 0",
    ).run();
  }

  const appliedCitoPolicy = await env.DB.prepare(
    "SELECT value FROM price_catalog_meta WHERE key = 'default_cito_policy_version'",
  ).first<{ value: string }>();
  if (appliedCitoPolicy?.value !== DEFAULT_CITO_POLICY_VERSION) {
    await env.DB.prepare(
      `UPDATE price_items
       SET cito_available = 1,
           cito_surcharge = CASE
             WHEN cito_surcharge > 0 THEN cito_surcharge
             ELSE ?
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE category IN (?, ?, ?)`,
    )
      .bind(DEFAULT_CITO_SURCHARGE, ...DEFAULT_CITO_CATEGORIES)
      .run();
    await env.DB.prepare(
      `INSERT INTO price_catalog_meta (key, value, updated_at)
       VALUES ('default_cito_policy_version', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
    )
      .bind(DEFAULT_CITO_POLICY_VERSION)
      .run();
  }

  const seededVersion = await env.DB.prepare(
    "SELECT value FROM price_catalog_meta WHERE key = 'official_seed_version'",
  ).first<{ value: string }>();
  if (seededVersion?.value === officialCatalogSource.version) return;

  await env.DB.prepare("DELETE FROM price_items").run();

  const statements = catalogItems.map((item, index) =>
    env.DB.prepare(
      `INSERT OR IGNORE INTO price_items
       (id, name, category, category_label, amount, turnaround, cito_available, cito_surcharge, aliases, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ).bind(
      item.id,
      item.name,
      item.category,
      item.categoryLabel,
      item.amount,
      item.turnaround?.trim() || "Уточнюйте",
      item.citoAvailable ? 1 : 0,
      Math.max(0, Math.round(item.citoSurcharge ?? 0)),
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
    `SELECT id, name, category, category_label, amount, turnaround, cito_available, cito_surcharge, aliases, is_active, sort_order
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
  citoAvailable: boolean;
  citoSurcharge: number;
  aliases: string[];
  isActive: boolean;
}, options?: { id?: string; sortOrder?: number }) {
  await ensurePriceItemsTable();
  const id = options?.id?.trim() || `price-${crypto.randomUUID()}`;
  const maximum = await env.DB.prepare(
    "SELECT COALESCE(MAX(sort_order), 0) AS value FROM price_items",
  ).first<{ value: number }>();

  await env.DB.prepare(
    `INSERT INTO price_items
     (id, name, category, category_label, amount, turnaround, cito_available, cito_surcharge, aliases, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      values.name,
      values.category,
      values.categoryLabel,
      values.amount,
      values.turnaround,
      values.citoAvailable ? 1 : 0,
      values.citoAvailable ? values.citoSurcharge : 0,
      JSON.stringify(values.aliases),
      values.isActive ? 1 : 0,
      Number.isFinite(options?.sortOrder)
        ? Math.max(0, Math.round(options?.sortOrder ?? 0))
        : (maximum?.value ?? 0) + 1,
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
    citoAvailable: boolean;
    citoSurcharge: number;
    aliases: string[];
    isActive: boolean;
    sortOrder: number;
  },
) {
  await ensurePriceItemsTable();
  const result = await env.DB.prepare(
    `UPDATE price_items
     SET name = ?, category = ?, category_label = ?, amount = ?, turnaround = ?,
         cito_available = ?, cito_surcharge = ?, aliases = ?, is_active = ?, sort_order = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      values.name,
      values.category,
      values.categoryLabel,
      values.amount,
      values.turnaround,
      values.citoAvailable ? 1 : 0,
      values.citoAvailable ? values.citoSurcharge : 0,
      JSON.stringify(values.aliases),
      values.isActive ? 1 : 0,
      values.sortOrder,
      id,
    )
    .run();

  return result.meta.changes > 0;
}

export async function deleteManagedPriceItem(id: string) {
  await ensurePriceItemsTable();
  const result = await env.DB.prepare("DELETE FROM price_items WHERE id = ?")
    .bind(id)
    .run();

  return result.meta.changes > 0;
}

function getImportMatchKey(name: string, category: CategoryId) {
  return `${category}::${name.trim().toLocaleLowerCase("uk-UA")}`;
}

export async function importManagedPriceItems(values: ImportedPriceItem[]) {
  await ensurePriceItemsTable();

  const existing = await listManagedPriceItems();
  const existingIds = new Set(existing.map((item) => item.id));
  const existingByName = new Map(
    existing.map((item) => [
      getImportMatchKey(item.name, item.category),
      item.id,
    ]),
  );
  const selectedIds = new Set<string>();
  const selectedKeys = new Set<string>();
  let created = 0;
  let updated = 0;

  const statements = values.map((item) => {
    const matchKey = getImportMatchKey(item.name, item.category);
    if (selectedKeys.has(matchKey)) {
      throw new Error(`Позиція «${item.name}» дублюється у файлі`);
    }
    selectedKeys.add(matchKey);

    const matchedId =
      (item.id && existingIds.has(item.id) ? item.id : undefined) ??
      existingByName.get(matchKey);
    const id = matchedId ?? `price-${crypto.randomUUID()}`;

    if (selectedIds.has(id)) {
      throw new Error(`Позиція «${item.name}» дублюється у файлі`);
    }

    selectedIds.add(id);
    if (matchedId) updated += 1;
    else created += 1;

    return env.DB.prepare(
      `INSERT INTO price_items
       (id, name, category, category_label, amount, turnaround, cito_available, cito_surcharge, aliases, is_active, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         category = excluded.category,
         category_label = excluded.category_label,
         amount = excluded.amount,
         turnaround = excluded.turnaround,
         cito_available = excluded.cito_available,
         cito_surcharge = excluded.cito_surcharge,
         aliases = excluded.aliases,
         is_active = excluded.is_active,
         sort_order = excluded.sort_order,
         updated_at = CURRENT_TIMESTAMP`,
    ).bind(
      id,
      item.name,
      item.category,
      item.categoryLabel,
      item.amount,
      item.turnaround,
      item.citoAvailable ? 1 : 0,
      item.citoAvailable ? item.citoSurcharge : 0,
      JSON.stringify(item.aliases),
      item.isActive ? 1 : 0,
      item.sortOrder,
    );
  });

  for (let index = 0; index < statements.length; index += 50) {
    await env.DB.batch(statements.slice(index, index + 50));
  }

  return { created, updated };
}
