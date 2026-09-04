import "server-only";

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

  const lines = [
    `Нова заявка ${cleanLine(booking.reference)}`,
    "",
    `Пацієнт: ${cleanLine(booking.patientName)}`,
    `Телефон: ${cleanLine(booking.phone)}`,
    `Послуга: ${cleanLine(booking.service)}`,
    booking.doctor ? `Лікар: ${cleanLine(booking.doctor)}` : "",
    booking.comment ? `Коментар: ${cleanLine(booking.comment)}` : "",
    `Джерело: ${cleanLine(booking.source)}`,
    "",
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
      text: lines.join("\n"),
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}.`);
  }

  return { sent: true, configured: true } as const;
}
