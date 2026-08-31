import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const doctors = sqliteTable("doctors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  experienceYears: integer("experience_years"),
  branch: text("branch").notNull().default(""),
  description: text("description").notNull().default(""),
  biography: text("biography").notNull().default(""),
  patientGroups: text("patient_groups").notNull().default("[]"),
  schedule: text("schedule").notNull().default("{}"),
  photoKey: text("photo_key").notNull().default(""),
  availabilityStatus: text("availability_status")
    .notNull()
    .default("accepting"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  patientName: text("patient_name").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  doctor: text("doctor").notNull().default(""),
  comment: text("comment").notNull().default(""),
  source: text("source").notNull().default("legacy"),
  consentVersion: text("consent_version").notNull().default(""),
  consentAt: text("consent_at").notNull().default(""),
  retentionUntil: text("retention_until").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const priceItems = sqliteTable("price_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  amount: integer("amount").notNull(),
  turnaround: text("turnaround").notNull().default("Уточнюйте"),
  citoAvailable: integer("cito_available").notNull().default(0),
  citoSurcharge: integer("cito_surcharge").notNull().default(0),
  aliases: text("aliases").notNull().default("[]"),
  isActive: integer("is_active").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const priceCatalogMeta = sqliteTable("price_catalog_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminSessions = sqliteTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  expiresAt: integer("expires_at").notNull(),
  idleExpiresAt: integer("idle_expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
}, (table) => [
  index("admin_sessions_expiry_idx").on(table.expiresAt),
]);

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  fingerprint: text("fingerprint").primaryKey(),
  attempts: integer("attempts").notNull(),
  windowStartedAt: integer("window_started_at").notNull(),
  blockedUntil: integer("blocked_until").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("admin_login_attempts_updated_idx").on(table.updatedAt),
]);

export const publicSubmissionAttempts = sqliteTable("public_submission_attempts", {
  fingerprint: text("fingerprint").primaryKey(),
  attempts: integer("attempts").notNull(),
  windowStartedAt: integer("window_started_at").notNull(),
  blockedUntil: integer("blocked_until").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("public_submission_attempts_updated_idx").on(table.updatedAt),
]);
