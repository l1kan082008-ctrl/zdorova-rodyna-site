import { env } from "@/lib/runtimeEnv";
import type { AppDatabase } from "@/lib/database";
export { isSameOriginSubmission } from "./requestOrigin";

type SubmissionRateRow = {
  attempts: number;
  window_started_at: number;
  blocked_until: number;
};

type SubmissionSecurityEnv = {
  DB?: AppDatabase;
  ADMIN_SESSION_SECRET?: string;
  PUBLIC_FORM_RATE_LIMIT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
};

type RateLimitOptions = {
  scope?: string;
  windowMs?: number;
  blockMs?: number;
  maxAttempts?: number;
};

function runtimeEnv() {
  return env as unknown as SubmissionSecurityEnv;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function fingerprint(request: Request, secret: string, scope: string) {
  const address = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "local";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${scope}:${address}`),
  );
  return toBase64Url(new Uint8Array(signature));
}

async function ensureRateLimitTable(db: AppDatabase) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS public_submission_attempts (
      fingerprint TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL,
      window_started_at INTEGER NOT NULL,
      blocked_until INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS public_submission_attempts_updated_idx
    ON public_submission_attempts (updated_at)
  `).run();
}

export async function checkPublicSubmissionRateLimit(
  request: Request,
  options: RateLimitOptions = {},
) {
  const configured = runtimeEnv();
  const db = configured.DB;
  const secret = configured.PUBLIC_FORM_RATE_LIMIT_SECRET
    ?? configured.ADMIN_SESSION_SECRET;
  if (!db || !secret) return { allowed: false, retryAfter: 60, configured: false };

  const scope = options.scope ?? "public-booking";
  if (!/^[a-z0-9-]{1,48}$/u.test(scope)) {
    throw new Error("Invalid rate-limit scope.");
  }
  const windowMs = Math.max(60_000, Math.min(options.windowMs ?? 10 * 60 * 1000, 24 * 60 * 60 * 1000));
  const blockMs = Math.max(60_000, Math.min(options.blockMs ?? 30 * 60 * 1000, 24 * 60 * 60 * 1000));
  const maxAttempts = Math.max(1, Math.min(options.maxAttempts ?? 6, 100));

  await ensureRateLimitTable(db);
  const id = await fingerprint(request, secret, scope);
  const now = Date.now();
  const row = await db.prepare(`
    SELECT attempts, window_started_at, blocked_until
    FROM public_submission_attempts
    WHERE fingerprint = ?
  `).bind(id).first<SubmissionRateRow>();
  if (row?.blocked_until && row.blocked_until > now) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((row.blocked_until - now) / 1000)),
    };
  }

  await db.batch([
    db.prepare(`
      INSERT INTO public_submission_attempts (
        fingerprint, attempts, window_started_at, blocked_until, updated_at
      ) VALUES (?, 1, ?, 0, ?)
      ON CONFLICT(fingerprint) DO UPDATE SET
        attempts = CASE
          WHEN excluded.updated_at - public_submission_attempts.window_started_at < ${windowMs}
            THEN public_submission_attempts.attempts + 1
          ELSE 1
        END,
        window_started_at = CASE
          WHEN excluded.updated_at - public_submission_attempts.window_started_at < ${windowMs}
            THEN public_submission_attempts.window_started_at
          ELSE excluded.updated_at
        END,
        blocked_until = CASE
          WHEN (
            CASE
              WHEN excluded.updated_at - public_submission_attempts.window_started_at < ${windowMs}
                THEN public_submission_attempts.attempts + 1
              ELSE 1
            END
          ) > ${maxAttempts}
            THEN excluded.updated_at + ${blockMs}
          ELSE 0
        END,
        updated_at = excluded.updated_at
    `).bind(id, now, now),
    db.prepare("DELETE FROM public_submission_attempts WHERE updated_at < ?")
      .bind(now - 7 * 24 * 60 * 60 * 1000),
  ]);

  const updated = await db.prepare(`
    SELECT attempts, window_started_at, blocked_until
    FROM public_submission_attempts
    WHERE fingerprint = ?
  `).bind(id).first<SubmissionRateRow>();
  const blockedUntil = updated?.blocked_until ?? 0;
  return {
    allowed: blockedUntil <= now,
    retryAfter: blockedUntil > now ? Math.ceil((blockedUntil - now) / 1000) : 0,
    configured: true,
  };
}

export async function verifyTurnstileIfConfigured(
  request: Request,
  token: string,
) {
  const secret = runtimeEnv().TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token || token.length > 2_048) return false;

  const remoteip = request.headers.get("cf-connecting-ip") ?? undefined;
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip,
        idempotency_key: crypto.randomUUID(),
      }),
      signal: AbortSignal.timeout(5_000),
    },
  );
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean; hostname?: string };
  return result.success === true
    && (!result.hostname || result.hostname === new URL(request.url).hostname);
}
