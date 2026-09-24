import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

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

const bookingRequest = load("../lib/bookingRequest.ts", {
  "./locationPolicy": load("../lib/locationPolicy.ts"),
});
const siteSettings = load("../lib/siteSettings.ts");
// The picker is a controlled child boundary, not a mocked native select.
// These tests exercise the real dialog handlers using its public props.
const BookingStudySelectBoundary = Symbol("BookingStudySelect");
const priceItems = [
  { id: "ct-head", name: "КТ головного мозку", category: "ct", categoryLabel: "КТ", amount: 1200 },
  { id: "ct-chest", name: "КТ органів грудної клітки", category: "ct", categoryLabel: "КТ", amount: 1400 },
  { id: "mri-head", name: "МРТ головного мозку", category: "mri", categoryLabel: "МРТ", amount: 1900 },
  { id: "mri-knee", name: "МРТ колінного суглоба", category: "mri", categoryLabel: "МРТ", amount: 2100 },
  { id: "ultrasound", name: "УЗД щитоподібної залози", category: "ultrasound", categoryLabel: "УЗД", amount: 500 },
  { id: "doppler", name: "Доплер судин шиї", category: "doppler", categoryLabel: "Доплер", amount: 700 },
  { id: "blood", name: "Загальний аналіз крові", category: "general", categoryLabel: "Аналізи", amount: 250 },
];
const locations = [
  { id: "imaging", city: "Рівне", name: "Тестове діагностичне відділення", fullAddress: "Рівне, тестова адреса", services: ["ct", "mri", "ultrasound"] },
  { id: "doctor", city: "Рівне", name: "Тестове консультаційне відділення", fullAddress: "Рівне, друга тестова адреса", services: ["doctors", "laboratory"] },
];

