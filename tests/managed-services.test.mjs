import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";

// These checks use disposable SQLite only, without environment files or network access.
function loadModule(path, dependencies = {}, globals = {}) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: path,
  }).outputText;
  const loaded = { exports: {} };
  const require = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unexpected test dependency: ${name}`);
  };
  new Function("require", "module", "exports", ...Object.keys(globals), compiled)(
    require, loaded, loaded.exports, ...Object.values(globals),
  );
  return loaded.exports;
}

const initialization = loadModule("../lib/initializeOnce.ts");
const serviceData = loadModule("../app/services/serviceData.ts");
const publicUrl = loadModule("../lib/publicUrl.ts");

function storeFor(DB, bootstrap = false) {
  return loadModule("../app/api/services/serviceStore.ts", {
    "../../../lib/initializeOnce": initialization,
    "@/lib/runtimeEnv": { env: { DB } },
    "../../services/serviceData": serviceData,
    "@/lib/publicUrl": publicUrl,
    "@/lib/mediaStorage": {
      deleteMediaReference: async () => {},
      normalizeMediaReference: (value) => value || "",
    },
  }, { process: { env: { BOOTSTRAP_DEFAULT_CONTENT: String(bootstrap) } } });
}

function fixture(context) {
  const sqlite = new DatabaseSync(":memory:");
  context.after(() => sqlite.close());
  const database = { sqlite, beforeRun: null };
  const execute = ({ sql, values }) => {
    database.beforeRun?.(sql);
    return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } };
  };
  const prepare = (sql, values = []) => ({
    sql, values,
    bind: (...bound) => prepare(sql, bound),
    all: async () => ({ results: sqlite.prepare(sql).all(...values) }),
    first: async () => sqlite.prepare(sql).get(...values) ?? null,
    run: async () => execute({ sql, values }),
  });
  const DB = {
    prepare,
    batch: async (statements) => {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map(execute);
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
  sqlite.exec(readFileSync(new URL("../db/schema.postgres.sql", import.meta.url), "utf8")
    .match(/CREATE TABLE IF NOT EXISTS managed_services \([\s\S]+?\);/)[0]);
  return { ...database, DB, control: database, store: storeFor(DB) };
}

function insert(sqlite, service) {
  sqlite.prepare(`INSERT INTO managed_services (
    id, slug, short_title, card_description, href, image_key, image_path,
    sort_order, show_on_services_page, show_on_home, active
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(service.id, service.slug, service.shortTitle, service.cardDescription,
      service.href, service.imageKey, service.imagePath, service.sortOrder,
      Number(service.showOnServicesPage), Number(service.showOnHome), Number(service.active));
}

function seedLegacy(sqlite, store) {
  for (const service of store.getDefaultManagedServices().filter((item) => item.slug !== "holter")) {
    insert(sqlite, service);
  }
}

function holterDefaults(store, changes = {}) {
  return { ...store.getDefaultManagedServices().find((item) => item.slug === "holter"), ...changes };
}

test("defaults include one Holter card for both service sections with its glass artwork", () => {
  const defaults = storeFor(undefined).getDefaultManagedServices();
  const cards = defaults.filter((item) => item.slug === "holter");
  assert.equal(cards.length, 1);
  assert.equal(cards[0].href, "/services/holter");
  assert.equal(cards[0].imagePath, "/service-cards/holter-glass-v3.webp");
  assert.equal(cards[0].active, true);
  assert.equal(cards[0].showOnServicesPage, true);
  assert.equal(cards[0].showOnHome, true);
  assert.ok(defaults.indexOf(cards[0]) > defaults.findIndex((item) => item.slug === "cardiology"));
});

test("an unbootstrapped empty catalogue stays empty", async (context) => {
  const { DB, store } = fixture(context);
  assert.deepEqual(await store.listManagedServices(), []);
  assert.deepEqual(await storeFor(DB).listManagedServices(), []);
});

