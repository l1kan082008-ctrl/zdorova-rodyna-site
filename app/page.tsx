import Link from "next/link";
import type { CSSProperties } from "react";
import { listPopularBookingServices } from "./api/bookings/bookingStore";
import { listDoctors } from "./api/doctors/doctorStore";
import { listPublicPriceItems } from "./api/prices/priceStore";
import {
  getDefaultManagedServices,
  listManagedServices,
} from "./api/services/serviceStore";
import { DoctorsShowcase } from "./components/DoctorsShowcase";
import { GlowPriceCard } from "./components/GlowPriceCard";
import { HomeSearch, type HomeSearchItem } from "./components/HomeSearch";
import { HorizontalCardScroller } from "./components/HorizontalCardScroller";
import { PromoSlider } from "./components/PromoSlider";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { centerLocations } from "./contacts/locationData";
import { defaultDoctors } from "./doctors/doctorData";
import { catalogItems, type PriceItem } from "./prices/priceData";
import {
  formatPrice,
  priceReferences,
  resolvePriceItem,
  type PriceReference,
} from "./prices/priceReferences";
import { serviceDetails } from "./services/serviceData";

export const dynamic = "force-dynamic";

const advantages = [
  {
    icon: "shield",
    title: "Точність",
    text: "Автоматизоване високоточне обладнання",
  },
  {
    icon: "team",
    title: "Фахівці",
    text: "Лікарі для дорослих і дітей",
  },
  {
    icon: "heart",
    title: "Турбота",
    text: "Зрозумілий супровід на кожному етапі",
  },
  {
    icon: "lab",
    title: "Лабораторія",
    text: "Дослідження за європейськими стандартами",
  },
];

const quickItems = [
  {
    icon: "calendar",
    title: "Зручний запис",
    text: "Телефоном +38 (067) 671-44-44",
  },
  {
    icon: "message",
    title: "Аналізи вдома",
    text: "Виїзд медсестри для забору матеріалу",
  },
  {
    icon: "document",
    title: "Результати дистанційно",
    text: "Електронною поштою, Viber або Telegram",
  },
  {
    icon: "headset",
    title: "Підтримка",
    text: "Підкажемо підготовку та оберемо час",
  },
];

const featuredDoctorOrder = [
  "voloshko-tetiana",
  "iziumska-olena",
  "ishchuk-nadiia",
  "pochtar-kateryna",
];

type PopularPriceDirection = {
  priceItemId: string;
  title: string;
  text: string;
  note: string;
};

const fallbackPriceDirectionDefinitions: Array<{
  reference: PriceReference;
  note: string;
}> = [
  {
    reference: priceReferences.holter,
    note: "Добове моніторування роботи серця.",
  },
  {
    reference: priceReferences.echoHeart,
    note: "Ультразвукове дослідження серця.",
  },
  {
    reference: priceReferences.thyroidUltrasound,
    note: "Актуальність ціни підтвердить адміністратор.",
  },
  {
    reference: priceReferences.ctBrain,
    note: "Комп’ютерна томографія головного мозку.",
  },
  {
    reference: priceReferences.mriBrain,
    note: "Магнітно-резонансне дослідження головного мозку.",
  },
  {
    reference: priceReferences.ecg,
    note: "Швидка реєстрація електричної активності серця.",
  },
  {
    reference: priceReferences.glucose,
    note: "Біохімічне дослідження рівня глюкози.",
  },
  {
    reference: priceReferences.ferritin,
    note: "Оцінка запасів заліза в організмі.",
  },
];

function buildFallbackPriceDirections(items: PriceItem[]): PopularPriceDirection[] {
  return fallbackPriceDirectionDefinitions.flatMap(({ reference, note }) => {
    const item = resolvePriceItem(items, reference);
    if (!item) return [];

    return [
      {
        priceItemId: item.id,
        title: item.name,
        text: formatPrice(item.amount),
        note,
      },
    ];
  });
}

const popularServiceAliases: Record<string, string[]> = {
  "ехокг": ["ехо", "серця"],
  "узд серця": ["ехо", "серця"],
  "узд щитоподібної залози": ["щитоподібної", "залози"],
  "щитоподібна залоза": ["щитоподібної", "залози"],
  "холтер": ["холтер"],
  "холтер екг": ["холтер"],
};

