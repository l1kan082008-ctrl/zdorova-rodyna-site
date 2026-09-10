import { listPublicPriceItems } from "../../prices/priceStore";
import { catalogItems } from "../../../prices/priceData";

export async function GET() {
  try {
    const items = process.env.DATABASE_URL ? await listPublicPriceItems() : catalogItems;
    return Response.json(items, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Не вдалося завантажити ціни" }, { status: 503 });
  }
}
