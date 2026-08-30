"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminNavigation from "../AdminNavigation";
import type {
  Booking,
  BookingStatus,
} from "../../api/bookings/bookingStore";

const statusOptions: Array<{ value: BookingStatus; label: string }> = [
  { value: "new", label: "Нова" },
  { value: "contacted", label: "Зв’язалися" },
  { value: "confirmed", label: "Підтверджено" },
  { value: "closed", label: "Закрито" },
  { value: "cancelled", label: "Скасовано" },
];

type ApiPayload = {
  bookings?: Booking[];
  error?: string;
};

type BookingKind =
  | "callback"
  | "declaration"
  | "doctor"
  | "mri"
  | "ct"
  | "ultrasound"
  | "laboratory"
  | "other";

const bookingKindLabels: Record<BookingKind, string> = {
  callback: "Зворотний дзвінок",
  declaration: "Декларація із сімейним лікарем",
  doctor: "Запис до лікаря",
  mri: "Запис на МРТ",
  ct: "Запис на КТ",
  ultrasound: "Запис на УЗД",
  laboratory: "Лабораторні дослідження",
  other: "Інша заявка",
};

function getBookingKind(booking: Booking): BookingKind {
  const value = `${booking.service} ${booking.doctor ?? ""} ${booking.comment ?? ""}`
    .toLocaleLowerCase("uk")
    .replace(/ґ/g, "г");

  if (/зворотн|передзвон|дзвінок/.test(value)) return "callback";
  if (/декларац/.test(value)) return "declaration";
  if (/(^|[^а-яіїєґ])мрт([^а-яіїєґ]|$)|магнітно-резонанс/.test(value)) return "mri";
  if (/(^|[^а-яіїєґ])кт([^а-яіїєґ]|$)|комп['’`]?ютерн|коронарограф/.test(value)) return "ct";
  if (/(^|[^а-яіїєґ])узд([^а-яіїєґ]|$)|ультразвук/.test(value)) return "ultrasound";
  if (/аналіз|лаборатор|забір/.test(value)) return "laboratory";
  if (booking.doctor || /лікар|консультац|прийом/.test(value)) return "doctor";
  return "other";
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

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

  const removeBooking = async (booking: Booking) => {
    const confirmed = window.confirm(
      `Видалити заявку ${booking.reference}? Цю дію неможливо скасувати.`,
    );
    if (!confirmed) return;

    setDeletingId(booking.id);
    setError("");
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: booking.id }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.bookings) {
        throw new Error(payload.error || "Не вдалося видалити заявку");
      }
      setBookings(payload.bookings);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="admin-bookings-page">
      <header className="admin-topbar">
        <Link href="/services">← До сайту</Link>
        <AdminNavigation current="bookings" />
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
            {filteredBookings.map((booking) => {
              const kind = getBookingKind(booking);
              const showService =
                booking.service.trim().toLocaleLowerCase("uk") !==
                bookingKindLabels[kind].toLocaleLowerCase("uk");

              return (
                <article className="admin-booking-card" key={booking.id}>
                <div className="admin-booking-heading">
                  <span>{booking.reference}</span>
                  <time dateTime={booking.createdAt}>
                    {new Date(`${booking.createdAt}Z`).toLocaleString("uk-UA")}
                  </time>
                </div>
                <div className={`admin-booking-type admin-booking-type--${kind}`}>
                  <span>{bookingKindLabels[kind]}</span>
                  {showService ? <strong>{booking.service}</strong> : null}
                </div>
                <h2>{booking.patientName}</h2>
                <a href={`tel:${booking.phone}`}>{booking.phone}</a>
                <dl>
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
                <div className="admin-booking-actions">
                  <label className="admin-booking-status">
                    Статус
                    <select
                      value={booking.status}
                      disabled={savingId === booking.id || deletingId === booking.id}
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
                  <button
                    className="admin-booking-delete"
                    type="button"
                    disabled={deletingId === booking.id || savingId === booking.id}
                    onClick={() => removeBooking(booking)}
                  >
                    {deletingId === booking.id ? "Видаляємо…" : "Видалити"}
                  </button>
                </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-state">Заявок поки немає.</div>
        )}
      </section>
    </main>
  );
}
