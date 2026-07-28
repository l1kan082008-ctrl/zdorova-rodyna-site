"use client";

import type { PointerEvent, ReactNode } from "react";

type GlowPriceCardProps = {
  children: ReactNode;
};

export function GlowPriceCard({ children }: GlowPriceCardProps) {
  const followPointer = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spot-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--spot-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  return (
    <article className="price-card" onPointerMove={followPointer}>
      {children}
    </article>
  );
}
