"use client";

import { useEffect, useState } from "react";
import { getBookingHoursState, type BookingHoursState } from "@/lib/bookingHours";
import { useSiteSettings } from "./SiteSettingsProvider";

export type BookingHoursSnapshot = { state: BookingHoursState; hours: readonly string[] };

export function useBookingHours(active = true) {
  const { hours } = useSiteSettings();
  const [currentHours, setCurrentHours] = useState<BookingHoursSnapshot | null>(null);
  const [submittedHours, setSubmittedHours] = useState<BookingHoursSnapshot | null>(null);

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      setCurrentHours({ state: getBookingHoursState(hours), hours });
      timer = setTimeout(refresh, 60_000 - Date.now() % 60_000);
    };
    // The server and first client render stay identical, regardless of timezone.
    timer = setTimeout(refresh, 0);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [active, hours]);

  return {
    currentHours: active ? currentHours : null,
    submittedHours,
    // Capture when sending, not when a delayed response arrives or time advances.
    captureSubmissionHours: () => setSubmittedHours({ state: getBookingHoursState(hours), hours: [...hours] }),
  };
}

export function BookingHoursNotice({ value, confirmation = false }: {
  value: BookingHoursSnapshot | null;
  confirmation?: boolean;
}) {
  if (!value || value.state === "open") return null;
  const closed = value.state === "closed";
  return (
    <div className="booking-hours-notice" role={confirmation ? undefined : "status"}>
      <svg className="booking-hours-notice__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="booking-hours-notice__copy">
        <strong>{closed ? confirmation ? "Заявку залишено в неробочий час" : "Зараз неробочий час" : "Заявки опрацьовуємо у робочі години"}</strong>
        <p>{confirmation ? "Адміністратор зв’яжеться з вами у робочі години." : "Залиште заявку зараз — адміністратор зв’яжеться з вами у робочі години."}</p>
        <small>{value.hours.join(" · ")}</small>
      </div>
    </div>
  );
}
