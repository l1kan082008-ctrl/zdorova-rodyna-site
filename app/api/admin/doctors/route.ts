import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  listDoctors,
  updateDoctor,
} from "../../doctors/doctorStore";
import type {
  DoctorPatientGroup,
  DoctorSchedule,
} from "../../../doctors/doctorData";
import { readBoundedJson, RequestBodyError, requestBodyErrorResponse } from "@/lib/requestBody";
import { DoctorPriceValidationError, parseDoctorPrice, parseDoctorShowConsultationPriceOnRequest } from "@/lib/doctorPricing";
import { DoctorPublicationValidationError, parseDoctorIsActive, parseDoctorSortOrder } from "@/lib/doctorPublication";
import { getDoctorSortOrder } from "../../../doctors/doctorData";
import { changedSnapshotFields, recordContentRevision } from "../revisions/revisionStore";

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

type DoctorPayload = {
  id?: string;
  name?: string;
  specialty?: string;
  experienceYears?: number | null;
  consultationPrice?: number | null;
  repeatConsultationPrice?: number | null;
  showConsultationPriceOnRequest?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  branch?: string;
  description?: string;
  biography?: string;
  patientGroups?: DoctorPatientGroup[];
  schedule?: DoctorSchedule;
};

async function readDoctorPayload(request: Request, maximumBytes: number): Promise<DoctorPayload> {
  const payload = await readBoundedJson(request, maximumBytes);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new RequestBodyError("Некоректні дані лікаря.", 400);
  }
  const values = payload as Record<string, unknown>;
  for (const field of ["id", "name", "specialty", "branch", "description", "biography"]) {
    if (values[field] !== undefined && typeof values[field] !== "string") {
      throw new RequestBodyError("Текстові поля лікаря мають містити текст.", 400);
    }
  }
  if (values.patientGroups !== undefined && !Array.isArray(values.patientGroups)) {
    throw new RequestBodyError("Некоректні вікові групи пацієнтів.", 400);
  }
  if (values.schedule !== undefined && (
    !values.schedule || typeof values.schedule !== "object" || Array.isArray(values.schedule) ||
    Object.values(values.schedule).some((value) => typeof value !== "string")
  )) {
    throw new RequestBodyError("Некоректний графік прийому.", 400);
  }
  // Validate before any database or revision write; omitted fields remain optional.
  parseDoctorPrice(values.consultationPrice);
  parseDoctorPrice(values.repeatConsultationPrice);
  parseDoctorShowConsultationPriceOnRequest(values.showConsultationPriceOnRequest);
  parseDoctorIsActive(values.isActive);
  parseDoctorSortOrder(values.sortOrder);
  return values as DoctorPayload;
}

function doctorWriteError(error: unknown, fallback: string) {
  const bodyError = requestBodyErrorResponse(error, error instanceof Error ? error.message : fallback);
  if (bodyError) return bodyError;
  return Response.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: error instanceof DoctorPriceValidationError || error instanceof DoctorPublicationValidationError ? 400 : 500 },
  );
}

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    return Response.json({ doctors: await listDoctors({ includeInactive: true }) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося завантажити лікарів";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const payload = await readDoctorPayload(request, 256 * 1024);

    const id = payload.id?.trim() ?? "";
    const name = payload.name?.trim() ?? "";
    const specialty = payload.specialty?.trim() ?? "";
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

    const existing = await getDoctorById(id, { includeInactive: true });
    if (!existing) {
      return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
    }
    const values = {
      name,
      specialty,
      experienceYears: payload.experienceYears === undefined
        ? existing.experienceYears
        : typeof payload.experienceYears === "number" && Number.isFinite(payload.experienceYears)
          ? Math.max(0, Math.round(payload.experienceYears))
          : null,
      consultationPrice: parseDoctorPrice(payload.consultationPrice, existing.consultationPrice),
      repeatConsultationPrice: parseDoctorPrice(payload.repeatConsultationPrice, existing.repeatConsultationPrice ?? null),
      showConsultationPriceOnRequest: parseDoctorShowConsultationPriceOnRequest(payload.showConsultationPriceOnRequest, existing.showConsultationPriceOnRequest === true),
      isActive: parseDoctorIsActive(payload.isActive, existing.isActive !== false),
      sortOrder: parseDoctorSortOrder(payload.sortOrder, getDoctorSortOrder(existing)),
      branch: payload.branch?.trim() ?? existing.branch,
      description: payload.description?.trim() ?? existing.description,
      biography: payload.biography?.trim() ?? existing.biography,
      patientGroups: payload.patientGroups === undefined
        ? existing.patientGroups
        : payload.patientGroups.filter((group) => patientGroupValues.has(group)),
      schedule: payload.schedule ?? existing.schedule,
    };
    await recordContentRevision({
      entityType: "doctor",
      entityId: existing.id,
      entityLabel: existing.name,
      action: "update",
      snapshot: existing as unknown as Record<string, unknown>,
      changedFields: changedSnapshotFields(
        existing as unknown as Record<string, unknown>,
        { ...existing, ...values } as unknown as Record<string, unknown>,
      ),
    });

    const updated = await updateDoctor(id, values);

    if (!updated) {
      return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
    }

    return Response.json({ doctors: await listDoctors({ includeInactive: true }) });
  } catch (error) {
    return doctorWriteError(error, "Не вдалося зберегти зміни");
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = await readDoctorPayload(request, 32 * 1024);
    const name = payload.name?.trim() ?? "";
    const specialty = payload.specialty?.trim() ?? "";
    if (!name || !specialty) {
      return Response.json({ error: "Вкажіть ім’я та спеціальність" }, { status: 400 });
    }
    if (hasBrokenEncoding([name, specialty, payload.branch])) {
      return Response.json({ error: "Текст має пошкоджене кодування" }, { status: 400 });
    }
    const doctor = await createDoctor({
      name,
      specialty,
      branch: payload.branch?.trim() ?? "",
      consultationPrice: parseDoctorPrice(payload.consultationPrice),
      repeatConsultationPrice: parseDoctorPrice(payload.repeatConsultationPrice),
      showConsultationPriceOnRequest: parseDoctorShowConsultationPriceOnRequest(payload.showConsultationPriceOnRequest),
      isActive: parseDoctorIsActive(payload.isActive),
      sortOrder: parseDoctorSortOrder(payload.sortOrder),
    });
    return Response.json({ doctor, doctors: await listDoctors({ includeInactive: true }) }, { status: 201 });
  } catch (error) {
    return doctorWriteError(error, "Не вдалося додати лікаря");
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!id) return Response.json({ error: "Не вказано лікаря" }, { status: 400 });
    const existing = await getDoctorById(id, { includeInactive: true });
    if (!existing) return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
    await recordContentRevision({
      entityType: "doctor",
      entityId: existing.id,
      entityLabel: existing.name,
      action: "delete",
      snapshot: existing as unknown as Record<string, unknown>,
      changedFields: ["record"],
    });
    if (!(await deleteDoctor(id))) {
      return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
    }
    return Response.json({ doctors: await listDoctors({ includeInactive: true }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не вдалося видалити лікаря";
    return Response.json({ error: message }, { status: 500 });
  }
}
