import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  createLocation,
  deleteLocation,
  listLocations,
  updateLocation,
} from "../../locations/locationStore";
import type { CenterLocation } from "../../../contacts/locationData";
import { readBoundedJson } from "@/lib/requestBody";
import { changedSnapshotFields, recordContentRevision } from "../revisions/revisionStore";

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    return Response.json({ locations: await listLocations() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося завантажити відділення." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = (await readBoundedJson(request, 256 * 1024)) as Partial<CenterLocation>;
    const location = await createLocation(payload);
    return Response.json({ location }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося створити відділення." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = (await readBoundedJson(request, 256 * 1024)) as Partial<CenterLocation> & { id?: string };
    if (!payload.id) return Response.json({ error: "Не вказано відділення." }, { status: 400 });
    const existing = (await listLocations()).find((location) => location.id === payload.id);
    if (!existing) return Response.json({ error: "Відділення не знайдено." }, { status: 404 });
    await recordContentRevision({
      entityType: "location",
      entityId: existing.id,
      entityLabel: existing.name,
      action: "update",
      snapshot: existing as unknown as Record<string, unknown>,
      changedFields: changedSnapshotFields(
        existing as unknown as Record<string, unknown>,
        { ...existing, ...payload } as unknown as Record<string, unknown>,
      ),
    });
    const location = await updateLocation(payload.id, payload);
    return Response.json({ location });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося зберегти відділення." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Не вказано відділення." }, { status: 400 });
  try {
    const existing = (await listLocations()).find((location) => location.id === id);
    if (!existing) return Response.json({ error: "Відділення не знайдено." }, { status: 404 });
    await recordContentRevision({
      entityType: "location",
      entityId: existing.id,
      entityLabel: existing.name,
      action: "delete",
      snapshot: existing as unknown as Record<string, unknown>,
      changedFields: ["record"],
    });
    await deleteLocation(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося видалити відділення." }, { status: 400 });
  }
}