for (const artwork of [
  {
    name: "legacy screening default", slug: "screening-40", imageKey: null,
    imagePath: "/service-cards/family-glass-v3.jpg",
    expected: "/service-cards/screening-40-glass-v1.webp",
  },
  {
    name: "uploaded screening image", slug: "screening-40", imageKey: "services/custom.webp",
    imagePath: "/service-cards/family-glass-v3.jpg", expected: "/service-cards/family-glass-v3.jpg",
  },
  {
    name: "custom screening image path", slug: "screening-40", imageKey: null,
    imagePath: "/custom-screening.webp", expected: "/custom-screening.webp",
  },
  {
    name: "cleared screening image", slug: "screening-40", imageKey: null,
    imagePath: null, expected: null,
  },
  {
    name: "family service image", slug: "family", imageKey: null,
    imagePath: "/service-cards/family-glass-v3.jpg", expected: "/service-cards/family-glass-v3.jpg",
  },
]) {
  test(`artwork resolution preserves stored data and custom settings: ${artwork.name}`, async (context) => {
    const { DB, sqlite } = fixture(context);
    await storeFor(DB, true).listManagedServices();
    sqlite.prepare(`UPDATE managed_services SET image_key = ?, image_path = ?,
      short_title = 'Власна назва', active = 0, show_on_home = 1,
      show_on_services_page = 0, sort_order = 77 WHERE slug = ?`)
      .run(artwork.imageKey, artwork.imagePath, artwork.slug);
    const before = sqlite.prepare("SELECT * FROM managed_services ORDER BY id").all();

    const services = await storeFor(DB).listManagedServices({ includeInactive: true });
    const service = services.find((item) => item.slug === artwork.slug);
    assert.equal(service.imagePath, artwork.expected);
    assert.equal(service.imageKey, artwork.imageKey);
    assert.equal(service.shortTitle, "Власна назва");
    assert.equal(service.active, false);
    assert.equal(service.showOnHome, true);
    assert.equal(service.showOnServicesPage, false);
    assert.equal(service.sortOrder, 77);
    assert.deepEqual(sqlite.prepare("SELECT * FROM managed_services ORDER BY id").all(), before);
  });
}

