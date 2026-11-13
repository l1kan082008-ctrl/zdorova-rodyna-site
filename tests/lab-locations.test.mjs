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

// Load the real server component and public API helper. Stub only framework
// rendering and the database boundary, without connecting to or modifying a DB.
function createLoader({ env = {}, listLocations, errors = [] } = {}) {
  const modules = new Map();
  function load(relative) {
    let filename = path.resolve(root, relative);
    if (!path.extname(filename)) filename += existsSync(filename + ".tsx") ? ".tsx" : ".ts";
    if (filename === path.resolve(root, "app/api/locations/locationStore.ts")) {
      assert.ok(listLocations, "database access needs an explicit test stub");
      return { listLocations };
    }
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
      if (name === "server-only") return {};
      if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
      if (name === "next/link") return {
        __esModule: true,
        default: ({ children, ...props }) => React.createElement("a", props, children),
      };
      if (name === "next/image") return {
        __esModule: true,
        default: ({ src, alt, sizes }) => React.createElement("img", { src, alt, sizes }),
      };
      if (name.startsWith("@/")) return load(name.slice(2));
      if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), name)));
      if (["react", "react/jsx-runtime"].includes(name)) return requirePackage(name);
      throw new Error("Unexpected test dependency: " + name);
    };
    new Function("require", "module", "exports", "process", "console", source)(
      resolve, loadedModule, loadedModule.exports, { env }, { error: message => errors.push(message) },
    );
    return loadedModule.exports;
  }
  return load;
}

const load = createLoader();
const { LabLocations } = load("app/services/[slug]/LabLocations.tsx");
const { centerLocations, getDirectionsUrl } = load("app/contacts/locationData.ts");
const { sitePhoneHref } = load("lib/siteSettings.ts");
const { resolveImageSource } = load("lib/imageSource.ts");
// Simulate admin-edited published data using the existing catalog shape, with
// deliberately different address, phone and coordinates to detect stale fallbacks.
const publishedLocations = centerLocations.map((location, index) => ({
  ...location,
  fullAddress: location.id === "kulyka-hudacheka-3"
    ? "м. Рівне, вул. Кулика і Гудачека, 3, каб. 321"
    : location.fullAddress.replace(" (Курчатова)", ""),
  phone: `+38 (050) 000-00-0${index}`,
  coordinates: { lat: 50.6 + index / 100, lng: 26.2 + index / 100 },
}));
const nonLab = { ...publishedLocations[0], id: "test-doctors-only", services: ["doctors"] };
const brodyById = { ...publishedLocations[0], id: "brody-zaliznychna-37b", city: "Рівне" };
const brodyByCity = { ...publishedLocations[0], id: "another-brody-location", city: " БроДи " };
const render = locations => renderToStaticMarkup(React.createElement(LabLocations, { locations }));
const decode = value => value.replace(/&(amp|quot|lt|gt|#x27|#39|nbsp);/g, (_, entity) => ({
  amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'", nbsp: "\u00a0",
})[entity]);
const plainText = html => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name, decode(value)]));

