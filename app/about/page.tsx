import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Про центр — Здорова Родина",
  description:
    "Знайомство з медичним центром Здорова Родина у Рівному: підхід до пацієнта, напрями діагностики та принципи роботи.",
};

const directions = [
  {
    number: "01",
    title: "Лабораторні дослідження",
    text: "Від базових аналізів до комплексних програм — із підказками щодо підготовки та зрозумілим способом отримання результатів.",
    href: "/prices",
  },
  {
    number: "02",
    title: "МРТ, КТ та УЗД",
    text: "Візуальна діагностика для уточнення стану органів і систем. Допоможемо обрати потрібне дослідження та підготуватися до нього.",
    href: "/services",
  },
  {
    number: "03",
    title: "Діагностика серця",
    text: "ЕКГ, ЕхоКГ і Холтер-моніторинг для оцінки роботи серця в спокої та протягом звичного дня.",
    href: "/contacts?service=Кардіологія#booking",
  },
  {
    number: "04",
    title: "Консультації лікарів",
    text: "Фахівці різних напрямів приймають дорослих і дітей, пояснюють результати та допомагають визначити наступний крок.",
    href: "/doctors",
  },
];

const patientJourney = [
  {
    title: "Звернення",
    text: "Ви розповідаєте, що турбує, або називаєте потрібну послугу. Адміністратор уточнює деталі без зайвих запитань.",
  },
  {
    title: "Підготовка",
    text: "До візиту ви отримуєте прості рекомендації: що взяти із собою, чи можна їсти та скільки часу триватиме процедура.",
  },
  {
    title: "Дослідження",
    text: "У центрі вас супроводжують від реєстрації до завершення обстеження, щоб маршрут був зрозумілим і спокійним.",
  },
  {
    title: "Результат",
    text: "Пояснюємо, коли й де буде готовий результат, а за потреби допомагаємо обрати лікаря для подальшої консультації.",
  },
];

const values = [
  {
    title: "Пояснюємо людською мовою",
    text: "Пацієнт має розуміти, навіщо потрібне дослідження, як воно відбувається і що робити після отримання результату.",
  },
  {
    title: "Поважаємо ваш час",
    text: "Допомагаємо скласти зручний маршрут, попереджаємо про підготовку та не змушуємо самостійно шукати наступний кабінет.",
  },
  {
    title: "Дивимося на ситуацію цілісно",
    text: "Поєднання лабораторії, діагностики та лікарських консультацій дозволяє пройти основні етапи в одному центрі.",
  },
  {
    title: "Зберігаємо відчуття турботи",
    text: "Для нас важливі не лише точні дані, а й спокійна комунікація, делікатність та підтримка пацієнта.",
  },
];

export default function AboutPage() {
  return (
    <main className="inner-page">
      <SiteHeader active="about" />

      <section className="page-hero about-page-hero">
        <span className="section-kicker">Про центр</span>
        <h1>Медицина, в якій усе пояснюють</h1>
        <p>
          «Здорова Родина» — медичний центр у Рівному, де діагностика,
          лабораторні дослідження та консультації лікарів об’єднані в один
          зрозумілий маршрут для пацієнта.
        </p>
      </section>

      <section className="about-route" aria-labelledby="about-story-title">
        <div className="about-route-copy">
          <span className="section-kicker">Наша ідея</span>
          <h2 id="about-story-title">Менше тривоги. Більше ясності.</h2>
          <p>
            Звернення до медичного центру часто починається з бажання отримати
            чітку відповідь про стан здоров’я та зрозуміти, який крок буде
            правильним далі.
          </p>
          <p>
            Тому ми будуємо роботу навколо простого принципу: уважно вислухати,
            підібрати доречний маршрут, пояснити підготовку та не залишити
            пацієнта наодинці з незрозумілим результатом.
          </p>
          <Link className="outline-button" href="/contacts#booking">
            Записатися на прийом <span>→</span>
          </Link>
        </div>
        <div
          className="about-route-photo"
          role="img"
          aria-label="Світла рецепція медичного центру Здорова Родина"
        />
      </section>

      <section className="about-directions" aria-labelledby="about-directions-title">
        <div className="about-directions-head">
          <span className="section-kicker">Можливості центру</span>
          <h2 id="about-directions-title">
            Основні етапи турботи про здоров’я — в одному місці
          </h2>
          <p>
            Від першого дослідження до консультації фахівця: можна пройти лише
            потрібний етап або скласти послідовний маршрут разом з
            адміністратором.
          </p>
        </div>
        <div className="about-directions-grid">
          {directions.map((direction) => (
            <Link href={direction.href} key={direction.title}>
              <span>{direction.number}</span>
              <h3>{direction.title}</h3>
              <p>{direction.text}</p>
              <strong>
                Детальніше <span aria-hidden="true">→</span>
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-journey" aria-labelledby="about-journey-title">
        <div className="about-journey-intro">
          <span className="section-kicker">Як усе відбувається</span>
          <h2 id="about-journey-title">Шлях пацієнта без зайвої плутанини</h2>
          <p>
            Ми продумали послідовність дій так, щоб у кожний момент було
            зрозуміло, що відбувається зараз і що буде далі.
          </p>
        </div>
        <ol className="about-journey-steps">
          {patientJourney.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-values" aria-labelledby="about-values-title">
        <div className="about-values-head">
          <span className="section-kicker">Наші принципи</span>
          <h2 id="about-values-title">
            Довіра починається не з кабінету, а зі ставлення
          </h2>
        </div>
        <div className="values-grid">
          {values.map((value, index) => (
            <article key={value.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="subpage-cta">
        <div>
          <span className="section-kicker">Потрібна допомога з вибором?</span>
          <h2>Розкажіть, що вас турбує — підкажемо, з чого почати</h2>
        </div>
        <Link className="book-button" href="/contacts#booking">
          Звернутися до центру <span>→</span>
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
