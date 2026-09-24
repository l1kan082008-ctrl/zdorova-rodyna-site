import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";

// Execute the production modules with a disposable database and no credentials.
// This covers storage semantics, not the deployed PostgreSQL connection.
function loadModule(path, env) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loadedModule = { exports: {} };
  const require = (name) => {
    if (name === "server-only") return {};
    if (name.endsWith("runtimeEnv")) return { env };
    if (name.endsWith("bookingDetails")) return loadModule("../lib/bookingDetails.ts", env);
    throw new Error(`Unexpected test dependency: ${name}`);
  };
  new Function("require", "module", "exports", outputText)(require, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

function temporaryDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  const prepare = (sql, values = []) => ({
    bind: (...bound) => prepare(sql, bound),
    all: async () => ({ results: sqlite.prepare(sql).all(...values) }),
    first: async () => sqlite.prepare(sql).get(...values) ?? null,
    run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }),
  });
  return { sqlite, DB: { prepare } };
}

test("booking is persisted, readable by admin, confirmed and removed in an isolated database", async () => {
  const database = temporaryDatabase();
  try {
    const store = loadModule("../app/api/bookings/bookingStore.ts", database);
    const reference = await store.createBooking({
      patientName: "ТЕСТ — не пацієнт",
      phone: "+380000000001",
      service: "ЕХО (УЗД) серця",
      doctor: "",
      comment: "Ізольована автоматична перевірка",
      source: "contacts",
      consentVersion: "contacts-v1",
    });
    assert.match(reference, /^ZR-/);
    const [booking] = await store.listBookings();
    assert.equal(booking.reference, reference);
    assert.equal(booking.service, "ЕХО (УЗД) серця");
    assert.equal(booking.status, "new");
    assert.equal(booking.consentVersion, "contacts-v1");
    assert.ok(Date.parse(booking.retentionUntil) > Date.now());
    assert.equal(await store.updateBookingStatus(booking.id, "confirmed"), true);
    assert.equal((await store.listBookings())[0].status, "confirmed");
    assert.deepEqual(await store.listPopularBookingServices(), [{ service: booking.service, count: 1 }]);
    assert.equal(await store.deleteBooking(booking.id), true);
    assert.deepEqual(await store.listBookings(), []);
  } finally {
    database.sqlite.close();
  }
});

test("notification without configuration does not attempt external delivery", async () => {
  const { sendBookingNotification } = loadModule("../lib/bookingNotification.ts", {});
  assert.deepEqual(await sendBookingNotification({}), { sent: false, configured: false });
});

test("notification payload preserves booking reference without sending mail", async (context) => {
  let captured;
  context.mock.method(globalThis, "fetch", async (url, options) => {
    captured = { url, options };
    return new Response("{}", { status: 200 });
  });
  const { sendBookingNotification } = loadModule("../lib/bookingNotification.ts", {
    RESEND_API_KEY: "test-only-not-a-key",
    BOOKING_NOTIFICATION_TO: "admin@example.invalid",
    BOOKING_NOTIFICATION_FROM: "test@example.invalid",
  });
  assert.deepEqual(await sendBookingNotification({
    reference: "ZR-TEST", patientName: "ТЕСТ", phone: "+380000000001",
    service: "МРТ", doctor: "", comment: "", source: "contacts",
  }), { sent: true, configured: true });
  assert.equal(captured.options.headers["Idempotency-Key"], "booking-ZR-TEST");
  const payload = JSON.parse(captured.options.body);
  assert.match(payload.text, /ZR-TEST/);
  assert.match(payload.text, /МРТ/);
  assert.deepEqual(payload.to, ["admin@example.invalid"]);
});

test("notification separates structured studies, branch, total and multiline patient comment", async (context) => {
  let payload;
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    payload = JSON.parse(options.body);
    return new Response("{}", { status: 200 });
  });
  const { sendBookingNotification } = loadModule("../lib/bookingNotification.ts", {
    RESEND_API_KEY: "test-only-not-a-key",
    BOOKING_NOTIFICATION_TO: "admin@example.invalid",
    BOOKING_NOTIFICATION_FROM: "test@example.invalid",
  });
  const studies = [
    "Загальний аналіз крові (ШОЕ, лейкоцитарна формула) — СІТО",
    "Білірубіновий комплекс (білірубін загальний + білірубін прямий) — СІТО",
    "Доплата СІТО (2 досл., до 2 годин) — 400 ₴",
  ];
  await sendBookingNotification({
    reference: "ZR-FORMAT", patientName: "ТЕСТ — не пацієнт", phone: "+380000000001",
    service: "Комплекс досліджень", doctor: "", source: "contacts",
    comment: [
      "Бажане відділення: м. Рівне, вул. Тестова, 1.",
      `Обрані дослідження:\n${studies.map((study) => `• ${study}`).join("\n")}`,
      "Орієнтовна сума: 1 570 ₴.",
      "Коментар:\nТехнічна перевірка.\nЗателефонуйте після 15:00.",
    ].join("\n\n"),
  });
  assert.equal(payload.text, [
    "Нова заявка ZR-FORMAT",
    "Пацієнт: ТЕСТ — не пацієнт\nТелефон: +380000000001\nПослуга: Комплекс досліджень",
    "Відділення: м. Рівне, вул. Тестова, 1",
    `Обрані дослідження:\n${studies.map((study, index) => `${index + 1}. ${study}`).join("\n")}`,
    "Орієнтовна сума: 1 570 ₴",
    "Коментар:\nТехнічна перевірка.\nЗателефонуйте після 15:00.",
    "Джерело: contacts",
    "Заявка також збережена в захищеній адмінпанелі сайту.",
  ].join("\n\n"));
});

test("notification makes legacy laboratory selection readable without splitting commas inside names", async (context) => {
  let payload;
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    payload = JSON.parse(options.body);
    return new Response("{}", { status: 200 });
  });
  const { sendBookingNotification } = loadModule("../lib/bookingNotification.ts", {
    RESEND_API_KEY: "test-only-not-a-key",
    BOOKING_NOTIFICATION_TO: "admin@example.invalid",
    BOOKING_NOTIFICATION_FROM: "test@example.invalid",
  });
  const studies = [
    "Загальний аналіз крові (ШОЕ, лейкоцитарна формула) — СІТО",
    "Білірубін загальний — СІТО",
    "Доплата СІТО (2 досл., до 2 годин) — 400 ₴",
  ];
  await sendBookingNotification({
    reference: "ZR-LEGACY", patientName: "ТЕСТ — не пацієнт", phone: "+380000000001",
    service: "Комплекс досліджень", doctor: "", source: "contacts",
    comment: `Допоможіть обрати відділення. Обрані дослідження: ${studies.join(", ")}. Орієнтовна сума: 1 570 ₴. Технічна перевірка.`,
  });
  assert.ok(payload.text.includes(`Відділення: Допоможіть обрати відділення.\n\nОбрані дослідження:\n${studies.map((study, index) => `${index + 1}. ${study}`).join("\n")}`));
  assert.ok(payload.text.includes("\n\nОрієнтовна сума: 1 570 ₴\n\nКоментар:\nТехнічна перевірка."));
});