function articles(html) {
  return [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(([article]) => ({
    attributes: attributes(article.match(/^<article\b[^>]*>/)[0]),
    html: article,
    headings: [...article.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map(([, text]) => plainText(text)),
    addresses: [...article.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(([, text]) => plainText(text)),
    links: [...article.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => ({ attributes: attributes(link), text: plainText(link) })),
    images: [...article.matchAll(/<img\b[^>]*>/g)].map(([image]) => attributes(image)),
  }));
}

test("all laboratory locations are server-rendered once, with Stelmakha first and no informational Brody cards", t => {
  const reordered = [...publishedLocations.slice(1), publishedLocations[0]];
  const input = Object.freeze([nonLab, brodyById, ...reordered, brodyByCity]);
  const before = structuredClone(input);
  const html = render(input);
  const cards = articles(html);
  assert.doesNotMatch(html, /<script\b/i, "addresses are ordinary server HTML");
  assert.match(html, /<section\b[^>]*id="lab-locations"[^>]*aria-labelledby="lab-locations-title"/);
  assert.match(html, /<h2 id="lab-locations-title">Де здати аналізи<\/h2>/);
  const expected = publishedLocations.filter(location => location.services.includes("laboratory"));
  assert.deepEqual(cards.map(card => card.attributes["data-location-id"]), expected.map(location => location.id));
  assert.equal(new Set(cards.map(card => card.attributes["data-location-id"])).size, expected.length);
  assert.equal(cards[0].attributes["data-location-id"], "stelmakha-18m");
  assert.deepEqual(input, before, "prioritizing the main branch does not mutate the shared catalog");
  t.diagnostic(`${cards.length} laboratory branches present in server HTML`);
});

test("cards retain passed full addresses including offices, exact phones, branch links and coordinate directions", () => {
  const cards = articles(render(publishedLocations));
  for (const location of publishedLocations.filter(value => value.services.includes("laboratory"))) {
    const card = cards.find(value => value.attributes["data-location-id"] === location.id);
    assert.ok(card, location.id);
    assert.deepEqual(card.headings, [location.city]);
    assert.deepEqual(card.addresses, [location.fullAddress]);
    assert.equal(card.links.length, 3);
    const contact = card.links.find(link => link.attributes.href.startsWith("/contacts"));
    const url = new URL(contact.attributes.href, "https://example.test");
    assert.equal(url.pathname, "/contacts");
    assert.deepEqual([...url.searchParams], [["location", location.id]]);
    assert.equal(url.hash, "#locations");
    assert.equal(contact.attributes["aria-label"], `Переглянути відділення: ${location.fullAddress}`);
    const phone = card.links.find(link => link.attributes.href.startsWith("tel:"));
    assert.equal(phone.attributes.href, sitePhoneHref(location.phone));
    assert.equal(phone.text, location.phone);
    const directions = card.links.find(link => link.text.startsWith("Прокласти маршрут"));
    assert.equal(directions.attributes.href, getDirectionsUrl(location));
    assert.equal(directions.attributes.target, "_blank");
    assert.equal(directions.attributes.rel, "noreferrer");
    assert.equal(card.images.length, 1);
    assert.equal(card.images[0].src, resolveImageSource(location.gallery[0].src));
    assert.equal(card.images[0].alt, location.gallery[0].alt);
  }
  const office = cards.find(card => card.attributes["data-location-id"] === "kulyka-hudacheka-3");
  assert.deepEqual(office.addresses, ["м. Рівне, вул. Кулика і Гудачека, 3, каб. 321"]);
  assert.doesNotMatch(office.html, /каб\. 219/, "the current passed address replaces the bundled office number");
});

test("empty laboratory catalogs disappear, while a branch without photo or phone keeps its address and directions", () => {
  assert.equal(render([]), "");
  assert.equal(render([nonLab, brodyById, brodyByCity]), "");
  const location = { ...publishedLocations[1], id: "new-published-laboratory", gallery: [], phone: "" };
  const [card] = articles(render([location]));
  assert.equal(card.attributes["data-location-id"], location.id);
  assert.equal(card.attributes.class, "withoutPhoto");
  assert.equal(card.images.length, 0);
  assert.equal(card.links.length, 2);
  assert.ok(card.links.every(link => !link.attributes.href.startsWith("tel:")));
  assert.deepEqual(card.addresses, [location.fullAddress]);
  assert.equal(card.links.find(link => link.text.startsWith("Прокласти маршрут")).attributes.href, getDirectionsUrl(location));
});

test("production helper and API share the current database catalog and exclude Brody by id or city", async () => {
  let current = [...publishedLocations, nonLab, brodyById, brodyByCity];
  let calls = 0;
  const serverLoad = createLoader({
    env: { NODE_ENV: "production", DATABASE_URL: "postgres://test.invalid/database" },
    listLocations: async () => { calls++; return current; },
  });
  const { listPublicLocations } = serverLoad("app/api/locations/publicLocations.ts");
  const { GET } = serverLoad("app/api/locations/route.ts");
  const expected = [...publishedLocations, nonLab];
  assert.deepEqual(await listPublicLocations(), expected);
  const response = await GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { locations: expected });
  assert.equal(calls, 2);
  current = [{ ...publishedLocations[2], fullAddress: "м. Рівне, оновлена адреса, каб. 405" }];
  const updated = await listPublicLocations();
  assert.deepEqual(updated, current, "later reads do not substitute a cached static catalog");
  assert.deepEqual(articles(render(updated))[0].addresses, [current[0].fullAddress]);
  assert.equal(calls, 3);
});

test("database-free development keeps the existing bundled API response and no-store caching", async () => {
  let calls = 0;
  const serverLoad = createLoader({
    env: { NODE_ENV: "development", DATABASE_URL: "  " },
    listLocations: async () => { calls++; throw new Error("Database must not be accessed in this preview"); },
  });
  const { listPublicLocations } = serverLoad("app/api/locations/publicLocations.ts");
  const { GET } = serverLoad("app/api/locations/route.ts");
  assert.deepEqual(await listPublicLocations(), centerLocations);
  const response = await GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { locations: centerLocations });
  assert.equal(calls, 0);
});

test("production and configured development propagate database failures without static fallback", async () => {
  for (const env of [
    { NODE_ENV: "production" },
    { NODE_ENV: "production", DATABASE_URL: "postgres://test.invalid/database" },
    { NODE_ENV: "development", DATABASE_URL: "postgres://test.invalid/database" },
  ]) {
    let calls = 0;
    const errors = [];
    const failure = new Error("Location database unavailable");
    const serverLoad = createLoader({ env, errors, listLocations: async () => { calls++; throw failure; } });
    const { listPublicLocations } = serverLoad("app/api/locations/publicLocations.ts");
    const { GET } = serverLoad("app/api/locations/route.ts");
    await assert.rejects(listPublicLocations(), error => error === failure);
    const response = await GET();
    assert.equal(response.status, 500);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const payload = await response.json();
    assert.deepEqual(Object.keys(payload).sort(), ["error", "incidentId"]);
    assert.equal(payload.error, "Не вдалося завантажити відділення.");
    assert.match(payload.incidentId, /^[0-9a-f-]{36}$/i);
    assert.equal(calls, 2);
    assert.equal(errors.length, 1);
    const logged = JSON.parse(errors[0]);
    assert.equal(logged.event, "public_locations_load_failed");
    assert.equal(logged.incidentId, payload.incidentId);
  }
});

test("an empty production catalog is not replaced with bundled locations", async () => {
  const serverLoad = createLoader({ env: { NODE_ENV: "production" }, listLocations: async () => [] });
  const { listPublicLocations } = serverLoad("app/api/locations/publicLocations.ts");
  const { GET } = serverLoad("app/api/locations/route.ts");
  const locations = await listPublicLocations();
  assert.deepEqual(locations, []);
  assert.equal(render(locations), "");
  const response = await GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { locations: [] });
});
