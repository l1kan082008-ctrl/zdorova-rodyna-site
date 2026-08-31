import assert from "node:assert/strict";
import test from "node:test";

import { isSameOriginSubmission } from "../lib/requestOrigin.ts";
import { normalizeInternalHref, normalizeMediaKey, normalizeMediaUrl } from "../lib/publicUrl.ts";
import { readBoundedJson, RequestBodyError } from "../lib/requestBody.ts";
import { readSafeRasterImage } from "../lib/safeImage.ts";

test("public submissions require a same-origin browser request", () => {
  const url = "https://example.test/api/bookings";
  assert.equal(isSameOriginSubmission(new Request(url, { method: "POST" })), false);
  assert.equal(isSameOriginSubmission(new Request(url, {
    method: "POST",
    headers: { origin: "https://evil.test", "sec-fetch-site": "cross-site" },
  })), false);
  assert.equal(isSameOriginSubmission(new Request(url, {
    method: "POST",
    headers: { origin: "https://example.test", "sec-fetch-site": "same-origin" },
  })), true);
});

test("request JSON parser enforces content type and byte limit", async () => {
  const valid = new Request("https://example.test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true }),
  });
  assert.deepEqual(await readBoundedJson(valid, 64), { ok: true });

  await assert.rejects(
    readBoundedJson(new Request("https://example.test", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    }), 64),
    (error) => error instanceof RequestBodyError && error.status === 415,
  );

  await assert.rejects(
    readBoundedJson(new Request("https://example.test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(128) }),
    }), 32),
    (error) => error instanceof RequestBodyError && error.status === 413,
  );
});

test("managed URLs reject executable and protocol-relative destinations", () => {
  assert.equal(normalizeInternalHref("/services/ct?tab=1", "link"), "/services/ct?tab=1");
  assert.throws(() => normalizeInternalHref("https://evil.test", "link"));
  assert.throws(() => normalizeInternalHref("//evil.test", "link"));
  assert.throws(() => normalizeMediaUrl("javascript:alert(1)", "media"));
  assert.equal(normalizeMediaUrl("https://cdn.example.test/image.jpg", "media"), "https://cdn.example.test/image.jpg");
  assert.equal(normalizeMediaKey("services/ct/id.webp", "services", "media"), "services/ct/id.webp");
  assert.throws(() => normalizeMediaKey("services/../admin-secret.png", "services", "media"));
});

test("uploaded images are accepted by magic bytes, not claimed MIME type", async () => {
  const png = new File([
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  ], "fake.svg", { type: "image/svg+xml" });
  const accepted = await readSafeRasterImage(png, 1024);
  assert.equal(accepted?.contentType, "image/png");

  const svg = new File(["<svg><script>alert(1)</script></svg>"], "image.png", {
    type: "image/png",
  });
  assert.equal(await readSafeRasterImage(svg, 1024), null);
});
