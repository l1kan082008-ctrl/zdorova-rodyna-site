"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    eyebrow: "Лабораторія",
    title: "Дослідження без зайвих очікувань",
    text: "Оберіть потрібні аналізи, дізнайтеся актуальну вартість і заплануйте візит у зручний час.",
    note: "Результати — дистанційно",
    action: "Переглянути ціни",
    href: "/prices",
    theme: "laboratory",
  },
  {
    eyebrow: "Виїзна послуга",
    title: "Медсестра приїде до вас",
    text: "Забір матеріалу вдома — зручно для дітей, старших людей і тих, кому складно відвідати центр.",
    note: "Узгодимо день і час",
    action: "Замовити виїзд",
    href: "/contacts?service=Аналізи вдома#booking",
    theme: "home",
  },
  {
    eyebrow: "Діагностика серця",
    title: "Серце під надійним контролем",
    text: "ЕКГ, ЕхоКГ та Холтер-моніторинг із консультацією фахівця і зрозумілими рекомендаціями.",
    note: "Комплексний підхід",
    action: "Записатися",
    href: "/contacts?service=Кардіологія#booking",
    theme: "heart",
  },
];

export function PromoSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const showSlide = (index: number) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isPaused || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      className="promo-slider-section"
      aria-label="Актуальні пропозиції медичного центру"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="promo-slider">
        <div
          className="promo-track"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          onPointerDown={(event) => {
            pointerStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) {
              return;
            }

            const distance = event.clientX - pointerStart.current;
            pointerStart.current = null;

            if (Math.abs(distance) < 45) {
              return;
            }

            showSlide(activeSlide + (distance < 0 ? 1 : -1));
          }}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
        >
          {slides.map((slide, index) => (
            <article
              className={`promo-slide promo-slide--${slide.theme}`}
              key={slide.title}
              aria-hidden={activeSlide !== index}
            >
              <div className="promo-copy">
                <span className="promo-eyebrow">{slide.eyebrow}</span>
                <h2>{slide.title}</h2>
                <p>{slide.text}</p>
                <div className="promo-actions">
                  <Link
                    className="promo-button"
                    href={slide.href}
                    tabIndex={activeSlide === index ? 0 : -1}
                  >
                    {slide.action} <span aria-hidden="true">→</span>
                  </Link>
                  <span className="promo-note">{slide.note}</span>
                </div>
              </div>

              <div className="promo-visual" aria-hidden="true">
                <span className="promo-orbit promo-orbit--large" />
                <span className="promo-orbit promo-orbit--small" />
                <span className="promo-number">0{index + 1}</span>
                <span className="promo-mark">
                  <img src="/zdorova-rodyna-mark.jpg" alt="" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="promo-pagination" aria-label="Оберіть банер">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              className={activeSlide === index ? "is-active" : ""}
              aria-label={`Показати банер ${index + 1}: ${slide.title}`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>

        <div className="promo-arrows">
          <button
            type="button"
            aria-label="Попередній банер"
            onClick={() => showSlide(activeSlide - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Наступний банер"
            onClick={() => showSlide(activeSlide + 1)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
