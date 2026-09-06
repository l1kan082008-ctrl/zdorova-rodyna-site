import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import type { CenterLocation } from "../../contacts/locationData";
import { centerLocations, getDirectionsUrl } from "../../contacts/locationData";
import type { Doctor } from "../../doctors/doctorData";
import type { PriceItem } from "../../prices/priceData";
import type { ServiceDetail } from "../serviceData";
import { CtFaqAccordion } from "./CtFaqAccordion";
import { CtPriceTabs } from "./CtPriceTabs";
import { CT_PRICE_GROUPS, type CtPriceGroupId } from "./ctPriceGroups";
import styles from "./CtServicePage.module.css";

type Props = {
  service: ServiceDetail;
  doctors: Doctor[];
  prices: PriceItem[];
  bookingHref: string;
  priceHref: string;
};

const areaDetails: Record<CtPriceGroupId, { title?: string; text: string; artwork: string }> = {
  head: { text: "Головний мозок, приносові пазухи та лицевий скелет.", artwork: "/ct-area-cards/head.webp" },
  bones: { text: "Хребет, кістки таза, кінцівки та великі суглоби.", artwork: "/ct-area-cards/bones.webp" },
  neck: { text: "М’які тканини шиї, глотка, гортань і лімфовузли.", artwork: "/ct-area-cards/neck.webp" },
  chest: { title: "Грудна клітина", text: "Легені, середостіння та інші органи грудної клітки (ОГК).", artwork: "/ct-area-cards/chest.webp" },
  abdomen: { title: "Живіт і малий таз", text: "Черевна порожнина, заочеревинний простір і органи малого таза.", artwork: "/ct-area-cards/abdomen.webp" },
  combined: { title: "Кілька ділянок", text: "Комбіновані дослідження в одному узгодженому протоколі.", artwork: "/ct-area-cards/combined.webp" },
  angiography: { text: "Судини голови, шиї, аорти та верхніх або нижніх кінцівок.", artwork: "/ct-area-cards/angiography.webp" },
  heart: { text: "Коронарні судини, кальцієвий індекс та КТ з ЕКГ-синхронізацією.", artwork: "/ct-area-cards/heart.webp" },
  additional: { text: "Денситометрія, контрастування та супровідні позиції КТ.", artwork: "/ct-area-cards/additional.webp" },
};

const areas = CT_PRICE_GROUPS.map((group) => ({ ...group, ...areaDetails[group.id] }));

const important = [
  "Для більшості досліджень без контрасту спеціальна підготовка не потрібна.",
  "Контрастування застосовується не для всіх досліджень і визначається лікарем.",
  "Перед КТ із контрастом може знадобитися актуальний результат креатиніну.",
  "Повідомте під час запису про вагітність, алергічні реакції та захворювання нирок.",
];

const faq = [
  ["Чи потрібне направлення на КТ?", "Направлення бажане: воно допомагає обрати правильну зону та протокол. Якщо його немає, адміністратор підкаже, як коректно записатися."],
  ["Чи потрібно здавати креатинін?", "Для КТ із внутрішньовенним контрастуванням може знадобитися актуальний результат креатиніну. Це уточнюють під час запису."],
  ["Скільки триває дослідження?", "Саме КТ-сканування може тривати від кількох секунд до 5 хвилин. Разом із позиціонуванням і підготовкою дослідження без контрасту зазвичай займає 10–15 хвилин, із контрастуванням — приблизно 20–40 хвилин. Час залежить від зони та протоколу; точну тривалість повідомить адміністратор під час запису."],
  ["Як швидко буде готовий висновок?", "Висновок КТ зазвичай готуємо протягом 1–2 днів після дослідження. Для складних або об’ємних досліджень термін може відрізнятися — точний час повідомить адміністратор."],
  ["Коли потрібен контраст?", "Рішення приймає лікар відповідно до клінічного запиту. Контраст не є автоматичною частиною кожного КТ."],
  ["Чим КТ відрізняється від МРТ?", "КТ створює пошарові зображення за допомогою рентгенівського випромінювання. Дослідження триває швидко й особливо добре показує легені, кістки, судини, травми, крововиливи та інші гострі стани. МРТ використовує магнітне поле, не має іонізуючого випромінювання та детальніше візуалізує головний і спинний мозок, зв’язки, суглоби й інші м’які тканини, але зазвичай потребує більше часу. КТ обмежують під час вагітності, а МРТ може мати обмеження за наявності певних металевих імплантів або електронних пристроїв. Контрастні препарати для КТ і МРТ також різні. Оптимальний метод обирає лікар залежно від симптомів і ділянки обстеження: ці методи не замінюють, а доповнюють один одного."],
] as const;

