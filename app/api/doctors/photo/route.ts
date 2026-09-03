import { isTrustedBlobUrl } from "@/lib/mediaStorage";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")?.trim() ?? "";
  if (!isTrustedBlobUrl(key)) {
    return new Response("Not found", { status: 404 });
  }

  return Response.redirect(key, 307);
}
