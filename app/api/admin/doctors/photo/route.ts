import { env } from "cloudflare:workers";
import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";
import {
  getDoctorPhotoKey,
  listDoctors,
  updateDoctorPhotoKey,
} from "../../../doctors/doctorStore";
import { readBoundedFormData } from "@/lib/requestBody";
import { readSafeRasterImage } from "@/lib/safeImage";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const formData = await readBoundedFormData(request, MAX_PHOTO_BYTES + 256 * 1024);
    const doctorId = String(formData.get("doctorId") ?? "").trim();
    const photo = formData.get("photo");

    if (!doctorId || !(photo instanceof File)) {
      return Response.json(
        { error: "Оберіть лікаря та фотографію" },
        { status: 400 },
      );
    }
    const safeImage = await readSafeRasterImage(photo, MAX_PHOTO_BYTES);
    if (!safeImage) {
      return Response.json(
        { error: "Фотографія має бути справжнім JPG, PNG, WEBP або AVIF до 5 МБ" },
        { status: 400 },
      );
    }

    const safeDoctorId = doctorId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
    if (!safeDoctorId || safeDoctorId !== doctorId) {
      return Response.json({ error: "Некоректний ідентифікатор лікаря" }, { status: 400 });
    }
    const photoKey = `doctors/${safeDoctorId}/${crypto.randomUUID()}.${safeImage.extension}`;
    const previousPhotoKey = await getDoctorPhotoKey(doctorId);

    await env.DOCTOR_MEDIA.put(photoKey, safeImage.bytes, {
      httpMetadata: { contentType: safeImage.contentType },
      customMetadata: { doctorId: safeDoctorId },
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
