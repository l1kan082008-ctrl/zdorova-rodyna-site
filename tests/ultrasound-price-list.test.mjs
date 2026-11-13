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

// Render the actual list, its rows, descriptions and catalog. Only the framework
// Link and CSS imports are replaced; no duplicate price data or browser is used.
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

const { UltrasoundPriceList } = load("app/services/[slug]/UltrasoundPriceList.tsx");
const { officialPriceItems } = load("app/prices/officialPriceData.ts");
// Match the parent service page's active ultrasound/doppler selection. The list
// accepts already selected items and must not silently remove or reorder them.
const items = officialPriceItems.filter(item => item.isActive !== false && ["ultrasound", "doppler"].includes(item.category));
const render = prices => renderToStaticMarkup(React.createElement(UltrasoundPriceList, { items: prices }));
const decode = value => value.replace(/&(amp|quot|lt|gt|#x27|#39|nbsp);/g, (_, entity) => ({
  amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'", nbsp: "\u00a0",
})[entity]);
const plainText = html => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name, decode(value)]));
const hasClass = (tag, className) => (attributes(tag).class ?? "").split(/\s+/).includes(className);
const formattedAmount = amount => `${new Intl.NumberFormat("uk-UA").format(amount).replace(/\s+/g, " ")} грн`;

function divsByClass(html, className) {
  const matches = [...html.matchAll(/<div\b[^>]*>/g)].filter(([tag]) => hasClass(tag, className));
  return matches.map(match => {
    const tags = /<\/?div\b[^>]*>/g;
    tags.lastIndex = match.index + match[0].length;
    let depth = 1;
    let closing;
    while (depth && (closing = tags.exec(html))) depth += closing[0].startsWith("</") ? -1 : 1;
    assert.equal(depth, 0, className + " has balanced HTML");
    return {
      attributes: attributes(match[0]),
      hidden: /\shidden(?:[\s=>])/.test(match[0]),
      html: html.slice(match.index + match[0].length, closing.index),
    };
  });
}

function buttons(html, className) {
  return [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)]
    .filter(([button]) => hasClass(button, className))
    .map(([button]) => ({ attributes: attributes(button), text: plainText(button) }));
}

function rows(html) {
  return divsByClass(html, "ultrasound-price-row").map(row => ({
    ...row,
    headings: [...row.html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map(([, name]) => plainText(name)),
    amounts: [...row.html.matchAll(/<strong\b[^>]*>([\s\S]*?)<\/strong>/g)].map(([, amount]) => plainText(amount)),
    links: [...row.html.matchAll(/<a\b[^>]*href="[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => ({
      url: new URL(attributes(link).href, "https://example.test"),
      text: plainText(link),
    })),
    descriptions: divsByClass(row.html, "ultrasound-description"),
    descriptionButtons: buttons(row.html, "ultrasound-description-toggle"),
  }));
}

function assertBooking(row, item) {
  assert.equal(row.links.length, 1, item.id + " has one booking link");
  const { url, text } = row.links[0];
  assert.equal(text, "Записатися");
  assert.equal(url.pathname, "/contacts");
  assert.deepEqual([...url.searchParams.keys()], ["service", "bookingCategory", "priceItemId", "location"]);
  assert.equal(url.searchParams.get("service"), item.name);
  assert.equal(url.searchParams.get("bookingCategory"), "ultrasound");
  assert.equal(url.searchParams.get("priceItemId"), item.id);
  assert.equal(url.searchParams.get("location"), "stelmakha-18m");
  assert.equal(url.hash, "#booking");
}

test("initial ultrasound server HTML includes every active ultrasound and doppler item once in catalog order", t => {
  assert.ok(items.length > 5);
  assert.ok(items.some(item => item.category === "ultrasound"));
  assert.ok(items.some(item => item.category === "doppler"));
  const html = render(items);
  assert.doesNotMatch(html, /<script\b/i, "study names and prices must be ordinary HTML, not JSON or scripts");
  const renderedRows = rows(html);
  assert.equal(renderedRows.length, items.length);
  assert.deepEqual(renderedRows.map(row => row.headings), items.map(item => [plainText(item.name)]));
  assert.deepEqual(renderedRows.map(row => row.amounts), items.map(item => [formattedAmount(item.amount)]));
  const linkedIds = renderedRows.flatMap(row => row.links.map(link => link.url.searchParams.get("priceItemId")));
  assert.deepEqual(linkedIds, items.map(item => item.id), "no studies are omitted, duplicated or reordered");
  assert.equal(new Set(linkedIds).size, items.length);
  t.diagnostic(`${items.length} server-rendered study rows and prices (${items.filter(item => item.category === "ultrasound").length} ultrasound, ${items.filter(item => item.category === "doppler").length} doppler)`);
});

test("all ultrasound and doppler rows retain exact booking service, category, item and location parameters", () => {
  const renderedRows = rows(render(items));
  for (const [index, item] of items.entries()) assertBooking(renderedRows[index], item);
});

