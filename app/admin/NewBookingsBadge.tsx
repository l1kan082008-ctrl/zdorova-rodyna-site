"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "./adminFetch";
import styles from "./AdminShell.module.css";

const refreshEvent = "zr-admin-refresh-new-bookings";
const countFormat = new Intl.NumberFormat("uk-UA");

export function refreshNewBookingsCount() {
  window.dispatchEvent(new Event(refreshEvent));
}

export function NewBookingsBadge() {
  const [count, setCount] = useState<number | "unavailable" | null>(null);

  useEffect(() => {
    let pending: AbortController | undefined;

    async function refresh() {
      if (document.visibilityState !== "visible") return;
      pending?.abort();
      const request = new AbortController();
      pending = request;
      try {
        const response = await adminFetch("/api/admin/bookings/new-count", {
          cache: "no-store",
          signal: request.signal,
        });
        if (!response.ok) throw new Error("Count unavailable");
        const { count: total } = await response.json();
        if (!request.signal.aborted) {
          setCount(Number.isSafeInteger(total) && total >= 0 ? total : "unavailable");
        }
      } catch {
        if (!request.signal.aborted) setCount("unavailable");
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener(refreshEvent, refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      pending?.abort();
      window.clearInterval(timer);
      window.removeEventListener(refreshEvent, refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  if (count === null || count === 0) return null;
  const unavailable = count === "unavailable";
  const label = unavailable ? "Кількість нових заявок недоступна" : "Нові заявки за весь час";
  return (
    <span className={styles.bookingCount} data-unavailable={unavailable || undefined} title={label}>
      <span className="sr-only">{label} </span>
      {unavailable ? <span aria-hidden="true">—</span> : countFormat.format(count)}
    </span>
  );
}
