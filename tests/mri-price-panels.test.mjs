import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requirePackage = createRequire(import.meta.url);
const modules = new Map();

// Exercise real server rendering, catalog data and grouping. Only framework
// Link and CSS modules are replaced, without a browser or duplicate price data.
function load(relative) {
  let filename = path.resolve(root, relative);
  if (!path.extname(filename)) filename += existsSync(filename + ".tsx") ? ".tsx" : ".ts";
  if (modules.has(filename)) return modules.get(filename).exports;
  assert.ok(filename.startsWith(root + path.sep));
  const loadedModule = { exports: {} };
  modules.set(filename, loadedModule);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const resolve = name => {
    if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (name === "next/link") return {
      __esModule: true,
      default: ({ children, ...props }) => React.createElement("a", props, children),
    };
    if (name.startsWith("@/")) return load(name.slice(2));
    if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), name)));
    if (["react", "react/jsx-runtime"].includes(name)) return requirePackage(name);
    throw new Error("Unexpected rendering dependency: " + name);
  };
  new Function("require", "module", "exports", source)(resolve, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { MriPriceTabs } = load("app/services/[slug]/MriPriceTabs.tsx");
const { MRI_PRICE_GROUPS } = load("app/services/[slug]/mriPriceGroups.ts");
const { officialPriceItems } = load("app/prices/officialPriceData.ts");
const { radiologyPriceRegistry } = load("app/prices/radiologyPriceRegistry.ts");
const items = officialPriceItems.filter(item => item.category === "mri" && item.isActive !== false);
const nonBookablePositions = new Set([116, 117, 118, 119, 120, 123]);
const render = prices => renderToStaticMarkup(React.createElement(MriPriceTabs, { items: prices }));
const decode = value => value.replace(/&(amp|quot|lt|gt|#x27|#39|nbsp);/g, (_, entity) => ({
  amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'", nbsp: "\u00a0",
})[entity]);
const plainText = html => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name, decode(value)]));

// Price cells contain a nested note/content div. Balance their div tags instead
// of stopping at the first closing tag, so assertions cover the actual cells.
function divsByRole(html, role) {
  const matches = [...html.matchAll(new RegExp(`<div\\b[^>]*role="${role}"[^>]*>`, "g"))];
  return matches.map(match => {
    const tags = /<\/?div\b[^>]*>/g;
    tags.lastIndex = match.index + match[0].length;
    let depth = 1;
    let closing;
    while (depth && (closing = tags.exec(html))) depth += closing[0].startsWith("</") ? -1 : 1;
    assert.equal(depth, 0, `${role} has balanced HTML`);
    return {
      attributes: attributes(match[0]),
      hidden: /\shidden(?:[\s=>])/.test(match[0]),
      html: html.slice(match.index + match[0].length, closing.index),
    };
  });
}

const panels = html => divsByRole(html, "tabpanel");
const tabs = html => [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map(([tag]) => attributes(tag));
const columnHeaders = panel => [...panel.html.matchAll(/<span\b[^>]*role="columnheader"[^>]*>([\s\S]*?)<\/span>/g)]
  .map(([, header]) => plainText(header));

function rows(panel) {
  return divsByRole(panel.html, "row").filter(row => row.html.includes('role="rowheader"')).map(row => ({
    name: plainText(row.html.match(/<strong\b[^>]*role="rowheader"[^>]*>([\s\S]*?)<\/strong>/)?.[1] ?? ""),
    variants: divsByRole(row.html, "cell").map(variant => ({
      text: plainText(variant.html),
      amounts: [...variant.html.matchAll(/<strong\b[^>]*>([\s\S]*?)<\/strong>/g)].map(([, amount]) => plainText(amount)),
      notes: [...variant.html.matchAll(/<small\b[^>]*>([\s\S]*?)<\/small>/g)].map(([, note]) => plainText(note)),
      links: [...variant.html.matchAll(/<a\b[^>]*href="[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => ({
        url: new URL(attributes(link).href, "https://example.test"),
        label: attributes(link)["aria-label"],
        text: plainText(link),
      })),
    })),
  }));
}

function variantFor(renderedPanels, item) {
  const entry = radiologyPriceRegistry[item.id];
  const groupId = entry?.group ?? "additional";
  const panel = renderedPanels.find(value => value.attributes.id === `mri-price-panel-${groupId}`);
  assert.ok(panel, item.id + " is in the initial HTML");
  const row = rows(panel).find(value => value.name === plainText(entry?.pairName ?? item.name));
  assert.ok(row, item.id + " has an ordinary HTML row");
  const variant = row.variants[entry?.contrast ? 1 : 0];
  assert.ok(variant, item.id + " retains its contrast column");
  return variant;
}

