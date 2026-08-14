import { env } from "cloudflare:workers";
import {
  adminSessionCookie,
  createAdminSession,
  expiredAdminSessionCookie,
  verifyAdminPassword,
} from "../../../../lib/adminSession";

type AdminEnv = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

function isSecure(request: Request) {
  return new URL(request.url).protocol === "https:";
}

export async function POST(request: Request) {
  const runtimeEnv = env as unknown as AdminEnv;
  if (!runtimeEnv.ADMIN_PASSWORD || !runtimeEnv.ADMIN_SESSION_SECRET) {
    return Response.json(
      { error: "Вхід адміністратора ще не налаштовано." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null) as { password?: string } | null;
  const allowed = await verifyAdminPassword(body?.password ?? "", runtimeEnv.ADMIN_PASSWORD);
  if (!allowed) {
    return Response.json({ error: "Невірний пароль." }, { status: 401 });
  }

  const token = await createAdminSession(runtimeEnv.ADMIN_SESSION_SECRET);
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": adminSessionCookie(token, isSecure(request)) },
  });
}

export async function DELETE(request: Request) {
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": expiredAdminSessionCookie(isSecure(request)) },
  });
}
