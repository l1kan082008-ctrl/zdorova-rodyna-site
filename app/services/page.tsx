import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { serviceDetails } from "./serviceData";

export const metadata: Metadata = {
  title: "Послуги — Здорова Родина",
  description:
    "МРТ, КТ, УЗД, лабораторні дослідження та консультації лікарів у Рівному.",
};

const analyses = [
  "Загальноклінічні дослідження",
  "Біохімічні дослідження",
  "Діабетична панель",
  "Гормони та фактори росту",
  "Онкологічні маркери",
  "Кардіо-ревматоїдна панель",
  "Імунологічні дослідження",
  "Цитологія та мікроскопія",
  "Інфекції та TORCH",
  "Алергологічні дослідження",
  "Генетичні дослідження",
  "Бактеріологічні посіви",
];

export default function ServicesPage() {
  return (
    <main className="inner-page">
      <SiteHeader active="services" />
      <section className="page-hero">
        <span className="section-kicker">Послуги</span>
        <h1>Діагностика, аналізи та лікарі в одному центрі</h1>
        <p>
          Оберіть потрібний напрям і залиште заявку. Адміністратор уточнить
          підготовку, доступний час, відділення та актуальну вартість.
        </p>
        <div className="services-hero-actions">
          <a className="book-button" href="#services-list">
            Обрати послугу <span>↓</span>
          </a>
          <a className="outline-button" href="/prices">
            Переглянути вартість <span>→</span>
          </a>
        </div>
      </section>
      <section className="service-promise-strip" aria-label="Переваги запису">
        <article>
          <span>01</span>
          <strong>Одна заявка</strong>
          <p>Послуга одразу передається у форму запису.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Уточнення деталей</strong>
          <p>Адміністратор погодить час, місце та підготовку.</p>
        </article>
        <article>
          <span>03</span>
          <strong>Підтвердження</strong>
          <p>Пацієнт отримує дзвінок із фінальними деталями.</p>
        </article>
      </section>
      <section
        className="route-grid services-route-grid"
        id="services-list"
        aria-label="Перелік послуг"
      >
        {serviceDetails.map((item, index) => (
          <article
            className="route-card service-route-card service-route-card--teal"
            key={item.slug}
          >
            <div className="service-card-top">
              <span className="service-card-mark" aria-hidden="true">
                {item.shortTitle}
              </span>
              <span className="route-number">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <span className="route-category">{item.category}</span>
            <h2>{item.title}</h2>
            <p>{item.lead}</p>
            <Link
              className="text-button service-card-book"
              href={`/services/${item.slug}`}
            >
              Детальніше <span>→</span>
            </Link>
          </article>
        ))}
      </section>
      <section className="catalog-section">
        <div>
          <span className="section-kicker">Лабораторія</span>
          <h2>Основні напрями досліджень</h2>
        </div>
        <ul className="catalog-list">
          {analyses.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="booking-journey" aria-labelledby="booking-journey-title">
        <div>
          <span className="section-kicker">Як записатися</span>
          <h2 id="booking-journey-title">Від вибору послуги до підтвердженого візиту</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>Оберіть напрям</strong>
              <p>Натисніть «Записатися» у потрібній картці.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Залиште контакти</strong>
              <p>Послуга вже буде вибрана — додайте ім’я та номер телефону.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Дочекайтеся дзвінка</strong>
              <p>Адміністратор підтвердить дату, час і підготовку.</p>
            </div>
          </li>
        </ol>
      </section>
      <section className="subpage-cta">
        <div>
          <span className="section-kicker">Потрібна допомога?</span>
          <h2>Підберемо послугу та підкажемо, як підготуватися</h2>
        </div>
        <a className="book-button" href="tel:+380676714444">
          +38 (067) 671-44-44 <span>→</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
