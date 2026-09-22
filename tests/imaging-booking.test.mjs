import assert from "node:assert/strict";
import test from "node:test";
import { officialPriceItems } from "../app/prices/officialPriceData.ts";
import { getImagingBookingOptions, getOfficialCtPosition, imagingBookingLabels, isBookableImagingItem, resolveImagingBookingCategory } from "../lib/imagingBooking.ts";

const item = (id, category, name, extra = {}) => ({ id, category, name, categoryLabel: category, amount: 100, ...extra });
const resolve = (values = {}, pathname) => resolveImagingBookingCategory(new URLSearchParams(values), pathname);

test("explicit imaging categories survive a direct contacts link and take precedence over its service name", () => {
  assert.deepEqual(imagingBookingLabels, { ultrasound: "УЗД", ct: "КТ", mri: "МРТ" });
  for (const bookingCategory of ["ultrasound", "ct", "mri"]) {
    assert.equal(resolve({ bookingCategory, service: "Дослідження за направленням" }, "/contacts"), bookingCategory);
  }
  assert.equal(resolve({ bookingCategory: "ct", service: "МРТ головного мозку" }), "ct");
});

test("doctor and calculator bundle selections cannot turn into single-modality booking", () => {
  assert.equal(resolve({ doctor: "Лікар", bookingCategory: "ct", service: "КТ" }, "/services/ct"), null);
  assert.equal(resolve({ services: "УЗД нирок; КТ голови", bookingCategory: "ultrasound" }), null);
  assert.equal(resolve({ services: "  ", doctor: " ", service: "МРТ" }), "mri");
});

test("legacy study links infer modality from a specific service, including Doppler", () => {
  for (const [service, category] of [
    ["КТ приносових пазух", "ct"], [" МРТ головного мозку ", "mri"],
    ["УЗД нирок", "ultrasound"], ["ЕХО (УЗД) серця", "ultrasound"],
    ["Доплерографія судин шиї (артерії + вени)", "ultrasound"],
  ]) assert.equal(resolve({ service }), category);
  assert.equal(resolve({ bookingCategory: "untrusted", service: "КТ голови" }), "ct");
  assert.equal(resolve({ service: "Консультація кардіолога" }, "/services/ct"), null);
  assert.equal(resolve({ service: "Аналіз крові" }, "/services/ultrasound"), null);
  assert.equal(resolve({ service: "КТГ" }), null);
});

test("source-page fallback applies only to an exact imaging page with no requested service", () => {
  for (const category of ["ultrasound", "ct", "mri"]) {
    assert.equal(resolve({}, "/services/" + category), category);
    assert.equal(resolve({ service: "  " }, "/services/" + category + "/"), category);
  }
  for (const path of [undefined, "/contacts", "/services/cardiology", "/services/ct-extra", "/services/ct/details"]) {
    assert.equal(resolve({}, path), null);
  }
});

test("options stay within their modality and remove inactive, empty and duplicate names without reordering", () => {
  const items = [
    item("us1", "ultrasound", "  УЗД нирок  "),
    item("ct1", "ct", "КТ голови"),
    item("us2", "ultrasound", "узд   нирок"),
    item("us3", "ultrasound", "Приховане УЗД", { isActive: false }),
    item("doppler", "doppler", "Доплерографія судин шиї"),
    item("empty", "ultrasound", " "),
    item("mri", "mri", "МРТ голови"),
    item("lab", "general", "Загальний аналіз крові"),
  ];
  assert.deepEqual(getImagingBookingOptions(items, "ultrasound"), ["УЗД нирок", "Доплерографія судин шиї"]);
  assert.deepEqual(getImagingBookingOptions(items, "ct"), ["КТ голови"]);
  assert.deepEqual(getImagingBookingOptions(items, "mri"), ["МРТ голови"]);
  assert.deepEqual(getImagingBookingOptions([], "ct"), []);
});

test("CT accessory exclusions match existing price links, including legacy sort-order fallback", () => {
  for (const position of [60, 61, 62, 63, 64, 65, 68]) {
    assert.equal(isBookableImagingItem(item("official-230-" + String(position).padStart(3, "0"), "ct", "Додаткова послуга")), false);
    assert.equal(isBookableImagingItem(item("legacy-" + position, "ct", "Додаткова послуга", { sortOrder: position + 2999 })), false);
  }
  for (const position of [1, 59, 66, 67]) {
    assert.equal(isBookableImagingItem(item("official-230-" + String(position).padStart(3, "0"), "ct", "Дослідження")), true);
  }
  assert.equal(getOfficialCtPosition({ id: "official-230-001", sortOrder: 3059 }), 1);
  assert.equal(getOfficialCtPosition({ id: "new-study", sortOrder: 3068 }), null);
  assert.equal(isBookableImagingItem(item("new-study", "ct", "Нове дослідження")), true);
});

test("MRI accessory exclusions retain independently bookable additional studies", () => {
  for (const position of [116, 117, 118, 119, 120, 123]) {
    assert.equal(isBookableImagingItem(item("official-258-" + position, "mri", "Додаткова послуга")), false);
  }
  for (const id of ["official-258-115", "official-258-121", "official-258-122", "new-study"]) {
    assert.equal(isBookableImagingItem(item(id, "mri", "Дослідження")), true);
  }
});

test("the shipped catalog offers imaging studies and Doppler but no accessories or unrelated investigations", () => {
  for (const category of ["ultrasound", "ct", "mri"]) {
    const options = getImagingBookingOptions(officialPriceItems, category);
    assert.ok(options.length > 10, category + " has a meaningful catalog");
    for (const name of options) {
      assert.ok(officialPriceItems.some(entry => entry.name.trim() === name && (entry.category === category || (category === "ultrasound" && entry.category === "doppler"))));
    }
  }
  const ultrasound = getImagingBookingOptions(officialPriceItems, "ultrasound");
  for (const entry of officialPriceItems.filter(entry => entry.category === "doppler" && entry.isActive !== false)) assert.ok(ultrasound.includes(entry.name.trim()));
  for (const id of ["official-230-060", "official-230-068", "official-258-116", "official-258-123"]) {
    const accessory = officialPriceItems.find(entry => entry.id === id);
    assert.ok(accessory, id + " exists in catalog");
    assert.ok(!getImagingBookingOptions(officialPriceItems, accessory.category).includes(accessory.name.trim()));
  }
});
