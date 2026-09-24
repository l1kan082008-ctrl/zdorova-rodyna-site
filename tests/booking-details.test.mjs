import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/bookingDetails.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const loaded = { exports: {} };
new Function("module", "exports", outputText)(loaded, loaded.exports);
const { formatBookingComment, parseBookingDetails } = loaded.exports;

const studies = [
  "Загальний розгорнутий аналіз крові (параметри аналізатора, ШОЕ — автоматичний підрахунок) — СІТО",
  "Загальний розгорнутий аналіз крові (параметри аналізатора, ШОЕ, лейкоцитарна формула) ручний підрахунок — СІТО",
  "Аналіз крові на ретикулоцити з підрахуванням ретикулоцитарного індексу — СІТО",
  "Білірубін загальний — СІТО",
  "Білірубін прямий — СІТО",
  "Білірубіновий комплекс (білірубін загальний + білірубін прямий + білірубін непрямий) — СІТО",
  "Доплата СІТО (6 досл., до 2 годин) — 400 ₴",
];

test("existing lab booking separates all six studies, surcharge, branch and total", () => {
  const details = parseBookingDetails(`Допоможіть обрати відділення. Обрані дослідження: ${studies.join(", ")}. Орієнтовна сума: 1 570 ₴. Передзвоніть після 15:00.`);
  assert.deepEqual(details, {
    location: "Допоможіть обрати відділення.", studies, total: "1 570 ₴", comment: "Передзвоніть після 15:00.",
  });
});

test("old address abbreviations and clinical commas remain intact", () => {
  const details = parseBookingDetails("Бажане відділення: м. Рівне, вул. Володимира Стельмаха, 18-М. Обрані дослідження: Глюкоза, сироватка, Тест (А, Б [1, 2]). Орієнтовна сума: 250,5 ₴.");
  assert.equal(details.location, "м. Рівне, вул. Володимира Стельмаха, 18-М");
  assert.deepEqual(details.studies, ["Глюкоза, сироватка", "Тест (А, Б [1, 2])"]);
  assert.equal(details.total, "250,5 ₴");
  assert.equal(details.comment, "");
});

test("new format round-trips exact study titles and multiline patient text", () => {
  const selected = [...studies, "Тест, А та Б", "Показники без дужок, СРБ, ШОЕ"];
  const comment = "Передзвоніть після 15:00.\nЗручно у вівторок.\n\nОрієнтовна сума: уточніть, будь ласка.";
  const serialized = formatBookingComment({
    locationComment: "Бажане відділення: м. Рівне, тестова адреса.",
    studies: selected.join(" | "), total: "1570", comment,
  });
  const details = parseBookingDetails(serialized);
  assert.equal(details.location, "м. Рівне, тестова адреса");
  assert.deepEqual(details.studies, selected);
  assert.match(details.total, /^1\s570 ₴$/u);
  assert.equal(details.comment, comment);
});

test("a new single-service booking has a branch without an empty comment", () => {
  assert.deepEqual(parseBookingDetails(formatBookingComment({
    locationComment: "Бажане відділення: м. Рівне, тестова адреса.", studies: "", total: "", comment: "",
  })), { location: "м. Рівне, тестова адреса", studies: [], total: "", comment: "" });
});

test("new study list without price and home-visit address are preserved", () => {
  const result = parseBookingDetails(formatBookingComment({
    locationComment: "Адреса виїзду: м. Рівне, тестова вулиця, 10.",
    studies: "Аналіз А | Аналіз Б", total: "unknown", comment: "Домофон 5.\nДругий поверх.",
  }));
  assert.deepEqual(result.studies, ["Аналіз А", "Аналіз Б"]);
  assert.equal(result.total, "");
  assert.equal(result.comment, "Адреса виїзду: м. Рівне, тестова вулиця, 10.\n\nДомофон 5.\nДругий поверх.");
});

test("ordinary and ambiguous legacy comments are not guessed or lost", () => {
  for (const text of [
    "Передзвоніть у вівторок.\n\nЗ повагою, тест.",
    "Обрані дослідження: Аналіз А, Аналіз Б. Прошу зателефонувати.",
    "Бажане відділення: м. Рівне, тестова адреса. Передзвоніть після 15:00.",
    "Адреса виїзду: м. Рівне, тестова адреса. Другий поверх.",
  ]) {
    assert.deepEqual(parseBookingDetails(text), { location: "", studies: [], total: "", comment: text });
  }
  assert.deepEqual(parseBookingDetails(""), { location: "", studies: [], total: "", comment: "" });
});
