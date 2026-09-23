import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function tracker(window) {
  const source = readFileSync(new URL("../lib/bookingAnalytics.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } });
  const exports = {};
  new Function("exports", "window", outputText)(exports, window);
  return exports.trackBookingSuccess;
}

test("queues a minimal event before GTM loads and deduplicates the same saved request", () => {
  const window = {};
  const track = tracker(window);
  track("ZR-FIRST", "appointment");
  track("ZR-FIRST", "appointment");
  track("ZR-FIRST", "callback");
  track("ZR-SECOND", "callback");
  assert.deepEqual(window.dataLayer, [
    { event: "booking_success", form_type: "appointment" },
    { event: "booking_success", form_type: "callback" },
  ], "the server reference and patient details must not be sent to GTM");
});

test("preserves existing dataLayer and emits once even if GTM re-enters synchronously", () => {
  const events = [{ event: "gtm.js" }];
  let track;
  const window = { dataLayer: { push(event) { events.push(event); track("ZR-ONE", "family_declaration"); } } };
  track = tracker(window);
  track("ZR-ONE", "family_declaration");
  assert.deepEqual(events, [{ event: "gtm.js" }, { event: "booking_success", form_type: "family_declaration" }]);
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
