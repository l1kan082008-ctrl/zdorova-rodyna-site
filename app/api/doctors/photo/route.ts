import { env } from "cloudflare:workers";
import { secureImageHeaders } from "@/lib/safeImage";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")?.trim() ?? "";
  if (!key || !key.startsWith("doctors/")) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = (env as unknown as { DOCTOR_MEDIA?: R2Bucket }).DOCTOR_MEDIA;
  if (!bucket) return new Response("Not found", { status: 404 });
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  secureImageHeaders(headers, "public, max-age=3600");
  return new Response(object.body, { headers });
}