function SectionTitle({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return <header className={styles.sectionTitle}>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2>{lead && <p>{lead}</p>}</header>;
}

export function CtServicePage({ service, doctors, prices, bookingHref }: Props) {
  const ctLocationIds = new Set([
    "stelmakha-18m",
    "olesia-13",
    "kostopil-hrushevskoho-4",
  ]);
  const locations = centerLocations.filter((location) => ctLocationIds.has(location.id));
  const doctorOrder = new Map([
    ["rohalskyi-vitalii", 0],
    ["zhyber-kostiantyn", 1],
    ["pysarchuk-taras", 2],
    ["verchenko-dmytro", 3],
    ["novak-bohdana", 4],
  ]);
  const shownDoctors = [...doctors]
    .sort((left, right) => (doctorOrder.get(left.id) ?? 99) - (doctorOrder.get(right.id) ?? 99))
    .slice(0, 5);

  return (
    <main className={styles.page}>
      <SiteHeader active="services" />

      <section className={styles.hero} aria-labelledby="ct-title">
        <Image className={styles.heroImage} src="/service-heroes/ct-cinematic-v1.webp" alt="Комп’ютерний томограф Philips Brilliance 64" fill priority unoptimized sizes="(max-width: 760px) 100vw, 94vw" />
        <div className={styles.heroShade} />
        <div className={styles.scanGraphic} aria-hidden="true">
          <svg viewBox="0 0 260 260" focusable="false">
            <circle className={styles.scanRingOuter} cx="130" cy="130" r="116" />
            <circle className={styles.scanRingInner} cx="130" cy="130" r="91" />
            <path className={styles.scanCorners} d="M38 78V42h36M186 42h36v36M222 182v36h-36M74 218H38v-36" />
            <g className={styles.scanSweep}>
              <path d="M26 130h208" />
              <circle cx="130" cy="130" r="5" />
            </g>
          </svg>
          <span className={styles.scanReadout}><strong>64</strong><small>зрізи</small></span>
        </div>
        <div className={styles.heroContent}>
          <nav aria-label="Хлібні крихти"><Link href="/services">Послуги</Link><span>/</span><span>КТ</span></nav>
          <span className={styles.eyebrow}>Променева діагностика</span>
          <h1 id="ct-title">Комп’ютерна<br />томографія</h1>
          <p>{service.lead}</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href={bookingHref}>Записатися <span>→</span></Link><Link className={styles.secondaryButton} href="#ct-prices">Переглянути вартість <span>→</span></Link></div>
        </div>
      </section>

      <section className={styles.section} id="ct-areas">
        <SectionTitle title="Що можна обстежити на КТ" lead="КТ дає детальне пошарове зображення різних органів і систем." />
        <div className={styles.areaGrid}>
          {areas.map((area, index) => (
            <a
              className={styles.areaCard}
              data-area={area.id}
              href={`#ct-prices-${area.id}`}
              aria-label={`Переглянути ціни: ${area.label}`}
              key={area.id}
            >
              <div className={styles.areaArtwork} aria-hidden="true">
                <Image src={area.artwork} alt="" fill unoptimized sizes="(max-width: 760px) 48vw, (max-width: 1100px) 34vw, 20vw" />
              </div>
              <div className={styles.areaContent}>
                <span className={styles.areaNumber}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{area.title ?? area.label}</h3>
                <p>{area.text}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section} id="ct-prices">
        <SectionTitle title="Ціни та запис на КТ" lead="Оберіть потрібну ділянку. Остаточний протокол і необхідність контрастування підтвердить адміністратор." />
        <CtPriceTabs items={prices} />
      </section>

      <section className={styles.section}>
        <div id="ct-indications" className={styles.indications}><SectionTitle eyebrow="Коли потрібне обстеження" title={service.indicationsTitle} />
          <ul className={styles.checkList}>{service.indications.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.equipmentDoctors}`} id="ct-doctors">
        <article className={styles.equipmentCard}>
          <div className={styles.equipmentMedia}><div className={styles.equipmentImageFrame}><Image className={styles.equipmentImage} src="/service-heroes/ct-philips-brilliance-64-cutout-v2.webp" alt="Комп’ютерний томограф Philips Brilliance 64" fill unoptimized sizes="(max-width: 760px) 100vw, 42vw" /></div></div>
          <div className={styles.equipmentCopy}><span>Наше обладнання</span><h2>Philips Brilliance 64</h2><p>64-зрізовий томограф для швидкого пошарового сканування, точних 3D-реконструкцій і контрольованого променевого навантаження.</p></div>
        </article>
        <div className={styles.doctorsPanel}>
          <SectionTitle title="Наші лікарі-рентгенологи" />
          <div className={styles.doctorRail}>{shownDoctors.map((doctor) => <article className={styles.doctorCard} data-doctor-id={doctor.id} key={doctor.id}><div className={styles.doctorPhoto}><Image src={doctor.photoUrl} alt={doctor.name} fill unoptimized sizes="(max-width: 760px) 70vw, (max-width: 1100px) 31vw, 19vw" /></div><strong>{doctor.name}</strong><span>{doctor.specialty}</span></article>)}</div>
        </div>
      </section>

      <section className={styles.section} id="ct-preparation">
        <SectionTitle eyebrow="Ваш візит" title="Підготовка та обстеження" />
        <div className={styles.preparationGrid}>
          <div>
            <h3 className={styles.preparationLabel}>Перед візитом</h3>
            <ul className={styles.infoList}>{important.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <ol className={styles.preparationSteps} aria-label="Етапи обстеження">
            {service.process.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className={styles.section} id="ct-locations">
        <SectionTitle title="Де пройти КТ" lead="Доступність потрібного протоколу у вибраному відділенні підтвердить адміністратор." />
        <div className={styles.locationGrid}>{locations.map((location: CenterLocation) => <article key={location.id}><div className={styles.locationPhoto}><Image src={location.gallery[0]?.src ?? "/locations/stelmakha-18m.webp"} alt={location.gallery[0]?.alt ?? location.fullAddress} fill unoptimized sizes="(max-width: 760px) 100vw, 32vw" /></div><div><strong>{location.city}</strong><p>{location.address}</p><span>{location.hours.map((hours, index) => <span key={hours}>{index > 0 && <br />}{hours}</span>)}</span><a href={getDirectionsUrl(location)} target="_blank" rel="noreferrer">Показати на карті <span>→</span></a></div></article>)}</div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Часті запитання про КТ" />
        <CtFaqAccordion items={faq} />
      </section>

      <section className={styles.finalCta} aria-labelledby="ct-support-title">
        <div className={styles.finalCtaCopy}>
          <span className={styles.finalCtaEyebrow}>Допоможемо з вибором</span>
          <h2 id="ct-support-title">Не впевнені, яке КТ обрати?</h2>
          <p>Зателефонуйте адміністратору — уточнимо дослідження, підготовку та зручний час.</p>
        </div>
        <div className={styles.finalCtaActions}>
          <a
            className={styles.finalCallButton}
            href="tel:+380676714444"
            aria-label="Зателефонувати до медичного центру: +38 (067) 671-44-44"
          >
            <span className={styles.finalCallText}>
              <strong>Зателефонувати</strong>
              <small>+38 (067) 671-44-44</small>
            </span>
          </a>
          <Link className={styles.finalRequestLink} href={bookingHref}>
            Залишити заявку
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
