export const ADMIN_SESSION_COOKIE = "__Host-zr_admin_session";

const encoder = new TextEncoder();
const PASSWORD_HASH_PREFIX = "pbkdf2-sha256";
// Cloudflare Workers Web Crypto currently caps PBKDF2 at 100,000 iterations.
// The generated admin password has 256 bits of entropy in addition to this KDF.
const PASSWORD_HASH_ITERATIONS = 100_000;
const PASSWORD_HASH_BYTES = 32;
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const SESSION_IDLE_DURATION_MS = 30 * 60 * 1000;
const SESSION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_BLOCK_MS = 30 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

type LoginRateLimitRow = {
  attempts: number;
  window_started_at: number;
  blocked_until: number;
};

type SessionRow = {
  expires_at: number;
  idle_expires_at: number;
  last_seen_at: number;
};

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  try {
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function secureRandomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function sha256(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function hmacBytes(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function hmac(secret: string, value: string) {
  return toBase64Url(await hmacBytes(secret, value));
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.byteLength !== right.byteLength) return false;
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (first: ArrayBufferView, second: ArrayBufferView) => boolean;
  };
  if (subtle.timingSafeEqual) return subtle.timingSafeEqual(left, right);
  let difference = 0;
  for (let index = 0; index < left.byteLength; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    PASSWORD_HASH_BYTES * 8,
  ));
}

export async function hashAdminPassword(password: string) {
  if (password.length < 16 || password.length > 256) {
    throw new Error("Admin password must contain between 16 and 256 characters.");
  }
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const hash = await derivePasswordHash(password, salt, PASSWORD_HASH_ITERATIONS);
  return [
    PASSWORD_HASH_PREFIX,
    PASSWORD_HASH_ITERATIONS,
    toBase64Url(salt),
    toBase64Url(hash),
  ].join("$");
}

export async function verifyAdminPassword(password: string, encodedHash: string) {
  if (!password || password.length > 256 || !encodedHash) return false;
  const [prefix, iterationsRaw, saltRaw, expectedRaw, ...extra] = encodedHash.split("$");
  const iterations = Number(iterationsRaw);
  const salt = saltRaw ? fromBase64Url(saltRaw) : null;
  const expected = expectedRaw ? fromBase64Url(expectedRaw) : null;
  if (
    prefix !== PASSWORD_HASH_PREFIX ||
    extra.length > 0 ||
    iterations !== PASSWORD_HASH_ITERATIONS ||
    !salt ||
    salt.byteLength !== 16 ||
    !expected ||
    expected.byteLength !== PASSWORD_HASH_BYTES
  ) {
    return false;
  }
  const actual = await derivePasswordHash(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}

export async function ensureAdminSecuritySchema(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token_hash TEXT PRIMARY KEY,
        expires_at INTEGER NOT NULL,
        idle_expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        last_seen_at INTEGER NOT NULL
      )
    `),
    db.prepare(`
      CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx
      ON admin_sessions (expires_at)
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS admin_login_attempts (
        fingerprint TEXT PRIMARY KEY,
        attempts INTEGER NOT NULL,
        window_started_at INTEGER NOT NULL,
        blocked_until INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `),
    db.prepare(`
      CREATE INDEX IF NOT EXISTS admin_login_attempts_updated_idx
      ON admin_login_attempts (updated_at)
    `),
  ]);
}

export async function createAdminSession(secret: string, db: D1Database) {
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;
  const sessionId = secureRandomToken();
  const payload = `v2.${sessionId}.${expiresAt}`;
  const tokenHash = toBase64Url(await sha256(sessionId));
  await db.batch([
    db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ? OR idle_expires_at <= ?")
      .bind(now, now),
    db.prepare(`
      INSERT INTO admin_sessions (
        token_hash, expires_at, idle_expires_at, created_at, last_seen_at
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      tokenHash,
      expiresAt,
      Math.min(expiresAt, now + SESSION_IDLE_DURATION_MS),
      now,
      now,
    ),
  ]);
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifyAdminSession(
  token: string | undefined,
  secret: string | undefined,
  db: D1Database | undefined,
) {
  if (!token || token.length > 512 || !secret || !db) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, sessionId, expiresRaw, signatureRaw] = parts;
  if (
    version !== "v2" ||
    !/^[A-Za-z0-9_-]{43}$/.test(sessionId) ||
    !/^\d{13}$/.test(expiresRaw) ||
    !/^[A-Za-z0-9_-]{43}$/.test(signatureRaw)
  ) {
    return false;
  }
  const expiresAt = Number(expiresRaw);
  const now = Date.now();
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  const payload = `${version}.${sessionId}.${expiresRaw}`;
  const suppliedSignature = fromBase64Url(signatureRaw);
  if (!suppliedSignature) return false;
  const expectedSignature = await hmacBytes(secret, payload);
  if (!timingSafeEqual(suppliedSignature, expectedSignature)) return false;

  const tokenHash = toBase64Url(await sha256(sessionId));
  try {
    const row = await db.prepare(`
      SELECT expires_at, idle_expires_at, last_seen_at
      FROM admin_sessions
      WHERE token_hash = ?
    `).bind(tokenHash).first<SessionRow>();
    if (!row || row.expires_at !== expiresAt) return false;
    if (row.expires_at <= now || row.idle_expires_at <= now) {
      await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
        .bind(tokenHash)
        .run();
      return false;
    }
    if (now - row.last_seen_at >= SESSION_REFRESH_INTERVAL_MS) {
      await db.prepare(`
        UPDATE admin_sessions
        SET last_seen_at = ?, idle_expires_at = ?
        WHERE token_hash = ?
      `).bind(
        now,
        Math.min(row.expires_at, now + SESSION_IDLE_DURATION_MS),
        tokenHash,
      ).run();
    }
    return true;
  } catch (error) {
    console.error(JSON.stringify({
      event: "admin_session_verification_failed",
      error: error instanceof Error ? error.message : "unknown",
    }));
    return false;
  }
}

