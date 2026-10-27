import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Execute the real preference helpers, server layout and shell lifecycle with
// in-memory browser boundaries. No session credentials, network or database.
function load(path, dependencies = {}, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } });
  const loadedModule = { exports: {} };
  const require = id => {
    if (!(id in dependencies)) throw new Error(`Unexpected dependency: ${id}`);
    return dependencies[id];
  };
  new Function("require", "module", "exports", ...Object.keys(globals), outputText)(
    require, loadedModule, loadedModule.exports, ...Object.values(globals),
  );
  return loadedModule.exports;
}

const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: Symbol("Fragment") };
const noBrowser = load("../app/admin/adminTheme.ts", {}, { window: undefined, document: undefined });

function browser({ protocol = "http:", cookieDenied = false, previousTheme } = {}) {
  const writes = [];
  const attributes = new Map(previousTheme === undefined ? [] : [["data-admin-theme", previousTheme]]);
  const document = {
    documentElement: {
      style: {},
      getAttribute: key => attributes.get(key) ?? null,
      setAttribute: (key, value) => attributes.set(key, value),
      removeAttribute: key => attributes.delete(key),
    },
    body: { style: {} },
    get cookie() { return writes.at(-1)?.split(";")[0] ?? ""; },
    set cookie(value) {
      if (cookieDenied) throw new Error("Cookies unavailable");
      writes.push(value);
    },
  };
  const window = { location: { protocol }, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
  return { document, window, writes, attributes };
}

function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== "object") return [];
  return [node, ...nodes(node.props?.children)];
}

function shellHarness(options = {}) {
  const context = browser(options);
  const preference = load("../app/admin/adminTheme.ts", {}, context);
  const slots = [], effects = [], pendingEffects = [];
  let cursor = 0;
  const useEffect = (effect, deps) => {
    const index = cursor++;
    const previous = effects[index];
    if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
      pendingEffects.push(() => {
        previous?.cleanup?.();
        effects[index] = { deps, cleanup: effect() };
      });
    }
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useSyncExternalStore() { cursor++; return false; },
    useEffect,
    useLayoutEffect: useEffect,
  };
  const styles = new Proxy({}, { get: (_target, property) => String(property) });
  const { AdminThemeToggle } = load("../app/admin/AdminThemeToggle.tsx", {
    "react/jsx-runtime": jsx, "./AdminShell.module.css": { default: styles },
  });
  const { default: AdminShell } = load("../app/admin/AdminShell.tsx", {
    react,
    "react/jsx-runtime": jsx,
    "next/link": { default: Symbol("Link") },
    "next/navigation": { usePathname: () => options.pathname ?? "/admin/bookings", useRouter: () => ({}) },
    "../components/useModalDialog": { useModalDialog() {} },
    "./AdminThemeToggle": { AdminThemeToggle },
    "./adminTheme": preference,
    "./admin-ui.css": {}, "./admin-legacy-theme.css": {},
    "./AdminShell.module.css": { default: styles },
  }, context);
  let tree;
  function render() {
    cursor = 0;
    tree = AdminShell({ initialTheme: options.initialTheme, children: "Synthetic admin content" });
    while (pendingEffects.length) pendingEffects.shift()();
    return tree;
  }
  function toggle() {
    const boundary = nodes(tree).find(node => node.type === AdminThemeToggle);
    assert.ok(boundary, "the theme control exists on this admin surface");
    const button = AdminThemeToggle(boundary.props);
    assert.equal(button.type, "button");
    assert.equal(button.props.type, "button");
    assert.equal(button.props.role, "switch");
    assert.equal(button.props["aria-label"], "Темна тема");
    return button;
  }
  return {
    ...context, render, toggle,
    unmount() { effects.forEach(effect => effect.cleanup?.()); },
  };
}

