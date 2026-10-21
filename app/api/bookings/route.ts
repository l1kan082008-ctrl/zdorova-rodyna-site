import { readBoundedJson, RequestBodyError } from "@/lib/requestBody";
import {
  checkPublicSubmissionRateLimit,
  isSameOriginSubmission,
  verifyTurnstileIfConfigured,
} from "@/lib/publicSubmissionSecurity";
import { createBooking } from "./bookingStore";
import { sendBookingNotification } from "@/lib/bookingNotification";
import { formatBookingComment } from "@/lib/bookingDetails";
import { isScreeningFullName, screeningAddress, screeningDoctorIds, screeningServiceName } from "@/lib/screening40";

const brokenEncodingPattern = /[\u0080-\u009f\u00c2\u00c3\u00d0\u00d1\ufffd]/u;
const allowedSources = new Map([
  ["contacts", "contacts-v1"],
  ["callback", "callback-v1"],
  ["family-declaration", "family-declaration-v1"],
  ["screening-40", "screening-40-v1"],
]);

function readText(value: unknown, limit: number) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return text.length <= limit ? text : "";
}

function payloadRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function jsonError(error: string, status: number, headers?: HeadersInit) {
  return Response.json({ error }, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginSubmission(request)) {
    return jsonError("Запит відхилено.", 403);
  }

  try {
    const rateLimit = await checkPublicSubmissionRateLimit(request);
    if (!rateLimit.allowed) {
      if (!rateLimit.configured) {
        return jsonError("Сервіс тимчасово недоступний.", 503, { "Retry-After": "60" });
      }
      return jsonError("Забагато спроб. Спробуйте пізніше.", 429, {
        "Retry-After": String(rateLimit.retryAfter),
      });
    }

    const payload = payloadRecord(await readBoundedJson(request, 16 * 1024));
    if (!payload) return jsonError("Некоректні дані заявки.", 400);

    let patientName = readText(payload.name, 100);
    const phone = readText(payload.phone, 30);
    const service = readText(payload.service, 180);
    let doctor = readText(payload.doctor, 140);
    let comment = readText(payload.comment, 1200);
    const website = readText(payload.website, 200);
    const source = readText(payload.source, 40);
    const consentVersion = readText(payload.consentVersion, 80);
    const turnstileToken = readText(payload.turnstileToken, 2_048);
    const expectedConsentVersion = allowedSources.get(source);
    const phoneDigits = phone.replace(/\D/g, "");

    if (website) {
      return Response.json(
        { reference: `ZR-${crypto.randomUUID().slice(0, 8).toUpperCase()}` },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (!expectedConsentVersion || payload.consent !== true) {
      return jsonError("Підтвердьте згоду на обробку контактних даних.", 400);
    }
    if (consentVersion !== expectedConsentVersion) {
      return jsonError("Оновіть сторінку та повторіть спробу.", 400);
    }
    if (!(await verifyTurnstileIfConfigured(request, turnstileToken))) {
      return jsonError("Не вдалося підтвердити, що запит надіслала людина.", 400);
    }
    if (patientName.length < 2) {
      return jsonError("Вкажіть ім’я пацієнта.", 400);
    }
    if (
      phoneDigits.length < 10
      || phoneDigits.length > 15
      || /^(\d)\1+$/u.test(phoneDigits)
    ) {
      return jsonError("Перевірте номер телефону.", 400);
    }
    if (!service) return jsonError("Оберіть послугу.", 400);
    if (service === screeningServiceName && source !== "screening-40") {
      return jsonError("Подайте заявку через форму програми «Скринінг здоров’я 40+».", 400);
    }
    if (source === "callback" && service !== "Зворотний дзвінок") {
      return jsonError("Некоректні дані заявки.", 400);
    }
    if (
      source === "family-declaration"
      && service !== "Заявка на декларацію із сімейним лікарем"
    ) {
      return jsonError("Некоректні дані заявки.", 400);
    }
    if (source === "screening-40") {
      if (service !== screeningServiceName) {
        return jsonError("Некоректні дані заявки.", 400);
      }
      if (!isScreeningFullName(patientName)) {
        return jsonError("Вкажіть прізвище, ім’я та по батькові повністю.", 400);
      }
      if (!/^(?:38)?0\d{9}$/u.test(phoneDigits) || /^0+$/u.test(phoneDigits.replace(/^38/u, ""))) {
        return jsonError("Перевірте номер телефону.", 400);
      }
      if (
        payload.doctorId !== undefined
        && (typeof payload.doctorId !== "string" || payload.doctorId.length > 100)
      ) {
        return jsonError("Некоректні дані лікаря.", 400);
      }
      const doctorId = readText(payload.doctorId, 100);
      doctor = "";
      if (doctorId) {
        if (!screeningDoctorIds.some((id) => id === doctorId)) {
          return jsonError("Оберіть лікаря програми «Скринінг здоров’я 40+».", 400);
        }
        const { getPublicDoctorById } = await import("../doctors/publicDoctors");
        const selectedDoctor = await getPublicDoctorById(doctorId);
        if (!selectedDoctor || selectedDoctor.isActive === false) {
          return jsonError("Цей лікар зараз недоступний для запису. Оновіть сторінку та оберіть іншого.", 400);
        }
        doctor = selectedDoctor.name;
      }
      patientName = patientName.replace(/\s+/gu, " ");
      // The programme has one location, regardless of a doctor's other branches.
      // Resolve the doctor's name from their profile and ignore submitted details.
      comment = formatBookingComment({
        locationComment: `Бажане відділення: ${screeningAddress}`,
        studies: "",
        total: "",
        comment: "Заявка на участь у державній програмі «Скринінг здоров’я 40+»."
          + (doctorId ? "" : " Допоможіть обрати лікаря."),
      });
    }
    if (brokenEncodingPattern.test(`${patientName} ${service} ${doctor} ${comment}`)) {
      return jsonError("Текст має пошкоджене кодування.", 400);
    }

    const reference = await createBooking({
      patientName,
      phone,
      service,
      doctor,
      comment,
      source,
      consentVersion,
    });

    try {
      await sendBookingNotification({
        reference,
        patientName,
        phone,
        service,
        doctor,
        comment,
        source,
      });
    } catch (notificationError) {
      console.error(JSON.stringify({
        event: "booking_email_failed",
        reference,
        error: notificationError instanceof Error
          ? notificationError.message
          : "unknown",
      }));
    }

    return Response.json(
      { reference },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return jsonError("Некоректний формат запиту.", error.status);
    }
    const incidentId = crypto.randomUUID();
    console.error(JSON.stringify({
      event: "public_booking_failed",
      incidentId,
      error: error instanceof Error ? error.message : "unknown",
    }));
    return Response.json(
      { error: "Не вдалося створити заявку.", incidentId },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
