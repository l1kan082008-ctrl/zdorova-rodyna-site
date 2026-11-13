import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();

// Use the real matching functions, references and current bundled catalog,
// resolving the extensionless TypeScript imports without framework dependencies.
function load(relative) {
  let filename = path.resolve(root, relative);
  if (!path.extname(filename)) filename += ".ts";
  assert.ok(filename.startsWith(root + path.sep));
  if (modules.has(filename)) return modules.get(filename).exports;
  const loaded = { exports: {} };
  modules.set(filename, loaded);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", compiled)(name => {
    if (name.startsWith("@/")) return load(name.slice(2));
    if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), name)));
    throw new Error("Unexpected dependency: " + name);
  }, loaded, loaded.exports);
  return loaded.exports;
}

const { compatibleLocations, serviceCategory } = load("lib/bookingRequest.ts");
const { priceReferences, resolvePriceItem } = load("app/prices/priceReferences.ts");
const { officialPriceItems } = load("app/prices/officialPriceData.ts");
const { getServiceDetail } = load("app/services/serviceData.ts");
const { centerLocations } = load("app/contacts/locationData.ts");
const { resolveImagingBookingCategory } = load("lib/imagingBooking.ts");
const holter = resolvePriceItem(officialPriceItems.filter(item => item.isActive !== false), priceReferences.holter);
assert.ok(holter, "an active Holter reference exists in the catalog");
const holterNames = [...new Set([holter.name, ...(holter.aliases ?? []), ...priceReferences.holter.aliases, getServiceDetail("holter").title])];

test("the active Holter price name, aliases and long service title select only the published Stelmakha branch", () => {
  const publishedMain = {
    ...centerLocations.find(location => location.id === "stelmakha-18m"),
    fullAddress: "м. Рівне, вул. Володимира Стельмаха, 18-М — актуальні дані",
  };
  const locations = Object.freeze([...centerLocations.filter(location => location.id !== publishedMain.id), publishedMain]);
  for (const name of holterNames) {
    for (const service of [name, `  ${name.toLocaleUpperCase("uk-UA").replace(/ /gu, "   ")}  `]) {
      const selected = compatibleLocations(locations, service);
      assert.equal(selected.length, 1, service);
      assert.equal(selected[0], publishedMain, "use the passed published object, not a bundled substitute");
      assert.equal(serviceCategory(service), null, "Holter must not become an ultrasound or doctor category");
    }
  }
});

test("Holter never invents a branch when Stelmakha is absent from the published locations", () => {
  const otherLocations = centerLocations.filter(location => location.id !== "stelmakha-18m");
  assert.ok(otherLocations.length > 0);
  for (const service of holterNames) {
    assert.deepEqual(compatibleLocations(otherLocations, service), []);
    assert.deepEqual(compatibleLocations([], service), []);
  }
});

test("the price-name contacts URL stays a general booking with a recognized Holter branch", () => {
  const url = new URL("/contacts", "https://example.test");
  url.searchParams.set("service", holter.name);
  url.searchParams.set("location", "stelmakha-18m");
  url.hash = "booking";
  assert.equal(url.pathname, "/contacts");
  assert.equal(url.hash, "#booking");
  assert.equal(resolveImagingBookingCategory(url.searchParams, "/services/holter"), null);
  assert.deepEqual(compatibleLocations(centerLocations, url.searchParams.get("service")).map(location => location.id), [url.searchParams.get("location")]);
  assert.equal(url.searchParams.has("bookingCategory"), false);
  assert.equal(url.searchParams.has("priceItemId"), false);
});

test("existing cardiology and category filtering is unchanged, without broad Holter substring matching", () => {
  const locations = [
    { id: "stelmakha-18m", city: "Рівне", services: ["ct", "mri", "ultrasound", "doctors", "laboratory"] },
    { id: "lab", city: "Рівне", services: ["laboratory"] },
    { id: "other-doctors", city: "Звягель", services: ["doctors", "ultrasound"] },
    { id: "brody-zaliznychna-37b", city: "Броди", services: ["laboratory", "ct", "doctors"] },
  ];
  for (const service of ["Кардіологія", "Кардіологія та діагностика серця"]) {
    assert.deepEqual(compatibleLocations(locations, service).map(location => location.id), ["stelmakha-18m"]);
  }
  for (const service of ["КТ головного мозку", "МРТ головного мозку"]) {
    assert.deepEqual(compatibleLocations(locations, service).map(location => location.id), ["stelmakha-18m"]);
  }
  assert.deepEqual(compatibleLocations(locations, "УЗД нирок").map(location => location.id), ["stelmakha-18m", "other-doctors"]);
  assert.deepEqual(compatibleLocations(locations, "Лабораторні дослідження").map(location => location.id), ["stelmakha-18m", "lab"]);
  assert.deepEqual(compatibleLocations(locations, "Допоможіть обрати послугу").map(location => location.id), ["stelmakha-18m", "lab", "other-doctors"]);
  assert.deepEqual(compatibleLocations(locations, "Консультація за результатами Холтера").map(location => location.id), ["stelmakha-18m", "other-doctors"]);
  for (const unknown of ["Налаштування Холтера", "Холтер стороннього центру", "Комплекс досліджень", "Аналізи вдома", ""]) {
    assert.deepEqual(compatibleLocations(locations, unknown), [], unknown + " does not gain a fabricated branch match");
  }
});
