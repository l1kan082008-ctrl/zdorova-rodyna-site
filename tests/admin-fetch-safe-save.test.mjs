import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(path, dependencies, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } });
  const loaded = { exports: {} };
  const require = (name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", ...Object.keys(globals), outputText)(
    require, loaded, loaded.exports, ...Object.values(globals),
  );
  return loaded.exports;
}

test("admin fetch confirms protected same-origin 401 without consuming the original response", async () => {
  for (const input of ["/api/admin/bookings?page=2", new URL("https://example.test/api/admin/prices"), new Request("https://example.test/api/admin/doctors")]) {
    let expired = 0;
    const response = Response.json({ error: "Unauthorized" }, { status: 401 });
    const init = { cache: "no-store", signal: new AbortController().signal };
    const { adminFetch } = load("../app/admin/adminFetch.ts", {
      "./adminSessionClient": { expireAdminSession() { expired++; } },
    }, {
      window: { location: { href: "https://example.test/admin/bookings", origin: "https://example.test" } },
      fetch: async (actualInput, actualInit) => {
        if (actualInput === "/api/admin/session") {
          assert.equal(actualInit.method, "GET");
          assert.equal(actualInit.credentials, "same-origin");
          assert.equal(actualInit.cache, "no-store");
          assert.ok(actualInit.signal instanceof AbortSignal);
          return new Response(null, { status: 401 });
        }
        assert.equal(actualInput, input);
        assert.equal(actualInit, init);
        return response;
      },
    });
    assert.equal(await adminFetch(input, init), response);
    assert.equal(expired, 1);
    assert.deepEqual(await response.json(), { error: "Unauthorized" });
  }
});

test("login, public, external, forbidden and failed requests do not trigger session expiry", async () => {
  const cases = [
    ["/api/admin/session", 401],
    ["/api/admin/session?next=bookings", 401],
    ["/api/locations", 401],
    ["https://other.test/api/admin/bookings", 401],
    ["/api/admin/bookings", 200],
    ["/api/admin/bookings", 403],
    ["/api/admin/bookings", 500],
  ];
  for (const [input, status] of cases) {
    const { adminFetch } = load("../app/admin/adminFetch.ts", {
      "./adminSessionClient": { expireAdminSession() { assert.fail("must not expire this session"); } },
    }, {
      window: { location: { href: "https://example.test/admin", origin: "https://example.test" } },
      fetch: async () => new Response(null, { status }),
    });
    assert.equal((await adminFetch(input)).status, status);
  }
  const failure = new TypeError("Synthetic offline error");
  const { adminFetch } = load("../app/admin/adminFetch.ts", {
    "./adminSessionClient": { expireAdminSession() { assert.fail("network failure is not session expiry"); } },
  }, { fetch: async () => { throw failure; } });
  await assert.rejects(adminFetch("/api/admin/bookings"), (error) => error === failure);
});

test("an initial 401 does not log out a valid session or a session that cannot be checked", async () => {
  for (const sessionStatus of [200, 503, 500, "offline"]) {
    let checks = 0;
    const response = Response.json({ error: "Unavailable" }, { status: 401 });
    const { adminFetch } = load("../app/admin/adminFetch.ts", {
      "./adminSessionClient": { expireAdminSession() { assert.fail("expiry has not been confirmed"); } },
    }, {
      window: { location: { href: "https://example.test/admin", origin: "https://example.test" } },
      fetch: async (input) => {
        if (input !== "/api/admin/session") return response;
        checks++;
        if (sessionStatus === "offline") throw new TypeError("Synthetic offline error");
        return new Response(null, { status: sessionStatus });
      },
    });
    assert.equal(await adminFetch("/api/admin/bookings"), response);
    assert.equal(checks, 1);
    assert.deepEqual(await response.json(), { error: "Unavailable" });
  }
});

test("simultaneous unauthorized requests share one session check and can be checked again later", async () => {
  let checks = 0, expired = 0, completeCheck;
  const responses = [new Response(null, { status: 401 }), new Response(null, { status: 401 })];
  const { adminFetch } = load("../app/admin/adminFetch.ts", {
    "./adminSessionClient": { expireAdminSession() { expired++; } },
  }, {
    window: { location: { href: "https://example.test/admin", origin: "https://example.test" } },
    fetch: async (input) => {
      if (input === "/api/admin/session") {
        checks++;
        return new Promise((resolve) => { completeCheck = resolve; });
      }
      return responses[input.endsWith("doctors") ? 1 : 0];
    },
  });
  const first = adminFetch("/api/admin/bookings");
  const second = adminFetch("/api/admin/doctors");
  await Promise.resolve();
  assert.equal(checks, 1);
  completeCheck(new Response(null, { status: 401 }));
  assert.deepEqual(await Promise.all([first, second]), responses);
  assert.equal(expired, 1);
  const later = adminFetch("/api/admin/bookings");
  await Promise.resolve();
  assert.equal(checks, 2);
  completeCheck(new Response(null, { status: 200 }));
  await later;
  assert.equal(expired, 1);
});

