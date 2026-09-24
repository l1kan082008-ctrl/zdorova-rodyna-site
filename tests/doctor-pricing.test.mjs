import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";

// Run actual stores and route handlers against disposable SQLite only.
// No environment files, production credentials, network, or external database are used.
const compiled = new Map();
function loadModule(path, dependencies = {}, globals = {}) {
  if (!compiled.has(path)) {
    compiled.set(path, ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      fileName: path,
    }).outputText);
  }
  const loaded = { exports: {} };
  const require = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unexpected test dependency: ${name}`);
  };
  new Function("require", "module", "exports", ...Object.keys(globals), compiled.get(path))(
    require, loaded, loaded.exports, ...Object.values(globals),
  );
  return loaded.exports;
}

const pricing = loadModule("../lib/doctorPricing.ts");
const publication = loadModule("../lib/doctorPublication.ts");
const initialization = loadModule("../lib/initializeOnce.ts");
const requestBody = loadModule("../lib/requestBody.ts");
const doctorData = loadModule("../app/doctors/doctorData.ts", {}, { process: { env: { NODE_ENV: "development" } } });
const auth = {
  isAuthorizedAdmin: async () => true,
  unauthorizedAdminResponse: () => Response.json({ error: "Unauthorized" }, { status: 401 }),
};
const identity = { name: "Тестовий лікар", specialty: "Кардіолог, терапевт" };
const branch = "м. Рівне, вул. Володимира Стельмаха (Курчатова), 18-М";

function temporaryDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  const commands = [];
  const database = { sqlite, commands, beforeRun: null };
  const prepare = (sql, values = []) => ({
    bind: (...bound) => prepare(sql, bound),
    all: async () => { commands.push(sql); return { results: sqlite.prepare(sql).all(...values) }; },
    first: async () => { commands.push(sql); return sqlite.prepare(sql).get(...values) ?? null; },
    run: async () => {
      commands.push(sql);
      database.beforeRun?.(sql);
      return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } };
    },
  });
  database.DB = { prepare, batch: async (statements) => Promise.all(statements.map((statement) => statement.run())) };
  const revisionSchema = readFileSync(new URL("../db/schema.postgres.sql", import.meta.url), "utf8")
    .match(/CREATE TABLE IF NOT EXISTS admin_content_revisions \([\s\S]+?\);/)[0];
  sqlite.exec(revisionSchema);
  return database;
}

function storeFor(DB, bootstrap = false) {
  return loadModule("../app/api/doctors/doctorStore.ts", {
    "../../../lib/initializeOnce": initialization,
    "@/lib/runtimeEnv": { env: { DB } },
    "@/lib/doctorPricing": pricing,
    "@/lib/doctorPublication": publication,
    "../../doctors/doctorData": doctorData,
  }, { process: { env: { BOOTSTRAP_DEFAULT_CONTENT: String(bootstrap) } } });
}

function fixture(context) {
  const database = temporaryDatabase();
  context.after(() => database.sqlite.close());
  const store = storeFor(database.DB);
  const revisions = loadModule("../app/api/admin/revisions/revisionStore.ts", {
    "server-only": {}, "@/lib/runtimeEnv": { env: { DB: database.DB } },
  });
  const common = {
    "@/lib/requestBody": requestBody,
    "@/lib/doctorPricing": pricing,
    "@/lib/doctorPublication": publication,
    "../adminAuth": auth,
    "../../doctors/doctorStore": store,
    "../../../doctors/doctorData": doctorData,
  };
  const route = loadModule("../app/api/admin/doctors/route.ts", {
    ...common, "../revisions/revisionStore": revisions,
  });
  const restore = loadModule("../app/api/admin/revisions/route.ts", {
    ...common,
    "./revisionStore": revisions,
    "../../banners/bannerStore": {},
    "../../locations/locationStore": {},
    "../../prices/priceStore": {},
    "../../services/serviceStore": {},
  });
  const publicDoctors = loadModule("../app/api/doctors/publicDoctors.ts", {
    "server-only": {}, "@/lib/runtimeEnv": { env: { DB: database.DB } },
    "../../doctors/doctorData": doctorData, "./doctorStore": store,
  }, { process: { env: { NODE_ENV: "production" } } });
  const publicRoute = loadModule("../app/api/doctors/route.ts", { "./publicDoctors": publicDoctors });
  const notFound = () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); };
  const profile = loadModule("../app/doctors/[id]/page.tsx", {
    "next/navigation": { notFound },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    "../../components/SiteChrome": { SiteHeader: () => null, SiteFooter: () => null },
    "../../api/doctors/publicDoctors": publicDoctors,
    "./DoctorProfileDetails": { DoctorProfileDetails: () => null },
  });
  return { ...database, store, route, revisions, restore, publicRoute, profile };
}

function request(method, body) {
  return new Request("http://test.invalid/api/admin/doctors", {
    method, headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}
function legacyTable(sqlite, primary = true) {
  sqlite.exec(`CREATE TABLE doctors (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, specialty TEXT NOT NULL,
    experience_years INTEGER, ${primary ? "consultation_price INTEGER," : ""}
    branch TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
    biography TEXT NOT NULL DEFAULT '', patient_groups TEXT NOT NULL DEFAULT '[]',
    schedule TEXT NOT NULL DEFAULT '{}', photo_key TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  sqlite.prepare("INSERT INTO doctors (id, name, specialty) VALUES (?, ?, ?)")
    .run("voloshko-tetiana", identity.name, identity.specialty);
  if (primary) sqlite.exec("UPDATE doctors SET consultation_price = 700");
}
async function saveRevision(revisions, snapshot) {
  const existingIds = new Set((await revisions.listContentRevisions("doctor", snapshot.id)).map((item) => item.id));
  await revisions.recordContentRevision({ entityType: "doctor", entityId: snapshot.id,
    entityLabel: snapshot.name, action: "update", snapshot, changedFields: ["repeatConsultationPrice"] });
  return (await revisions.listContentRevisions("doctor", snapshot.id)).find((item) => !existingIds.has(item.id));
}
async function restoreRevision(restore, doctorId, revisionId) {
  return restore.POST(request("POST", { entityType: "doctor", entityId: doctorId, revisionId }));
}