test("the initial preview shows five rows and its collapsed toggle controls the existing full list", () => {
  const html = render(items);
  const renderedRows = rows(html);
  assert.deepEqual(renderedRows.map(row => row.hidden), items.map((_, index) => index >= 5));
  const lists = divsByClass(html, "ultrasound-price-rows");
  assert.equal(lists.length, 1, "there is one list shared by the preview and expanded view");
  assert.equal(rows(lists[0].html).length, items.length);
  const toggles = buttons(html, "outline-button");
  assert.equal(toggles.length, 1);
  assert.equal(toggles[0].text, `Показати всі дослідження (${items.length}) ↓`);
  assert.equal(toggles[0].attributes["aria-expanded"], "false");
  assert.equal(toggles[0].attributes["aria-controls"], lists[0].attributes.id);
  assert.equal(toggles[0].attributes.type, "button");
  assert.ok(lists[0].attributes.id);
});

test("every row retains its description and uniquely associated collapsed disclosure", () => {
  const html = render(items);
  const renderedRows = rows(html);
  for (const [index, row] of renderedRows.entries()) {
    assert.equal(row.descriptions.length, 1);
    assert.equal(row.descriptionButtons.length, 1);
    const description = row.descriptions[0];
    const button = row.descriptionButtons[0];
    assert.equal(description.hidden, true, items[index].id + " description starts collapsed");
    assert.equal(button.attributes["aria-expanded"], "false");
    assert.equal(button.attributes["aria-controls"], description.attributes.id);
    assert.equal(button.attributes["aria-label"], `Детальніше: ${items[index].name}`);
    assert.equal(button.text, "Детальніше");
    assert.deepEqual([...description.html.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>/g)].map(([, term]) => plainText(term)), ["Що досліджують", "Як підготуватися"]);
    const descriptions = [...description.html.matchAll(/<dd\b[^>]*>([\s\S]*?)<\/dd>/g)].map(([, text]) => plainText(text));
    assert.equal(descriptions.length, 2);
    assert.ok(descriptions.every(Boolean), items[index].id + " keeps both guidance paragraphs");
  }
  const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => decode(id));
  assert.equal(new Set(ids).size, ids.length, "list and description IDs are unique");
  assert.equal(ids.length, items.length + 1);

  const examples = [
    [/ОЧП|черевн/i, "Оцінюють органи черевної порожнини:", "Може знадобитися огляд натще."],
    [/щитоподіб/i, "Оцінюють розміри та структуру щитоподібної залози", "Оберіть одяг із відкритою шиєю"],
    [/доплер/i, "Оцінюють прохідність судин", "Зазвичай спеціальна підготовка не потрібна."],
  ];
  for (const [namePattern, purpose, preparation] of examples) {
    const index = items.findIndex(item => namePattern.test(item.name));
    assert.notEqual(index, -1, String(namePattern) + " is covered by the actual catalog");
    const text = plainText(renderedRows[index].descriptions[0].html);
    assert.ok(text.includes(purpose));
    assert.ok(text.includes(preparation));
  }
});

test("zero through five studies need no expansion control; a sixth study starts hidden", () => {
  for (const count of [0, 1, 5]) {
    const html = render(items.slice(0, count));
    const renderedRows = rows(html);
    assert.equal(renderedRows.length, count);
    assert.ok(renderedRows.every(row => !row.hidden));
    assert.equal(buttons(html, "outline-button").length, 0);
  }
  const sixHtml = render(items.slice(0, 6));
  assert.deepEqual(rows(sixHtml).map(row => row.hidden), [false, false, false, false, false, true]);
  assert.equal(buttons(sixHtml, "outline-button")[0].text, "Показати всі дослідження (6) ↓");
});

test("the list uses current input names, amounts and ordering for initially hidden studies", () => {
  const updatedItems = items.map((item, index) => index === 7 ? {
    ...item,
    name: `${item.name} — "оновлена назва" & перевірка`,
    amount: 4321,
  } : item);
  const renderedRows = rows(render(updatedItems));
  assert.equal(renderedRows.length, items.length);
  assert.equal(renderedRows[7].hidden, true);
  assert.deepEqual(renderedRows[7].headings, [updatedItems[7].name]);
  assert.deepEqual(renderedRows[7].amounts, [formattedAmount(updatedItems[7].amount)]);
  assertBooking(renderedRows[7], updatedItems[7]);

  const reorderedItems = [...updatedItems].reverse();
  const reorderedRows = rows(render(reorderedItems));
  assert.deepEqual(reorderedRows.map(row => row.headings), reorderedItems.map(item => [plainText(item.name)]));
  assert.deepEqual(reorderedRows.map(row => row.hidden), reorderedItems.map((_, index) => index >= 5));
});

test("multiple server-rendered price lists keep independent disclosure targets", () => {
  const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(UltrasoundPriceList, { items: items.slice(0, 6) }),
    React.createElement(UltrasoundPriceList, { items: items.slice(6, 12) }),
  ));
  const lists = divsByClass(html, "ultrasound-price-rows");
  const toggles = buttons(html, "outline-button");
  assert.equal(lists.length, 2);
  assert.deepEqual(toggles.map(button => button.attributes["aria-controls"]), lists.map(list => list.attributes.id));
  const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => decode(id));
  assert.equal(ids.length, 14);
  assert.equal(new Set(ids).size, ids.length);
});
