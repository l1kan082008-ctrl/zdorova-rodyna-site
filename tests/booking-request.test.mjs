import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Load the real TypeScript modules, including Next's extensionless imports.
function load(url) {
  const { outputText } = ts.transpileModule(readFileSync(url, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(specifier => {
    assert.ok(specifier.startsWith("."), "only local dependencies are expected");
    return load(new URL(specifier.endsWith(".ts") ? specifier : `${specifier}.ts`, url));
  }, loaded, loaded.exports);
  return loaded.exports;
}

const { compatibleLocations, formatBookingPhone, serviceCategory, normalizeBookingService, isHomeVisitService, homeVisitAddressComment } = load(new URL("../lib/bookingRequest.ts", import.meta.url));

test("phone accepts national, international and pasted formatted Ukrainian numbers", () => {
  for (const input of ["0671234567", "+38 (067) 123-45-67", "380671234567", "00380671234567"]) {
    assert.equal(formatBookingPhone(input), "067 123 45 67");
  }
  assert.equal(formatBookingPhone(""), "");
  assert.equal(formatBookingPhone("067123456789"), "067 123 45 67");
});

test("specific investigations map to supported department capabilities", () => {
  assert.equal(serviceCategory("КТ приносових пазух"), "ct");
  assert.equal(serviceCategory("МРТ головного мозку"), "mri");
  assert.equal(serviceCategory("УЗД нирок"), "ultrasound");
  assert.equal(serviceCategory("ЕХО (УЗД) серця"), "ultrasound");
  assert.equal(serviceCategory("Консультація лікаря"), "doctors");
  assert.equal(serviceCategory("Аналізи вдома"), null);
});

test("a laboratory-only branch is not offered for CT or a doctor", () => {
  const locations = [{ id: "main", city: "Рівне", services: ["ct", "doctors", "laboratory"] }, { id: "lab", city: "Рівне", services: ["laboratory"] }];
  assert.deepEqual(compatibleLocations(locations, "КТ").map(({ id }) => id), ["main"]);
  assert.deepEqual(compatibleLocations(locations, "Консультації лікарів").map(({ id }) => id), ["main"]);
  assert.equal(compatibleLocations(locations, "Лабораторні дослідження").length, 2);
  assert.equal(compatibleLocations(locations, "Допоможіть обрати послугу").length, 2);
  assert.equal(compatibleLocations(locations, "Комплекс досліджень").length, 0);
  assert.equal(compatibleLocations([], "КТ").length, 0);
});


test("home visit aliases share one booking service and preserve the entered address", () => {
  for (const label of ["Медсестра додому", "Виїзд медичної сестри додому", "Аналізи вдома"]) {
    assert.equal(normalizeBookingService(label), "Медсестра додому");
    assert.equal(isHomeVisitService(label), true);
  }
  assert.equal(normalizeBookingService("КТ"), "КТ");
  assert.equal(isHomeVisitService("КТ"), false);
  assert.equal(homeVisitAddressComment("  Тестова, 10  "), "Адреса виїзду: Тестова, 10.");
  assert.equal(homeVisitAddressComment("   "), "");
  assert.equal(homeVisitAddressComment("1234"), "");
  assert.equal(homeVisitAddressComment("x".repeat(201)), "");
});

test("home visits retain suburban settlements and do not duplicate Rivne", () => {
  assert.equal(homeVisitAddressComment("  с. Бармаки, вул. Тестова, 10  "), "Адреса виїзду: с. Бармаки, вул. Тестова, 10.");
  assert.equal(homeVisitAddressComment("м. Рівне, вул. Тестова, 20, кв. 3"), "Адреса виїзду: м. Рівне, вул. Тестова, 20, кв. 3.");
});
