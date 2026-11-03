import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compiled = new Map();
function load(path, dependencies = {}, globals = {}) {
  if (!compiled.has(path)) compiled.set(path, ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText);
  const loaded = { exports: {} };
  new Function("require", "module", "exports", ...Object.keys(globals), compiled.get(path))((name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  }, loaded, loaded.exports, ...Object.values(globals));
  return loaded.exports;
}

const details = load("../lib/bookingDetails.ts");
const imaging = load("../lib/imagingBooking.ts");
const body = load("../lib/requestBody.ts");
const screening = load("../lib/screening40.ts");
const study = (extra = {}) => ({
  id: "ct-head", name: "КТ головного мозку", category: "ct", categoryLabel: "КТ", amount: 1200, isActive: true, ...extra,
});
const patientComment = "Передзвоніть після 16:00.\n\nОрієнтовна сума: 1 ₴.";
const structuredComment = (total = "7777") => details.formatBookingComment({
  locationComment: "Бажане відділення: м. Рівне, тестова адреса.",
  studies: "", total, comment: patientComment,
});
const payload = (extra = {}) => ({
  name: "Тестова Олена", phone: "0671234567", service: "КТ головного мозку", doctor: "",
  source: "contacts", consent: true, consentVersion: "contacts-v1", comment: structuredComment(),
  priceItemId: "ct-head", total: 1, amount: 1, ...extra,
});

function harness(options = {}) {
  const state = { catalog: options.catalog ?? [study()], catalogCalls: 0, stored: [], notifications: [] };
  const pricing = load("../lib/bookingPricing.ts", {
    "./bookingDetails": details, "./imagingBooking": imaging,
    "../app/prices/priceData": { catalogItems: options.bundledCatalog ?? [study({ amount: 999 })] },
    "../app/api/prices/priceStore": { listPublicPriceItems: async () => {
      state.catalogCalls += 1;
      if (options.unavailable) throw new Error("Isolated catalogue unavailable");
      return state.catalog;
    } },
  }, { process: { env: options.local ? {} : { DATABASE_URL: "isolated-test-placeholder" } }, console: { warn() {} } });
  const route = load("../app/api/bookings/route.ts", {
    "@/lib/requestBody": body, "@/lib/bookingDetails": details, "@/lib/bookingPricing": pricing,
    "@/lib/screening40": screening,
    "@/lib/publicSubmissionSecurity": {
      isSameOriginSubmission: () => true,
      checkPublicSubmissionRateLimit: async () => ({ allowed: true }),
      verifyTurnstileIfConfigured: async () => true,
    },
    "./bookingStore": { createBooking: async (value) => { state.stored.push(structuredClone(value)); return "ZR-PRICING-TEST"; } },
    "@/lib/bookingNotification": { sendBookingNotification: async (value) => state.notifications.push(structuredClone(value)) },
  });
  const submit = (extra = {}) => route.POST(new Request("https://example.test/api/bookings", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload(extra)),
  }));
  return { state, pricing, submit };
}

test("single imaging bookings persist the current server price and notify the same snapshot", async () => {
  for (const item of [
    study(), study({ id: "mri-knee", category: "mri", name: "МРТ колінного суглоба", amount: 2100 }),
    study({ id: "us-thyroid", category: "ultrasound", name: "УЗД щитоподібної залози", amount: 500 }),
    study({ id: "doppler-neck", category: "doppler", name: "Доплер судин шиї", amount: 700 }),
  ]) {
    const h = harness({ catalog: [item] });
    assert.equal((await h.submit({ service: item.name, priceItemId: item.id })).status, 201);
    const saved = h.state.stored[0];
    const parsed = details.parseBookingDetails(saved.comment);
    assert.equal(parsed.total, `${item.amount.toLocaleString("uk-UA")} ₴`);
    assert.equal(parsed.location, "м. Рівне, тестова адреса");
    assert.equal(parsed.comment, patientComment);
    assert.ok(saved.comment.indexOf(`Орієнтовна сума: ${parsed.total}.`) < saved.comment.indexOf("Коментар:\n"));
    assert.equal(h.state.notifications[0].comment, saved.comment);
    assert.equal(h.state.catalogCalls, 1);
  }
});

test("changing a catalogue price cannot reprice an already saved booking", async () => {
  const h = harness();
  assert.equal((await h.submit()).status, 201);
  const snapshot = h.state.stored[0].comment;
  h.state.catalog = [study({ amount: 1600 })];
  assert.equal((await h.submit()).status, 201);
  assert.equal(h.state.stored[0].comment, snapshot);
  assert.match(details.parseBookingDetails(snapshot).total, /^1\s200 ₴$/u);
  assert.match(details.parseBookingDetails(h.state.stored[1].comment).total, /^1\s600 ₴$/u);
  const historicalUnpriced = structuredComment("");
  assert.equal(details.parseBookingDetails(historicalUnpriced).total, "");
});

test("legacy name-only submissions use an exact unambiguous active price, including equal-price duplicates", async () => {
  for (const catalog of [[study()], [study(), study({ id: "same-price" })]]) {
    const h = harness({ catalog });
    assert.equal((await h.submit({ priceItemId: undefined, service: "КТ   головного МОЗКУ" })).status, 201);
    assert.match(details.parseBookingDetails(h.state.stored[0].comment).total, /^1\s200 ₴$/u);
  }
});

