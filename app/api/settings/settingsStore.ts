import "server-only";
import { cache } from "react";
import { env } from "@/lib/runtimeEnv";
import type { AppDatabase } from "@/lib/database";
import { defaultSiteSettings, validateSiteSettings, type SiteSettings } from "@/lib/siteSettings";

const initializedDatabases = new WeakMap<AppDatabase, Promise<void>>();

async function settingsDatabase() {
  const database = env.DB;
  if (!database) throw new Error("Settings database is unavailable.");
  let initialization = initializedDatabases.get(database);
  if (!initialization) {
    initialization = database.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY CHECK (id = 'site'),
      settings_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run().then(() => undefined).catch((error: unknown) => {
      initializedDatabases.delete(database);
      throw error;
    });
    initializedDatabases.set(database, initialization);
  }
  await initialization;
  return database;
}

function defaults(): SiteSettings {
  return { ...defaultSiteSettings, hours: [...defaultSiteSettings.hours] };
}

export async function getAdminSiteSettings(): Promise<SiteSettings> {
  const database = await settingsDatabase();
  const row = await database.prepare("SELECT settings_json FROM site_settings WHERE id = ?")
    .bind("site").first<{ settings_json: string }>();
  return row ? validateSiteSettings(JSON.parse(row.settings_json)) : defaults();
}

// React memoizes only within a server render; the next request sees new settings.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return await getAdminSiteSettings();
  } catch {
    return defaults();
  }
});

export async function saveSiteSettings(value: unknown): Promise<SiteSettings> {
  const settings = validateSiteSettings(value);
  const database = await settingsDatabase();
  // One atomic upsert cannot partially update the contact fields.
  await database.prepare(`INSERT INTO site_settings (id, settings_json, updated_at)
    VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET
    settings_json = excluded.settings_json, updated_at = excluded.updated_at`)
    .bind("site", JSON.stringify(settings), new Date().toISOString()).run();
  return settings;
}
