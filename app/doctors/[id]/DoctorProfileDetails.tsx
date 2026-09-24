import Link from "next/link";
import Image from "next/image";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { doctorBookingHref, splitDoctorBranches } from "@/lib/doctorBranches";
import "../portraits.css";
import {
  getDoctorInitials,
  formatDoctorConsultations,
  canBookDoctorConsultation,
  getDoctorPatientGroups,
  getDoctorScheduleDays,
  getDoctorScheduleNotice,
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

  const consultationSummary = formatDoctorConsultations(doctor);
  const branches = splitDoctorBranches(doctor.branch);
  const activeDays = getDoctorScheduleDays(doctor.schedule);
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
              <div className="doctor-detail-portrait-frame">
                <Image
                  className="doctor-portrait doctor-detail-portrait"
                  src={resolveImageSource(doctor.photoUrl)}
                  unoptimized={!canOptimizeImage(doctor.photoUrl)}
                  alt={`Фотографія лікаря ${doctor.name}`}
                  fill
                  quality={85}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 720px) calc(100vw - 32px), (max-width: 1288px) 43vw, 534px"
                />
              </div>
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
                <dt>{branches.length > 1 ? "Місця прийому" : "Місце прийому"}</dt>
                <dd className="doctor-branch-addresses">{branches.join("\n") || "Відділення уточнюйте"}</dd>
              </div>
              {canBookDoctorConsultation(doctor) && consultationSummary && (<div>
                <dt>Вартість консультації</dt>
                <dd>{consultationSummary}</dd>
              </div>)}
            </dl>

            {doctor.description ? (
              <p className="doctor-detail-lead">{doctor.description}</p>
            ) : null}

            {activeDays.length ? (
              <aside className="doctor-detail-schedule doctor-detail-schedule--inline">
                <h2>{canBookDoctorConsultation(doctor) ? "Години прийому" : "Години роботи"}</h2>
                <div>
                  {weekDays.map((day) => (
                    <p key={day.key}>
                      <span>{day.label}</span>
                      <strong>{doctor.schedule[day.key]?.trim() || "Не приймає"}</strong>
                    </p>
                  ))}
                </div>
                <small>
                  Перед візитом радимо підтвердити актуальний час в адміністратора.
                </small>
              </aside>
            ) : (
              <p className="doctor-schedule-notice">{getDoctorScheduleNotice(doctor)}</p>
            )}

            {canBookDoctorConsultation(doctor) && (<div className="doctor-detail-actions">
              <a
                className="book-button"
                href={doctorBookingHref(doctor)}
              >
                Записатися на прийом <span>→</span>
              </a>
            </div>)}
          </div>
        </div>

        {biographyParagraphs.length > 0 && (
          <div className="doctor-detail-content">
            <article className="doctor-biography">
              <span className="section-kicker">Про лікаря</span>
              <h2>Біографія та професійний досвід</h2>
              {biographyParagraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
              ))}
            </article>
          </div>
        )}
      </section>
    </>
  );
}
