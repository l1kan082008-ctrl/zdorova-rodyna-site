"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const services = [
  "МРТ",
  "КТ та КТ-коронарографія",
  "УЗД",
  "Лабораторні дослідження",
  "Консультації лікарів",
  "Холтер та кардіодіагностика",
  "Аналізи вдома",
  "Результати дистанційно",
  "Скринінг здоров’я 40+",
  "Комплекс досліджень",
];

type BookingResponse = {
  reference?: string;
  error?: string;
};

const locations = [
  {
    address: "вул. Володимира Стельмаха (Курчатова), 18-М",
    hours: "Пн–Пт 08:00–19:00 · Сб 08:00–15:00 · Нд вихідний",
    phone: "+380676714444",
    phoneLabel: "+38 (067) 671-44-44",
  },
  {
    address: "вул. Чорновола, 79 (Чорнобильська лікарня)",
    hours: "Пн–Пт 08:00–14:00 · Сб–Нд вихідні",
    phone: "+380676714444",
    phoneLabel: "+38 (067) 671-44-44",
  },
  {
    address: "вул. Кулика і Гудачека, 3, каб. 219",
    hours: "Пн–Пт 08:00–14:00 · Сб–Нд вихідні",
    phone: "+380676714444",
    phoneLabel: "+38 (067) 671-44-44",
  },
  {
    address: "вул. Олександра Олеся, 13",
    hours: "Пн–Пт 08:00–18:00 · Сб–Нд вихідні",
    phone: "+380932332043",
    phoneLabel: "+38 (093) 233-20-43",
  },
];

