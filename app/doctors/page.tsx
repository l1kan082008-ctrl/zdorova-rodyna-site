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
      <section className="subpage-cta">
        <div>
          <span className="section-kicker">Запис</span>
          <h2>Адміністратор допоможе обрати спеціаліста</h2>
        </div>
        <a className="book-button" href="tel:+380676714444">
          Подзвонити <span>→</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