test("create, update, reload and clear both consultation prices without default enrichment", async (context) => {
  const { DB, store } = fixture(context);
  const doctor = await store.createDoctor({ ...identity, id: "voloshko-tetiana", branch,
    consultationPrice: 700, repeatConsultationPrice: 500 });
  assert.equal(doctor.repeatConsultationPrice, 500);
  await store.updateDoctor(doctor.id, { ...doctor, consultationPrice: 850, repeatConsultationPrice: 600 });
  assert.equal((await storeFor(DB).getDoctorById(doctor.id)).repeatConsultationPrice, 600);
  await store.updateDoctor(doctor.id, { ...doctor, consultationPrice: null, repeatConsultationPrice: null });
  const reloaded = await storeFor(DB, true).getDoctorById(doctor.id);
  assert.equal(reloaded.consultationPrice, null);
  assert.equal(reloaded.repeatConsultationPrice, null);
  assert.equal(reloaded.branch, branch);
});

test("legacy rows gain nullable price columns without overwriting primary prices or inserting demo prices", async (context) => {
  const { sqlite, DB } = fixture(context);
  legacyTable(sqlite);
  const reloaded = await storeFor(DB, true).getDoctorById("voloshko-tetiana");
  assert.equal(reloaded.consultationPrice, 700);
  assert.equal(reloaded.repeatConsultationPrice, null);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM doctors").get().n, 1);
});

test("legacy schema without either price migrates and repeated initialization is harmless", async (context) => {
  const { sqlite, DB } = fixture(context);
  legacyTable(sqlite, false);
  for (let run = 0; run < 2; run++) {
    const doctor = await storeFor(DB).getDoctorById("voloshko-tetiana");
    assert.equal(doctor.consultationPrice, null);
    assert.equal(doctor.repeatConsultationPrice, null);
  }
});

test("simultaneous server initializations tolerate a concurrently added repeat price column", async (context) => {
  const database = temporaryDatabase();
  context.after(() => database.sqlite.close());
  legacyTable(database.sqlite);
  database.beforeRun = (sql) => {
    if (sql === "ALTER TABLE doctors ADD COLUMN repeat_consultation_price INTEGER") {
      database.beforeRun = null;
      database.sqlite.exec(sql);
      throw new Error("duplicate column: another instance already added it");
    }
  };
  assert.equal((await storeFor(database.DB).getDoctorById("voloshko-tetiana")).repeatConsultationPrice, null);
});

test("fresh explicit development bootstrap stores repeat prices when defaults provide them", async (context) => {
  const { DB } = fixture(context);
  assert.equal((await storeFor(DB, true).getDoctorById("voloshko-tetiana")).repeatConsultationPrice, 500);
});

