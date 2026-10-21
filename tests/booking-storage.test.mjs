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
    if (name.endsWith("adminBookingStatistics")) return loadModule("../lib/adminBookingStatistics.ts", env);
    if (name.endsWith("bookingDateTime")) return loadModule("../app/admin/bookings/bookingDateTime.ts", env);
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

function insertBookingFixture(database, values) {
  const id = crypto.randomUUID();
  database.sqlite.prepare(`INSERT INTO bookings
    (id, reference, patient_name, phone, service, comment, source, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, `ZR-${id}`, "ТЕСТ — не пацієнт", "+380000000001", values.service,
      values.comment ?? "", values.source ?? "contacts", values.status ?? "new",
      values.createdAt ?? new Date().toISOString());
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
    assert.deepEqual(await store.listPopularBookingServices(), [{ service: booking.service, count: 1 }]);
    assert.equal(await store.updateBookingStatus(booking.id, "confirmed"), true);
    assert.equal((await store.listBookings())[0].status, "confirmed");
    assert.deepEqual(await store.listPopularBookingServices(), [{ service: booking.service, count: 1 }]);
    assert.equal(await store.deleteBooking(booking.id), true);
    assert.deepEqual(await store.listBookings(), []);
  } finally {
    database.sqlite.close();
  }
});

test("popular services count all submitted statuses in the last 30 days, excluding cancelled and non-service enquiries", async () => {
  const database = temporaryDatabase();
  try {
    const store = loadModule("../app/api/bookings/bookingStore.ts", database);
    await store.ensureBookingsTable();
    for (const status of ["new", "contacted", "confirmed", "closed", "cancelled"]) {
      insertBookingFixture(database, { service: "Холтер ЕКГ", status });
    }
    insertBookingFixture(database, {
      service: "Холтер ЕКГ", status: "confirmed",
      createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const comment = "Обрані дослідження:\n• Феритин";
    for (const source of ["callback", "family-declaration", "screening-40"]) {
      insertBookingFixture(database, { service: "Холтер ЕКГ", source, comment });
    }
    for (const service of ["Зворотний дзвінок", "Заявка на декларацію із сімейним лікарем", "Скринінг здоров’я 40+", "Скринінг 40+"]) {
      insertBookingFixture(database, { service, source: "legacy", comment });
    }
    assert.deepEqual(await store.listPopularBookingServices(), [{ service: "Холтер ЕКГ", count: 4 }]);
  } finally {
    database.sqlite.close();
  }
});

test("popular services score structured selected studies once and discard CITO surcharges and patient text", async () => {
  const database = temporaryDatabase();
  try {
    const store = loadModule("../app/api/bookings/bookingStore.ts", database);
    const { formatBookingComment } = loadModule("../lib/bookingDetails.ts", database);
    await store.ensureBookingsTable();
    insertBookingFixture(database, {
      service: "Комплекс досліджень",
      comment: formatBookingComment({
        locationComment: "Допоможіть обрати відділення.",
        studies: [
          "Феритин — CITO", "  феритин  — СІТО", "Феритин — ЦІТО",
          "Загальний аналіз крові (ШОЕ, лейкоцитарна формула) — СІТО",
          "Доплата CITO (2 досл., до 2 годин) — 200 ₴",
          "Доплата СІТО (2 досл., до 2 годин) — 200 ₴",
          "Доплата ЦІТО (2 досл., до 2 годин) — 200 ₴",
        ].join(" | "),
        total: "1000",
        comment: "Особистий коментар: Глюкоза. Обрані дослідження:\n• КТ головного мозку",
      }),
    });
    assert.deepEqual(await store.listPopularBookingServices(), [
      { service: "Феритин", count: 1 },
      { service: "Загальний аналіз крові (ШОЕ, лейкоцитарна формула)", count: 1 },
    ]);
  } finally {
    database.sqlite.close();
  }
});

test("selected studies replace even a named summary while ordinary and legacy pipe services remain countable", async () => {
  const database = temporaryDatabase();
  try {
    const store = loadModule("../app/api/bookings/bookingStore.ts", database);
    await store.ensureBookingsTable();
    insertBookingFixture(database, {
      service: "Консультація кардіолога",
      comment: "Обрані дослідження:\n• ЕХО (УЗД) серця",
    });
    insertBookingFixture(database, {
      service: "ЕХО (УЗД) серця | ехо  (узд)  серця — CITO | ЕКГ | ЕКГ — ЦІТО",
      comment: "Особистий коментар про Феритин",
    });
    insertBookingFixture(database, { service: "ЕКГ", comment: "Коментар:\nОбрані дослідження:\n• Феритин" });
    assert.deepEqual(Object.fromEntries((await store.listPopularBookingServices())
      .map(({ service, count }) => [service, count])), {
      "ЕХО (УЗД) серця": 2,
      "ЕКГ": 2,
    });
  } finally {
    database.sqlite.close();
  }
});

test("popular services understand legacy laboratory comments without splitting clinical commas", async () => {
  const database = temporaryDatabase();
  try {
    const store = loadModule("../app/api/bookings/bookingStore.ts", database);
    await store.ensureBookingsTable();
    const studies = [
      "Загальний аналіз крові (ШОЕ, лейкоцитарна формула) — СІТО",
      "Феритин — CITO",
      "Доплата СІТО (2 досл., до 2 годин) — 200 ₴",
    ];
    insertBookingFixture(database, {
      service: "Комплекс досліджень",
      comment: `Допоможіть обрати відділення. Обрані дослідження: ${studies.join(", ")}. Орієнтовна сума: 1 000 ₴. Особистий коментар.`,
    });
    assert.deepEqual(await store.listPopularBookingServices(), [
      { service: "Загальний аналіз крові (ШОЕ, лейкоцитарна формула)", count: 1 },
      { service: "Феритин", count: 1 },
    ]);
  } finally {
    database.sqlite.close();
  }
});

test("popular services include the full 30-day window beyond 500 bookings", async () => {
  const database = temporaryDatabase();
  try {
    const store = loadModule("../app/api/bookings/bookingStore.ts", database);
    await store.ensureBookingsTable();
    for (let index = 0; index < 501; index += 1) {
      insertBookingFixture(database, { service: "Феритин" });
    }
    insertBookingFixture(database, {
      service: "Холтер ЕКГ", createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    });
    assert.deepEqual(await store.listPopularBookingServices(), [
      { service: "Феритин", count: 501 },
      { service: "Холтер ЕКГ", count: 1 },
    ]);
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