test("strict invalid IDs never fall back to a cheaper or same-name catalogue item", async () => {
  for (const priceItemId of ["missing", "", "   ", null, 12, {}, "x".repeat(201), "other-study"]) {
    const h = harness({ catalog: [study(), study({ id: "other-study", name: "КТ органів грудної клітки", amount: 1400 })] });
    assert.equal((await h.submit({ priceItemId })).status, 201);
    const saved = details.parseBookingDetails(h.state.stored[0].comment);
    assert.equal(saved.total, "", JSON.stringify(priceItemId));
    assert.equal(saved.comment, patientComment);
    assert.equal(saved.location, "м. Рівне, тестова адреса");
  }
});

test("ambiguous, hidden, accessory and invalid-amount positions preserve the lead without a fabricated total", async () => {
  for (const catalog of [
    [study(), study({ id: "different-price", amount: 1400 })],
    [study(), study({ id: "different-category", category: "mri" })],
    [study({ isActive: false })],
    [study({ id: "official-230-060" })],
    [study({ amount: NaN })], [study({ amount: -1 })], [],
  ]) {
    const h = harness({ catalog });
    // With an explicit modality, a same-name other-category item is correctly
    // excluded rather than making the eligible CT item ambiguous.
    const crossCategory = catalog.some((item) => item.category === "mri");
    assert.equal((await h.submit({ priceItemId: undefined })).status, 201);
    const parsed = details.parseBookingDetails(h.state.stored[0].comment);
    if (crossCategory) assert.match(parsed.total, /^1\s200 ₴$/u);
    else assert.equal(parsed.total, "");
    assert.equal(parsed.comment, patientComment);
  }
  const h = harness({ catalog: [study({ id: "official-258-116", category: "mri", name: "МРТ додаткова опція" })] });
  assert.equal((await h.submit({ service: "МРТ додаткова опція", priceItemId: "official-258-116" })).status, 201);
  assert.equal(details.parseBookingDetails(h.state.stored[0].comment).total, "");
});

test("zero is a real price but a generic modality without a selected study is not zero-priced", async () => {
  const free = harness({ catalog: [study({ amount: 0 })] });
  assert.equal((await free.submit()).status, 201);
  assert.equal(details.parseBookingDetails(free.state.stored[0].comment).total, "0 ₴");
  for (const service of ["КТ", "МРТ", "УЗД"]) {
    const h = harness({ catalog: [study({ name: service, amount: 0 })] });
    assert.equal((await h.submit({ service, priceItemId: undefined })).status, 201);
    assert.equal(details.parseBookingDetails(h.state.stored[0].comment).total, "");
  }
});

test("configured database failure preserves the lead and never uses bundled fallback prices", async () => {
  const h = harness({ unavailable: true });
  assert.equal((await h.submit()).status, 201);
  assert.equal(h.state.stored.length, 1);
  assert.equal(h.state.notifications.length, 1);
  assert.equal(h.state.catalogCalls, 1);
  const parsed = details.parseBookingDetails(h.state.stored[0].comment);
  assert.equal(parsed.total, "");
  assert.equal(parsed.comment, patientComment);
  assert.equal(parsed.location, "м. Рівне, тестова адреса");
  assert.equal(h.state.notifications[0].comment, h.state.stored[0].comment);
});

test("only an environment without a database uses the local bundled catalogue", async () => {
  const h = harness({ local: true });
  assert.equal((await h.submit()).status, 201);
  assert.equal(details.parseBookingDetails(h.state.stored[0].comment).total, "999 ₴");
  assert.equal(h.state.catalogCalls, 0);
});

test("other forms, consultations, calculator bundles and general enquiries remain unchanged", async () => {
  const h = harness();
  const ordinary = structuredComment();
  const bundle = details.formatBookingComment({ locationComment: "Допоможіть обрати відділення.", studies: "КТ головного мозку | МРТ головного мозку", total: "4000", comment: patientComment });
  for (const input of [
    { source: "callback", service: "Зворотний дзвінок", comment: ordinary },
    { source: "family-declaration", service: "Заявка на декларацію із сімейним лікарем", comment: ordinary },
    { source: "screening-40", service: screening.screeningServiceName, comment: ordinary },
    { source: "contacts", service: "КТ головного мозку", doctor: "Тестовий лікар", comment: ordinary },
    { source: "contacts", service: "КТ головного мозку", comment: bundle },
    { source: "contacts", service: "Комплекс досліджень", comment: ordinary },
    { source: "contacts", service: "КТ головного мозку | МРТ головного мозку", comment: ordinary },
    { source: "contacts", service: "Допоможіть обрати послугу", comment: ordinary },
  ]) {
    assert.equal(await h.pricing.applyImagingBookingPrice({ doctor: "", ...input }), input.comment);
  }
  assert.equal(h.state.catalogCalls, 0);
});

test("replacing or removing a generated estimate preserves user text and unstructured legacy notes", () => {
  for (const total of [1200, 0, null]) {
    const parsed = details.parseBookingDetails(details.withBookingTotal(structuredComment(), total));
    assert.equal(parsed.comment, patientComment);
    assert.equal(parsed.location, "м. Рівне, тестова адреса");
    assert.equal(parsed.total, total === null ? "" : `${total.toLocaleString("uk-UA")} ₴`);
  }
  const legacy = "Бажане відділення: м. Рівне, тестова адреса. Передзвоніть після 16:00.";
  assert.equal(details.parseBookingDetails(details.withBookingTotal(legacy, 1200)).comment, legacy);
  assert.throws(() => details.withBookingTotal("", -1), RangeError);
  assert.throws(() => details.withBookingTotal("", Infinity), RangeError);
});
