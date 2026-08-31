import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import type { CenterLocation } from "../../contacts/locationData";
import { centerLocations, getDirectionsUrl } from "../../contacts/locationData";
import type { Doctor } from "../../doctors/doctorData";
import type { PriceItem } from "../../prices/priceData";
import type { ServiceDetail } from "../serviceData";
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

const benefits = [
  ["Швидке сканування", "Сучасне обстеження з мінімальним часом позиціонування."],
  ["Точна деталізація", "Пошарові зображення органів, судин, кісток і м’яких тканин."],
  ["Лікарі-рентгенологи", "Зображення аналізує лікар та готує структурований висновок."],
  ["3D-реконструкції", "Додаткова візуалізація допомагає оцінити складні анатомічні ділянки."],
];

const areaDetails: Record<CtPriceGroupId, { text: string; artwork: string }> = {
  head: { text: "Головний мозок, приносові пазухи та лицевий скелет.", artwork: "/ct-area-cards/head.webp" },
  bones: { text: "Хребет, кістки таза, кінцівки та великі суглоби.", artwork: "/ct-area-cards/bones.webp" },
  neck: { text: "М’які тканини шиї, глотка, гортань і лімфовузли.", artwork: "/ct-area-cards/neck.webp" },
  chest: { text: "Легені, середостіння та інші органи грудної клітки.", artwork: "/ct-area-cards/chest.webp" },
  abdomen: { text: "Органи черевної порожнини, сечовидільна система та малий таз.", artwork: "/ct-area-cards/abdomen.webp" },
  combined: { text: "Кілька анатомічних ділянок в одному узгодженому протоколі.", artwork: "/ct-area-cards/combined.webp" },
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
  ["Скільки триває дослідження?", "Саме сканування зазвичай коротке, однак загальний час залежить від зони, підготовки та потреби у контрастуванні."],
  ["Як швидко буде готовий висновок?", "Термін підготовки висновку залежить від складності дослідження. Орієнтовний час повідомить адміністратор."],
  ["Коли потрібен контраст?", "Рішення приймає лікар відповідно до клінічного запиту. Контраст не є автоматичною частиною кожного КТ."],
  ["Чим КТ відрізняється від МРТ?", "КТ використовує рентгенівське випромінювання та особливо інформативна для легень, кісток і невідкладних станів. МРТ працює на основі магнітного поля."],
];

const pageAnchors = [
  { href: "#ct-areas", label: "Що можна обстежити" },
  { href: "#ct-indications", label: "Показання" },
  { href: "#ct-preparation", label: "Підготовка" },
  { href: "#ct-doctors", label: "Наші фахівці" },
  { href: "#ct-locations", label: "Адреси" },
  { href: "#ct-prices", label: "Ціни та запис", accent: true },
];

function AnchorMark({ accent = false }: { accent?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {accent
        ? <path d="M7 20V5m0 1h9.5l-1.6 3 1.6 3H7" />
        : <path d="m6.5 12.5 3.3 3.3 7.7-8" />}
    </svg>
  );
}

