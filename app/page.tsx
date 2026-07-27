import Link from "next/link";
import { listPopularBookingServices } from "./api/bookings/bookingStore";
import { listPublicPriceItems } from "./api/prices/priceStore";
import { PromoSlider } from "./components/PromoSlider";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { catalogItems, type PriceItem } from "./prices/priceData";

const services = [
  { title: "КТ", icon: "ct" },
  { title: "МРТ", icon: "mri" },
  { title: "УЗД", icon: "ultrasound" },
  { title: "Лабораторія", icon: "lab" },
  { title: "Консультації лікарів", icon: "consultation" },
  { title: "Кардіологія", icon: "cardiology" },
  { title: "Холтер", icon: "holter" },
  { title: "Сімейний лікар", icon: "family" },
];

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

const doctorDirections = [
  {
    icon: "doctor",
    title: "Сімейний лікар",
    text: "Первинні консультації, профілактика та супровід здоров’я всієї родини.",
  },
  {
    icon: "cardiology",
    title: "Кардіолог",
    text: "Оцінка роботи серця, консультації та рекомендації за результатами обстежень.",
  },
  {
    icon: "ultrasound",
    title: "Лікар УЗД",
    text: "Ультразвукова діагностика з поясненням результатів дослідження.",
  },
];

const fallbackPriceDirections = [
  {
    title: "Холтер ЕКГ",
    text: "900 ₴",
    note: "Добове моніторування роботи серця.",
  },
  {
    title: "ЕхоКГ",
    text: "650 ₴",
    note: "Ультразвукове дослідження серця.",
  },
  {
    title: "УЗД щитоподібної залози",
    text: "500 ₴",
    note: "Актуальність ціни підтвердить адміністратор.",
  },
];

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
      listPopularBookingServices(),
      listPublicPriceItems(),
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
          title: item.name,
          text: `${new Intl.NumberFormat("uk-UA").format(item.amount)} ₴`,
          note: `${item.categoryLabel} · популярне за підтвердженими записами`,
        },
      ];
    });

    return [...dynamicItems, ...fallbackPriceDirections]
      .filter((item, index, items) => {
        const key =
          findCatalogItem(item.title, priceItems)?.id ?? normalizeServiceName(item.title);
        return (
          items.findIndex(
            (candidate) =>
              (findCatalogItem(candidate.title, priceItems)?.id ??
                normalizeServiceName(candidate.title)) === key,
          ) === index
        );
      })
      .slice(0, 3);
  } catch {
    return fallbackPriceDirections;
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

function ServiceIcon({ type }: { type: string }) {
  const icon = (() => {
    switch (type) {
      case "ct":
        return (
          <>
            <circle cx="32" cy="25" r="18" />
            <circle cx="32" cy="25" r="10" />
            <path d="M7 54h50M18 48h30v6M13 44h25c5 0 9 4 9 9" />
          </>
        );
      case "mri":
        return (
          <>
            <path d="M14 43V24a18 18 0 0 1 36 0v19" />
            <circle cx="32" cy="24" r="10" />
            <path d="M7 54h50M23 46h27v8M13 44h18" />
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
      case "lab":
        return (
          <>
            <path d="M12 8h17M15 8v35a8 8 0 0 0 16 0V8M35 8h17M38 8v35a8 8 0 0 0 16 0V8" />
            <path d="M15 34h16M38 29h16" />
          </>
        );
      case "consultation":
        return (
          <>
            <circle cx="32" cy="15" r="8" />
            <path d="M14 55v-8c0-11 8-19 18-19s18 8 18 19v8M23 31v9a9 9 0 0 0 18 0v-9" />
            <path d="M20 55V44M44 55V44" />
            <circle cx="41" cy="42" r="3" />
          </>
        );
      case "cardiology":
        return (
          <>
            <path d="M32 55S9 42 9 24c0-9 6-15 14-15 5 0 8 3 9 7 2-4 5-7 10-7 8 0 14 6 14 15 0 18-24 31-24 31Z" />
            <path d="M13 32h11l4-9 7 18 5-9h11" />
          </>
        );
      case "holter":
        return (
          <>
            <rect x="10" y="8" width="44" height="40" rx="6" />
            <path d="M16 29h8l4-8 7 17 5-9h8M32 48v8M22 56h20" />
          </>
        );
      case "family":
        return (
          <>
            <circle cx="32" cy="15" r="8" />
            <circle cx="13" cy="25" r="6" />
            <circle cx="51" cy="25" r="6" />
            <path d="M18 55V44c0-9 6-16 14-16s14 7 14 16v11M3 55V45c0-7 4-12 10-12 4 0 7 2 9 6M61 55V45c0-7-4-12-10-12-4 0-7 2-9 6" />
          </>
        );
      default:
        return <circle cx="32" cy="32" r="18" />;
    }
  })();

  return (
    <span className="service-icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        {icon}
      </svg>
    </span>
  );
}

export default async function Home() {
  const priceDirections = await getPopularPriceDirections();

  return (
    <main id="top">
      <SiteHeader />

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
          <a href="/services">
            Усі послуги <span>⟶</span>
          </a>
        </div>
        <div className="services-grid" id="services-grid">
          {services.map((service) => (
            <Link
              className="service-card"
              key={service.title}
              href={`/contacts?service=${encodeURIComponent(service.title)}#booking`}
              aria-label={`${service.title}: записатися`}
            >
              <ServiceIcon type={service.icon} />
              <strong>{service.title}</strong>
              <span className="service-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="doctors-section" id="doctors">
        <div className="section-heading doctors-heading">
          <div>
            <span className="section-kicker">Лікарі</span>
            <h2>Напрями консультацій</h2>
          </div>
          <p>
            Оберіть потрібний напрям — адміністратор допоможе підібрати
            спеціаліста та зручний час.
          </p>
        </div>
        <div className="doctors-grid">
          {doctorDirections.map((direction) => (
            <article className="doctor-card" key={direction.title}>
              <span className="doctor-icon">
                <LineIcon type={direction.icon} />
              </span>
              <h3>{direction.title}</h3>
              <p>{direction.text}</p>
              <Link
                className="text-button"
                href={`/contacts?service=${encodeURIComponent(direction.title)}#booking`}
              >
                Записатися <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-copy">
          <span className="about-kicker">Про нас</span>
          <h2>Медицина, що починається з довіри</h2>
          <p>
            «Здорова Родина» — сучасна українська лабораторія та
            лікувально-діагностичний центр. Дослідження виконуються на
            автоматичному високоточному обладнанні.
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
            <h2>Популярні послуги та ціни</h2>
          </div>
          <p>
            Добірка оновлюється за підтвердженими записами за останні 30 днів.
            Актуальну вартість остаточно підтвердить адміністратор.
          </p>
        </div>
        <div className="pricing-grid">
          {priceDirections.map((item) => (
            <article className="price-card" key={item.title}>
              <span className="price-label">Популярне</span>
              <h3>{item.title}</h3>
              <strong>{item.text}</strong>
              <p>{item.note}</p>
              <Link
                className="outline-button"
                href={`/contacts?service=${encodeURIComponent(item.title)}#booking`}
              >
                Уточнити вартість <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contacts">
        <div className="contact-copy">
          <span className="section-kicker">Контакти</span>
          <h2>Допоможемо обрати послугу та час</h2>
          <p>
            Подзвоніть адміністратору: +38 (067) 671-44-44. Підкажемо
            підготовку, адресу відділення та доступний час.
          </p>
          <a className="book-button" href="tel:+380676714444">
            Подзвонити <span>→</span>
          </a>
        </div>
        <ol className="contact-steps">
          <li>
            <span>01</span>
            <div>
              <strong>Подзвоніть адміністратору</strong>
              <p>Номер для запису: +38 (067) 671-44-44.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Уточніть деталі</strong>
              <p>Назвіть послугу, лікаря або потрібне дослідження.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Оберіть час</strong>
              <p>Узгодьте зручну дату для консультації чи дослідження.</p>
            </div>
          </li>
        </ol>
      </section>

      <SiteFooter />

    </main>
  );
}
