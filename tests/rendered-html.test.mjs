import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
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

test("homepage service cards use calm artwork and open service detail pages", async () => {
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
    /\.service-card\s*\{[\s\S]*?min-height:\s*184px[\s\S]*?background:\s*#f8fbfa/,
  );
  assert.match(
    css,
    /\.service-card--ct\s*\{[\s\S]*?--service-art:\s*url\("\/service-cards\/ct-v2\.jpg"\)/,
  );
  assert.match(
    css,
    /\.service-card--family\s*\{[\s\S]*?--service-art:\s*url\("\/service-cards\/family-v2\.jpg"\)/,
  );
  assert.match(page, /import \{ serviceDetails \} from "\.\/services\/serviceData"/);
  assert.match(page, /className=\{`service-card service-card--\$\{service\.slug\}`\}/);
  assert.match(page, /href=\{`\/services\/\$\{service\.slug\}`\}/);
  assert.doesNotMatch(page, /<ServiceIcon/);
  assets.forEach((asset) => assert.ok(asset.length > 20_000));
});

test("every homepage service has a detailed information page", async () => {
  const [data, page, servicesPage, css] = await Promise.all([
    readSource("app/services/serviceData.ts"),
    readSource("app/services/[slug]/page.tsx"),
    readSource("app/services/page.tsx"),
    readSource("app/globals.css"),
  ]);

  for (const slug of [
    "ct",
    "mri",
    "ultrasound",
    "lab",
    "consultation",
    "cardiology",
    "holter",
    "family",
  ]) {
    assert.match(data, new RegExp(`slug: "${slug}"`));
  }
  assert.match(page, /generateStaticParams/);
  assert.match(page, /Як підготуватися/);
  assert.match(page, /Як усе відбувається/);
  assert.match(page, /\/contacts\?service=/);
  assert.match(servicesPage, /href=\{`\/services\/\$\{item\.slug\}`\}/);
  assert.match(css, /\.service-detail-hero\s*\{/);
  assert.match(css, /\.service-information-grid\s*\{/);
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

test("homepage all-doctor showcase expands on click and links to profiles", async () => {
  const [page, showcase, css, doctorData, doctorStore, importedPhotos] =
    await Promise.all([
      readSource("app/page.tsx"),
      readSource("app/components/DoctorsShowcase.tsx"),
      readSource("app/globals.css"),
      readSource("app/doctors/doctorData.ts"),
      readSource("app/api/doctors/doctorStore.ts"),
      readdir(new URL("../public/doctors/", import.meta.url)),
    ]);

  assert.match(page, /await Promise\.all\(\[[\s\S]*?listDoctors\(\)/);
  assert.doesNotMatch(page, /\.filter\(\(doctor\)[\s\S]*?specialty/);
  assert.match(page, /<DoctorsShowcase doctors=\{showcaseDoctors\} \/>/);
  assert.match(showcase, /data-doctor-id=\{doctor\.id\}/);
  assert.match(showcase, /type="button"/);
  assert.match(showcase, /onClick=\{\(\) => selectDoctor\(doctor\.id\)\}/);
  assert.match(showcase, /aria-expanded=\{isActive\}/);
  assert.match(showcase, /scrollIntoView\(\{/);
  assert.match(showcase, /disabled=\{activeIndex === 0\}/);
  assert.match(showcase, /disabled=\{activeIndex === doctors\.length - 1\}/);
  assert.doesNotMatch(showcase, /onPointerMove|onMouseEnter|setTimeout/);
  assert.match(showcase, /className="doctor-showcase-copy"/);
  assert.match(showcase, /href=\{`\/doctors\/\$\{doctor\.id\}`\}/);
  assert.doesNotMatch(showcase, /family-doctors-summary/);
  assert.equal(importedPhotos.filter((name) => name.endsWith(".webp")).length, 36);
  assert.match(doctorData, /photoUrl:\s*doctorPhotoUrls\[id\]\s*\?\?\s*""/);
  assert.match(doctorStore, /doctorPhotoUrls\[row\.id\]\s*\?\?\s*""/);
  assert.match(
    css,
    /\.doctor-showcase-panel\.is-active\s*\{[\s\S]*?flex-basis:\s*clamp\(340px, 38vw, 520px\)/,
  );
  assert.match(
    css,
    /\.doctor-showcase-panel:not\(\.is-active\):hover\s*\{[\s\S]*?flex-basis:\s*82px/,
  );
  assert.doesNotMatch(css, /0 0 0 2px rgba\(255, 126, 0, 0\.24\)/);
  assert.match(
    css,
    /flex-basis 500ms cubic-bezier\(0\.65, 0, 0\.35, 1\)/,
  );
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

test("admin price list supports validated Excel imports without deleting other rows", async () => {
  const [page, panel, parser, route, store] = await Promise.all([
    readSource("app/admin/prices/page.tsx"),
    readSource("app/admin/prices/PriceImportPanel.tsx"),
    readSource("app/admin/prices/priceImport.ts"),
    readSource("app/api/admin/prices/import/route.ts"),
    readSource("app/api/prices/priceStore.ts"),
  ]);

  assert.match(page, /<PriceImportPanel items=\{items\} onImported=\{handleImported\}/);
  assert.match(panel, /accept="\.xlsx,\.xls,\.csv"/);
  assert.match(panel, /\/api\/admin\/prices\/import/);
  assert.match(panel, /issues\.length > 0/);
  assert.match(parser, /await import\("xlsx"\)/);
  assert.match(parser, /sheet_to_json<unknown\[\]>/);
  assert.match(parser, /const MAX_ROWS = 5000/);
  assert.match(route, /isAuthorizedAdmin\(request\)/);
  assert.match(route, /categoryLabel: categoryOption\.label/);
  assert.match(store, /ON CONFLICT\(id\) DO UPDATE SET/);
  assert.match(store, /env\.DB\.batch\(statements\.slice\(index, index \+ 50\)\)/);
  assert.doesNotMatch(
    store.slice(store.indexOf("export async function importManagedPriceItems")),
    /DELETE FROM price_items/,
  );
});
