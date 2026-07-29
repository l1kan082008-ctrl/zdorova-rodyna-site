import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { getServiceDetail, serviceDetails } from "../serviceData";

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

  return (
    <main className="inner-page service-detail-page">
      <SiteHeader active="services" />

      <section className="service-detail-hero">
        <div className="service-detail-hero-copy">
          <nav className="service-breadcrumbs" aria-label="Навігація">
            <Link href="/services">Послуги</Link>
            <span aria-hidden="true">/</span>
            <span>{service.shortTitle}</span>
          </nav>
          <span className="section-kicker">{service.category}</span>
          <h1>{service.title}</h1>
          <p>{service.lead}</p>
          <div className="service-detail-actions">
            <Link className="book-button" href={bookingHref}>
              Записатися <span>→</span>
            </Link>
            <Link className="outline-button" href="/prices">
              Переглянути вартість <span>→</span>
            </Link>
          </div>
        </div>
        <div
          className="service-detail-visual"
          style={{ backgroundImage: `url("${service.image}")` }}
          role="img"
          aria-label={`Ілюстрація напрямку «${service.title}»`}
        >
          <span>{service.shortTitle}</span>
        </div>
      </section>

      <section className="service-facts" aria-label="Ключові переваги">
        {service.facts.map((fact, index) => (
          <div key={fact}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{fact}</strong>
          </div>
        ))}
      </section>

      <section className="service-overview">
        <article>
          <span className="section-kicker">Про дослідження</span>
          <h2>Що це таке</h2>
          <p>{service.overview}</p>
        </article>
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
      </section>

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
          <Link className="book-button" href={bookingHref}>
            Записатися <span>→</span>
          </Link>
          <a href="tel:+380676714444">+38 (067) 671-44-44</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
