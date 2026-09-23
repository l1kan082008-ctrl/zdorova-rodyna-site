import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Run the real contacts page's state/effect handlers with an isolated delayed API.
// LocationsExplorer is a controlled child boundary; no maps or network are loaded.
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

const locationData = load("../app/contacts/locationData.ts", {
  "./stelmakhaGallery": load("../app/contacts/stelmakhaGallery.ts"),
});
const siteSettings = load("../lib/siteSettings.ts");
const { centerLocations } = locationData;
const defaultLocationId = centerLocations[0].id;
const linkedDefaultId = centerLocations[1].id;
const chosenLocationId = centerLocations[2].id;
const apiOnlyId = "isolated-api-only-location";
const apiLocations = [
  ...centerLocations.map(location => ({ ...location, name: `${location.name} — оновлено` })),
  { ...centerLocations[0], id: apiOnlyId, name: "Нове тестове відділення" },
];
const ExplorerBoundary = Symbol("LocationsExplorer");
const HeaderBoundary = Symbol("SiteHeader");
const BookingBoundary = Symbol("ServiceBookingCta");

function harness(linkedLocation, response = () => Response.json({ locations: apiLocations })) {
  const requests = [], slots = [], effectSlots = [], pendingEffects = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], value => { slots[i] = typeof value === "function" ? value(slots[i]) : value; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect(effect, dependencies) {
      const i = cursor++;
      const previous = effectSlots[i];
      if (previous && dependencies?.length === previous.dependencies?.length &&
          dependencies?.every((value, index) => Object.is(value, previous.dependencies[index]))) return;
      effectSlots[i] = { dependencies };
      pendingEffects.push(() => {
        previous?.cleanup?.();
        effectSlots[i].cleanup = effect();
      });
    },
  };
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const fetch = async (url, options) => {
    assert.equal(url, "/api/locations", "unexpected request in isolated contacts test");
    requests.push({ url, signal: options.signal });
    await gate;
    if (options.signal.aborted) throw new DOMException("Aborted", "AbortError");
    return response();
  };
  const jsx = (type, props) => ({ type, props });
  const page = load("../app/contacts/page.tsx", {
    react, "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/image": { default: Symbol("Image") },
    "../services/[slug]/ServiceBookingCta": { ServiceBookingCta: BookingBoundary },
    "../components/SiteChrome": { SiteHeader: HeaderBoundary, SiteFooter: Symbol("SiteFooter") },
    "../components/SiteSettingsProvider": { useSiteSettings: () => siteSettings.defaultSiteSettings },
    "@/lib/siteSettings": siteSettings,
    "./LocationsExplorer": { LocationsExplorer: ExplorerBoundary },
    "./locationData": locationData,
  }, {
    fetch,
    window: { location: new URL(`http://test.local/contacts${linkedLocation ? `?location=${encodeURIComponent(linkedLocation)}` : ""}`) },
  }).default;
  const render = () => { cursor = 0; return page(); };
  const explorer = () => nodes(render()).find(node => node.type === ExplorerBoundary).props;
  const mount = () => {
    render();
    while (pendingEffects.length) pendingEffects.shift()();
    return explorer();
  };
  const select = locationId => explorer().onSelectLocation(locationId);
  const resolveLocations = async () => {
    release();
    // Wait for the fetch and response.json promise chain, not a timing heuristic.
    await new Promise(resolve => setImmediate(resolve));
    return explorer();
  };
  const bookingHrefs = () => nodes(render())
    .filter(node => node.type === HeaderBoundary || node.type === BookingBoundary)
    .map(node => node.props.bookingHref);
  const dispose = () => effectSlots.forEach(effect => effect?.cleanup?.());
  return { render, explorer, mount, select, resolveLocations, bookingHrefs, requests, dispose };
}

test("contacts applies an existing deep-linked location before the API resolves", async t => {
  const h = harness(linkedDefaultId);
  t.after(h.dispose);
  assert.equal(h.explorer().selectedLocationId, defaultLocationId);
  assert.equal(h.mount().selectedLocationId, linkedDefaultId);
  assert.equal(h.requests.length, 1);
  const updated = await h.resolveLocations();
  assert.equal(updated.selectedLocationId, linkedDefaultId);
  assert.deepEqual(updated.locations, apiLocations);
});

test("contacts resolves a server-only deep link when the visitor has not chosen another location", async t => {
  const h = harness(apiOnlyId);
  t.after(h.dispose);
  assert.equal(h.mount().selectedLocationId, defaultLocationId);
  const updated = await h.resolveLocations();
  assert.equal(updated.selectedLocationId, apiOnlyId);
  assert.deepEqual(updated.locations, apiLocations);
});

for (const linkedLocation of [linkedDefaultId, apiOnlyId]) {
  test(`contacts preserves a user selection after delayed API resolves ${linkedLocation}`, async t => {
    const h = harness(linkedLocation);
    t.after(h.dispose);
    h.mount();
    h.select(chosenLocationId);
    assert.equal(h.explorer().selectedLocationId, chosenLocationId);
    const updated = await h.resolveLocations();
    assert.equal(updated.selectedLocationId, chosenLocationId, "late API must not restore the initial URL selection");
    assert.deepEqual(updated.locations, apiLocations, "protecting selection must not discard refreshed locations");
    assert.deepEqual(h.bookingHrefs(), Array(2).fill(`/contacts?location=${encodeURIComponent(chosenLocationId)}#booking`));
    assert.equal(h.requests.length, 1, "selection changes must not refetch locations");
  });
}

test("contacts keeps a user selection made before the mount effect applies the URL", async t => {
  const h = harness(linkedDefaultId);
  t.after(h.dispose);
  h.select(chosenLocationId);
  assert.equal(h.mount().selectedLocationId, chosenLocationId);
  const updated = await h.resolveLocations();
  assert.equal(updated.selectedLocationId, chosenLocationId);
  assert.deepEqual(updated.locations, apiLocations);
});

test("contacts without a deep link retains the default while replacing location data", async t => {
  const h = harness();
  t.after(h.dispose);
  assert.equal(h.mount().selectedLocationId, defaultLocationId);
  const updated = await h.resolveLocations();
  assert.equal(updated.selectedLocationId, defaultLocationId);
  assert.deepEqual(updated.locations, apiLocations);
});

test("contacts retains local locations and the user selection when API fails", async t => {
  const h = harness(linkedDefaultId, () => Response.json({ error: "Isolated error" }, { status: 503 }));
  t.after(h.dispose);
  h.mount();
  h.select(chosenLocationId);
  const updated = await h.resolveLocations();
  assert.equal(updated.selectedLocationId, chosenLocationId);
  assert.deepEqual(updated.locations, centerLocations);
});
