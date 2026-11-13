import Link from "next/link";
import { sitePhoneHref } from "@/lib/siteSettings";
import type { CenterLocation } from "../../contacts/locationData";
import type { PriceItem } from "../../prices/priceData";
import { priceReferences, resolvePriceItem } from "../../prices/priceReferences";
import styles from "./HolterPriceBooking.module.css";

export function HolterPriceBooking({ prices, locations, serviceName, priceHref }: {
  prices: PriceItem[];
  locations: CenterLocation[];
  serviceName: string;
  priceHref: string;
}) {
  const price = resolvePriceItem(prices, priceReferences.holter);
  const availablePrice = price && price.isActive !== false && Number.isFinite(price.amount) ? price : undefined;
  const location = locations.find(item => item.id === "stelmakha-18m");
  const params = new URLSearchParams({ service: serviceName });
  if (location) params.set("location", location.id);

  return (
    <section id="holter-price-booking" className={styles.section} aria-labelledby="holter-price-booking-title">
      <h2 id="holter-price-booking-title">Вартість та запис на Холтер</h2>
      <div className={styles.panel}>
        <div className={styles.details}>
          <h3>{availablePrice?.name || serviceName}</h3>
          <p>Добове моніторування ЕКГ протягом 24 годин. Опис і розшифрування результатів лікарем входять у вартість.</p>
          {location ? (
            <div className={styles.location}>
              <span className={styles.label}>Відділення встановлення</span>
              <Link href={`/contacts?location=${encodeURIComponent(location.id)}#locations`}>{location.fullAddress}</Link>
              {location.phone && <a className={styles.phone} href={sitePhoneHref(location.phone)}>{location.phone}</a>}
            </div>
          ) : <p>Адресу встановлення та контактний телефон уточніть у <Link href="/contacts#locations">відділеннях центру</Link>.</p>}
        </div>
        <div className={styles.booking}>
          <span className={styles.label}>Вартість дослідження</span>
          {availablePrice ? (
            <p className={styles.price}>{new Intl.NumberFormat("uk-UA").format(availablePrice.amount)} <span>грн</span></p>
          ) : <p className={styles.unavailable}>Вартість уточніть в адміністратора.</p>}
          <p className={styles.notice}>Встановлення — за попереднім записом.</p>
          <Link className="book-button" href={`/contacts?${params.toString()}#booking`}>Записатися на Холтер</Link>
          <Link className={styles.priceLink} href={priceHref}>Переглянути весь прайс</Link>
        </div>
      </div>
    </section>
  );
}
