import Link from "next/link";
import styles from "./AdminDashboard.module.css";

const cards = [
  { href: "/admin/doctors", number: "01", title: "Лікарі", text: "Профілі, фотографії та спеціальності" },
  { href: "/admin/services", number: "02", title: "Послуги", text: "Картки напрямів і сторінки послуг" },
  { href: "/admin/bookings", number: "03", title: "Заявки", text: "Нові звернення пацієнтів" },
  { href: "/admin/prices", number: "04", title: "Прайс", text: "Послуги, аналізи та актуальні ціни" },
  { href: "/admin/locations", number: "05", title: "Відділення", text: "Адреси, графік і доступні послуги" },
  { href: "/admin/banners", number: "06", title: "Банери", text: "Головні повідомлення сайту" },
];

export default function AdminPage() {
  return (
    <main className={styles.dashboard}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Адмінпанель</p>
          <h1>Керування сайтом</h1>
          <p>Усі основні розділи «Здорової Родини» в одному кабінеті.</p>
        </div>
        <div className={styles.mark}>ЗР</div>
      </header>

      <section className={styles.grid} aria-label="Розділи адміністрування">
        {cards.map((card) => (
          <Link className={styles.card} href={card.href} key={card.href}>
            <span className={styles.number}>{card.number}</span>
            <div>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </div>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
