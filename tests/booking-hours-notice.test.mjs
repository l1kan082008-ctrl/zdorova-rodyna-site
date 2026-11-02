import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Real clock helper, hook, notice and screening submit handler. Only React's
// scheduling, browser APIs and POST boundary are isolated; no network or DB.
function load(path, dependencies = {}, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", ...Object.keys(globals), outputText)(id => {
    if (!(id in dependencies)) throw new Error(`Unexpected dependency: ${id}`);
    return dependencies[id];
  }, loadedModule, loadedModule.exports, ...Object.values(globals));
  return loadedModule.exports;
}

const { defaultSiteSettings } = load("../lib/siteSettings.ts");

function environment(instant = "2026-11-02T05:59:30Z") {
  let timestamp = Date.parse(instant), timerId = 0, cursor = 0;
  let hours = [...defaultSiteSettings.hours];
  const timers = new Map(), slots = [], effectSlots = [], effects = [];
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [timestamp])); }
    static now() { return timestamp; }
  }
  const setTimeout = (callback, delay = 0) => {
    const id = ++timerId;
    timers.set(id, { callback, due: timestamp + delay });
    return id;
  };
  const clearTimeout = id => timers.delete(id);
  const eventTarget = () => {
    const listeners = new Map();
    return {
      addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
      removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
      dispatch(name) { for (const fn of listeners.get(name) ?? []) fn(); },
      count() { return [...listeners.values()].reduce((sum, group) => sum + group.size, 0); },
    };
  };
  const window = { ...eventTarget(), setTimeout, clearTimeout };
  const document = { ...eventTarget(), visibilityState: "visible" };
  const react = {
    useState(initial) {
      const slot = cursor++;
      if (!(slot in slots)) slots[slot] = typeof initial === "function" ? initial() : initial;
      return [slots[slot], value => { slots[slot] = typeof value === "function" ? value(slots[slot]) : value; }];
    },
    useRef(initial) { const slot = cursor++; return slots[slot] ??= { current: initial }; },
    useEffect(effect, deps) {
      const slot = cursor++;
      const previous = effectSlots[slot];
      if (!previous || deps.some((value, index) => !Object.is(value, previous.deps[index]))) {
        effects.push(() => {
          previous?.cleanup?.();
          effectSlots[slot] = { deps, cleanup: effect() };
        });
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const runtime = { jsx, jsxs: jsx, Fragment: "fragment" };
  const clock = { Date: ClockDate, setTimeout, clearTimeout, window, document };
  const notices = load("../app/components/BookingHoursNotice.tsx", {
    react, "react/jsx-runtime": runtime,
    "@/lib/bookingHours": load("../lib/bookingHours.ts", {}, { Date: ClockDate }),
    "./SiteSettingsProvider": { useSiteSettings: () => ({ hours }) },
  }, clock);
  const render = component => {
    cursor = 0;
    const result = component();
    while (effects.length) effects.shift()();
    return result;
  };
  const advance = instant => {
    const target = typeof instant === "number" ? instant : Date.parse(instant);
    while (true) {
      const next = [...timers.entries()].filter(([, timer]) => timer.due <= target).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break;
      timestamp = next[1].due;
      timers.delete(next[0]);
      next[1].callback();
    }
    timestamp = target;
  };
  return {
    react, runtime, clock, notices, render, advance, window, document, timers,
    ready: () => advance(timestamp),
    jump: instant => { timestamp = Date.parse(instant); },
    setHours: value => { hours = value; },
    unmount: () => { for (const effect of effectSlots) effect?.cleanup?.(); },
  };
}

function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  return node && typeof node === "object" ? [node, ...nodes(node.props?.children)] : [];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join(" ");
  return node && typeof node === "object" ? text(node.props?.children) : String(node ?? "");
}

test("first render is stable and a form left open updates exactly at opening and closing", () => {
  const h = environment();
  const render = () => h.render(() => h.notices.useBookingHours());
  assert.equal(render().currentHours, null);
  h.ready();
  assert.equal(render().currentHours.state, "closed");
  h.advance("2026-11-02T06:00:00Z");
  assert.equal(render().currentHours.state, "open");
  h.advance("2026-11-02T17:00:00Z");
  assert.equal(render().currentHours.state, "open");
  h.advance("2026-11-02T18:00:00Z");
  assert.equal(render().currentHours.state, "closed");
  h.unmount();
  assert.equal(h.timers.size, 0);
  assert.equal(h.window.count() + h.document.count(), 0);
});

test("submission snapshot retains its original time and schedule after opening and settings changes", () => {
  const h = environment();
  const render = () => h.render(() => h.notices.useBookingHours());
  render().captureSubmissionHours();
  h.ready();
  h.advance("2026-11-02T06:00:00Z");
  assert.equal(render().currentHours.state, "open");
  assert.equal(render().submittedHours.state, "closed");
  h.setHours(["Щодня 00:00–24:00"]);
  render(); h.ready();
  const state = render();
  assert.equal(state.currentHours.state, "open");
  assert.deepEqual(state.submittedHours.hours, defaultSiteSettings.hours);
  assert.match(text(h.notices.BookingHoursNotice({ value: state.submittedHours, confirmation: true })), /Заявку залишено в неробочий час/u);
  h.unmount();
});

test("inactive callback avoids polling; returning to the tab refreshes its clock", () => {
  const h = environment();
  const render = active => h.render(() => h.notices.useBookingHours(active));
  assert.equal(render(false).currentHours, null);
  assert.equal(h.timers.size, 0);
  render(true); h.ready();
  h.jump("2026-11-02T06:10:00Z");
  h.document.dispatch("visibilitychange");
  assert.equal(render(true).currentHours.state, "open");
  h.jump("2026-11-02T18:01:00Z");
  h.window.dispatch("focus");
  assert.equal(render(true).currentHours.state, "closed");
  assert.equal(render(false).currentHours, null);
  assert.equal(h.timers.size, 0);
  assert.equal(h.window.count() + h.document.count(), 0);
});

test("notice hides when open, distinguishes unknown schedule, and avoids nested live regions on success", () => {
  const h = environment();
  assert.equal(h.notices.BookingHoursNotice({ value: null }), null);
  assert.equal(h.notices.BookingHoursNotice({ value: { state: "open", hours: [] } }), null);
  const value = { state: "unknown", hours: ["Графік уточнюйте"] };
  const before = h.notices.BookingHoursNotice({ value });
  assert.equal(before.props.role, "status");
  assert.match(text(before), /Графік уточнюйте/u);
  assert.doesNotMatch(text(before), /Зараз неробочий час|Заявку залишено/u);
  const after = h.notices.BookingHoursNotice({ value, confirmation: true });
  assert.equal(after.props.role, undefined);
  assert.match(text(after), /Адміністратор зв’яжеться з вами у робочі години/u);
});

function screeningHarness() {
  const h = environment("2026-11-02T05:59:55Z");
  const pending = [];
  const component = load("../app/services/[slug]/ScreeningTherapistPicker.tsx", {
    react: h.react, "react/jsx-runtime": h.runtime,
    "next/image": {}, "next/link": {},
    "@/app/components/TurnstileField": {},
    "@/app/components/useBookingConfirmation": { useBookingConfirmation() {} },
    "@/app/components/BookingHoursNotice": h.notices,
    "../../doctors/doctorData": {},
    "@/lib/ukrainianPhone": load("../lib/ukrainianPhone.ts"),
    "@/lib/bookingSubmission": load("../lib/bookingSubmission.ts"),
    "@/lib/imageSource": {},
    "@/lib/screening40": load("../lib/screening40.ts"),
    "@/lib/siteSettings": load("../lib/siteSettings.ts"),
    "./ScreeningTherapists.module.css": { default: {} },
  }, { ...h.clock, fetch: (url, options) => {
    assert.equal(url, "/api/bookings");
    assert.equal(options.method, "POST");
    return new Promise(resolve => pending.push(resolve));
  } });
  const render = () => h.render(() => component.ScreeningTherapistPicker({ doctors: [], phone: "+380670000040" }));
  const find = predicate => { const node = nodes(render()).find(predicate); assert.ok(node); return node; };
  const fill = () => {
    for (const [name, value] of [["name", "Тестова Людина Приклад"], ["phone", "0670000040"]]) {
      find(node => node.props?.name === name).props.onChange({ target: { value }, currentTarget: { setCustomValidity() {} } });
    }
    find(node => node.type === "input" && node.props.type === "checkbox").props.onChange({ target: { checked: true }, currentTarget: { setCustomValidity() {} } });
  };
  const noticeNodes = () => nodes(render()).filter(node => node.type === h.notices.BookingHoursNotice);
  return { ...h, render, fill, pending, noticeNodes,
    submit: () => find(node => node.props?.type === "submit").props.onClick({ preventDefault() {}, currentTarget: { form: { reportValidity: () => true } } }),
    success: () => nodes(render()).some(node => node.props?.className === "family-declaration-success"),
    hasError: () => nodes(render()).some(node => node.props?.role === "alert"),
  };
}

test("real screening form displays captured after-hours confirmation only after a successful delayed POST", async () => {
  const h = screeningHarness();
  h.render(); h.ready(); h.fill();
  const request = h.submit();
  assert.equal(h.success(), false);
  assert.equal(h.noticeNodes().some(node => node.props.confirmation), false);
  h.advance("2026-11-02T06:00:00Z");
  h.pending.shift()(Response.json({ reference: "QA-AFTER-HOURS" }, { status: 201 }));
  await request;
  assert.equal(h.success(), true);
  const confirmation = h.noticeNodes().find(node => node.props.confirmation);
  assert.equal(confirmation.props.value.state, "closed");
  h.unmount();
});

test("failed screening POST cannot display a received-application notice and retry uses its new send time", async () => {
  const h = screeningHarness();
  h.render(); h.ready(); h.fill();
  const request = h.submit();
  h.pending.shift()(Response.json({ error: "Тестова помилка" }, { status: 503 }));
  await request;
  assert.equal(h.success(), false);
  assert.equal(h.hasError(), true);
  assert.equal(h.noticeNodes().some(node => node.props.confirmation), false);
  h.advance("2026-11-02T06:00:00Z");
  const retry = h.submit();
  h.pending.shift()(Response.json({ reference: "QA-RETRY" }, { status: 201 }));
  await retry;
  assert.equal(h.success(), true);
  assert.equal(h.noticeNodes().find(node => node.props.confirmation).props.value.state, "open");
  h.unmount();
});
