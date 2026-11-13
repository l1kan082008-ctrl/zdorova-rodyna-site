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

// Render the real explorer and its hooks. Only Next Image/Link and CSS modules
// are replaced; no browser, client fetch, gallery opening or data writes occur.
function load(relative) {
  let filename = path.resolve(root, relative);
  if (!path.extname(filename)) filename += existsSync(filename + ".tsx") ? ".tsx" : ".ts";
  assert.ok(filename.startsWith(root + path.sep));
  if (modules.has(filename)) return modules.get(filename).exports;
  const loaded = { exports: {} };
  modules.set(filename, loaded);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  new Function("require", "module", "exports", source)(name => {
    if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (name === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
    if (name === "next/image") return { __esModule: true, default: ({ src, alt, sizes }) => React.createElement("img", { src, alt, sizes }) };
    if (name.startsWith("@/")) return load(name.slice(2));
    if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), name)));
    if (["react", "react/jsx-runtime", "react-dom"].includes(name)) return requirePackage(name);
    throw new Error("Unexpected rendering dependency: " + name);
  }, loaded, loaded.exports);
  return loaded.exports;
}

const { LocationsExplorer } = load("app/contacts/LocationsExplorer.tsx");
const { centerLocations, branchServiceCatalog, getDirectionsUrl, getMapEmbedUrl } = load("app/contacts/locationData.ts");
const { sitePhoneHref } = load("lib/siteSettings.ts");
const locations = centerLocations.map((location, index) => ({
  ...location,
  fullAddress: location.id === "kulyka-hudacheka-3"
    ? "м. Рівне, вул. Кулика і Гудачека, 3, каб. 321"
    : location.fullAddress.replace(" (Курчатова)", ""),
  phone: `+38 (050) 000-00-0${index}`,
  coordinates: { lat: 50.6 + index / 100, lng: 26.2 + index / 100 },
}));
const brody = { ...locations[0], id: "brody-zaliznychna-37b", city: "Броди" };
const render = (selectedLocationId = locations[0].id, values = locations) => renderToStaticMarkup(React.createElement(LocationsExplorer, {
  locations: values, selectedLocationId, onSelectLocation: () => {},
}));
const decode = value => value.replace(/&(amp|quot|lt|gt|#x27|#39|nbsp);/g, (_, entity) => ({
  amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'", nbsp: "\u00a0",
})[entity]);
const plainText = html => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name, decode(value)]));
const links = html => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)]
  .map(([tag]) => ({ attributes: attributes(tag), text: plainText(tag) }));
const buttons = html => [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)]
  .map(([tag]) => ({ attributes: attributes(tag), text: plainText(tag) }));

function divs(html, predicate) {
  const matches = [...html.matchAll(/<div\b[^>]*>/g)].filter(([tag]) => predicate(attributes(tag)));
  return matches.map(match => {
    const tags = /<\/?div\b[^>]*>/g;
    tags.lastIndex = match.index + match[0].length;
    let depth = 1;
    let closing;
    while (depth && (closing = tags.exec(html))) depth += closing[0].startsWith("</") ? -1 : 1;
    assert.equal(depth, 0, "panel divs are balanced");
    return {
      attributes: attributes(match[0]),
      hidden: /\shidden(?:[\s=>])/.test(match[0]),
      html: html.slice(match.index + match[0].length, closing.index),
    };
  });
}

const panels = html => divs(html, attrs => Object.hasOwn(attrs, "data-location-panel"));
const cityPanels = html => divs(html, attrs => attrs.role === "tabpanel");
const byClass = (html, className) => divs(html, attrs => (attrs.class ?? "").split(/\s+/).includes(className));
const iframes = html => [...html.matchAll(/<iframe\b[^>]*>/g)].map(([tag]) => attributes(tag));

test("all published branches expose their full current text and actions in the initial server HTML", t => {
  const input = Object.freeze([...locations, brody]);
  const before = structuredClone(input);
  const html = render(locations[0].id, input);
  assert.doesNotMatch(html, /<script\b/i);
  const renderedPanels = panels(html);
  assert.deepEqual(renderedPanels.map(panel => panel.attributes["data-location-panel"]), locations.map(location => location.id));
  assert.deepEqual(input, before);
  for (const location of locations) {
    const panel = renderedPanels.find(value => value.attributes["data-location-panel"] === location.id);
    const heading = [...panel.html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map(([, text]) => plainText(text));
    assert.deepEqual(heading, [location.fullAddress]);
    assert.ok(plainText(panel.html).includes(location.city));
    assert.ok(plainText(panel.html).includes(location.type));
    const hours = byClass(panel.html, "branch-desktop-hours")[0];
    assert.deepEqual([...hours.html.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/g)].map(([, text]) => plainText(text)), location.hours);
    const serviceLabels = [...panel.html.matchAll(/<span class="branch-service-tag">([\s\S]*?)<\/span>/g)].map(([, text]) => plainText(text));
    assert.deepEqual(serviceLabels, location.services.map(id => branchServiceCatalog.find(service => service.id === id)?.label).filter(Boolean));
    const phoneLinks = links(panel.html).filter(link => link.attributes.href.startsWith("tel:"));
    assert.equal(phoneLinks.length, 2, "preserve the phone text and call action");
    assert.ok(phoneLinks.every(link => link.attributes.href === sitePhoneHref(location.phone)));
    assert.equal(phoneLinks[0].text, location.phone);
    const directions = links(panel.html).find(link => link.text === "Прокласти маршрут");
    assert.equal(directions.attributes.href, getDirectionsUrl(location));
    assert.equal(directions.attributes.target, "_blank");
    assert.equal(buttons(panel.html).filter(button => button.text === "Фото і відео").length, 1);
    assert.equal(iframes(panel.html).length, 0, "the interactive map is outside the repeated branch panels");
  }
  assert.doesNotMatch(html, /data-location-panel="brody-zaliznychna-37b"/);
  t.diagnostic(`${renderedPanels.length} full branch panels in ordinary server markup`);
});

