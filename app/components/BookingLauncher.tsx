"use client";
import { CloseIcon } from "./CloseIcon";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TurnstileField } from "./TurnstileField";
import { clearPriceCalculatorSelection } from "../prices/calculatorSelection";
import { type CenterLocation } from "../contacts/locationData";
import { compatibleLocations, formatBookingPhone, serviceCategory } from "../../lib/bookingRequest";

const services = ["МРТ", "КТ", "УЗД", "Лабораторні дослідження", "Консультації лікарів", "Холтер та кардіодіагностика", "Аналізи вдома", "Скринінг здоров’я 40+", "Комплекс досліджень"];
const helpService = "Допоможіть обрати послугу";

// Keep real booking URLs as a fallback and preserve modified/new-tab clicks.
export function BookingLauncher() {
  const pathname = usePathname();
  const [request, setRequest] = useState<URL | null>(null);
  useEffect(() => {
    const openFromUrl = () => {
      const url = new URL(window.location.href);
      setRequest(url.pathname === "/contacts" && url.hash === "#booking" ? url : null);
    };
    const timer = window.setTimeout(openFromUrl, 0);
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/contacts" || url.hash !== "#booking") return;
      event.preventDefault();
      setRequest(url);
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", openFromUrl);
    window.addEventListener("popstate", openFromUrl);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", openFromUrl);
      window.removeEventListener("popstate", openFromUrl);
    };
  }, [pathname]);
  return request ? <BookingDialog key={request.href} request={request} onClose={() => {
    setRequest(null);
    if (window.location.hash === "#booking") window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }} /> : null;
}

