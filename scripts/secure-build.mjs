import { existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
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

const result = spawnSync(
  process.execPath,
  [resolve(projectRoot, "node_modules/vinext/dist/cli.js"), "build"],
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

if (result.error) throw result.error;
process.exit(result.status ?? 1);
