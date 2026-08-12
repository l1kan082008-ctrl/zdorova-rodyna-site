import type { Metadata } from "next";
import Link from "next/link";
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

        <aside className="faq-contact">
          <div>
            <p className="section-label">Потрібне уточнення?</p>
            <h2>Запитайте адміністратора</h2>
          </div>
          <p>
            Підготовка та протипоказання залежать від конкретного дослідження.
            Перед візитом ми перевіримо деталі саме для вашого випадку.
          </p>
          <a href="tel:+380676714444">+38 (067) 671-44-44</a>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
