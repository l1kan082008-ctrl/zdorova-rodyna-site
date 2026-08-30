"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { defaultPromoSlides, type PromoSlide } from "./promoData";

export function PromoSlider() {
  const [slides, setSlides] = useState<PromoSlide[]>(
    defaultPromoSlides.filter((slide) => slide.active),
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const showSlide = (index: number) => {
    if (slides.length === 0) return;
    setActiveSlide((index + slides.length) % slides.length);
  };

  useEffect(() => {
    fetch("/api/banners")
      .then(async (response) => {
        const payload = await response.json() as { banners?: PromoSlide[] };
        if (response.ok && payload.banners?.length) setSlides(payload.banners);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (activeSlide >= slides.length) setActiveSlide(0);
  }, [activeSlide, slides.length]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isPaused || reduceMotion || slides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

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
              key={slide.id}
              aria-hidden={activeSlide !== index}
              style={slide.imageKey ? ({
                "--promo-photo": `url("/api/banners/image?key=${encodeURIComponent(slide.imageKey)}")`,
              } as CSSProperties) : undefined}
            >
              <div className="promo-copy">
                <span className="promo-eyebrow">{slide.eyebrow}</span>
                <h2>{slide.title}</h2>
                {slide.accent ? (
                  <span className="promo-cito">
                    <span className="promo-cito-icon" aria-hidden="true" />
                    {slide.accent}
                  </span>
                ) : null}
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
                  <Image
                    src="/zdorova-rodyna-mark.jpg"
                    alt=""
                    width={2500}
                    height={2500}
                    sizes="110px"
                    unoptimized
                  />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="promo-pagination" aria-label="Оберіть банер">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
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
