import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const schemaPath = resolve(import.meta.dirname, "../db/schema.postgres.sql");
const schema = await readFile(schemaPath, "utf8");
const statements = schema
  .split(/;\s*(?:\r?\n|$)/u)
  .map((statement) => statement.trim())
  .filter(Boolean);

const sql = neon(connectionString, { fullResults: true });
for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Applied ${statements.length} PostgreSQL schema statements.`);
