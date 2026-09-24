import "server-only";

import { parseBookingDetails } from "./bookingDetails";
import { env } from "./runtimeEnv";

type BookingNotification = {
  reference: string;
  patientName: string;
  phone: string;
  service: string;
  doctor: string;
  comment: string;
  source: string;
};

function cleanLine(value: string) {
  return value.replace(/[\r\n]+/gu, " ").trim();
}

export async function sendBookingNotification(booking: BookingNotification) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const recipient = env.BOOKING_NOTIFICATION_TO?.trim();
  const sender = env.BOOKING_NOTIFICATION_FROM?.trim();

  if (!apiKey || !recipient || !sender) {
    return { sent: false, configured: false } as const;
  }

  const details = parseBookingDetails(booking.comment);
  const contactLines = [
    `Пацієнт: ${cleanLine(booking.patientName)}`,
    `Телефон: ${cleanLine(booking.phone)}`,
    `Послуга: ${cleanLine(booking.service)}`,
    booking.doctor ? `Лікар: ${cleanLine(booking.doctor)}` : "",
  ].filter(Boolean);
  const sections = [
    `Нова заявка ${cleanLine(booking.reference)}`,
    contactLines.join("\n"),
    details.location ? `Відділення: ${details.location}` : "",
    details.studies.length
      ? `Обрані дослідження:\n${details.studies.map((study, index) => `${index + 1}. ${study}`).join("\n")}`
      : "",
    details.total ? `Орієнтовна сума: ${details.total}` : "",
    details.comment ? `Коментар:\n${details.comment}` : "",
    `Джерело: ${cleanLine(booking.source)}`,
    "Заявка також збережена в захищеній адмінпанелі сайту.",
  ].filter(Boolean);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `booking-${booking.reference}`,
      "User-Agent": "Zdorova-Rodyna-Website/1.0",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `Нова заявка ${cleanLine(booking.reference)}`,
      text: sections.join("\n\n"),
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}.`);
  }

  return { sent: true, configured: true } as const;
}
