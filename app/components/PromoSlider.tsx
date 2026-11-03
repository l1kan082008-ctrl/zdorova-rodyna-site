"use client";

import Link from "next/link";
import { responsiveBackground } from "../../lib/responsiveBackground";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { defaultPromoSlides, type PromoSlide } from "./promoData";

const promoImages = {
  laboratory: "/promo/laboratory-user-v10.jpg",
  home: "/promo/home-nurse-photo-v1.webp",
  heart: "/promo/cardiology-stoliarska-holter-v3.webp",
  mri: "/promo/mri-user-v6.jpg",
  doctors: "/promo/doctors-real-team-v2.webp",
  dermoscopy: "/promo/dermoscopy-photo-v1.webp",
  "ct-photo": "/promo/ct-banner-photo-v3.webp",
  screening: "/promo/screening-40.webp",
} as const;

type BannerDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  startedAt: number;
  width: number;
  slide: number;
  startOffset: number;
  offset: number;
  moved: boolean;
};

export function PromoSlider() {
  const [slides, setSlides] = useState<PromoSlide[]>(
    defaultPromoSlides.filter((slide) => slide.active),
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const drag = useRef<BannerDrag | null>(null);
  const suppressClick = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<Set<string>>(() => new Set());
  const count = slides.length;
  const selectedSlide = count ? (activeSlide + count) % count : 0;
  // One neighbour at either end keeps a drag across the loop continuous.
  const renderedSlides = count > 1 ? [slides[count - 1], ...slides, slides[0]] : slides;

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
        next.add(slides[(selectedSlide + offset + slides.length) % slides.length]?.id ?? "");
      }
      return next.size === previous.size ? previous : next;
    });
  }, [isNearViewport, selectedSlide, slides]);

  const showSlide = useCallback((index: number) => {
    if (!count) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIsResetting(false);
    setActiveSlide((current) => {
      // Finish the short loop transition before accepting another navigation click.
      if (current < 0 || current >= count) return current;
      return reduced ? (index + count) % count : Math.max(-1, Math.min(count, index));
    });
  }, [count]);

  const finishDrag = useCallback((commit: boolean) => {
    const previous = drag.current;
    if (!previous) return;
    drag.current = null;
    const track = trackRef.current;
    if (track?.hasPointerCapture(previous.pointerId)) track.releasePointerCapture(previous.pointerId);
    const distance = previous.offset;
    const threshold = Math.min(100, previous.width * 0.2);
    const flick = Math.abs(distance - previous.startOffset) >= 24
      && performance.now() - previous.startedAt < 250;
    const advance = commit && previous.moved && (Math.abs(distance) >= threshold || flick);
    setDragOffset(0);
    setIsDragging(false);
    setIsPointerDown(false);
    showSlide(previous.slide + (advance ? (distance < 0 ? 1 : -1) : 0));
  }, [showSlide]);

  useEffect(() => {
    const release = (event: PointerEvent) => {
      if (event.pointerId === drag.current?.pointerId) finishDrag(true);
    };
    const cancelPointer = (event: PointerEvent) => {
      if (event.pointerId === drag.current?.pointerId) finishDrag(false);
    };
    const cancel = () => finishDrag(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancelPointer);
    window.addEventListener("blur", cancel);
    window.addEventListener("resize", cancel);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", cancelPointer);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("resize", cancel);
    };
  }, [finishDrag]);

  const settleLoop = useCallback(() => {
    if (isPointerDown || (activeSlide >= 0 && activeSlide < count)) return;
    setIsResetting(true);
    setActiveSlide(selectedSlide);
  }, [activeSlide, count, isPointerDown, selectedSlide]);

  useEffect(() => {
    if (isPointerDown || (activeSlide >= 0 && activeSlide < count)) return;
    // Also settle when a hidden tab or a motion preference change skips transitionend.
    const timer = window.setTimeout(settleLoop, 450);
    return () => window.clearTimeout(timer);
  }, [activeSlide, count, isPointerDown, settleLoop]);

  useEffect(() => {
    if (!isResetting) return;
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsResetting(false));
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); };
  }, [isResetting]);

  useEffect(() => {
    fetch("/api/banners")
      .then(async (response) => {
        const payload = await response.json() as { banners?: PromoSlide[] };
        if (response.ok && payload.banners?.length) {
          finishDrag(false);
          setIsResetting(true);
          setActiveSlide(0);
          setSlides(payload.banners);
        }
      })
      .catch(() => undefined);
    // The published banner list is loaded once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isVisible || isHovered || isFocused || isPointerDown || isResetting || reduceMotion || count < 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      showSlide(selectedSlide + 1);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [isVisible, isHovered, isFocused, isPointerDown, isResetting, count, selectedSlide, showSlide]);

  return (
    <section
      className="promo-slider-section"
      ref={sectionRef}
      aria-label="Актуальні пропозиції медичного центру"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setIsHovered(false); }}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      <div className="promo-slider">
        <div
          className="promo-track"
          ref={trackRef}
          data-draggable={count > 1 || undefined}
          data-dragging={isDragging || undefined}
          style={{
            transform: `translateX(calc(-${(activeSlide + (count > 1 ? 1 : 0)) * 100}% + ${dragOffset}px))`,
            transition: isPointerDown || isResetting ? "none" : undefined,
          }}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "transform") settleLoop();
          }}
          onPointerDown={(event) => {
            suppressClick.current = false;
            if (count < 2 || drag.current || !event.isPrimary || event.button !== 0
              || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
            const track = event.currentTarget;
            const bounds = track.getBoundingClientRect();
            const width = bounds.width;
            if (!width) return;
            // Pick up an in-flight transition exactly where it is painted.
            const left = bounds.left - track.parentElement!.getBoundingClientRect().left;
            const visualIndex = -left / width - 1;
            const nearest = Math.max(-1, Math.min(count, Math.round(visualIndex)));
            const slide = (nearest + count) % count;
            const offset = (nearest - visualIndex) * width;
            drag.current = {
              pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
              startedAt: performance.now(), width, slide, startOffset: offset, offset, moved: false,
            };
            setActiveSlide(slide);
            setIsResetting(false);
            setDragOffset(offset);
            setIsPointerDown(true);
          }}
          onPointerMove={(event) => {
            const current = drag.current;
            if (!current || event.pointerId !== current.pointerId) return;
            if (event.pointerType === "mouse" && !(event.buttons & 1)) { finishDrag(false); return; }
            const dx = event.clientX - current.startX;
            const dy = event.clientY - current.startY;
            if (!current.moved) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
              if (Math.abs(dy) >= Math.abs(dx)) { finishDrag(false); return; }
              current.moved = true;
              suppressClick.current = true;
              // A dragged link must not retain focus on the now-hidden slide.
              const focused = document.activeElement;
              if (focused instanceof HTMLElement && event.currentTarget.contains(focused)) focused.blur();
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsDragging(true);
            }
            event.preventDefault();
            current.offset = Math.max(-current.width, Math.min(current.width, current.startOffset + dx));
            setDragOffset(current.offset);
          }}
          onPointerUp={(event) => {
            if (event.pointerId === drag.current?.pointerId) finishDrag(true);
          }}
          onPointerCancel={(event) => {
            if (event.pointerId === drag.current?.pointerId) finishDrag(false);
          }}
          onLostPointerCapture={(event) => {
            if (event.pointerId === drag.current?.pointerId) finishDrag(false);
          }}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            if (!suppressClick.current || event.detail === 0) return;
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {renderedSlides.map((slide, position) => {
            const clone = count > 1 && (position === 0 || position === count + 1);
            const index = count > 1 ? (position - 1 + count) % count : position;
            const src = slide.imageKey
              ? `/api/banners/image?key=${encodeURIComponent(slide.imageKey)}`
              : promoImages[slide.theme];
            const ready = loadedSlides.has(slide.id);
            return (
              <article
                className={`promo-slide promo-slide--${slide.theme}`}
                key={`${clone ? `clone-${position}-` : ""}${slide.id}`}
                aria-hidden={clone || selectedSlide !== index}
                inert={clone || undefined}
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
                      tabIndex={!clone && selectedSlide === index ? 0 : -1}
                      draggable={false}
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
              className={selectedSlide === index ? "is-active" : ""}
              aria-label={`Показати банер ${index + 1}: ${slide.title}`}
              aria-current={selectedSlide === index ? "true" : undefined}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>

        <div className="promo-arrows">
          <button
            type="button"
            aria-label="Попередній банер"
            onClick={() => showSlide(selectedSlide - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Наступний банер"
            onClick={() => showSlide(selectedSlide + 1)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
