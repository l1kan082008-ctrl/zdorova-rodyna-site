import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL?.trim();
const exportPath = process.env.D1_EXPORT_PATH?.trim();
if (!connectionString) throw new Error("DATABASE_URL is required.");
if (!exportPath) throw new Error("D1_EXPORT_PATH is required.");

const contentTables = [
  "doctors",
  "home_banners",
  "managed_services",
  "center_locations",
  "branch_services",
  "price_items",
  "price_catalog_meta",
  "bookings",
  "admin_content_revisions",
];
const allowedTables = new Set(contentTables);
const source = await readFile(resolve(exportPath), "utf8");
const inserts = source
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("INSERT INTO "))
  .map((line) => {
    const match = line.match(/^INSERT INTO\s+"([A-Za-z0-9_]+)"/u);
    if (!match || !allowedTables.has(match[1])) return null;
    return {
      table: match[1],
      sql: `${line.replace(/^INSERT INTO\s+"([A-Za-z0-9_]+)"/u, "INSERT INTO $1").replace(/;$/u, "")} ON CONFLICT DO NOTHING`,
    };
  })
  .filter(Boolean);

const sql = neon(connectionString, { fullResults: true });
const occupied = [];
for (const table of contentTables) {
  const result = await sql.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  if (Number(result.rows[0]?.count ?? 0) > 0) occupied.push(table);
}
if (occupied.length && process.env.ALLOW_D1_MERGE !== "true") {
  throw new Error(`Target tables are not empty: ${occupied.join(", ")}. Import stopped.`);
}

for (let index = 0; index < inserts.length; index += 100) {
  const chunk = inserts.slice(index, index + 100);
  await sql.transaction((transaction) =>
    chunk.map((entry) => transaction.query(entry.sql)),
  );
}

const imported = new Map();
for (const entry of inserts) imported.set(entry.table, (imported.get(entry.table) ?? 0) + 1);
console.log(JSON.stringify(Object.fromEntries(imported), null, 2));
