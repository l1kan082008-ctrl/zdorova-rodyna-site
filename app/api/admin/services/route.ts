import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  createManagedService,
  deleteManagedService,
  listManagedServices,
  updateManagedService,
  type ManagedService,
} from "../../services/serviceStore";
import { readBoundedJson } from "@/lib/requestBody";

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    return Response.json({ services: await listManagedServices({ includeInactive: true }) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося завантажити послуги." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const service = await createManagedService((await readBoundedJson(request, 128 * 1024)) as Partial<ManagedService>);
    return Response.json({ service }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося створити послугу." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = (await readBoundedJson(request, 128 * 1024)) as Partial<ManagedService> & { id?: string };
    if (!payload.id) return Response.json({ error: "Не вказано послугу." }, { status: 400 });
    return Response.json({ service: await updateManagedService(payload.id, payload) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося зберегти послугу." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Не вказано послугу." }, { status: 400 });
  try {
    await deleteManagedService(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося видалити послугу." }, { status: 400 });
  }
}
