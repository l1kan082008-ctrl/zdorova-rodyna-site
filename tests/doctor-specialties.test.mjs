import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";

// Disposable SQLite and explicitly mapped modules only: never load .env or contact a service.
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

const doctorData = loadModule("../app/doctors/doctorData.ts", {}, { process: { env: { NODE_ENV: "test" } } });
const doctorCategories = loadModule("../app/doctors/doctorCategories.ts");
const formState = loadModule("../app/admin/doctors/doctorFormState.ts", { "../../doctors/doctorData.ts": doctorData });
const names = loadModule("../lib/doctorSpecialties.ts", { "@/app/admin/doctors/doctorFormState": formState });
const initialization = loadModule("../lib/initializeOnce.ts");
const requestBody = loadModule("../lib/requestBody.ts");
const adminSession = loadModule("../lib/adminSession.ts", { "./adminCookie.ts": loadModule("../lib/adminCookie.ts") });

function storeFor(DB, doctors = []) {
  return loadModule("../app/api/admin/doctor-specialties/specialtyStore.ts", {
    "@/lib/runtimeEnv": { env: { DB } },
    "@/lib/initializeOnce": initialization,
    "@/lib/doctorSpecialties": names,
    "@/app/doctors/doctorData": doctorData,
    "@/app/doctors/doctorCategories": doctorCategories,
    "@/app/admin/doctors/doctorFormState": formState,
    "../../doctors/doctorStore": {
      listDoctors: async (options) => {
        assert.equal(options.includeInactive, true, "specialties of hidden doctors must be retained");
        return doctors;
      },
    },
  });
}

function fixture(context, doctors = []) {
  const sqlite = new DatabaseSync(":memory:");
  context.after(() => sqlite.close());
  const control = { fail: null };
  const prepare = (sql, values = []) => ({
    bind: (...bound) => prepare(sql, bound),
    all: async () => {
      control.fail?.(sql);
      return { results: sqlite.prepare(sql).all(...values) };
    },
    first: async () => {
      control.fail?.(sql);
      return sqlite.prepare(sql).get(...values) ?? null;
    },
    run: async () => {
      control.fail?.(sql);
      return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } };
    },
  });
  const DB = { prepare };
  return { sqlite, DB, control, store: storeFor(DB, doctors) };
}

function routeFor(store, authorized = true) {
  const auth = loadModule("../app/api/admin/adminAuth.ts", {
    "@/lib/runtimeEnv": { env: {} },
    "@/lib/adminSession": {
      isTrustedAdminMutation: adminSession.isTrustedAdminMutation,
      verifyAdminRequest: async () => authorized,
    },
  });
  return loadModule("../app/api/admin/doctor-specialties/route.ts", {
    "../adminAuth": auth,
    "@/lib/requestBody": requestBody,
    "@/lib/doctorSpecialties": names,
    "./specialtyStore": store,
  });
}

const url = "https://example.test/api/admin/doctor-specialties";
const request = (payload, headers = {}) => new Request(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "https://example.test", ...headers },
  body: JSON.stringify(payload),
});

test("baseline includes Proctologist-surgeon and excludes academic titles and qualifiers", async () => {
  const options = await storeFor(undefined).listDoctorSpecialties();
  assert.ok(options.includes("Проктолог-хірург"));
  assert.ok(options.includes("Пульмонолог"));
  assert.ok(options.includes("Фтизіатр"));
  assert.ok(options.includes("Ортопед-травматолог"));
  for (const excluded of ["д.м.н.", "к.мед.н.", "професор", "доцент", "дитячий і дорослий"]) {
    assert.ok(!options.includes(excluded));
  }
});

test("the deployment schema and automatic specialty table initialization stay equivalent", async (context) => {
  const { store, sqlite } = fixture(context);
  await store.listDoctorSpecialties();
  const runtimeColumns = sqlite.prepare("PRAGMA table_info(doctor_specialties)").all();
  const deployed = new DatabaseSync(":memory:");
  context.after(() => deployed.close());
  const schema = readFileSync(new URL("../db/schema.postgres.sql", import.meta.url), "utf8");
  const declaration = schema.match(/CREATE TABLE IF NOT EXISTS doctor_specialties \([\s\S]+?\);/);
  assert.ok(declaration, "deployment schema includes the persistent specialty catalog");
  deployed.exec(declaration[0]);
  assert.deepEqual(deployed.prepare("PRAGMA table_info(doctor_specialties)").all(), runtimeColumns);
});

test("custom specialty persists through module restart without a doctor profile", async (context) => {
  const { store, DB, sqlite } = fixture(context);
  assert.equal(await store.saveDoctorSpecialty("  Подолог  "), "Подолог");
  assert.ok((await storeFor(DB).listDoctorSpecialties()).includes("Подолог"));
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM doctor_specialties").get().count, 1);
});

test("case, extra whitespace and hyphen variants collapse to the saved label", async (context) => {
  const { store, sqlite } = fixture(context);
  assert.equal(await store.saveDoctorSpecialty("  Дитячий   проктолог — хірург  "), "Дитячий проктолог-хірург");
  assert.equal(await store.saveDoctorSpecialty("ДИТЯЧИЙ ПРОКТОЛОГ-ХІРУРГ"), "Дитячий проктолог-хірург");
  assert.equal(await store.saveDoctorSpecialty("Дитячий проктолог ‑ хірург"), "Дитячий проктолог-хірург");
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM doctor_specialties").get().count, 1);
});

