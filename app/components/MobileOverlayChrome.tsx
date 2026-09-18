"use client";

import { useEffect } from "react";

// Safari paints its own chrome; match its colour to the open overlay surface.
export function MobileOverlayChrome() {
  useEffect(() => {
    const root = document.documentElement;
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = theme?.content ?? "#ffffff";
    const mobile = window.matchMedia("(max-width: 1080px)");
    const overlays = '.support-dialog-backdrop, .calculator-dialog-backdrop, .branch-modal-backdrop, .site-menu-backdrop.is-visible, dialog[open]';
    let frame = 0;
    const sync = () => {
      frame = 0;
      const open = mobile.matches && (document.body.classList.contains("home-search-open") || Boolean(document.querySelector(overlays)));
      root.toggleAttribute("data-mobile-overlay", open);
      if (theme) theme.content = open ? "#eef1f6" : previousTheme;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "open"] });
    mobile.addEventListener("change", schedule);
    sync();
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
      root.removeAttribute("data-mobile-overlay");
      if (theme) theme.content = previousTheme;
    };
  }, []);
  return null;
}
