import Link from "next/link";
import styles from "./ServiceBookingCta.module.css";

export function ServiceBookingCta({
  bookingHref, id,
  title = "Уточніть деталі та оберіть зручний час",
  description = "Адміністратор відповість на запитання, підкаже підготовку та погодить деталі запису.",
  buttonLabel = "Залишити заявку",
  showKicker = true,
  kicker = "Допоможемо із записом",
  ariaLabel = "Допомога із записом",
}: { bookingHref: string; id?: string; title?: string; description?: string; buttonLabel?: string; showKicker?: boolean; kicker?: string; ariaLabel?: string }) {
  return (
    <section id={id} className={styles.panel} aria-label={ariaLabel}>
      <div>
        {showKicker && <span className={styles.kicker}>{kicker}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className={styles.actions}>
        <Link className="book-button" href={bookingHref}>{buttonLabel} <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}