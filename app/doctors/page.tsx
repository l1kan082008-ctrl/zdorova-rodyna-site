import { ServiceBookingCta } from "../services/[slug]/ServiceBookingCta";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { listPublicDoctors as listDoctors } from "../api/doctors/publicDoctors";
import { DoctorsDirectory } from "./DoctorsDirectory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Лікарі у Рівному та Звягелі — запис | Здорова Родина",
  description:
    "Лікарі медичного центру «Здорова Родина» у Рівному та Звягелі. Спеціальності, профілі лікарів, ціни консультацій і місця прийому. Оберіть спеціаліста та залиште заявку.",
};

export default async function DoctorsPage() {
  const doctors = await listDoctors();

  return (
    <main className="inner-page doctors-page">
      <SiteHeader active="doctors" />
      <section className="page-hero">
        <span className="section-kicker">Лікарі</span>
        <h1>Команда для дорослих і дітей</h1>
        <p>
          Знайдіть спеціаліста за прізвищем або напрямом, перегляньте графік
          прийому та залиште заявку на зручний час.
        </p>
      </section>
      <DoctorsDirectory initialDoctors={doctors} />
      <ServiceBookingCta bookingHref="/contacts#booking" />
      <SiteFooter />
    </main>
  );
}
