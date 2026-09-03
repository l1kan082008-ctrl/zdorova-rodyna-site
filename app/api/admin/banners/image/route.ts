import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";
import { readBoundedFormData } from "@/lib/requestBody";
import { readSafeRasterImage } from "@/lib/safeImage";
import { uploadPublicImage } from "@/lib/mediaStorage";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const formData = await readBoundedFormData(request, MAX_IMAGE_BYTES + 256 * 1024);
    const image = formData.get("image");
    const bannerId = String(formData.get("bannerId") ?? "draft");

    if (!(image instanceof File) || image.size === 0) {
      return Response.json({ error: "Оберіть зображення." }, { status: 400 });
    }

    const safeImage = await readSafeRasterImage(image, MAX_IMAGE_BYTES);
    if (!safeImage) {
      return Response.json(
        { error: "Файл має бути справжнім JPG, PNG, WEBP або AVIF до 8 МБ." },
        { status: 400 },
      );
    }

    const safeBannerId =
      bannerId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "draft";
    const imagePath = `banners/${safeBannerId}/${crypto.randomUUID()}.${safeImage.extension}`;
    const imageKey = await uploadPublicImage(imagePath, safeImage.bytes, safeImage.contentType);

    return Response.json({ imageKey });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не вдалося завантажити зображення.";
    return Response.json({ error: message }, { status: 500 });
  }
}
