import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Run the actual route and validation with isolated storage, notifier and doctor
// boundaries. Tests cannot connect to a real database or send notifications.
function load(path, dependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", outputText)((id) => {
    if (!(id in dependencies)) throw new Error(`Unexpected dependency: ${id}`);
    return dependencies[id];
  }, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const screening = load("../lib/screening40.ts");
const details = load("../lib/bookingDetails.ts");
const payload = (extra = {}) => ({
  name: "Тестова Олена Іванівна", phone: "+38 067 123-45-67",
  doctorId: screening.screeningDoctorIds[0], service: screening.screeningServiceName,
  source: "screening-40", consentVersion: "screening-40-v1", consent: true, ...extra,
});

function harness(options = {}) {
  const saved = [], notifications = [], doctorLookups = [];
  const doctor = {
    id: screening.screeningDoctorIds[0], name: "Іщук Надія Степанівна",
    branch: options.branch ?? screening.screeningAddress, isActive: true,
  };
  const route = load("../app/api/bookings/route.ts", {
    "@/lib/screening40": screening,
    "@/lib/bookingDetails": details,
    "@/lib/requestBody": load("../lib/requestBody.ts"),
    "@/lib/publicSubmissionSecurity": {
      isSameOriginSubmission: () => options.sameOrigin !== false,
      checkPublicSubmissionRateLimit: async () => options.rateLimit ?? { allowed: true },
      verifyTurnstileIfConfigured: async () => options.human !== false,
    },
    "../doctors/publicDoctors": { getPublicDoctorById: async (id) => {
      doctorLookups.push(id);
      return options.unavailable ? null : { ...doctor, id, isActive: options.active !== false };
    } },
    "./bookingStore": { createBooking: async (value) => { saved.push(value); return "ZR-SCREENING-ISOLATED"; } },
    "@/lib/bookingNotification": { sendBookingNotification: async (value) => { notifications.push(value); } },
  });
  return { saved, notifications, doctorLookups, doctor, submit: (body = payload()) => route.POST(new Request("https://example.test/api/bookings", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  })) };
}

test("full-name validation accepts patronymic-free, hyphenated and apostrophe names but rejects incomplete or malformed names", () => {
  for (const name of ["Олена Коваль", "  Коваль  Олена Іванівна  ", "Лук’яненко Марія-Анна", "Стефанюк Стефаніʼя", "José García"])
    assert.equal(screening.isScreeningFullName(name), true, name);
  for (const name of ["", "Олена", "Олена 123", "Коваль О.", "<script> alert", "-Коваль Олена", `${"а".repeat(99)} б`])
    assert.equal(screening.isScreeningFullName(name), false, name);
});

test("screening saves and notifies once with the published doctor and fixed programme location, ignoring other branches and submitted details", async () => {
  const h = harness({ branch: "м. Костопіль, вул. Грушевського, 4" });
  const response = await h.submit(payload({ name: "  Тестова   Олена  Іванівна ", doctor: "Підроблений лікар", branch: "Підроблена адреса", comment: "Обрані дослідження:\n• Феритин" }));
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).reference, "ZR-SCREENING-ISOLATED");
  assert.equal(h.saved.length, 1);
  assert.equal(h.notifications.length, 1);
  const saved = h.saved[0];
  assert.equal(saved.patientName, "Тестова Олена Іванівна");
  assert.equal(saved.doctor, h.doctor.name);
  assert.equal(saved.service, screening.screeningServiceName);
  assert.equal(saved.source, "screening-40");
  assert.equal(saved.consentVersion, "screening-40-v1");
  assert.equal(details.parseBookingDetails(saved.comment).location, screening.screeningAddress);
  assert.deepEqual(details.parseBookingDetails(saved.comment).studies, []);
  assert.doesNotMatch(JSON.stringify(saved), /Підроблен|Феритин|Костопіль/u);
  assert.equal(h.notifications[0].doctor, saved.doctor);
  assert.equal(h.notifications[0].comment, saved.comment);
});

test("all four programme doctor IDs are accepted only after resolving an active profile", async () => {
  for (const doctorId of screening.screeningDoctorIds) {
    const h = harness();
    assert.equal((await h.submit(payload({ doctorId }))).status, 201);
    assert.deepEqual(h.doctorLookups, [doctorId]);
  }
});