test("every selected branch retains all panels but reveals exactly one branch and its city", () => {
  for (const selected of locations) {
    const html = render(selected.id);
    const renderedPanels = panels(html);
    assert.equal(renderedPanels.length, locations.length);
    assert.deepEqual(renderedPanels.filter(panel => !panel.hidden).map(panel => panel.attributes["data-location-panel"]), [selected.id]);
    const visibleCities = cityPanels(html).filter(panel => !panel.hidden);
    assert.equal(visibleCities.length, 1);
    const cityBranches = buttons(visibleCities[0].html).map(button => button.attributes["aria-controls"]);
    assert.deepEqual(cityBranches, locations.filter(location => location.city === selected.city).map(location => `branch-location-panel-${location.id}`));
    const maps = iframes(html);
    assert.equal(maps.length, 1);
    assert.equal(maps[0].src, getMapEmbedUrl(selected));
    assert.equal(maps[0].title, `Карта: ${selected.fullAddress}`);
    assert.equal(maps[0].loading, "lazy");
  }
});

test("city tabs and branch buttons have unique IDs, correct panel targets and a single keyboard tab stop", () => {
  const html = render(locations.at(-1).id);
  const allButtons = buttons(html);
  const tabs = allButtons.filter(button => button.attributes.role === "tab");
  const renderedCities = cityPanels(html);
  assert.equal(tabs.length, new Set(locations.map(location => location.city)).size);
  assert.equal(tabs.filter(tab => tab.attributes.tabindex === "0").length, 1);
  for (const tab of tabs) {
    const panel = renderedCities.find(value => value.attributes.id === tab.attributes["aria-controls"]);
    assert.ok(panel);
    assert.equal(panel.attributes["aria-labelledby"], tab.attributes.id);
    assert.equal(tab.attributes["aria-selected"], String(!panel.hidden));
    assert.equal(tab.attributes.tabindex, panel.hidden ? "-1" : "0");
  }
  for (const panel of panels(html)) {
    const branchButton = allButtons.find(button => button.attributes["aria-controls"] === panel.attributes.id);
    assert.ok(branchButton);
    assert.equal(branchButton.attributes["aria-pressed"], String(!panel.hidden));
    assert.equal(panel.attributes.role, "region");
    assert.ok(panel.html.includes(`id="${panel.attributes["aria-labelledby"]}"`));
  }
  const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => decode(id));
  assert.equal(new Set(ids).size, ids.length);
});

test("SSR includes branch preview photographs but no opened gallery or repeated maps", () => {
  const html = render();
  assert.equal([...html.matchAll(/<img\b/g)].length, locations.filter(location => location.gallery[0]?.src).length);
  assert.equal(iframes(html).length, 1);
  assert.doesNotMatch(html, /role="dialog"|branch-modal|branch-photo-slide|<video\b/);
  const mobileToggle = buttons(html).find(button => button.attributes["aria-controls"] === "branch-map-frame");
  assert.ok(mobileToggle);
  assert.equal(mobileToggle.attributes["aria-expanded"], "false");
});

test("invalid selection falls back to a published branch; empty and informational-only catalogs render safely", () => {
  for (const selection of ["missing-location", "", brody.id]) {
    const html = render(selection, [...locations, brody]);
    assert.deepEqual(panels(html).filter(panel => !panel.hidden).map(panel => panel.attributes["data-location-panel"]), [locations[0].id]);
    assert.equal(iframes(html)[0].src, getMapEmbedUrl(locations[0]));
  }
  for (const supplied of [[], [brody], [{ ...brody, id: "another-id", city: " БроДи " }]]) {
    const html = render("missing-location", supplied);
    assert.equal(panels(html).length, 0);
    assert.equal(cityPanels(html).length, 0);
    assert.equal(iframes(html).length, 0);
    assert.equal(buttons(html).length, 0);
    assert.ok(plainText(html).includes("Інформація про відділення уточнюється."));
  }
});

test("missing hours, photos and phone do not crash or invent details, and a single schedule is not called today's", () => {
  const location = { ...locations[0], hours: [], gallery: [], phone: "" };
  const html = render(location.id, [location]);
  const [panel] = panels(html);
  assert.equal(panel.hidden, false);
  assert.ok(plainText(panel.html).includes("Графік уточнюйте у відділенні"));
  assert.equal(links(panel.html).filter(link => link.attributes.href.startsWith("tel:")).length, 0);
  assert.equal([...html.matchAll(/<img\b/g)].length, 0);
  assert.equal(iframes(html).length, 1);
  const singleSchedule = render(location.id, [{ ...location, hours: ["Пн–Пт · 08:00–14:00"] }]);
  assert.ok(!plainText(byClass(singleSchedule, "branch-today-hours")[0].html).includes("Сьогодні"));
});
