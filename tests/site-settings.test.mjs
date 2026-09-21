import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";

// Actual store, authentication and routes; disposable SQLite, no environment or network.
const compiled = new Map();
function loadModule(path, dependencies = {}) {
  if (!compiled.has(path)) compiled.set(path, ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText);
  const loaded = { exports: {} };
  const require = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function("require", "module", "exports", compiled.get(path))(require, loaded, loaded.exports);
  return loaded.exports;
}

const settings = loadModule("../lib/siteSettings.ts");
const requestBody = loadModule("../lib/requestBody.ts");
const session = loadModule("../lib/adminSession.ts", {
  "./adminCookie.ts": loadModule("../lib/adminCookie.ts"),
});
const sessionSecret = "test-only-settings-secret-long-enough-for-hmac";
const valid = () => ({ ...settings.defaultSiteSettings, hours: [...settings.defaultSiteSettings.hours] });

function storeFor(DB) {
  return loadModule("../app/api/settings/settingsStore.ts", {
    "server-only": {}, react: { cache: (callback) => callback },
    "@/lib/runtimeEnv": { env: { DB } }, "@/lib/siteSettings": settings,
  });
}

async function fixture(context) {
  const sqlite = new DatabaseSync(":memory:");
  context.after(() => sqlite.close());
  const sessionSchema = readFileSync(new URL("../db/schema.postgres.sql", import.meta.url), "utf8")
    .match(/CREATE TABLE IF NOT EXISTS admin_sessions \([\s\S]+?\);/u)[0];
  sqlite.exec(sessionSchema);
  const state = { beforeRun: null, commands: [] };
  const prepare = (sql, values = []) => ({
    bind: (...bound) => prepare(sql, bound),
    first: async () => sqlite.prepare(sql).get(...values) ?? null,
    all: async () => ({ results: sqlite.prepare(sql).all(...values) }),
    run: async () => {
      state.beforeRun?.(sql);
      state.commands.push({ sql, values });
      return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } };
    },
  });
  const DB = { prepare, batch: (statements) => Promise.all(statements.map((statement) => statement.run())) };
  const token = await session.createAdminSession(sessionSecret, DB);
  const auth = loadModule("../app/api/admin/adminAuth.ts", {
    "@/lib/runtimeEnv": { env: { DB, ADMIN_SESSION_SECRET: sessionSecret } },
    "@/lib/adminSession": session,
  });
  const store = storeFor(DB);
  const route = loadModule("../app/api/admin/settings/route.ts", {
    "../adminAuth": auth, "../../settings/settingsStore": store,
    "@/lib/requestBody": requestBody, "@/lib/siteSettings": settings,
  });
  const publicRoute = loadModule("../app/api/settings/route.ts", { "./settingsStore": store });
  const request = (method, body, headers = {}) => new Request("https://settings.test/api/admin/settings", {
    method,
    headers: { "content-type": "application/json", origin: "https://settings.test", "sec-fetch-site": "same-origin", cookie: `${session.ADMIN_SESSION_COOKIE}=${token}`, ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { sqlite, DB, state, store, route, publicRoute, request };
}

test("defaults match existing footer and phone links support formatted and local numbers", () => {
  assert.equal(settings.sitePhoneHref(valid().phone), "tel:+380676714444");
  assert.equal(settings.sitePhoneHref("067 671 44 44"), "tel:+380676714444");
  assert.equal(settings.siteViberHref(valid().phone), "viber://chat?number=%2B380676714444");
  assert.deepEqual(settings.validateSiteSettings(valid()), valid());
});

test("validation bounds text, email, phone, working hours and social URL schemes", () => {
  for (const patch of [
    { phone: "+38067<script>" }, { phone: "123" }, { phone: "+1234567890123456" },
    { email: "not-an-email" }, { email: "foo@example.test?subject=bad" },
    { address: "x".repeat(301) }, { address: "Street\nInjected" },
    { hours: [] }, { hours: [""] }, { hours: Array(8).fill("08–19") }, { hours: ["x".repeat(121)] },
    { facebookUrl: "javascript:alert(1)" }, { facebookUrl: "data:text/html,hello" },
    { instagramUrl: "https://user:password@example.test/" },
  ]) assert.throws(() => settings.validateSiteSettings({ ...valid(), ...patch }), settings.SiteSettingsValidationError);
  const cleaned = settings.validateSiteSettings({ ...valid(), phone: `  ${valid().phone}  `, facebookUrl: "", instagramUrl: "" });
  assert.equal(cleaned.phone, valid().phone);
  assert.equal(cleaned.facebookUrl, "");
});

test("empty database reads defaults without seeding rows, then atomic save persists across store instances", async (context) => {
  const { store, sqlite, DB } = await fixture(context);
  assert.deepEqual(await store.getAdminSiteSettings(), valid());
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM site_settings").get().n, 0);
  const changed = { ...valid(), address: "м. Рівне, вул. Тестова, 25", hours: ["Пн–Пт 08:00–18:00"], facebookUrl: "" };
  assert.deepEqual(await store.saveSiteSettings(changed), changed);
  assert.deepEqual(await storeFor(DB).getAdminSiteSettings(), changed);
  await store.saveSiteSettings({ ...changed, email: "new@example.test" });
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM site_settings").get().n, 1);
  assert.throws(() => sqlite.prepare("INSERT INTO site_settings (id, settings_json) VALUES ('other', '{}')").run());
});

test("legacy settings without TikTok or Threads retain all saved contacts and socials", async (context) => {
  const { store, sqlite, route, publicRoute, request } = await fixture(context);
  const legacy = { ...valid(), phone: "+380501112233", email: "saved@example.test", address: "Збережена адреса", hours: ["Пн–Сб 09:00–18:00"], facebookUrl: "https://www.facebook.com/saved-profile", instagramUrl: "https://www.instagram.com/saved-profile/" };
  delete legacy.tiktokUrl;
  delete legacy.threadsUrl;
  await store.getAdminSiteSettings();
  const originalJson = JSON.stringify(legacy);
  sqlite.prepare("INSERT INTO site_settings (id, settings_json) VALUES (?, ?)").run("site", originalJson);
  const expected = { ...legacy, tiktokUrl: "", threadsUrl: "" };
  assert.deepEqual(settings.validateSiteSettings(legacy), expected);
  assert.deepEqual(await store.getAdminSiteSettings(), expected);
  assert.deepEqual((await (await route.GET(request("GET"))).json()).settings, expected);
  assert.deepEqual((await (await publicRoute.GET()).json()).settings, expected);
  assert.equal(sqlite.prepare("SELECT settings_json FROM site_settings WHERE id = 'site'").get().settings_json, originalJson);
});

test("TikTok and Threads save, reload and clear through the authenticated settings API", async (context) => {
  const { route, publicRoute, DB, request } = await fixture(context);
  const changed = { ...valid(), tiktokUrl: "https://www.tiktok.com/@test_clinic", threadsUrl: "https://www.threads.com/@test_clinic" };
  const response = await route.PUT(request("PUT", changed));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).settings, changed);
  assert.deepEqual(await storeFor(DB).getAdminSiteSettings(), changed);
  assert.deepEqual((await (await publicRoute.GET()).json()).settings, changed);
  const cleared = { ...changed, tiktokUrl: "", threadsUrl: "" };
  const clearResponse = await route.PUT(request("PUT", cleared));
  assert.equal(clearResponse.status, 200);
  assert.deepEqual((await clearResponse.json()).settings, cleared);
  assert.deepEqual(await storeFor(DB).getAdminSiteSettings(), cleared);
});

