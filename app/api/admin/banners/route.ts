import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import { createBanner, deleteBanner, listBanners, updateBanner } from "../../banners/bannerStore";
import type { PromoSlide } from "../../../components/promoData";
import { readBoundedJson } from "@/lib/requestBody";

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    return Response.json({ banners: await listBanners() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося завантажити банери." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    return Response.json({ banner: await createBanner(await readBoundedJson(request, 64 * 1024) as Partial<PromoSlide>) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося створити банер." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  try {
    const payload = await readBoundedJson(request, 64 * 1024) as Partial<PromoSlide> & { id?: string };
    if (!payload.id) return Response.json({ error: "Не вказано банер." }, { status: 400 });
    return Response.json({ banner: await updateBanner(payload.id, payload) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося зберегти банер." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Не вказано банер." }, { status: 400 });
  try {
    await deleteBanner(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не вдалося видалити банер." }, { status: 400 });
  }
}