function assertBooking(variant, item) {
  assert.equal(variant.links.length, 1, item.id + " has one booking link");
  const { url, label } = variant.links[0];
  assert.equal(url.pathname, "/contacts");
  assert.deepEqual([...url.searchParams.keys()], ["service", "bookingCategory", "priceItemId"]);
  assert.equal(url.searchParams.get("service"), item.name);
  assert.equal(url.searchParams.get("bookingCategory"), "mri");
  assert.equal(url.searchParams.get("priceItemId"), item.id);
  assert.equal(url.hash, "#booking");
  assert.equal(label, `Записатися на ${item.name}`);
}

test("initial MRI server HTML includes all nonempty groups and each grouped row once", t => {
  const html = render(items);
  assert.doesNotMatch(html, /<script\b/i, "prices are ordinary HTML rather than script or JSON data");
  const renderedPanels = panels(html);
  const renderedTabs = tabs(html);
  assert.equal(renderedPanels.length, 9);
  assert.deepEqual(renderedPanels.map(panel => panel.attributes.id), MRI_PRICE_GROUPS.map(group => `mri-price-panel-${group.id}`));
  assert.deepEqual(renderedPanels.filter(panel => !panel.hidden).map(panel => panel.attributes.id), ["mri-price-panel-head"]);
  assert.equal(renderedTabs.length, renderedPanels.length);

  for (const group of MRI_PRICE_GROUPS) {
    const panel = renderedPanels.find(entry => entry.attributes.id === `mri-price-panel-${group.id}`);
    const tab = renderedTabs.find(entry => entry.id === `mri-price-tab-${group.id}`);
    assert.ok(tab, group.id + " has an associated tab");
    assert.equal(tab["aria-controls"], panel.attributes.id);
    assert.equal(panel.attributes["aria-labelledby"], tab.id);
    assert.equal(tab["aria-selected"], String(!panel.hidden));
    assert.equal(tab.tabindex, panel.hidden ? "-1" : "0");
    const expectedNames = [...new Set(items.filter(item => radiologyPriceRegistry[item.id].group === group.id)
      .map(item => plainText(radiologyPriceRegistry[item.id].pairName)))];
    const renderedRows = rows(panel);
    assert.deepEqual(renderedRows.map(row => row.name), expectedNames, group.id + " contains all existing grouped rows once");
    assert.deepEqual(columnHeaders(panel), group.id === "additional"
      ? ["Дослідження", "Вартість"] : ["Дослідження", "Без контрасту", "З контрастом"]);
    assert.ok(renderedRows.every(row => row.variants.length === (group.id === "additional" ? 1 : 2)), group.id + " retains its column layout");
  }
  t.diagnostic(`${renderedPanels.length} groups, ${renderedPanels.flatMap(rows).length} rows, ${items.length} catalog price variants`);
});

test("every active MRI variant keeps its price, contrast column and exact booking target", t => {
  const renderedPanels = panels(render(items));
  let bookable = 0;
  let accessories = 0;
  for (const item of items) {
    const entry = radiologyPriceRegistry[item.id];
    assert.ok(entry, item.id + " is mapped in the shared radiology registry");
    const variant = variantFor(renderedPanels, item);
    const expectedLabel = entry.group === "additional" ? "Вартість" : entry.contrast ? "З контрастом" : "Без контрасту";
    assert.ok(variant.text.startsWith(expectedLabel), item.id + " retains its column label");
    assert.deepEqual(variant.amounts, [`${item.amount.toLocaleString("uk-UA").replace(/\s+/g, " ")} грн`], item.id + " retains one exact catalog amount");
    assert.ok(!variant.text.includes("Не передбачено"));
    const position = Number(item.id.match(/official-258-(\d+)$/)?.[1]);
    if (nonBookablePositions.has(position)) {
      assert.equal(variant.links.length, 0, item.id + " remains a non-bookable service position");
      assert.ok(!variant.text.includes("Записатися"));
      accessories++;
    } else {
      assertBooking(variant, item);
      bookable++;
    }
  }
  const renderedVariants = renderedPanels.flatMap(rows).flatMap(row => row.variants);
  assert.equal(renderedVariants.reduce((count, variant) => count + variant.amounts.length, 0), items.length, "every catalog amount appears in one price cell");
  assert.equal(renderedVariants.reduce((count, variant) => count + variant.links.length, 0), bookable, "booking links are neither missing nor duplicated");
  for (const variant of renderedVariants.filter(value => value.amounts.length === 0)) {
    assert.ok(variant.text.endsWith("Не передбачено"), "missing contrast options retain their unavailable message");
    assert.equal(variant.links.length, 0);
  }
  t.diagnostic(`${bookable} bookable variants, ${accessories} non-bookable positions`);
});