test("TikTok and Threads reject unsafe or malformed URLs without changing saved settings", async (context) => {
  const { route, store, request } = await fixture(context);
  await store.saveSiteSettings(valid());
  for (const key of ["tiktokUrl", "threadsUrl"]) {
    for (const value of ["javascript:alert(1)", "data:text/html,test", "ftp://example.test/profile", "https://user:password@example.test/", "example.test/profile", "https://example.test/\ninjected", `https://example.test/${"x".repeat(500)}`, 123]) {
      const payload = { ...valid(), [key]: value };
      assert.throws(() => settings.validateSiteSettings(payload), settings.SiteSettingsValidationError);
      assert.equal((await route.PUT(request("PUT", payload))).status, 400);
    }
  }
  assert.deepEqual(await store.getAdminSiteSettings(), valid());
});

test("public fallback is safe on absent database or corrupt data, admin reads fail strictly", async (context) => {
  const missing = storeFor(undefined);
  assert.deepEqual(await missing.getSiteSettings(), valid());
  await assert.rejects(missing.getAdminSiteSettings());
  const { store, sqlite } = await fixture(context);
  await store.saveSiteSettings(valid());
  sqlite.prepare("UPDATE site_settings SET settings_json = ?").run('{"phone":"partial"}');
  assert.deepEqual(await store.getSiteSettings(), valid());
  await assert.rejects(store.getAdminSiteSettings());
  const returned = await missing.getSiteSettings();
  returned.hours.push("mutated");
  assert.deepEqual(await missing.getSiteSettings(), valid());
});

test("schema initialization retries after failure instead of caching a rejected promise", async (context) => {
  const { store, state } = await fixture(context);
  state.beforeRun = (sql) => { if (sql.includes("CREATE TABLE IF NOT EXISTS site_settings")) throw new Error("temporary unavailable"); };
  assert.deepEqual(await store.getSiteSettings(), valid());
  await assert.rejects(store.getAdminSiteSettings());
  state.beforeRun = null;
  assert.deepEqual(await store.getAdminSiteSettings(), valid());
});

