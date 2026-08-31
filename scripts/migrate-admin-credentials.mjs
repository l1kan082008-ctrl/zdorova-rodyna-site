import { readFile, writeFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { resolve } from "node:path";

const PBKDF2_ITERATIONS = 100_000;
const encoder = new TextEncoder();

function randomBase64Url(bytes) {
  const value = new Uint8Array(bytes);
  webcrypto.getRandomValues(value);
  return Buffer.from(value).toString("base64url");
}

async function passwordHash(password) {
  const salt = new Uint8Array(16);
  webcrypto.getRandomValues(salt);
  const key = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await webcrypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return [
    "pbkdf2-sha256",
    PBKDF2_ITERATIONS,
    Buffer.from(salt).toString("base64url"),
    Buffer.from(hash).toString("base64url"),
  ].join("$");
}

const projectRoot = process.cwd();
const devVarsPath = resolve(projectRoot, ".dev.vars");
const credentialPath = resolve(projectRoot, ".admin-credentials.local");
const existing = await readFile(devVarsPath, "utf8").catch(() => "");
const retained = existing
  .split(/\r?\n/)
  .filter((line) => !/^\s*ADMIN_(PASSWORD|PASSWORD_HASH|SESSION_SECRET)\s*=/.test(line))
  .filter((line, index, lines) => line || index < lines.length - 1);

const password = randomBase64Url(32);
const sessionSecret = randomBase64Url(48);
const hash = await passwordHash(password);
const nextVars = [
  ...retained,
  `ADMIN_PASSWORD_HASH=${hash}`,
  `ADMIN_SESSION_SECRET=${sessionSecret}`,
  "",
].join("\n");
const credentialNotice = [
  "ЗДОРОВА РОДИНА — АДМІНПАНЕЛЬ",
  "",
  "URL=https://zdorova-rodyna-site.zdorova-rodyna.workers.dev/admin/login",
  `PASSWORD=${password}`,
  "",
  "Перенесіть пароль у менеджер паролів і видаліть цей файл.",
  "",
].join("\n");

await writeFile(devVarsPath, nextVars, { encoding: "utf8", mode: 0o600 });
await writeFile(credentialPath, credentialNotice, { encoding: "utf8", mode: 0o600 });
console.log("Admin credentials rotated. Plaintext password was written only to .admin-credentials.local.");
