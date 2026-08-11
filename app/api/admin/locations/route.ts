import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  createLocation,
  deleteLocation,
  listLocations,
  updateLocation,
} from "../../locations/locationStore";
import type { CenterLocation } from "../../../contacts/locationData";

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();
  try {
    return Response.json({ locations: await listLocations() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося завантажити відділення." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();
  try {
    const payload = (await request.json()) as Partial<CenterLocation>;
    const location = await createLocation(payload);
    return Response.json({ location }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося створити відділення." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();
  try {
    const payload = (await request.json()) as Partial<CenterLocation> & { id?: string };
    if (!payload.id) return Response.json({ error: "Не вказано відділення." }, { status: 400 });
    const location = await updateLocation(payload.id, payload);
    return Response.json({ location });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося зберегти відділення." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Не вказано відділення." }, { status: 400 });
  try {
    await deleteLocation(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося видалити відділення." }, { status: 400 });
  }
}
