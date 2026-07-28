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
