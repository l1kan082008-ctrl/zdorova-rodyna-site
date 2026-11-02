import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
import * as session from "../lib/adminSession.ts";

const MINUTE = 60_000;
const START = Date.parse("2026-11-02T10:00:00.000Z");
const SECRET = "test-only-admin-session-secret-for-isolated-sqlite";
const routeSource = ts.transpileModule(
  readFileSync(new URL("../app/api/admin/session/route.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

function loadRoute(env) {
  const loaded = { exports: {} };
  const dependencies = {
    "@/lib/runtimeEnv": { env },
    "../../../../lib/adminSession": session,
  };
  new Function("require", "module", "exports", routeSource)((name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  }, loaded, loaded.exports);
  return loaded.exports;
}

async function fixture(context) {
  let now = START;
  context.mock.method(Date, "now", () => now);
  const sqlite = new DatabaseSync(":memory:");
  context.after(() => sqlite.close());
  const state = { beforeFirst: null, unavailable: false, stringifyTimestamps: false, queries: [] };
  const execute = async (sql, values, first) => {
    if (state.unavailable) throw new Error("Test database unavailable");
    state.queries.push(sql);
    if (first) await state.beforeFirst?.(sql, values);
    const statement = sqlite.prepare(sql);
    if (!first) return { meta: { changes: Number(statement.run(...values).changes) } };
    const row = statement.get(...values) ?? null;
    return row && state.stringifyTimestamps
      ? Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value)]))
      : row;
  };
  const prepare = (sql, values = []) => ({
    bind: (...bound) => prepare(sql, bound),
    first: () => execute(sql, values, true),
    run: () => execute(sql, values, false),
  });
  const DB = { prepare, batch: (statements) => Promise.all(statements.map((statement) => statement.run())) };
  await session.ensureAdminSecuritySchema(DB);
  const token = await session.createAdminSession(SECRET, DB);
  const env = { DB, ADMIN_SESSION_SECRET: SECRET };
  const route = loadRoute(env);
  const request = (method = "GET", headers = {}) => new Request("https://admin.test/api/admin/session", {
    method,
    headers: {
      origin: "https://admin.test", "sec-fetch-site": "same-origin",
      cookie: `${session.ADMIN_SESSION_COOKIE}=${token}`, ...headers,
    },
  });
  const row = () => sqlite.prepare("SELECT * FROM admin_sessions").get();
  state.queries.length = 0;
  return { sqlite, DB, state, token, env, route, request, row, setTime: (value) => { now = value; } };
}

function assertNoCache(response) {
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("pragma"), "no-cache");
}

test("status and ordinary API verification never extend the 30-minute inactivity deadline", async (context) => {
  const f = await fixture(context);
  const initial = f.row();
  for (const elapsed of [0, 6 * MINUTE, 29 * MINUTE, 30 * MINUTE - 1]) {
    f.setTime(START + elapsed);
    const response = await f.route.GET(f.request());
    assert.equal(response.status, 200);
    assertNoCache(response);
    assert.equal(response.headers.has("set-cookie"), false);
    assert.deepEqual(await response.json(), {
      ok: true, serverNow: START + elapsed,
      idleExpiresAt: START + 30 * MINUTE, expiresAt: START + 8 * 60 * MINUTE,
    });
    assert.equal(await session.verifyAdminRequest(f.request(), SECRET, f.DB), true);
    assert.deepEqual(f.row(), initial);
  }
  assert.ok(f.state.queries.every((query) => query.trim().startsWith("SELECT")));
  f.setTime(START + 30 * MINUTE);
  assert.equal(await session.verifyAdminSession(f.token, SECRET, f.DB), false);
  const expired = await f.route.GET(f.request());
  assert.equal(expired.status, 401);
  assertNoCache(expired);
  assert.equal(expired.headers.has("set-cookie"), false);
  assert.deepEqual(f.row(), initial);
});

