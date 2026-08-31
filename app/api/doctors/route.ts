import { getDoctorById, listDoctors } from "./doctorStore";

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (id) {
      const doctor = await getDoctorById(id);
      if (!doctor) {
        return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
      }
      return Response.json({ doctor });
    }

    return Response.json({ doctors: await listDoctors() });
  } catch (error) {
    const incidentId = crypto.randomUUID();
    console.error(JSON.stringify({
      event: "public_doctors_load_failed",
      incidentId,
      error: error instanceof Error ? error.message : "unknown",
    }));
    return Response.json(
      { error: "Не вдалося завантажити лікарів.", incidentId },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
