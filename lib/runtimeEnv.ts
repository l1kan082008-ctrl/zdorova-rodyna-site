import { getDatabase, type AppDatabase } from "./database";

export type RuntimeEnvironment = {
  DB: AppDatabase;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_SESSION_SECRET?: string;
  FORM_RATE_LIMIT_SECRET?: string;
  PUBLIC_FORM_RATE_LIMIT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  OPENAI_API_KEY?: string;
  BLOB_READ_WRITE_TOKEN?: string;
};

export const env = new Proxy({} as RuntimeEnvironment, {
  get(_target, property) {
    if (property === "DB") return getDatabase();
    if (typeof property !== "string") return undefined;
    return process.env[property];
  },
});
