import assert from "node:assert/strict";
import test from "node:test";
import { canOptimizeImage, resolveImageSource } from "../lib/imageSource.ts";

const host = "https://store123.public.blob.vercel-storage.com";
const wrapped = (route, key) => route + "?key=" + encodeURIComponent(key);

for (const [route, folder] of [
  ["/api/doctors/photo", "doctors"],
  ["/api/services/image", "services"],
  ["/api/banners/image", "banners"],
]) {
  test("unwraps the trusted Blob source for " + route, () => {
    const source = host + "/" + folder + "/portrait.webp";
    assert.equal(resolveImageSource(wrapped(route, source)), source);
  });
}

test("preserves local static assets and direct image URLs", () => {
  for (const source of ["/doctors/voloshko-tetiana.webp", "/images/photo.jpg?v=2", host + "/doctors/photo.webp", "https://example.com/image.jpg"]) {
    assert.equal(resolveImageSource(source), source);
  }
});

test("does not unwrap unknown, absolute or protocol-relative routes", () => {
  for (const route of ["/api/unknown/image", "/api/doctors/photo/other", "https://example.com/api/doctors/photo", "//example.com/api/doctors/photo"]) {
    const source = wrapped(route, host + "/doctors/photo.webp");
    assert.equal(resolveImageSource(source), source);
  }
});

test("rejects off-host, deceptive and invalid Blob destinations", () => {
  for (const target of [
    "https://example.com/doctors/photo.webp",
    "https://store123.public.blob.vercel-storage.com.example.com/doctors/photo.webp",
    "https://public.blob.vercel-storage.com/doctors/photo.webp",
    "https://nested.store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "http://store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "//store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "javascript:alert(1)",
    "data:image/png;base64,AA==",
    "not a URL",
  ]) {
    const source = wrapped("/api/doctors/photo", target);
    assert.equal(resolveImageSource(source), source);
  }
});

test("rejects credentials and explicit ports", () => {
  for (const target of [
    "https://user@store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "https://user:pass@store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "https://store123.public.blob.vercel-storage.com:8443/doctors/photo.webp",
    "https://store123.public.blob.vercel-storage.com:443/doctors/photo.webp",
  ]) {
    const source = wrapped("/api/doctors/photo", target);
    assert.equal(resolveImageSource(source), source);
  }
});

test("preserves wrappers without a usable key", () => {
  for (const source of ["/api/doctors/photo", "/api/doctors/photo?key=", "/api/doctors/photo?other=value", "/api/doctors/photo?key=%20%20", "/api/doctors/photo?key=%E0%A4%A"]) {
    assert.equal(resolveImageSource(source), source);
  }
});

test("does not treat a fragment as the wrapper query", () => {
  const source = "/api/doctors/photo#preview?key=" + encodeURIComponent(host + "/doctors/photo.webp");
  assert.equal(resolveImageSource(source), source);
});

test("optimizes local static assets and only supported direct Blob folders", () => {
  for (const source of ["/doctors/voloshko-tetiana.webp", "/service-heroes/ct-cinematic-v1.webp", "/image.png?v=2"]) {
    assert.equal(canOptimizeImage(source), true);
  }
  for (const folder of ["doctors", "locations", "services", "banners"]) {
    assert.equal(canOptimizeImage(host + "/" + folder + "/photo.webp"), true);
  }
});

test("optimizes valid wrappers after resolving their Blob image source", () => {
  for (const [route, folder] of [["/api/doctors/photo", "doctors"], ["/api/services/image", "services"], ["/api/banners/image", "banners"]]) {
    assert.equal(canOptimizeImage(wrapped(route, host + "/" + folder + "/photo.webp")), true);
  }
});

test("falls back for external URLs outside the exact optimizer allowlist", () => {
  for (const source of [
    "https://example.com/photo.webp",
    host + "/other/photo.webp",
    host + "/doctors",
    host + "/doctors-other/photo.webp",
    host + "/doctors/photo.webp?download=1",
    "https://user:pass@store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "https://store123.public.blob.vercel-storage.com:443/doctors/photo.webp",
    "https://store123.public.blob.vercel-storage.com:8443/doctors/photo.webp",
    "http://store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "//store123.public.blob.vercel-storage.com/doctors/photo.webp",
    "data:image/png;base64,AA==",
  ]) {
    assert.equal(canOptimizeImage(source), false, source);
  }
});

test("does not optimize unresolved redirect API sources or unknown API responses", () => {
  for (const source of [
    "/api/doctors/photo",
    "/api/doctors/photo?key=doctors/legacy.webp",
    wrapped("/api/doctors/photo", "https://example.com/photo.webp"),
    wrapped("/api/doctors/photo", host + "/other/photo.webp"),
    wrapped("/api/banners/image", host + "/banners/photo.webp?download=1"),
    "/api/other/image?key=photo.webp",
    "/api",
    "/api%2Fdoctors/photo?key=bad",
  ]) {
    assert.equal(canOptimizeImage(source), false, source);
  }
});
