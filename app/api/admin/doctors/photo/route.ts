import { env } from "cloudflare:workers";
import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";
import {
  getDoctorPhotoKey,
  listDoctors,
  updateDoctorPhotoKey,
} from "../../../doctors/doctorStore";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const formData = await request.formData();
    const doctorId = String(formData.get("doctorId") ?? "").trim();
    const photo = formData.get("photo");

    if (!doctorId || !(photo instanceof File)) {
      return Response.json(
        { error: "Оберіть лікаря та фотографію" },
        { status: 400 },
      );
    }
    if (!photo.type.startsWith("image/")) {
      return Response.json(
        { error: "Файл має бути зображенням" },
        { status: 400 },
      );
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return Response.json(
        { error: "Максимальний розмір фотографії — 5 МБ" },
        { status: 400 },
      );
    }

    const extension = photo.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const photoKey = `doctors/${doctorId}/${Date.now()}.${extension.toLowerCase()}`;
    const previousPhotoKey = await getDoctorPhotoKey(doctorId);

    await env.DOCTOR_MEDIA.put(photoKey, photo.stream(), {
      httpMetadata: { contentType: photo.type },
      customMetadata: { doctorId },
    });

    const updated = await updateDoctorPhotoKey(doctorId, photoKey);
    if (!updated) {
      await env.DOCTOR_MEDIA.delete(photoKey);
      return Response.json({ error: "Лікаря не знайдено" }, { status: 404 });
    }

    if (previousPhotoKey) await env.DOCTOR_MEDIA.delete(previousPhotoKey);

    return Response.json({ doctors: await listDoctors() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося завантажити фото";
    return Response.json({ error: message }, { status: 500 });
  }
}
