import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";
import { listLocations } from "../../../locations/locationStore";
import { readBoundedFormData } from "@/lib/requestBody";
import { readSafeRasterImage } from "@/lib/safeImage";
import { ImageOptimizationError, optimizeUploadedImage } from "@/lib/optimizedUpload";
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
    const optimizedImage = await optimizeUploadedImage(image, { maximumBytes: MAX_BYTES });
    const src = await uploadPublicImage(`locations/${crypto.randomUUID()}.${optimizedImage.extension}`, optimizedImage.bytes, optimizedImage.contentType);
    return Response.json({ src }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageOptimizationError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: "Не вдалося завантажити фото. Спробуйте ще раз." }, { status: 500 });
  }
}
