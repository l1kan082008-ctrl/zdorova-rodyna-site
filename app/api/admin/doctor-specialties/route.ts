import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import { readBoundedJson, RequestBodyError, requestBodyErrorResponse } from "@/lib/requestBody";
import { DoctorSpecialtyValidationError } from "@/lib/doctorSpecialties";
import { DoctorSpecialtyStorageUnavailableError, listDoctorSpecialties, saveDoctorSpecialty } from "./specialtyStore";

const privateHeaders = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    return Response.json({ specialties: await listDoctorSpecialties() }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Не вдалося завантажити спеціальності. Спробуйте ще раз." }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = await readBoundedJson(request, 2 * 1024);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new RequestBodyError("Вкажіть назву спеціальності.", 400);
    }
    const specialty = await saveDoctorSpecialty((payload as Record<string, unknown>).name);
    return Response.json({ specialty, specialties: await listDoctorSpecialties() }, { headers: privateHeaders });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error, "Некоректні дані спеціальності.");
    if (bodyError) return bodyError;
    if (error instanceof DoctorSpecialtyValidationError || error instanceof DoctorSpecialtyStorageUnavailableError) {
      return Response.json({ error: error.message }, {
        status: error instanceof DoctorSpecialtyValidationError ? 400 : 503,
        headers: privateHeaders,
      });
    }
    return Response.json({ error: "Не вдалося зберегти спеціальність. Спробуйте ще раз." }, { status: 500, headers: privateHeaders });
  }
}
