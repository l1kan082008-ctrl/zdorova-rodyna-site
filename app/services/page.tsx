import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { primaryServiceDetails } from "./serviceData";

export const metadata: Metadata = {
  title: "Послуги — Здорова Родина",
  description:
    "МРТ, КТ, УЗД, лабораторні дослідження та консультації лікарів у Рівному.",
};

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
      <section
        className="route-grid services-grid services-directory-grid"
        id="services-list"
        aria-label="Перелік послуг"
      >
        {primaryServiceDetails.map((item) => (
          <Link
            className={`service-card service-card--${item.slug}`}
            key={item.slug}
            href={`/services/${item.slug}`}
            aria-label={`${item.shortTitle}: дізнатися більше`}
          >
            <span className="service-card-copy">
              <strong>{item.shortTitle}</strong>
              <span className="service-description">{item.cardDescription}</span>
            </span>
            <span className="service-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
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
