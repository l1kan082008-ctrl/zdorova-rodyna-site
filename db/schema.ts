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