function harness(responseOverride, options = {}) {
  const stored = [], notifications = [], events = [], requests = [], resourceRequests = [], eventVisibility = [];
  let committedTree;
  const storage = new Map();
  const window = {
    dataLayer: options.dataLayer ?? [],
    location: new URL(options.url ?? "http://test.local/contacts?services=КТ&total=4100#booking"),
    history: { state: null, replaceState: (_state, _title, url) => { window.location = new URL(url, window.location); } },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
    dispatchEvent: e => events.push(e), setTimeout: () => 1, clearTimeout: () => {},
  };
  const document = { body: {}, documentElement: { classList: { add() {}, remove() {} } } };
  const originalPush = window.dataLayer.push.bind(window.dataLayer);
  Object.defineProperty(window.dataLayer, "push", { value: event => {
    eventVisibility.push(nodes(committedTree).some(node => node.props?.className === "quick-booking__success"));
    return originalPush(event);
  } });
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
  let release, releasePrices;
  const gate = new Promise(resolve => { release = resolve; });
  const pricesGate = new Promise(resolve => { releasePrices = resolve; });
  if (!options.deferPrices) releasePrices();
  const fetch = async (url, fetchOptions) => {
    if (url === "/api/locations") {
      resourceRequests.push(url);
      return Response.json({ locations });
    }
    if (url === "/api/public/prices") {
      resourceRequests.push(url);
      await pricesGate;
      return options.pricesResponse ? options.pricesResponse() : Response.json(options.priceItems ?? priceItems);
    }
    assert.equal(url, "/api/bookings", "unexpected network request in isolated component test");
    requests.push(JSON.parse(fetchOptions.body));
    await gate;
    return responseOverride ? responseOverride() : route.POST(new Request("http://test.local/api/bookings", fetchOptions));
  };
  const slots = [], effectSlots = [], pendingEffects = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], v => { slots[i] = typeof v === "function" ? v(slots[i]) : v; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect(effect, deps) {
      const i = cursor++;
      const previous = effectSlots[i];
      if (!previous || !deps || deps.some((value, index) => !Object.is(value, previous.deps?.[index]))) {
        pendingEffects.push(() => {
          previous?.cleanup?.();
          effectSlots[i] = { deps, cleanup: effect() };
        });
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const analytics = load("../lib/bookingAnalytics.ts", {}, { window });
  const confirmation = load("../app/components/useBookingConfirmation.ts", {
    react, "@/lib/bookingAnalytics": analytics,
  });
  const component = load("../app/components/BookingLauncher.tsx", {
    react, "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "react-dom": { createPortal: child => child },
    "./SiteSettingsProvider": { useSiteSettings: () => siteSettings.defaultSiteSettings },
    "@/lib/siteSettings": siteSettings,
    "@/lib/bookingSubmission": load("../lib/bookingSubmission.ts"),
    "./useBookingConfirmation": confirmation,
    "@/lib/bookingDetails": load("../lib/bookingDetails.ts"),
    "./useModalDialog": { useModalDialog: () => {} },
    "./BookingStudySelect": { BookingStudySelect: BookingStudySelectBoundary },
    "@/lib/imagingBooking": load("../lib/imagingBooking.ts"),
    "../doctors/doctorCategories": load("../app/doctors/doctorCategories.ts"), "next/navigation": {}, "./CloseIcon": {}, "./TurnstileField": {},
    "../prices/calculatorSelection": selection, "../../lib/bookingRequest": bookingRequest,
  }, { window, document, fetch, FormData: class { constructor(form) { this.form = form; } get(k) { return this.form[k] ?? null; } } },
  "\nexport { BookingDialog as TestDialog };\n");
  const request = new URL(window.location);
  let closed = false;
  const render = () => {
    cursor = 0;
    const tree = component.TestDialog({ request, sourcePathname: options.sourcePathname, onClose: () => { closed = true; } });
    committedTree = tree;
    while (pendingEffects.length) pendingEffects.shift()();
    return tree;
  };
  nodes(render()).find(n => n.props?.name === "phone").props.onChange({ target: { value: options.phone ?? "0671234567" } });
  const form = { name: "ІЗОЛЬОВАНИЙ ТЕСТ", consent: options.consent ?? "on", website: options.website ?? "", comment: "Не реальна заявка", querySelector: () => ({ focus() {} }), reportValidity: () => options.nativeValid ?? true };
  let clickPrevented = false;
  const event = { preventDefault() { clickPrevented = true; }, currentTarget: { form } };
  const submit = () => nodes(render()).find(n => n.props?.type === "submit").props.onClick(event);
  const nativeSubmit = () => nodes(render()).find(n => n.type === "form").props.onSubmit({ preventDefault() {} });
  const flush = async () => { await new Promise(resolve => setImmediate(resolve)); return render(); };
  const dispose = () => effectSlots.forEach(effect => effect?.cleanup?.());
  return { render, submit, nativeSubmit, release, releasePrices, flush, dispose, selection, events, stored, notifications, requests, resourceRequests, window, eventVisibility, isClickPrevented: () => clickPrevented, isClosed: () => closed };
}

test("booking phone is invalid before the browser can dispatch submit", context => {
  for (const [phone, expectedValid] of [
    ["", false], ["09877", false], ["098765432", false],
    ["1987654321", false], ["0000000000", false],
    ["0987654321", true], ["+380987654321", true],
  ]) {
    const h = harness(undefined, { phone });
    context.after(h.dispose);
    const input = nodes(h.render()).find(node => node.props?.id === "quick-phone").props;
    assert.equal(input.required, true);
    assert.ok(input.pattern, "tel inputs need a native constraint, not only an onSubmit guard");
    const valid = Boolean(input.value) && new RegExp(`^(?:${input.pattern})$`, "v").test(input.value);
    assert.equal(valid, expectedValid, `browser constraint for ${phone || "empty phone"}`);
  }
});

test("appointment: native constraints block click activation before a request and native submit is inert", async () => {
  const h = harness(undefined, { nativeValid: false });
  await h.submit();
  assert.equal(h.isClickPrevented(), true);
  assert.deepEqual(h.requests, []);
  await h.nativeSubmit();
  assert.deepEqual(h.requests, [], "a submit event must never be the request entry point");
  assert.deepEqual(h.window.dataLayer, []);
});

test("appointment: a synthetic native submit with valid fields cannot start a request", async () => {
  const h = harness();
  await h.nativeSubmit();
  assert.deepEqual(h.requests, []);
  assert.deepEqual(h.window.dataLayer, []);
});

test("successful booking confirms, clears cart and CITO, and blocks a rapid duplicate submit", async () => {
  const h = harness();
  const pending = h.submit();
  await h.submit();
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.window.dataLayer, [], "no success event before API confirmation");
  assert.equal(nodes(h.render()).find(n => n.props?.type === "submit").props.disabled, true);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["test-ct"]);
  h.release();
  await pending;
  assert.equal(h.stored.length, 1);
  assert.equal(h.notifications.length, 1);
  assert.deepEqual(h.window.dataLayer, [], "API confirmation alone cannot emit before the confirmation UI commits");
  assert.match(h.stored[0].comment, /Обрані дослідження:\n• КТ/);
  assert.match(h.stored[0].comment, /4\s?100/);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), []);
  assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), []);
  assert.ok(h.events.some(e => e.type === "zdorova-rodyna-price-calculator-changed" && e.detail.length === 0));
  assert.equal(h.window.location.searchParams.has("services"), false);
  assert.equal(h.window.location.searchParams.has("total"), false);
  const result = h.render();
  assert.deepEqual(h.window.dataLayer, [{ event: "form_submit", form_type: "appointment" }]);
  assert.deepEqual(h.eventVisibility, [true], "the confirmation exists when analytics observes the event");
  assert.equal(h.isClickPrevented(), true, "the native submit default was cancelled before the request");
  h.render();
  assert.equal(h.window.dataLayer.length, 1, "a rerender cannot repeat the conversion");
  assert.match(text(result), /Заявку отримано/);
  assert.equal(nodes(result).some(n => n.type === "form"), false);
  nodes(result).find(n => n.type === "button" && text(n) === "Готово").props.onClick();
  assert.equal(h.isClosed(), true);
});

