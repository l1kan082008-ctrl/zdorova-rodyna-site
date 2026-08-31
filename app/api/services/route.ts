import { listManagedServices } from "./serviceStore";

export async function GET() {
  try {
    return Response.json({ services: await listManagedServices() });
  } catch (error) {
    const incidentId = crypto.randomUUID();
    console.error(JSON.stringify({
      event: "public_services_load_failed",
      incidentId,
      error: error instanceof Error ? error.message : "unknown",
    }));
    return Response.json(
      { error: "Не вдалося завантажити послуги.", incidentId },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