test("POST returns doctor and doctors with both prices and unchanged full-address branch contract", async (context) => {
  const { route, store } = fixture(context);
  const response = await route.POST(request("POST", { ...identity, branch,
    consultationPrice: 0, repeatConsultationPrice: 100000 }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.deepEqual(body.doctors, [body.doctor]);
  assert.equal(body.doctor.branch, branch);
  assert.equal(body.doctor.specialty, identity.specialty);
  assert.equal(body.doctor.consultationPrice, 0);
  assert.equal(body.doctor.repeatConsultationPrice, 100000);
  assert.deepEqual(await store.getDoctorById(body.doctor.id), body.doctor);
});

test("legacy POST creates a doctor with nullable prices and no placeholder branch", async (context) => {
  const { route } = fixture(context);
  const response = await route.POST(request("POST", identity));
  assert.equal(response.status, 201);
  const { doctor } = await response.json();
  assert.equal(doctor.consultationPrice, null);
  assert.equal(doctor.repeatConsultationPrice, null);
  assert.equal(doctor.branch, "");
});

test("multiple doctor branches retain full addresses and order through create, reload and public/admin reads", async (context) => {
  const { DB, route, publicRoute } = fixture(context);
  const secondBranch = "м. Рівне, вул. Соборна, 1, кабінет 2";
  const branches = `${branch}\n${secondBranch}`;
  const response = await route.POST(request("POST", { ...identity, branch: branches }));
  assert.equal(response.status, 201);
  const { doctor, doctors } = await response.json();
  assert.equal(doctor.branch, branches);
  assert.equal(doctors[0].branch, branches);
  assert.equal((await storeFor(DB).getDoctorById(doctor.id)).branch, branches);

  const admin = await route.GET(new Request("http://test.invalid/api/admin/doctors"));
  assert.equal((await admin.json()).doctors[0].branch, branches);
  const publicList = await publicRoute.GET(new Request("http://test.invalid/api/doctors"));
  assert.equal((await publicList.json()).doctors[0].branch, branches);
  const publicProfile = await publicRoute.GET(new Request(`http://test.invalid/api/doctors?id=${doctor.id}`));
  assert.equal((await publicProfile.json()).doctor.branch, branches);
});

test("doctor branch updates support legacy addresses, multiple choices, omission and clearing every choice", async (context) => {
  const { DB, route, store } = fixture(context);
  const original = await store.createDoctor({ ...identity, branch });
  assert.equal((await storeFor(DB).getDoctorById(original.id)).branch, branch);
  const branches = `${branch}\nм. Рівне, вул. Київська, 21`;
  const changed = await route.PUT(request("PUT", { id: original.id, ...identity, branch: branches }));
  assert.equal(changed.status, 200);
  assert.equal((await changed.json()).doctors[0].branch, branches);

  const nameOnly = await route.PUT(request("PUT", { id: original.id, ...identity, name: "Змінене ім’я" }));
  assert.equal(nameOnly.status, 200);
  assert.equal((await storeFor(DB).getDoctorById(original.id)).branch, branches);

  const cleared = await route.PUT(request("PUT", { id: original.id, ...identity, branch: "" }));
  assert.equal(cleared.status, 200);
  assert.equal((await cleared.json()).doctors[0].branch, "");
  assert.equal((await storeFor(DB, true).getDoctorById(original.id)).branch, "");
});

test("doctor branch revisions restore every selected address, including after deletion", async (context) => {
  const { route, store, revisions, restore } = fixture(context);
  const branches = `${branch}\nм. Рівне, вул. Соборна, 1, кабінет 2`;
  const doctor = await store.createDoctor({ ...identity, branch: branches });
  const response = await route.PUT(request("PUT", { id: doctor.id, ...identity, branch }));
  assert.equal(response.status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).branch, branch);
  const history = await revisions.listContentRevisions("doctor", doctor.id);
  const previous = history.find((revision) => revision.changedFields.includes("branch"));
  assert.ok(previous);
  assert.equal((await revisions.getContentRevision("doctor", doctor.id, previous.id)).snapshot.branch, branches);

  let restored = await restoreRevision(restore, doctor.id, previous.id);
  assert.equal(restored.status, 200);
  assert.equal((await restored.json()).restored.branch, branches);
  await store.deleteDoctor(doctor.id);
  restored = await restoreRevision(restore, doctor.id, previous.id);
  assert.equal(restored.status, 200);
  assert.equal((await restored.json()).restored.branch, branches);
  assert.equal((await store.getDoctorById(doctor.id)).branch, branches);
});

test("PUT omission preserves both prices and other stored fields; explicit null clears and revisions retain prior prices", async (context) => {
  const { store, route, revisions } = fixture(context);
  const original = await store.createDoctor({ ...identity, branch, consultationPrice: 700, repeatConsultationPrice: 500 });
  assert.equal((await route.PUT(request("PUT", { id: original.id, ...identity, name: "Оновлене ім’я" }))).status, 200);
  let current = await store.getDoctorById(original.id);
  assert.equal(current.consultationPrice, 700);
  assert.equal(current.repeatConsultationPrice, 500);
  assert.equal(current.branch, branch);
  const response = await route.PUT(request("PUT", { ...current, consultationPrice: null, repeatConsultationPrice: null }));
  assert.equal(response.status, 200);
  current = (await response.json()).doctors[0];
  assert.equal(current.consultationPrice, null);
  assert.equal(current.repeatConsultationPrice, null);
  const history = await revisions.listContentRevisions("doctor", original.id);
  const priceRevision = history.find((revision) => revision.changedFields.includes("repeatConsultationPrice"));
  assert.ok(priceRevision);
  const saved = await revisions.getContentRevision("doctor", original.id, priceRevision.id);
  assert.equal(saved.snapshot.repeatConsultationPrice, 500);
  assert.equal(saved.snapshot.consultationPrice, 700);
});

for (const field of ["consultationPrice", "repeatConsultationPrice"]) {
  test(`malformed ${field} fails POST and PUT before changing data or revision history`, async (context) => {
    const { route, store, revisions } = fixture(context);
    const original = await store.createDoctor({ ...identity, consultationPrice: 700, repeatConsultationPrice: 500 });
    for (const value of [-1, 100001, 1.5, "500", "", true, false, {}, [], [500]]) {
      assert.equal((await route.POST(request("POST", { ...identity, [field]: value }))).status, 400, String(value));
      assert.equal((await route.PUT(request("PUT", { ...original, [field]: value }))).status, 400, String(value));
    }
    assert.deepEqual(await store.listDoctors(), [original]);
    assert.deepEqual(await revisions.listContentRevisions("doctor", original.id), []);
    assert.throws(() => pricing.parseDoctorPrice(Infinity), pricing.DoctorPriceValidationError);
    assert.throws(() => pricing.parseDoctorPrice(NaN), pricing.DoctorPriceValidationError);
  });
}

test("price validation also guards direct store callers and missing PUT prices remain untouched", async (context) => {
  const { store } = fixture(context);
  const original = await store.createDoctor({ ...identity, consultationPrice: 700, repeatConsultationPrice: 500 });
  await assert.rejects(store.createDoctor({ ...identity, repeatConsultationPrice: 1.5 }), pricing.DoctorPriceValidationError);
  await assert.rejects(store.updateDoctor(original.id, { ...original, repeatConsultationPrice: -1 }), pricing.DoctorPriceValidationError);
  const { consultationPrice, repeatConsultationPrice, ...legacyValues } = original;
  assert.equal(consultationPrice, 700);
  assert.equal(repeatConsultationPrice, 500);
  await store.updateDoctor(original.id, { ...legacyValues, name: "Змінене ім’я" });
  const updated = await store.getDoctorById(original.id);
  assert.equal(updated.consultationPrice, 700);
  assert.equal(updated.repeatConsultationPrice, 500);
});

test("revision restore preserves numbers, explicit null, missing legacy price fields and deleted doctors", async (context) => {
  const { store, revisions, restore } = fixture(context);
  let doctor = await store.createDoctor({ ...identity, branch, consultationPrice: 700, repeatConsultationPrice: 500 });
  const numbered = await saveRevision(revisions, doctor);
  await store.updateDoctor(doctor.id, { ...doctor, consultationPrice: 800, repeatConsultationPrice: 600 });
  assert.equal((await restoreRevision(restore, doctor.id, numbered.id)).status, 200);
  doctor = await store.getDoctorById(doctor.id);
  assert.equal(doctor.repeatConsultationPrice, 500);
  assert.equal(doctor.consultationPrice, 700);
  const cleared = await saveRevision(revisions, { ...doctor, consultationPrice: null, repeatConsultationPrice: null });
  assert.equal((await restoreRevision(restore, doctor.id, cleared.id)).status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).repeatConsultationPrice, null);
  await store.updateDoctor(doctor.id, { ...doctor, repeatConsultationPrice: 550 });
  const legacy = { ...doctor, name: "Стара версія" };
  delete legacy.repeatConsultationPrice;
  delete legacy.consultationPrice;
  const legacyRevision = await saveRevision(revisions, legacy);
  assert.equal((await restoreRevision(restore, doctor.id, legacyRevision.id)).status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).repeatConsultationPrice, 550);
  await store.deleteDoctor(doctor.id);
  assert.equal((await restoreRevision(restore, doctor.id, numbered.id)).status, 200);
  const restored = await store.getDoctorById(doctor.id);
  assert.equal(restored.repeatConsultationPrice, 500);
  assert.equal(restored.consultationPrice, 700);
  assert.equal(restored.branch, branch);
});

