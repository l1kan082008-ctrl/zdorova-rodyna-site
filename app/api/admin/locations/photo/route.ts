import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";
import { listLocations } from "../../../locations/locationStore";
import { readBoundedFormData } from "@/lib/requestBody";
import { readSafeRasterImage } from "@/lib/safeImage";
import { uploadPublicImage } from "@/lib/mediaStorage";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const form = await readBoundedFormData(request, MAX_BYTES + 128 * 1024);
    const id = String(form.get("locationId") ?? "").trim();
    const photo = form.get("photo");
    if (!id || !(photo instanceof File)) return Response.json({ error: "Оберіть відділення та фото." }, { status: 400 });
    if (!(await listLocations()).some(location => location.id === id)) return Response.json({ error: "Відділення не знайдено." }, { status: 404 });
    const image = await readSafeRasterImage(photo, MAX_BYTES);
    if (!image) return Response.json({ error: "Оберіть справжнє зображення JPG, PNG, WEBP або AVIF до 4 МБ." }, { status: 400 });
    const src = await uploadPublicImage(`locations/${crypto.randomUUID()}.${image.extension}`, image.bytes, image.contentType);
    return Response.json({ src }, { status: 201 });
  } catch {
    return Response.json({ error: "Не вдалося завантажити фото. Спробуйте ще раз." }, { status: 500 });
  }
}
