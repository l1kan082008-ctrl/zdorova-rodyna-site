import Link from "next/link";

import { doctorCategories } from "../../doctors/doctorCategories";

const directionDescriptions: Record<string, string> = {
  "group:family": "Сімейні лікарі та терапевти — профілі, графік і запис.",
  "group:endocrinology": "Ендокринологи — інформація про лікарів та запис.",
  "group:urology": "Урологи — профілі спеціалістів і графік прийому.",
  "group:cardiology": "Кардіологи — інформація про спеціалістів та запис.",
  "group:gynecology": "Гінекологи — профілі лікарів і графік прийому.",
  "group:neurology": "Неврологи та невропатологи — вибір спеціаліста.",
  "group:ultrasound": "Лікарі ультразвукової діагностики — профілі та графік.",
  "group:rheumatology": "Ревматологи — інформація про лікарів та запис.",
  "group:phlebology": "Флебологи — профілі спеціалістів і графік прийому.",
  "group:mammology": "Мамологи — інформація про спеціалістів та запис.",
  "group:radiology": "Фахівці КТ та МРТ — профілі та години роботи.",
  "group:ent": "Отоларингологи та сурдологи — вибір спеціаліста.",
  "group:pediatrics": "Педіатри та дитячі спеціалісти — профілі й запис.",
  "group:dermatology": "Дерматологи — інформація про лікарів та запис.",
  "group:oncology": "Онкологи — профілі спеціалістів і графік прийому.",
  "group:traumatology": "Ортопеди-травматологи — профілі та запис.",
  "group:gastroenterology": "Гастроентерологи — інформація про лікарів та запис.",
  "group:allergy": "Алергологи — профілі спеціалістів і графік прийому.",
};

const consultationDirections = doctorCategories.map((category, index) => ({
  number: String(index + 1).padStart(2, "0"),
  title: category.label,
  description: directionDescriptions[category.value],
  href: `/doctors?specialty=${encodeURIComponent(category.value)}`,
}));

export function ConsultationExperience() {
  return (
    <section className="consultation-experience" aria-labelledby="consultation-directions-title">
      <div className="consultation-direction-panel" id="consultation-directions">
        <div className="consultation-direction-heading">
          <div>
            <span className="section-kicker">Напрями консультацій</span>
            <h2 id="consultation-directions-title">З чим можна звернутися</h2>
            <p>
              Оберіть напрям за вашим запитом. Конкретного спеціаліста та його біографію можна переглянути в єдиному розділі «Лікарі».
            </p>
          </div>
          <Link href="/doctors" className="consultation-all-doctors-link">
            Усі лікарі <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="consultation-direction-grid">
          {consultationDirections.map((direction) => (
            <Link className="consultation-direction-card" href={direction.href} key={direction.title}>
              <span className="consultation-direction-number">{direction.number}</span>
              <span className="consultation-direction-copy">
                <strong>{direction.title}</strong>
                <small>{direction.description}</small>
              </span>
              <span className="consultation-direction-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="consultation-help">
        <div>
          <span className="section-kicker">Не впевнені у виборі?</span>
          <h2>Опишіть свій запит — допоможемо визначити потрібний напрям</h2>
        </div>
        <Link href="/contacts?service=Консультація%20лікаря#booking">
          Порадитися з адміністратором <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
