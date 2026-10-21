import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadModule(path, dependencies = {}) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: path,
  }).outputText;
  const loaded = { exports: {} };
  const require = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unexpected test dependency: ${name}`);
  };
  new Function("require", "module", "exports", compiled)(require, loaded, loaded.exports);
  return loaded.exports;
}

const serviceData = loadModule("../app/services/serviceData.ts");
const origin = "https://zdorovarodynaplus.com.ua";

function loadSitemap(doctors) {
  return loadModule("../app/sitemap.ts", {
    "./api/doctors/publicDoctors": { listPublicDoctors: async () => doctors },
    "./services/serviceData": serviceData,
  });
}

test("sitemap exposes screening and public routes without queries, private routes or invented dates", async () => {
  const { default: sitemap, dynamic } = loadSitemap([
    { id: "public-doctor", isActive: true },
    { id: "hidden-doctor", isActive: false },
    { id: "public-doctor", isActive: true },
  ]);
  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.equal(dynamic, "force-dynamic");
  assert.ok(urls.includes(`${origin}/services/screening-40`));
  assert.ok(urls.includes(`${origin}/doctors/public-doctor`));
  assert.ok(!urls.includes(`${origin}/doctors/hidden-doctor`));
  assert.equal(new Set(urls).size, urls.length);
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, origin);
    assert.equal(url.search, "");
    assert.equal(url.hash, "");
    assert.ok(!/^\/(?:admin|api)(?:\/|$)/u.test(url.pathname));
    assert.deepEqual(Object.keys(entry), ["url"]);
  }
});

test("a public-doctor outage result keeps screening indexable without republishing bundled doctors", async () => {
  const { default: sitemap } = loadSitemap([]);
  const entries = await sitemap();
  assert.ok(entries.some(({ url }) => url === `${origin}/services/screening-40`));
  assert.ok(entries.every(({ url }) => !url.startsWith(`${origin}/doctors/`)));
});

test("robots permits public rendering, hides admin/API paths and advertises the production sitemap", () => {
  const { default: robots } = loadModule("../app/robots.ts");
  const result = robots();
  assert.equal(result.sitemap, `${origin}/sitemap.xml`);
  assert.equal(result.rules.userAgent, "*");
  assert.ok(result.rules.allow.includes("/"));
  assert.deepEqual(result.rules.disallow, ["/admin", "/api/"]);
  for (const path of ["/api/doctors/photo", "/api/services/image", "/api/banners/image"]) {
    assert.ok(result.rules.allow.includes(path), `${path} remains crawlable`);
  }
});
