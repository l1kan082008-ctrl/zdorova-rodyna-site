import Image from "next/image";
import Link from "next/link";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { isInformationOnlyLocation } from "@/lib/locationPolicy";
import { sitePhoneHref } from "@/lib/siteSettings";
import { getDirectionsUrl, type CenterLocation } from "../../contacts/locationData";
import serviceStyles from "./CtServicePage.module.css";
import styles from "./LabLocations.module.css";

export function LabLocations({ locations }: { locations: CenterLocation[] }) {
  const laboratories = locations
    .filter(location => location.services.includes("laboratory") && !isInformationOnlyLocation(location))
    .sort((a, b) => Number(b.id === "stelmakha-18m") - Number(a.id === "stelmakha-18m"));

  if (laboratories.length === 0) return null;

  return (
    <section id="lab-locations" className={`${serviceStyles.page} ${styles.section}`} aria-labelledby="lab-locations-title">
      <header className={styles.heading}>
        <h2 id="lab-locations-title">Де здати аналізи</h2>
        <p>Оберіть зручне відділення. Наявність потрібного аналізу та години забору біоматеріалу уточніть за телефоном обраного пункту.</p>
      </header>
      <div className={`${serviceStyles.locationGrid} ${styles.grid}`}>
        {laboratories.map(location => {
          const photo = location.gallery[0];
          return (
            <article key={location.id} data-location-id={location.id} className={!photo ? styles.withoutPhoto : undefined}>
              {photo && <div className={serviceStyles.locationPhoto}>
                <Image src={resolveImageSource(photo.src)} unoptimized={!canOptimizeImage(photo.src)} alt={photo.alt} fill sizes="(max-width: 760px) 88px, 112px" />
              </div>}
              <div className={styles.content}>
                <h3><Link className={serviceStyles.locationLink} href={`/contacts?location=${encodeURIComponent(location.id)}#locations`} aria-label={`Переглянути відділення: ${location.fullAddress}`}>{location.city}</Link></h3>
                <p>{location.fullAddress}</p>
                {location.phone && <a className={styles.phone} href={sitePhoneHref(location.phone)} aria-label={`Зателефонувати у відділення: ${location.fullAddress}, ${location.phone}`}>{location.phone}</a>}
                <a className={styles.directions} href={getDirectionsUrl(location)} target="_blank" rel="noreferrer">Прокласти маршрут <span aria-hidden="true">→</span></a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
