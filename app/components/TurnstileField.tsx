"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render(
    target: HTMLElement,
    options: {
      sitekey: string;
      theme: "light";
      size: "flexible";
      appearance: "interaction-only";
      callback(token: string): void;
      "error-callback"(): void;
      "expired-callback"(): void;
    },
  ): string;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-zr-turnstile="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("turnstile_load_failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.zrTurnstile = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("turnstile_load_failed")), { once: true });
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function TurnstileField({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let disposed = false;
    let widgetId = "";

    void loadTurnstile()
      .then(() => {
        if (disposed || !containerRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
          appearance: "interaction-only",
          callback: onToken,
          "error-callback": () => onToken(""),
          "expired-callback": () => onToken(""),
        });
      })
      .catch(() => onToken(""));

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      onToken("");
    };
  }, [onToken, siteKey]);

  if (!siteKey) return null;
  return <div className="turnstile-field" ref={containerRef} aria-label="Перевірка безпеки" />;
}
