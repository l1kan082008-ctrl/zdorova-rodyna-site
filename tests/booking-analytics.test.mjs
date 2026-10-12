import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function analytics(window) {
  const source = readFileSync(new URL("../lib/bookingAnalytics.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } });
  const exports = {};
  new Function("exports", "window", outputText)(exports, window);
  return exports;
}
const tracker = window => analytics(window).trackConfirmedBookingSubmit;

test("queues a minimal event before GTM loads and deduplicates the same saved request", () => {
  const window = {};
  const track = tracker(window);
  track("ZR-FIRST", "appointment");
  track("ZR-FIRST", "appointment");
  track("ZR-FIRST", "callback");
  track("ZR-SECOND", "callback");
  assert.deepEqual(window.dataLayer, [
    { event: "form_submit", form_type: "appointment" },
    { event: "form_submit", form_type: "callback" },
  ], "the server reference and patient details must not be sent to GTM");
});

test("preserves existing dataLayer and emits once even if GTM re-enters synchronously", () => {
  const events = [{ event: "gtm.js" }];
  let track;
  const window = { dataLayer: { push(event) { events.push(event); track("ZR-ONE", "family_declaration"); } } };
  track = tracker(window);
  track("ZR-ONE", "family_declaration");
  assert.deepEqual(events, [{ event: "gtm.js" }, { event: "form_submit", form_type: "family_declaration" }]);
});

test("does nothing without a reference or a browser", () => {
  const window = {};
  const track = tracker(window);
  track("", "appointment");
  track("  ", "appointment");
  assert.equal(window.dataLayer, undefined);
  assert.doesNotThrow(() => tracker(undefined)("ZR-ONE", "appointment"));
});

test("blocked or failing third-party analytics cannot throw into the booking handler", () => {
  for (const window of [
    { dataLayer: { push() { throw new Error("GTM failed"); } } },
    Object.defineProperty({}, "dataLayer", { get() { throw new Error("blocked"); } }),
    Object.freeze({}),
  ]) assert.doesNotThrow(() => tracker(window)("ZR-ONE", "appointment"));
});

test("form opening queues only its event type and counts each new dialog session once", () => {
  const window = {};
  const track = analytics(window).trackBookingFormOpen;
  const firstOpening = {};
  track(firstOpening);
  track(firstOpening);
  track({});
  assert.deepEqual(window.dataLayer, [
    { event: "booking_form_open", form_type: "appointment" },
    { event: "booking_form_open", form_type: "appointment" },
  ], "no selection, URL, personal details or session identity may be sent");
});

test("form opening preserves GTM state and prevents synchronous re-entry", () => {
  const events = [{ event: "gtm.js" }];
  const opening = {};
  let track;
  const window = { dataLayer: { push(event) { events.push(event); track(opening); } } };
  track = analytics(window).trackBookingFormOpen;
  track(opening);
  assert.deepEqual(events, [{ event: "gtm.js" }, { event: "booking_form_open", form_type: "appointment" }]);
});

test("blocked analytics and server rendering cannot break form opening", () => {
  for (const window of [
    undefined,
    { dataLayer: { push() { throw new Error("GTM failed"); } } },
    Object.defineProperty({}, "dataLayer", { get() { throw new Error("blocked"); } }),
    Object.freeze({}),
  ]) assert.doesNotThrow(() => analytics(window).trackBookingFormOpen({}));
});
