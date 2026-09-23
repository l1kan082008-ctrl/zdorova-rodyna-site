import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import { ADMIN_SESSION_COOKIE } from "../lib/adminCookie.ts";

const requirePackage = createRequire(import.meta.url);
const nextServer = requirePackage("next/server");
const { NextRequest } = nextServer;
const { outputText } = ts.transpileModule(
  readFileSync(new URL("../proxy.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
);
const exports = {};
new Function("require", "exports", outputText)((id) => {
  if (id === "next/server") return nextServer;
  if (id === "@/lib/adminCookie") return { ADMIN_SESSION_COOKIE };
  throw new Error(`Unexpected proxy dependency: ${id}`);
}, exports);
const { proxy } = exports;

const siteOrigin = "https://example.test";
const analyticsUrl = "https://analytics.google.com/g/collect";
const adsUrl = "https://www.google.com.ua/ads/ga-audiences";
const linkedAnalyticsUrl = "https://stats.g.doubleclick.net/g/collect";

function responseFor(path, headers = {}) {
  return proxy(new NextRequest(new URL(path, siteOrigin), { headers }));
}

function readPolicy(response) {
  const header = response.headers.get("content-security-policy");
  assert.ok(header, "proxy must return an enforced CSP header");
  return new Map(header.split(";").map((directive) => {
    const [name, ...sources] = directive.trim().split(/\s+/);
    return [name, sources];
  }));
}

// Match the URL-source forms used by this policy. These tests exercise the real
// proxy and NextResponse; they do not load analytics or make network requests.
function allowsUrl(policy, directive, value) {
  const target = new URL(value);
  return (policy.get(directive) ?? policy.get("default-src") ?? []).some((source) => {
    if (source === "*") return true;
    if (source === "'self'") return target.origin === siteOrigin;
    if (source.startsWith("'")) return false;
    if (/^[a-z][a-z0-9+.-]*:$/.test(source)) return target.protocol === source;
    const allowed = new URL(source);
    const matchesHost = allowed.hostname.startsWith("*.")
      ? target.hostname.endsWith(allowed.hostname.slice(1))
      : target.hostname === allowed.hostname;
    return allowed.protocol === target.protocol && allowed.port === target.port && matchesHost;
  });
}

test("public page responses allow the observed GA4 and Ukrainian Ads transports", () => {
  for (const path of ["/", "/services/family", "/contacts"]) {
    const response = responseFor(path, { "x-public-analytics": "0" });
    const policy = readPolicy(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-request-x-public-analytics"), "1");
    assert.equal(allowsUrl(policy, "connect-src", analyticsUrl), true, path);
    assert.equal(allowsUrl(policy, "img-src", adsUrl), true, path);
    assert.equal(allowsUrl(policy, "connect-src", adsUrl), true, path);
    assert.equal(allowsUrl(policy, "connect-src", linkedAnalyticsUrl), true, path);
  }
});

test("admin, login and API responses cannot enable analytics with a spoofed header", () => {
  for (const path of ["/admin", "/admin/doctors", "/admin/login", "/api", "/api/bookings", "/api/admin/doctors", "/_next/data/test"]) {
    const response = responseFor(path, {
      "x-public-analytics": "1",
      // Only bypass the proxy's presence check, without a session or database.
      cookie: `${ADMIN_SESSION_COOKIE}=isolated-test-cookie`,
    });
    const policy = readPolicy(response);
    assert.equal(response.headers.get("x-middleware-request-x-public-analytics"), "0", path);
    for (const directive of ["img-src", "connect-src", "script-src", "frame-src"]) {
      assert.equal(allowsUrl(policy, directive, analyticsUrl), false, `${path} ${directive}`);
      assert.equal(allowsUrl(policy, directive, adsUrl), false, `${path} ${directive}`);
      assert.equal(allowsUrl(policy, directive, linkedAnalyticsUrl), false, `${path} ${directive}`);
      assert.equal(allowsUrl(policy, directive, "https://www.googletagmanager.com/gtm.js"), false, `${path} ${directive}`);
    }
  }
});

test("unauthenticated admin redirects retain the restricted CSP and no-store headers", () => {
  const response = responseFor("/admin/doctors?tab=all", { "x-public-analytics": "1" });
  const policy = readPolicy(response);
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), `${siteOrigin}/admin/login?next=%2Fadmin%2Fdoctors%3Ftab%3Dall`);
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(response.headers.get("pragma"), "no-cache");
  assert.equal(allowsUrl(policy, "connect-src", analyticsUrl), false);
  assert.equal(allowsUrl(policy, "img-src", adsUrl), false);
  assert.equal(allowsUrl(policy, "connect-src", linkedAnalyticsUrl), false);
});

test("new transport origins do not gain script, frame or form permissions", () => {
  const policy = readPolicy(responseFor("/"));
  for (const directive of ["script-src", "frame-src", "form-action"]) {
    assert.equal(allowsUrl(policy, directive, analyticsUrl), false, directive);
    assert.equal(allowsUrl(policy, directive, adsUrl), false, directive);
    assert.equal(allowsUrl(policy, directive, linkedAnalyticsUrl), false, directive);
  }
  assert.equal(allowsUrl(policy, "img-src", analyticsUrl), false);
  assert.equal(allowsUrl(policy, "img-src", linkedAnalyticsUrl), false);
  assert.deepEqual(policy.get("form-action"), ["'self'"]);
  assert.deepEqual(policy.get("frame-ancestors"), ["'none'"]);
  assert.deepEqual(policy.get("object-src"), ["'none'"]);
});

test("transport exceptions do not allow unrelated, deceptive or unexpected-port origins", () => {
  const policy = readPolicy(responseFor("/"));
  const denied = [
    "https://unrelated.example/collect",
    "https://analytics.google.com.evil.test/g/collect",
    "https://www.google.com.ua.evil.test/ads/ga-audiences",
    "https://stats.g.doubleclick.net.evil.test/g/collect",
    "https://other.google.com/g/collect",
    "https://other.google.com.ua/ads/ga-audiences",
    "https://analytics.google.com:8443/g/collect",
  ];
  for (const url of denied) {
    assert.equal(allowsUrl(policy, "connect-src", url), false, url);
    assert.equal(allowsUrl(policy, "img-src", url), false, url);
  }
});
