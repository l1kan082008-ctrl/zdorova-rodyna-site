import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { listPublicPriceItems } from "../api/prices/priceStore";
import { PriceCatalog } from "./PriceCatalog";
import { catalogItems } from "./priceData";

export const metadata: Metadata = {
  title: "Вартість послуг — Здорова Родина",
  description: "Пошук і актуальні ціни на послуги центру Здорова Родина.",
};

export default async function PricesPage() {
  const priceItems = await listPublicPriceItems().catch(() => catalogItems);

  return (
    <main className="inner-page">
      <SiteHeader active="prices" />

      <PriceCatalog initialItems={priceItems} />

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