test("invalid historical prices are rejected without modifying the doctor or creating another revision", async (context) => {
  const { store, revisions, restore } = fixture(context);
  const doctor = await store.createDoctor({ ...identity, repeatConsultationPrice: 500 });
  const invalid = await saveRevision(revisions, { ...doctor, repeatConsultationPrice: "800" });
  assert.equal((await restoreRevision(restore, doctor.id, invalid.id)).status, 400);
  assert.deepEqual(await store.getDoctorById(doctor.id), doctor);
  assert.equal((await revisions.listContentRevisions("doctor", doctor.id)).length, 1);
});

test("PostgreSQL adapter translates migration and binds both prices correctly without contacting PostgreSQL", async (context) => {
  const { sqlite } = fixture(context);
  legacyTable(sqlite);
  const queries = [];
  const client = {
    query: async (sql, values = []) => {
      queries.push({ sql, values });
      assert.doesNotMatch(sql, /PRAGMA|\?|COLLATE NOCASE/);
      const parameters = Array.from(sql.matchAll(/\$(\d+)/g), (match) => Number(match[1]));
      assert.equal(parameters.length ? Math.max(...parameters) : 0, values.length);
      if (sql.includes("information_schema.columns")) return { rows: sqlite.prepare("PRAGMA table_info(doctors)").all(), rowCount: 0 };
      const statement = sqlite.prepare(sql.replace(/\$\d+/g, "?"));
      if (/^\s*SELECT/.test(sql)) return { rows: statement.all(...values), rowCount: 0 };
      return { rows: [], rowCount: Number(statement.run(...values).changes) };
    },
  };
  const { getDatabase } = loadModule("../lib/database.ts", {
    "@neondatabase/serverless": { neon: () => client },
  }, { process: { env: { DATABASE_URL: "postgresql://test.invalid/no-connection" } } });
  const store = storeFor(getDatabase());
  const doctor = await store.createDoctor({ ...identity, consultationPrice: 700, repeatConsultationPrice: 450, showConsultationPriceOnRequest: true });
  await store.updateDoctor(doctor.id, { ...doctor, repeatConsultationPrice: null });
  assert.equal((await store.listDoctors()).find((item) => item.id === doctor.id).repeatConsultationPrice, null);
  assert.equal((await store.getDoctorById(doctor.id)).showConsultationPriceOnRequest, true);
  assert.ok(queries.some(({ sql }) => sql === "ALTER TABLE doctors ADD COLUMN show_consultation_price_on_request INTEGER NOT NULL DEFAULT 0"));
  assert.ok(queries.some(({ sql }) => sql === "ALTER TABLE doctors ADD COLUMN repeat_consultation_price INTEGER"));
  assert.ok(queries.some(({ sql, values }) => sql.includes("INSERT INTO doctors") && values.includes(450)));
});


