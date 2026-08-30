import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listDoctors } from "../../api/doctors/doctorStore";
import { listPublicPriceItems } from "../../api/prices/priceStore";
import { GlowPriceCard } from "../../components/GlowPriceCard";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { defaultDoctors } from "../../doctors/doctorData";
import { catalogItems } from "../../prices/priceData";
import {
  priceReferences,
  resolvePriceItem,
  type PriceReference,
} from "../../prices/priceReferences";
import { getServiceDetail, serviceDetails } from "../serviceData";
import { FamilyDeclarationForm } from "./FamilyDeclarationForm";
import { ConsultationExperience } from "./ConsultationExperience";
import { CtServicePage } from "./CtServicePage";

export const dynamic = "force-dynamic";

const cardiologyBookingDefinitions: Array<{
  key: "consultation" | "ecg" | "echo" | "holter";
  reference: PriceReference;
  description: string;
}> = [
  {
    key: "consultation",
    reference: priceReferences.primaryConsultation,
    description:
      "Оцінка симптомів, тиску, ризиків і план подальшого лікування.",
  },
  {
    key: "ecg",
    reference: priceReferences.ecg,
    description:
      "Швидка реєстрація електричної активності та ритму серця.",
  },
  {
    key: "echo",
    reference: priceReferences.echoHeart,
    description: "Оцінка камер, клапанів і скоротливої функції серця.",
  },
  {
    key: "holter",
    reference: priceReferences.holter,
    description:
      "Добове моніторування серцевого ритму у звичному ритмі життя.",
  },
];

