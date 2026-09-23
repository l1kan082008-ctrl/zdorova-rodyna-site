import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Exercise the real callback/declaration handlers, analytics helper and API route.
// React rendering, browser effects, persistence and delivery are isolated boundaries;
// no database, credentials or network are used by this test.
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

const siteSettings = load("../lib/siteSettings.ts");
const doctorCategories = load("../app/doctors/doctorCategories.ts");
const requestBody = load("../lib/requestBody.ts");
const bookingRequest = load("../lib/bookingRequest.ts", {
  "./locationPolicy": load("../lib/locationPolicy.ts"),
});
const familyDoctor = { id: "isolated-doctor", name: "Тестовий лікар", specialty: "Сімейна медицина" };

function harness(kind, options = {}) {
  const requests = [], stored = [], notifications = [], eventVisibility = [];
  let committedTree;
  const window = { dataLayer: options.dataLayer ?? [], matchMedia: () => ({ matches: true }) };
  const document = { body: {} };
  const successClass = kind === "callback" ? "support-dialog-success" : "family-declaration-success";
  const originalPush = window.dataLayer.push.bind(window.dataLayer);
  Object.defineProperty(window.dataLayer, "push", { value: event => {
    eventVisibility.push(nodes(committedTree).some(node => node.props?.className === successClass));
    return originalPush(event);
  } });
  const analytics = load("../lib/bookingAnalytics.ts", {}, { window });
  const route = load("../app/api/bookings/route.ts", {
    "@/lib/requestBody": requestBody,
    "@/lib/publicSubmissionSecurity": {
      isSameOriginSubmission: () => true,
      checkPublicSubmissionRateLimit: async () => ({ allowed: true }),
      verifyTurnstileIfConfigured: async () => true,
    },
    "./bookingStore": { createBooking: async data => {
      stored.push(data);
      return "ZR-SECONDARY-ISOLATED";
    } },
    "@/lib/bookingNotification": { sendBookingNotification: async data => notifications.push(data) },
  });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const fetch = async (url, fetchOptions) => {
    assert.equal(url, "/api/bookings", "unexpected network request in isolated test");
    assert.equal(fetchOptions.method, "POST");
    requests.push(JSON.parse(fetchOptions.body));
    await gate;
    return options.response
      ? options.response()
      : route.POST(new Request("http://test.local/api/bookings", fetchOptions));
  };
  const slots = [], effectSlots = [], pendingEffects = [];
  let cursor = 0;
  const react = {
    Fragment: "fragment",
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], value => { slots[i] = typeof value === "function" ? value(slots[i]) : value; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useMemo(compute) { return compute(); },
    // These effects manage layout, focus, menus and calculator subscriptions only.
    useEffect() {},
  };
  // Run the real confirmation hook after commit; unrelated layout effects remain isolated.
  const confirmation = load("../app/components/useBookingConfirmation.ts", {
    "@/lib/bookingAnalytics": analytics,
    react: { useEffect(effect, deps) {
      const i = cursor++;
      const previous = effectSlots[i];
      if (!previous || deps.some((value, index) => !Object.is(value, previous[index]))) {
        effectSlots[i] = deps;
        pendingEffects.push(effect);
      }
    } },
  });
  const jsx = (type, props) => ({ type, props });
  const dependencies = {
    react, "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/image": { default: Symbol("Image") },
    "next/link": { default: Symbol("Link") },
    "@/lib/bookingSubmission": load("../lib/bookingSubmission.ts"),
  };
  let component;
  if (kind === "callback") {
    const loaded = load("../app/components/SiteChrome.tsx", {
      ...dependencies,
      "./useBookingConfirmation": confirmation,
      "../doctors/doctorCategories": doctorCategories,
      "./CloseIcon": {},
      "./SiteSettingsProvider": { useSiteSettings: () => siteSettings.defaultSiteSettings },
      "@/lib/siteSettings": siteSettings,
      "@/lib/bookingRequest": bookingRequest,
      "react-dom": { createPortal: child => child },
      "../prices/calculatorSelection": {},
      "./useModalDialog": { useModalDialog() {} },
      "./TurnstileField": {},
    }, { window, document, fetch });
    component = () => loaded.SiteHeader({});
  } else {
    const loaded = load("../app/services/[slug]/FamilyDeclarationForm.tsx", {
      ...dependencies,
      "@/app/components/useBookingConfirmation": confirmation,
      "@/lib/imageSource": {},
      "@/app/components/TurnstileField": {},
    }, { window, fetch });
    component = () => loaded.FamilyDeclarationForm({ doctors: [familyDoctor] });
  }
  const render = () => {
    cursor = 0;
    committedTree = component();
    while (pendingEffects.length) pendingEffects.shift()();
    return committedTree;
  };
  const find = predicate => {
    const found = nodes(render()).find(predicate);
    assert.ok(found, `expected ${kind} control to exist`);
    return found;
  };
  const change = (predicate, value) => find(predicate).props.onChange({
    target: { value }, currentTarget: { setCustomValidity() {} },
  });
  if (kind === "callback") {
    find(node => node.props?.["aria-label"] === "Замовити дзвінок")
      .props.onClick({ currentTarget: {} });
  } else {
    if (options.doctor !== false) {
      find(node => node.props?.name === "familyDoctor").props.onChange();
    }
    change(node => node.props?.autoComplete === "name", "ІЗОЛЬОВАНИЙ ТЕСТ");
    change(node => node.props?.autoComplete === "bday", "01011990");
    change(node => node.type === "textarea", "Приватний тестовий коментар");
    find(node => node.type === "input" && node.props.type === "checkbox" && !node.props.name)
      .props.onChange({ target: { checked: options.consent ?? true } });
  }
  change(node => node.type === "input" && node.props.type === "tel", options.phone ?? "0671234567");
  const clickHandler = () => find(node => node.props?.type === "submit").props.onClick;
  let clickPrevented = false;
  const clickEvent = () => ({
    preventDefault() { clickPrevented = true; },
    currentTarget: { form: { reportValidity: () => options.nativeValid ?? true } },
  });
  const submit = () => clickHandler()(clickEvent());
  const nativeSubmit = () => find(node => node.type === "form").props.onSubmit({ preventDefault() {} });
  const success = () => nodes(render()).some(node => node.props?.className ===
    (kind === "callback" ? "support-dialog-success" : "family-declaration-success"));
  const hasError = () => nodes(render()).some(node => node.props?.role === "alert");
  return { render, find, clickHandler, clickEvent, submit, nativeSubmit, release, success, hasError, requests, stored, notifications, window, eventVisibility, isClickPrevented: () => clickPrevented };
}

