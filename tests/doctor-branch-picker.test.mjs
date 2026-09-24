import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Exercise the real controlled picker handlers without a browser, API, or database.
function load(path, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected test dependency: ${name}`);
    return dependencies[name];
  }, loaded, loaded.exports);
  return loaded.exports;
}

const jsx = (type, props) => ({ type, props });
const branches = load("../lib/doctorBranches.ts");
const Picker = load("../app/admin/doctors/DoctorBranchPicker.tsx", {
  react: { useId: () => "branches-test" },
  "react/jsx-runtime": { jsx, jsxs: jsx },
  "@/lib/doctorBranches": branches,
  "./doctors.module.css": new Proxy({}, { get: (_, key) => key }),
}).default;

function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  return node && typeof node === "object" ? [node, ...nodes(node.props?.children)] : [];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  return node && typeof node === "object" ? text(node.props?.children) : String(node ?? "");
}
function render(value, options = {}) {
  const changes = [];
  const tree = Picker({ value, addresses: ["м. Рівне, вул. Перша, 1", "м. Рівне, вул. Друга, 2"], onChange: next => changes.push(next), ...options });
  return { tree, changes, options: nodes(tree).filter(node => node.type === "label"), controls: nodes(tree).filter(node => node.type === "input") };
}

test("selecting a second branch preserves the full first address and commas", () => {
  const view = render("м. Рівне, вул. Перша, 1");
  assert.equal(view.controls[0].props.checked, true);
  view.controls[1].props.onChange({ target: { checked: true } });
  assert.deepEqual(branches.splitDoctorBranches(view.changes[0]), ["м. Рівне, вул. Перша, 1", "м. Рівне, вул. Друга, 2"]);
});

test("removing one branch leaves the other selected and clear permits no branches", () => {
  const view = render("м. Рівне, вул. Перша, 1\nм. Рівне, вул. Друга, 2");
  view.controls[0].props.onChange({ target: { checked: false } });
  assert.equal(view.changes[0], "м. Рівне, вул. Друга, 2");
  nodes(view.tree).find(node => node.type === "button").props.onClick();
  assert.equal(view.changes[1], "");
  const empty = render("");
  assert.ok(empty.controls.every(control => !control.props.checked));
  assert.equal(nodes(empty.tree).find(node => node.type === "button").props.disabled, true);
});

test("a saved address missing from the refreshed list survives further selections", () => {
  const legacy = "м. Рівне, старий запис, каб. 201";
  const loading = render(legacy, { loading: true, addresses: [] });
  assert.equal(loading.controls[0].props.checked, true);
  assert.deepEqual(loading.changes, []);
  const loaded = render(legacy);
  assert.equal(loaded.options.length, 3);
  assert.match(text(loaded.options[2]), /Збережена адреса/);
  loaded.controls[1].props.onChange({ target: { checked: true } });
  assert.deepEqual(branches.splitDoctorBranches(loaded.changes[0]), [legacy, "м. Рівне, вул. Друга, 2"]);
});

test("loading and saving disable all controls while error fallback stays selectable", () => {
  for (const state of [{ loading: true }, { disabled: true }]) {
    assert.equal(render("", state).tree.props.disabled, true);
  }
  const fallback = render("", { error: "Не вдалося оновити відділення. Показано базовий список адрес." });
  assert.equal(fallback.tree.props.disabled, false);
  assert.match(text(fallback.tree), /Показано базовий список/);
  fallback.controls[0].props.onChange({ target: { checked: true } });
  assert.equal(fallback.changes.length, 1);
});

test("duplicate addresses do not create duplicate controls and empty lists are explained", () => {
  const view = render("м. Рівне, вул. Перша, 1", { addresses: ["м. Рівне, вул. Перша, 1", "м. Рівне, вул. Перша, 1", ""] });
  assert.equal(view.controls.length, 1);
  const empty = render("", { addresses: [] });
  assert.match(text(empty.tree), /Список відділень порожній/);
  assert.equal(empty.controls.length, 0);
});

test("legacy case and spacing match a published address without a duplicate or losing other branches", () => {
  const oldAddress = "М. РІВНЕ,  вул. Перша, 1";
  const unknown = "м. Рівне, збережена адреса, 7";
  const view = render(`${oldAddress}\n${unknown}`);
  assert.equal(view.controls.length, 3);
  assert.equal(view.controls[0].props.checked, true);
  view.controls[1].props.onChange({ target: { checked: true } });
  assert.deepEqual(branches.splitDoctorBranches(view.changes[0]), [oldAddress, unknown, "м. Рівне, вул. Друга, 2"]);
  view.controls[0].props.onChange({ target: { checked: false } });
  assert.equal(view.changes[1], unknown);
});
