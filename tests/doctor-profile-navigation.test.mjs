import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const origin = "https://zdorovarodynaplus.com.ua";
const compiled = ts.transpileModule(readFileSync(new URL("../lib/doctorProfileNavigation.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function browser(path = "/doctors?specialty=group%3Afamily") {
  const values = new Map();
  const window = {
    location: new URL(path, origin),
    history: { state: { __NA: true }, replaceState(value) { this.state = value; } },
    sessionStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    },
  };
  const document = { referrer: "" };
  const performance = { getEntriesByType: () => [{ name: window.location.href }] };
  const load = () => {
    const loadedModule = { exports: {} };
    new Function("module", "exports", "window", "document", "performance", compiled)(loadedModule, loadedModule.exports, window, document, performance);
    return loadedModule.exports;
  };
  const visit = (path, { referrer = window.location.href, state = { __NA: true } } = {}) => {
    document.referrer = referrer;
    window.location = new URL(path, origin);
    window.history.state = state;
  };
  return { window, document, performance, values, load, visit };
}

test("legacy destinations accept only local doctor-selection pages", () => {
  const { safeDoctorReturnTo, doctorProfileHref } = browser().load();
  for (const target of ["/doctors", "/doctors?specialty=group%3Afamily#doctor-card-a", "/doctors?search=%D0%9E%D0%BB%D0%B5%D0%BD%D0%B0#doctor-card-a", "/services/family#family-declaration", "/services/screening-40#screening-doctors"]) {
    assert.equal(safeDoctorReturnTo(target), target);
  }
  for (const target of ["https://evil.test", "//evil.test", "/\\evil.test", "/admin", "/api/bookings", "/doctors/other", "/services/ct", "/doctors#booking", "/services/family?next=evil", "/doctors\n", null]) {
    assert.equal(safeDoctorReturnTo(target), undefined, String(target));
  }
  assert.equal(doctorProfileHref("a?returnTo=/admin"), "/doctors/a%3FreturnTo%3D%2Fadmin");
});

test("clean profile navigation retains filtered card destination and refresh/back-forward state", () => {
  const env = browser();
  const nav = env.load();
  const target = "/doctors?specialty=group%3Afamily#doctor-card-a";
  nav.rememberDoctorProfileNavigation("a", target);
  env.visit("/doctors/a");
  assert.equal(nav.resolveDoctorProfileReturnTo("a"), target);
  assert.equal(env.window.history.state.__NA, true, "Next history state remains intact");
  assert.equal(env.values.size, 0, "pending context is consumed");
  assert.equal(env.load().resolveDoctorProfileReturnTo("a"), target, "refresh retains this profile entry");
  const profileState = env.window.history.state;
  env.visit(target);
  env.visit("/doctors/a", { state: profileState });
  assert.equal(env.load().resolveDoctorProfileReturnTo("a"), target, "browser forward retains this profile entry");
});

test("full page and new-tab visits use copied session context only from its recorded source", () => {
  for (const target of ["/services/family#family-declaration", "/services/screening-40#screening-doctors"]) {
    const env = browser(target);
    env.load().rememberDoctorProfileNavigation("a", target);
    env.visit("/doctors/a");
    assert.equal(env.load().resolveDoctorProfileReturnTo("a"), target);
  }
  const env = browser();
  env.load().rememberDoctorProfileNavigation("a", "/doctors?specialty=group%3Afamily#doctor-card-a");
  env.visit("/doctors/a", { referrer: "https://google.com/" });
  assert.equal(env.load().resolveDoctorProfileReturnTo("a"), undefined, "direct/external visit does not inherit pending context");
});

test("legacy returnTo wins and generic profile links clear a previous selection", () => {
  const env = browser();
  const nav = env.load();
  nav.rememberDoctorProfileNavigation("a", "/doctors?search=Test#doctor-card-a");
  env.visit("/doctors/a?returnTo=%2Fservices%2Ffamily%23family-declaration");
  assert.equal(nav.resolveDoctorProfileReturnTo("a", "/services/family#family-declaration"), "/services/family#family-declaration");
  const previousProfileState = env.window.history.state;
  env.visit("/");
  nav.rememberDoctorProfileNavigation("a");
  env.visit("/doctors/a", { state: previousProfileState });
  assert.equal(nav.resolveDoctorProfileReturnTo("a"), undefined);
  assert.equal(env.load().resolveDoctorProfileReturnTo("a"), undefined, "refresh must not revive a prior filter");
});

test("disabled storage, malformed data, and stale context do not break profiles", () => {
  const env = browser();
  env.window.sessionStorage = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); }, removeItem() { throw Error("blocked"); } };
  const nav = env.load();
  nav.rememberDoctorProfileNavigation("a", "/doctors?search=Test#doctor-card-a");
  env.visit("/doctors/a");
  assert.equal(nav.resolveDoctorProfileReturnTo("a"), "/doctors?search=Test#doctor-card-a", "same-tab memory works");
  env.visit("/doctors?search=Test");
  env.visit("/doctors/a");
  assert.equal(env.load().resolveDoctorProfileReturnTo("a"), "/doctors?search=Test#doctor-card-a", "native navigation can derive a safe referrer destination");

  const broken = browser();
  broken.values.set("zr:doctor-profile-navigation", "bad json");
  broken.visit("/doctors/a", { referrer: "" });
  assert.equal(broken.load().resolveDoctorProfileReturnTo("a"), undefined);
  broken.values.set("zr:doctor-profile-navigation", JSON.stringify({ doctorId: "a", source: "/doctors", returnTo: "/doctors?search=Old#doctor-card-a", createdAt: Date.now() - 60 * 60 * 1000 }));
  broken.visit("/doctors/a", { referrer: `${origin}/doctors` });
  assert.equal(broken.load().resolveDoctorProfileReturnTo("a"), "/doctors#doctor-card-a", "expired filter is not restored");
});
