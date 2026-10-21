import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";

// Exercise the production store SQL against disposable SQLite; never load environment files.
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
const promoData = loadModule("../app/components/promoData.ts");
const publicUrl = loadModule("../lib/publicUrl.ts");
const mediaStorage = {
  deleteMediaReference: async () => {},
  normalizeMediaReference: (value) => value || "",
};

const kinds = [
  {
    name: "service", table: "managed_services", migrations: "service_migrations",
    marker: "screening-40-service-card-v1", path: "../app/api/services/serviceStore.ts",
    list: (store) => store.listManagedServices({ includeInactive: true }),
    defaults: (store) => store.getDefaultManagedServices(),
    update: (store, id, changes) => store.updateManagedService(id, changes),
    remove: (store, id) => store.deleteManagedService(id),
    title: "shortTitle", titleColumn: "short_title", activeColumn: "active",
    mapping: {
      id: "id", slug: "slug", short_title: "shortTitle", card_description: "cardDescription",
      href: "href", image_key: "imageKey", image_path: "imagePath", sort_order: "sortOrder",
      show_on_services_page: "showOnServicesPage", show_on_home: "showOnHome", active: "active",
    },
  },
  {
    name: "banner", table: "home_banners", migrations: "banner_migrations",
    marker: "screening-40-banner-v1", path: "../app/api/banners/bannerStore.ts",
    list: (store) => store.listBanners(), defaults: () => promoData.defaultPromoSlides,
    update: (store, id, changes) => store.updateBanner(id, changes),
    remove: (store, id) => store.deleteBanner(id),
    title: "title", titleColumn: "title", activeColumn: "is_active",
    mapping: {
      id: "id", eyebrow: "eyebrow", title: "title", body_text: "text", note: "note", accent: "accent",
      action_label: "action", href: "href", theme: "theme", image_key: "imageKey",
      is_active: "active", sort_order: "sortOrder",
    },
  },
];

function storeFor(kind, DB, bootstrap = false) {
  return loadModule(kind.path, {
    "../../../lib/initializeOnce": initialization,
    "@/lib/runtimeEnv": { env: { DB } },
    "../../services/serviceData": serviceData,
    "../../components/promoData": promoData,
    "@/lib/publicUrl": publicUrl,
    "@/lib/mediaStorage": mediaStorage,
  }, { process: { env: { BOOTSTRAP_DEFAULT_CONTENT: String(bootstrap) } } });
}