function SectionTitle({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return <header className={styles.sectionTitle}>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2>{lead && <p>{lead}</p>}</header>;
}

function IconMark({ index }: { index: number }) {
  const paths = [
    <path key="a" d="M5 12h3l2-5 4 10 2-5h3" />,
    <path key="b" d="M5 7l7-3 7 3-7 3-7-3Zm0 5 7 3 7-3M5 17l7 3 7-3" />,
    <path key="c" d="M9 19v-2a3 3 0 0 1 6 0v2M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />,
    <path key="d" d="m5 8 7-4 7 4v8l-7 4-7-4V8Zm0 0 7 4 7-4M12 12v8" />,
  ];
  return <svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">{paths[index]}</g></svg>;
}

export function CtServicePage({ service, doctors, prices, bookingHref, priceHref }: Props) {
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
    ["novak-bohdana", 3],
  ]);
  const shownDoctors = [...doctors]
    .sort((left, right) => (doctorOrder.get(left.id) ?? 99) - (doctorOrder.get(right.id) ?? 99))
    .slice(0, 4);

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
          <div className={styles.heroActions}><Link className={styles.primaryButton} href={bookingHref}>Записатися <span>→</span></Link><Link className={styles.secondaryButton} href={priceHref}>Переглянути вартість <span>→</span></Link></div>
        </div>
      </section>

      <section className={styles.benefits} aria-label="Переваги КТ">
        {benefits.map(([title, text], index) => <article key={title}><IconMark index={index} /><div><h2>{title}</h2><p>{text}</p></div></article>)}
      </section>

      <nav className={styles.anchorNav} aria-label="Навігація розділами сторінки КТ">
        <div className={styles.anchorTrack}>
          {pageAnchors.map((item) => (
            <a className={item.accent ? styles.anchorAccent : undefined} href={item.href} key={item.href}>
              <span className={styles.anchorMark}><AnchorMark accent={item.accent} /></span>
              <span className={styles.anchorLabel}>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

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
                <h3>{area.label}</h3>
                <p>{area.text}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.infoColumns}`}>
        <div id="ct-indications"><SectionTitle title={service.indicationsTitle} />
          <ul className={styles.checkList}>{service.indications.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div id="ct-preparation"><SectionTitle title="Що важливо знати перед записом" />
          <ul className={styles.infoList}>{important.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.equipmentDoctors}`} id="ct-doctors">
        <article className={styles.equipmentCard}>
          <div className={styles.equipmentMedia}><Image className={styles.equipmentImage} src="/service-heroes/ct-philips-brilliance-64-studio-v2.webp" alt="Комп’ютерний томограф Philips Brilliance 64" fill unoptimized sizes="(max-width: 760px) 100vw, 44vw" /></div>
          <div className={styles.equipmentCopy}><span>Наше обладнання</span><h2>Philips Brilliance 64</h2><p>64-зрізовий томограф для швидкого пошарового сканування, точних 3D-реконструкцій і контрольованого променевого навантаження.</p></div>
        </article>
        <div>
          <SectionTitle title="Наші лікарі-рентгенологи" lead="Реальні фахівці центру, які працюють із діагностичними зображеннями." />
          <div className={styles.doctorRail}>{shownDoctors.map((doctor) => <article className={styles.doctorCard} key={doctor.id}><div className={styles.doctorPhoto}><Image src={doctor.photoUrl} alt={doctor.name} fill unoptimized sizes="(max-width: 760px) 58vw, 220px" /></div><strong>{doctor.name}</strong><span>{doctor.specialty}</span></article>)}</div>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Як усе відбувається" />
        <div className={styles.processGrid}>{service.process.map((step, index) => <article key={step.title}><span>0{index + 1}</span><IconMark index={Math.min(index, 3)} /><div><h3>{step.title}</h3><p>{step.text}</p></div></article>)}</div>
      </section>

      <section className={styles.section} id="ct-locations">
        <SectionTitle title="Де пройти КТ" lead="Доступність потрібного протоколу у вибраному відділенні підтвердить адміністратор." />
        <div className={styles.locationGrid}>{locations.map((location: CenterLocation) => <article key={location.id}><div className={styles.locationPhoto}><Image src={location.gallery[0]?.src ?? "/locations/stelmakha-18m.webp"} alt={location.gallery[0]?.alt ?? location.fullAddress} fill unoptimized sizes="(max-width: 760px) 100vw, 32vw" /></div><div><strong>{location.city}</strong><p>{location.address}</p><span>{location.hours[0]}</span><a href={getDirectionsUrl(location)} target="_blank" rel="noreferrer">Показати на карті <span>→</span></a></div></article>)}</div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Часті запитання про КТ" />
        <div className={styles.faqGrid}>{faq.map(([question, answer]) => <details key={question}><summary><span>{question}</span><b aria-hidden="true">+</b></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className={styles.section} id="ct-prices">
        <SectionTitle title="Ціни та запис на КТ" lead="Оберіть потрібну ділянку. Остаточний протокол і необхідність контрастування підтвердить адміністратор." />
        <CtPriceTabs items={prices} />
      </section>

      <section className={styles.finalCta}>
        <div><span>Потрібно уточнити дослідження або обрати зручний час?</span><p>Залиште заявку або зателефонуйте — допоможемо обрати потрібне КТ та підготовку.</p></div>
        <Link className={styles.primaryButton} href={bookingHref}>Записатися на КТ <span>→</span></Link>
        <a href="tel:+380676714444">+38 (067) 671-44-44</a>
      </section>

      <SiteFooter />
    </main>
  );
}
