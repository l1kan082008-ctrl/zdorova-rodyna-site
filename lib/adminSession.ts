export const ADMIN_SESSION_COOKIE = "zr_admin_session";

const encoder = new TextEncoder();
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createAdminSession(secret: string) {
  const payload = `v1.${Date.now() + SESSION_DURATION_MS}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifyAdminSession(token: string | undefined, secret: string) {
  if (!token || !secret) return false;
  const [version, expiresRaw, signature] = token.split(".");
  if (version !== "v1" || !expiresRaw || !signature) return false;
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires <= Date.now()) return false;
  const payload = `${version}.${expiresRaw}`;
  return constantTimeEqual(signature, await hmac(secret, payload));
}

export function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

export async function verifyAdminRequest(request: Request, secret: string) {
  return verifyAdminSession(readCookie(request, ADMIN_SESSION_COOKIE), secret);
}

export async function verifyAdminPassword(password: string, expectedPassword: string) {
  if (!password || !expectedPassword) return false;
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(password)),
    crypto.subtle.digest("SHA-256", encoder.encode(expectedPassword)),
  ]);
  return constantTimeEqual(toBase64Url(new Uint8Array(left)), toBase64Url(new Uint8Array(right)));
}

export function adminSessionCookie(token: string, secure: boolean) {
  return [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_DURATION_MS / 1000}`,
    secure ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export function expiredAdminSessionCookie(secure: boolean) {
  return [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : "",
  ].filter(Boolean).join("; ");
}
