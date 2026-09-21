import { getSiteSettings } from "./settingsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ settings: await getSiteSettings() }, {
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
