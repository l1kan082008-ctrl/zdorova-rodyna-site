import test from "node:test";
import assert from "node:assert/strict";
import { compatibleLocations, formatBookingPhone, serviceCategory } from "../lib/bookingRequest.ts";

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
  const locations = [{ id: "main", services: ["ct", "doctors", "laboratory"] }, { id: "lab", services: ["laboratory"] }];
  assert.deepEqual(compatibleLocations(locations, "КТ").map(({ id }) => id), ["main"]);
  assert.deepEqual(compatibleLocations(locations, "Консультації лікарів").map(({ id }) => id), ["main"]);
  assert.equal(compatibleLocations(locations, "Лабораторні дослідження").length, 2);
  assert.equal(compatibleLocations(locations, "Допоможіть обрати послугу").length, 2);
  assert.equal(compatibleLocations(locations, "Комплекс досліджень").length, 0);
  assert.equal(compatibleLocations([], "КТ").length, 0);
});
