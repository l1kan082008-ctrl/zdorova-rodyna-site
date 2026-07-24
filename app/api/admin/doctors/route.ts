import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  listDoctors,
  updateDoctor,
} from "../../doctors/doctorStore";
import type {
  DoctorAvailabilityStatus,
  DoctorPatientGroup,
  DoctorSchedule,
} from "../../../doctors/doctorData";

const availabilityStatuses = new Set<DoctorAvailabilityStatus>([
  "accepting",
  "by-confirmation",
  "paused",
]);
const patientGroupValues = new Set<DoctorPatientGroup>([
  "adults",
  "children",
]);

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
      biography?: string;
      patientGroups?: DoctorPatientGroup[];
      schedule?: DoctorSchedule;
      availabilityStatus?: DoctorAvailabilityStatus;
    };

    const id = payload.id?.trim() ?? "";
    const specialty = payload.specialty?.trim() ?? "";
    const availabilityStatus = availabilityStatuses.has(
      payload.availabilityStatus ?? "accepting",
    )
      ? (payload.availabilityStatus ?? "accepting")
      : "accepting";
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
      biography: payload.biography?.trim() ?? "",
      patientGroups: Array.isArray(payload.patientGroups)
        ? payload.patientGroups.filter((group) => patientGroupValues.has(group))
        : [],
      schedule: payload.schedule ?? {},
      availabilityStatus,
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
