import { listManagedServices } from "./serviceStore";

export async function GET() {
  try {
    return Response.json({ services: await listManagedServices() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося завантажити послуги." }, { status: 500 });
  }
}