export function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key !== name) continue;
    try {
      return decodeURIComponent(value.join("="));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function verifyAdminRequest(
  request: Request,
  secret: string | undefined,
  db: D1Database | undefined,
) {
  return verifyAdminSession(readCookie(request, ADMIN_SESSION_COOKIE), secret, db);
}

export async function revokeAdminSession(request: Request, db: D1Database | undefined) {
  const token = readCookie(request, ADMIN_SESSION_COOKIE);
  const parts = token?.split(".");
  const sessionId = parts?.length === 4 ? parts[1] : undefined;
  if (!db || !sessionId || !/^[A-Za-z0-9_-]{43}$/.test(sessionId)) return;
  const tokenHash = toBase64Url(await sha256(sessionId));
  await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
    .bind(tokenHash)
    .run();
}

export function isTrustedAdminMutation(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return true;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || (fetchSite && fetchSite !== "same-origin")) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function loginFingerprint(request: Request, secret: string) {
  const address = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "local";
  return hmac(secret, `admin-login:${address}`);
}

export async function checkAdminLoginRateLimit(
  request: Request,
  secret: string,
  db: D1Database,
) {
  const fingerprint = await loginFingerprint(request, secret);
  const now = Date.now();
  const row = await db.prepare(`
    SELECT attempts, window_started_at, blocked_until
    FROM admin_login_attempts
    WHERE fingerprint = ?
  `).bind(fingerprint).first<LoginRateLimitRow>();
  if (!row) return { allowed: true, fingerprint, retryAfter: 0 };
  if (row.blocked_until > now) {
    return {
      allowed: false,
      fingerprint,
      retryAfter: Math.max(1, Math.ceil((row.blocked_until - now) / 1000)),
    };
  }
  return { allowed: true, fingerprint, retryAfter: 0 };
}

export async function recordFailedAdminLogin(fingerprint: string, db: D1Database) {
  const now = Date.now();
  await db.batch([
    db.prepare(`
      INSERT INTO admin_login_attempts (
        fingerprint, attempts, window_started_at, blocked_until, updated_at
      ) VALUES (?, 1, ?, 0, ?)
      ON CONFLICT(fingerprint) DO UPDATE SET
        attempts = CASE
          WHEN excluded.updated_at - admin_login_attempts.window_started_at < ${LOGIN_WINDOW_MS}
            THEN admin_login_attempts.attempts + 1
          ELSE 1
        END,
        window_started_at = CASE
          WHEN excluded.updated_at - admin_login_attempts.window_started_at < ${LOGIN_WINDOW_MS}
            THEN admin_login_attempts.window_started_at
          ELSE excluded.updated_at
        END,
        blocked_until = CASE
          WHEN (
            CASE
              WHEN excluded.updated_at - admin_login_attempts.window_started_at < ${LOGIN_WINDOW_MS}
                THEN admin_login_attempts.attempts + 1
              ELSE 1
            END
          ) >= ${LOGIN_MAX_ATTEMPTS}
            THEN excluded.updated_at + ${LOGIN_BLOCK_MS}
          ELSE 0
        END,
        updated_at = excluded.updated_at
    `).bind(fingerprint, now, now),
    db.prepare("DELETE FROM admin_login_attempts WHERE updated_at < ?")
      .bind(now - 7 * 24 * 60 * 60 * 1000),
  ]);
  const result = await db.prepare(`
    SELECT attempts, window_started_at, blocked_until
    FROM admin_login_attempts
    WHERE fingerprint = ?
  `).bind(fingerprint).first<LoginRateLimitRow>();
  const blockedUntil = result?.blocked_until ?? 0;
  return {
    blocked: blockedUntil > now,
    retryAfter: blockedUntil > now ? Math.ceil((blockedUntil - now) / 1000) : 0,
  };
}

export async function clearAdminLoginFailures(fingerprint: string, db: D1Database) {
  await db.prepare("DELETE FROM admin_login_attempts WHERE fingerprint = ?")
    .bind(fingerprint)
    .run();
}

export function adminSessionCookie(token: string) {
  return [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Priority=High",
    `Max-Age=${SESSION_DURATION_MS / 1000}`,
  ].join("; ");
}

export function expiredAdminSessionCookie() {
  return [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Priority=High",
    "Max-Age=0",
  ].join("; ");
}