test("admin theme accepts only the explicit dark preference", () => {
  assert.equal(noBrowser.resolveAdminTheme("dark"), "dark");
  for (const value of [undefined, null, "", "light", "Dark", " dark ", "system", true, {}, 0]) {
    assert.equal(noBrowser.resolveAdminTheme(value), "light");
  }
  assert.doesNotThrow(() => noBrowser.persistAdminTheme("dark"));
});

test("theme cookie is scoped to admin and secure only on HTTPS", () => {
  for (const protocol of ["http:", "https:"]) {
    const context = browser({ protocol });
    const preference = load("../app/admin/adminTheme.ts", {}, context);
    preference.persistAdminTheme("dark");
    const parts = context.writes[0].split(";").map(value => value.trim());
    assert.deepEqual(parts.filter(part => part !== "Secure"), [
      "zr_admin_theme=dark", "Path=/admin", "Max-Age=31536000", "SameSite=Lax",
    ]);
    assert.equal(parts.includes("Secure"), protocol === "https:");
    preference.persistAdminTheme("light");
    assert.match(context.writes[1], /^zr_admin_theme=light;/);
  }
});

test("server admin layout restores the preference without reading the session cookie", async () => {
  for (const value of [undefined, "dark", "light", "invalid"]) {
    const reads = [];
    const shell = Symbol("AdminShell");
    const { default: AdminLayout } = load("../app/admin/layout.tsx", {
      "react/jsx-runtime": jsx,
      "next/headers": { cookies: async () => ({ get: name => { reads.push(name); return value === undefined ? undefined : { value }; } }) },
      "./AdminShell": { default: shell },
      "./adminTheme": noBrowser,
    });
    const output = await AdminLayout({ children: "Synthetic admin content" });
    assert.equal(output.type, shell);
    assert.equal(output.props.initialTheme, value === "dark" ? "dark" : "light");
    assert.deepEqual(reads, ["zr_admin_theme"]);
  }
});

test("switch updates the admin surface, portal root and persisted preference", () => {
  const h = shellHarness();
  assert.equal(h.render().props["data-admin-theme"], "light");
  assert.equal(h.toggle().props["aria-checked"], false);
  h.toggle().props.onClick();
  assert.equal(h.render().props["data-admin-theme"], "dark");
  assert.equal(h.attributes.get("data-admin-theme"), "dark");
  assert.equal(h.toggle().props["aria-checked"], true);
  assert.match(h.writes[0], /^zr_admin_theme=dark;/);
  h.toggle().props.onClick();
  assert.equal(h.render().props["data-admin-theme"], "light");
  assert.equal(h.attributes.get("data-admin-theme"), "light");
  assert.equal(h.toggle().props["aria-checked"], false);
  assert.match(h.writes[1], /^zr_admin_theme=light;/);
  h.unmount();
  assert.equal(h.attributes.has("data-admin-theme"), false, "public pages do not retain the admin theme attribute");
});

test("blocked cookies do not prevent switching in this visit", () => {
  const h = shellHarness({ cookieDenied: true, initialTheme: "dark" });
  h.render();
  assert.doesNotThrow(() => h.toggle().props.onClick());
  assert.equal(h.render().props["data-admin-theme"], "light");
  assert.equal(h.attributes.get("data-admin-theme"), "light");
  assert.equal(h.writes.length, 0);
  h.unmount();
});

test("login uses the same accessible theme switch and restores any prior root attribute", () => {
  const h = shellHarness({ pathname: "/admin/login", initialTheme: "dark", previousTheme: "outer-value" });
  const tree = h.render();
  assert.equal(tree.props["data-admin-theme"], "dark");
  assert.equal(h.attributes.get("data-admin-theme"), "dark");
  assert.equal(nodes(tree).some(node => node.type === "nav"), false);
  assert.equal(h.toggle().props["aria-checked"], true);
  h.toggle().props.onClick();
  h.render();
  h.unmount();
  assert.equal(h.attributes.get("data-admin-theme"), "outer-value");
});
