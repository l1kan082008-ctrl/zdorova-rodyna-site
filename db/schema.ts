import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
