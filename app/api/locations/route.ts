import { listLocations } from "./locationStore";

export async function GET() {
  try {
    return Response.json({ locations: await listLocations() });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не вдалося завантажити послуги відділень";
    return Response.json({ error: message }, { status: 500 });
  }
}