test("legacy publication migration preserves the existing homepage priority and alphabetical tie order", async (context) => {
  const { sqlite, DB } = fixture(context);
  legacyTable(sqlite);
  sqlite.exec("DELETE FROM doctors");
  for (const doctor of doctorData.defaultDoctors) {
    sqlite.prepare("INSERT INTO doctors (id, name, specialty) VALUES (?, ?, ?)")
      .run(doctor.id, doctor.name, doctor.specialty);
  }
  const oldFeaturedOrder = ["pochtar-kateryna", "voloshko-tetiana", "iziumska-olena", "ishchuk-nadiia"];
  const previousOrder = [...doctorData.defaultDoctors].sort((first, second) => {
    const a = oldFeaturedOrder.indexOf(first.id), b = oldFeaturedOrder.indexOf(second.id);
    return (a === -1 ? Number.MAX_SAFE_INTEGER : a) - (b === -1 ? Number.MAX_SAFE_INTEGER : b) ||
      first.name.localeCompare(second.name, "uk-UA", { sensitivity: "base" });
  });
  const store = storeFor(DB);
  const migrated = await store.listDoctors();
  assert.deepEqual(migrated.map((doctor) => doctor.id), previousOrder.map((doctor) => doctor.id));
  assert.ok(migrated.every((doctor) => doctor.isActive === true));
  const first = migrated[0];
  await store.updateDoctor(first.id, { ...first, isActive: false, sortOrder: 42 });
  const afterRestart = await storeFor(DB).getDoctorById(first.id, { includeInactive: true });
  assert.equal(afterRestart.sortOrder, 42);
  assert.equal(afterRestart.isActive, false);
});

test("public API excludes hidden doctors even with includeInactive query and admin API keeps them editable", async (context) => {
  const { store, route, publicRoute } = fixture(context);
  const visible = await store.createDoctor({ ...identity, id: "visible", sortOrder: 1000 });
  const hidden = await store.createDoctor({ ...identity, id: "hidden", isActive: false, sortOrder: 0 });
  const publicResponse = await publicRoute.GET(new Request("http://test.invalid/api/doctors?includeInactive=true"));
  assert.equal(publicResponse.status, 200);
  assert.equal(publicResponse.headers.get("cache-control"), "no-store");
  assert.deepEqual((await publicResponse.json()).doctors, [visible]);
  assert.equal((await publicRoute.GET(new Request("http://test.invalid/api/doctors?id=hidden"))).status, 404);
  const adminResponse = await route.GET(new Request("http://test.invalid/api/admin/doctors"));
  assert.deepEqual((await adminResponse.json()).doctors.map((doctor) => doctor.id), [hidden.id, visible.id]);
  assert.equal(await store.getDoctorById(hidden.id), null);
  assert.equal((await store.getDoctorById(hidden.id, { includeInactive: true })).isActive, false);
});

