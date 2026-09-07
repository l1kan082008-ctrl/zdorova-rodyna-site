import Link from "next/link";
import {
  getDoctorInitials,
  formatDoctorConsultations,
  canBookDoctorConsultation,
  getDoctorPatientGroups,
  weekDays,
  type Doctor,
} from "../doctorData";

type DoctorProfileDetailsProps = {
  doctor: Doctor | null;
  returnTo?: string;
};

export function DoctorProfileDetails({ doctor, returnTo }: DoctorProfileDetailsProps) {
  if (!doctor) {
    return (
      <section className="doctor-detail-state">
        <span className="section-kicker">Лікарі</span>
        <h1>Лікаря не знайдено</h1>
        <p>Поверніться до каталогу та оберіть іншого спеціаліста.</p>
        <Link className="outline-button" href="/doctors">
          ← До всіх лікарів
        </Link>
      </section>
    );
  }

  const biographyParagraphs = doctor.biography
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <section className="doctor-detail-shell">
        <Link className="doctor-detail-back" href={returnTo ?? "/doctors"}>
          {returnTo ? "← Повернутися до вибору лікаря" : "← Всі лікарі"}
        </Link>

        <div className="doctor-detail-hero">
          <div className="doctor-detail-photo">
            {doctor.photoUrl ? (
              <div
                role="img"
                aria-label={`Фотографія лікаря ${doctor.name}`}
                style={{ backgroundImage: `url("${doctor.photoUrl}")` }}
              />
            ) : (
              <span aria-hidden="true">{getDoctorInitials(doctor.name)}</span>
            )}
          </div>

          <div className="doctor-detail-heading">
            <span className="doctor-specialty">{doctor.specialty}</span>
            <h1>{doctor.name}</h1>

            <dl className="doctor-detail-facts">
              <div>
                <dt>Стаж роботи</dt>
                <dd>
                  {doctor.experienceLabel ?? (doctor.experienceYears ? `${doctor.experienceYears} років` : "Уточнюється")}
                </dd>
              </div>
              {canBookDoctorConsultation(doctor) && (<div><dt>Приймає</dt><dd>{getDoctorPatientGroups(doctor.patientGroups ?? [])}</dd></div>)}
              <div>
                <dt>Місце прийому</dt>
                <dd>{doctor.branch || "Відділення уточнюйте"}</dd>
              </div>
              {canBookDoctorConsultation(doctor) && (<div>
                <dt>Вартість консультації</dt>
                <dd>{formatDoctorConsultations(doctor)}</dd>
              </div>)}
            </dl>

            {doctor.description ? (
              <p className="doctor-detail-lead">{doctor.description}</p>
            ) : null}

          <aside className="doctor-detail-schedule doctor-detail-schedule--inline">

            <h2>{canBookDoctorConsultation(doctor) ? "Години прийому" : "Години роботи"}</h2>
            <div>
              {Object.values(doctor.schedule).some(Boolean) ? weekDays.map((day) => (
                <p key={day.key}>
                  <span>{day.label}</span>
                  <strong>{doctor.schedule[day.key] || "Не приймає"}</strong>
                </p>
              )) : <p className="doctor-schedule-empty">Графік уточнюється</p>}
            </div>
            <small>
              Перед візитом радимо підтвердити актуальний час в адміністратора.
            </small>
          </aside>

            {canBookDoctorConsultation(doctor) && (<div className="doctor-detail-actions">
              <a
                className="book-button"
                href={`/contacts?doctor=${encodeURIComponent(doctor.name)}#booking`}
              >
                Записатися на прийом <span>→</span>
              </a>
            </div>)}
          </div>
        </div>

        <div className="doctor-detail-content">
          <article className="doctor-biography">
            <span className="section-kicker">Про лікаря</span>
            <h2>Біографія та професійний досвід</h2>
            {biographyParagraphs.length ? (
              biographyParagraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
              ))
            ) : (
              <div className="doctor-biography-empty">
                <strong>Інформація доповнюється</strong>
                <p>
                  Детальну інформацію про освіту, кваліфікацію та професійний
                  досвід можна уточнити в адміністратора центру.
                </p>
              </div>
            )}
          </article>


        </div>
      </section>
    </>
  );
}
