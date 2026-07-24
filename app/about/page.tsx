import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Про центр — Здорова Родина",
  description: "Про лікувально-діагностичний центр Здорова Родина у Рівному.",
};

const values = [
  ["Точність і швидкість", "Автоматизоване високоточне обладнання зменшує вплив людського фактора."],
  ["Перевірена якість", "Для лабораторних досліджень використовуються оригінальні швейцарські реактиви."],
  ["Професійні фахівці", "У центрі приймають лікарі різних напрямів для дорослих і дітей."],
  ["Зручність", "Доступні виїзд медсестри додому та дистанційне отримання результатів."],
];

export default function AboutPage() {
  return (
    <main className="inner-page">
      <SiteHeader active="about" />
      <section className="page-hero">
        <span className="section-kicker">Про центр</span>
        <h1>Точні аналізи — правильний діагноз</h1>
        <p>
          «Здорова Родина» — лікувально-діагностичний центр і сучасна українська
          лабораторія, що працює за європейськими стандартами.
        </p>
      </section>
      <section className="about-route">
        <div className="about-route-copy">
          <span className="section-kicker">Наш підхід</span>
          <h2>Сучасна діагностика та турбота про пацієнта</h2>
          <p>
            Лабораторні дослідження виконуються на автоматичному високоточному
            обладнанні. Центр поєднує лабораторію, МРТ, КТ, УЗД,
            кардіодіагностику та консультації профільних лікарів.
          </p>
          <a className="outline-button" href="/contacts#booking">
            Записатися на прийом <span>→</span>
          </a>
        </div>
        <div
          className="about-route-photo"
          role="img"
          aria-label="Рецепція медичного центру Здорова Родина"
        />
      </section>
      <section className="about-values" aria-labelledby="about-values-title">
        <div className="about-values-head">
          <span className="section-kicker">Чому обирають нас</span>
          <h2 id="about-values-title">Технології, фахівці та сервіс, яким довіряють</h2>
        </div>
        <div className="values-grid">
          {values.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="subpage-cta">
        <div>
          <span className="section-kicker">Здорова Родина</span>
          <h2>Діагностика та лікарі для всієї родини</h2>
        </div>
        <a className="book-button" href="/services">
          Переглянути послуги <span>→</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
