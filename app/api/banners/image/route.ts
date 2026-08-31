import { env } from "cloudflare:workers";
import { secureImageHeaders } from "@/lib/safeImage";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")?.trim() ?? "";
  if (!key || !key.startsWith("banners/")) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.DOCTOR_MEDIA.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  secureImageHeaders(headers, "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
