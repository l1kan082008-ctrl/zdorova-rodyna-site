"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type HorizontalCardScrollerProps = {
  children: ReactNode;
  label: string;
};

export function HorizontalCardScroller({
  children,
  label,
}: HorizontalCardScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemCount = Children.count(children);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    if (cards.length === 0) return;

    const nextIndex = cards.reduce((closestIndex, card, index) => {
      const currentDistance = Math.abs(card.offsetLeft - track.scrollLeft);
      const closestDistance = Math.abs(
        cards[closestIndex].offsetLeft - track.scrollLeft,
      );
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);

    setActiveIndex((currentIndex) =>
      currentIndex === nextIndex ? currentIndex : nextIndex,
    );
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(updateActiveIndex);
    window.addEventListener("resize", updateActiveIndex);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, [updateActiveIndex]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild;

    if (!track || !(firstCard instanceof HTMLElement)) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (firstCard.offsetWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <div className="pricing-carousel">
      <div className="pricing-carousel-toolbar">
        <span className="pricing-carousel-hint-copy">
          Гортайте, щоб побачити більше
        </span>
        <div className="pricing-carousel-mobile-cue" aria-hidden="true">
          <span className="pricing-carousel-progress">
            {Array.from({ length: itemCount }, (_, index) => (
              <span
                className={`pricing-carousel-dot${
                  index === activeIndex ? " is-active" : ""
                }`}
                key={index}
              />
            ))}
          </span>
          <svg
            className="pricing-carousel-swipe-arrow"
            viewBox="0 0 72 34"
            fill="none"
          >
            <path d="M3 7C24 3 48 7 62 23" />
            <path d="M51 22L63 24L60 12" />
          </svg>
        </div>
        <div
          className="pricing-carousel-controls"
          aria-label={`Керування каруселлю «${label}»`}
        >
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Попередні послуги"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Наступні послуги"
          >
            →
          </button>
        </div>
      </div>
      <div
        className="pricing-grid pricing-carousel-track"
        ref={trackRef}
        aria-label={label}
        onScroll={updateActiveIndex}
      >
        {children}
      </div>
    </div>
  );
}
