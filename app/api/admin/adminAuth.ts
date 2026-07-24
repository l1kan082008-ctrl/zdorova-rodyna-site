import { env } from "cloudflare:workers";

export function isAuthorizedAdmin(request: Request) {
  const hostname = new URL(request.url).hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;

  const email =
    request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() ??
    "";
  const runtimeEnv = env as unknown as { ADMIN_EMAILS?: string };
  const allowedEmails = (runtimeEnv.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(email && allowedEmails.includes(email));
}

export function unauthorizedAdminResponse() {
  return Response.json(
    {
      error:
        "Адмін-доступ не налаштовано. Додайте адресу адміністратора до ADMIN_EMAILS.",
    },
    { status: 403 },
  );
}
