"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ServiceBookingCta } from "../services/[slug]/ServiceBookingCta";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useSiteSettings } from "../components/SiteSettingsProvider";
import { sitePhoneHref, siteViberHref } from "@/lib/siteSettings";
import { LocationsExplorer } from "./LocationsExplorer";
import type { CenterLocation } from "./locationData";

export function ContactsClient({ locations }: { locations: CenterLocation[] }) {
  const settings = useSiteSettings();
  const searchParams = useSearchParams();
  // Read the URL during SSR too, so direct links show the right branch without
  // first rendering a bundled/default location and jumping after hydration.
  const requestedLocationId = searchParams.get("location");
  const selectedLocationId = locations.find(location => location.id === requestedLocationId)?.id
    ?? locations[0]?.id ?? "";
  const handleSelectLocation = (locationId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("location", locationId);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const bookingParams = new URLSearchParams(searchParams.toString());
  if (selectedLocationId) bookingParams.set("location", selectedLocationId);
  else bookingParams.delete("location");
  const bookingHref = `/contacts${bookingParams.size ? `?${bookingParams}` : ""}#booking`;
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