for (const kind of ["callback", "family_declaration"]) {
  test(`${kind}: native constraints block click activation before a request and native submit is inert`, async () => {
    const h = harness(kind, { nativeValid: false });
    await h.submit();
    assert.equal(h.isClickPrevented(), true);
    assert.deepEqual(h.requests, []);
    await h.nativeSubmit();
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.window.dataLayer, []);
  });

  test(`${kind}: a synthetic native submit with valid fields cannot start a request`, async () => {
    const h = harness(kind);
    await h.nativeSubmit();
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.window.dataLayer, []);
  });

  test(`${kind}: required phone pattern accepts the formatter output and rejects incomplete or zero numbers`, () => {
    // Check the actual input contract; native capture-phase behavior is verified in a browser.
    const cases = [["0987654321", true], ["0671234567", true], ["+380987654321", true], ["", false], ["09876", false], ["1987654321", false], ["0000000000", false]];
    if (kind === "callback") cases.push(["00380987654321", true]);
    for (const [phone, valid] of cases) {
      const h = harness(kind, { phone });
      const input = h.find(node => node.type === "input" && node.props.type === "tel").props;
      assert.equal(input.required, true);
      assert.equal(typeof input.pattern, "string");
      const pattern = new RegExp(`^(?:${input.pattern})$`, "v");
      assert.equal(Boolean(input.value) && pattern.test(input.value), valid, `formatted ${phone || "empty"} has expected validity`);
      assert.deepEqual(h.requests, []);
      assert.deepEqual(h.window.dataLayer, []);
    }
  });

  test(`${kind}: first invalid event displays its existing error and correction clears stale validity`, () => {
    const h = harness(kind, { phone: "09876" });
    let prevented = false, focused = false, customError = "";
    const field = {
      setCustomValidity(value) { customError = value; },
      focus() { focused = true; },
    };
    h.find(node => node.type === "input" && node.props.type === "tel").props.onInvalid({
      preventDefault() { prevented = true; }, currentTarget: field,
    });
    assert.equal(h.find(node => node.type === "input" && node.props.type === "tel").props["aria-invalid"], true);
    if (kind === "callback") {
      assert.equal(prevented, true, "callback retains its existing inline error");
      assert.equal(focused, true);
      assert.equal(h.hasError(), true);
    } else {
      assert.equal(prevented, false, "declaration retains its existing browser validation tooltip");
      assert.match(customError, /\+38/);
    }
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.window.dataLayer, []);
    h.find(node => node.type === "input" && node.props.type === "tel").props.onChange({
      target: { value: "0987654321" }, currentTarget: field,
    });
    const corrected = h.find(node => node.type === "input" && node.props.type === "tel").props;
    assert.equal(corrected["aria-invalid"], false);
    assert.equal(customError, "", "correction cannot leave custom validity blocking a valid phone");
    assert.equal(new RegExp(`^(?:${corrected.pattern})$`, "v").test(corrected.value), true);
  });

  test(`${kind}: direct handler also rejects an all-zero phone`, async () => {
    const h = harness(kind, { phone: "0000000000" });
    await h.submit();
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.window.dataLayer, []);
    assert.equal(h.success(), false);
  });

  test(`${kind}: invalid phone makes no request and emits no conversion`, async () => {
    const h = harness(kind, { phone: "06712" });
    await h.submit();
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.stored, []);
    assert.deepEqual(h.window.dataLayer, []);
    assert.equal(h.success(), false);
  });

  test(`${kind}: pending request and rapid duplicate cannot convert before one saved response`, async () => {
    const h = harness(kind);
    // Invoke the same handler twice before a render, as with two immediate submits.
    const handler = h.clickHandler();
    const pending = handler(h.clickEvent());
    await handler(h.clickEvent());
    assert.equal(h.requests.length, 1);
    assert.deepEqual(h.stored, []);
    assert.deepEqual(h.window.dataLayer, []);
    assert.equal(h.success(), false);
    assert.equal(h.find(node => node.props?.type === "submit").props.disabled, true);
    h.release();
    await pending;
    assert.equal(h.stored.length, 1);
    assert.equal(h.notifications.length, 1);
    assert.equal(h.stored[0].source, kind === "callback" ? "callback" : "family-declaration");
    assert.deepEqual(h.window.dataLayer, [], "API confirmation alone cannot emit before the success UI commits");
    assert.equal(h.success(), true);
    assert.deepEqual(h.window.dataLayer, [{ event: "form_submit", form_type: kind }],
      "analytics contains no booking reference, phone, name, doctor, service or comment");
    assert.deepEqual(h.eventVisibility, [true], "the success UI is already committed when the event is emitted");
    assert.equal(h.isClickPrevented(), true);
    h.render();
    assert.equal(h.window.dataLayer.length, 1, "rerender does not repeat conversion");
  });

  const badResponses = [
    ["validation rejection", () => Response.json({ error: "Некоректні дані" }, { status: 400 })],
    ["server failure with reference", () => Response.json({ reference: "ZR-FAILED" }, { status: 500 })],
    ["network failure", () => { throw new Error("Isolated connection failure"); }],
    ["non-JSON success", () => new Response("not JSON", { status: 201 })],
    ["missing reference", () => Response.json({}, { status: 201 })],
    ["non-string reference", () => Response.json({ reference: 12345 }, { status: 201 })],
    ["blank reference", () => Response.json({ reference: "   " }, { status: 201 })],
  ];
  for (const [name, response] of badResponses) {
    test(`${kind}: ${name} cannot emit conversion or success and allows retry`, async () => {
      const h = harness(kind, { response });
      h.release();
      await h.submit();
      assert.equal(h.requests.length, 1);
      assert.deepEqual(h.window.dataLayer, []);
      assert.equal(h.success(), false);
      assert.equal(h.hasError(), true);
      assert.equal(h.find(node => node.props?.type === "submit").props.disabled, false);
      await h.submit();
      assert.equal(h.requests.length, 2, "in-flight guard is released after failure");
      assert.deepEqual(h.window.dataLayer, []);
    });
  }

  test(`${kind}: analytics exception cannot turn a saved booking into an error`, async () => {
    let attempts = 0;
    const dataLayer = { push() { attempts++; throw new Error("Isolated analytics failure"); } };
    const h = harness(kind, { dataLayer });
    h.release();
    await h.submit();
    assert.equal(h.stored.length, 1);
    assert.equal(h.success(), true);
    assert.equal(attempts, 1);
    assert.equal(h.hasError(), false);
  });
}

for (const options of [{ consent: false }, { doctor: false }]) {
  test(`family declaration: missing ${options.consent === false ? "consent" : "doctor"} emits nothing`, async () => {
    const h = harness("family_declaration", options);
    await h.submit();
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.window.dataLayer, []);
    assert.equal(h.success(), false);
  });
}

test("callback: closing before the response cannot emit an event for an unseen confirmation", async () => {
  const h = harness("callback");
  const pending = h.submit();
  h.find(node => node.props?.["aria-label"] === "Закрити вікно").props.onClick();
  h.render();
  h.release();
  await pending;
  assert.equal(h.stored.length, 1);
  assert.equal(h.success(), false);
  assert.deepEqual(h.window.dataLayer, []);
});
