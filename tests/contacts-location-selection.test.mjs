import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Exercise the actual server page and client wrapper at their data/router
// boundaries. No database, network, maps, or DOM effects are used.
function load(path, dependencies = {}, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } });
  const loadedModule = { exports: {} };
  const require = id => {
    if (!(id in dependencies)) throw new Error(`Unexpected dependency: ${id}`);
    return dependencies[id];
  };
  new Function("require", "module", "exports", ...Object.keys(globals), outputText)(
    require, loadedModule, loadedModule.exports, ...Object.values(globals),
  );
  return loadedModule.exports;
}

function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== "object") return [];
  return [node, ...nodes(node.props?.children)];
}

const jsx = (type, props) => ({ type, props });
const jsxRuntime = { jsx, jsxs: jsx, Fragment: "fragment" };
const locationData = load("../app/contacts/locationData.ts", {
  "./stelmakhaGallery": load("../app/contacts/stelmakhaGallery.ts"),
});
const siteSettings = load("../lib/siteSettings.ts");
const { centerLocations } = locationData;
const defaultLocationId = centerLocations[0].id;
const linkedLocationId = centerLocations[1].id;
const chosenLocationId = centerLocations[2].id;
const serverOnlyId = "isolated-server-only-location";
const publishedLocations = [
  ...centerLocations.map(location => ({ ...location, name: `${location.name} — оновлено` })),
  { ...centerLocations[0], id: serverOnlyId, name: "Нове тестове відділення" },
];
const ClientBoundary = Symbol("ContactsClient");
const ExplorerBoundary = Symbol("LocationsExplorer");
const HeaderBoundary = Symbol("SiteHeader");
const BookingBoundary = Symbol("ServiceBookingCta");

function loadPage(listPublicLocations) {
  return load("../app/contacts/page.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "../api/locations/publicLocations": { listPublicLocations },
    "./ContactsClient": { ContactsClient: ClientBoundary },
  }).default;
}

function clientHarness(query = "", locations = publishedLocations, hash = "#locations") {
  let currentUrl = new URL(`https://test.local/contacts${query}${hash}`);
  const historyCalls = [];
  const window = {
    get location() { return currentUrl; },
    history: {
      replaceState(state, title, url) {
        historyCalls.push({ state, title, url });
        currentUrl = new URL(url, currentUrl);
      },
    },
  };
  const { ContactsClient } = load("../app/contacts/ContactsClient.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "next/navigation": { useSearchParams: () => new URLSearchParams(currentUrl.search) },
    "next/image": { default: Symbol("Image") },
    "../services/[slug]/ServiceBookingCta": { ServiceBookingCta: BookingBoundary },
    "../components/SiteChrome": { SiteHeader: HeaderBoundary, SiteFooter: Symbol("SiteFooter") },
    "../components/SiteSettingsProvider": { useSiteSettings: () => siteSettings.defaultSiteSettings },
    "@/lib/siteSettings": siteSettings,
    "./LocationsExplorer": { LocationsExplorer: ExplorerBoundary },
  }, { window });
  const render = () => ContactsClient({ locations });
  const explorer = () => nodes(render()).find(node => node.type === ExplorerBoundary).props;
  const bookingUrls = () => nodes(render())
    .filter(node => node.type === HeaderBoundary || node.type === BookingBoundary)
    .map(node => new URL(node.props.bookingHref, currentUrl));
  return {
    explorer, bookingUrls, historyCalls,
    select: id => explorer().onSelectLocation(id),
    url: () => currentUrl,
    navigate: url => { currentUrl = new URL(url, currentUrl); },
  };
}

test("contacts server page waits for published locations before passing them to the client", async () => {
  let release;
  let calls = 0;
  let completed = false;
  const pendingLocations = new Promise(resolve => { release = resolve; });
  const page = loadPage(() => { calls += 1; return pendingLocations; });
  const pendingPage = page().then(result => { completed = true; return result; });
  await Promise.resolve();
  assert.equal(calls, 1);
  assert.equal(completed, false, "must not render bundled locations while published data is pending");
  release(publishedLocations);
  const result = await pendingPage;
  assert.equal(result.type, ClientBoundary);
  assert.equal(result.props.locations, publishedLocations);
});

test("contacts server page propagates catalogue failures instead of exposing stale bundled locations", async () => {
  const failure = new Error("isolated published catalogue failure");
  await assert.rejects(loadPage(async () => { throw failure; })(), error => error === failure);
});