test("same-origin activity extends a valid session, capped at the absolute eight-hour deadline", async (context) => {
  const f = await fixture(context);
  f.setTime(START + 29 * MINUTE);
  let response = await f.route.PATCH(f.request("PATCH"));
  assert.equal(response.status, 200);
  assertNoCache(response);
  assert.deepEqual(await response.json(), {
    ok: true, serverNow: START + 29 * MINUTE,
    idleExpiresAt: START + 59 * MINUTE, expiresAt: START + 8 * 60 * MINUTE,
  });
  assert.equal(f.row().last_seen_at, START + 29 * MINUTE);
  for (let elapsed = 49; elapsed <= 469; elapsed += 20) {
    f.setTime(START + elapsed * MINUTE);
    response = await f.route.PATCH(f.request("PATCH"));
    assert.equal(response.status, 200);
  }
  assert.equal(f.row().idle_expires_at, START + 8 * 60 * MINUTE);
  f.setTime(START + 8 * 60 * MINUTE);
  assert.equal((await f.route.GET(f.request())).status, 401);
  assert.equal((await f.route.PATCH(f.request("PATCH"))).status, 401);
  assert.equal(f.row().expires_at, START + 8 * 60 * MINUTE);
});

test("expired, revoked, missing, tampered and mismatched sessions cannot be renewed", async (context) => {
  const f = await fixture(context);
  for (const token of ["", `${f.token}x`, f.token.replace(/^v2/, "v1")]) {
    const headers = { cookie: `${session.ADMIN_SESSION_COOKIE}=${token}` };
    for (const method of ["GET", "PATCH"]) {
      const response = await f.route[method](f.request(method, headers));
      assert.equal(response.status, 401);
      assert.equal(response.headers.has("set-cookie"), false);
    }
  }
  f.sqlite.prepare("UPDATE admin_sessions SET expires_at = expires_at + 1").run();
  assert.equal((await f.route.GET(f.request())).status, 401);
  assert.equal((await f.route.PATCH(f.request("PATCH"))).status, 401);
  f.sqlite.prepare("UPDATE admin_sessions SET expires_at = expires_at - 1").run();
  f.setTime(START + 30 * MINUTE);
  const before = f.row();
  assert.equal((await f.route.PATCH(f.request("PATCH"))).status, 401);
  assert.deepEqual(f.row(), before);
  await session.revokeAdminSession(f.request(), f.DB);
  assert.equal((await f.route.PATCH(f.request("PATCH"))).status, 401);
  assert.equal(f.row(), undefined);
});

test("activity requires an exact same-origin request and rejects cross-site requests without touching SQL", async (context) => {
  const f = await fixture(context);
  for (const headers of [
    { origin: "" },
    { origin: "https://other.test" },
    { origin: "https://admin.test:8443" },
    { "sec-fetch-site": "cross-site" },
  ]) {
    const response = await f.route.PATCH(f.request("PATCH", headers));
    assert.equal(response.status, 403);
    assertNoCache(response);
    assert.equal(response.headers.has("set-cookie"), false);
  }
  assert.deepEqual(f.state.queries, []);
});

test("missing configuration and transient database failures are 503 without deleting the cookie", async (context) => {
  const f = await fixture(context);
  context.mock.method(console, "error", () => {});
  for (const field of ["DB", "ADMIN_SESSION_SECRET"]) {
    const saved = f.env[field];
    delete f.env[field];
    for (const method of ["GET", "PATCH"]) {
      const response = await f.route[method](f.request(method));
      assert.equal(response.status, 503);
      assertNoCache(response);
      assert.equal(response.headers.has("set-cookie"), false);
    }
    f.env[field] = saved;
  }
  f.state.unavailable = true;
  for (const method of ["GET", "PATCH"]) {
    const response = await f.route[method](f.request(method));
    assert.equal(response.status, 503);
    assertNoCache(response);
    assert.equal(response.headers.has("set-cookie"), false);
  }
  assert.equal(await session.verifyAdminRequest(f.request(), SECRET, f.DB), false);
  f.state.unavailable = false;
  assert.equal((await f.route.GET(f.request())).status, 200);
});

test("PostgreSQL BIGINT strings are normalized for session checks and activity responses", async (context) => {
  const f = await fixture(context);
  f.state.stringifyTimestamps = true;
  assert.equal(await session.verifyAdminSession(f.token, SECRET, f.DB), true);
  f.setTime(START + MINUTE);
  const response = await f.route.PATCH(f.request("PATCH"));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.idleExpiresAt, START + 31 * MINUTE);
  assert.equal(typeof body.expiresAt, "number");
});