async function fixture(context, kind) {
  const sqlite = new DatabaseSync(":memory:");
  context.after(() => sqlite.close());
  const control = { beforeRun: null };
  const execute = ({ sql, values }) => {
    control.beforeRun?.(sql);
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
  // The disabled bootstrap creates only the empty schema, matching production behavior.
  await kind.list(storeFor(kind, DB));
  const store = storeFor(kind, DB);
  const insert = (item) => {
    const fields = Object.keys(kind.mapping);
    const values = Object.values(kind.mapping).map((key) => {
      const value = item[key];
      return typeof value === "boolean" ? Number(value) : value ?? null;
    });
    sqlite.prepare(`INSERT INTO ${kind.table} (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`).run(...values);
  };
  const defaults = kind.defaults(store);
  const screening = defaults.find((item) => item.id === "screening-40");
  assert.ok(screening, `${kind.name} default exists`);
  const seedLegacy = () => {
    defaults.filter((item) => item.id !== screening.id).forEach(insert);
    if (kind.name === "service") {
      sqlite.exec("CREATE TABLE IF NOT EXISTS service_migrations (id TEXT PRIMARY KEY)");
      sqlite.prepare("INSERT INTO service_migrations (id) VALUES (?)").run("holter-service-card-v1");
    }
  };
  const rows = () => sqlite.prepare(`SELECT * FROM ${kind.table} ORDER BY id`).all();
  return { sqlite, DB, store, control, insert, defaults, screening, seedLegacy, rows };
}

test("banner: PostgreSQL adapter binds migration values in a single transaction", async (context) => {
  const kind = kinds.find((item) => item.name === "banner");
  const { sqlite, seedLegacy } = await fixture(context, kind);
  seedLegacy();
  const queries = [];
  let transactions = 0;
  const client = {
    query: async (sql, values = []) => {
      queries.push({ sql, values });
      assert.doesNotMatch(sql, /\?/);
      const parameters = Array.from(sql.matchAll(/\$(\d+)/g), (match) => Number(match[1]));
      assert.equal(parameters.length ? Math.max(...parameters) : 0, values.length);
      if (sql.includes("information_schema.columns")) {
        return { rows: sqlite.prepare("PRAGMA table_info(home_banners)").all(), rowCount: 0 };
      }
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
  const banners = await kind.list(storeFor(kind, getDatabase()));
  assert.equal(banners.filter((item) => item.id === "screening-40").length, 1);
  assert.equal(transactions, 1);
  assert.ok(queries.some(({ sql, values }) => sql.includes("INSERT INTO home_banners")
    && values.includes("/services/screening-40?%")));
});

for (const kind of kinds) {
  test(`${kind.name}: no bootstrap means an empty catalogue stays empty`, async (context) => {
    const { DB, store } = await fixture(context, kind);
    assert.deepEqual(await kind.list(store), []);
    assert.deepEqual(await kind.list(storeFor(kind, DB)), []);
  });

  test(`${kind.name}: fresh bootstrap and restarts contain exactly one screening entry`, async (context) => {
    const { DB, defaults } = await fixture(context, kind);
    const first = await kind.list(storeFor(kind, DB, true));
    const restarted = await kind.list(storeFor(kind, DB, true));
    assert.equal(first.length, defaults.length);
    assert.deepEqual(restarted, first);
    const [entry] = first.filter((item) => item.id === "screening-40");
    assert.equal(entry.href, "/services/screening-40");
    assert.equal(entry.active, true);
    if (kind.name === "service") {
      assert.equal(entry.showOnServicesPage, true);
      assert.equal(entry.showOnHome, false);
      assert.equal(entry.imagePath, "/service-cards/screening-40-glass-v1.webp");
    } else assert.equal(entry.theme, "screening");
  });

  test(`${kind.name}: legacy content gains screening without changing existing records or order`, async (context) => {
    const { sqlite, store, seedLegacy, rows } = await fixture(context, kind);
    seedLegacy();
    sqlite.exec(`UPDATE ${kind.table} SET sort_order = -7, ${kind.titleColumn} = 'Власний текст', ${kind.activeColumn} = 0 WHERE id = 'mri'`);
    const before = rows();
    const result = await kind.list(store);
    const entry = result.find((item) => item.id === "screening-40");
    assert.ok(entry);
    const oldOrders = before.map((row) => row.sort_order);
    assert.equal(entry.sortOrder, kind.name === "banner" ? Math.min(...oldOrders) - 1 : Math.max(...oldOrders) + 1);
    assert.deepEqual(rows().filter((row) => row.id !== "screening-40"), before);
  });

  test(`${kind.name}: an edited and hidden existing screening entry remains unchanged`, async (context) => {
    const { store, seedLegacy, screening, insert, rows } = await fixture(context, kind);
    seedLegacy();
    insert({ ...screening, [kind.title]: "Мій скринінг", active: false, sortOrder: 88 });
    const before = rows();
    await kind.list(store);
    assert.deepEqual(rows(), before);
  });

  test(`${kind.name}: route aliases with a trailing slash, query or hash do not produce duplicates`, async (context) => {
    for (const suffix of ["", "/", "?from=home#details", "#details", "/?from=home", "/#details"]) {
      const { store, seedLegacy, screening, insert, rows } = await fixture(context, kind);
      seedLegacy();
      insert({ ...screening, id: "custom-screening", slug: "custom-screening", href: `${screening.href}${suffix}`, active: false });
      const before = rows();
      await kind.list(store);
      assert.deepEqual(rows(), before, `preserve alias ${suffix}`);
    }
  });

  test(`${kind.name}: later edits, hiding and deletion survive cold starts`, async (context) => {
    const { DB, store, seedLegacy } = await fixture(context, kind);
    seedLegacy();
    await kind.list(store);
    await kind.update(store, "screening-40", { [kind.title]: "Змінено", active: false });
    const modified = (await kind.list(storeFor(kind, DB))).find((item) => item.id === "screening-40");
    assert.equal(modified[kind.title], "Змінено");
    assert.equal(modified.active, false);
    await kind.remove(store, "screening-40");
    assert.equal((await kind.list(storeFor(kind, DB))).some((item) => item.id === "screening-40"), false);
  });

  test(`${kind.name}: screening insert and migration marker roll back together and retry`, async (context) => {
    const { sqlite, store, seedLegacy, control } = await fixture(context, kind);
    seedLegacy();
    control.beforeRun = (sql) => {
      if (sql.includes(`INSERT INTO ${kind.migrations}`)) throw new Error("simulated failure");
    };
    await assert.rejects(kind.list(store), /simulated failure/);
    assert.equal(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${kind.table} WHERE id = 'screening-40'`).get().count, 0);
    control.beforeRun = null;
    assert.equal((await kind.list(store)).filter((item) => item.id === "screening-40").length, 1);
  });

  test(`${kind.name}: concurrent first reads converge to one entry and marker`, async (context) => {
    const { sqlite, DB, store, seedLegacy } = await fixture(context, kind);
    seedLegacy();
    const [first, second] = await Promise.all([kind.list(store), kind.list(storeFor(kind, DB))]);
    assert.deepEqual(first, second);
    assert.equal(first.filter((item) => item.id === "screening-40").length, 1);
    assert.equal(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${kind.migrations} WHERE id = ?`).get(kind.marker).count, 1);
  });
}
