import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const allowed = new Set(["ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET"]);
const name = process.argv[2];
if (!allowed.has(name)) throw new Error("Unsupported secret name.");
const source = await readFile(resolve(process.cwd(), ".dev.vars"), "utf8");
const line = source.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
if (!line) throw new Error(`${name} is missing.`);
process.stdout.write(line.slice(name.length + 1));
