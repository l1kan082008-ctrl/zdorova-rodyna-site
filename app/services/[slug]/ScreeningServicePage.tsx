import Image from "next/image";
import Link from "next/link";
import { sitePhoneHref } from "@/lib/siteSettings";
import { getSiteSettings } from "../../api/settings/settingsStore";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import type { ServiceDetail } from "../serviceData";
import { ScreeningTherapists } from "./ScreeningTherapists";
import { screeningStructuredData } from "../screeningContent";
import { screeningAddress } from "@/lib/screening40";
import styles from "./ScreeningServicePage.module.css";

const screeningFaq = [
  {
    question: "Де пройти скринінг здоров’я 40+ у Рівному?",
    answer: `У медичному центрі «Здорова Родина» скринінг здоров’я 40+ проводимо лише за адресою: ${screeningAddress}. Залиште заявку на цій сторінці або зателефонуйте нам. Адміністратор погодить дату й час візиту та пояснить підготовку до обстеження.`,
  },
  {
    question: "Хто може взяти участь у програмі?",
    answer: "Програма доступна громадянам України, яким виповнилося 40 років, незалежно від місця реєстрації чи проживання. Заяву на участь можна подати через Дію або ЦНАП — чекати дня народження не потрібно.",
  },
  {
    question: "Які аналізи входять у скринінг 40+?",
    answer: "Основні лабораторні дослідження — ліпідограма та глікований гемоглобін. Інші аналізи й ЕКГ із розділу «За показаннями» призначає лікар. Скринінг також включає огляд, оцінку факторів ризику та профілактичні рекомендації.",
  },
  {
    question: "Як оплачується обстеження за державною програмою?",
    answer: "Для участі держава надає 2 000 грн цільової підтримки на Дія.Картку. Ці кошти призначені для оплати скринінгу в закладі — учаснику програми. Після зарахування їх потрібно використати протягом двох місяців.",
  },
  {
    question: "Чи можна лише здати аналізи без огляду лікаря?",
    answer: "Ні. За програмою «Скринінг здоров’я 40+» огляд і консультація лікаря є обов’язковими складовими комплексного обстеження. Програма включає анкетування, оцінку факторів ризику, огляд і лабораторні дослідження. Лікар пояснює результати та надає індивідуальні рекомендації. Лише здача аналізів не є проходженням скринінгу. Конкретного лікаря можна обрати під час подання заявки або пізніше — за допомогою адміністратора.",
  },
] as const;

const examinationGroups = [
  {
    title: "Огляд та профілактика",
    items: [
      "Вимірювання тиску, пульсу, ваги, зросту й окружності талії; визначення індексу маси тіла (ІМТ).",
      "Збір даних про фактори ризику та скринінг симптомів.",
      "Консультування щодо харчування, фізичної активності, способу життя та шкідливих звичок.",
    ],
  },
  {
    title: "Аналізи та дослідження",
    items: ["Ліпідограма.", "Глікований гемоглобін."],
  },
  {
    title: "За показаннями",
    items: [
      "Креатинін сироватковий із розрахунком швидкості клубочкової фільтрації (ШКФ) та мікроальбумін сечі.",
      "Електроліти крові.",
      "Загальний аналіз крові.",
      "Загальний аналіз сечі.",
      "Електрокардіографія (ЕКГ).",
    ],
  },
];