test("failed single upsert preserves every previously saved field, retry succeeds", async (context) => {
  const { store, state } = await fixture(context);
  await store.saveSiteSettings(valid());
  const changed = { ...valid(), phone: "+380501112233", email: "next@example.test", hours: ["Сб 09:00–12:00"] };
  state.beforeRun = (sql) => { if (sql.includes("INSERT INTO site_settings")) throw new Error("failed write"); };
  await assert.rejects(store.saveSiteSettings(changed));
  assert.deepEqual(await store.getAdminSiteSettings(), valid());
  state.beforeRun = null;
  await store.saveSiteSettings(changed);
  assert.deepEqual(await store.getAdminSiteSettings(), changed);
});

test("real auth denies anonymous and cross-origin mutations, same-origin admin can save and reload", async (context) => {
  const { route, store, request } = await fixture(context);
  assert.equal((await route.GET(request("GET", undefined, { cookie: "" }))).status, 401);
  assert.equal((await route.PUT(request("PUT", valid(), { origin: "https://attacker.test", "sec-fetch-site": "cross-site" }))).status, 401);
  assert.equal((await route.PUT(request("PUT", valid(), { cookie: "" }))).status, 401);
  const changed = { ...valid(), phone: "+380501234567" };
  const response = await route.PUT(request("PUT", changed));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).settings, changed);
  assert.deepEqual((await (await route.GET(request("GET"))).json()).settings, changed);
  assert.deepEqual(await store.getAdminSiteSettings(), changed);
  assert.match(response.headers.get("cache-control"), /no-store/u);
});

test("API rejects partial or oversized JSON and invalid types without updating settings", async (context) => {
  const { route, request, store } = await fixture(context);
  await store.saveSiteSettings(valid());
  assert.equal((await route.PUT(request("PUT", { phone: "+380501234567" }))).status, 400);
  assert.equal((await route.PUT(request("PUT", { ...valid(), extra: "x".repeat(9000) }))).status, 413);
  assert.equal((await route.PUT(request("PUT", valid(), { "content-type": "text/plain" }))).status, 415);
  const malformed = new Request("https://settings.test/api/admin/settings", { method: "PUT", headers: request("PUT").headers, body: "{" });
  assert.equal((await route.PUT(malformed)).status, 400);
  assert.deepEqual(await store.getAdminSiteSettings(), valid());
});

test("API reports storage failure and never returns internal errors or successful defaults to admin", async (context) => {
  const { route, store, sqlite, state, request } = await fixture(context);
  await store.saveSiteSettings(valid());
  state.beforeRun = (sql) => { if (sql.includes("INSERT INTO site_settings")) throw new Error("secret-connection-string"); };
  const response = await route.PUT(request("PUT", { ...valid(), address: "Updated" }));
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /secret-connection-string/u);
  assert.deepEqual(await store.getAdminSiteSettings(), valid());
  sqlite.prepare("UPDATE site_settings SET settings_json = 'broken'").run();
  const read = await route.GET(request("GET"));
  assert.equal(read.status, 500);
  assert.equal((await read.json()).settings, undefined);
});

test("public API reads current settings without response caching and SQL values remain parameter-bound", async (context) => {
  const { store, publicRoute, state } = await fixture(context);
  const changed = { ...valid(), address: "O'Brien Street; SELECT test" };
  await store.saveSiteSettings(changed);
  const response = await publicRoute.GET();
  assert.deepEqual((await response.json()).settings, changed);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const update = state.commands.find((entry) => entry.sql.includes("INSERT INTO site_settings"));
  assert.doesNotMatch(update.sql, /O'Brien/u);
  assert.equal(JSON.parse(update.values[1]).address, changed.address);
  await store.saveSiteSettings({ ...changed, address: "Next address" });
  assert.equal((await (await publicRoute.GET()).json()).settings.address, "Next address");
});

test("deployment schema creates the same isolated singleton table", () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    const schema = readFileSync(new URL("../db/schema.postgres.sql", import.meta.url), "utf8").match(/CREATE TABLE IF NOT EXISTS site_settings \([\s\S]+?\);/u)?.[0];
    assert.ok(schema);
    sqlite.exec(schema);
    sqlite.prepare("INSERT INTO site_settings (id, settings_json) VALUES (?, ?)").run("site", JSON.stringify(valid()));
    assert.throws(() => sqlite.prepare("INSERT INTO site_settings (id, settings_json) VALUES (?, ?)").run("branch", "{}"));
  } finally { sqlite.close(); }
});
