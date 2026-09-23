import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/bookingSubmission.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
} });
const helpers = {};
new Function("exports", outputText)(helpers);

test("button activation cancels native submit before validation and sends only a valid form", async () => {
  for (const valid of [false, true]) {
    const calls = [];
    const form = { reportValidity() { calls.push("validate"); return valid; } };
    const event = { preventDefault() { calls.push("cancel-default"); }, currentTarget: { form } };
    await helpers.submitBookingFromClick(event, async receivedForm => {
      assert.equal(receivedForm, form);
      calls.push("request");
    });
    assert.deepEqual(calls, valid ? ["cancel-default", "validate", "request"] : ["cancel-default", "validate"]);
  }
});

test("detached button activation cancels native submit without a request", async () => {
  let cancelled = false, requested = false;
  await helpers.submitBookingFromClick({
    preventDefault() { cancelled = true; }, currentTarget: { form: null },
  }, async () => { requested = true; });
  assert.equal(cancelled, true);
  assert.equal(requested, false);
});

test("defensive native submit handler cancels default without creating a synthetic submit", () => {
  let cancelled = false;
  helpers.preventNativeBookingSubmit({ preventDefault() { cancelled = true; } });
  assert.equal(cancelled, true);
});
