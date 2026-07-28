import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mobile homepage keeps section copy in the viewport", async () => {
  const css = await readSource("app/globals.css");

  assert.match(
    css,
    /@media \(max-width: 720px\)[\s\S]*?\.doctors-heading,\s*\.pricing-heading\s*\{[\s\S]*?flex-direction:\s*column/,
  );
  assert.match(
    css,
    /\.doctors-heading > div,[\s\S]*?\.pricing-heading > p\s*\{[\s\S]*?width:\s*100%/,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)[\s\S]*?\.hero-art\s*\{[\s\S]*?background-position:\s*78% center/,
  );
});

test("homepage reception uses the dedicated center photo", async () => {
  const css = await readSource("app/globals.css");

  assert.match(
    css,
    /\.reception-photo\s*\{[\s\S]*?background-image:\s*url\("\/center-reception\.webp"\)/,
  );
  assert.doesNotMatch(
    css,
    /\.reception-photo\s*\{[\s\S]{0,350}?design-reference\.png/,
  );
});

test("homepage service cards use dedicated glass medical artwork", async () => {
  const [page, css, ...assets] = await Promise.all([
    readSource("app/page.tsx"),
    readSource("app/globals.css"),
    ...[
      "ct",
      "mri",
      "ultrasound",
      "lab",
      "consultation",
      "cardiology",
      "holter",
      "family",
    ].map((name) =>
      readFile(new URL(`../public/service-cards/${name}.jpg`, import.meta.url)),
    ),
  ]);

  assert.match(
    css,
    /\.service-card\s*\{[\s\S]*?aspect-ratio:\s*4\s*\/\s*5/,
  );
  assert.match(
    css,
    /\.service-card--ct\s*\{[\s\S]*?url\("\/service-cards\/ct\.jpg"\)/,
  );
  assert.match(
    css,
    /\.service-card--family\s*\{[\s\S]*?url\("\/service-cards\/family\.jpg"\)/,
  );
  assert.match(page, /description:\s*"Комп’ютерна томографія"/);
  assert.match(page, /className=\{`service-card service-card--\$\{service\.slug\}`\}/);
  assert.doesNotMatch(page, /<ServiceIcon/);
  assets.forEach((asset) => assert.ok(asset.length > 40_000));
});

test("popular price cards use a clean teal cursor-following glow", async () => {
  const [page, card, css] = await Promise.all([
    readSource("app/page.tsx"),
    readSource("app/components/GlowPriceCard.tsx"),
    readSource("app/globals.css"),
  ]);

  assert.match(page, /<GlowPriceCard key=\{item\.title\}>/);
  assert.doesNotMatch(page, /tone=/);
  assert.match(card, /onPointerMove=\{followPointer\}/);
  assert.match(card, /"--spot-x"/);
  assert.match(card, /"--spot-y"/);
  assert.doesNotMatch(css, /\.price-card::before/);
  assert.match(
    css,
    /\.price-card::after\s*\{[\s\S]*?circle at var\(--spot-x\) var\(--spot-y\)/,
  );
  assert.match(
    css,
    /\.price-card\s*\{[\s\S]*?--glow-rgb:\s*17, 121, 122/,
  );
  assert.match(
    css,
    /\.price-card \.outline-button:hover,[\s\S]*?background:\s*var\(--orange\)[\s\S]*?0 0 26px rgba\(255, 121, 0, 0\.34\)/,
  );
});

test("doctor pages receive their data during server rendering", async () => {
  const [directory, doctorsPage, profilePage, profileDetails] =
    await Promise.all([
      readSource("app/doctors/DoctorsDirectory.tsx"),
      readSource("app/doctors/page.tsx"),
      readSource("app/doctors/[id]/page.tsx"),
      readSource("app/doctors/[id]/DoctorProfileDetails.tsx"),
    ]);

  assert.match(doctorsPage, /await listDoctors\(\)/);
  assert.match(doctorsPage, /initialDoctors=\{doctors\}/);
  assert.doesNotMatch(directory, /fetch\(["']\/api\/doctors/);
  assert.match(profilePage, /await loadDoctor\(id\)/);
  assert.match(profileDetails, /doctor:\s*Doctor \| null/);
  assert.doesNotMatch(profileDetails, /fetch\(`/);
});

test("calculator route hash is consumed after opening once", async () => {
  const catalog = await readSource("app/prices/PriceCatalog.tsx");

  assert.match(
    catalog,
    /selectionHydrated && window\.location\.hash === "#calculator"/,
  );
  assert.match(
    catalog,
    /window\.history\.replaceState\([\s\S]*?`\$\{window\.location\.pathname\}\$\{window\.location\.search\}`/,
  );
  assert.match(
    catalog,
    /if \(!selectedIds\.length\) \{[\s\S]*?removeEventListener/,
  );
});
