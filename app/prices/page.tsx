import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { PriceCatalog } from "./PriceCatalog";

export const metadata: Metadata = {
  title: "Вартість послуг — Здорова Родина",
  description: "Пошук і актуальні ціни на послуги центру Здорова Родина.",
};

export default function PricesPage() {
  return (
    <main className="inner-page">
      <SiteHeader active="prices" />
      <section className="page-hero prices-page-hero">
        <span className="section-kicker">Вартість</span>
        <h1>Вартість послуг</h1>
        <p>
          Знайдіть потрібне дослідження за назвою або оберіть напрям.
          Остаточну суму й підготовку підтвердить адміністратор під час запису.
        </p>
      </section>

      <PriceCatalog />

      <section className="price-notice price-catalog-notice">
        <strong>Зверніть увагу</strong>
        <p>
          Ціни перенесені з офіційного прайсу 24 липня 2026 року та можуть
          змінюватися. Остаточну суму, підготовку й доступний час підтвердить
          адміністратор за номером +38 (067) 671-44-44.
        </p>
      </section>
      <section className="subpage-cta">
        <div>
          <span className="section-kicker">Не знайшли послугу?</span>
          <h2>Адміністратор швидко уточнить вартість і підготовку</h2>
        </div>
        <a className="book-button" href="tel:+380676714444">
          Подзвонити <span>→</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