test("contacts server page preserves a successfully empty published catalogue", async () => {
  const locations = [];
  const result = await loadPage(async () => locations)();
  assert.equal(result.props.locations, locations);
});

for (const id of [linkedLocationId, serverOnlyId]) {
  test(`contacts selects the URL's published location on the first render: ${id}`, () => {
    const h = clientHarness(`?location=${id}`);
    assert.equal(h.explorer().selectedLocationId, id);
    assert.equal(h.explorer().locations, publishedLocations);
    assert.equal(h.historyCalls.length, 0, "initial rendering must not rewrite the visitor URL");
    assert.equal(h.bookingUrls().length, 2);
    for (const url of h.bookingUrls()) {
      assert.equal(url.pathname, "/contacts");
      assert.equal(url.searchParams.get("location"), id);
      assert.equal(url.hash, "#booking");
    }
  });
}

for (const query of ["", "?location=not-a-published-location"]) {
  test(`contacts falls back to the first published branch for ${query || "an unfiltered URL"}`, () => {
    const h = clientHarness(query);
    assert.equal(h.explorer().selectedLocationId, defaultLocationId);
    assert.equal(h.url().search, query, "selection fallback must not redirect or alter the incoming URL");
    for (const url of h.bookingUrls()) assert.equal(url.searchParams.get("location"), defaultLocationId);
    assert.equal(h.historyCalls.length, 0);
  });
}

test("contacts with no published locations keeps the catalogue empty and omits stale location from booking", () => {
  const h = clientHarness("?location=removed-branch&utm_source=search&service=%D0%9A%D0%A2", []);
  assert.deepEqual(h.explorer().locations, []);
  assert.equal(h.explorer().selectedLocationId, "");
  for (const url of h.bookingUrls()) {
    assert.equal(url.searchParams.has("location"), false);
    assert.equal(url.searchParams.get("utm_source"), "search");
    assert.equal(url.searchParams.get("service"), "КТ");
    assert.equal(url.hash, "#booking");
  }
  assert.equal(h.url().searchParams.get("location"), "removed-branch");
});

test("changing a branch preserves repeated tracking parameters, booking context and the current fragment", () => {
  const query = `?location=${linkedLocationId}&utm_source=google&utm_content=first&utm_content=second&service=%D0%9C%D0%A0%D0%A2&bookingCategory=mri&doctorId=sample-doctor&study=sample-study`;
  const h = clientHarness(query, publishedLocations, "#locations");
  h.select(chosenLocationId);
  assert.equal(h.historyCalls.length, 1);
  assert.equal(h.url().pathname, "/contacts");
  assert.equal(h.url().hash, "#locations");
  assert.equal(h.explorer().selectedLocationId, chosenLocationId);
  for (const url of [h.url(), ...h.bookingUrls()]) {
    assert.equal(url.searchParams.get("location"), chosenLocationId);
    assert.equal(url.searchParams.get("utm_source"), "google");
    assert.deepEqual(url.searchParams.getAll("utm_content"), ["first", "second"]);
    assert.equal(url.searchParams.get("service"), "МРТ");
    assert.equal(url.searchParams.get("bookingCategory"), "mri");
    assert.equal(url.searchParams.get("doctorId"), "sample-doctor");
    assert.equal(url.searchParams.get("study"), "sample-study");
  }
  for (const url of h.bookingUrls()) assert.equal(url.hash, "#booking");
});

test("a branch change preserves an existing booking fragment", () => {
  const h = clientHarness(`?location=${linkedLocationId}`, publishedLocations, "#booking");
  h.select(chosenLocationId);
  assert.equal(h.url().hash, "#booking");
  assert.equal(h.explorer().selectedLocationId, chosenLocationId);
});

test("contacts reflects later router query changes without retaining an earlier branch selection", () => {
  const h = clientHarness(`?location=${linkedLocationId}`);
  h.select(chosenLocationId);
  h.navigate(`/contacts?location=${serverOnlyId}&utm_source=return#locations`);
  assert.equal(h.explorer().selectedLocationId, serverOnlyId);
  for (const url of h.bookingUrls()) {
    assert.equal(url.searchParams.get("location"), serverOnlyId);
    assert.equal(url.searchParams.get("utm_source"), "return");
  }
});