test("hidden and deleted default doctor profiles return 404 instead of resurrecting the bundled profile", async (context) => {
  const { store, profile } = fixture(context);
  const hidden = await store.createDoctor({ ...identity, id: "voloshko-tetiana", isActive: false });
  const props = { params: Promise.resolve({ id: hidden.id }), searchParams: Promise.resolve({}) };
  await assert.rejects(profile.default(props), /404/);
  await assert.rejects(profile.generateMetadata(props), /404/);
  await store.deleteDoctor(hidden.id);
  await assert.rejects(profile.default(props), /404/);
  await assert.rejects(profile.generateMetadata(props), /404/);
});

test("successful empty public lists remain empty and publication false and order zero round-trip through PUT", async (context) => {
  const { store, route, publicRoute } = fixture(context);
  const doctor = await store.createDoctor({ ...identity });
  const hiddenResponse = await route.PUT(request("PUT", { ...doctor, isActive: false, sortOrder: 0 }));
  assert.equal(hiddenResponse.status, 200);
  let saved = (await hiddenResponse.json()).doctors[0];
  assert.equal(saved.isActive, false);
  assert.equal(saved.sortOrder, 0);
  assert.deepEqual(await store.listDoctors(), []);
  assert.deepEqual((await (await publicRoute.GET(new Request("http://test.invalid/api/doctors"))).json()).doctors, []);
  const legacyResponse = await route.PUT(request("PUT", { id: doctor.id, ...identity }));
  saved = (await legacyResponse.json()).doctors[0];
  assert.equal(saved.isActive, false);
  assert.equal(saved.sortOrder, 0);
  assert.equal((await route.PUT(request("PUT", { id: doctor.id, ...identity, isActive: true }))).status, 200);
  assert.equal((await store.listDoctors())[0].id, doctor.id);
});

test("POST supports a hidden draft with order zero and defaults new doctors to the late rank", async (context) => {
  const { route } = fixture(context);
  const hidden = await route.POST(request("POST", { ...identity, isActive: false, sortOrder: 0 }));
  assert.equal(hidden.status, 201);
  const hiddenBody = await hidden.json();
  assert.equal(hiddenBody.doctor.isActive, false);
  assert.equal(hiddenBody.doctor.sortOrder, 0);
  assert.equal(hiddenBody.doctors.length, 1);
  const normal = await route.POST(request("POST", identity));
  const normalBody = await normal.json();
  assert.equal(normalBody.doctor.isActive, true);
  assert.equal(normalBody.doctor.sortOrder, 1000);
});

test("malformed publication and rank inputs are rejected before changing doctors or history", async (context) => {
  const { store, route, revisions } = fixture(context);
  const doctor = await store.createDoctor({ ...identity });
  for (const [field, values] of [
    ["isActive", [null, 0, 1, "false", "true", {}, []]],
    ["sortOrder", [null, -1, 1.5, "0", true, {}, [], 2147483648]],
  ]) {
    for (const value of values) {
      assert.equal((await route.POST(request("POST", { ...identity, [field]: value }))).status, 400);
      assert.equal((await route.PUT(request("PUT", { ...doctor, [field]: value }))).status, 400);
    }
  }
  assert.deepEqual(await store.listDoctors({ includeInactive: true }), [doctor]);
  assert.deepEqual(await revisions.listContentRevisions("doctor", doctor.id), []);
});

test("doctor revisions restore publication/order while legacy snapshots preserve existing values", async (context) => {
  const { store, revisions, restore } = fixture(context);
  const doctor = await store.createDoctor({ ...identity, isActive: false, sortOrder: 0 });
  const hiddenRevision = await saveRevision(revisions, doctor);
  await store.updateDoctor(doctor.id, { ...doctor, isActive: true, sortOrder: 500 });
  let response = await restoreRevision(restore, doctor.id, hiddenRevision.id);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).restored.isActive, false);
  assert.deepEqual(await store.listDoctors(), []);
  const legacy = { ...doctor };
  delete legacy.isActive;
  delete legacy.sortOrder;
  const legacyRevision = await saveRevision(revisions, legacy);
  response = await restoreRevision(restore, doctor.id, legacyRevision.id);
  assert.equal(response.status, 200);
  let restored = (await response.json()).restored;
  assert.equal(restored.isActive, false);
  assert.equal(restored.sortOrder, 0);
  await store.deleteDoctor(doctor.id);
  response = await restoreRevision(restore, doctor.id, hiddenRevision.id);
  assert.equal(response.status, 200);
  restored = (await response.json()).restored;
  assert.equal(restored.isActive, false);
  assert.equal(restored.sortOrder, 0);
  assert.deepEqual(await store.listDoctors(), []);
});

