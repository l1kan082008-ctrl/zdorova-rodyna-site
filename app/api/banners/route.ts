import { listBanners } from "./bannerStore";

export async function GET() {
  try {
    return Response.json({ banners: await listBanners(true) });
  } catch {
    return Response.json({ banners: [] });
  }
}
