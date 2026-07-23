"use client";

import { FormEvent, useState } from "react";

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
    icon: "✓",
    title: "Технології",
    text: "Сучасне обладнання експертного класу",
  },
  {
    icon: "♙",
    title: "Досвід",
    text: "Команда професіоналів для дорослих і дітей",
  },
  {
    icon: "♡",
    title: "Турбота",
    text: "Індивідуальний підхід та підтримка",
  },
  {
    icon: "╫",
    title: "Лабораторія",
    text: "Швидкі та точні результати аналізів",
  },
];

const quickItems = [
  {
    icon: "▦",
    title: "Зручний запис",
    text: "Онлайн, по телефону або в месенджерах",
  },
  {
    icon: "◯",
    title: "Нагадування",
    text: "Про візит та підготовку до досліджень",
  },
  {
    icon: "▤",
    title: "Результати онлайн",
    text: "Швидко та зручно у вашому кабінеті",
  },
  {
    icon: "♧",
    title: "Підтримка 24/7",
    text: "Ми завжди на зв’язку та готові допомогти",
  },
];

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Здорова Родина — на головну">
      <img
        src="/zdorova-rodyna-logo.png"
        alt="Здорова Родина — медичний центр"
      />
    </a>
  );
}

function BrandMark() {
  return (
    <a
      className="footer-mark"
      href="#top"
      aria-label="Здорова Родина — на головну"
    >
      <img src="/zdorova-rodyna-mark.jpg" alt="" />
    </a>
  );
}

function ServiceIcon({ type }: { type: string }) {
  return (
    <span className={`service-icon icon-${type}`} aria-hidden="true">
      <i />
      <b />
      <em />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSent(false);
  };

  return (
    <main id="top">
      <header className="site-header">
        <Logo />

        <nav className={menuOpen ? "main-nav is-open" : "main-nav"}>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            Послуги
          </a>
          <a href="#doctors" onClick={() => setMenuOpen(false)}>
            Лікарі
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            Про центр
          </a>
          <a href="#prices" onClick={() => setMenuOpen(false)}>
            Ціни
          </a>
          <a href="#contacts" onClick={() => setMenuOpen(false)}>
            Контакти
          </a>
        </nav>

        <button className="book-button header-book" onClick={() => setBookingOpen(true)}>
          Записатися на прийом
        </button>
        <button
          className="menu-button"
          aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Медичний центр для всієї родини</p>
          <h1 id="hero-title">
            Здорова родина —<br />
            здорове майбутнє
          </h1>
          <p className="hero-lead">
            Сучасна діагностика, власна лабораторія та досвідчені лікарі,
            яким довіряють найцінніше.
          </p>
          <div className="hero-actions">
            <button className="book-button" onClick={() => setBookingOpen(true)}>
              Записатися на прийом <span>→</span>
            </button>
            <a className="outline-button" href="#services">
              Переглянути послуги <span>→</span>
            </a>
          </div>
        </div>
        <div className="hero-art" role="img" aria-label="Абстрактна скульптура родини">
          <span className="hero-line" />
        </div>
      </section>

      <section className="advantages" id="doctors" aria-label="Переваги центру">
        {advantages.map((item) => (
          <article className="advantage" key={item.title}>
            <span className="advantage-icon" aria-hidden="true">
              {item.icon}
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <h2>Наші послуги</h2>
          <a href="#services-grid">
            Усі послуги <span>⟶</span>
          </a>
        </div>
        <div className="services-grid" id="services-grid">
          {services.map((service) => (
            <button
              className="service-card"
              key={service.title}
              onClick={() => setBookingOpen(true)}
              aria-label={`${service.title}: записатися`}
            >
              <ServiceIcon type={service.icon} />
              <strong>{service.title}</strong>
              <span className="service-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-copy">
          <span className="about-kicker">Про нас</span>
          <h2>Медицина, що починається з довіри</h2>
          <p>
            Ми створили простір, де поєднуються передові технології та людяне
            ставлення. Щоб кожен пацієнт — від дитини до старших членів сім’ї —
            відчував спокій, увагу та впевненість.
          </p>
          <a className="outline-button" href="#contacts">
            Дізнатися більше про центр <span>→</span>
          </a>
        </div>
        <div
          className="reception-photo"
          role="img"
          aria-label="Світла рецепція медичного центру Здорова Родина"
        />
      </section>

      <section className="quick-strip" id="prices">
        {quickItems.map((item) => (
          <article key={item.title}>
            <span className="quick-icon" aria-hidden="true">
              {item.icon}
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <footer id="contacts">
        <BrandMark />
        <p>Турбота про здоров’я вашої родини щодня.</p>
        <button className="book-button" onClick={() => setBookingOpen(true)}>
          Записатися
        </button>
      </footer>

      {bookingOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeBooking}>
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={closeBooking} aria-label="Закрити">
              ×
            </button>
            {sent ? (
              <div className="success-message">
                <span>✓</span>
                <h2>Дякуємо!</h2>
                <p>Ми зв’яжемося з вами, щоб узгодити зручний час прийому.</p>
                <button className="book-button" onClick={closeBooking}>
                  Готово
                </button>
              </div>
            ) : (
              <>
                <span className="about-kicker">Онлайн-запис</span>
                <h2 id="booking-title">Записатися на прийом</h2>
                <p>Залиште контакти — адміністратор допоможе обрати послугу й час.</p>
                <form onSubmit={submitBooking}>
                  <label>
                    Ваше ім’я
                    <input name="name" placeholder="Ім’я та прізвище" required />
                  </label>
                  <label>
                    Номер телефону
                    <input name="phone" type="tel" placeholder="+380" required />
                  </label>
                  <label>
                    Послуга
                    <select name="service" defaultValue="">
                      <option value="" disabled>
                        Оберіть послугу
                      </option>
                      {services.map((service) => (
                        <option value={service.title} key={service.title}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="book-button" type="submit">
                    Надіслати заявку <span>→</span>
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
