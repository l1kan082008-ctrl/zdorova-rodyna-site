import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
import { types } from "@neondatabase/serverless";

function load(path, overrides = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => {
    for (const [suffix, value] of Object.entries(overrides)) if (name.endsWith(suffix)) return value;
    if (name.endsWith("bookingDetails")) return load("../lib/bookingDetails.ts");
    if (name.endsWith("bookingDateTime")) return load("../app/admin/bookings/bookingDateTime.ts");
    if (name.endsWith("adminBookingStatistics")) return load("../lib/adminBookingStatistics.ts");
    throw new Error(`Unexpected dependency: ${name}`);
  }, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { getBookingCategory, getBookingKyivDate, parseAdminBookingQuery, selectAdminBookings } =
  load("../lib/adminBookingStatistics.ts");
const { formatBookingComment } = load("../lib/bookingDetails.ts");
const query = (search = "") => parseAdminBookingQuery(new URLSearchParams(search));
const booking = (extra = {}) => ({
  id: "one", reference: "ZR-TEST", patientName: "Тестовий запис", phone: "+380000000001",
  service: "МРТ", doctor: "", comment: "", source: "contacts", status: "new",
  createdAt: "2026-10-16 12:00:00", consentAt: "", consentVersion: "", retentionUntil: "", ...extra,
});
const catalog = [
  { name: "Феритин", category: "anemia", aliases: ["Ferritin"] },
  { name: "Глюкоза", category: "biochemistry" },
  { name: "Холтер ЕКГ (Добове моніторування)", category: "heart" },
  { name: "Дерматоскопія родимок", category: "medical" },
];

test("request sources and service selections classify all dashboard categories", () => {
  for (const [extra, expected] of [
    [{ source: "callback", service: "МРТ", doctor: "Лікар" }, "callback"],
    [{ source: "family-declaration", service: "МРТ" }, "declaration"],
    [{ source: "legacy", service: "Зворотний дзвінок" }, "callback"],
    [{ source: "legacy", service: "Заявка на декларацію із сімейним лікарем" }, "declaration"],
    [{ service: "Консультації лікарів" }, "doctor"],
    [{ service: "Консультація: Пульмонолог і фтизіатр" }, "doctor"],
    [{ service: "Консультація кардіолога після Холтера" }, "doctor"],
    [{ service: "КТ головного мозку" }, "ct"],
    [{ service: "МРТ" }, "mri"],
    [{ service: "ЕХО (УЗД) серця" }, "ultrasound"],
    [{ service: "Холтерівське моніторування ЕКГ" }, "holter"],
    [{ service: "Лабораторні дослідження" }, "laboratory"],
    [{ service: "Ferritin — СІТО" }, "laboratory"],
    [{ service: "Дерматоскопія родимок" }, "other"],
    [{ service: "Допоможіть обрати послугу" }, "other"],
  ]) assert.equal(getBookingCategory(booking(extra), catalog), expected, JSON.stringify(extra));
});

test("patient comment and branch address never override the actual booking category", () => {
  for (const comment of [
    "Передзвоніть після МРТ, аналізів та УЗД, запитаю про декларацію.",
    "Коментар:\nОбрані дослідження:\n• МРТ головного мозку",
    formatBookingComment({ locationComment: "Бажане відділення: вул. Аналізів, 12.", studies: "", total: "", comment: "Зворотний дзвінок, КТ" }),
  ]) assert.equal(getBookingCategory(booking({ service: "Консультації лікарів", doctor: "Тестовий лікар", comment }), catalog), "doctor");
});

test("selected studies replace package summaries, count once and keep mixed requests in Other", () => {
  const grouped = booking({ service: "Комплекс досліджень", comment: formatBookingComment({
    locationComment: "", studies: "Феритин — СІТО | Глюкоза | Доплата СІТО (2 досл.) — 200 ₴",
    total: "800", comment: "Потрібен Холтер?",
  }) });
  const mixed = booking({ id: "two", service: "Феритин | МРТ головного мозку" });
  const result = selectAdminBookings([grouped, mixed], query(), catalog);
  assert.deepEqual(result.bookings.map(({ category }) => category).sort(), ["laboratory", "other"]);
  assert.equal(result.stats.total, 2);
  assert.equal(result.stats.categories.reduce((sum, item) => sum + item.count, 0), 2);
  assert.equal(result.stats.categories.find(({ id }) => id === "laboratory").count, 1);
});

test("conflicting catalogue aliases and unknown studies never borrow an arbitrary category", () => {
  const ambiguous = [{ name: "Назва", category: "anemia" }, { name: "Назва", category: "ultrasound" }];
  assert.equal(getBookingCategory(booking({ service: "Назва" }), ambiguous), "other");
  assert.equal(getBookingCategory(booking({ service: "Феритин невідомий пакет" }), catalog), "other");
});

test("Kyiv inclusive dates handle UTC legacy, offsets and summer/winter boundaries", () => {
  assert.equal(getBookingKyivDate("2026-10-15 21:00:00"), "2026-10-16");
  assert.equal(getBookingKyivDate("2026-10-16 20:59:59.999999"), "2026-10-16");
  assert.equal(getBookingKyivDate("2026-01-15 22:00:00"), "2026-01-16");
  assert.equal(getBookingKyivDate("2026-01-16T00:00:00+02"), "2026-01-16");
  assert.equal(getBookingKyivDate("not-a-date"), undefined);
  const result = selectAdminBookings([
    booking({ id: "before", createdAt: "2026-10-15 20:59:59" }),
    booking({ id: "start", createdAt: "2026-10-15 21:00:00" }),
    booking({ id: "end", createdAt: "2026-10-16 20:59:59.999999" }),
    booking({ id: "after", createdAt: "2026-10-16 21:00:00" }),
  ], query("from=2026-10-16&to=2026-10-16"));
  assert.equal(result.stats.total, 2);
  assert.deepEqual(result.bookings.map(({ id }) => id), ["end", "start"]);
  // Daylight-saving transitions have 23 and 25 hours, still one calendar day.
  for (const [day, start, end] of [
    ["2026-03-29", "2026-03-28T22:00:00Z", "2026-03-29T20:59:59Z"],
    ["2026-10-25", "2026-10-24T21:00:00Z", "2026-10-25T21:59:59Z"],
  ]) {
    assert.equal(getBookingKyivDate(start), day);
    assert.equal(getBookingKyivDate(end), day);
  }
});

test("filters and pagination do not narrow the date-period summary", () => {
  const records = [
    booking({ id: "a", patientName: "Олена", status: "new", createdAt: "2026-10-16 12:00:00" }),
    booking({ id: "b", patientName: "Олена", status: "confirmed", createdAt: "2026-10-16 13:00:00" }),
    booking({ id: "c", service: "Холтер ЕКГ", status: "cancelled" }),
  ];
  const result = selectAdminBookings(records, query("category=mri&status=confirmed&q=олена&page=99&pageSize=1"));
  assert.equal(result.total, 1);
  assert.equal(result.page, 1);
  assert.equal(result.totalPages, 1);
  assert.equal(result.bookings[0].id, "b");
  assert.equal(result.stats.total, 3);
  assert.deepEqual(result.stats.statuses, { new: 1, contacted: 0, confirmed: 1, closed: 0, cancelled: 1 });
});

test("stable newest ordering normalizes UTC, ISO and offset timestamps", () => {
  const result = selectAdminBookings([
    booking({ id: "old", createdAt: "2026-10-16T13:00:00+03:00" }),
    booking({ id: "a", createdAt: "2026-10-16 12:00:00" }),
    booking({ id: "b", createdAt: "2026-10-16T12:00:00.000000Z" }),
  ], query());
  assert.deepEqual(result.bookings.map(({ id }) => id), ["b", "a", "old"]);
});

test("production Neon timestamps retain bookings in the period and sort newest first", () => {
  const parseTimestamp = types.getTypeParser(1184);
  const records = [
    booking({ id: "z-older", createdAt: parseTimestamp("2026-10-14 14:48:52.251+00") }),
    booking({ id: "a-newest", createdAt: parseTimestamp("2026-10-16 16:59:40+00") }),
    booking({ id: "outside", createdAt: parseTimestamp("2026-09-16 20:59:59+00") }),
  ];
  assert.ok(records.every(({ createdAt }) => createdAt instanceof Date));
  const result = selectAdminBookings(records, query("from=2026-09-17&to=2026-10-16"));
  assert.equal(result.stats.total, 2);
  assert.equal(result.stats.statuses.new, 2);
  assert.deepEqual(result.bookings.map(({ id }) => id), ["a-newest", "z-older"]);
  assert.deepEqual(selectAdminBookings(records, query()).bookings.map(({ id }) => id),
    ["a-newest", "z-older", "outside"]);
  assert.equal(getBookingKyivDate(parseTimestamp("2026-10-15 21:00:00+00")), "2026-10-16");
  assert.equal(getBookingKyivDate(new Date(NaN)), undefined);
});

test("invalid dates, categories and excessive page sizes fail before querying storage", () => {
  for (const params of ["from=2026-02-30", "from=16.10.2026", "from=2026-10-17&to=2026-10-16",
    "category=__proto__", "status=unknown", "page=-1", "page=1.5", "pageSize=101", "pageSize=0",
    `q=${"x".repeat(201)}`]) assert.throws(() => query(params));
  assert.equal(query("category=all&status=all").category, undefined);
  assert.equal(query().pageSize, 25);
});

function isolatedStore() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.function("lower", (value) => value.toLocaleLowerCase("uk-UA"));
  const queries = [];
  const prepare = (sql, values = []) => ({
    bind: (...bound) => prepare(sql, bound),
    all: async () => { queries.push({ sql, values }); return { results: sqlite.prepare(sql).all(...values) }; },
    run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }),
  });
  return { sqlite, queries, store: load("../app/api/bookings/bookingStore.ts", { runtimeEnv: { env: { DB: { prepare } } } }) };
}