test("screening accepts no doctor preference without a published-doctor lookup", async () => {
  for (const doctorId of [undefined, "", "   "]) {
    const h = harness({ unavailable: true });
    const response = await h.submit(payload({ doctorId, name: "  Тестова   Олена  Іванівна " }));
    assert.equal(response.status, 201);
    assert.equal(h.saved.length, 1);
    assert.equal(h.notifications.length, 1);
    assert.deepEqual(h.doctorLookups, []);
    const saved = h.saved[0];
    assert.equal(saved.patientName, "Тестова Олена Іванівна");
    assert.equal(saved.doctor, "");
    assert.equal(saved.source, "screening-40");
    assert.equal(saved.service, screening.screeningServiceName);
    assert.equal(saved.consentVersion, "screening-40-v1");
    const parsed = details.parseBookingDetails(saved.comment);
    assert.equal(parsed.location, screening.screeningAddress);
    assert.equal(parsed.comment, "Заявка на участь у державній програмі «Скринінг здоров’я 40+». Допоможіть обрати лікаря.");
    assert.deepEqual(parsed.studies, []);
    assert.equal(h.notifications[0].doctor, "");
    assert.equal(h.notifications[0].comment, saved.comment);
  }
});

test("no-preference screening ignores submitted doctor, branch and comment text", async () => {
  const h = harness();
  const response = await h.submit(payload({
    doctorId: undefined, doctor: "Підроблений лікар", branch: "Підроблена адреса",
    comment: "Обрані дослідження:\n• Феритин",
  }));
  assert.equal(response.status, 201);
  assert.equal(h.saved[0].doctor, "");
  assert.equal(details.parseBookingDetails(h.saved[0].comment).location, screening.screeningAddress);
  assert.doesNotMatch(JSON.stringify(h.saved[0]), /Підроблен|Феритин/u);
  assert.deepEqual(h.doctorLookups, []);
});

test("malformed doctor IDs are rejected instead of silently becoming no preference", async () => {
  for (const doctorId of [null, 0, false, [], {}, "a".repeat(101), " ".repeat(101)]) {
    const h = harness();
    assert.equal((await h.submit(payload({ doctorId }))).status, 400, JSON.stringify(doctorId));
    assert.equal(h.saved.length, 0);
    assert.equal(h.notifications.length, 0);
    assert.deepEqual(h.doctorLookups, []);
  }
});

test("incomplete name, invalid phone, consent and programme mismatches cannot create a request", async () => {
  for (const patch of [
    { name: "Олена" }, { name: "Олена 123" }, { name: "а".repeat(101) },
    { phone: "+380000000000" }, { phone: "1234567890" },
    { consent: false }, { consentVersion: "contacts-v1" }, { service: "Консультації лікарів" },
    { source: "contacts", consentVersion: "contacts-v1", doctorId: "unrelated-doctor" },
    { doctorId: "unrelated-doctor" },
  ]) {
    const h = harness();
    assert.equal((await h.submit(payload(patch))).status, 400, JSON.stringify(patch));
    assert.equal(h.saved.length, 0);
    assert.equal(h.notifications.length, 0);
  }
});

test("hidden, removed or unavailable doctors are not restored by submitting stale form values", async () => {
  for (const options of [{ active: false }, { unavailable: true }]) {
    const h = harness(options);
    assert.equal((await h.submit()).status, 400);
    assert.equal(h.saved.length, 0);
    assert.equal(h.notifications.length, 0);
  }
});

test("screening uses existing origin, rate limit, turnstile and honeypot protections", async () => {
  for (const [options, expected] of [
    [{ sameOrigin: false }, 403],
    [{ rateLimit: { allowed: false, configured: true, retryAfter: 60 } }, 429],
    [{ human: false }, 400],
  ]) {
    const h = harness(options);
    assert.equal((await h.submit()).status, expected);
    assert.equal(h.saved.length, 0);
  }
  const h = harness();
  assert.equal((await h.submit(payload({ website: "bot.invalid" }))).status, 201);
  assert.equal(h.saved.length, 0);
  assert.equal(h.notifications.length, 0);
  assert.equal(h.doctorLookups.length, 0);
});

test("regular bookings and family declarations keep their existing contract without programme doctor lookup", async () => {
  for (const [source, service] of [["contacts", "Консультації лікарів"], ["family-declaration", "Заявка на декларацію із сімейним лікарем"]]) {
    const h = harness();
    assert.equal((await h.submit({ name: "Олена", phone: "+380671234567", source, service, doctor: "Обраний лікар", consent: true, consentVersion: `${source}-v1` })).status, 201);
    assert.equal(h.saved[0].doctor, "Обраний лікар");
    assert.equal(h.doctorLookups.length, 0);
  }
});
