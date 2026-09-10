import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, ".next");
const forbiddenNames = new Set([
  ".dev.vars",
  ".env",
  ".env.local",
  ".env.production",
  ".admin-credentials.local",
]);

function removeForbiddenFiles(directory) {
  if (!existsSync(directory)) return [];
  const removed = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      removed.push(...removeForbiddenFiles(path));
    } else if (forbiddenNames.has(entry.name) || entry.name.startsWith(".env.")) {
      rmSync(path, { force: true });
      removed.push(path);
    }
  }
  return removed;
}

// A restored compiler cache must not supply CSS from an earlier release.
const cacheRoot = resolve(outputRoot, "cache");
if (cacheRoot !== resolve(projectRoot, ".next", "cache")) throw new Error("Invalid cache path");
rmSync(cacheRoot, { recursive: true, force: true });

const result = spawnSync(
  process.execPath,
  [resolve(projectRoot, "node_modules/next/dist/bin/next"), "build"],
  { cwd: projectRoot, stdio: "inherit", shell: false },
);

const removed = removeForbiddenFiles(outputRoot);
if (removed.length) {
  console.warn(`Removed ${removed.length} secret-bearing file(s) from the build output.`);
}

const remaining = existsSync(outputRoot)
  ? removeForbiddenFiles(outputRoot)
  : [];
if (remaining.length) {
  console.error("Build output still contains forbidden secret files.");
  process.exit(1);
}

if (result.status === 0) {
  const staticRoot = resolve(outputRoot, "static");
  const css = readdirSync(staticRoot, { recursive: true })
    .filter(name => name.endsWith(".css"))
    .map(name => readFileSync(resolve(staticRoot, name), "utf8")).join("\n");
  for (const selector of [".ultrasound-price-list", ".ultrasound-price-head", ".ultrasound-description-toggle"]) {
    if (!css.includes(selector)) throw new Error(`Missing published CSS: ${selector}`);
  }
}
if (result.error) throw result.error;
process.exit(result.status ?? 1);