export function generateStaticParams() {
  return serviceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceDetail(slug);

  if (!service) {
    return {
      title: "Послугу не знайдено — Здорова Родина",
    };
  }

  return {
    title: `${service.title} — Здорова Родина`,
    description: service.lead,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceDetail(slug);
  if (!service) notFound();

  const bookingHref = `/contacts?service=${encodeURIComponent(
    service.shortTitle,
  )}#booking`;
  const priceHrefByService: Record<string, string> = {
    ct: "/prices?category=ct#price-calculator",
    mri: "/prices?category=mri#price-calculator",
    ultrasound: "/prices?category=ultrasound-group#price-calculator",
    lab: "/prices?category=analyses#price-calculator",
    consultation:
      "/prices?category=medical&search=%D0%9A%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D1%96%D1%8F#price-calculator",
    cardiology: "/prices?category=heart#price-calculator",
    holter:
      "/prices?category=heart&search=%D0%A5%D0%BE%D0%BB%D1%82%D0%B5%D1%80#price-calculator",
    "home-nurse":
      "/prices?category=analyses&search=%D0%9C%D0%B5%D0%B4%D1%81%D0%B5%D1%81%D1%82%D1%80%D0%B0%20%D0%B4%D0%BE%D0%B4%D0%BE%D0%BC%D1%83#price-calculator",
    family:
      "/prices?category=medical&search=%D0%A1%D1%96%D0%BC%D0%B5%D0%B9%D0%BD%D0%B8%D0%B9%20%D0%BB%D1%96%D0%BA%D0%B0%D1%80#price-calculator",
    "wart-removal":
      "/prices?category=medical&search=%D0%92%D0%B8%D0%B4%D0%B0%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%B1%D0%BE%D1%80%D0%BE%D0%B4%D0%B0%D0%B2%D0%BE%D0%BA#price-calculator",
    "ear-piercing":
      "/prices?category=medical&search=%D0%9F%D1%80%D0%BE%D0%BA%D0%BE%D0%BB%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F%20%D0%B2%D1%83%D1%85#price-calculator",
    dermoscopy:
      "/prices?category=medical&search=%D0%94%D0%B5%D1%80%D0%BC%D0%B0%D1%82%D0%BE%D1%81%D0%BA%D0%BE%D0%BF%D1%96%D1%8F#price-calculator",
    audiometry:
      "/prices?category=medical&search=%D0%90%D1%83%D0%B4%D1%96%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D1%96%D1%8F#price-calculator",
  };
  const priceHref = priceHrefByService[service.slug] ?? "/prices";
  const editorialImageByService: Record<string, string> = {
    consultation: "/service-cards/consultation-glass-v3.jpg",
    family: "/service-cards/family-glass-v3.jpg",
    "wart-removal": "/service-cards/wart-removal-glass-v3.jpg",
    "ear-piercing": "/service-cards/ear-piercing-glass-v3.jpg",
  };
  const editorialImage = editorialImageByService[service.slug] ?? service.image;
  const isCinematicHolter = service.slug === "holter";
  const isCinematicCt = service.slug === "ct";
  const isCinematicMri = service.slug === "mri";
  const isCinematicUltrasound = service.slug === "ultrasound";
  const isCardiology = service.slug === "cardiology";
  const isHomeNurse = service.slug === "home-nurse";
  const isCinematicDermoscopy = service.slug === "dermoscopy";
  const isCinematicEarPiercing = service.slug === "ear-piercing";
  const isCinematicWartRemoval = service.slug === "wart-removal";
  const isCinematicAudiometry = service.slug === "audiometry";
  const isCinematicLaboratory = service.slug === "lab";
  const isFamilyMedicine = service.slug === "family";
  const isConsultation = service.slug === "consultation";
  const isCompactProcedure = [
    "wart-removal",
    "ear-piercing",
    "dermoscopy",
    "audiometry",
  ].includes(service.slug);
  if (isCinematicCt) {
    const [doctors, prices] = await Promise.all([
      listDoctors().catch(() => defaultDoctors),
      listPublicPriceItems().catch(() => catalogItems),
    ]);
    const radiologists = doctors.filter((doctor) =>
      doctor.specialty.toLocaleLowerCase("uk-UA").includes("рентгенолог"),
    );
    const fallbackRadiologists = defaultDoctors.filter((doctor) =>
      doctor.specialty.toLocaleLowerCase("uk-UA").includes("рентгенолог"),
    );
    const ctPrices = prices.filter(
      (item) => item.category === "ct" && item.isActive !== false,
    );
    const fallbackCtPrices = catalogItems.filter(
      (item) => item.category === "ct" && item.isActive !== false,
    );

    return (
      <CtServicePage
        service={service}
        doctors={radiologists.length > 0 ? radiologists : fallbackRadiologists}
        prices={ctPrices.length > 0 ? ctPrices : fallbackCtPrices}
        bookingHref={bookingHref}
        priceHref={priceHref}
      />
    );
  }
  const relevantDoctors = isCardiology || isFamilyMedicine
    ? await listDoctors().catch(() => defaultDoctors)
    : [];
  const availableCardiologists = isCardiology
    ? relevantDoctors.filter(
        (doctor) =>
          doctor.specialty.toLocaleLowerCase("uk-UA").includes("кардіолог"),
      )
    : [];
  const availableFamilyDoctors = isFamilyMedicine
    ? relevantDoctors.filter((doctor) =>
        /сімей|педіатр|терапевт/i.test(doctor.specialty),
      )
    : [];
  const cardiologyPriceItems = isCardiology
    ? await listPublicPriceItems().catch(() => catalogItems)
    : catalogItems;
  const cardiologyBookingOptions = cardiologyBookingDefinitions.flatMap(
    (definition) => {
      const item = resolvePriceItem(
        cardiologyPriceItems,
        definition.reference,
      );
      if (!item) return [];

      return [
        {
          key: definition.key,
          priceItemId: item.id,
          title: item.name,
          description: definition.description,
          price: item.amount,
        },
      ];
    },
  );

  return (
    <main className="inner-page service-detail-page">
      <SiteHeader active="services" />

      {isCinematicHolter ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--holter-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div className="holter-cinematic-backdrop" aria-hidden="true" />
          <div className="holter-cinematic-shade" aria-hidden="true" />
          <div className="service-detail-hero-copy holter-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">{service.category}</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>{service.lead}</p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
          <div className="holter-cinematic-signal" aria-hidden="true">
            <svg viewBox="0 0 1040 64" preserveAspectRatio="none">
              <path d="M0 32H42C48 32 52 26 58 26C65 26 68 32 75 32H92L104 36L116 4L132 59L148 32H169C178 32 181 22 190 22C199 22 204 32 214 32H302C308 32 312 26 318 26C325 26 328 32 335 32H352L364 36L376 4L392 59L408 32H429C438 32 441 22 450 22C459 22 464 32 474 32H562C568 32 572 26 578 26C585 26 588 32 595 32H612L624 36L636 4L652 59L668 32H689C698 32 701 22 710 22C719 22 724 32 734 32H822C828 32 832 26 838 26C845 26 848 32 855 32H872L884 36L896 4L912 59L928 32H949C958 32 961 22 970 22C979 22 984 32 994 32H1040" />
              <path
                className="holter-cinematic-signal-beat"
                d="M0 32H42C48 32 52 26 58 26C65 26 68 32 75 32H92L104 36L116 4L132 59L148 32H169C178 32 181 22 190 22C199 22 204 32 214 32H302C308 32 312 26 318 26C325 26 328 32 335 32H352L364 36L376 4L392 59L408 32H429C438 32 441 22 450 22C459 22 464 32 474 32H562C568 32 572 26 578 26C585 26 588 32 595 32H612L624 36L636 4L652 59L668 32H689C698 32 701 22 710 22C719 22 724 32 734 32H822C828 32 832 26 838 26C845 26 848 32 855 32H872L884 36L896 4L912 59L928 32H949C958 32 961 22 970 22C979 22 984 32 994 32H1040"
              />
            </svg>
          </div>
          <div className="holter-cinematic-caption" aria-hidden="true">
            <span>24</span>
            <p>години у звичному ритмі життя</p>
          </div>
        </section>
      ) : isCinematicCt ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--ct-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div className="ct-cinematic-backdrop" aria-hidden="true" />
          <div className="ct-cinematic-shade" aria-hidden="true" />
          <div className="service-detail-hero-copy holter-cinematic-copy ct-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">{service.category}</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>{service.lead}</p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
              <span
                className="ct-cinematic-duration"
                aria-label="Орієнтовна тривалість — від п’яти хвилин"
              >
                <i aria-hidden="true" />
                Від 5 хвилин
              </span>
            </div>
          </div>
          <div className="ct-cinematic-slices" aria-hidden="true">
            <i />
          </div>
        </section>
      ) : isCinematicMri ? (
        <section
          className="service-detail-hero service-detail-hero--mri-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="mri-cinematic-backdrop"
            role="img"
            aria-label="Магнітно-резонансний томограф Siemens MAGNETOM Flow Plus 2026 року випуску"
          />
          <div className="mri-cinematic-shade" aria-hidden="true" />
          <div className="mri-cinematic-field" aria-hidden="true">
            <i />
            <i />
            <i />
            <b />
            <b />
            <b />
          </div>
          <div className="mri-cinematic-copy service-detail-hero-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">{service.category}</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>Siemens MAGNETOM Flow Plus · 1,5 Тесла</p>
            <div className="mri-cinematic-year">
              <span aria-hidden="true" />
              Апарат 2026 року
            </div>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : isCinematicUltrasound ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--ultrasound-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="ultrasound-cinematic-backdrop"
            role="img"
            aria-label="Сучасний ультразвуковий апарат і датчик"
          />
          <div className="ultrasound-cinematic-shade" aria-hidden="true" />
          <div className="ultrasound-cinematic-waves" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <b />
          </div>
          <div className="service-detail-hero-copy ultrasound-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Діагностика в реальному часі</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>Детальне обстеження без променевого навантаження.</p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : isCardiology ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--cardiology-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="cardiology-cinematic-backdrop"
            role="img"
            aria-label="Лікарка проводить пацієнтці ультразвукове дослідження серця"
          />
          <div className="cardiology-cinematic-shade" aria-hidden="true" />
          <div className="service-detail-hero-copy holter-cinematic-copy cardiology-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Точна діагностика серця</span>
            <h1 id="service-detail-title">Серце під надійним наглядом</h1>
            <p>{service.lead}</p>
            <div className="service-detail-actions">
              <Link className="book-button" href="#cardiology-services">
                Обрати послугу <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
          <div className="cardiology-cinematic-signal" aria-hidden="true">
            <svg viewBox="0 0 1520 80" preserveAspectRatio="none">
              <path d="M0 52H90L100 42L110 52H140L156 12L176 74L196 48H220L232 56L248 48H290L330 52C318 42 314 24 322 11C330 0 342 3 347 18C352 3 364 0 372 11C380 24 376 42 364 52H430L446 16L466 72L482 40L496 56L510 45L525 52H575L585 42L595 52H620L636 12L656 74L676 48H700L712 56L728 48H760H850L860 42L870 52H900L916 12L936 74L956 48H980L992 56L1008 48H1050L1090 52C1078 42 1074 24 1082 11C1090 0 1102 3 1107 18C1112 3 1124 0 1132 11C1140 24 1136 42 1124 52H1190L1206 16L1226 72L1242 40L1256 56L1270 45L1285 52H1335L1345 42L1355 52H1380L1396 12L1416 74L1436 48H1460L1472 56L1488 48H1520" />
              <path
                className="cardiology-cinematic-signal-beat"
                pathLength="1040"
                d="M0 52H90L100 42L110 52H140L156 12L176 74L196 48H220L232 56L248 48H290L330 52C318 42 314 24 322 11C330 0 342 3 347 18C352 3 364 0 372 11C380 24 376 42 364 52H430L446 16L466 72L482 40L496 56L510 45L525 52H575L585 42L595 52H620L636 12L656 74L676 48H700L712 56L728 48H760H850L860 42L870 52H900L916 12L936 74L956 48H980L992 56L1008 48H1050L1090 52C1078 42 1074 24 1082 11C1090 0 1102 3 1107 18C1112 3 1124 0 1132 11C1140 24 1136 42 1124 52H1190L1206 16L1226 72L1242 40L1256 56L1270 45L1285 52H1335L1345 42L1355 52H1380L1396 12L1416 74L1436 48H1460L1472 56L1488 48H1520"
              />
            </svg>
          </div>
        </section>
      ) : isFamilyMedicine ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--family-medicine"
          aria-labelledby="service-detail-title"
        >
          <div
            className="family-medicine-backdrop"
            role="img"
            aria-label="Сімейний лікар консультує родину"
          />
          <div className="family-medicine-shade" aria-hidden="true" />
          <div className="service-detail-hero-copy family-medicine-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>Сімейний лікар</span>
            </nav>
            <span className="section-kicker">Первинна медична допомога</span>
            <h1 id="service-detail-title">Ваш сімейний лікар — поруч</h1>
            <p>
              Оберіть лікаря, залиште заявку на декларацію та отримуйте
              первинну медичну допомогу в одному центрі.
            </p>
            <div className="family-medicine-badge">
              <span className="family-medicine-badge-icon" aria-hidden="true">
                ✓
              </span>
              <span className="family-medicine-badge-text">
                Заявка на декларацію · перевірка в ЕСОЗ
              </span>
            </div>
            <div className="service-detail-actions">
              <Link className="book-button" href="#family-declaration">
                Обрати лікаря <span>→</span>
              </Link>
              <Link className="outline-button" href="#family-nszu">
                Як працює НСЗУ <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : isCinematicLaboratory ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--laboratory-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="laboratory-cinematic-backdrop"
            role="img"
            aria-label="Лаборантка працює з автоматичним аналізатором та зразками крові"
          />
          <div className="laboratory-cinematic-shade" aria-hidden="true" />
          <div className="service-detail-hero-copy laboratory-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Власна лабораторія</span>
            <h1 id="service-detail-title">Лабораторні дослідження</h1>
            <div className="laboratory-cinematic-badge">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>ЦИТО · до 2 годин</span>
            </div>
            <p>{service.lead}</p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
          <div className="laboratory-sample-flow" aria-hidden="true">
            <svg viewBox="0 0 1180 104" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="laboratory-flow-glow" x="-300%" y="-300%" width="700%" height="700%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g className="laboratory-flow-tube">
                <path d="M48 18h28M54 18v40c0 13 16 19 24 9c3-3 4-7 4-11V18" />
                <path d="M55 50c7 4 18 4 26 0" />
              </g>
              <path
                className="laboratory-flow-line"
                d="M84 64C190 22 268 90 378 60S567 25 674 58S850 91 960 57S1051 34 1090 48"
              />
              <path
                className="laboratory-flow-dots"
                d="M84 64C190 22 268 90 378 60S567 25 674 58S850 91 960 57S1051 34 1090 48"
              />
              <g className="laboratory-flow-result">
                <path d="M1090 18h50v68h-50z" />
                <path d="M1101 36h28M1101 48h28M1101 60h18" />
                <path d="M1122 17v14h14" />
              </g>
              <circle className="laboratory-flow-pulse" r="5.5" filter="url(#laboratory-flow-glow)">
                <animateMotion
                  dur="6s"
                  repeatCount="indefinite"
                  path="M84 64C190 22 268 90 378 60S567 25 674 58S850 91 960 57S1051 34 1090 48"
                />
                <animate
                  attributeName="opacity"
                  dur="6s"
                  repeatCount="indefinite"
                  values="0;1;1;0"
                  keyTimes="0;0.08;0.9;1"
                />
              </circle>
            </svg>
          </div>
        </section>
      ) : isHomeNurse ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--home-nurse-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="home-nurse-cinematic-backdrop"
            role="img"
            aria-label="Медична сестра приїхала до пацієнта додому з професійним набором"
          />
          <div className="home-nurse-cinematic-shade" aria-hidden="true" />
          <div className="service-detail-hero-copy home-nurse-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Виїзна медична послуга</span>
            <h1 id="service-detail-title">Медсестра додому</h1>
            <p>Забір аналізів у вас вдома — у погоджений день і час.</p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
          <div className="home-nurse-route" aria-hidden="true">
            <svg viewBox="0 0 1120 110" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="home-nurse-route-glow" x="-300%" y="-300%" width="700%" height="700%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                id="home-nurse-route-main"
                className="home-nurse-route-main"
                d="M62 70C154 24 247 105 369 74C493 42 548 35 646 69C745 103 807 27 914 57C967 72 1002 76 1040 62"
              />
              <path
                className="home-nurse-route-dotted"
                d="M62 70C160 91 242 46 351 68C468 91 535 107 641 78C753 47 817 54 908 67C957 74 998 72 1040 62"
              />
              <g className="home-nurse-route-pin">
                <path d="M62 70C62 70 38 46 38 26C38 12 49 3 62 3C75 3 86 12 86 26C86 46 62 70 62 70Z" />
                <ellipse cx="62" cy="70" rx="11" ry="3" />
                <circle cx="62" cy="27" r="12" />
                <path d="M55 27H69M62 20V34" />
              </g>
              <g className="home-nurse-route-house">
                <path d="M1038 52L1077 17L1116 52" />
                <path d="M1047 45V101H1107V45" />
                <path d="M1061 101V70H1077V101M1087 60H1099V75H1087Z" />
              </g>
              <circle
                className="home-nurse-route-pulse"
                cx="0"
                cy="0"
                r="5.5"
                filter="url(#home-nurse-route-glow)"
              >
                <animateMotion
                  dur="5.8s"
                  repeatCount="indefinite"
                  path="M62 70C154 24 247 105 369 74C493 42 548 35 646 69C745 103 807 27 914 57C967 72 1002 76 1040 62"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.42 0 0.32 1"
                />
                <animate
                  attributeName="opacity"
                  dur="5.8s"
                  repeatCount="indefinite"
                  values="0;1;1;0;0"
                  keyTimes="0;0.07;0.88;0.98;1"
                />
              </circle>
            </svg>
          </div>
        </section>
      ) : isCinematicAudiometry ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--audiometry-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="audiometry-cinematic-backdrop"
            role="img"
            aria-label="Пацієнт проходить перевірку слуху в аудіометричних навушниках"
            />
            <div className="audiometry-cinematic-shade" aria-hidden="true" />
            <div className="service-detail-hero-copy audiometry-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">{service.category}</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>{service.lead}</p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
          <div className="audiometry-audiogram" aria-hidden="true">
            <svg viewBox="0 0 1040 92" preserveAspectRatio="none">
              <path
                className="audiometry-audiogram-grid"
                d="M0 18H1040M0 46H1040M0 74H1040M130 0V92M260 0V92M390 0V92M520 0V92M650 0V92M780 0V92M910 0V92"
              />
              <path
                className="audiometry-audiogram-line"
                d="M0 60C64 58 91 49 130 47S220 57 260 55S344 33 390 36S470 62 520 58S607 28 650 31S733 52 780 48S866 35 910 39S982 58 1040 50"
              />
              <circle className="audiometry-audiogram-pulse" r="5">
                <animateMotion
                  dur="6.4s"
                  repeatCount="indefinite"
                  path="M0 60C64 58 91 49 130 47S220 57 260 55S344 33 390 36S470 62 520 58S607 28 650 31S733 52 780 48S866 35 910 39S982 58 1040 50"
                />
                <animate
                  attributeName="opacity"
                  dur="6.4s"
                  repeatCount="indefinite"
                  values="0;1;1;0"
                  keyTimes="0;0.08;0.9;1"
                />
              </circle>
            </svg>
          </div>
        </section>
      ) : isCinematicWartRemoval ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--wart-removal-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="wart-removal-cinematic-backdrop"
            role="img"
            aria-label="Лікар природно тримає медичний інструмент для видалення бородавок біля руки пацієнта"
          />
          <div className="wart-removal-cinematic-shade" aria-hidden="true" />
          <div className="wart-removal-cinematic-wave" aria-hidden="true">
            <svg viewBox="0 0 1680 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wartRemovalWaveGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#52d9d2" stopOpacity="0" />
                  <stop offset="0.18" stopColor="#77eee6" stopOpacity="0.78" />
                  <stop offset="0.6" stopColor="#b4fff9" stopOpacity="0.96" />
                  <stop offset="1" stopColor="#52d9d2" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="wart-removal-wave wart-removal-wave--soft"
                d="M-80 88C110 30 250 140 430 86S730 32 910 88 1190 139 1410 67 1645 60 1760 80"
              />
              <path
                className="wart-removal-wave wart-removal-wave--bright"
                d="M-80 88C110 30 250 140 430 86S730 32 910 88 1190 139 1410 67 1645 60 1760 80"
              />
            </svg>
          </div>
          <div className="service-detail-hero-copy wart-removal-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Делікатна процедура</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>Безпечний метод лікар обирає після огляду шкіри.</p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : isCinematicEarPiercing ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--ear-piercing-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="ear-piercing-cinematic-backdrop"
            role="img"
            aria-label="Медична працівниця готує пацієнтку до проколювання вуха"
          />
          <div className="ear-piercing-cinematic-shade" aria-hidden="true" />
          <div className="ear-piercing-cinematic-flow" aria-hidden="true">
            <span className="ear-piercing-flow-sheen" />
          </div>
          <div className="service-detail-hero-copy ear-piercing-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Делікатна медична процедура</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>
              Акуратне проколювання мочки вуха з попередньою розміткою,
              дотриманням гігієни та рекомендаціями щодо догляду.
            </p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : isCinematicDermoscopy ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--dermoscopy-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="dermoscopy-cinematic-backdrop"
            role="img"
            aria-label="Лікарка оглядає шкірне утворення пацієнтки за допомогою дерматоскопа"
          />
          <div className="dermoscopy-cinematic-shade" aria-hidden="true" />
          <div className="dermoscopy-cinematic-scan" aria-hidden="true">
            <span className="dermoscopy-hud-orbit dermoscopy-hud-orbit--outer" />
            <span className="dermoscopy-hud-orbit dermoscopy-hud-orbit--ticks" />
            <span className="dermoscopy-hud-orbit dermoscopy-hud-orbit--middle" />
            <span className="dermoscopy-hud-orbit dermoscopy-hud-orbit--inner" />
            <span className="dermoscopy-hud-crosshair" />
            <span className="dermoscopy-hud-sweep" />
            <span className="dermoscopy-hud-focus" />
            <span className="dermoscopy-hud-markers">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="service-detail-hero-copy dermoscopy-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Діагностика шкіри</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>
              Неінвазивний огляд родимок та інших шкірних утворень зі
              збільшенням.
            </p>
            <div className="service-detail-actions">
              <Link className="book-button" href={bookingHref}>
                Записатися <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : isConsultation ? (
        <section
          className="service-detail-hero service-detail-hero--cinematic service-detail-hero--consultation-cinematic"
          aria-labelledby="service-detail-title"
        >
          <div
            className="consultation-cinematic-backdrop"
            role="img"
            aria-label="Лікарка обговорює стан здоров’я з пацієнтами під час консультації"
          />
          <div className="consultation-cinematic-shade" aria-hidden="true" />
          <div className="consultation-cinematic-light" aria-hidden="true" />
          <div className="service-detail-hero-copy consultation-cinematic-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">Консультації фахівців</span>
            <h1 id="service-detail-title">Консультації фахівців</h1>
            <p>Оберіть напрям консультації та дізнайтеся, який спеціаліст допоможе саме з вашим запитом.</p>
            <div className="service-detail-actions">
              <Link className="book-button" href="#consultation-directions">
                Обрати напрям <span>→</span>
              </Link>
              <Link className="outline-button" href="/doctors">
                Усі лікарі <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section
          className={`service-detail-hero service-detail-hero--editorial service-detail-hero--editorial-${service.slug}`}
          aria-labelledby="service-detail-title"
        >
          <div className="service-detail-hero-copy">
            <nav className="service-breadcrumbs" aria-label="Навігація">
              <Link href="/services">Послуги</Link>
              <span aria-hidden="true">/</span>
              <span>{service.shortTitle}</span>
            </nav>
            <span className="section-kicker">{service.category}</span>
            <h1 id="service-detail-title">{service.title}</h1>
            <p>{service.lead}</p>
            <div className="service-detail-actions">
              <Link
                className="book-button"
                href={isCardiology ? "#cardiology-services" : bookingHref}
              >
                {isCardiology ? "Обрати послугу" : "Записатися"} <span>→</span>
              </Link>
              <Link className="outline-button" href={priceHref}>
                Переглянути вартість <span>→</span>
              </Link>
            </div>
          </div>
          <div
            className="service-detail-visual service-detail-visual--editorial"
            style={{ backgroundImage: `url("${editorialImage}")` }}
            role="img"
            aria-label={`Ілюстрація напрямку «${service.title}»`}
          />
        </section>
      )}

      {isFamilyMedicine ? (
        <>
          <section className="family-route" aria-labelledby="family-route-title">
            <div className="family-route-heading">
              <span className="section-kicker">Декларація без зайвих кроків</span>
              <h2 id="family-route-title">
                Оберіть лікаря — з оформленням допоможе адміністратор
              </h2>
              <p>
                Заявка на сайті допомагає зафіксувати ваш вибір. Остаточне
                підтвердження декларації відбувається в електронній системі
                охорони здоров’я.
              </p>
            </div>
            <div className="family-route-steps">
              <article>
                <span>01</span>
                <h3>Оберіть лікаря</h3>
                <p>Перегляньте сімейних лікарів центру та оберіть свого.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Залиште контакти</h3>
                <p>
                  Вкажіть дані дорослого або дитини. Адміністратор уточнить
                  документи й перевірить можливість оформлення.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Підтвердьте в ЕСОЗ</h3>
                <p>
                  Після перевірки даних пацієнт підтверджує декларацію, а
                  заклад реєструє її в системі.
                </p>
              </article>
            </div>
          </section>

          <FamilyDeclarationForm
            doctors={availableFamilyDoctors.map((doctor) => ({
              id: doctor.id,
              name: doctor.name,
              specialty: doctor.specialty,
              photoUrl: doctor.photoUrl,
              branch: doctor.branch,
            }))}
          />

          <section
            className="family-nszu"
            id="family-nszu"
            aria-labelledby="family-nszu-title"
          >
            <div className="family-nszu-heading">
              <span className="section-kicker">Як працює НСЗУ</span>
              <h2 id="family-nszu-title">
                Декларація відкриває доступ до первинної допомоги
              </h2>
              <p>
                НСЗУ оплачує визначений пакет первинної медичної допомоги
                закладу, який має відповідний договір. Пацієнт отримує ці
                послуги безоплатно в межах програми медичних гарантій.
              </p>
            </div>
            <div className="family-nszu-points">
              <article>
                <span aria-hidden="true">01</span>
                <h3>Ваш перший контакт</h3>
                <p>
                  Сімейний лікар оцінює стан, лікує поширені захворювання,
                  спостерігає хронічні стани та визначає подальший маршрут.
                </p>
              </article>
              <article>
                <span aria-hidden="true">02</span>
                <h3>Направлення й рецепти</h3>
                <p>
                  За медичними показаннями лікар створює е-направлення,
                  виписує рецепти й допомагає організувати профілактику.
                </p>
              </article>
              <article>
                <span aria-hidden="true">03</span>
                <h3>Допомога для родини</h3>
                <p>
                  Декларацію можна укласти для дорослого або дитини з лікарем
                  відповідного профілю без прив’язки до місця реєстрації.
                </p>
              </article>
            </div>
          </section>

          <section className="family-coverage" aria-label="Допомога за декларацією">
            <article>
              <span className="section-kicker">Медична допомога</span>
              <h2>Що можна отримати за декларацією</h2>
              <ul>
                <li>консультації, огляд і лікування поширених захворювань;</li>
                <li>спостереження за хронічними станами;</li>
                <li>профілактичні огляди, вакцинацію та поради щодо здоров’я;</li>
                <li>е-рецепти, е-направлення та медичні документи за показаннями.</li>
              </ul>
            </article>
            <article>
              <span className="section-kicker">Безоплатно за програмою НСЗУ</span>
              <h2>Які аналізи доступні безоплатно за декларацією</h2>
              <p className="family-coverage-intro">
                За медичними показаннями сімейний лікар може призначити або
                провести в межах первинної допомоги:
              </p>
              <ul>
                <li>загальний аналіз крові з лейкоцитарною формулою;</li>
                <li>загальний аналіз сечі;</li>
                <li>визначення рівня глюкози та загального холестерину в крові;</li>
                <li>швидкі тести на вагітність і тропонін;</li>
                <li>швидкі тести на ВІЛ, вірусні гепатити B і C.</li>
              </ul>
              <p className="family-coverage-footnote">
                Необхідність кожного дослідження визначає лікар. Пацієнт не
                сплачує за нього, якщо послуга надається в межах договору
                закладу з НСЗУ. Інші лабораторні дослідження можуть бути
                безоплатними за окремим е-направленням у закладі, який має
                відповідний договір з НСЗУ.
              </p>
            </article>
          </section>

          <aside className="family-nszu-note">
            <strong>Важливо</strong>
            <p>
              Декларація не робить автоматично безоплатними весь лабораторний
              прайс, КТ, МРТ чи інші спеціалізовані послуги. Вони можуть бути
              доступні за окремим е-направленням у закладі з відповідним
              договором НСЗУ або оплачуватися пацієнтом. Доступність конкретних
              послуг у нашому центрі підтвердить адміністратор.
            </p>
          </aside>
        </>
      ) : null}

      {!isFamilyMedicine && !isConsultation ? (
      <section
        className={`service-facts${isCardiology ? " service-facts--booking" : ""}`}
        id={isCardiology ? "cardiology-services" : undefined}
        aria-label={
          isCardiology ? "Оберіть кардіологічну послугу" : "Ключові переваги"
        }
      >
        {isCardiology
          ? cardiologyBookingOptions.map((option) => {
              const isConsultation = option.key === "consultation";
              const isHolter = option.key === "holter";

              return (
                <GlowPriceCard
                  className="cardiology-service-card"
                  key={option.priceItemId}
                >
                  <strong>{option.title}</strong>
                  <b className="cardiology-service-price">
                    {option.price} грн
                  </b>
                  <small>{option.description}</small>
                  {isConsultation ? (
                    <details className="cardiology-doctor-picker">
                      <summary>
                        Обрати кардіолога
                        <span>{availableCardiologists.length}</span>
                      </summary>
                      <div>
                        {availableCardiologists.length ? (
                          availableCardiologists.map((doctor) => (
                            <Link
                              key={doctor.id}
                              href={`/contacts?service=${encodeURIComponent(
                                option.title,
                              )}&doctor=${encodeURIComponent(doctor.name)}#booking`}
                            >
                              <span
                                className={`cardiology-doctor-avatar${
                                  doctor.photoUrl ? " has-photo" : ""
                                }`}
                                style={
                                  doctor.photoUrl
                                    ? {
                                        backgroundImage: `url("${doctor.photoUrl}")`,
                                      }
                                    : undefined
                                }
                                aria-hidden="true"
                              >
                                {!doctor.photoUrl
                                  ? doctor.name
                                      .split(/\s+/)
                                      .slice(0, 2)
                                      .map((part) => part[0])
                                      .join("")
                                  : null}
                              </span>
                              <div>
                                <strong>{doctor.name}</strong>
                                <small>{doctor.specialty}</small>
                              </div>
                              <b>{option.price} грн</b>
                            </Link>
                          ))
                        ) : (
                          <p>Доступність прийому уточнить адміністратор.</p>
                        )}
                      </div>
                    </details>
                  ) : isHolter ? (
                    <div className="cardiology-direct-actions">
                      <Link
                        className="cardiology-direct-booking"
                        href="/services/holter"
                      >
                        Детальніше <b aria-hidden="true">→</b>
                      </Link>
                      <Link
                        className="cardiology-direct-booking"
                        href={`/contacts?service=${encodeURIComponent(option.title)}#booking`}
                      >
                        Записатися <b aria-hidden="true">→</b>
                      </Link>
                    </div>
                  ) : (
                    <Link
                      className="cardiology-direct-booking"
                      href={`/contacts?service=${encodeURIComponent(option.title)}#booking`}
                    >
                      Записатися{" "}
                      <b aria-hidden="true">→</b>
                    </Link>
                  )}
                </GlowPriceCard>
              );
            })
          : service.facts.map((fact, index) => (
              <div key={fact}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{fact}</strong>
              </div>
            ))}
      </section>
      ) : null}

      {isConsultation ? (
        <ConsultationExperience />
      ) : isFamilyMedicine ? null : isCardiology ? (
        <section className="service-overview service-overview--cardiology cardiology-care-guide">
          <div className="cardiology-guide-grid">
            <article className="cardiology-guide-symptoms">
              <span className="section-kicker">Коли варто звернутися</span>
              <h2>Симптоми та профілактика</h2>
              <ul className="service-check-list">
                {service.indications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      ) : isHomeNurse ? (
        <section className="service-overview service-overview--single service-overview--home-nurse">
          <article>
            <span className="section-kicker">Про послугу</span>
            <h2>{service.centerTitle}</h2>
            <p>{service.overview}</p>
          </article>
        </section>
      ) : isCinematicLaboratory ? null : (
          <section
            className={`service-overview${
              isCompactProcedure ? " service-overview--single" : ""
            }${isCinematicAudiometry ? " service-overview--audiometry" : ""}`}
          >
          <article>
            <span className="section-kicker">Про дослідження</span>
            <h2>Що це таке</h2>
            <p>{service.overview}</p>
          </article>
          {!isCompactProcedure ? (
            <article className="service-center-card">
              <span className="service-center-mark" aria-hidden="true">
                {service.shortTitle}
              </span>
              <div>
                <span className="section-kicker">У нашому центрі</span>
                <h2>{service.centerTitle}</h2>
                <p>{service.centerDescription}</p>
              </div>
            </article>
          ) : null}
        </section>
      )}

      {!isCardiology && !isFamilyMedicine && !isConsultation ? (
      <section className="service-information-grid">
        <article>
          <span className="section-kicker">Показання</span>
          <h2>{service.indicationsTitle}</h2>
          <ul className="service-check-list">
            {service.indications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <span className="section-kicker">Перед візитом</span>
          <h2>Як підготуватися</h2>
          <ol className="service-preparation-list">
            {service.preparation.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>
      ) : null}

      {!isCardiology && !isFamilyMedicine && !isConsultation ? (
      <section className="service-process" aria-labelledby="service-process-title">
        <div>
          <span className="section-kicker">Послідовно і зрозуміло</span>
          <h2 id="service-process-title">Як усе відбувається</h2>
        </div>
        <div className="service-process-steps">
          {service.process.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {!isFamilyMedicine && !isConsultation ? (
      <>
      <aside className="service-important">
        <span aria-hidden="true">i</span>
        <div>
          <strong>Важливо знати</strong>
          <p>{service.important}</p>
        </div>
      </aside>

      <section className="subpage-cta service-detail-cta">
        <div>
          <span className="section-kicker">Допоможемо підготуватися</span>
          <h2>Уточніть дослідження та оберіть зручний час</h2>
          <p>
            Адміністратор перевірить деталі, підкаже підготовку та доступне
            відділення.
          </p>
        </div>
        <div className="service-detail-cta-actions">
          <Link
            className="book-button"
            href={isCardiology ? "#cardiology-services" : bookingHref}
          >
            {isCardiology ? "Обрати послугу" : "Записатися"} <span>→</span>
          </Link>
          <a href="tel:+380676714444">+38 (067) 671-44-44</a>
        </div>
      </section>
      </>
      ) : null}

      <SiteFooter />
    </main>
  );
}
