"use client";

import { useId, useRef, useState } from "react";
import { UltrasoundPriceRow } from "./UltrasoundPriceRow";

type Item = { id: string; name: string; amount: number };
const PREVIEW_COUNT = 5;

export function UltrasoundPriceList({ items }: { items: Item[] }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const hasMore = items.length > PREVIEW_COUNT;

  function toggle() {
    setExpanded(value => !value);
    if (expanded) {
      requestAnimationFrame(() => {
        toggleRef.current?.focus({ preventScroll: true });
        toggleRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
      });
    }
  }

  return (
    <div className="ultrasound-collapsible-prices">
      <div id={contentId} className="ultrasound-price-rows">
        <div className="ultrasound-price-head" aria-hidden="true"><span>Дослідження</span><span>Ціна</span><span>Запис</span></div>
        {items.map((item, index) => (
          <UltrasoundPriceRow
            key={item.id}
            priceItemId={item.id}
            name={item.name}
            amount={item.amount}
            hidden={!expanded && index >= PREVIEW_COUNT}
          />
        ))}
      </div>
      {hasMore && <div className="ultrasound-price-controls ultrasound-price-controls-bottom">
        <button ref={toggleRef} type="button" className="outline-button" aria-expanded={expanded} aria-controls={contentId} onClick={toggle}>
          {expanded ? "Згорнути список" : `Показати всі дослідження (${items.length})`}
          <span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
        </button>
      </div>}
    </div>
  );
}
