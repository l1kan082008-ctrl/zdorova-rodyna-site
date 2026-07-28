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
      readFile(new URL(`../public/service-cards/${name}-v2.jpg`, import.meta.url)),
    ),
  ]);

  assert.match(
    css,
    /\.service-card\s*\{[\s\S]*?min-height:\s*176px[\s\S]*?background-color:\s*#11797a[\s\S]*?background-size:\s*cover/,
  );
  assert.match(
    css,
    /\.service-card--ct\s*\{[\s\S]*?url\("\/service-cards\/ct-v2\.jpg"\)/,
  );
  assert.match(
    css,
    /\.service-card--family\s*\{[\s\S]*?url\("\/service-cards\/family-v2\.jpg"\)/,
  );
  assert.match(page, /description:\s*"Комп’ютерна томографія"/);
  assert.match(page, /className=\{`service-card service-card--\$\{service\.slug\}`\}/);
  assert.doesNotMatch(page, /<ServiceIcon/);
  assets.forEach((asset) => assert.ok(asset.length > 20_000));
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

test("homepage family doctors expand on hover and link to profiles", async () => {
  const [page, showcase, css, ...photos] = await Promise.all([
    readSource("app/page.tsx"),
    readSource("app/components/FamilyDoctorsShowcase.tsx"),
    readSource("app/globals.css"),
    ...[
      "voloshko-tetiana.jpg",
      "iziumska-olena.jpg",
      "ishchuk-nadiia-optimized.jpg",
      "pochtar-kateryna-optimized.jpg",
    ].map((name) =>
      readFile(new URL(`../public/doctor-showcase/${name}`, import.meta.url)),
    ),
  ]);

  assert.match(page, /await Promise\.all\(\[[\s\S]*?listDoctors\(\)/);
  assert.match(page, /specialty\.toLocaleLowerCase\("uk-UA"\)\.includes\("сімей"\)/);
  assert.match(page, /<FamilyDoctorsShowcase doctors=\{familyDoctors\} \/>/);
  assert.match(showcase, /onPointerMove=\{previewDoctorFromPointer\}/);
  assert.match(showcase, /data-doctor-id=\{doctor\.id\}/);
  assert.match(showcase, /event\.pointerType !== "mouse"/);
  assert.match(
    showcase,
    /onFocus=\{\(\) => previewDoctor\(doctor\.id, true\)\}/,
  );
  assert.match(showcase, /setTimeout\(\(\) => \{[\s\S]*?setActiveId\(doctorId\)/);
  assert.match(showcase, /href=\{`\/doctors\/\$\{doctor\.id\}`\}/);
  assert.match(
    css,
    /\.family-doctor-panel\.is-active\s*\{[\s\S]*?flex:\s*1 1 350px/,
  );
  assert.match(
    css,
    /flex-basis 500ms cubic-bezier\(0\.65, 0, 0\.35, 1\)/,
  );
  assert.match(
    css,
    /\.family-doctors-summary-content\s*\{[\s\S]*?family-doctors-summary-in 500ms cubic-bezier\(0\.65, 0, 0\.35, 1\)/,
  );
  photos.forEach((photo) => assert.ok(photo.length > 50_000));
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
