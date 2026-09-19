"use client";

import { useLayoutEffect } from "react";

export function HomeHeroViewport() {
  useLayoutEffect(() => {
    const hero = document.getElementById("home-hero");
    const art = hero?.querySelector<HTMLElement>(".hero-art");
    const copy = hero?.querySelector<HTMLElement>(".hero-copy");
    const benefits = document.querySelectorAll<HTMLElement>("#advantages > .advantage");
    const secondBenefit = benefits[1];
    if (!hero || !art || !copy || !secondBenefit) return;

    const mobile = window.matchMedia("(max-width: 720px)");
    const observedElements = [
      document.querySelector<HTMLElement>(".home-page > .site-header"),
      document.querySelector<HTMLElement>(".home-page > .home-search-shell"),
      copy,
      benefits[0],
      secondBenefit,
    ].filter((element): element is HTMLElement => Boolean(element));
    let frame: number | null = null;
    let disposed = false;
    let observing = false;
    let previousFixed: number | null = null;
    let previousMax: number | null = null;

    function clearVariables() {
      hero!.style.removeProperty("--home-fold-fixed");
      hero!.style.removeProperty("--home-art-max");
      previousFixed = null;
      previousMax = null;
    }

    function measure() {
      frame = null;
      if (disposed) return;
      if (!mobile.matches) {
        observer.disconnect();
        observing = false;
        clearVariables();
        return;
      }
      if (!observing) {
        observedElements.forEach((element) => observer.observe(element));
        observing = true;
      }

      // Subtract the artwork itself so setting its height cannot create a feedback loop.
      const artRect = art!.getBoundingClientRect();
      if (!artRect.height || !art!.clientWidth) return;
      const fixed = Math.max(0, secondBenefit.getBoundingClientRect().bottom + window.scrollY - artRect.height + 8);
      const max = Math.max(220, Math.min(340, art!.clientWidth * 0.96));
      if (previousFixed === null || Math.abs(fixed - previousFixed) > 0.5) {
        hero!.style.setProperty("--home-fold-fixed", `${fixed.toFixed(2)}px`);
        previousFixed = fixed;
      }
      if (previousMax === null || Math.abs(max - previousMax) > 0.5) {
        hero!.style.setProperty("--home-art-max", `${max.toFixed(2)}px`);
        previousMax = max;
      }
    }

    function scheduleMeasure() {
      if (!disposed && frame === null) frame = window.requestAnimationFrame(measure);
    }

    const observer = new ResizeObserver(scheduleMeasure);
    window.addEventListener("resize", scheduleMeasure);
    void document.fonts.ready.then(scheduleMeasure);
    measure();

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      if (frame !== null) window.cancelAnimationFrame(frame);
      clearVariables();
    };
  }, []);

  return null;
}
