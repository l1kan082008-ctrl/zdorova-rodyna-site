import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  listDoctors,
  updateDoctor,
} from "../../doctors/doctorStore";
import type { DoctorSchedule } from "../../../doctors/doctorData";

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();

  try {
    return Response.json({ doctors: await listDoctors() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося завантажити лікарів";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthorizedAdmin(request)) return unauthorizedAdminResponse();

  try {
    const payload = (await request.json()) as {
      id?: string;
      specialty?: string;
      experienceYears?: number | null;
      branch?: string;
      description?: string;
      schedule?: DoctorSchedule;
    };

    const id = payload.id?.trim() ?? "";
    const specialty = payload.specialty?.trim() ?? "";
    if (!id || !specialty) {
      return Response.json(
        { error: "Лікар і спеціальність є обов’язковими" },
        { status: 400 },
      );
    }

    const updated = await updateDoctor(id, {
      specialty,
      experienceYears:
        typeof payload.experienceYears === "number"
          ? Math.max(0, Math.round(payload.experienceYears))
          : null,
      branch: payload.branch?.trim() ?? "",
      description: payload.description?.trim() ?? "",
      schedule: payload.schedule ?? {},
    });

    if (!updated) {
      return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
    }

    return Response.json({ doctors: await listDoctors() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося зберегти зміни";
    return Response.json({ error: message }, { status: 500 });
  }
}
