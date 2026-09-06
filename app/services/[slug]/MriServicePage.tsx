import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import type { CenterLocation } from "../../contacts/locationData";
import { centerLocations, getDirectionsUrl } from "../../contacts/locationData";
import type { Doctor } from "../../doctors/doctorData";
import type { PriceItem } from "../../prices/priceData";
import type { ServiceDetail } from "../serviceData";
import { CtFaqAccordion } from "./CtFaqAccordion";
import { MriPriceTabs } from "./MriPriceTabs";
import { MRI_PRICE_GROUPS } from "./mriPriceGroups";
import mri from "./MriServicePage.module.css";
import styles from "./CtServicePage.module.css";

type Props = {
  service: ServiceDetail;
  doctors: Doctor[];
  prices: PriceItem[];
  bookingHref: string;
  priceHref: string;
};

const areas = MRI_PRICE_GROUPS;
const faq = [
  ["Як підготуватися до МРТ?", "Підготовка залежить від ділянки та протоколу. Під час запису уточніть рекомендації, візьміть направлення та результати попередніх досліджень."],
  ["Що повідомити перед записом?", "Повідомте про імпланти, кардіостимулятор, металеві конструкції, вагітність або годування грудьми. Сумісність пристроїв з МРТ потрібно перевірити заздалегідь."],
  ["Як обрати дослідження з контрастом?", "Передайте адміністратору направлення. Необхідність контрастування та підготовку узгоджують з лікарем; для дослідження може знадобитися результат аналізу на креатинін."],
  ["Що взяти із собою?", "Направлення, попередні знімки й висновки, виписки та документи на імплантований пристрій, якщо він є. Під час запису уточніть, які аналізи потрібні для вашого протоколу."],
] as const;

