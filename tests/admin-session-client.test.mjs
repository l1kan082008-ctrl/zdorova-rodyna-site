import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Execute the real monitor against a shared in-memory server contract. No real
// cookies, accounts, network, database or wall-clock waits are involved.
const source = ts.transpileModule(
  readFileSync(new URL("../app/admin/adminSessionClient.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
const MINUTE = 60_000;
const START = Date.parse("2026-11-02T10:00:00Z");
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function clock() {
  let now = 0, id = 0;
  const timers = new Map();
  return {
    get now() { return now; },
    timers,
    setTimeout(callback, delay = 0) {
      const key = ++id;
      timers.set(key, { callback, due: now + delay });
      return key;
    },
    clearTimeout(key) { timers.delete(key); },
    jumpTo(value) { now = value; },
    async advanceTo(target) {
      assert.ok(target >= now, "the monotonic test clock moves forward");
      await flush();
      let executions = 0;
      while (true) {
        const entry = [...timers].filter(([, value]) => value.due <= target)
          .sort((a, b) => a[1].due - b[1].due)[0];
        if (!entry) break;
        assert.ok(executions++ < 10_000, "timer scheduling must not loop forever");
        timers.delete(entry[0]);
        now = Math.max(now, entry[1].due);
        entry[1].callback();
        await flush();
      }
      now = target;
      await flush();
    },
  };
}

function events() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    dispatchEvent(event) {
      for (const listener of [...(listeners.get(event.type) ?? [])]) listener(event);
      return true;
    },
    emit(type, detail = {}) { this.dispatchEvent({ type, ...detail }); },
    listenerCount() { return [...listeners.values()].reduce((sum, group) => sum + group.size, 0); },
  };
}

function response(status, payload = {}) {
  return { status, ok: status >= 200 && status < 300, json: async () => payload };
}

function server(time) {
  const state = {
    idleExpiresAt: START + 30 * MINUTE,
    expiresAt: START + 8 * 60 * MINUTE,
    revoked: false,
    failure: null,
    requests: [],
    handle(input, init, tab) {
      assert.equal(input, "/api/admin/session");
      assert.equal(init.credentials, "same-origin");
      assert.equal(init.cache, "no-store");
      state.requests.push({ method: init.method, at: time.now, signal: init.signal, tab });
      if (state.failure === "offline") return Promise.reject(new TypeError("Synthetic offline failure"));
      if (typeof state.failure === "number") return Promise.resolve(response(state.failure));
      const serverNow = START + time.now;
      if (state.revoked || serverNow >= state.idleExpiresAt || serverNow >= state.expiresAt) {
        return Promise.resolve(response(401));
      }
      if (init.method === "PATCH") state.idleExpiresAt = Math.min(state.expiresAt, serverNow + 30 * MINUTE);
      return Promise.resolve(response(200, {
        ok: true, serverNow, idleExpiresAt: state.idleExpiresAt, expiresAt: state.expiresAt,
      }));
    },
  };
  return state;
}

function browser({ time = clock(), backend = server(time), fetchOverride, name = "main", pathname = "/admin/bookings" } = {}) {
  const log = [];
  const document = { ...events(), visibilityState: "visible" };
  const window = {
    ...events(),
    setTimeout: time.setTimeout,
    clearTimeout: time.clearTimeout,
    location: {
      pathname, search: "?status=new", hash: "#requests",
      replace(value) { log.push({ type: "redirect", value }); },
    },
  };
  window.addEventListener("zr-admin-session-expiring", () => log.push({ type: "draft-flush" }));
  const loaded = { exports: {} };
  new Function("module", "exports", "window", "document", "performance", "fetch", "Event", "AbortController", source)(
    loaded, loaded.exports, window, document, { now: () => time.now },
    fetchOverride ?? ((input, init) => backend.handle(input, init, name)), Event, AbortController,
  );
  return {
    time, backend, window, document, log, ...loaded.exports,
    start() { this.stop = loaded.exports.startAdminSessionMonitor(); },
    activity(type = "keydown", isTrusted = true) { window.emit(type, { isTrusted }); },
    redirects() { return log.filter(entry => entry.type === "redirect"); },
  };
}

test("idle admin returns to login at 30 minutes; status polling never extends the session", async () => {
  const h = browser();
  h.start();
  await h.time.advanceTo(30 * MINUTE - 1);
  assert.equal(h.redirects().length, 0);
  assert.equal(h.backend.idleExpiresAt, START + 30 * MINUTE);
  assert.ok(h.backend.requests.length > 1, "the page has checked the server while idle");
  assert.ok(h.backend.requests.every(entry => entry.method === "GET"));
  await h.time.advanceTo(30 * MINUTE);
  assert.equal(h.redirects().length, 1);
  h.stop();
});

test("real editing keeps the session alive, then inactivity expires it after the last heartbeat", async () => {
  const h = browser();
  h.start();
  for (let minute = 10; minute <= 60; minute += 10) {
    await h.time.advanceTo(minute * MINUTE);
    h.activity("keydown");
    await h.time.advanceTo(minute * MINUTE + 1);
  }
  assert.equal(h.redirects().length, 0);
  assert.ok(h.backend.requests.some(entry => entry.method === "PATCH"));
  const expiry = h.backend.idleExpiresAt - START;
  await h.time.advanceTo(expiry - 1);
  assert.equal(h.redirects().length, 0);
  await h.time.advanceTo(expiry);
  assert.equal(h.redirects().length, 1);
  h.stop();
});

test("focus, resume and synthetic events check status without counting as user activity", async () => {
  const h = browser();
  h.start();
  await flush();
  for (const type of ["pointerdown", "pointermove", "keydown", "wheel", "touchmove"]) h.activity(type, false);
  for (const type of ["focus", "pageshow", "online"]) {
    h.window.emit(type);
    await flush();
  }
  h.document.emit("visibilitychange");
  await h.time.advanceTo(30 * MINUTE);
  assert.ok(h.backend.requests.every(entry => entry.method === "GET"));
  assert.equal(h.redirects().length, 1);
  h.stop();
});

test("active interaction cannot extend the server's absolute eight-hour limit", async () => {
  const h = browser();
  h.start();
  for (let minute = 20; minute < 8 * 60; minute += 20) {
    await h.time.advanceTo(minute * MINUTE);
    h.activity();
    await h.time.advanceTo(minute * MINUTE + 1);
    assert.equal(h.redirects().length, 0);
  }
  await h.time.advanceTo(8 * 60 * MINUTE);
  assert.equal(h.redirects().length, 1);
  assert.equal(h.backend.idleExpiresAt, h.backend.expiresAt);
  h.stop();
});

test("invalid session flushes before navigating once and preserves the exact return location", async () => {
  const h = browser();
  h.backend.revoked = true;
  h.start();
  await flush();
  h.expireAdminSession();
  h.window.emit("focus");
  assert.deepEqual(h.log.map(entry => entry.type), ["draft-flush", "redirect"]);
  const target = new URL(h.redirects()[0].value, "https://admin.example");
  assert.equal(target.pathname, "/admin/login");
  assert.equal(target.searchParams.get("reason"), "expired");
  assert.equal(target.searchParams.get("next"), "/admin/bookings?status=new#requests");
  h.stop();
});

test("waking a sleeping tab checks the server and does not replay stale pending activity", async () => {
  const h = browser();
  h.start();
  await flush();
  h.activity();
  h.document.visibilityState = "hidden";
  h.time.jumpTo(40 * MINUTE);
  h.document.visibilityState = "visible";
  h.document.emit("visibilitychange");
  await flush();
  assert.equal(h.redirects().length, 1);
  assert.ok(h.backend.requests.every(entry => entry.method === "GET"));
  h.stop();
});

test("offline and service errors do not force logout; verification recovers and catches expiry", async () => {
  const h = browser();
  h.backend.failure = "offline";
  h.start();
  await h.time.advanceTo(MINUTE);
  assert.equal(h.redirects().length, 0);
  assert.ok(h.backend.requests.length >= 2, "transient failures are retried");
  h.backend.failure = 503;
  await h.time.advanceTo(2 * MINUTE);
  assert.equal(h.redirects().length, 0);
  h.backend.failure = null;
  h.window.emit("online");
  await flush();
  await h.time.advanceTo(30 * MINUTE);
  assert.equal(h.redirects().length, 1);
  h.stop();
});

test("unmount aborts pending work and ignores a late expired response", async () => {
  let resolveRequest, requestSignal;
  const h = browser({ fetchOverride: (_input, init) => {
    requestSignal = init.signal;
    return new Promise(resolve => { resolveRequest = resolve; });
  } });
  h.start();
  h.activity();
  h.stop();
  assert.equal(requestSignal.aborted, true);
  assert.equal(h.time.timers.size, 0);
  assert.equal(h.document.listenerCount(), 0);
  assert.equal(h.window.listenerCount(), 1, "only the test's draft listener remains");
  resolveRequest(response(401));
  await flush();
  assert.equal(h.redirects().length, 0);
  assert.equal(h.time.timers.size, 0);
});

test("activity in another tab prevents the idle tab from expiring a shared valid session", async () => {
  const time = clock(), backend = server(time);
  const first = browser({ time, backend, name: "first" });
  const second = browser({ time, backend, name: "second" });
  first.start();
  second.start();
  await time.advanceTo(25 * MINUTE);
  second.activity();
  await time.advanceTo(25 * MINUTE + 1);
  await time.advanceTo(35 * MINUTE);
  assert.equal(first.redirects().length, 0);
  assert.equal(second.redirects().length, 0);
  assert.ok(backend.requests.filter(entry => entry.tab === "first").every(entry => entry.method === "GET"));
  await time.advanceTo(55 * MINUTE);
  assert.equal(first.redirects().length, 1);
  assert.equal(second.redirects().length, 1);
  first.stop();
  second.stop();
});

test("login screen does not enter a redirect loop when expiry is signalled", () => {
  const h = browser({ pathname: "/admin/login" });
  h.expireAdminSession();
  assert.equal(h.isAdminSessionExpiring(), false);
  assert.deepEqual(h.log, []);
});

test("restoring an expired admin document from browser history returns to login again", async () => {
  const h = browser();
  h.backend.revoked = true;
  h.start();
  await flush();
  assert.equal(h.redirects().length, 1);
  h.window.emit("pageshow", { persisted: true });
  assert.equal(h.redirects().length, 2, "BFCache restoration must not reveal a stranded expired admin screen");
  assert.equal(h.redirects()[1].value, h.redirects()[0].value);
  assert.equal(h.log.filter(entry => entry.type === "draft-flush").length, 1, "drafts were already preserved before the original exit");
  h.stop();
});