for (const [name, response] of [
  ["server rejection", () => Response.json({ error: "Тестова помилка" }, { status: 500 })],
  ["missing confirmation", () => Response.json({})],
  ["empty confirmation", () => Response.json({ reference: " " })],
  ["malformed confirmation", () => Response.json({ reference: 123 })],
  ["non-JSON response", () => new Response("unavailable")],
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
    assert.deepEqual(h.window.dataLayer, []);
  });
}

for (const phone of ["", "067", "067123456", "0000000000"]) {
  test(`invalid phone ${JSON.stringify(phone)} neither submits nor reports a booking`, async () => {
    const h = harness(undefined, { phone });
    await h.submit();
    assert.equal(h.requests.length, 0);
    assert.deepEqual(h.window.dataLayer, []);
    assert.ok(nodes(h.render()).some(n => n.props?.role === "alert"));
  });
}

test("honeypot decoy confirmation never becomes an analytics conversion", async () => {
  const h = harness(undefined, { website: "https://bot.invalid" });
  const pending = h.submit(); h.release(); await pending;
  assert.equal(h.requests.length, 1);
  assert.equal(h.stored.length, 0);
  assert.equal(h.notifications.length, 0);
  assert.deepEqual(h.window.dataLayer, []);
  assert.match(text(h.render()), /Заявку отримано/, "keep the honeypot response indistinguishable to bots");
});

test("server validation failure does not report a booking", async () => {
  const h = harness(undefined, { consent: "" });
  const pending = h.submit(); h.release(); await pending;
  assert.equal(h.stored.length, 0);
  assert.deepEqual(h.window.dataLayer, []);
  assert.ok(nodes(h.render()).some(n => n.props?.role === "alert"));
});

test("analytics failure cannot turn a saved booking into a visible failure", async () => {
  const h = harness(undefined, { dataLayer: { push() { throw new Error("Third-party error"); } } });
  const pending = h.submit(); h.release(); await pending;
  assert.equal(h.stored.length, 1);
  assert.match(text(h.render()), /Заявку отримано/);
  assert.equal(nodes(h.render()).some(n => n.props?.role === "alert"), false);
});


function serviceControl(tree) {
  return nodes(tree).find(node => (node.type === "select" || node.type === BookingStudySelectBoundary) && node.props.id === "quick-service");
}
function optionValues(select) {
  assert.ok(select, "the native service/location selector must be rendered");
  assert.equal(select.type, "select", "native option assertions must not emulate the custom study picker");
  return nodes(select).filter(node => node.type === "option").map(node => node.props.value ?? text(node));
}
function studyProps(control) {
  assert.ok(control, "the controlled study picker must be rendered");
  assert.equal(control.type, BookingStudySelectBoundary);
  assert.equal(typeof control.props.label, "string");
  assert.ok(control.props.label.trim());
  assert.equal(typeof control.props.onChange, "function");
  return control.props;
}
function bookingUrl(params = {}) {
  const url = new URL("http://test.local/contacts#booking");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.href;
}