export async function ScreeningServicePage({ service }: { service: ServiceDetail }) {
  const settings = await getSiteSettings();
  const phoneHref = sitePhoneHref(settings.phone);

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(screeningStructuredData(settings.phone)).replace(/</g, "\\u003c") }}
      />
      <SiteHeader active="services" bookingHref="#screening-doctors" />

      <section className={`${styles.hero} service-banner-shell`} aria-labelledby="service-detail-title">
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            className={styles.heroImage}
            src="/promo/screening-40.webp"
            alt=""
            fill
            preload
            quality={85}
            sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1288px) calc(100vw - 48px), 1240px"
          />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`${styles.heroCopy} service-banner-copy`}>
          <nav aria-label="Хлібні крихти">
            <Link href="/services">Послуги</Link><span aria-hidden="true">/</span><span>Скринінг 40+</span>
          </nav>
          <span className={styles.kicker}>{service.category}</span>
          <h1 id="service-detail-title">Скринінг здоров’я 40+ у Рівному</h1>
          <p>{service.lead}</p>
          <div className="service-banner-actions">
            <a className="book-button" href="#screening-doctors">Подати заявку <span aria-hidden="true">↓</span></a>
            <a className="outline-button" href={phoneHref}>Зателефонувати <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.introduction}`} aria-labelledby="screening-about-title">
        <header>
          <span className={styles.kicker}>Профілактика після 40</span>
          <h2 id="screening-about-title">Знати свої ризики — подбати про себе</h2>
        </header>
        <div>
          <p>{service.overview}</p>
          <p>Програма доступна громадянам України віком від 40 років. Держава надає 2 000 грн цільової підтримки для оплати скринінгу на Дія.Картку.</p>
          <p>Скринінг 40+ проводимо лише за адресою: {screeningAddress}. Залиште заявку онлайн або телефоном — адміністратор погодить зручний час. <Link href="/contacts" className={styles.textLink}>Контакти медичного центру <span aria-hidden="true">→</span></Link></p>
        </div>
      </section>

      <section className={styles.section} id="screening-included" aria-labelledby="screening-included-title">
        <header className={styles.sectionHeading}>
          <span className={styles.kicker}>Склад обстеження</span>
          <h2 id="screening-included-title">Що входить у скринінг</h2>
        </header>
        <div className={styles.examinationGrid}>
          {examinationGroups.map((group, index) => (
            <article key={group.title}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3>{group.title}</h3>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
        <p className={styles.note}>Дослідження з розділу «За показаннями» призначає лікар відповідно до вашого стану та результатів огляду.</p>
      </section>

      <section className={styles.section} aria-labelledby="screening-steps-title">
        <header className={styles.sectionHeading}>
          <span className={styles.kicker}>Від заявки до рекомендацій</span>
          <h2 id="screening-steps-title">Як пройти скринінг 40+</h2>
        </header>
        <ol className={styles.steps}>
          <li>
            <span className={styles.number} aria-hidden="true">01</span>
            <div><h3>Оформіть участь</h3><p>Подайте заяву в застосунку Дія або через ЦНАП. Чекати дня народження не потрібно. Після зарахування коштів є два місяці, щоб оплатити скринінг.</p></div>
          </li>
          <li>
            <span className={styles.number} aria-hidden="true">02</span>
            <div><h3>Залиште заявку</h3><p>Вкажіть повне ім’я та номер телефону у формі нижче або зателефонуйте нам. Конкретного лікаря можна обрати під час підтвердження запису. Адміністратор погодить дату, час візиту й підготовку до скринінгу.</p></div>
          </li>
          <li>
            <span className={styles.number} aria-hidden="true">03</span>
            <div><h3>Отримайте рекомендації</h3><p>Пройдіть огляд і дослідження. Лікар пояснить результати, надасть індивідуальні поради та за потреби визначить подальший маршрут допомоги.</p></div>
          </li>
        </ol>
      </section>

      <section className={`${styles.section} ${styles.faq}`} id="screening-faq" aria-labelledby="screening-faq-title">
        <header className={styles.sectionHeading}>
          <span className={styles.kicker}>Відповіді перед візитом</span>
          <h2 id="screening-faq-title">Часті запитання про скринінг 40+</h2>
        </header>
        <div className="faq-list">
          {screeningFaq.map(({ question, answer }) => (
            <details className="faq-item" key={question}>
              <summary className="faq-question">
                <span className="faq-question-copy"><strong>{question}</strong></span>
                <span className="faq-toggle" aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <ScreeningTherapists phone={settings.phone} />

      <p className={styles.sources}>Умови державної програми: <a href="https://screening.moz.gov.ua/" target="_blank" rel="noreferrer">офіційний сайт «Скринінг здоров’я 40+»</a>.</p>
      <SiteFooter />
    </main>
  );
}
