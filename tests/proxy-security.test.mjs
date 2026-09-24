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
const regionalAnalyticsUrls = [
  "https://region1.analytics.google.com/g/collect",
  "https://region1.analytics.google.com/measurement/conversion",
  "https://region2.analytics.google.com/g/collect",
];
const polishAdsUrl = "https://www.google.pl/ads/ga-audiences";
const analyticsTransports = [analyticsUrl, linkedAnalyticsUrl, ...regionalAnalyticsUrls];
const adsTransports = [adsUrl, polishAdsUrl];

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

test("public page responses allow GA4 regional collection and Ukrainian and Polish Ads transports", () => {
  for (const path of ["/", "/services/family", "/contacts"]) {
    const response = responseFor(path, { "x-public-analytics": "0" });
    const policy = readPolicy(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-request-x-public-analytics"), "1");
    for (const url of analyticsTransports) {
      assert.equal(allowsUrl(policy, "connect-src", url), true, `${path} ${url}`);
    }
    for (const url of adsTransports) {
      assert.equal(allowsUrl(policy, "img-src", url), true, `${path} ${url}`);
      assert.equal(allowsUrl(policy, "connect-src", url), true, `${path} ${url}`);
    }
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
    for (const directive of ["img-src", "connect-src", "script-src", "frame-src", "form-action"]) {
      for (const url of [...analyticsTransports, ...adsTransports]) {
        assert.equal(allowsUrl(policy, directive, url), false, `${path} ${directive} ${url}`);
      }
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
  for (const directive of ["img-src", "connect-src", "script-src", "frame-src", "form-action"]) {
    for (const url of [...analyticsTransports, ...adsTransports]) {
      assert.equal(allowsUrl(policy, directive, url), false, `${directive} ${url}`);
    }
  }
});

test("new transport origins do not gain script, frame or form permissions", () => {
  const policy = readPolicy(responseFor("/"));
  for (const directive of ["script-src", "frame-src", "form-action"]) {
    for (const url of [...analyticsTransports, ...adsTransports]) {
      assert.equal(allowsUrl(policy, directive, url), false, `${directive} ${url}`);
    }
  }
  for (const url of analyticsTransports) {
    assert.equal(allowsUrl(policy, "img-src", url), false, url);
  }
  assert.deepEqual(policy.get("form-action"), ["'self'"]);
  assert.deepEqual(policy.get("frame-ancestors"), ["'none'"]);
  assert.deepEqual(policy.get("object-src"), ["'none'"]);
});

test("transport exceptions do not allow unrelated, deceptive or unexpected-port origins", () => {
  const policy = readPolicy(responseFor("/"));
  const denied = [
    "https://unrelated.example/collect",
    "https://analytics.google.com.evil.test/g/collect",
    "https://region1.analytics.google.com.evil.test/g/collect",
    "https://www.google.com.ua.evil.test/ads/ga-audiences",
    "https://www.google.pl.evil.test/ads/ga-audiences",
    "https://stats.g.doubleclick.net.evil.test/g/collect",
    "https://other.google.com/g/collect",
    "https://other.google.com.ua/ads/ga-audiences",
    "https://other.google.pl/ads/ga-audiences",
    "https://google.pl/ads/ga-audiences",
    "http://region1.analytics.google.com/g/collect",
    "http://www.google.pl/ads/ga-audiences",
    "https://analytics.google.com:8443/g/collect",
    "https://region1.analytics.google.com:8443/g/collect",
    "https://www.google.pl:8443/ads/ga-audiences",
  ];
  for (const url of denied) {
    assert.equal(allowsUrl(policy, "connect-src", url), false, url);
    assert.equal(allowsUrl(policy, "img-src", url), false, url);
  }
});
