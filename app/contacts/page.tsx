"use client";

import { FormEvent, useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const services = [
  "КТ",
  "МРТ",
  "УЗД",
  "Лабораторні дослідження",
  "Консультація лікаря",
  "Холтер",
  "Аналізи вдома",
];

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
  const [comment, setComment] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const servicesFromCalculator = params.get("services")?.trim() ?? "";
    const totalFromCalculator = params.get("total")?.trim() ?? "";
    const doctorFromCatalog = params.get("doctor")?.trim() ?? "";

    if (!servicesFromCalculator && !doctorFromCatalog) return;

    const applyCalculatorSelection = window.setTimeout(() => {
      setSelectedServices(servicesFromCalculator);
      setEstimatedTotal(totalFromCalculator);
      setSelectedDoctor(doctorFromCatalog);
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
    }, 0);

    return () => window.clearTimeout(applyCalculatorSelection);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
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
              <h2>Дані заповнено</h2>
              <p>
                Демоверсія сайту поки не надсилає форму в медичний центр.
                Для запису зателефонуйте адміністратору.
              </p>
              <a className="book-button" href="tel:+380676714444">
                +38 (067) 671-44-44
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
                Форма працює у демонстраційному режимі. Для гарантованого запису
                телефонуйте адміністратору.
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
                  <a href="/doctors">Обрати іншого лікаря</a>
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
                  key={selectedServices ? "calculator" : "regular"}
                  defaultValue={selectedServices ? "Послуги з калькулятора" : ""}
                >
                  <option value="" disabled>Оберіть послугу</option>
                  {selectedServices ? (
                    <option value="Послуги з калькулятора">
                      Послуги з калькулятора
                    </option>
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
              <button className="book-button" type="submit">
                Перевірити форму <span>→</span>
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
