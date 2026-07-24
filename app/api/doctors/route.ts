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
    const message =
      error instanceof Error ? error.message : "Не вдалося завантажити лікарів";
    return Response.json({ error: message }, { status: 500 });
  }
}
