import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Пацієнтам | Здорова Родина",
  description:
    "Підготовка до обстежень, отримання результатів, часті запитання, пільги та знижки медичного центру «Здорова Родина».",
};

const patientNavigation = [
  { href: "/patients/preparation", label: "Підготовка до обстежень", number: "01" },
  { href: "#results", label: "Як отримати результати", number: "02" },
  { href: "#faq", label: "Часті запитання", number: "03" },
  { href: "#benefits", label: "Пільги та знижки", number: "04" },
];

const faqItems = [
  {
    title: "Чи потрібне направлення?",
    body: "На більшість платних консультацій та обстежень можна записатися без направлення. Якщо направлення є, візьміть його із собою — воно допоможе фахівцю точніше визначити обсяг дослідження.",
  },
  {
    title: "Що взяти із собою?",
    body: "Документ, що посвідчує особу, направлення за наявності, попередні висновки, знімки та перелік ліків. Для отримання пільги також потрібен документ, який підтверджує право на неї.",
  },
  {
    title: "Як перенести або скасувати візит?",
    body: "Зателефонуйте адміністратору за номером +38 (067) 671-44-44. Бажано повідомити про зміни завчасно, щоб ми запропонували інший зручний час.",
  },
  {
    title: "Як підготувати дитину до візиту?",
    body: "Спокійно поясніть, що відбуватиметься, і візьміть попередні медичні документи. Особливі правила підготовки залежать від віку дитини та виду обстеження — їх уточнить адміністратор.",
  },
  {
    title: "Чи можна отримати аналізи терміново?",
    body: "Для окремих лабораторних досліджень доступний режим ЦІТО — орієнтовно до двох годин із доплатою. Можливість термінового виконання конкретного аналізу підтвердить адміністратор.",
  },
];

const benefits = [
  { value: "20%", title: "Військовослужбовцям", note: "на всі послуги" },
  { value: "10%", title: "Внутрішньо переміщеним особам (ВПО)", note: "на всі послуги" },
  { value: "10%", title: "Людям з інвалідністю I та II групи", note: "на всі послуги" },
];

export default function PatientsPage() {
  return (
    <main className="inner-page patients-page">
      <SiteHeader active="patients" />

      <div className="patients-shell">
        <section className="patients-intro" aria-labelledby="patients-title">
          <div>
            <p className="section-label">Пацієнтам</p>
            <h1 id="patients-title">Корисна інформація перед візитом</h1>
          </div>
          <p>
            Підготовка, отримання результатів, відповіді на поширені запитання
            та чинні пільги — коротко й в одному місці.
          </p>
        </section>

        <nav className="patients-local-nav" aria-label="Розділи для пацієнтів">
          {patientNavigation.map((item) => (
            <a href={item.href} key={item.href}>
              <span>{item.number}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <section className="patients-section" id="results">
          <header className="patients-section-heading">
            <p className="section-label">Після обстеження</p>
            <h2>Як отримати результати</h2>
          </header>
          <div className="patients-result-grid">
            <article>
              <span>01</span>
              <h3>У відділенні</h3>
              <p>
                Адміністратор повідомить орієнтовний час готовності та підкаже,
                де забрати висновок, знімки або лабораторний бланк.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Дистанційно</h3>
              <p>
                За погодженням результати можна отримати електронною поштою,
                у Viber або Telegram. Оберіть зручний спосіб під час оформлення.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Строки готовності</h3>
              <p>
                Строк залежить від виду дослідження. Висновки КТ і МРТ можуть
                готуватися 1–2 дні; для доступних аналізів є режим ЦІТО до двох годин.
              </p>
            </article>
          </div>
        </section>

        <section className="patients-section" id="faq">
          <header className="patients-section-heading">
            <p className="section-label">Короткі відповіді</p>
            <h2>Часті запитання</h2>
          </header>
          <div className="patients-accordion patients-faq">
            {faqItems.map((item) => (
              <details key={item.title}>
                <summary>
                  {item.title}
                  <i aria-hidden="true">+</i>
                </summary>
                <p>{item.body}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="patients-section patients-benefits" id="benefits">
          <header className="patients-section-heading">
            <p className="section-label">Підтримка пацієнтів</p>
            <h2>Пільги та знижки</h2>
            <p>
              Щоб застосувати знижку, покажіть підтвердний документ адміністратору
              до оплати. Деталі можна уточнити під час запису.
            </p>
          </header>
          <div className="patients-benefit-list">
            {benefits.map((benefit) => (
              <article key={benefit.title}>
                <strong>{benefit.value}</strong>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