export default function ContactsPage() {
  const [sent, setSent] = useState(false);
  const [selectedServices, setSelectedServices] = useState("");
  const [estimatedTotal, setEstimatedTotal] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [comment, setComment] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const servicesFromCalculator = params.get("services")?.trim() ?? "";
    const totalFromCalculator = params.get("total")?.trim() ?? "";
    const doctorFromCatalog = params.get("doctor")?.trim() ?? "";
    const serviceFromCatalog = params.get("service")?.trim() ?? "";
    const shouldScrollToBooking = window.location.hash === "#booking";

    if (
      !servicesFromCalculator &&
      !doctorFromCatalog &&
      !serviceFromCatalog &&
      !shouldScrollToBooking
    ) {
      return;
    }

    const applyCalculatorSelection = window.setTimeout(() => {
      setSelectedServices(servicesFromCalculator);
      setEstimatedTotal(totalFromCalculator);
      setSelectedDoctor(doctorFromCatalog);
      setSelectedService(
        servicesFromCalculator
          ? "Комплекс досліджень"
          : serviceFromCatalog || (doctorFromCatalog ? "Консультації лікарів" : ""),
      );
      setComment(
        [
          doctorFromCatalog ? `Бажаний лікар: ${doctorFromCatalog}.` : "",
          servicesFromCalculator
            ? `Обрані дослідження: ${servicesFromCalculator.replaceAll(" | ", ", ")}.`
            : "",
          totalFromCalculator
            ? `Орієнтовна сума: ${Number(totalFromCalculator).toLocaleString("uk-UA")} ₴.`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      );
      if (shouldScrollToBooking) {
        const scrollTarget = window.matchMedia("(max-width: 720px)").matches
          ? document.querySelector(".contact-form-card")
          : document.getElementById("booking");
        scrollTarget?.scrollIntoView({ block: "start", behavior: "auto" });
      }
    }, 60);

    return () => window.clearTimeout(applyCalculatorSelection);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          service: selectedService,
          doctor: selectedDoctor,
          comment,
          website: formData.get("website"),
        }),
      });
      const payload = (await response.json()) as BookingResponse;
      if (!response.ok || !payload.reference) {
        throw new Error(payload.error || "Не вдалося надіслати заявку");
      }

      setBookingReference(payload.reference);
      setSent(true);
      form.reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Не вдалося надіслати заявку",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="inner-page">
      <SiteHeader active="contacts" />
      <section className="page-hero contacts-page-hero">
        <span className="section-kicker">Контакти</span>
        <h1>Оберіть найближче відділення у Рівному</h1>
        <p>
          Запис на дослідження та консультації:{" "}
          <a href="tel:+380676714444">+38 (067) 671-44-44</a>. Електронна
          пошта:{" "}
          <a href="mailto:zdorovarodynarivne@ukr.net">
            zdorovarodynarivne@ukr.net
          </a>.
        </p>
      </section>
      <section className="locations-grid" aria-label="Адреси медичного центру">
        {locations.map((location, index) => (
          <article className="location-card" key={location.address}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{location.address}</h2>
            <p>{location.hours}</p>
            <a href={`tel:${location.phone}`}>{location.phoneLabel}</a>
          </article>
        ))}
      </section>
      <section className="contact-route" id="booking">
        <div className="contact-route-copy">
          <span className="section-kicker">Запис</span>
          <h2>Зручний спосіб зв’язку</h2>
          <ol>
            <li><span>01</span> Подзвоніть за номером +38 (067) 671-44-44.</li>
            <li><span>02</span> Назвіть послугу або спеціаліста.</li>
            <li><span>03</span> Узгодьте відділення, дату та підготовку.</li>
          </ol>
          <a className="book-button contact-call" href="tel:+380676714444">
            Подзвонити зараз <span>→</span>
          </a>
        </div>
        <div className="contact-form-card">
          {sent ? (
            <div className="contact-success" aria-live="polite">
              <span>✓</span>
              <h2>Заявку прийнято</h2>
              <p>
                Номер заявки <strong>{bookingReference}</strong>. Адміністратор
                зателефонує, щоб погодити дату, час, відділення та підготовку.
              </p>
              <a className="book-button" href="tel:+380676714444">
                Потрібно терміново? Подзвонити
              </a>
              <button
                className="outline-button"
                type="button"
                onClick={() => setSent(false)}
              >
                Повернутися до форми
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2>Заявка на прийом</h2>
              <p className="form-note">
                Заповнення займає близько хвилини. Остаточний час візиту
                підтвердить адміністратор телефоном.
              </p>
              {selectedServices ? (
                <div className="selected-booking-summary" aria-label="Обрані дослідження">
                  <span>Ваше замовлення</span>
                  <strong>{selectedServices.replaceAll(" | ", ", ")}</strong>
                  {estimatedTotal ? (
                    <p>
                      Орієнтовна сума:{" "}
                      <b>{Number(estimatedTotal).toLocaleString("uk-UA")} ₴</b>
                    </p>
                  ) : null}
                  <a href="/prices">Змінити набір послуг</a>
                </div>
              ) : null}
              {selectedDoctor ? (
                <div className="selected-booking-summary" aria-label="Обраний лікар">
                  <span>Обраний лікар</span>
                  <strong>{selectedDoctor}</strong>
                  <Link href="/doctors">Обрати іншого лікаря</Link>
                </div>
              ) : null}
              {selectedService && !selectedServices && !selectedDoctor ? (
                <div className="selected-booking-summary" aria-label="Обрана послуга">
                  <span>Обрана послуга</span>
                  <strong>{selectedService}</strong>
                  <a href="/services">Обрати іншу послугу</a>
                </div>
              ) : null}
              <label htmlFor="contact-name">
                Ваше ім’я
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Ім’я та прізвище"
                  required
                />
              </label>
              <label htmlFor="contact-phone">
                Номер телефону
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+380"
                  required
                />
              </label>
              <label htmlFor="contact-service">
                Послуга
                <select
                  id="contact-service"
                  name="service"
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                  required
                >
                  <option value="" disabled>Оберіть послугу</option>
                  {selectedService && !services.includes(selectedService) ? (
                    <option value={selectedService}>{selectedService}</option>
                  ) : null}
                  {services.map((service) => (
                    <option value={service} key={service}>{service}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="contact-comment">
                Коментар
                <textarea
                  id="contact-comment"
                  name="comment"
                  placeholder="Коротко опишіть ваш запит"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </label>
              <label className="booking-consent">
                <input type="checkbox" name="consent" required />
                <span>
                  Погоджуюся на обробку контактних даних для організації запису.
                </span>
              </label>
              <label className="booking-honeypot" aria-hidden="true">
                Ваш сайт
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              {submitError ? (
                <p className="booking-submit-error" role="alert">
                  {submitError}. Також можна зателефонувати{" "}
                  <a href="tel:+380676714444">+38 (067) 671-44-44</a>.
                </p>
              ) : null}
              <button className="book-button" type="submit" disabled={submitting}>
                {submitting ? "Надсилаємо…" : "Надіслати заявку"} <span>→</span>
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
