import { env } from "cloudflare:workers";
import {
  adminSessionCookie,
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  createAdminSession,
  ensureAdminSecuritySchema,
  expiredAdminSessionCookie,
  isTrustedAdminMutation,
  recordFailedAdminLogin,
  revokeAdminSession,
  verifyAdminPassword,
} from "../../../../lib/adminSession";

type AdminEnv = {
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_SESSION_SECRET?: string;
  DB?: D1Database;
};

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
};

async function readBoundedJson(request: Request, maximumBytes = 2_048) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return null;
  }
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel("request body too large");
        return null;
      }
      chunks.push(value);
    }
    const body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(body)) as unknown;
  } catch {
    return null;
  }
}

function passwordFromBody(body: unknown) {
  if (!body || typeof body !== "object" || !("password" in body)) return "";
  const password = (body as { password?: unknown }).password;
  return typeof password === "string" ? password : "";
}

function jsonError(error: string, status: number, extraHeaders?: HeadersInit) {
  return Response.json({ error }, {
    status,
    headers: { ...responseHeaders, ...extraHeaders },
  });
}

export async function POST(request: Request) {
  if (!isTrustedAdminMutation(request)) {
    return jsonError("Запит відхилено.", 403);
  }

  const runtimeEnv = env as unknown as AdminEnv;
  if (!runtimeEnv.ADMIN_PASSWORD_HASH || !runtimeEnv.ADMIN_SESSION_SECRET || !runtimeEnv.DB) {
    return jsonError("Вхід адміністратора ще не налаштовано.", 503);
  }

  await ensureAdminSecuritySchema(runtimeEnv.DB);
  const rateLimit = await checkAdminLoginRateLimit(
    request,
    runtimeEnv.ADMIN_SESSION_SECRET,
    runtimeEnv.DB,
  );
  if (!rateLimit.allowed) {
    console.warn(JSON.stringify({ event: "admin_login_rate_limited" }));
    return jsonError("Забагато спроб. Спробуйте пізніше.", 429, {
      "Retry-After": String(rateLimit.retryAfter),
    });
  }

  const password = passwordFromBody(await readBoundedJson(request));
  const allowed = await verifyAdminPassword(password, runtimeEnv.ADMIN_PASSWORD_HASH);
  if (!allowed) {
    const failure = await recordFailedAdminLogin(rateLimit.fingerprint, runtimeEnv.DB);
    console.warn(JSON.stringify({ event: "admin_login_failed" }));
    if (failure.blocked) {
      return jsonError("Забагато спроб. Спробуйте пізніше.", 429, {
        "Retry-After": String(failure.retryAfter),
      });
    }
    return jsonError("Невірні дані для входу.", 401);
  }

  await clearAdminLoginFailures(rateLimit.fingerprint, runtimeEnv.DB);
  const token = await createAdminSession(runtimeEnv.ADMIN_SESSION_SECRET, runtimeEnv.DB);
  console.info(JSON.stringify({ event: "admin_login_succeeded" }));
  return Response.json({ ok: true }, {
    status: 200,
    headers: {
      ...responseHeaders,
      "Set-Cookie": adminSessionCookie(token),
    },
  });
}

export async function DELETE(request: Request) {
  if (!isTrustedAdminMutation(request)) {
    return jsonError("Запит відхилено.", 403);
  }
  const runtimeEnv = env as unknown as AdminEnv;
  try {
    await revokeAdminSession(request, runtimeEnv.DB);
  } catch (error) {
    console.error(JSON.stringify({
      event: "admin_logout_revoke_failed",
      error: error instanceof Error ? error.message : "unknown",
    }));
  }
  return new Response(null, {
    status: 204,
    headers: {
      ...responseHeaders,
      "Set-Cookie": expiredAdminSessionCookie(),
    },
  });
}
