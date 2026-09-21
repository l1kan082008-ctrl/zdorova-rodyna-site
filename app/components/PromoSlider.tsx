"use client";

import Link from "next/link";
import { responsiveBackground } from "../../lib/responsiveBackground";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { defaultPromoSlides, type PromoSlide } from "./promoData";

const promoImages = {
  laboratory: "/promo/laboratory-user-v10.jpg",
  home: "/promo/home-nurse-photo-v1.webp",
  heart: "/promo/cardiology-stoliarska-holter-v3.webp",
  mri: "/promo/mri-user-v6.jpg",
  doctors: "/promo/doctors-real-team-v2.webp",
  dermoscopy: "/promo/dermoscopy-photo-v1.webp",
  "ct-photo": "/promo/ct-banner-photo-v3.webp",
} as const;

export function PromoSlider() {
  const [slides, setSlides] = useState<PromoSlide[]>(
    defaultPromoSlides.filter((slide) => slide.active),
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsNearViewport(entry.isIntersecting);
    }, { rootMargin: "500px 0px" });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    observer.observe(section);
    visibilityObserver.observe(section);
    return () => {
      observer.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isNearViewport || !slides.length) return;
    // Warm the adjacent slides so swipes stay smooth, without loading the whole carousel.
    setLoadedSlides((previous) => {
      const next = new Set(previous);
      for (const offset of [-1, 0, 1]) {
        next.add(slides[(activeSlide + offset + slides.length) % slides.length]?.id ?? "");
      }
      return next.size === previous.size ? previous : next;
    });
  }, [isNearViewport, activeSlide, slides]);

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

    if (!isVisible || isPaused || reduceMotion || slides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isVisible, isPaused, slides.length]);

  return (
    <section
      className="promo-slider-section"
      ref={sectionRef}
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
          {slides.map((slide, index) => {
            const src = slide.imageKey
              ? `/api/banners/image?key=${encodeURIComponent(slide.imageKey)}`
              : promoImages[slide.theme];
            const ready = loadedSlides.has(slide.id);
            return (
              <article
                className={`promo-slide promo-slide--${slide.theme}`}
                key={slide.id}
                aria-hidden={activeSlide !== index}
                style={{
                  "--promo-photo": ready ? responsiveBackground(src, 1280) : "none",
                  // The mobile crop is tall; retain enough source width for its full height.
                  "--promo-photo-mobile": ready ? responsiveBackground(src, 1080) : "none",
                } as CSSProperties}
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
                <div className="promo-visual" aria-hidden="true" />
              </article>
            );
          })}
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
