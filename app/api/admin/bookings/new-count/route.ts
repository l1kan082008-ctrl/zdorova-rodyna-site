import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../../adminAuth";
import { countNewBookings } from "../../../bookings/bookingStore";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    return Response.json({ count: await countNewBookings() }, { headers });
  } catch {
    return Response.json({ error: "Не вдалося порахувати нові заявки." }, { status: 500, headers });
  }
}
