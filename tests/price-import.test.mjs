import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import XLSX from 'xlsx';

const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  }}).outputText;
  new Function('require', 'module', 'exports', code)(id => id.startsWith('.')
    ? load(path.resolve(path.dirname(file), id.endsWith('.ts') ? id : `${id}.ts`))
    : require(id), module, module.exports);
  return module.exports;
}
const { parsePriceWorkbook } = load('app/admin/prices/priceImport.ts');
function workbook(rows) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Назва', 'Ціна', 'Категорія', 'ID'], ...rows,
  ]), 'Прайс');
  return XLSX.write(wb, {type:'buffer', bookType:'xlsx'});
}
test('distinct service IDs allow identical names', async () => {
  const result = await parsePriceWorkbook(workbook([
    ['Кортизол', 200, 'hormones', 'first'], ['Кортизол', 300, 'hormones', 'second'],
  ]));
  assert.deepEqual(result.issues, []);
  assert.equal(result.rows.length, 2);
});
test('duplicate IDs are rejected even with different names', async () => {
  const result = await parsePriceWorkbook(workbook([
    ['Кортизол', 200, 'hormones', 'first'], ['Інший аналіз', 300, 'hormones', 'first'],
  ]));
  assert.equal(result.issues.length, 1);
});
test('blank price is not silently imported as zero', async () => {
  const result = await parsePriceWorkbook(workbook([['Кортизол', '', 'hormones', 'first']]));
  assert.ok(result.issues.length);
  assert.equal(result.rows.length, 0);
});
if (process.env.PRICE_WORKBOOK_CHECK) {
  test('delivered workbook preserves the full catalog', async () => {
    const result = await parsePriceWorkbook(readFileSync(process.env.PRICE_WORKBOOK_CHECK));
    const { officialPriceItems } = load('app/prices/officialPriceData.ts');
    assert.deepEqual(result.issues, []);
    assert.equal(result.rows.length, officialPriceItems.length);
    for (const item of officialPriceItems) {
      const row = result.rows.find(row => row.id === item.id);
      assert.ok(row, item.id);
      assert.equal(row.amount, item.amount);
      assert.equal(row.category, item.category);
    }
  });
}