function BookingDialog({ request, onClose }: { request: URL; onClose: () => void }) {
  const params = request.searchParams;
  const studies = params.get("services")?.trim() || "";
  const doctor = params.get("doctor")?.trim() || "";
  const total = params.get("total") || "";
  const requestedService = params.get("service")?.trim() || "";
  const fixedCtService = !doctor && !studies && serviceCategory(requestedService) === "ct" ? requestedService : "";
  const [service, setService] = useState(studies ? "Комплекс досліджень" : params.get("service")?.trim() || (doctor ? "Консультації лікарів" : helpService));
  const [locationId, setLocationId] = useState(params.get("location") || "");
  const [phone, setPhone] = useState("");
  const [locations, setLocations] = useState<CenterLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState("");
  const [token, setToken] = useState("");
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const submittingRef = useRef(false);
  const category = serviceCategory(doctor ? "Консультації лікарів" : service);
  const availableLocations = compatibleLocations(locations, doctor ? "Консультації лікарів" : service);
  const selectedLocation = availableLocations.find(({ id }) => id === locationId);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement;
    dialog.showModal();
    document.documentElement.classList.add("quick-booking-open");
    const controller = new AbortController();
    fetch("/api/locations", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("locations");
        return await response.json() as { locations?: CenterLocation[] };
      })
      .then((payload) => { setLocations(payload.locations || []); setLocationStatus(""); })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLocationStatus("Не вдалося завантажити адреси. Адміністратор допоможе обрати відділення.");
      }).finally(() => { if (!controller.signal.aborted) setLocationsLoading(false); });
    return () => {
      controller.abort();
      dialog.close();
      document.documentElement.classList.remove("quick-booking-open");
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { if (reference) successRef.current?.focus(); }, [reference]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const data = new FormData(event.currentTarget);
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10 || !phoneDigits.startsWith("0") || /^(\d)\1+$/u.test(phoneDigits)) {
      setError("Перевірте номер телефону: вкажіть повний номер.");
      event.currentTarget.querySelector<HTMLInputElement>('input[name="phone"]')?.focus();
      return;
    }
    const comment = [
      selectedLocation ? `Бажане відділення: ${selectedLocation.fullAddress}.` : "Допоможіть обрати відділення.",
      studies ? `Обрані дослідження: ${studies.replaceAll(" | ", ", ")}.` : "",
      total && Number.isFinite(Number(total)) ? `Орієнтовна сума: ${Number(total).toLocaleString("uk-UA")} ₴.` : "",
      String(data.get("comment") || "").trim(),
    ].filter(Boolean).join(" ");
    if (comment.length > 1200) { setError("Забагато тексту для однієї заявки. Скоротіть коментар або набір досліджень."); return; }
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/bookings", {
        signal: controller.signal,
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), phone: `+38${phoneDigits}`, service, doctor, comment, website: data.get("website"), source: "contacts", consent: data.get("consent") === "on", consentVersion: "contacts-v1", turnstileToken: token }),
      });
      const payload = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !payload.reference) throw new Error(payload.error || "Не вдалося надіслати заявку. Спробуйте ще раз.");
      setReference(payload.reference);
      if (studies) {
        clearPriceCalculatorSelection();
        if (window.location.pathname === "/contacts") {
          const clean = new URL(window.location.href);
          clean.searchParams.delete("services");
          clean.searchParams.delete("total");
          window.history.replaceState(window.history.state, "", clean.pathname + clean.search + clean.hash);
        }
      }
    } catch (cause) {
      setError(controller.signal.aborted ? "Не отримали підтвердження від сервера. Перед повторною заявкою уточніть її статус телефоном." : cause instanceof Error ? cause.message : "Помилка з’єднання. Спробуйте ще раз.");
      setToken("");
      setCaptchaAttempt((value) => value + 1);
    } finally { window.clearTimeout(timeout); submittingRef.current = false; setSubmitting(false); }
  }

  return <dialog className="quick-booking" ref={dialogRef} aria-labelledby="quick-booking-title" aria-describedby="quick-booking-description" onKeyDown={(event) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]')).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={(event) => { event.preventDefault(); if (!submittingRef.current) onClose(); }} onClick={(event) => {
    if (event.target !== event.currentTarget || submittingRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    <button className="quick-booking__close" type="button" aria-label="Закрити форму запису" disabled={submitting} onClick={onClose}><CloseIcon /></button>
    {reference ? <div className="quick-booking__success" role="status">
      <span className="section-kicker">Заявку отримано</span>
      <h2 id="quick-booking-title" tabIndex={-1} ref={successRef}>Дякуємо за звернення</h2>
      <p id="quick-booking-description">Адміністратор зателефонує, щоб погодити дату, час і відділення. Це заявка, а не підтверджений запис.</p>
      <p>Номер заявки: <strong>{reference}</strong></p>
      <button className="book-button" type="button" onClick={onClose}>Готово</button>
    </div> : <>
      <span className="section-kicker">Зворотний зв’язок</span>
      <h2 id="quick-booking-title">Запис на прийом</h2>
      <p id="quick-booking-description">Залиште контакти — адміністратор погодить з вами час візиту.</p>
      <form onSubmit={submit} aria-busy={submitting}>
        <fieldset disabled={submitting}>
          {(doctor || studies || fixedCtService) && <div className="quick-booking__selection">
            <span>{doctor ? "Обраний лікар" : studies ? "Обрані дослідження" : "Обране дослідження"}</span><strong>{doctor || studies.replaceAll(" | ", ", ") || fixedCtService}</strong>
            {total && Number.isFinite(Number(total)) && <span>Орієнтовно {Number(total).toLocaleString("uk-UA")} ₴</span>}
          </div>}
          <div className="quick-booking__fields">
            <label htmlFor="quick-name">Ваше ім’я<input id="quick-name" name="name" autoComplete="name" minLength={2} maxLength={100} placeholder="Ім’я" required /></label>
            <label htmlFor="quick-phone">Номер телефону<span className="quick-booking__phone"><span aria-hidden="true">+38</span><input id="quick-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(event) => setPhone(formatBookingPhone(event.target.value))} placeholder="(___) ___-__-__" title="Введіть 10 цифр українського номера, починаючи з 0" required /></span></label>
          </div>
          {!doctor && !studies && !fixedCtService && <label htmlFor="quick-service"><span id="quick-service-label">Послуга</span><select id="quick-service" aria-labelledby="quick-service-label" value={service} required onChange={(event) => setService(event.target.value)}>
            <option value={helpService}>{helpService}</option>
            {!services.includes(service) && service !== helpService && <option value={service}>{service}</option>}
            {services.map((item) => <option key={item}>{item}</option>)}
          </select>
          {service !== helpService && <span className="quick-booking__service-detail">{service}</span>}
          </label>}
          <label htmlFor="quick-location"><span id="quick-location-label">Відділення</span><select id="quick-location" aria-labelledby="quick-location-label" aria-busy={locationsLoading} disabled={locationsLoading} value={selectedLocation?.id || ""} onChange={(event) => setLocationId(event.target.value)}>
            <option value="">{locationsLoading ? "Завантажуємо відділення…" : locationStatus || (category === null && service !== helpService) ? "Адміністратор допоможе обрати" : "Допоможіть обрати"}</option>
            {availableLocations.map((location) => <option key={location.id} value={location.id}>{location.fullAddress}</option>)}
          </select></label>
          <details className="quick-booking__comment"><summary>Додати коментар <span>необов’язково</span></summary><label>Ваш коментар<textarea name="comment" maxLength={700} rows={3} placeholder="Наприклад, коли вам зручно зателефонувати" /></label></details>
          <label className="quick-booking__consent"><input type="checkbox" name="consent" required /><span>Погоджуюся на обробку контактних даних для організації запису.</span></label>
          <label className="booking-honeypot" aria-hidden="true">Ваш сайт<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <TurnstileField key={captchaAttempt} onToken={setToken} />
          {error && <p className="booking-submit-error" role="alert">{error} Також можна <a href="tel:+380676714444">зателефонувати</a>.</p>}
          <button className="book-button" type="submit" disabled={submitting || (Boolean(locationId) && locationsLoading)}>{submitting ? "Надсилаємо…" : "Надіслати заявку"}<span aria-hidden="true">→</span></button>
        </fieldset>
      </form>
    </>}
  </dialog>;
}