test("MRI variant-specific notes remain with dynamic contrast and pilonidal cyst options", () => {
  const renderedPanels = panels(render(items));
  const expectedNotes = new Map([
    ["official-258-014", "Динамічне контрастування"],
    ["official-258-052", "Пілонідальна кіста"],
  ]);
  for (const item of items) {
    assert.deepEqual(variantFor(renderedPanels, item).notes, expectedNotes.has(item.id) ? [expectedNotes.get(item.id)] : [], item.id + " note stays in its own price cell");
  }
  assert.equal(renderedPanels.flatMap(rows).flatMap(row => row.variants).reduce((count, variant) => count + variant.notes.length, 0), 2);
});

test("empty and inactive groups are omitted, with the first available group selected when head is absent", () => {
  const reducedItems = items.filter(item => ["head", "neck", "special"].includes(radiologyPriceRegistry[item.id].group))
    .map(item => radiologyPriceRegistry[item.id].group === "head" ? { ...item, isActive: false } : item);
  const html = render(reducedItems);
  const renderedPanels = panels(html);
  assert.deepEqual(renderedPanels.map(panel => panel.attributes.id), ["mri-price-panel-neck", "mri-price-panel-special"]);
  assert.deepEqual(renderedPanels.filter(panel => !panel.hidden).map(panel => panel.attributes.id), ["mri-price-panel-neck"]);
  assert.deepEqual(tabs(html).map(tab => [tab.id, tab["aria-selected"], tab.tabindex]), [
    ["mri-price-tab-neck", "true", "0"],
    ["mri-price-tab-special", "false", "-1"],
  ]);
  assert.equal(panels(render([])).length, 0);
  assert.equal(tabs(render([])).length, 0);
  const inactiveHtml = render(items.map(item => ({ ...item, isActive: false })));
  assert.equal(panels(inactiveHtml).length, 0);
  assert.equal(tabs(inactiveHtml).length, 0);
  assert.doesNotMatch(inactiveHtml, /priceItemId=/);
});

test("deactivating one MRI contrast option leaves its pair available without a stale price or booking link", () => {
  const withoutContrast = items.find(item => item.id === "official-258-001");
  const withContrast = items.find(item => item.id === "official-258-002");
  assert.ok(withoutContrast && withContrast);
  const renderedPanels = panels(render([withoutContrast, { ...withContrast, isActive: false }]));
  const renderedRows = rows(renderedPanels[0]);
  assert.equal(renderedRows.length, 1);
  assert.equal(renderedRows[0].variants.length, 2);
  assertBooking(renderedRows[0].variants[0], withoutContrast);
  assert.deepEqual(renderedRows[0].variants[1].amounts, []);
  assert.deepEqual(renderedRows[0].variants[1].links, []);
  assert.equal(renderedRows[0].variants[1].text, "З контрастом Не передбачено");
});

test("catalog changes supply current prices and an unregistered MRI item falls back to additional services", () => {
  const updated = { ...items.find(item => item.id === "official-258-001"), amount: 4321, name: "МРТ головного мозку — оновлена назва" };
  const unregistered = { ...updated, id: "custom-mri-regression", name: "Додаткове МРТ-дослідження", amount: 3210 };
  const html = render([updated, unregistered]);
  const renderedPanels = panels(html);
  assert.deepEqual(renderedPanels.map(panel => panel.attributes.id), ["mri-price-panel-head", "mri-price-panel-additional"]);
  assert.deepEqual(variantFor(renderedPanels, updated).amounts, ["4 321 грн"]);
  assertBooking(variantFor(renderedPanels, updated), updated);
  const additional = renderedPanels[1];
  assert.deepEqual(columnHeaders(additional), ["Дослідження", "Вартість"]);
  assert.equal(rows(additional).length, 1);
  assert.equal(rows(additional)[0].variants.length, 1);
  assert.deepEqual(variantFor(renderedPanels, unregistered).amounts, ["3 210 грн"]);
  assertBooking(variantFor(renderedPanels, unregistered), unregistered);
});
