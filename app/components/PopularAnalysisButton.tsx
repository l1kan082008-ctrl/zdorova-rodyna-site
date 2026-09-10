"use client";

import { useEffect, useState } from "react";
import {
  addPriceCalculatorSelection,
  removePriceCalculatorSelection,
  readPriceCalculatorSelection,
  PRICE_CALCULATOR_CHANGED_EVENT,
} from "../prices/calculatorSelection";

export function PopularAnalysisButton({ itemId }: { itemId: string }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    const sync = () => setAdded(readPriceCalculatorSelection().includes(itemId));
    const onChange = (event: Event) => {
      const ids = (event as CustomEvent<string[]>).detail;
      setAdded(ids.includes(itemId));
    };
    sync();
    window.addEventListener(PRICE_CALCULATOR_CHANGED_EVENT, onChange);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PRICE_CALCULATOR_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", sync);
    };
  }, [itemId]);

  return (
    <button className="outline-button" type="button" aria-pressed={added} onClick={() => {
      if (added) removePriceCalculatorSelection(itemId);
      else addPriceCalculatorSelection(itemId);
    }}>
      {added ? "Додано" : "Додати"}
      <span aria-hidden="true">{added ? "✓" : "+"}</span>
    </button>
  );
}