function SectionTitle({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return <header className={styles.sectionTitle}>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2>{lead && <p>{lead}</p>}</header>;
}

export function MriServicePage({ service, doctors, prices, bookingHref }: Props) {
  const locations = centerLocations.filter(location => location.services.includes("mri"));
  const shownDoctors = doctors.filter(doctor => doctor.id === "rohalskyi-vitalii").slice(0, 1);

  return (
    <main className={`${styles.page} ${mri.page}`}>
      <SiteHeader active="services" />

      <section className={`${styles.hero} ${mri.hero}`} aria-labelledby="mri-title">
        <Image className={`${styles.heroImage} ${mri.heroImage}`} src="/service-heroes/mri-cinematic-v1.webp" alt="МР-томограф Siemens MAGNETOM Flow Plus" fill priority unoptimized sizes="(max-width: 760px) 100vw, 94vw" />
        <div className={`${styles.heroShade} ${mri.heroShade}`} />
        <div className={`mri-cinematic-field ${mri.heroField}`} aria-hidden="true">
          <i /><i /><i />
          <b /><b /><b />
        </div>
        <div className={`${styles.heroContent} ${mri.heroContent}`}>
          <nav aria-label="Хлібні крихти"><Link href="/services">Послуги</Link><span>/</span><span>МРТ</span></nav>
          <span className={styles.eyebrow}>Магнітно-резонансна діагностика</span>
          <h1 id="mri-title">Магнітно-резонансна<br />томографія</h1>
          <p>{service.lead}</p>
          <div className={styles.heroActions}><Link className={`${styles.primaryButton} mri-booking-motion`} href={bookingHref}>Записатися <span>→</span></Link><Link className={styles.secondaryButton} href="#mri-prices">Переглянути вартість <span>→</span></Link></div>
        </div>
      </section>

      <section className={styles.section} id="mri-areas">
        <SectionTitle title="Що можна обстежити на МРТ" lead="Оберіть ділянку, щоб перейти до відповідних досліджень і вартості." />
        <div className={styles.areaGrid}>
          {areas.map((area, index) => (
            <a
              className={`${styles.areaCard} ${mri.areaCard}`}
              data-area={area.id}
              href={`#mri-prices-${area.id}`}
              aria-label={`Переглянути ціни: ${area.label}`}
              key={area.id}
            >
              <div className={`${styles.areaArtwork} ${mri.areaArtwork}`} aria-hidden="true">
                <Image src={area.artwork} alt="" fill unoptimized sizes="(max-width: 760px) 48vw, (max-width: 1100px) 34vw, 20vw" />
              </div>
              <div className={`${styles.areaContent} ${mri.areaContent}`}>
                <span className={styles.areaNumber}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{area.label}</h3>
                <p>{area.text}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section} id="mri-prices">
        <SectionTitle title="Ціни та запис на МРТ" lead="Оберіть потрібну ділянку. Протокол і необхідність контрастування узгоджують з лікарем." />
        <MriPriceTabs items={prices} />
      </section>

      <section className={`${styles.section} ${styles.equipmentDoctors}`} id="mri-doctors">
        <article className={`${styles.equipmentCard} ${mri.equipmentCard}`}>
          <div className={styles.equipmentMedia}><div className={`${styles.equipmentImageFrame} ${mri.equipmentImageFrame}`}><Image className={`${styles.equipmentImage} ${mri.equipmentImage}`} src="/service-heroes/mri-flow-plus-teal-v2.webp" alt="МР-томограф Siemens MAGNETOM Flow Plus" fill unoptimized sizes="(max-width: 760px) 100vw, 42vw" /></div></div>
          <div className={styles.equipmentCopy}><span>Наше обладнання</span><h2>Siemens MAGNETOM Flow Plus</h2><p>МР-томограф 1,5 Тесла · 2026 рік випуску.</p></div>
        </article>
        <div className={styles.doctorsPanel}>
          <SectionTitle title="Лікарі, які описують МРТ" />
          <div className={`${styles.doctorRail} ${mri.doctorRail}`}>{shownDoctors.map((doctor) => <article className={styles.doctorCard} data-doctor-id={doctor.id} key={doctor.id}><div className={styles.doctorPhoto}><Image src={doctor.photoUrl} alt={doctor.name} fill unoptimized sizes="(max-width: 760px) 70vw, (max-width: 1100px) 31vw, 19vw" /></div><strong>{doctor.name}</strong><span>{doctor.specialty}</span></article>)}{[1, 2, 3].map(number => <article className={styles.doctorCard} key={`placeholder-${number}`}><div className={`${styles.doctorPhoto} ${mri.placeholder}`} aria-hidden="true"><svg viewBox="0 0 120 140"><circle cx="60" cy="42" r="22" /><path d="M20 124v-12a40 40 0 0 1 80 0v12" /></svg></div><strong>Лікар-рентгенолог</strong><span>Інформацію додамо незабаром</span></article>)}</div>
        </div>
      </section>

      <section className={styles.section} id="mri-preparation">
        <SectionTitle eyebrow="Ваш візит" title="Підготовка та обстеження" />
        <div className={styles.preparationGrid}>
          <div>
            <h3 className={styles.preparationLabel}>Перед візитом</h3>
            <ul className={styles.infoList}>{service.preparation.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <ol className={styles.preparationSteps} aria-label="Етапи обстеження">
            {service.process.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className={styles.section} id="mri-locations">
        <SectionTitle title="Де пройти МРТ" lead="Доступність потрібного протоколу у вибраному відділенні підтвердить адміністратор." />
        <div className={`${styles.locationGrid} ${mri.locations}`}>{locations.map((location: CenterLocation) => <article key={location.id}><div className={styles.locationPhoto}><Image src={location.gallery[0]?.src ?? "/locations/stelmakha-18m.webp"} alt={location.gallery[0]?.alt ?? location.fullAddress} fill unoptimized sizes="(max-width: 760px) 100vw, 32vw" /></div><div><strong>{location.city}</strong><p>{location.address}</p><span>{location.hours.map((hours, index) => <span key={hours}>{index > 0 && <br />}{hours}</span>)}</span><a href={getDirectionsUrl(location)} target="_blank" rel="noreferrer">Показати на карті <span>→</span></a></div></article>)}</div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Часті запитання про МРТ" />
        <CtFaqAccordion items={faq} />
      </section>

      <section className={styles.finalCta} aria-labelledby="mri-support-title">
        <div className={styles.finalCtaCopy}>
          <span className={styles.finalCtaEyebrow}>Допоможемо з вибором</span>
          <h2 id="mri-support-title">Не впевнені, яке МРТ обрати?</h2>
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