function delayNextUpdate(f) {
  let release;
  let entered;
  const paused = new Promise((resolve) => { entered = resolve; });
  const wait = new Promise((resolve) => { release = resolve; });
  f.state.beforeFirst = async (query) => {
    if (!query.trim().startsWith("UPDATE")) return;
    f.state.beforeFirst = null;
    entered();
    await wait;
  };
  return { paused, release };
}

test("out-of-order activity requests cannot shorten a newer session deadline", async (context) => {
  const f = await fixture(context);
  f.setTime(START + 5 * MINUTE);
  const gate = delayNextUpdate(f);
  const older = f.route.PATCH(f.request("PATCH"));
  await gate.paused;
  f.setTime(START + 6 * MINUTE);
  const newer = await f.route.PATCH(f.request("PATCH"));
  assert.equal(newer.status, 200);
  gate.release();
  const olderResponse = await older;
  assert.equal(olderResponse.status, 200);
  assert.equal((await olderResponse.json()).idleExpiresAt, START + 36 * MINUTE);
  assert.equal(f.row().idle_expires_at, START + 36 * MINUTE);
  assert.equal(f.row().last_seen_at, START + 6 * MINUTE);
});

test("logout winning a race with activity cannot resurrect a session", async (context) => {
  const f = await fixture(context);
  f.setTime(START + 5 * MINUTE);
  const gate = delayNextUpdate(f);
  const activity = f.route.PATCH(f.request("PATCH"));
  await gate.paused;
  const logout = await f.route.DELETE(f.request("DELETE"));
  assert.equal(logout.status, 204);
  gate.release();
  assert.equal((await activity).status, 401);
  assert.equal(f.row(), undefined);
});

test("activity eligibility is checked by the update against the current persisted deadline", async (context) => {
  const f = await fixture(context);
  f.setTime(START + 5 * MINUTE);
  const gate = delayNextUpdate(f);
  const activity = f.route.PATCH(f.request("PATCH"));
  await gate.paused;
  f.sqlite.prepare("UPDATE admin_sessions SET idle_expires_at = ?").run(START + 5 * MINUTE);
  gate.release();
  assert.equal((await activity).status, 401);
  assert.equal(f.row().idle_expires_at, START + 5 * MINUTE);
});

for (const method of ["GET", "PATCH"]) {
  test(`a late ${method} rejection cannot erase a newer login in another tab`, async (context) => {
    const f = await fixture(context);
    context.mock.method(console, "info", () => {});
    const password = "Test-only-admin-password-for-cookie-race!";
    f.env.ADMIN_PASSWORD_HASH = await session.hashAdminPassword(password);
    let cookie = f.request().headers.get("cookie");
    const applyResponseCookie = (response) => {
      const header = response.headers.get("set-cookie");
      if (header) cookie = /Max-Age=0(?:;|$)/.test(header) ? "" : header.split(";", 1)[0];
    };

    let release;
    let entered;
    const paused = new Promise((resolve) => { entered = resolve; });
    const wait = new Promise((resolve) => { release = resolve; });
    f.state.beforeFirst = async () => {
      f.state.beforeFirst = null;
      entered();
      await wait;
    };
    f.setTime(START + 30 * MINUTE);
    const oldCheck = f.route[method](f.request(method));
    await paused;

    const login = await f.route.POST(new Request("https://admin.test/api/admin/session", {
      method: "POST",
      headers: { origin: "https://admin.test", "sec-fetch-site": "same-origin", "content-type": "application/json" },
      body: JSON.stringify({ password }),
    }));
    assert.equal(login.status, 200);
    applyResponseCookie(login);
    const newCookie = cookie;
    assert.notEqual(newCookie, f.request().headers.get("cookie"));

    release();
    const staleResponse = await oldCheck;
    assert.equal(staleResponse.status, 401);
    assert.equal(staleResponse.headers.has("set-cookie"), false);
    applyResponseCookie(staleResponse);
    assert.equal(cookie, newCookie);
    assert.equal((await f.route.GET(f.request("GET", { cookie }))).status, 200);

    const logout = await f.route.DELETE(f.request("DELETE", { cookie }));
    assert.equal(logout.status, 204);
    applyResponseCookie(logout);
    assert.equal(cookie, "");
  });
}
