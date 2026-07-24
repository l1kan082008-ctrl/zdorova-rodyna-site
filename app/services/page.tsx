import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Послуги — Здорова Родина",
  description:
    "МРТ, КТ, УЗД, лабораторні дослідження та консультації лікарів у Рівному.",
};

const items = [
  {
    title: "МРТ",
    category: "Діагностика",
    text: "Дослідження на MAGNETOM Flow Plus від Siemens: висока деталізація, швидкі протоколи та знижений рівень шуму.",
  },
  {
    title: "КТ та КТ-коронарографія",
    category: "Діагностика",
    text: "Комп’ютерна томографія та неінвазивне дослідження коронарних судин для оцінки стану артерій.",
  },
  {
    title: "УЗД",
    category: "Діагностика",
    text: "Ультразвукові дослідження органів, судин, серця, м’яких тканин для дорослих і дітей.",
  },
  {
    title: "Лабораторні дослідження",
    category: "Аналізи",
    text: "Загальноклінічні, біохімічні, гормональні, імунологічні, генетичні та інші дослідження.",
  },
  {
    title: "Консультації лікарів",
    category: "Прийом",
    text: "Сімейні лікарі, терапевти, кардіологи, ендокринологи, гастроентерологи та інші спеціалісти.",
  },
  {
    title: "Холтер та кардіодіагностика",
    category: "Серце",
    text: "Добове моніторування ЕКГ, електрокардіографія та ультразвукове дослідження серця.",
  },
  {
    title: "Аналізи вдома",
    category: "Виїзна служба",
    text: "Виклик медсестри для забору біоматеріалу вдома з виїздом корпоративним автомобілем.",
  },
  {
    title: "Результати дистанційно",
    category: "Зручно",
    text: "Отримання результатів лабораторних досліджень електронною поштою, у Viber або Telegram.",
  },
  {
    title: "Скринінг здоров’я 40+",
    category: "Профілактика",
    text: "Комплексне обстеження для раннього виявлення серцево-судинних захворювань, діабету та інших ризиків.",
  },
];

const analyses = [
  "Загальноклінічні дослідження",
  "Біохімічні дослідження",
  "Діабетична панель",
  "Гормони та фактори росту",
  "Онкологічні маркери",
  "Кардіо-ревматоїдна панель",
  "Імунологічні дослідження",
  "Цитологія та мікроскопія",
  "Інфекції та TORCH",
  "Алергологічні дослідження",
  "Генетичні дослідження",
  "Бактеріологічні посіви",
];

export default function ServicesPage() {
  return (
    <main className="inner-page">
      <SiteHeader active="services" />
      <section className="page-hero">
        <span className="section-kicker">Послуги</span>
        <h1>Діагностика, аналізи та лікарі в одному центрі</h1>
        <p>
          Оберіть потрібний напрям. Адміністратор уточнить підготовку, доступний
          час і актуальну вартість за телефоном.
        </p>
      </section>
      <section className="route-grid services-route-grid" aria-label="Перелік послуг">
        {items.map((item, index) => (
          <article className="route-card" key={item.title}>
            <span className="route-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="route-category">{item.category}</span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <a className="text-button" href="/contacts#booking">
              Записатися <span>→</span>
            </a>
          </article>
        ))}
      </section>
      <section className="catalog-section">
        <div>
          <span className="section-kicker">Лабораторія</span>
          <h2>Основні напрями досліджень</h2>
        </div>
        <ul className="catalog-list">
          {analyses.map((item) => <li key={item}>{item}</li>)}
        </ul>
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
