import { env } from "cloudflare:workers";

import { verifyAdminRequest } from "@/lib/adminSession";

export async function isAuthorizedAdmin(request: Request) {
  const runtimeEnv = env as unknown as { ADMIN_SESSION_SECRET?: string };
  return verifyAdminRequest(request, runtimeEnv.ADMIN_SESSION_SECRET);
}

export function unauthorizedAdminResponse() {
  return Response.json(
    { error: "Потрібно увійти до адмінпанелі." },
    { status: 401 },
  );
}
