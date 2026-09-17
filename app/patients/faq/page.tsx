import type { Metadata } from "next";
import Link from "next/link";
import { ServiceBookingCta } from "../../services/[slug]/ServiceBookingCta";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { FaqDirectory } from "./FaqDirectory";

export const metadata: Metadata = {
  title: "Часті запитання | Здорова Родина",
  description:
    "Відповіді на часті запитання про запис, підготовку, КТ, МРТ, контрастування, результати, оплату та пільги у медичному центрі «Здорова Родина».",
};

export default function FaqPage() {
  return (
    <main className="inner-page faq-page">
      <SiteHeader active="patients" />

      <div className="faq-shell">
        <nav className="faq-breadcrumbs" aria-label="Навігація сторінкою">
          <Link href="/patients">Пацієнтам</Link>
          <span aria-hidden="true">/</span>
          <span>Часті запитання</span>
        </nav>

        <section className="faq-hero" aria-labelledby="faq-title">
          <div>
            <p className="section-label">Відповідаємо зрозуміло</p>
            <h1 id="faq-title">Часті запитання</h1>
          </div>
          <div className="faq-hero-copy">
            <p>
              Зібрали відповіді про запис, підготовку, обстеження,
              контрастування, результати та оплату.
            </p>
            <span>32 відповіді · 4 теми</span>
          </div>
        </section>

        <FaqDirectory />


      </div>

      <ServiceBookingCta
        bookingHref="/contacts#booking"
        kicker="Залишилися запитання?"
        title="Не знайшли потрібної відповіді?"
        description="Залиште контакти — адміністратор допоможе уточнити інформацію про послуги, підготовку або запис на прийом."
        buttonLabel="Зв’язатися з адміністратором"
        ariaLabel="Допомога з питаннями"
      />

      <SiteFooter />
    </main>
  );
}
