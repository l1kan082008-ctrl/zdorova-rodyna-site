import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Run the real catalog, event listeners and ordered effects without browser/network I/O.
function load(path, dependencies = {}, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const loadedModule = { exports: {} };
  const require = (id) => {
    if (!(id in dependencies)) throw new Error("Unexpected dependency: " + id);
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

const items = [
  { id: "study-a", name: "Дослідження А", category: "general", categoryLabel: "Аналізи", amount: 300, citoAvailable: true },
  { id: "study-b", name: "Дослідження Б", category: "general", categoryLabel: "Аналізи", amount: 400, citoAvailable: true },
];

function harness(seed = {}) {
  const storage = new Map(Object.entries(seed));
  const window = new EventTarget();
  const timers = new Map();
  let timerId = 0;
  Object.assign(window, {
    location: new URL("http://test.local/prices"), scrollY: 0,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key),
    },
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
    matchMedia: () => ({ matches: true }),
    scrollTo() {},
  });
  const document = {
    body: { style: {}, classList: { add() {}, remove() {} } },
    documentElement: { style: {} },
  };
  const selection = load("../app/prices/calculatorSelection.ts", {}, { window });
  const announcements = [];
  window.addEventListener(selection.PRICE_CALCULATOR_CHANGED_EVENT, event => {
    announcements.push({ ids: event.detail, citoIds: selection.readPriceCalculatorCitoSelection() });
  });

  const slots = [];
  let cursor = 0, dirty = true, effects = [], tree;
  const sameDeps = (left, right) => left && right && left.length === right.length && left.every((v, i) => Object.is(v, right[i]));
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], update => {
        const next = typeof update === "function" ? update(slots[i]) : update;
        if (!Object.is(slots[i], next)) { slots[i] = next; dirty = true; }
      }];
    },
    useRef(initial) { return slots[cursor++] ??= { current: initial }; },
    useMemo(compute, deps) {
      const i = cursor++;
      if (!sameDeps(slots[i]?.deps, deps)) slots[i] = { deps, value: compute() };
      return slots[i].value;
    },
    useEffect(effect, deps) {
      const i = cursor++;
      if (sameDeps(slots[i]?.deps, deps)) return;
      const old = slots[i];
      slots[i] = { deps };
      effects.push(() => { old?.cleanup?.(); slots[i].cleanup = effect(); });
    },
  };
  const jsx = (type, props) => ({ type, props });
  const { PriceCatalog } = load("../app/prices/PriceCatalog.tsx", {
    react, "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "react-dom": { createPortal: child => child },
    "../components/CloseIcon": {}, "./PriceCategoryIcon": {},
    "./priceData": { catalogItems: items },
    "./deduplicateSearch": load("../app/prices/deduplicateSearch.ts"),
    "./calculatorSelection": selection,
    "../search/medicalSearch": load("../app/search/medicalSearch.ts"),
    "../components/useModalDialog": { useModalDialog() {} },
    "./citoPolicy": load("../app/prices/citoPolicy.ts"),
    "./calculatorExport": {
      isCalculatorPdfPrepared: () => false,
      prepareCalculatorPdf: () => new Promise(() => {}),
    },
  }, { window, document });

  const flush = () => {
    let passes = 0;
    while (dirty || timers.size) {
      assert.ok(++passes < 30, "selection updates must settle without an event echo loop");
      if (dirty) {
        dirty = false; cursor = 0; effects = [];
        tree = PriceCatalog({ initialItems: items });
        for (const effect of effects) effect();
      }
      const pending = [...timers.values()];
      timers.clear();
      for (const callback of pending) callback();
    }
    return tree;
  };
  const row = id => nodes(tree).find(node =>
    node.props?.className?.split(" ").includes("medical-price-row") &&
    nodes(node).some(child => child.props?.["aria-label"] === "CITO для " + items.find(item => item.id === id).name + ", термінове виконання до 2 годин"));
  const citoSwitch = id => nodes(row(id)).find(node => node.props?.role === "switch");
  flush();
  return {
    selection, announcements, flush,
    enabled: id => citoSwitch(id).props["aria-checked"],
    toggleCito(id) { citoSwitch(id).props.onClick(); flush(); },
    toggleItem(id) {
      nodes(row(id)).find(node => node.props?.className?.split(" ").includes("price-row-action")).props.onClick();
      flush();
    },
    checkout() {
      window.dispatchEvent(new Event(selection.PRICE_CALCULATOR_OPEN_EVENT)); flush();
      return new URL(nodes(tree).find(node => node.type === "a" && node.props.href?.includes("#booking")).props.href, window.location);
    },
  };
}

test("first CITO click selects the study and retains CITO through self-announcement", () => {
  const h = harness();
  h.toggleCito("study-a");
  assert.equal(h.enabled("study-a"), true);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["study-a"]);
  assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), ["study-a"]);
  assert.deepEqual(h.announcements.at(-1), { ids: ["study-a"], citoIds: ["study-a"] });
  const checkout = h.checkout();
  assert.equal(checkout.searchParams.get("total"), "500");
  assert.match(checkout.searchParams.get("services"), /Дослідження А — CITO/);
});

test("CITO can turn off independently, survives another addition, and is removed with its study", () => {
  const h = harness();
  h.toggleCito("study-a");
  h.toggleItem("study-b");
  assert.equal(h.enabled("study-a"), true);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["study-a", "study-b"]);
  h.toggleCito("study-a");
  assert.equal(h.enabled("study-a"), false);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["study-a", "study-b"]);
  assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), []);
  h.toggleCito("study-a");
  h.toggleItem("study-a");
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["study-b"]);
  assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), []);
});

test("saved CITO hydrates and an external clear updates both sets without event loops", () => {
  const h = harness({
    "zdorova-rodyna-price-calculator-v1": '["study-a"]',
    "zdorova-rodyna-price-calculator-cito-v1": '["study-a"]',
  });
  assert.equal(h.enabled("study-a"), true);
  h.selection.clearPriceCalculatorSelection();
  h.flush();
  assert.equal(h.enabled("study-a"), false);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), []);
  assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), []);
});

