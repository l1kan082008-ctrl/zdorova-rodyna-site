import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import { getAdminSiteSettings, saveSiteSettings } from "../../settings/settingsStore";
import { SiteSettingsValidationError } from "@/lib/siteSettings";
import { readBoundedJson, RequestBodyError } from "@/lib/requestBody";

const headers = { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" };

export async function GET(request: Request) {
  try {
    if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
    return Response.json({ settings: await getAdminSiteSettings() }, { headers });
  } catch {
    return Response.json({ error: "Не вдалося завантажити налаштування. Спробуйте ще раз." }, { status: 500, headers });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();
    const payload = await readBoundedJson(request, 8 * 1024);
    return Response.json({ settings: await saveSiteSettings(payload) }, { headers });
  } catch (error) {
    if (error instanceof SiteSettingsValidationError) {
      return Response.json({ error: error.message }, { status: 400, headers });
    }
    if (error instanceof RequestBodyError) {
      return Response.json({ error: "Невірний формат або завеликий розмір налаштувань." }, { status: error.status, headers });
    }
    return Response.json({ error: "Не вдалося зберегти налаштування. Ваші зміни залишилися у формі." }, { status: 500, headers });
  }
}