test("shared public doctor selection preserves sorting, hides inactive entries and does not invent empty data", () => {
  const doctors = [
    { ...doctorData.defaultDoctors[0], id: "z", name: "Яна", sortOrder: 5 },
    { ...doctorData.defaultDoctors[0], id: "hidden", sortOrder: 0, isActive: false },
    { ...doctorData.defaultDoctors[0], id: "a", name: "Анна", sortOrder: 5 },
    { ...doctorData.defaultDoctors[0], id: "first", name: "Юрій", sortOrder: 0 },
  ];
  assert.deepEqual(doctorData.getPublicDoctors(doctors).map((doctor) => doctor.id), ["first", "a", "z"]);
  assert.deepEqual(doctorData.getPublicDoctors([]), []);
});


test("configured database failures never republish bundled doctors, while local previews retain defaults", async () => {
  let reads = 0;
  const failingStore = {
    listDoctors: async () => { reads++; throw new Error("isolated simulated database outage"); },
    getDoctorById: async () => { reads++; throw new Error("isolated simulated database outage"); },
  };
  const loadPublic = (mode, DB) => loadModule("../app/api/doctors/publicDoctors.ts", {
    "server-only": {}, "@/lib/runtimeEnv": { env: { DB } },
    "../../doctors/doctorData": doctorData, "./doctorStore": failingStore,
  }, { process: { env: { NODE_ENV: mode, DATABASE_URL: DB ? "postgresql://test.invalid/not-used" : undefined } } });
  for (const mode of ["production", "development"]) {
    const configured = loadPublic(mode, {});
    assert.deepEqual(await configured.listPublicDoctors(), []);
    assert.equal(await configured.getPublicDoctorById("voloshko-tetiana"), null);
  }
  assert.equal(reads, 4);
  const productionWithoutDatabase = loadPublic("production", undefined);
  assert.deepEqual(await productionWithoutDatabase.listPublicDoctors(), []);
  assert.equal(await productionWithoutDatabase.getPublicDoctorById("voloshko-tetiana"), null);
  const local = loadPublic("development", undefined);
  assert.ok((await local.listPublicDoctors()).length > 0);
  assert.equal((await local.getPublicDoctorById("voloshko-tetiana")).id, "voloshko-tetiana");
  assert.equal(reads, 6, "local preview must not attempt a database read");
});


test("unknown-price opt-in defaults off for migrated, new, and bootstrapped doctors and round-trips independently of prices", async (context) => {
  const { sqlite, DB } = fixture(context);
  legacyTable(sqlite);
  const store = storeFor(DB);
  const legacy = await store.getDoctorById("voloshko-tetiana");
  assert.equal(legacy.showConsultationPriceOnRequest, false);
  assert.equal(legacy.consultationPrice, 700);
  const created = await store.createDoctor(identity);
  assert.equal(created.showConsultationPriceOnRequest, false);
  await store.updateDoctor(created.id, { ...created, showConsultationPriceOnRequest: true });
  const optedIn = await storeFor(DB).getDoctorById(created.id);
  assert.equal(optedIn.showConsultationPriceOnRequest, true);
  assert.equal(optedIn.consultationPrice, null);
  const { showConsultationPriceOnRequest, ...legacyUpdate } = optedIn;
  assert.equal(showConsultationPriceOnRequest, true);
  await store.updateDoctor(created.id, { ...legacyUpdate, name: "Змінене ім’я" });
  assert.equal((await store.getDoctorById(created.id)).showConsultationPriceOnRequest, true);
  await store.updateDoctor(created.id, { ...legacyUpdate, showConsultationPriceOnRequest: false });
  assert.equal((await storeFor(DB).getDoctorById(created.id)).showConsultationPriceOnRequest, false);
  const bootstrapped = temporaryDatabase();
  context.after(() => bootstrapped.sqlite.close());
  assert.ok((await storeFor(bootstrapped.DB, true).listDoctors()).every((doctor) => doctor.showConsultationPriceOnRequest === false));
  const sqlSchema = readFileSync(new URL("../db/schema.postgres.sql", import.meta.url), "utf8")
    .match(/CREATE TABLE IF NOT EXISTS doctors \([\s\S]+?\);/)[0];
  const schema = new DatabaseSync(":memory:");
  context.after(() => schema.close());
  schema.exec(sqlSchema);
  schema.prepare("INSERT INTO doctors (id, name, specialty) VALUES (?, ?, ?)").run("fresh", identity.name, identity.specialty);
  assert.equal(schema.prepare("SELECT show_consultation_price_on_request AS flag FROM doctors").get().flag, 0);
});

test("concurrent unknown-price flag migration is retry-safe and preserves an already stored opt-in", async (context) => {
  const database = temporaryDatabase();
  context.after(() => database.sqlite.close());
  legacyTable(database.sqlite);
  database.beforeRun = (sql) => {
    if (sql === "ALTER TABLE doctors ADD COLUMN show_consultation_price_on_request INTEGER NOT NULL DEFAULT 0") {
      database.beforeRun = null;
      database.sqlite.exec(sql);
      database.sqlite.exec("UPDATE doctors SET show_consultation_price_on_request = 1");
      throw new Error("duplicate column: another instance already added it");
    }
  };
  for (let run = 0; run < 2; run++) {
    assert.equal((await storeFor(database.DB).getDoctorById("voloshko-tetiana")).showConsultationPriceOnRequest, true);
  }
});

