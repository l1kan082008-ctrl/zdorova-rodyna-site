import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requirePackage = createRequire(import.meta.url);
const modules = new Map();
const doctors = [{ specialty: "Проктолог-хірург, професор" }, { specialty: "Нейрохірург", isActive: false }];
// Render real public consumers and context with an isolated public-data boundary.
// No database, environment files, credentials, or network are accessed.
function load(relative) {
  let filename = path.resolve(root, relative);
  if (!path.extname(filename)) filename += existsSync(filename + ".tsx") ? ".tsx" : ".ts";
  assert.ok(filename.startsWith(root + path.sep));
  if (filename === path.join(root, "app/api/doctors/publicDoctors.ts")) return { listPublicDoctors: async () => doctors };
  if (modules.has(filename)) return modules.get(filename).exports;
  const loaded = { exports: {} };
  modules.set(filename, loaded);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const resolve = (name) => {
    if (name.endsWith(".css")) return {};
    if (name === "next/navigation") return { useSearchParams: () => new URLSearchParams() };
    if (name === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
    if (name === "next/image") return { __esModule: true, default: (props) => {
      const htmlProps = { ...props };
      for (const key of ["fill", "sizes", "quality", "priority", "preload", "unoptimized"]) delete htmlProps[key];
      return React.createElement("img", htmlProps);
    } };
    if (name.startsWith("@/")) return load(name.slice(2));
    if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), name)));
    if (["react", "react/jsx-runtime", "react-dom"].includes(name)) return requirePackage(name);
    throw new Error("Unexpected isolated rendering dependency: " + name);
  };
  new Function("require", "module", "exports", source)(resolve, loaded, loaded.exports);
  return loaded.exports;
}

const { getPublicDoctorCategories } = load("lib/publicDoctorSpecialties.ts");
const { PublicDoctorSpecialtiesProvider } = load("app/components/PublicDoctorSpecialtiesProvider.tsx");
const { SiteHeader } = load("app/components/SiteChrome.tsx");
const { DoctorsDirectory } = load("app/doctors/DoctorsDirectory.tsx");
const { defaultDoctors } = load("app/doctors/doctorData.ts");
const { ConsultationExperience } = load("app/services/[slug]/ConsultationExperience.tsx");

test("header navigation renders a linked new public specialty from context without hidden specialties", () => {
  const html = renderToStaticMarkup(React.createElement(PublicDoctorSpecialtiesProvider, { categories: getPublicDoctorCategories(doctors) }, React.createElement(SiteHeader)));
  assert.ok(html.includes(`/doctors?specialty=${encodeURIComponent("Проктолог-хірург")}`));
  assert.ok(html.includes("Проктолог-хірург</a>"));
  assert.doesNotMatch(html, /Нейрохірург/);
});

test("directory renders the new specialty as a selectable individual category", () => {
  const html = renderToStaticMarkup(React.createElement(DoctorsDirectory, { initialDoctors: [{ ...defaultDoctors[0], specialty: doctors[0].specialty }] }));
  assert.ok(html.includes('<option value="specialty:проктолог-хірург">Проктолог-хірург</option>'));
  assert.ok(!html.includes('<option value="specialty:професор">'));
});

test("consultation directions render new specialty with a working category URL and generic description", async () => {
  const html = renderToStaticMarkup(await ConsultationExperience());
  assert.ok(html.includes(`/doctors?specialty=${encodeURIComponent("specialty:проктолог-хірург")}`));
  assert.ok(html.includes("<strong>Проктолог-хірург</strong>"));
  assert.ok(html.includes("Профілі лікарів, графік прийому та запис."));
  assert.doesNotMatch(html, /Нейрохірург/);
});
