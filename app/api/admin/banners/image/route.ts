import { env } from "cloudflare:workers";
import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const bannerId = String(formData.get("bannerId") ?? "draft");

    if (!(image instanceof File) || image.size === 0) {
      return Response.json({ error: "Оберіть зображення." }, { status: 400 });
    }

    const extension = IMAGE_TYPES.get(image.type);
    if (!extension) {
      return Response.json(
        { error: "Підтримуються JPG, PNG, WEBP та AVIF." },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: "Файл завеликий. Максимальний розмір — 8 МБ." },
        { status: 400 },
      );
    }

    const safeBannerId =
      bannerId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "draft";
    const imageKey = `banners/${safeBannerId}/${crypto.randomUUID()}.${extension}`;

    await env.DOCTOR_MEDIA.put(imageKey, image.stream(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { bannerId: safeBannerId },
    });

    return Response.json({ imageKey });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не вдалося завантажити зображення.";
    return Response.json({ error: message }, { status: 500 });
  }
}