test("session verification aborts after ten seconds and returns the original response", async () => {
  let abortTimer, cleared = false;
  const response = new Response(null, { status: 401 });
  const { adminFetch } = load("../app/admin/adminFetch.ts", {
    "./adminSessionClient": { expireAdminSession() { assert.fail("a timeout is not session expiry"); } },
  }, {
    window: { location: { href: "https://example.test/admin", origin: "https://example.test" } },
    setTimeout(fn, delay) { assert.equal(delay, 10_000); abortTimer = fn; return 1; },
    clearTimeout(id) { assert.equal(id, 1); cleared = true; },
    fetch: async (input, init) => {
      if (input !== "/api/admin/session") return response;
      return new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))));
    },
  });
  const request = adminFetch("/api/admin/bookings");
  await Promise.resolve();
  abortTimer();
  assert.equal(await request, response);
  assert.equal(cleared, true);
});

function hookHarness({ storageDenied = false } = {}) {
  const state = [], effects = [], pending = [], storage = new Map(), timers = new Map();
  const listeners = new Map();
  let cursor = 0, timerId = 0, expiring = false, confirms = 0;
  const equal = (left, right) => left?.length === right.length && right.every((value, index) => Object.is(left[index], value));
  const addEventListener = (type, listener) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(listener);
  };
  const removeEventListener = (type, listener) => listeners.get(type)?.delete(listener);
  const react = {
    useCallback: (value) => value,
    useMemo: (factory) => factory(),
    useRef(initial) { const index = cursor++; return state[index] ??= { current: initial }; },
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!equal(effects[index]?.deps, deps)) pending.push(() => {
        effects[index]?.cleanup?.();
        effects[index] = { deps, cleanup: effect() };
      });
    },
  };
  const window = {
    addEventListener, removeEventListener,
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      removeItem: (key) => storage.delete(key),
      setItem(key, value) { if (storageDenied) throw new Error("Storage denied"); storage.set(key, value); },
    },
    setTimeout(fn) { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout: (id) => timers.delete(id),
    confirm() { confirms++; return false; },
  };
  const { useAdminSafeSave: runHook } = load("../app/admin/useAdminSafeSave.ts", {
    react,
    "./adminSessionClient": {
      ADMIN_SESSION_EXPIRING_EVENT: "zr-admin-session-expiring",
      isAdminSessionExpiring: () => expiring,
    },
  }, { window, document: { addEventListener, removeEventListener } });
  const onRestore = () => {}, onSave = () => {};
  function dispatch(type, event = {}) {
    for (const listener of listeners.get(type) ?? []) listener(event);
  }
  return {
    storage, timers,
    render(value) {
      cursor = 0;
      const result = runHook({ storageKey: "synthetic-draft", value, baseline: { title: "Saved" }, onRestore, onSave });
      while (pending.length) pending.shift()();
      return result;
    },
    dispatch,
    expire() { expiring = true; dispatch("zr-admin-session-expiring"); },
    confirms: () => confirms,
    unmount() { effects.forEach((effect) => effect?.cleanup?.()); },
  };
}

test("session expiry flushes the latest unsaved draft immediately and bypasses leave guards", () => {
  const h = hookHarness();
  h.render({ title: "Saved" });
  h.render({ title: "First edit" });
  const result = h.render({ title: "Latest edit" });
  assert.equal(result.dirty, true);
  assert.equal(h.storage.size, 0, "the normal draft debounce has not elapsed");
  let prevented = 0;
  h.dispatch("beforeunload", { preventDefault() { prevented++; } });
  assert.equal(prevented, 1, "normal unsaved navigation remains protected");
  h.expire();
  const stored = JSON.parse(h.storage.get("synthetic-draft"));
  assert.equal(stored.version, 1);
  assert.equal(stored.baseline, JSON.stringify({ title: "Saved" }));
  assert.deepEqual(stored.value, { title: "Latest edit" });
  h.dispatch("beforeunload", { preventDefault() { assert.fail("expiry must not open an unload dialog"); } });
  h.dispatch("click", { get target() { assert.fail("expiry navigation should bypass the link guard"); } });
  assert.equal(result.confirmDiscard(), true);
  assert.equal(h.confirms(), 0);
  assert.ok(h.storage.has("synthetic-draft"), "expiry must not discard the recoverable draft");
  h.unmount();
  assert.equal(h.timers.size, 0);
});

test("clean forms and unavailable draft storage do not block session expiry", () => {
  for (const storageDenied of [false, true]) {
    const h = hookHarness({ storageDenied });
    h.render({ title: "Saved" });
    if (storageDenied) h.render({ title: "Unsaved" });
    assert.doesNotThrow(() => h.expire());
    h.dispatch("beforeunload", { preventDefault() { assert.fail("expiry must still proceed"); } });
    assert.equal(h.storage.size, 0);
    h.unmount();
  }
});