test("doctor API defaults unknown-price opt-in off, preserves omission and stores explicit false with history", async (context) => {
  const { route, store, revisions, publicRoute } = fixture(context);
  const defaultResponse = await route.POST(request("POST", identity));
  assert.equal(defaultResponse.status, 201);
  assert.equal((await defaultResponse.json()).doctor.showConsultationPriceOnRequest, false);
  const optedInResponse = await route.POST(request("POST", { ...identity, showConsultationPriceOnRequest: true }));
  assert.equal(optedInResponse.status, 201);
  const { doctor } = await optedInResponse.json();
  assert.equal(doctor.showConsultationPriceOnRequest, true);
  assert.equal((await route.PUT(request("PUT", { id: doctor.id, ...identity }))).status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).showConsultationPriceOnRequest, true);
  assert.equal((await route.PUT(request("PUT", { id: doctor.id, ...identity, showConsultationPriceOnRequest: false }))).status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).showConsultationPriceOnRequest, false);
  const publicDoctor = await publicRoute.GET(new Request("http://test.invalid/api/doctors?id=" + doctor.id));
  assert.equal((await publicDoctor.json()).doctor.showConsultationPriceOnRequest, false);
  const history = await revisions.listContentRevisions("doctor", doctor.id);
  const change = history.find((revision) => revision.changedFields.includes("showConsultationPriceOnRequest"));
  assert.ok(change);
  assert.equal((await revisions.getContentRevision("doctor", doctor.id, change.id)).snapshot.showConsultationPriceOnRequest, true);
});

test("unknown-price opt-in strictly rejects malformed booleans before data or revision writes", async (context) => {
  const { store, route, revisions } = fixture(context);
  const doctor = await store.createDoctor({ ...identity, showConsultationPriceOnRequest: true });
  for (const value of [null, 0, 1, "false", "true", "", {}, []]) {
    assert.equal((await route.POST(request("POST", { ...identity, showConsultationPriceOnRequest: value }))).status, 400);
    assert.equal((await route.PUT(request("PUT", { ...doctor, showConsultationPriceOnRequest: value }))).status, 400);
    await assert.rejects(store.createDoctor({ ...identity, showConsultationPriceOnRequest: value }), pricing.DoctorPriceValidationError);
    await assert.rejects(store.updateDoctor(doctor.id, { ...doctor, showConsultationPriceOnRequest: value }), pricing.DoctorPriceValidationError);
  }
  assert.deepEqual(await store.listDoctors(), [doctor]);
  assert.deepEqual(await revisions.listContentRevisions("doctor", doctor.id), []);
});

test("revisions restore unknown-price true and false, preserve missing legacy flags, and default deleted legacy records off", async (context) => {
  const { store, revisions, restore } = fixture(context);
  let doctor = await store.createDoctor({ ...identity, showConsultationPriceOnRequest: true });
  const enabled = await saveRevision(revisions, doctor);
  const disabled = await saveRevision(revisions, { ...doctor, showConsultationPriceOnRequest: false });
  const legacy = { ...doctor };
  delete legacy.showConsultationPriceOnRequest;
  const oldRevision = await saveRevision(revisions, legacy);
  assert.equal((await restoreRevision(restore, doctor.id, disabled.id)).status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).showConsultationPriceOnRequest, false);
  assert.equal((await restoreRevision(restore, doctor.id, enabled.id)).status, 200);
  assert.equal((await restoreRevision(restore, doctor.id, oldRevision.id)).status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).showConsultationPriceOnRequest, true);
  const invalid = await saveRevision(revisions, { ...doctor, showConsultationPriceOnRequest: "true" });
  const historySize = (await revisions.listContentRevisions("doctor", doctor.id)).length;
  assert.equal((await restoreRevision(restore, doctor.id, invalid.id)).status, 400);
  assert.equal((await revisions.listContentRevisions("doctor", doctor.id)).length, historySize);
  assert.equal((await store.getDoctorById(doctor.id)).showConsultationPriceOnRequest, true);
  await store.deleteDoctor(doctor.id);
  assert.equal((await restoreRevision(restore, doctor.id, enabled.id)).status, 200);
  doctor = await store.getDoctorById(doctor.id);
  assert.equal(doctor.showConsultationPriceOnRequest, true);
  await store.deleteDoctor(doctor.id);
  assert.equal((await restoreRevision(restore, doctor.id, oldRevision.id)).status, 200);
  assert.equal((await store.getDoctorById(doctor.id)).showConsultationPriceOnRequest, false);
});
