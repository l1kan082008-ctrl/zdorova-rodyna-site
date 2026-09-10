import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import * as bookingRequest from "../lib/bookingRequest.ts";

// Execute the real component handlers and API route with in-memory boundaries.
// This is not a browser rendering test. No database, credentials or network are used.
function load(path, dependencies = {}, globals = {}, suffix = "") {
  const source = readFileSync(new URL(path, import.meta.url), "utf8") + suffix;
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } });
  const loadedModule = { exports: {} };
  const require = (id) => {
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
function text(node) {
  if (Array.isArray(node)) return node.map(text).join(" ");
  return node && typeof node === "object" ? text(node.props?.children) : String(node ?? "");
}

function harness(responseOverride) {
  const stored = [], notifications = [], events = [], requests = [];
  const storage = new Map();
  const window = {
    location: new URL("http://test.local/contacts?services=КТ&total=4100#booking"),
    history: { state: null, replaceState: (_state, _title, url) => { window.location = new URL(url, window.location); } },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
    dispatchEvent: e => events.push(e), setTimeout: () => 1, clearTimeout: () => {},
  };
  const selection = load("../app/prices/calculatorSelection.ts", {}, { window });
  selection.addPriceCalculatorSelection("test-ct");
  selection.writePriceCalculatorCitoSelection(["test-ct"]);
  events.length = 0;
  const route = load("../app/api/bookings/route.ts", {
    "@/lib/requestBody": load("../lib/requestBody.ts"),
    "@/lib/publicSubmissionSecurity": {
      isSameOriginSubmission: () => true,
      checkPublicSubmissionRateLimit: async () => ({ allowed: true }),
      verifyTurnstileIfConfigured: async () => true,
    },
    "./bookingStore": { createBooking: async data => { stored.push(data); return "ZR-ISOLATED-TEST"; } },
    "@/lib/bookingNotification": { sendBookingNotification: async data => notifications.push(data) },
  });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const fetch = async (url, options) => {
    assert.equal(url, "/api/bookings");
    requests.push(JSON.parse(options.body));
    await gate;
    return responseOverride ? responseOverride() : route.POST(new Request("http://test.local/api/bookings", options));
  };
  const slots = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], v => { slots[i] = typeof v === "function" ? v(slots[i]) : v; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect() {},
  };
  const jsx = (type, props) => ({ type, props });
  const component = load("../app/components/BookingLauncher.tsx", {
    react, "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "../doctors/doctorCategories": load("../app/doctors/doctorCategories.ts"), "next/navigation": {}, "./CloseIcon": {}, "./TurnstileField": {},
    "../prices/calculatorSelection": selection, "../../lib/bookingRequest": bookingRequest,
  }, { window, fetch, FormData: class { constructor(form) { this.form = form; } get(k) { return this.form[k] ?? null; } } },
  "\nexport { BookingDialog as TestDialog };\n");
  const request = new URL(window.location);
  let closed = false;
  const render = () => { cursor = 0; return component.TestDialog({ request, onClose: () => { closed = true; } }); };
  nodes(render()).find(n => n.props?.name === "phone").props.onChange({ target: { value: "0671234567" } });
  const submit = nodes(render()).find(n => n.type === "form").props.onSubmit;
  const event = { preventDefault() {}, currentTarget: { name: "ІЗОЛЬОВАНИЙ ТЕСТ", consent: "on", website: "", comment: "Не реальна заявка" } };
  return { render, submit: () => submit(event), release, selection, events, stored, notifications, requests, window, isClosed: () => closed };
}

test("successful booking confirms, clears cart and CITO, and blocks a rapid duplicate submit", async () => {
  const h = harness();
  const pending = h.submit();
  await h.submit();
  assert.equal(h.requests.length, 1);
  assert.equal(nodes(h.render()).find(n => n.props?.type === "submit").props.disabled, true);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["test-ct"]);
  h.release();
  await pending;
  assert.equal(h.stored.length, 1);
  assert.equal(h.notifications.length, 1);
  assert.match(h.stored[0].comment, /Обрані дослідження: КТ/);
  assert.match(h.stored[0].comment, /4\s?100/);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), []);
  assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), []);
  assert.ok(h.events.some(e => e.type === "zdorova-rodyna-price-calculator-changed" && e.detail.length === 0));
  assert.equal(h.window.location.searchParams.has("services"), false);
  assert.equal(h.window.location.searchParams.has("total"), false);
  const result = h.render();
  assert.match(text(result), /Заявку отримано/);
  assert.equal(nodes(result).some(n => n.type === "form"), false);
  nodes(result).find(n => n.type === "button" && text(n) === "Готово").props.onClick();
  assert.equal(h.isClosed(), true);
});

for (const [name, response] of [
  ["server rejection", () => Response.json({ error: "Тестова помилка" }, { status: 500 })],
  ["missing confirmation", () => Response.json({})],
  ["network failure", () => { throw new Error("Test network failure"); }],
]) {
  test(`${name} preserves selection, shows an error and permits retry`, async () => {
    const h = harness(response);
    const pending = h.submit(); h.release(); await pending;
    assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["test-ct"]);
    assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), ["test-ct"]);
    const result = h.render();
    assert.ok(nodes(result).some(n => n.props?.role === "alert"));
    assert.equal(nodes(result).find(n => n.props?.type === "submit").props.disabled, false);
    assert.doesNotMatch(text(result), /Заявку отримано/);
    await h.submit();
    assert.equal(h.requests.length, 2);
    assert.equal(h.stored.length, 0);
  });
}
