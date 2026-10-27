import { isAuthorizedAdmin, unauthorizedAdminResponse } from "../adminAuth";
import {
  deleteBooking,
  listAdminBookings,
  updateBookingStatus,
  type BookingStatus,
} from "../../bookings/bookingStore";
import { readBoundedJson } from "@/lib/requestBody";
import { listManagedPriceItems } from "../../prices/priceStore";
import { AdminBookingQueryError, parseAdminBookingQuery } from "@/lib/adminBookingStatistics";

const privateHeaders = { "Cache-Control": "private, no-store" };

const statuses = new Set<BookingStatus>([
  "new",
  "contacted",
  "confirmed",
  "no_answer",
  "closed",
  "cancelled",
]);

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const query = parseAdminBookingQuery(new URL(request.url).searchParams);
    const catalog = await listManagedPriceItems();
    return Response.json(await listAdminBookings(query, catalog), { headers: privateHeaders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося завантажити заявки";
    return Response.json({ error: message }, {
      status: error instanceof AdminBookingQueryError ? 400 : 500,
      headers: privateHeaders,
    });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const payload = (await readBoundedJson(request, 4 * 1024)) as { id?: string };
    const id = payload.id?.trim() ?? "";

    if (!id) {
      return Response.json({ error: "Не вказано заявку" }, { status: 400 });
    }

    const deleted = await deleteBooking(id);
    if (!deleted) {
      return Response.json({ error: "Заявку не знайдено" }, { status: 404 });
    }

    return Response.json({ success: true }, { headers: privateHeaders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося видалити заявку";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthorizedAdmin(request))) return unauthorizedAdminResponse();

  try {
    const payload = (await readBoundedJson(request, 4 * 1024)) as {
      id?: string;
      status?: BookingStatus;
    };
    const id = payload.id?.trim() ?? "";
    const status = payload.status;

    if (!id || !status || !statuses.has(status)) {
      return Response.json({ error: "Некоректні дані заявки" }, { status: 400 });
    }

    const updated = await updateBookingStatus(id, status);
    if (!updated) {
      return Response.json({ error: "Заявку не знайдено" }, { status: 404 });
    }

    return Response.json({ success: true }, { headers: privateHeaders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося оновити заявку";
    return Response.json({ error: message }, { status: 500 });
  }
}
