"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  Booking,
  BookingStatus,
} from "../../api/bookings/bookingStore";

const statusOptions: Array<{ value: BookingStatus; label: string }> = [
  { value: "new", label: "Нова" },
  { value: "contacted", label: "Зв’язалися" },
  { value: "confirmed", label: "Підтверджено" },
  { value: "closed", label: "Закрито" },
];

type ApiPayload = {
  bookings?: Booking[];
  error?: string;
};

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then(async (response) => {
        const payload = (await response.json()) as ApiPayload;
        if (!response.ok || !payload.bookings) {
          throw new Error(payload.error || "Не вдалося відкрити заявки");
        }
        setBookings(payload.bookings);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Сталася помилка"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("uk");
    if (!normalized) return bookings;
    return bookings.filter((booking) =>
      `${booking.reference} ${booking.patientName} ${booking.phone} ${booking.service} ${booking.doctor}`
        .toLocaleLowerCase("uk")
        .includes(normalized),
    );
  }, [bookings, query]);

  const changeStatus = async (id: string, status: BookingStatus) => {
    setSavingId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.bookings) {
        throw new Error(payload.error || "Не вдалося оновити статус");
      }
      setBookings(payload.bookings);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка");
    } finally {
      setSavingId("");
    }
  };

  return (
    <main className="admin-bookings-page">
      <header className="admin-topbar">
        <Link href="/services">← До сайту</Link>
        <nav aria-label="Адміністративні розділи">
          <Link href="/admin/doctors">Лікарі</Link>
          <strong>Заявки</strong>
        </nav>
      </header>
      <section className="admin-intro">
        <span className="section-kicker">Адмін-панель</span>
        <h1>Заявки пацієнтів</h1>
        <p>Нові заявки з форми запису з’являються тут одразу після відправлення.</p>
      </section>
      <section className="admin-bookings-shell">
        <label className="admin-booking-search">
          <span>Знайти заявку</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ім’я, телефон, послуга або номер"
          />
        </label>
        {error ? <p className="admin-booking-error" role="alert">{error}</p> : null}
        {loading ? (
          <div className="admin-state">Завантажуємо заявки…</div>
        ) : filteredBookings.length ? (
          <div className="admin-booking-list">
            {filteredBookings.map((booking) => (
              <article key={booking.id}>
                <div className="admin-booking-heading">
                  <span>{booking.reference}</span>
                  <time dateTime={booking.createdAt}>
                    {new Date(`${booking.createdAt}Z`).toLocaleString("uk-UA")}
                  </time>
                </div>
                <h2>{booking.patientName}</h2>
                <a href={`tel:${booking.phone}`}>{booking.phone}</a>
                <dl>
                  <div>
                    <dt>Послуга</dt>
                    <dd>{booking.service}</dd>
                  </div>
                  {booking.doctor ? (
                    <div>
                      <dt>Лікар</dt>
                      <dd>{booking.doctor}</dd>
                    </div>
                  ) : null}
                  {booking.comment ? (
                    <div>
                      <dt>Коментар</dt>
                      <dd>{booking.comment}</dd>
                    </div>
                  ) : null}
                </dl>
                <label>
                  Статус
                  <select
                    value={booking.status}
                    disabled={savingId === booking.id}
                    onChange={(event) =>
                      changeStatus(
                        booking.id,
                        event.target.value as BookingStatus,
                      )
                    }
                  >
                    {statusOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-state">Заявок поки немає.</div>
        )}
      </section>
    </main>
  );
}