test("concurrent additions in independent modules share one persistent entry", async (context) => {
  const { DB, sqlite } = fixture(context);
  const results = await Promise.all([
    storeFor(DB).saveDoctorSpecialty("Сомнолог"),
    storeFor(DB).saveDoctorSpecialty("сомнолог"),
    storeFor(DB).saveDoctorSpecialty("СОМНОЛОГ"),
  ]);
  assert.equal(new Set(results).size, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM doctor_specialties").get().count, 1);
});

test("old and hidden profiles supply their specialties without changing stored doctor strings", async (context) => {
  const doctors = [
    { id: "public", specialty: "Гематолог, д.м.н.", isActive: true },
    { id: "hidden", specialty: "Нефролог, доцент, дитячий і дорослий", isActive: false },
  ];
  const original = structuredClone(doctors);
  const { store, DB } = fixture(context, doctors);
  const options = await store.listDoctorSpecialties();
  assert.ok(options.includes("Гематолог"));
  assert.ok(options.includes("Нефролог"));
  assert.deepEqual(doctors, original);
  assert.equal(await store.saveDoctorSpecialty("нефролог"), "Нефролог");
  // A registered option survives even if the profile that introduced it is later deleted.
  assert.ok((await storeFor(DB, []).listDoctorSpecialties()).includes("Нефролог"));
});

test("invalid names are rejected before database initialization or writes", async (context) => {
  const { store, sqlite } = fixture(context);
  for (const value of [undefined, null, 2, [], {}, "", "   ", "-123", "Гінеколог, хірург",
    "Психіатр\nхірург", "Лікар\u0000", "Лікар\u200b", "А".repeat(81),
    "Доцент", "професор", "д.м.н.", "Доктор медичних наук", "дитячий і дорослий"]) {
    await assert.rejects(store.saveDoctorSpecialty(value), names.DoctorSpecialtyValidationError);
  }
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE name = 'doctor_specialties'").get().count, 0);
});

test("GET and POST refuse unauthorized admins, and POST rejects cross-origin requests", async (context) => {
  const { store, sqlite } = fixture(context);
  const denied = routeFor(store, false);
  assert.equal((await denied.GET(new Request(url))).status, 401);
  assert.equal((await denied.POST(request({ name: "Подолог" }))).status, 401);
  const allowed = routeFor(store);
  assert.equal((await allowed.POST(request({ name: "Подолог" }, { Origin: "https://attacker.test" }))).status, 401);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE name = 'doctor_specialties'").get().count, 0);
});

test("POST accepts a single bounded JSON name and GET returns the persisted catalog", async (context) => {
  const { store } = fixture(context);
  const routes = routeFor(store);
  const created = await routes.POST(request({ name: "Подолог" }));
  assert.equal(created.status, 200);
  const payload = await created.json();
  assert.equal(payload.specialty, "Подолог");
  assert.ok(payload.specialties.includes("Подолог"));
  const listed = await routes.GET(new Request(url));
  assert.match(listed.headers.get("cache-control"), /no-store/);
  assert.deepEqual((await listed.json()).specialties, payload.specialties);
});

test("malformed, oversized, wrong-type and non-JSON payloads cannot create a specialty", async (context) => {
  const { store, sqlite } = fixture(context);
  const routes = routeFor(store);
  for (const payload of [null, [], "Подолог", {}, { name: [] }, { name: "Доцент" }, { name: "x".repeat(81) }]) {
    assert.equal((await routes.POST(request(payload))).status, 400);
  }
  assert.equal((await routes.POST(request({ name: "x".repeat(3000) }))).status, 413);
  assert.equal((await routes.POST(request({ name: "Подолог" }, { "Content-Type": "text/plain" }))).status, 415);
  assert.equal((await routes.POST(new Request(url, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "https://example.test" }, body: "{",
  }))).status, 400);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE name = 'doctor_specialties'").get().count, 0);
});

test("without a database GET offers defaults but POST explicitly fails rather than claiming persistence", async () => {
  const routes = routeFor(storeFor(undefined));
  const listed = await routes.GET(new Request(url));
  assert.equal(listed.status, 200);
  assert.ok((await listed.json()).specialties.includes("Проктолог-хірург"));
  const failed = await routes.POST(request({ name: "Подолог" }));
  assert.equal(failed.status, 503);
  assert.ok((await failed.json()).error);
});

test("storage errors are reported safely and initialization can retry", async (context) => {
  const { store, control, sqlite } = fixture(context);
  const routes = routeFor(store);
  control.fail = () => { throw new Error("private database detail"); };
  const failedRead = await routes.GET(new Request(url));
  assert.equal(failedRead.status, 500);
  assert.doesNotMatch(await failedRead.text(), /private database detail/);
  const failedWrite = await routes.POST(request({ name: "Подолог" }));
  assert.equal(failedWrite.status, 500);
  assert.doesNotMatch(await failedWrite.text(), /private database detail/);
  control.fail = null;
  assert.equal((await routes.POST(request({ name: "Подолог" }))).status, 200);
  control.fail = (sql) => { if (sql.startsWith("INSERT")) throw new Error("private database detail"); };
  assert.equal((await routes.POST(request({ name: "Сомнолог" }))).status, 500);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM doctor_specialties WHERE name = 'Сомнолог'").get().count, 0);
});