const normalizeServiceName = (value: string) =>
  value.trim().toLocaleLowerCase("uk-UA");

function findCatalogItem(
  serviceName: string,
  items: PriceItem[] = catalogItems,
): PriceItem | undefined {
  const normalized = normalizeServiceName(serviceName);
  const exactItem = items.find(
    (item) => normalizeServiceName(item.name) === normalized,
  );
  if (exactItem) return exactItem;

  const searchTerms = popularServiceAliases[normalized] ?? [normalized];
  return items.find((item) => {
    const searchable = normalizeServiceName(
      `${item.name} ${(item.aliases ?? []).join(" ")}`,
    );
    return searchTerms.every((term) => searchable.includes(term));
  });
}

async function getPopularPriceDirections() {
  try {
    const [statistics, priceItems] = await Promise.all([
      listPopularBookingServices().catch(() => []),
      listPublicPriceItems().catch(() => catalogItems),
    ]);
    const seen = new Set<string>();
    const dynamicItems = statistics.flatMap(({ service }) => {
      const item = findCatalogItem(service, priceItems);

      if (!item || seen.has(item.id)) {
        return [];
      }

      seen.add(item.id);
      return [
        {
          priceItemId: item.id,
          title: item.name,
          text: formatPrice(item.amount),
          note: `${item.categoryLabel} · популярне за підтвердженими записами`,
        },
      ];
    });

    const fallbackItems = buildFallbackPriceDirections(priceItems).filter(
      (item) => !seen.has(item.priceItemId),
    );

    return [...dynamicItems, ...fallbackItems].slice(0, 8);
  } catch {
    return buildFallbackPriceDirections(catalogItems);
  }
}

function LineIcon({ type }: { type: string }) {
  const content = (() => {
    switch (type) {
      case "shield":
        return (
          <>
            <path d="M32 7 51 14v15c0 13-8 23-19 28C21 52 13 42 13 29V14l19-7Z" />
            <path d="m23 31 6 6 13-14" />
          </>
        );
      case "team":
        return (
          <>
            <circle cx="32" cy="18" r="9" />
            <circle cx="13" cy="27" r="6" />
            <circle cx="51" cy="27" r="6" />
            <path d="M16 56V46c0-9 7-16 16-16s16 7 16 16v10M3 56v-8c0-8 4-13 10-13 4 0 7 2 9 5M61 56v-8c0-8-4-13-10-13-4 0-7 2-9 5" />
          </>
        );
      case "heart":
        return (
          <>
            <path d="M32 55S9 42 9 24c0-9 6-15 14-15 5 0 8 3 9 7 2-4 5-7 10-7 8 0 14 6 14 15 0 18-24 31-24 31Z" />
            <path d="M14 32h10l4-8 7 17 5-9h10" />
          </>
        );
      case "lab":
        return (
          <>
            <path d="M10 9h20M14 9v34a8 8 0 0 0 16 0V9M35 9h19M39 9v34a8 8 0 0 0 16 0V9" />
            <path d="M14 34h16M39 29h16" />
          </>
        );
      case "calendar":
        return (
          <>
            <rect x="8" y="12" width="48" height="44" rx="6" />
            <path d="M8 25h48M20 7v10M44 7v10M19 35h3M31 35h3M43 35h3M19 45h3M31 45h3M43 45h3" />
          </>
        );
      case "message":
        return (
          <>
            <path d="M55 29c0 12-10 21-23 21-4 0-8-1-11-3L8 55l4-14c-2-4-3-8-3-12C9 17 19 8 32 8s23 9 23 21Z" />
            <path d="M21 29h22" />
          </>
        );
      case "document":
        return (
          <>
            <path d="M15 7h25l10 10v40H15V7Z" />
            <path d="M40 7v11h10M23 30h19M23 39h19M23 48h11" />
          </>
        );
      case "headset":
        return (
          <>
            <path d="M10 34V29C10 16 20 7 32 7s22 9 22 22v5M14 34h7v17h-7a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5ZM50 34h-7v17h7a5 5 0 0 0 5-5v-7a5 5 0 0 0-5-5ZM43 51c-2 5-6 7-13 7" />
          </>
        );
      case "doctor":
        return (
          <>
            <circle cx="32" cy="15" r="8" />
            <path d="M13 57v-9c0-11 8-19 19-19s19 8 19 19v9M22 32v9a10 10 0 0 0 20 0v-9M19 57V45M45 57V45" />
            <circle cx="42" cy="43" r="3" />
          </>
        );
      case "cardiology":
        return (
          <>
            <path d="M32 55S9 42 9 24c0-9 6-15 14-15 5 0 8 3 9 7 2-4 5-7 10-7 8 0 14 6 14 15 0 18-24 31-24 31Z" />
            <path d="M13 32h11l4-9 7 18 5-9h11" />
          </>
        );
      case "ultrasound":
        return (
          <>
            <path d="M20 8c4-3 10-2 13 2l4 5c2 3 2 7-1 10l-6 6-15-15 5-8Z" />
            <path d="m12 17 17 17-5 5a4 4 0 0 1-6 0L7 28a4 4 0 0 1 0-6l5-5ZM31 32c9 2 17 9 18 18" />
            <circle cx="50" cy="52" r="4" />
          </>
        );
      default:
        return <circle cx="32" cy="32" r="20" />;
    }
  })();

  return (
    <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
      {content}
    </svg>
  );
}

