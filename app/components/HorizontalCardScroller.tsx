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
  const targetRef = useRef<number | null>(null);
  const itemCount = Children.count(children);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    if (cards.length === 0) return;
    const scrollLeft = Math.max(0, Math.min(track.scrollLeft, track.scrollWidth - track.clientWidth));
    if (targetRef.current !== null && Math.abs(scrollLeft - targetRef.current) < 1) {
      targetRef.current = null;
    }

    const nextIndex = cards.reduce((closestIndex, card, index) => {
      const currentDistance = Math.abs(card.offsetLeft - cards[0].offsetLeft - scrollLeft);
      const closestDistance = Math.abs(
        cards[closestIndex].offsetLeft - cards[0].offsetLeft - scrollLeft,
      );
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);

    setActiveIndex((currentIndex) =>
      currentIndex === nextIndex ? currentIndex : nextIndex,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const resetTarget = () => {
      targetRef.current = null;
      updateActiveIndex();
    };
    const frame = requestAnimationFrame(updateActiveIndex);
    window.addEventListener("resize", resetTarget);
    track?.addEventListener("scrollend", resetTarget);
    track?.addEventListener("pointerdown", resetTarget);
    track?.addEventListener("touchstart", resetTarget, { passive: true });
    track?.addEventListener("wheel", resetTarget, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resetTarget);
      track?.removeEventListener("scrollend", resetTarget);
      track?.removeEventListener("pointerdown", resetTarget);
      track?.removeEventListener("touchstart", resetTarget);
      track?.removeEventListener("wheel", resetTarget);
    };
  }, [updateActiveIndex]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild;

    if (!track || !(firstCard instanceof HTMLElement)) return;

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const positions = Array.from(track.children)
      .filter((card): card is HTMLElement => card instanceof HTMLElement)
      .map((card) => Math.max(0, Math.min(card.offsetLeft - firstCard.offsetLeft, maxScroll)));
    // Repeated clicks advance from the requested destination, not an animation frame
    // or Safari's temporarily negative rubber-band scroll position.
    const current = Math.max(0, Math.min(targetRef.current ?? track.scrollLeft, maxScroll));
    const next = direction === 1
      ? positions.find((position) => position > current + 1) ?? maxScroll
      : positions.findLast((position) => position < current - 1) ?? 0;
    targetRef.current = next;
    track.scrollTo({
      left: next,
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
