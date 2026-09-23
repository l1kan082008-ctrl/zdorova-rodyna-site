"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ServiceBookingCta } from "../services/[slug]/ServiceBookingCta";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useSiteSettings } from "../components/SiteSettingsProvider";
import { sitePhoneHref, siteViberHref } from "@/lib/siteSettings";
import { LocationsExplorer } from "./LocationsExplorer";
import { centerLocations, type CenterLocation } from "./locationData";

export default function ContactsPage() {
  const settings = useSiteSettings();
  const [locations, setLocations] = useState<CenterLocation[]>(centerLocations);
  const [selectedLocationId, setSelectedLocationId] = useState(centerLocations[0].id);
  const userSelectedLocationRef = useRef(false);
  const handleSelectLocation = (locationId: string) => {
    userSelectedLocationRef.current = true;
    setSelectedLocationId(locationId);
  };
  useEffect(() => {
    const controller = new AbortController();
    const linkedLocation = new URLSearchParams(window.location.search).get("location");
    if (!userSelectedLocationRef.current && linkedLocation && centerLocations.some(({ id }) => id === linkedLocation)) setSelectedLocationId(linkedLocation);
    fetch("/api/locations", { signal: controller.signal })
      .then(async (response) => response.ok ? await response.json() as { locations?: CenterLocation[] } : null)
      .then((payload) => {
        if (!payload?.locations?.length) return;
        setLocations(payload.locations);
        if (!userSelectedLocationRef.current && linkedLocation && payload.locations.some(({ id }) => id === linkedLocation)) setSelectedLocationId(linkedLocation);
      }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  const bookingHref = `/contacts?location=${encodeURIComponent(selectedLocationId)}#booking`;
  return <main className="inner-page contacts-page contacts-page--compact">
    <SiteHeader active="contacts" bookingHref={bookingHref} />
    <section className="contacts-intro">
      <div><span className="section-kicker">Ми на зв’язку</span><h1>Контакти та відділення</h1><p>Оберіть зручну адресу або зв’яжіться з нами — допоможемо з записом.</p></div>
      <div className="contacts-intro__support">
        <a className="contacts-intro__phone" href={sitePhoneHref(settings.phone)}>{settings.phone}</a>
        <div className="contacts-intro__actions"><a className="outline-button" href={sitePhoneHref(settings.phone)}><Image width={32} height={32} className="support-contact-icon support-call-icon" src="/icons/phone.svg" alt="" aria-hidden="true" />Зателефонувати</a><a className="outline-button" href={siteViberHref(settings.phone)}><Image width={32} height={32} className="support-contact-icon support-viber-icon" src="/icons/viber-teal.svg" alt="" aria-hidden="true" />Написати у Viber</a></div>
        <a className="contacts-intro__email" href={`mailto:${settings.email}`}><svg className="contacts-email-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span>{settings.email}</span></a>
      </div>
    </section>
    <LocationsExplorer locations={locations} selectedLocationId={selectedLocationId} onSelectLocation={handleSelectLocation} />
    <ServiceBookingCta bookingHref={bookingHref} id="booking" title="Допомогти з записом?" description="Залиште ім’я та телефон. Адміністратор допоможе обрати послугу, відділення й час візиту." buttonLabel="Записатися на прийом" showKicker={false} />
    <SiteFooter />
  </main>;
}
