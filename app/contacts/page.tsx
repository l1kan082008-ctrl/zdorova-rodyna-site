"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { clearPriceCalculatorSelection } from "../prices/calculatorSelection";
import { LocationsExplorer } from "./LocationsExplorer";
import { centerLocations, type CenterLocation } from "./locationData";

const services = [
  "МРТ",
  "КТ",
  "УЗД",
  "Лабораторні дослідження",
  "Консультації лікарів",
  "Холтер та кардіодіагностика",
  "Аналізи вдома",
  "Скринінг здоров’я 40+",
  "Комплекс досліджень",
];

type BookingResponse = {
  reference?: string;
  error?: string;
};

export default function ContactsPage() {
  const [locations, setLocations] = useState<CenterLocation[]>(centerLocations);
  const [sent, setSent] = useState(false);
  const [selectedServices, setSelectedServices] = useState("");
  const [estimatedTotal, setEstimatedTotal] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [comment, setComment] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(
    centerLocations[0].id,
  );

  useEffect(() => {
    let active = true;
    fetch("/api/locations")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { locations?: CenterLocation[] } | null) => {
        if (active && payload?.locations?.length) setLocations(payload.locations);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const servicesFromCalculator = params.get("services")?.trim() ?? "";
    const totalFromCalculator = params.get("total")?.trim() ?? "";
    const doctorFromCatalog = params.get("doctor")?.trim() ?? "";
    const serviceFromCatalog = params.get("service")?.trim() ?? "";
    const locationFromLink = params.get("location")?.trim() ?? "";
    const shouldScrollToBooking = window.location.hash === "#booking";
    const linkedLocation = locations.find(
      (location) => location.id === locationFromLink,
    );

    if (
      !servicesFromCalculator &&
      !doctorFromCatalog &&
      !serviceFromCatalog &&
      !linkedLocation &&
      !shouldScrollToBooking
    ) {
      return;
    }

    const applyCalculatorSelection = window.setTimeout(() => {
      setSelectedServices(servicesFromCalculator);
      setEstimatedTotal(totalFromCalculator);
      setSelectedDoctor(doctorFromCatalog);
      if (linkedLocation) {
        setSelectedLocationId(linkedLocation.id);
      }
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
  }, [locations]);

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ??
    locations[0] ?? centerLocations[0];

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
          comment: [
            `Бажане відділення: ${selectedLocation.fullAddress}.`,
            comment.trim(),
          ]
            .filter(Boolean)
            .join(" "),
          website: formData.get("website"),
        }),
      });
      const payload = (await response.json()) as BookingResponse;
      if (!response.ok || !payload.reference) {
        throw new Error(payload.error || "Не вдалося надіслати заявку");
      }

      setBookingReference(payload.reference);

      if (selectedServices) {
        clearPriceCalculatorSelection();
        setSelectedServices("");
        setEstimatedTotal("");
        setSelectedService("");
        setComment("");

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("services");
        cleanUrl.searchParams.delete("total");
        window.history.replaceState(
          window.history.state,
          "",
          `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`,
        );
      }

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
    <main className="inner-page contacts-page">
      <SiteHeader active="contacts" />
      <section className="contacts-overview">
        <div className="contacts-overview__copy">
          <span className="section-kicker">Контакти</span>
          <h1>Наші відділення</h1>
          <p>
            Адреси, доступні послуги, графік роботи та маршрут.
          </p>
        </div>
        <div className="contacts-overview__support" aria-label="Контакти центру">
          <a href="tel:+380676714444">+38 (067) 671-44-44</a>
          <a href="mailto:zdorovarodynarivne@ukr.net">
            zdorovarodynarivne@ukr.net
          </a>
        </div>
      </section>
      <LocationsExplorer
        locations={locations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={setSelectedLocationId}
      />
      <section className="contact-route" id="booking">
        <div className="contact-route-copy">
          <span className="section-kicker">Запис</span>
          <h2>Запис на прийом</h2>
          <p>
            Залиште контактні дані. Адміністратор зателефонує, щоб погодити час
            та підготовку.
          </p>
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
              <h2>Ваші дані</h2>
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
                  <Link href="/services">Обрати іншу послугу</Link>
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
              <label htmlFor="contact-location">
                Відділення
                <select
                  id="contact-location"
                  name="location"
                  value={selectedLocationId}
                  onChange={(event) => setSelectedLocationId(event.target.value)}
                  required
                >
                  {locations.map((location) => (
                    <option value={location.id} key={location.id}>
                      {location.fullAddress}
                    </option>
                  ))}
                </select>
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
