"use client";

import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { LocationsExplorer } from "./LocationsExplorer";
import { centerLocations, type CenterLocation } from "./locationData";

export default function ContactsPage() {
  const [locations, setLocations] = useState<CenterLocation[]>(centerLocations);
  const [selectedLocationId, setSelectedLocationId] = useState(centerLocations[0].id);
  useEffect(() => {
    const controller = new AbortController();
    const linkedLocation = new URLSearchParams(window.location.search).get("location");
    fetch("/api/locations", { signal: controller.signal })
      .then(async (response) => response.ok ? await response.json() as { locations?: CenterLocation[] } : null)
      .then((payload) => {
        if (!payload?.locations?.length) return;
        setLocations(payload.locations);
        if (linkedLocation && payload.locations.some(({ id }) => id === linkedLocation)) setSelectedLocationId(linkedLocation);
      }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <main className="inner-page contacts-page contacts-page--compact">
    <SiteHeader active="contacts" />
    <section className="contacts-intro">
      <div><span className="section-kicker">Ми на зв’язку</span><h1>Контакти та відділення</h1><p>Оберіть зручну адресу або зв’яжіться з нами — допоможемо з записом.</p></div>
      <div className="contacts-intro__support">
        <a className="contacts-intro__phone" href="tel:+380676714444">+38 (067) 671-44-44</a>
        <div className="contacts-intro__actions"><a className="outline-button" href="tel:+380676714444">Зателефонувати</a><a className="outline-button" href="viber://chat?number=%2B380676714444">Написати у Viber</a></div>
        <a className="contacts-intro__email" href="mailto:zdorovarodynarivne@ukr.net">zdorovarodynarivne@ukr.net</a>
      </div>
    </section>
    <LocationsExplorer locations={locations} selectedLocationId={selectedLocationId} onSelectLocation={setSelectedLocationId} />
    <section className="contacts-booking-invite" id="booking">
      <div><h2>Допомогти з записом?</h2><p>Залиште ім’я та телефон. Адміністратор допоможе обрати послугу, відділення й час візиту.</p></div>
      <a className="book-button" href="/contacts#booking">Записатися на прийом <span aria-hidden="true">→</span></a>
    </section>
    <SiteFooter />
  </main>;
}