for (const [category, label, requested, changed, allowed] of [
  ["ct", "КТ", "КТ головного мозку", "КТ органів грудної клітки", ["КТ головного мозку", "КТ органів грудної клітки"]],
  ["mri", "МРТ", "МРТ головного мозку", "МРТ колінного суглоба", ["МРТ головного мозку", "МРТ колінного суглоба"]],
  ["ultrasound", "УЗД", "УЗД щитоподібної залози", "Доплер судин шиї", ["УЗД щитоподібної залози", "Доплер судин шиї"]],
]) {
  test(category + " booking lists only its studies and submits the newly chosen name to the real API handler", async context => {
    const h = harness(undefined, { url: bookingUrl({ service: requested, bookingCategory: category }) });
    context.after(h.dispose);
    let tree = await h.flush();
    let select = serviceControl(tree);
    assert.equal(select.props.value, requested);
    assert.deepEqual(studyProps(select).options, allowed);
    assert.equal(select.props.helpValue, label);
    select.props.onChange(changed);
    tree = h.render();
    select = serviceControl(tree);
    assert.equal(select.props.value, changed);
    const locationSelect = nodes(tree).find(node => node.props?.id === "quick-location");
    assert.deepEqual(optionValues(locationSelect), ["imaging"], "modality-compatible branch remains available for a name without its prefix");
    const pending = h.submit();
    assert.equal(studyProps(serviceControl(h.render())).disabled, true, "the picker is disabled while the form submits");
    assert.equal(h.requests[0].service, changed);
    h.release();
    await pending;
    assert.equal(h.stored[0].service, changed);
    assert.equal(h.notifications[0].service, changed);
    assert.doesNotMatch(h.stored[0].comment, new RegExp(requested));
    assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["test-ct"], "single study booking must not clear the unrelated calculator");
    assert.deepEqual(h.selection.readPriceCalculatorCitoSelection(), ["test-ct"]);
  });
}

test("header booking on each modality page inherits the category while an ordinary page stays broad", async context => {
  for (const [category, label] of [["ct", "КТ"], ["mri", "МРТ"], ["ultrasound", "УЗД"]]) {
    const h = harness(undefined, { url: bookingUrl(), sourcePathname: "/services/" + category });
    context.after(h.dispose);
    const select = serviceControl(await h.flush());
    assert.equal(select.props.value, label);
    assert.equal(studyProps(select).helpValue, label);
    const allowed = priceItems.filter(item => item.category === category || (category === "ultrasound" && item.category === "doppler")).map(item => item.name);
    assert.deepEqual(select.props.options, allowed);
    assert.equal(h.resourceRequests.filter(url => url === "/api/public/prices").length, 1);
  }
  const h = harness(undefined, { url: bookingUrl(), sourcePathname: "/about" });
  context.after(h.dispose);
  const select = serviceControl(await h.flush());
  const choices = optionValues(select);
  for (const value of ["МРТ", "КТ", "УЗД", "Лабораторні дослідження", "Консультації лікарів"]) assert.ok(choices.includes(value));
  assert.equal(h.resourceRequests.includes("/api/public/prices"), false);
  select.props.onChange({ target: { value: "Лабораторні дослідження" } });
  const pending = h.submit(); h.release(); await pending;
  assert.equal(h.stored[0].service, "Лабораторні дослідження");
});

test("an explicitly chosen non-imaging service on a modality page keeps general service booking", async context => {
  const h = harness(undefined, { url: bookingUrl({ service: "Консультації лікарів" }), sourcePathname: "/services/mri" });
  context.after(h.dispose);
  const select = serviceControl(await h.flush());
  assert.equal(select.props.value, "Консультації лікарів");
  assert.ok(optionValues(select).includes("Лабораторні дослідження"));
  assert.equal(h.resourceRequests.includes("/api/public/prices"), false);
});