test("storage counts beyond 250 and fetches full personal data for only the selected page", async () => {
  const fixture = isolatedStore();
  try {
    await fixture.store.ensureBookingsTable();
    const insert = fixture.sqlite.prepare(`INSERT INTO bookings
      (id, reference, patient_name, phone, service, comment, source, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (let index = 0; index < 301; index += 1) insert.run(
      `id-${String(index).padStart(3, "0")}`, `ZR-${index}`, index === 0 ? "Олена 100%_тест" : "Тестова заявка",
      "+380000000001", index === 0 ? "Феритин" : "МРТ", "Коментар:\nЗворотний дзвінок", "contacts",
      index === 0 ? "confirmed" : "new", new Date().toISOString(),
    );
    const result = await fixture.store.listAdminBookings(query("page=13"), catalog);
    assert.equal(result.total, 301);
    assert.equal(result.stats.total, 301);
    assert.equal(result.totalPages, 13);
    assert.equal(result.bookings.length, 1);
    assert.equal(result.stats.categories.find(({ id }) => id === "laboratory").count, 1);
    const summaryQuery = fixture.queries.find(({ sql }) => /SELECT id, service, doctor, comment, source, status, created_at/u.test(sql));
    assert.ok(summaryQuery);
    assert.doesNotMatch(summaryQuery.sql, /patient_name|phone|consent|LIMIT/u);
    const contactQuery = fixture.queries.find(({ sql }) => /WHERE id IN/u.test(sql));
    assert.equal(contactQuery.values.length, 1);

    const search = await fixture.store.listAdminBookings(query("q=ОЛЕНА%20100%25_&status=confirmed"), catalog);
    assert.equal(search.total, 1);
    assert.equal(search.bookings[0].patientName, "Олена 100%_тест");
    assert.equal(search.stats.total, 301);
    assert.equal(search.bookings[0].category, "laboratory");
  } finally { fixture.sqlite.close(); }
});

test("GET authenticates, validates parameters and returns private paginated results", async () => {
  let authorized = false;
  let calls = 0;
  const result = { bookings: [], stats: { total: 0, statuses: {}, categories: [] }, total: 0, page: 1, pageSize: 25, totalPages: 1 };
  const route = load("../app/api/admin/bookings/route.ts", {
    adminAuth: {
      isAuthorizedAdmin: async () => authorized,
      unauthorizedAdminResponse: () => Response.json({ error: "Unauthorized" }, { status: 401 }),
    },
    bookingStore: { listAdminBookings: async () => { calls += 1; return result; } },
    priceStore: { listManagedPriceItems: async () => catalog },
    requestBody: { readBoundedJson: async () => ({}) },
  });
  assert.equal((await route.GET(new Request("https://example.invalid/api/admin/bookings"))).status, 401);
  assert.equal(calls, 0);
  authorized = true;
  assert.equal((await route.GET(new Request("https://example.invalid/api/admin/bookings?from=2026-02-30"))).status, 400);
  assert.equal(calls, 0);
  const response = await route.GET(new Request("https://example.invalid/api/admin/bookings"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), result);
});
