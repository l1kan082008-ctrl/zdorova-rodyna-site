import { ServiceBookingCta } from "../services/[slug]/ServiceBookingCta";
import type { Metadata } from "next";
import "./tablet.css";
import "./search.css";
import "./mobile.css";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { listPublicPriceItems } from "../api/prices/priceStore";
import { PriceCatalog } from "./PriceCatalog";
import {
  catalogItems,
  categoryOptions,
  type CategoryId,
} from "./priceData";

export const metadata: Metadata = {
  title: "Вартість послуг — Здорова Родина",
  description: "Пошук і актуальні ціни на послуги центру Здорова Родина.",
};

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string | string[];
    search?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const requestedCategory =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : "all";
  const initialCategory =
    requestedCategory === "analyses"
      ? "general"
      : categoryOptions.some((category) => category.id === requestedCategory)
        ? (requestedCategory as CategoryId)
        : "all";
  const initialQuery =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : "";
  const priceItems = await listPublicPriceItems().catch(() => catalogItems);

  return (
    <main className="inner-page">
      <SiteHeader active="prices" />
      <section className="page-hero prices-page-hero">
        <span className="section-kicker">Вартість</span>
        <h1>Вартість послуг</h1>
        <p>
          Знайдіть потрібне дослідження за назвою або оберіть напрям.
          Додайте послуги до калькулятора, щоб побачити орієнтовну суму.
        </p>
      </section>

      <PriceCatalog
        initialItems={priceItems}
        initialCategory={initialCategory}
        initialQuery={initialQuery}
      />

      <ServiceBookingCta bookingHref="/contacts#booking" />
      <SiteFooter />
    </main>
  );
}
