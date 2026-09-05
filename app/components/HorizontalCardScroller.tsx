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
      const currentDistance = Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft);
      const closestDistance = Math.abs(
        cards[closestIndex].offsetLeft - cards[0].offsetLeft - track.scrollLeft,
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
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <div className="pricing-carousel">
      <div
        className="pricing-grid pricing-carousel-track"
        ref={trackRef}
        aria-label={label}
        onScroll={updateActiveIndex}
      >
        {children}
      </div>
      <div className="pricing-carousel-toolbar">
        <span className="pricing-carousel-count" aria-live="polite" aria-atomic="true">
          {activeIndex + 1} / {itemCount}
        </span>
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
    </div>
  );
}
