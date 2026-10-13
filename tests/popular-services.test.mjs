import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(path) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => {
    if (name.endsWith("priceReferences")) return load("../app/prices/priceReferences.ts");
    if (name.endsWith("deduplicateSearch")) return load("../app/prices/deduplicateSearch.ts");
    throw new Error(`Unexpected dependency: ${name}`);
  }, loaded, loaded.exports);
  return loaded.exports;
}

const { rankPopularPriceItems } = load("../lib/popularServices.ts");
const item = (id, name, extra = {}) => ({
  id, name, category: "heart", categoryLabel: "Серце", amount: 700, ...extra,
});
const echo = item("official-uzd-012", "ЕХО (УЗД) серця", { amount: 850 });
const holter = item("official-uzd-027", "Холтер ЕКГ (Добове моніторування)");

test("combines aliases before ranking and retains current catalogue prices", () => {
  const result = rankPopularPriceItems([
    { service: "Холтер", count: 5 },
    { service: "ЕхоКГ", count: 3 },
    { service: "  УЗД   серця ", count: 3 },
  ], [echo, holter]);
  assert.deepEqual(result.map(({ item, count }) => [item.id, count]), [
    [echo.id, 6], [holter.id, 5],
  ]);
  assert.equal(result[0].item.amount, 850);
});

test("current managed names and aliases work for new services without code changes", () => {
  const custom = item("new-price", "Нове дослідження", { aliases: ["Попередня назва"] });
  assert.deepEqual(rankPopularPriceItems([
    { service: "НОВЕ  ДОСЛІДЖЕННЯ", count: 2 },
    { service: "Попередня назва", count: 1 },
  ], [custom]), [{ item: custom, count: 3 }]);
});

test("unknown and ambiguous requests never select an arbitrary priced procedure", () => {
  const prices = [
    item("mri-head", "МРТ головного мозку"),
    item("mri-knee", "МРТ коліна"),
    item("us-left", "УЗД суглоба зліва"),
    item("us-right", "УЗД суглоба справа"),
  ];
  assert.deepEqual(rankPopularPriceItems([
    { service: "МРТ", count: 100 },
    { service: "УЗД суглоба", count: 90 },
    { service: "Допоможіть обрати послугу", count: 80 },
    { service: "Комплекс досліджень", count: 70 },
    { service: "Зворотний дзвінок", count: 60 },
    { service: "Приватний коментар", count: 50 },
  ], prices), []);
});

test("hidden, removed and invalid statistics cannot become public cards", () => {
  assert.deepEqual(rankPopularPriceItems([
    { service: "ЕхоКГ", count: 100 },
    { service: "Видалений аналіз", count: 90 },
    { service: "Холтер", count: 0 },
    { service: "Холтер", count: Number.NaN },
  ], [{ ...echo, isActive: false }, holter]), []);
});

test("ties have stable order independent of database result order", () => {
  const stats = [{ service: "Холтер", count: 1 }, { service: "ЕхоКГ", count: 1 }];
  assert.deepEqual(rankPopularPriceItems(stats, [holter, echo]),
    rankPopularPriceItems([...stats].reverse(), [echo, holter]));
});

test("equivalent cross-category procedures count once, differing execution conditions stay ambiguous", () => {
  const ct = item("creatinine-ct", "Швидке тестування на креатинін", { category: "ct", amount: 300 });
  const mri = { ...ct, id: "creatinine-mri", category: "mri" };
  const stats = [{ service: ct.name, count: 4 }];
  assert.deepEqual(rankPopularPriceItems(stats, [mri, ct]), [{ item: ct, count: 4 }]);
  assert.deepEqual(rankPopularPriceItems(stats, [ct, { ...mri, amount: 400 }]), []);
  assert.deepEqual(rankPopularPriceItems(stats, [ct, { ...mri, turnaround: "Завтра" }]), []);
});

test("removed studies never transfer their popularity to a similarly named package or exam", () => {
  const prices = [
    item("package", "Комплекс (Ліпаза, глюкоза)", { amount: 3670 }),
    item("enzyme", "Лактатдегідрогеназа"),
    item("contrast", "МРТ головного мозку з ангіографією з контрастом"),
  ];
  assert.deepEqual(rankPopularPriceItems([
    { service: "Ліпаза", count: 10 },
    { service: "Лактат", count: 9 },
    { service: "МРТ головного мозку з ангіографією", count: 8 },
  ], prices), []);
});
