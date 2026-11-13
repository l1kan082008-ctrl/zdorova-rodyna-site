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

// Render the actual component, grouping registry and catalog. Only Next Link and
// CSS modules are replaced; no browser, API calls or duplicate price fixtures.
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

const { CtPriceTabs } = load("app/services/[slug]/CtPriceTabs.tsx");
const { CT_PRICE_GROUPS } = load("app/services/[slug]/ctPriceGroups.ts");
const { officialPriceItems } = load("app/prices/officialPriceData.ts");
const { radiologyPriceRegistry } = load("app/prices/radiologyPriceRegistry.ts");
const items = officialPriceItems.filter(item => item.category === "ct" && item.isActive !== false);
const render = prices => renderToStaticMarkup(React.createElement(CtPriceTabs, { items: prices }));
const decode = value => value.replace(/&(amp|quot|lt|gt|#x27|#39|nbsp);/g, (_, entity) => ({
  amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'", nbsp: "\u00a0",
})[entity]);
const plainText = html => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name, decode(value)]));

function panels(html) {
  const matches = [...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)];
  return matches.map((match, index) => ({
    attributes: attributes(match[0]),
    hidden: /\shidden(?:[\s=>])/.test(match[0]),
    html: html.slice(match.index + match[0].length, matches[index + 1]?.index ?? html.length),
  }));
}

function rows(panel) {
  return [...panel.html.matchAll(/<div class="priceRow" role="row">([\s\S]*?)(?=<div class="priceRow" role="row">|$)/g)]
    .map(([, html]) => ({
      name: plainText(html.match(/<strong\b[^>]*role="rowheader"[^>]*>([\s\S]*?)<\/strong>/)?.[1] ?? ""),
      variants: [...html.matchAll(/<div class="priceVariant" role="cell">([\s\S]*?)<\/div>/g)]
        .map(([, variant]) => ({
          text: plainText(variant),
          links: [...variant.matchAll(/<a\b[^>]*href="[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => ({
            url: new URL(attributes(link).href, "https://example.test"),
            text: plainText(link),
          })),
        })),
    }));
}

test("initial server HTML includes every CT group and study row exactly once", () => {
  const html = render(items);
  assert.doesNotMatch(html, /<script\b/i, "prices are HTML, not JSON or script payloads");
  const renderedPanels = panels(html);
  assert.equal(renderedPanels.length, 9);
  assert.deepEqual(renderedPanels.map(panel => panel.attributes.id), CT_PRICE_GROUPS.map(group => `ct-price-panel-${group.id}`));
  assert.deepEqual(renderedPanels.filter(panel => !panel.hidden).map(panel => panel.attributes.id), ["ct-price-panel-head"]);
  const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map(([tag]) => attributes(tag));
  assert.equal(tabs.length, renderedPanels.length);

  for (const group of CT_PRICE_GROUPS) {
    const panel = renderedPanels.find(entry => entry.attributes.id === `ct-price-panel-${group.id}`);
    const tab = tabs.find(entry => entry.id === `ct-price-tab-${group.id}`);
    assert.ok(tab, group.id + " has an associated tab");
    assert.equal(tab["aria-controls"], panel.attributes.id);
    assert.equal(panel.attributes["aria-labelledby"], tab.id);
    assert.equal(tab["aria-selected"], String(!panel.hidden));
    assert.equal(tab.tabindex, panel.hidden ? "-1" : "0");
    const expectedNames = [...new Set(items.filter(item => radiologyPriceRegistry[item.id].group === group.id)
      .map(item => plainText(radiologyPriceRegistry[item.id].pairName)))];
    const renderedRows = rows(panel);
    assert.deepEqual(renderedRows.map(row => row.name), expectedNames, group.id + " exposes the existing grouped rows");
    assert.ok(renderedRows.every(row => row.variants.length === 2), group.id + " retains both contrast columns");
  }
});

test("all CT price variants retain their catalog amounts and exact booking targets", () => {
  const renderedPanels = panels(render(items));
  const nonBookablePositions = new Set([60, 61, 62, 63, 64, 65, 68]);
  for (const item of items) {
    const entry = radiologyPriceRegistry[item.id];
    const panel = renderedPanels.find(value => value.attributes.id === `ct-price-panel-${entry.group}`);
    assert.ok(panel, item.id + " is present before selecting a group");
    const row = rows(panel).find(value => value.name === plainText(entry.pairName));
    assert.ok(row, item.id + " has an ordinary HTML row");
    const variant = row.variants[entry.contrast ? 1 : 0];
    assert.ok(variant.text.startsWith(entry.contrast ? "З контрастом" : "Без контрасту"));
    assert.ok(variant.text.includes(`${item.amount.toLocaleString("uk-UA").replace(/\s+/g, " ")} грн`), item.id + " catalog amount");
    const position = Number(item.id.match(/official-230-(\d+)$/)?.[1]);
    if (nonBookablePositions.has(position)) {
      assert.equal(variant.links.length, 0, item.id + " remains a non-bookable accessory");
      continue;
    }
    assert.equal(variant.links.length, 1, item.id + " has one booking link");
    const { url } = variant.links[0];
    assert.equal(url.pathname, "/contacts");
    assert.equal(url.searchParams.get("service"), item.name);
    assert.equal(url.searchParams.get("bookingCategory"), "ct");
    assert.equal(url.searchParams.get("priceItemId"), item.id);
    assert.equal(url.hash, "#booking");
  }
});

test("empty groups are omitted and a catalog without head initially shows its first available group", () => {
  const reducedItems = items.filter(item => ["bones", "heart"].includes(radiologyPriceRegistry[item.id].group));
  const html = render(reducedItems);
  const renderedPanels = panels(html);
  assert.deepEqual(renderedPanels.map(panel => panel.attributes.id), ["ct-price-panel-bones", "ct-price-panel-heart"]);
  assert.deepEqual(renderedPanels.filter(panel => !panel.hidden).map(panel => panel.attributes.id), ["ct-price-panel-bones"]);
  assert.equal([...html.matchAll(/role="tab"/g)].length, 2);
  assert.equal(panels(render([])).length, 0);
});