test("fresh bootstrap and subsequent starts retain only one Holter card", async (context) => {
  const { DB, sqlite } = fixture(context);
  const initial = await storeFor(DB, true).listManagedServices();
  const restarted = await storeFor(DB, true).listManagedServices();
  assert.equal(initial.length, serviceData.primaryServiceDetails.length);
  assert.deepEqual(restarted, initial);
  assert.equal(restarted.filter((item) => item.slug === "holter").length, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM service_migrations").get().count, 2);
});

test("legacy catalogue gains Holter without changing other cards or their custom order", async (context) => {
  const { sqlite, store } = fixture(context);
  seedLegacy(sqlite, store);
  sqlite.exec("UPDATE managed_services SET sort_order = 45, short_title = 'Власна назва', active = 0 WHERE slug = 'ct'");
  const original = sqlite.prepare("SELECT * FROM managed_services ORDER BY id").all();
  const services = await store.listManagedServices({ includeInactive: true });
  const added = services.find((item) => item.slug === "holter");
  assert.equal(added.sortOrder, 46);
  assert.equal(added.showOnHome, true);
  assert.equal(added.showOnServicesPage, true);
  assert.deepEqual(sqlite.prepare("SELECT * FROM managed_services WHERE slug <> 'holter' ORDER BY id").all(), original);
});

test("an existing hidden and edited Holter is preserved exactly", async (context) => {
  const { sqlite, store } = fixture(context);
  seedLegacy(sqlite, store);
  insert(sqlite, holterDefaults(store, { id: "custom-holter", shortTitle: "Своя назва",
    cardDescription: "Свій опис", sortOrder: 3, imagePath: "/custom.jpg",
    showOnHome: false, showOnServicesPage: false, active: false }));
  const before = sqlite.prepare("SELECT * FROM managed_services ORDER BY id").all();
  assert.equal((await store.listManagedServices()).some((item) => item.slug === "holter"), false);
  assert.deepEqual(sqlite.prepare("SELECT * FROM managed_services ORDER BY id").all(), before);
});

test("a custom card already linking to Holter is not duplicated", async (context) => {
  const { sqlite, store } = fixture(context);
  seedLegacy(sqlite, store);
  insert(sqlite, holterDefaults(store, { id: "rhythm", slug: "rhythm", href: "/services/holter?from=services#details",
    showOnHome: false, showOnServicesPage: false, active: false }));
  const before = sqlite.prepare("SELECT * FROM managed_services ORDER BY id").all();
  await store.listManagedServices({ includeInactive: true });
  assert.deepEqual(sqlite.prepare("SELECT * FROM managed_services ORDER BY id").all(), before);
});

test("later visibility changes and deletion survive cold starts", async (context) => {
  const { DB, sqlite, store } = fixture(context);
  seedLegacy(sqlite, store);
  await store.listManagedServices();
  await store.updateManagedService("holter", { active: false, showOnHome: false, showOnServicesPage: false });
  assert.equal((await storeFor(DB).listManagedServices()).some((item) => item.slug === "holter"), false);
  await store.deleteManagedService("holter");
  assert.equal((await storeFor(DB).listManagedServices({ includeInactive: true })).some((item) => item.slug === "holter"), false);
});

test("migration writes roll back together and a transient failure can be retried", async (context) => {
  const { sqlite, store, control } = fixture(context);
  seedLegacy(sqlite, store);
  control.beforeRun = (sql) => {
    if (/INSERT INTO service_migrations/.test(sql)) throw new Error("simulated storage failure");
  };
  await assert.rejects(store.listManagedServices(), /simulated storage failure/);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM managed_services WHERE slug = 'holter'").get().count, 0);
  control.beforeRun = null;
  assert.equal((await store.listManagedServices()).filter((item) => item.slug === "holter").length, 1);
});

test("concurrent first reads converge to one card and one marker per migration", async (context) => {
  const { DB, sqlite, store } = fixture(context);
  seedLegacy(sqlite, store);
  const [first, second] = await Promise.all([
    store.listManagedServices(), storeFor(DB).listManagedServices(),
  ]);
  assert.equal(first.filter((item) => item.slug === "holter").length, 1);
  assert.deepEqual(first, second);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM service_migrations").get().count, 2);
});

test("the PostgreSQL adapter binds each migration in its own transaction", async (context) => {
  const { sqlite, store: defaults } = fixture(context);
  seedLegacy(sqlite, defaults);
  const queries = [];
  let transactions = 0;
  const client = {
    query: async (sql, values = []) => {
      queries.push({ sql, values });
      assert.doesNotMatch(sql, /\?/);
      const parameters = Array.from(sql.matchAll(/\$(\d+)/g), (match) => Number(match[1]));
      assert.equal(parameters.length ? Math.max(...parameters) : 0, values.length);
      const statement = sqlite.prepare(sql.replace(/\$\d+/g, "?"));
      if (/^\s*SELECT/.test(sql)) return { rows: statement.all(...values), rowCount: 0 };
      return { rows: [], rowCount: Number(statement.run(...values).changes) };
    },
    transaction: async (callback) => {
      transactions++;
      sqlite.exec("BEGIN");
      try {
        const results = await Promise.all(callback(client));
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
  const { getDatabase } = loadModule("../lib/database.ts", {
    "@neondatabase/serverless": { neon: () => client },
  }, { process: { env: { DATABASE_URL: "postgresql://test.invalid/no-connection" } } });
  const services = await storeFor(getDatabase()).listManagedServices();
  assert.equal(services.filter((item) => item.slug === "holter").length, 1);
  assert.equal(transactions, 2);
  assert.ok(queries.some(({ sql, values }) => sql.includes("INSERT INTO managed_services")
    && values.includes("/services/holter?%")));
});