export default async function Home() {
  const [priceDirections, doctors, priceItems, managedServices] = await Promise.all([
    getPopularPriceDirections(),
    listDoctors().catch(() => defaultDoctors),
    listPublicPriceItems().catch(() => catalogItems),
    listManagedServices().catch(() => getDefaultManagedServices()),
  ]);
  const homeServiceDetails = managedServices
    .filter((service) => service.active && service.showOnHome)
    .sort((first, second) => first.sortOrder - second.sortOrder);
  const showcaseDoctors = doctors.sort((first, second) => {
    const firstIndex = featuredDoctorOrder.indexOf(first.id);
    const secondIndex = featuredDoctorOrder.indexOf(second.id);
    const featuredDifference =
      (firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex) -
      (secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex);

    return (
      featuredDifference ||
      first.name.localeCompare(second.name, "uk-UA", { sensitivity: "base" })
    );
  });
  const searchItems: HomeSearchItem[] = [
    ...serviceDetails.map((service) => ({
      id: service.slug,
      kind: "service" as const,
      title: service.shortTitle,
      meta: service.cardDescription,
      href: `/services/${service.slug}`,
      actionHref: `/services/${service.slug}`,
      keywords: `${service.title} ${service.category} ${service.lead} ${
        service.slug === "home-nurse"
          ? "аналізи вдома виклик медсестри медсестра додому"
          : ""
      }`,
    })),
    ...showcaseDoctors.map((doctor) => ({
      id: doctor.id,
      kind: "doctor" as const,
      title: doctor.name,
      meta: `${doctor.specialty} · ${doctor.branch}`,
      href: `/doctors/${doctor.id}`,
      actionHref: `/contacts?doctor=${encodeURIComponent(doctor.name)}#booking`,
      keywords: `${doctor.description} ${doctor.biography} ${doctor.patientGroups.join(" ")}`,
      imageUrl: doctor.photoUrl,
    })),
    ...priceItems
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        id: item.id,
        kind: "price" as const,
        title: item.name,
        meta: item.categoryLabel,
        amount: item.amount,
        turnaround: item.turnaround,
        href: `/prices?search=${encodeURIComponent(item.name)}`,
        actionHref: `/contacts?service=${encodeURIComponent(item.name)}#booking`,
        keywords: (item.aliases ?? []).join(" "),
      })),
    ...centerLocations.map((location) => ({
      id: location.id,
      kind: "location" as const,
      title: location.address,
      meta: `${location.city} · ${location.type}`,
      href: `/contacts?location=${encodeURIComponent(location.id)}#locations`,
      actionHref: `/contacts?location=${encodeURIComponent(location.id)}#locations`,
      keywords: `${location.fullAddress} ${location.name} ${location.landmark ?? ""}`,
    })),
  ];

  return (
    <main id="top">
      <SiteHeader />
      <HomeSearch items={searchItems} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Медичний центр для всієї родини</p>
          <h1 id="hero-title">
            <span className="hero-title-line">
              Здорова родина<span className="hero-title-dash"> —</span>
            </span>
            <span className="hero-title-line">здорове майбутнє</span>
          </h1>
          <p className="hero-lead">
            Сучасна діагностика, власна лабораторія та досвідчені лікарі,
            яким довіряють найцінніше.
          </p>
          <div className="hero-actions">
            <Link className="book-button" href="/contacts#booking">
              Записатися на прийом <span>→</span>
            </Link>
            <Link className="outline-button" href="/services">
              Переглянути послуги <span>→</span>
            </Link>
          </div>
        </div>
        <div className="hero-art" role="img" aria-label="Абстрактна скульптура родини" />
      </section>

      <section className="advantages" id="advantages" aria-label="Переваги центру">
        {advantages.map((item) => (
          <article className="advantage" key={item.title}>
            <span className="advantage-icon" aria-hidden="true">
              <LineIcon type={item.icon} />
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <PromoSlider />

      <section className="services-section" id="services">
        <div className="section-heading">
          <h2>Наші послуги</h2>
          <Link href="/services">
            Усі послуги <span>⟶</span>
          </Link>
        </div>
        <div className="services-grid" id="services-grid">
          {homeServiceDetails.map((service) => {
            const art = service.imageKey
              ? `/api/services/image?key=${encodeURIComponent(service.imageKey)}`
              : service.imagePath || "/service-cards/lab-glass-v3.jpg";

            return (
            <Link
              className={`service-card service-card--${service.slug}`}
              key={service.id}
              href={service.href}
              aria-label={`${service.shortTitle}: дізнатися більше`}
              style={{ "--service-art": `url("${art}")` } as CSSProperties}
            >
              <span className="service-card-copy">
                <strong>{service.shortTitle}</strong>
                <span className="service-description">
                  {service.cardDescription}
                </span>
              </span>
              <span className="service-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="doctors-section" id="doctors">
        <div className="section-heading doctors-heading">
          <div>
            <span className="section-kicker">Лікарі</span>
            <h2>Наші лікарі</h2>
          </div>
          <p>
            Наведіть на фотографію, щоб виділити лікаря. Натисніть, щоб розкрити
            картку, або скористайтеся стрілками для перегляду всієї команди.
          </p>
        </div>
        <DoctorsShowcase doctors={showcaseDoctors} />
      </section>

      <section className="about-section" id="about">
        <div className="about-copy">
          <span className="about-kicker">Про нас</span>
          <h2>Аналізи, діагностика та лікарі — в одному центрі</h2>
          <p>
            У «Здоровій Родині» можна здати лабораторні аналізи, пройти КТ,
            МРТ, УЗД і кардіологічні обстеження, а також записатися до
            профільного або сімейного лікаря.
          </p>
          <a className="outline-button" href="/about">
            Дізнатися більше про центр <span>→</span>
          </a>
        </div>
        <div
          className="reception-photo"
          role="img"
          aria-label="Світла рецепція медичного центру Здорова Родина"
        />
      </section>

      <section className="quick-strip" aria-label="Зручності для пацієнтів">
        {quickItems.map((item) => (
          <article key={item.title}>
            <span className="quick-icon" aria-hidden="true">
              <LineIcon type={item.icon} />
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="pricing-section" id="prices">
        <div className="section-heading pricing-heading">
          <div>
            <span className="section-kicker">Вартість</span>
            <h2>Популярні послуги</h2>
          </div>
          <p>
            Добірка оновлюється за підтвердженими записами за останні 30 днів.
            Актуальну вартість остаточно підтвердить адміністратор.
          </p>
        </div>
        <HorizontalCardScroller label="Популярні послуги">
          {priceDirections.map((item) => (
            <GlowPriceCard key={item.priceItemId} className="price-card--plain">
              <h3>{item.title}</h3>
              <strong>{item.text}</strong>
              <p>{item.note}</p>
              <Link
                className="outline-button"
                href={`/contacts?service=${encodeURIComponent(item.title)}#booking`}
              >
                Уточнити вартість <span>→</span>
              </Link>
            </GlowPriceCard>
          ))}
        </HorizontalCardScroller>
      </section>

      <SiteFooter />

    </main>
  );
}
