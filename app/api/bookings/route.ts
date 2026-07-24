import { createBooking } from "./bookingStore";

const brokenEncodingPattern = /[\u0080-\u009f\u00c2\u00c3\u00d0\u00d1\ufffd]/u;

function readText(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const patientName = readText(payload.name, 100);
    const phone = readText(payload.phone, 30);
    const service = readText(payload.service, 180);
    const doctor = readText(payload.doctor, 140);
    const comment = readText(payload.comment, 1200);
    const website = readText(payload.website, 200);
    const phoneDigits = phone.replace(/\D/g, "");

    if (website) {
      return Response.json({ error: "Не вдалося перевірити заявку" }, { status: 400 });
    }
    if (patientName.length < 2) {
      return Response.json({ error: "Вкажіть ім’я пацієнта" }, { status: 400 });
    }
    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15 ||
      /^(\d)\1+$/u.test(phoneDigits)
    ) {
      return Response.json(
        { error: "Перевірте номер телефону" },
        { status: 400 },
      );
    }
    if (!service) {
      return Response.json({ error: "Оберіть послугу" }, { status: 400 });
    }
    if (
      brokenEncodingPattern.test(
        `${patientName} ${service} ${doctor} ${comment}`,
      )
    ) {
      return Response.json(
        { error: "Текст має пошкоджене кодування" },
        { status: 400 },
      );
    }

    const reference = await createBooking({
      patientName,
      phone,
      service,
      doctor,
      comment,
    });

    return Response.json({ reference }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося створити заявку";
    return Response.json({ error: message }, { status: 500 });
  }
}