test("doctor booking preserves the doctor and consultation without fetching or showing a modality selector", async context => {
  const h = harness(undefined, { url: bookingUrl({ doctor: "Тестовий лікар", bookingCategory: "ct" }), sourcePathname: "/services/ct" });
  context.after(h.dispose);
  const tree = await h.flush();
  assert.equal(serviceControl(tree), undefined);
  assert.match(text(tree), /Обраний лікар.*Тестовий лікар/);
  assert.equal(h.resourceRequests.includes("/api/public/prices"), false);
  const pending = h.submit(); h.release(); await pending;
  assert.equal(h.stored[0].doctor, "Тестовий лікар");
  assert.equal(h.stored[0].service, "Консультації лікарів");
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), ["test-ct"]);
});

test("calculator booking retains its study bundle even when a modality context is present", async context => {
  const h = harness(undefined, { url: bookingUrl({ services: "КТ головного мозку | МРТ колінного суглоба", total: "3300", bookingCategory: "ct" }), sourcePathname: "/services/ct" });
  context.after(h.dispose);
  assert.equal(serviceControl(await h.flush()), undefined);
  assert.equal(h.resourceRequests.includes("/api/public/prices"), false);
  const pending = h.submit(); h.release(); await pending;
  assert.equal(h.stored[0].service, "Комплекс досліджень");
  assert.match(h.stored[0].comment, /• КТ головного мозку\n• МРТ колінного суглоба/);
  assert.match(h.stored[0].comment, /3\s?300/);
  assert.deepEqual(h.selection.readPriceCalculatorSelection(), []);
});

test("while modality studies load the requested study is preserved and unrelated services never appear", async context => {
  const requested = "МРТ головного мозку";
  const h = harness(undefined, { url: bookingUrl({ service: requested }), deferPrices: true });
  context.after(h.dispose);
  const initial = await h.flush();
  const select = serviceControl(initial);
  assert.equal(select.props.value, requested);
  assert.equal(studyProps(select).loading, true);
  assert.deepEqual(select.props.options, []);
  assert.equal(select.props.helpValue, "МРТ");
  h.releasePrices();
  const loaded = serviceControl(await h.flush());
  assert.equal(loaded.props.value, requested);
  assert.equal(studyProps(loaded).loading, false);
  assert.deepEqual(loaded.props.options, ["МРТ головного мозку", "МРТ колінного суглоба"]);
});

for (const [name, response] of [
  ["HTTP error", () => Response.json({ error: "Isolated prices failure" }, { status: 503 })],
  ["network failure", () => { throw new Error("Isolated prices network failure"); }],
  ["malformed catalog", () => Response.json({ items: priceItems })],
  ["empty catalog", () => Response.json([])],
]) {
  test(name + " never broadens the scoped study selector or discards the requested study", async context => {
    const requested = "КТ головного мозку";
    const h = harness(undefined, { url: bookingUrl({ service: requested }), pricesResponse: response });
    context.after(h.dispose);
    const tree = await h.flush();
    const select = serviceControl(tree);
    assert.equal(select.props.value, requested);
    assert.equal(studyProps(select).loading, false);
    assert.deepEqual(select.props.options, []);
    assert.equal(select.props.helpValue, "КТ");
    const pending = h.submit(); h.release(); await pending;
    assert.equal(h.stored[0].service, requested);
  });
}

test("retrying a failed study catalog loads only the original modality and keeps the selected study", async context => {
  let attempt = 0;
  const requested = "МРТ головного мозку";
  const h = harness(undefined, {
    url: bookingUrl({ service: requested }),
    pricesResponse: () => ++attempt === 1 ? Response.json({}, { status: 503 }) : Response.json(priceItems),
  });
  context.after(h.dispose);
  const errorTree = await h.flush();
  const retry = nodes(errorTree).find(node => node.type === "button" && text(node) === "Спробувати ще раз");
  assert.ok(retry);
  assert.equal(retry.props.type, "button");
  retry.props.onClick();
  h.render();
  const recovered = await h.flush();
  assert.equal(serviceControl(recovered).props.value, requested);
  assert.deepEqual(studyProps(serviceControl(recovered)).options, ["МРТ головного мозку", "МРТ колінного суглоба"]);
  assert.equal(h.resourceRequests.filter(url => url === "/api/public/prices").length, 2);
  assert.equal(nodes(recovered).some(node => node.type === "button" && text(node) === "Спробувати ще раз"), false);
});
