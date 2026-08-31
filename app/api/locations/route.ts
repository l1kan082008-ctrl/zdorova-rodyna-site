import { listLocations } from "./locationStore";

export async function GET() {
  try {
    return Response.json({ locations: await listLocations() });
  } catch (error) {
    const incidentId = crypto.randomUUID();
    console.error(JSON.stringify({
      event: "public_locations_load_failed",
      incidentId,
      error: error instanceof Error ? error.message : "unknown",
    }));
    return Response.json(
      { error: "Не вдалося завантажити відділення.", incidentId },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
