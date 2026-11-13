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
    if (name.startsWith("@/")) return load(name.slice(2));
    if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), name)));
    if (["react", "react/jsx-runtime"].includes(name)) return requirePackage(name);
    throw new Error("Unexpected rendering dependency: " + name);
  }, loaded, loaded.exports);
  return loaded.exports;
}

const { HolterPriceBooking } = load("app/services/[slug]/HolterPriceBooking.tsx");
const { priceReferences, resolvePriceItem } = load("app/prices/priceReferences.ts");
const { officialPriceItems } = load("app/prices/officialPriceData.ts");
const { centerLocations } = load("app/contacts/locationData.ts");
const { getServiceDetail } = load("app/services/serviceData.ts");
const { sitePhoneHref } = load("lib/siteSettings.ts");
const { compatibleLocations } = load("lib/bookingRequest.ts");
const { resolveImagingBookingCategory } = load("lib/imagingBooking.ts");
const serviceName = getServiceDetail("holter").title;
const priceHref = "/prices?category=heart#price-calculator";
const catalogPrice = resolvePriceItem(officialPriceItems, priceReferences.holter);
assert.ok(catalogPrice);
const currentPrice = { ...catalogPrice, name: "Холтер ЕКГ — актуальна назва з прайса", amount: 1350, isActive: true };
const currentLocation = {
  ...centerLocations.find(location => location.id === "stelmakha-18m"),
  fullAddress: "м. Рівне, вул. Володимира Стельмаха, 18-М, каб. 321",
  phone: "+38 (050) 000-00-01",
};
const render = (extra = {}) => renderToStaticMarkup(React.createElement(HolterPriceBooking, {
  prices: [currentPrice], locations: [currentLocation], serviceName, priceHref, ...extra,
}));
const decode = value => value.replace(/&(amp|quot|lt|gt|#x27|#39|nbsp);/g, (_, entity) => ({
  amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'", nbsp: "\u00a0",
})[entity]);
const plainText = html => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name, decode(value)]));
const links = html => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)]
  .map(([link]) => ({ attributes: attributes(link), text: plainText(link) }));
const prices = html => [...html.matchAll(/<p class="price">([\s\S]*?)<\/p>/g)]
  .map(([, amount]) => plainText(amount));
const bookingLink = html => {
  const booking = links(html).filter(link => link.text === "Записатися на Холтер");
  assert.equal(booking.length, 1);
  return new URL(booking[0].attributes.href, "https://example.test");
};

test("Holter server HTML displays the current passed reference name and price without bundled duplication", () => {
  const html = render();
  assert.doesNotMatch(html, /<script\b/i);
  assert.match(html, /<section\b[^>]*id="holter-price-booking"[^>]*aria-labelledby="holter-price-booking-title"/);
  assert.match(html, /<h2 id="holter-price-booking-title">Вартість та запис на Холтер<\/h2>/);
  assert.deepEqual([...html.matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map(([, text]) => plainText(text)), [currentPrice.name]);
  assert.deepEqual(prices(html), ["1 350 грн"]);
  assert.ok(plainText(html).includes("Добове моніторування ЕКГ протягом 24 годин."));
  assert.ok(plainText(html).includes("Опис і розшифрування результатів лікарем входять у вартість."));
  assert.ok(plainText(html).includes("Встановлення — за попереднім записом."));
  const changed = { ...currentPrice, amount: 2150, name: "Холтер — нова назва адміністратора" };
  assert.deepEqual(prices(render({ prices: [changed] })), ["2 150 грн"]);
  assert.ok(plainText(render({ prices: [changed] })).includes(changed.name));
});

test("an inactive, missing or invalid Holter price shows an availability message and never a stale amount", () => {
  for (const supplied of [[], [{ ...currentPrice, isActive: false }], [{ ...currentPrice, amount: NaN }], [{ ...currentPrice, amount: Infinity }]]) {
    const html = render({ prices: supplied });
    assert.deepEqual(prices(html), []);
    assert.ok(plainText(html).includes("Вартість уточніть в адміністратора."));
    assert.ok(!plainText(html).includes(currentPrice.name), "unavailable price details are not shown as current");
    assert.equal(bookingLink(html).searchParams.get("service"), serviceName);
  }
  assert.deepEqual(prices(render({ prices: [{ ...currentPrice, amount: 0 }] })), ["0 грн"], "zero remains a real catalog amount");
});

test("reference aliases still resolve a current price with a legacy id", () => {
  const legacy = { ...currentPrice, id: "legacy-holter-price", name: priceReferences.holter.aliases[1], amount: 1475 };
  const html = render({ prices: [legacy] });
  assert.deepEqual(prices(html), ["1 475 грн"]);
  assert.ok(plainText(html).includes(legacy.name));
});

test("Holter contacts use the supplied Stelmakha address and phone with a stable service selection", () => {
  const html = render({ locations: [...centerLocations.filter(location => location.id !== currentLocation.id), currentLocation] });
  const address = links(html).find(link => link.text === currentLocation.fullAddress);
  assert.ok(address, "the full current address including its office is visible");
  const addressUrl = new URL(address.attributes.href, "https://example.test");
  assert.equal(addressUrl.pathname, "/contacts");
  assert.deepEqual([...addressUrl.searchParams], [["location", currentLocation.id]]);
  assert.equal(addressUrl.hash, "#locations");
  const phone = links(html).find(link => link.attributes.href.startsWith("tel:"));
  assert.equal(phone.text, currentLocation.phone);
  assert.equal(phone.attributes.href, sitePhoneHref(currentLocation.phone));
  const booking = bookingLink(html);
  assert.equal(booking.pathname, "/contacts");
  assert.deepEqual([...booking.searchParams], [["service", serviceName], ["location", currentLocation.id]]);
  assert.equal(booking.hash, "#booking");
  assert.notEqual(booking.searchParams.get("service"), currentPrice.name, "an admin price rename does not alter the stable booking service");
  assert.equal(resolveImagingBookingCategory(booking.searchParams, "/services/holter"), null);
  assert.deepEqual(compatibleLocations([currentLocation], booking.searchParams.get("service")), [currentLocation]);
  assert.equal(links(html).find(link => link.text === "Переглянути весь прайс").attributes.href, priceHref);
});

test("a missing branch never supplies a bundled address, phone or fabricated location selection", () => {
  for (const locations of [[], centerLocations.filter(location => location.id !== "stelmakha-18m")]) {
    const html = render({ locations });
    assert.ok(plainText(html).includes("Адресу встановлення та контактний телефон уточніть"));
    assert.equal(links(html).filter(link => link.attributes.href.startsWith("tel:")).length, 0);
    assert.ok(!plainText(html).includes("Стельмаха"));
    assert.ok(!plainText(html).includes(currentLocation.phone));
    assert.equal(links(html).find(link => link.text === "відділеннях центру").attributes.href, "/contacts#locations");
    assert.deepEqual([...bookingLink(html).searchParams], [["service", serviceName]]);
  }
  const noPhone = render({ locations: [{ ...currentLocation, phone: "" }] });
  assert.ok(plainText(noPhone).includes(currentLocation.fullAddress));
  assert.equal(links(noPhone).filter(link => link.attributes.href.startsWith("tel:")).length, 0);
});
