import { ServiceBookingCta } from "../services/[slug]/ServiceBookingCta";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { listDoctors } from "../api/doctors/doctorStore";
import { DoctorsDirectory } from "./DoctorsDirectory";
import { defaultDoctors } from "./doctorData";

export const metadata: Metadata = {
  title: "Лікарі — Здорова Родина",
  description: "Лікарі лікувально-діагностичного центру Здорова Родина у Рівному.",
};

export default async function DoctorsPage() {
  const doctors = await listDoctors().catch(() => defaultDoctors);

  return (
    <main className="inner-page">
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
