import Link from "next/link";

const consultationDirections = [
  {
    number: "01",
    title: "Сімейна медицина",
    description: "Перший контакт, профілактика та супровід здоров’я дорослих і дітей.",
    href: "/doctors?specialty=Сімейна медицина",
  },
  {
    number: "02",
    title: "Педіатрія",
    description: "Огляд дитини, профілактика, довідки та допомога під час хвороби.",
    href: "/doctors?specialty=Педіатрія",
  },
  {
    number: "03",
    title: "Кардіологія",
    description: "Тиск, біль у грудях, серцебиття та контроль стану серця.",
    href: "/doctors?specialty=Кардіологія",
  },
  {
    number: "04",
    title: "Неврологія",
    description: "Головний біль, запаморочення, біль у спині та порушення чутливості.",
    href: "/doctors?specialty=Неврологія",
  },
  {
    number: "05",
    title: "Гастроентерологія",
    description: "Біль у животі, печія, нудота та інші порушення травлення.",
    href: "/doctors?specialty=Гастроентерологія",
  },
  {
    number: "06",
    title: "Дерматологія",
    description: "Висипи, зміни шкіри, волосся, нігтів і перевірка новоутворень.",
    href: "/doctors?specialty=Дерматологія",
  },
  {
    number: "07",
    title: "Гінекологія",
    description: "Профілактичні огляди, консультації та турбота про жіноче здоров’я.",
    href: "/doctors?specialty=Гінекологія",
  },
  {
    number: "08",
    title: "Хірургія та урологія",
    description: "Консультації щодо гострих і планових станів та подальшої тактики.",
    href: "/doctors?specialty=Хірургія%20та%20урологія",
  },
];

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
