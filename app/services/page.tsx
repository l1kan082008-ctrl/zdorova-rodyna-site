import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  getDefaultManagedServices,
  listManagedServices,
} from "../api/services/serviceStore";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Послуги — Здорова Родина",
  description:
    "МРТ, КТ, УЗД, лабораторні дослідження та консультації лікарів у Рівному.",
};

export default async function ServicesPage() {
  const services = (await listManagedServices().catch(() => getDefaultManagedServices()))
    .filter((service) => service.active && service.showOnServicesPage)
    .sort((first, second) => first.sortOrder - second.sortOrder);

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
        {services.map((item) => {
          const art = item.imageKey
            ? `/api/services/image?key=${encodeURIComponent(item.imageKey)}`
            : item.imagePath || "/service-cards/lab-glass-v3.jpg";

          return (
          <Link
            className={`service-card service-card--${item.slug}`}
            key={item.id}
            href={item.href}
            aria-label={`${item.shortTitle}: дізнатися більше`}
            style={{ "--service-art": `url("${art}")` } as CSSProperties}
          >
            <span className="service-card-copy">
              <strong>{item.shortTitle}</strong>
              <span className="service-description">{item.cardDescription}</span>
            </span>
            <span className="service-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          );
        })}
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
