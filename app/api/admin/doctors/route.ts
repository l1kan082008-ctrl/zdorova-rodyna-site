import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  createDoctor,
  deleteDoctor,
  listDoctors,
  updateDoctor,
} from "../../doctors/doctorStore";
import type {
  DoctorAvailabilityStatus,
  DoctorPatientGroup,
  DoctorSchedule,
} from "../../../doctors/doctorData";
import { readBoundedJson } from "@/lib/requestBody";

const availabilityStatuses = new Set<DoctorAvailabilityStatus>([
  "accepting",
  "by-confirmation",
  "paused",
]);
const patientGroupValues = new Set<DoctorPatientGroup>([
  "adults",
  "children",
]);
const brokenEncodingPattern = /[\u0080-\u009f\u00c2\u00c3\u00d0\u00d1\ufffd]/u;

function hasBrokenEncoding(values: Array<string | undefined>) {
  return values.some(
    (value) => typeof value === "string" && brokenEncodingPattern.test(value),
  );
}

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    return Response.json({ doctors: await listDoctors() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося завантажити лікарів";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const payload = (await readBoundedJson(request, 256 * 1024)) as {
      id?: string;
      name?: string;
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
    const name = payload.name?.trim() ?? "";
    const specialty = payload.specialty?.trim() ?? "";
    const availabilityStatus = availabilityStatuses.has(
      payload.availabilityStatus ?? "accepting",
    )
      ? (payload.availabilityStatus ?? "accepting")
      : "accepting";
    if (!id || !name || !specialty) {
      return Response.json(
        { error: "Ім’я лікаря та спеціальність є обов’язковими" },
        { status: 400 },
      );
    }

    if (
      hasBrokenEncoding([
        name,
        specialty,
        payload.branch,
        payload.description,
        payload.biography,
        ...Object.values(payload.schedule ?? {}),
      ])
    ) {
      return Response.json(
        {
          error:
            "Текст має пошкоджене кодування. Оновіть сторінку та введіть його ще раз.",
        },
        { status: 400 },
      );
    }

    const updated = await updateDoctor(id, {
      name,
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

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = (await readBoundedJson(request, 32 * 1024)) as { name?: string; specialty?: string };
    const name = payload.name?.trim() ?? "";
    const specialty = payload.specialty?.trim() ?? "";
    if (!name || !specialty) {
      return Response.json({ error: "Вкажіть ім’я та спеціальність" }, { status: 400 });
    }
    if (hasBrokenEncoding([name, specialty])) {
      return Response.json({ error: "Текст має пошкоджене кодування" }, { status: 400 });
    }
    const doctor = await createDoctor({ name, specialty });
    return Response.json({ doctor, doctors: await listDoctors() }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не вдалося додати лікаря";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!id) return Response.json({ error: "Не вказано лікаря" }, { status: 400 });
    if (!(await deleteDoctor(id))) {
      return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
    }
    return Response.json({ doctors: await listDoctors() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не вдалося видалити лікаря";
    return Response.json({ error: message }, { status: 500 });
  }
}
