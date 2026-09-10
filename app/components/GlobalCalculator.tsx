"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PRICE_CALCULATOR_OPEN_EVENT } from "../prices/calculatorSelection";
import type { PriceItem } from "../prices/priceData";

const Calculator = dynamic(() => import("../prices/PriceCatalog").then(module => module.PriceCatalog), { ssr: false });

export function GlobalCalculator() {
  const pathname = usePathname();
  const [items, setItems] = useState<PriceItem[] | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (pathname === "/prices" || pathname.startsWith("/admin")) return;
    let controller: AbortController | undefined;
    const open = async () => {
      if (items || controller) return;
      controller = new AbortController();
      setMessage("Завантажуємо калькулятор…");
      try {
        const response = await fetch("/api/public/prices", { signal: controller.signal });
        if (!response.ok) throw new Error("Prices unavailable");
        setItems(await response.json());
        setMessage("");
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) setMessage("Не вдалося завантажити. Натисніть на калькулятор ще раз.");
      } finally { controller = undefined; }
    };
    window.addEventListener(PRICE_CALCULATOR_OPEN_EVENT, open);
    return () => { controller?.abort(); window.removeEventListener(PRICE_CALCULATOR_OPEN_EVENT, open); };
  }, [pathname, items]);
  // The prices page owns its calculator and bottom summary bar.
  if (pathname === "/prices" || pathname.startsWith("/admin")) return null;
  return <>{message && <div role="status" style={{position:"fixed",top:90,right:16,zIndex:1500,background:"white",padding:16,borderRadius:12}}>{message}</div>}{items && <Calculator initialItems={items} calculatorOnly initiallyOpen />}</>;
}
