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
const adsScriptUrl = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/123456789/";
const clarityScripts = [
  "https://www.clarity.ms/tag/test-project",
  "https://scripts.clarity.ms/0.8.0/clarity.js",
];
const clarityCollectors = [
  "https://a.clarity.ms/collect",
  "https://b.clarity.ms/collect",
  "https://f.clarity.ms/collect",
  "https://h.clarity.ms/collect",
  "https://z.clarity.ms/collect",
  "https://report.clarity.ms/sln",
];
const clarityPixels = [
  "https://c.clarity.ms/c.gif",
  "https://c.bing.com/c.gif",
];
const clarityResources = [...clarityScripts, ...clarityCollectors, ...clarityPixels];

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
  // Script elements inherit script-src when script-src-elem is not specified.
  const sources = policy.get(directive)
    ?? (directive === "script-src-elem" ? policy.get("script-src") : undefined)
    ?? policy.get("default-src")
    ?? [];
  return sources.some((source) => {
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

test("public responses allow the Google Ads script blocked in Tag Assistant", () => {
  for (const path of ["/", "/services/holter", "/doctors"]) {
    const policy = readPolicy(responseFor(path));
    for (const directive of ["script-src", "script-src-elem"]) {
      assert.equal(allowsUrl(policy, directive, adsScriptUrl), true, `${path} ${directive}`);
    }
  }
});

test("public page responses allow Clarity scripts, regional collectors and cookie pixels", () => {
  for (const path of ["/", "/doctors", "/services/lab"]) {
    const response = responseFor(path, { "x-public-analytics": "0" });
    const policy = readPolicy(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-request-x-public-analytics"), "1", path);
    for (const [directive, urls] of [
      ["script-src", clarityScripts],
      ["connect-src", clarityCollectors],
      ["img-src", clarityPixels],
    ]) {
      for (const url of urls) {
        assert.equal(allowsUrl(policy, directive, url), true, `${path} ${directive} ${url}`);
      }
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
    for (const directive of ["default-src", "img-src", "connect-src", "script-src", "script-src-elem", "frame-src", "form-action", "font-src", "style-src", "worker-src", "media-src"]) {
      for (const url of [...analyticsTransports, ...adsTransports, adsScriptUrl, ...clarityResources]) {
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
  for (const directive of ["default-src", "img-src", "connect-src", "script-src", "script-src-elem", "frame-src", "form-action", "font-src", "style-src", "worker-src", "media-src"]) {
    for (const url of [...analyticsTransports, ...adsTransports, adsScriptUrl, ...clarityResources]) {
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

test("Google Ads script exception remains limited to its exact HTTPS origin", () => {
  const policy = readPolicy(responseFor("/"));
  for (const directive of ["script-src", "script-src-elem"]) {
    for (const url of [
      "https://googleads.g.doubleclick.net.evil.test/script.js",
      "https://other.g.doubleclick.net/script.js",
      "https://stats.g.doubleclick.net/script.js",
      "https://doubleclick.net/script.js",
      "http://googleads.g.doubleclick.net/script.js",
      "https://googleads.g.doubleclick.net:8443/script.js",
    ]) {
      assert.equal(allowsUrl(policy, directive, url), false, `${directive} ${url}`);
    }
  }
  for (const directive of ["default-src", "frame-src", "form-action", "font-src", "style-src", "worker-src", "media-src"]) {
    assert.equal(allowsUrl(policy, directive, adsScriptUrl), false, directive);
  }
  assert.equal(policy.get("script-src").includes("'unsafe-eval'"), false);
  assert.equal(policy.get("script-src").includes("*"), false);
});

test("Clarity permissions do not expand defaults, frames, forms or Bing script execution", () => {
  const policy = readPolicy(responseFor("/"));
  for (const directive of ["default-src", "frame-src", "form-action", "font-src", "style-src", "worker-src", "media-src"]) {
    for (const url of clarityResources) {
      assert.equal(allowsUrl(policy, directive, url), false, `${directive} ${url}`);
    }
  }
  for (const directive of ["script-src", "connect-src"]) {
    assert.equal(allowsUrl(policy, directive, "https://c.bing.com/c.gif"), false, directive);
  }
  assert.equal(policy.get("script-src").includes("'unsafe-eval'"), false);
  assert.deepEqual(policy.get("default-src"), ["'self'"]);
  assert.deepEqual(policy.get("form-action"), ["'self'"]);
  assert.deepEqual(policy.get("frame-ancestors"), ["'none'"]);
  assert.deepEqual(policy.get("object-src"), ["'none'"]);
});

test("Clarity exceptions reject deceptive hosts, insecure schemes and unexpected ports", () => {
  const policy = readPolicy(responseFor("/"));
  const denied = [
    "https://unrelated.example/collect",
    "https://www.clarity.ms.evil.test/tag/test-project",
    "https://scripts.clarity.ms.evil.test/clarity.js",
    "https://a.clarity.ms.evil.test/collect",
    "https://wwwclarity.ms/tag/test-project",
    "https://c.bing.com.evil.test/c.gif",
    "https://other.bing.com/c.gif",
    "https://evilbing.com/c.gif",
    "http://www.clarity.ms/tag/test-project",
    "http://a.clarity.ms/collect",
    "http://c.bing.com/c.gif",
    "https://www.clarity.ms:8443/tag/test-project",
    "https://a.clarity.ms:8443/collect",
    "https://c.bing.com:8443/c.gif",
  ];
  for (const directive of ["script-src", "connect-src", "img-src"]) {
    for (const url of denied) {
      assert.equal(allowsUrl(policy, directive, url), false, `${directive} ${url}`);
    }
  }
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
