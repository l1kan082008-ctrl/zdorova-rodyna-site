import { env } from "cloudflare:workers";

import { isTrustedAdminMutation, verifyAdminRequest } from "@/lib/adminSession";

export async function isAuthorizedAdmin(request: Request) {
  const runtimeEnv = env as unknown as {
    ADMIN_SESSION_SECRET?: string;
    DB?: D1Database;
  };
  if (!isTrustedAdminMutation(request)) return false;
  return verifyAdminRequest(request, runtimeEnv.ADMIN_SESSION_SECRET, runtimeEnv.DB);
}

export function unauthorizedAdminResponse() {
  return Response.json(
    { error: "Потрібно увійти до адмінпанелі." },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
